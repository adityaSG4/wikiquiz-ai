import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function QuizModal({ quizId, initialData, onClose, onOpen }) {
    const [quiz, setQuiz] = useState(initialData && initialData.quiz_id === quizId ? initialData : null);
    const [loading, setLoading] = useState(!initialData || initialData.quiz_id !== quizId);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (initialData && initialData.quiz_id === quizId) {
            setQuiz(initialData);
            setLoading(false);
            if (onOpen) onOpen();
        } else {
            loadQuiz();
        }
    }, [quizId, initialData]);

    const loadQuiz = async () => {
        setLoading(true);
        try {
            const data = await api.getQuizDetails(quizId);
            setQuiz(data);
            if (onOpen) onOpen();
        } catch (err) {
            alert(err.message || "Error loading quiz");
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (idx, option) => {
        if (result) return;
        setAnswers(prev => ({ ...prev, [idx]: option }));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const res = await api.submitQuiz(quizId, answers);
            setResult(res);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!quiz) return null;

    return (
        <div className="sharp-modal-overlay" onClick={onClose}>
            <div className="sharp-modal-content" onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                    <div>
                        <h2 className="sharp-modal-title">{quiz.title}</h2>
                        <p className="sharp-modal-subtitle">Interactive Quiz Session</p>
                    </div>
                    <button onClick={onClose} className="sharp-modal-close">✕</button>
                </div>

                {loading && (
                    <div style={{ padding: '4rem', textAlign: 'center' }}>
                        <div className="loader" style={{ width: '48px', height: '48px', borderWidth: '4px', borderColor: '#e0e0e0', borderBottomColor: '#1a1a1a' }}></div>
                        <p style={{ marginTop: '1.5rem', color: '#888', fontWeight: '500', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.8rem' }}>Preparing your quiz...</p>
                    </div>
                )}

                {!loading && !result && (
                    <div className="quiz-questions">
                        {quiz.questions.map((q, idx) => (
                            <div key={idx} style={{ marginBottom: '3rem' }}>
                                <span className="sharp-question-number">Question {idx + 1} of {quiz.questions.length}</span>
                                <p className="sharp-question-text">{q.question}</p>
                                <div style={{ display: 'grid', gap: '0.75rem' }}>
                                    {q.options.map((opt, optIdx) => (
                                        <button
                                            key={optIdx}
                                            className={`sharp-option-btn ${answers[idx] === opt ? 'selected' : ''}`}
                                            onClick={() => handleSelect(idx, opt)}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #f0f0f0' }}>
                            <button
                                className="sharp-btn-primary"
                                style={{ width: '100%', padding: '1.25rem', fontSize: '0.9rem' }}
                                onClick={handleSubmit}
                                disabled={Object.keys(answers).length !== quiz.questions.length || loading}
                            >
                                {loading ? 'Submitting...' : 'Submit Quiz'}
                            </button>
                        </div>
                    </div>
                )}

                {!loading && result && (
                    <div className="quiz-results">
                        <div className="sharp-result-score-container">
                            <h3 className="sharp-result-score">
                                {result.score}<span style={{ fontSize: '2rem', color: '#ccc', fontWeight: '400' }}>/{result.total}</span>
                            </h3>
                            <p className="sharp-result-message">
                                {result.score === result.total ? 'Perfect Score!' :
                                    result.score > result.total / 2 ? 'Great Job!' : 'Keep Learning!'}
                            </p>
                        </div>

                        {result.results.map((res, idx) => (
                            <div key={idx} className="sharp-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                                <span className="sharp-question-number">Question {idx + 1}</span>
                                <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '1rem' }}>
                                    {res.question}
                                </p>

                                <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                    <div className={`sharp-option-btn ${res.is_correct ? 'correct' : 'incorrect'}`} style={{ cursor: 'default' }}>
                                        <span style={{ fontWeight: '600' }}>Your Answer: {res.user_answer}</span>
                                        <span>{res.is_correct ? '✓' : '✕'}</span>
                                    </div>

                                    {!res.is_correct && (
                                        <div className="sharp-option-btn correct" style={{ cursor: 'default' }}>
                                            <span style={{ fontWeight: '600' }}>Correct Answer: {res.correct_answer}</span>
                                            <span>✓</span>
                                        </div>
                                    )}
                                </div>

                                <div className="sharp-explanation">
                                    <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#1a1a1a', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>Explanation</strong>
                                    {res.explanation}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
