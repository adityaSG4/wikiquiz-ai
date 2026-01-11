from flask import Blueprint, request, jsonify
from models import db, Article, Quiz, QuizAttempt, User
from services.scraper import normalize_url, fetch_article
from services.ai_generator import generate_summary, generate_quiz
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from sqlalchemy.orm import joinedload, load_only
import concurrent.futures
import validators

main_bp = Blueprint('main', __name__)

@main_bp.route('/api/generate', methods=['POST'])
@jwt_required()
def generate_quiz_route():
    data = request.json
    url = data.get('url')
    if not url:
        return jsonify({"error": "URL is required"}), 400

    # Security: Validate URL format
    if not validators.url(url):
        return jsonify({"error": "Invalid URL format"}), 400

    try:
        normalized_url = normalize_url(url)
        
        # Check if article exists
        article = Article.query.filter_by(url=normalized_url).first()
        
        if not article:
            # Scrape
            title, raw_html, cleaned_text = fetch_article(normalized_url)
            
            # Store Article
            article = Article(
                url=normalized_url,
                title=title,
                raw_html=raw_html,
                cleaned_text=cleaned_text
            )
            db.session.add(article)
            db.session.commit()
        
        # Check if quiz exists for this article (SHARED)
        quiz = Quiz.query.filter_by(article_id=article.id).first()
        
        if not quiz:
            # Generate AI Content in Parallel
            with concurrent.futures.ThreadPoolExecutor() as executor:
                summary_future = executor.submit(generate_summary, article.cleaned_text)
                quiz_future = executor.submit(generate_quiz, article.cleaned_text)
                
                summary = summary_future.result()
                quiz_data = quiz_future.result()
            
            quiz = Quiz(
                article_id=article.id,
                summary=summary,
                questions=quiz_data
            )
            db.session.add(quiz)
            db.session.commit()
            
            
            
        # Strip correct answers for the client
        questions_clean = []
        for q in quiz.questions.get('questions', []):
            questions_clean.append({
                "question": q['question'],
                "options": q['options'],
                "difficulty": q.get('difficulty', 'Unknown'),
            })

        return jsonify({
            "message": "Quiz ready",
            "quiz_id": quiz.id,
            "title": article.title,
            "summary": quiz.summary,
            "questions": questions_clean
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@main_bp.route('/api/quizzes', methods=['GET'])
@jwt_required()
def list_quizzes():
    # List ALL persistent Quizzes (Shared Library)
    sort_by = request.args.get('sort_by', 'date')
    order = request.args.get('order', 'desc')

    query = Quiz.query.options(
        joinedload(Quiz.article).load_only(Article.title, Article.url)
    )

    if sort_by == 'title':
        # Must join to sort by related field
        query = query.join(Article)
        if order == 'asc':
            query = query.order_by(Article.title.asc())
        else:
            query = query.order_by(Article.title.desc())
    else:
        # Default to date
        if order == 'asc':
            query = query.order_by(Quiz.created_at.asc())
        else:
            query = query.order_by(Quiz.created_at.desc())

    quizzes = query.all()
    
    results = []
    for q in quizzes:
        results.append({
            "id": q.id,
            "title": q.article.title,
            "url": q.article.url,
            "summary": q.summary,
            "created_at": q.created_at.isoformat()
        })
    return jsonify(results), 200

@main_bp.route('/api/user/history', methods=['GET'])
@jwt_required()
def get_user_history():
    # List User's Attempts (For Statistics)
    current_user_id = get_jwt_identity()
    # Optimized: Join Quiz and Article, but restrict Article columns
    attempts = QuizAttempt.query.options(
        joinedload(QuizAttempt.quiz).joinedload(Quiz.article).load_only(Article.title, Article.url)
    ).filter_by(user_id=current_user_id).order_by(QuizAttempt.completed_at.desc()).all()
    
    results = []
    for attempt in attempts:
        results.append({
            "attempt_id": attempt.id,
            "quiz_id": attempt.quiz.id,
            "title": attempt.quiz.article.title,
            "url": attempt.quiz.article.url,
            "summary": attempt.quiz.summary,
            "score": attempt.score,
            "total": attempt.total_questions,
            "date": attempt.completed_at.isoformat()
        })
    return jsonify(results), 200

@main_bp.route('/api/user/history/<attempt_id>', methods=['GET'])
@jwt_required()
def get_user_history_detail(attempt_id):
    current_user_id = get_jwt_identity()
    attempt = QuizAttempt.query.options(
        joinedload(QuizAttempt.quiz).joinedload(Quiz.article).load_only(Article.title, Article.url)
    ).filter_by(id=attempt_id, user_id=current_user_id).first_or_404()

    return jsonify({
        "attempt_id": attempt.id,
        "quiz_id": attempt.quiz.id,
        "title": attempt.quiz.article.title,
        "url": attempt.quiz.article.url,
        "summary": attempt.quiz.summary,
        "score": attempt.score,
        "total": attempt.total_questions,
        "answers": attempt.answers,
        "date": attempt.completed_at.isoformat()
    }), 200

@main_bp.route('/api/quiz/<quiz_id>', methods=['GET'])
@jwt_required()
def get_quiz(quiz_id):
    quiz = Quiz.query.get_or_404(quiz_id)
    
    # Strip correct answers for the client
    questions_clean = []
    for q in quiz.questions.get('questions', []):
        questions_clean.append({
            "question": q['question'],
            "options": q['options'],
            "difficulty": q.get('difficulty', 'Unknown'),
        })
        
    return jsonify({
        "id": quiz.id,
        "title": quiz.article.title,
        "summary": quiz.summary,
        "questions": questions_clean,
        "related_topics": quiz.questions.get('related_topics', [])
    }), 200

@main_bp.route('/api/quiz/<quiz_id>/submit', methods=['POST'])
@jwt_required()
def submit_quiz(quiz_id):
    current_user_id = get_jwt_identity()
    quiz = Quiz.query.get_or_404(quiz_id)
    user_answers = request.json.get('answers', {}) # { "0": "Option A" }
    
    stored_questions = quiz.questions.get('questions', [])
    score = 0
    results_detail = []
    
    for idx, q_data in enumerate(stored_questions):
        user_ans = user_answers.get(str(idx)) or user_answers.get(idx)
        
        # Robust comparison
        raw_correct = q_data['correct_answer']
        if user_ans is None:
            is_correct = False
        else:
            is_correct = (str(user_ans).strip() == str(raw_correct).strip())
        
        if is_correct:
            score += 1
            
        results_detail.append({
            "question": q_data['question'],
            "user_answer": user_ans,
            "correct_answer": raw_correct,
            "is_correct": is_correct,
            "explanation": q_data['explanation']
        })
    
    # Save Attempt
    attempt = QuizAttempt(
        user_id=current_user_id,
        quiz_id=quiz_id,
        score=score,
        total_questions=len(stored_questions),
        answers=results_detail
    )
    db.session.add(attempt)
    db.session.commit()
        
    return jsonify({
        "score": score,
        "total": len(stored_questions),
        "results": results_detail
    }), 200
