from datetime import datetime
from database import db
from sqlalchemy.dialects.postgresql import JSONB
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class Article(db.Model):
    __tablename__ = 'articles'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    url = db.Column(db.String, unique=True, nullable=False)
    title = db.Column(db.String, nullable=False)
    raw_html = db.Column(db.Text, nullable=False)
    cleaned_text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    quizzes = db.relationship('Quiz', backref='article', lazy=True)

class Quiz(db.Model):
    __tablename__ = 'quizzes'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    article_id = db.Column(db.String(36), db.ForeignKey('articles.id'), nullable=False)
    summary = db.Column(db.Text, nullable=False)
    questions = db.Column(JSONB, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    attempts = db.relationship('QuizAttempt', backref='quiz', lazy=True)

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    attempts = db.relationship('QuizAttempt', backref='user', lazy=True)

class QuizAttempt(db.Model):
    __tablename__ = 'quiz_attempts'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    quiz_id = db.Column(db.String(36), db.ForeignKey('quizzes.id'), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    total_questions = db.Column(db.Integer, nullable=False)
    answers = db.Column(JSONB, nullable=False)
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)
