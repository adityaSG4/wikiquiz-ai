import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Statistics() {
    const [history, setHistory] = useState([]);
    const [visibleHistory, setVisibleHistory] = useState([]);
    const [selectedAttempt, setSelectedAttempt] = useState(null);
    const [stats, setStats] = useState({ total: 0, avgScore: 0, bestQuiz: '-' });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        fetchHistory();
    }, []);

    useEffect(() => {
        // Load initial chunk when history is fetched
        if (history.length > 0) {
            loadMoreItems();
        }
    }, [history]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const data = await api.getUserHistory();
            setHistory(data);

            if (data.length > 0) {
                const total = data.length;
                const totalScoreObtained = data.reduce((acc, curr) => acc + curr.score, 0);
                const totalPossible = data.reduce((acc, curr) => acc + curr.total, 0);
                const avg = totalPossible ? Math.round((totalScoreObtained / totalPossible) * 100) : 0;

                setStats({
                    total,
                    avgScore: avg,
                    bestQuiz: data[0].title
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadMoreItems = () => {
        const nextItems = history.slice(0, page * ITEMS_PER_PAGE);
        setVisibleHistory(nextItems);
        setPage(prev => prev + 1);
    };

    const handleScroll = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.target;
        if (scrollHeight - scrollTop === clientHeight) {
            if (visibleHistory.length < history.length) {
                loadMoreItems();
            }
        }
    };

    const [loadingDetails, setLoadingDetails] = useState(false);

    const handleReview = async (attempt) => {
        setSelectedAttempt({ ...attempt, loading: true }); // Open modal with summary data first
        setLoadingDetails(true);
        try {
            const details = await api.getQuizAttemptDetails(attempt.attempt_id);
            setSelectedAttempt(details); // Update with full details
        } catch (err) {
            console.error("Failed to load details", err);
            alert("Failed to load detailed results.");
        } finally {
            setLoadingDetails(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <div className="loader" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
            </div>
        );
    }

    return (
        <div>
            {/* Page Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="sharp-page-title">Statistics</h1>
                <p className="sharp-page-subtitle">Track your learning progress</p>
            </div>

            {/* Stats Cards */}
            <div className="sharp-stats-grid">
                <div className="sharp-stat-card">
                    <p className="sharp-stat-label">Total Attempts</p>
                    <p className="sharp-stat-value ">{stats.total}</p>
                </div>
                <div className="sharp-stat-card">
                    <p className="sharp-stat-label">Average Score</p>
                    <p className="sharp-stat-value ">{stats.avgScore}%</p>
                </div>
                <div className="sharp-stat-card">
                    <p className="sharp-stat-label">Last Attempt</p>
                    <p className="sharp-stat-value text" title={stats.bestQuiz}>{stats.bestQuiz}</p>
                </div>
            </div>

            {/* Detailed Progress Table */}
            <div className="sharp-table-container" style={{ display: 'flex', flexDirection: 'column', maxHeight: '600px' }}>
                <div className="sharp-table-header">
                    <span className="sharp-table-title">Detailed Progress Report</span>
                    <span className="sharp-table-info">Showing {visibleHistory.length} of {history.length} attempts</span>
                </div>

                <div style={{ overflowX: 'auto', overflowY: 'auto', flex: 1 }} onScroll={handleScroll}>
                    <table className="sharp-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                        <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                            <tr>
                                <th style={{ textAlign: 'center', width: '5%' }}>#</th>
                                <th style={{ textAlign: 'left', width: '15%' }}>Date</th>
                                <th style={{ textAlign: 'left', width: '35%' }}>Quiz Title</th>
                                <th style={{ textAlign: 'left', width: '10%' }}>Source</th>
                                <th style={{ textAlign: 'center', width: '10%' }}>Score</th>
                                <th style={{ textAlign: 'center', width: '15%' }}>Performance</th>
                                <th style={{ textAlign: 'center', width: '15%' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleHistory.map((attempt, idx) => (
                                <tr
                                    key={attempt.attempt_id}
                                    style={{
                                        borderBottom: '1px solid var(--border)',
                                        transition: 'background 0.15s ease'
                                    }}
                                >
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: '500' }}>
                                        {idx + 1}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                                        {new Date(attempt.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ fontWeight: '500', color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={attempt.title}>
                                            {attempt.title}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <a
                                            href={attempt.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{
                                                color: 'var(--primary)',
                                                textDecoration: 'none',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                                fontWeight: '500'
                                            }}
                                        >
                                            Link ↗
                                        </a>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'center', fontWeight: '600', color: 'var(--text-main)' }}>
                                        {attempt.score} <span style={{ color: 'var(--text-muted)', fontWeight: '400', fontSize: '0.9em' }}>/ {attempt.total}</span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            background: (attempt.score / attempt.total) >= 0.8 ? 'rgba(34, 197, 94, 0.1)' : (attempt.score / attempt.total) >= 0.5 ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: (attempt.score / attempt.total) >= 0.8 ? 'var(--success)' : (attempt.score / attempt.total) >= 0.5 ? '#ca8a04' : 'var(--error)'
                                        }}>
                                            {Math.round((attempt.score / attempt.total) * 100)}%
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                                        <button
                                            className="sharp-btn-outline"
                                            onClick={() => handleReview(attempt)}
                                        >
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {history.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                                        <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No quizzes taken yet</p>
                                        <p style={{ fontSize: '0.9rem' }}>Generate a quiz to start tracking your progress!</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {visibleHistory.length < history.length && (
                        <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
                            Loading more history...
                        </div>
                    )}
                </div>
                {/* Details Modal */}
                {selectedAttempt && (
                    <div className="sharp-modal-overlay" onClick={() => setSelectedAttempt(null)}>
                        <div className="sharp-modal-content" onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <div>
                                    <h2 className="sharp-modal-title" style={{ marginBottom: '0.5rem' }}>{selectedAttempt.title}</h2>
                                    <p className="sharp-modal-subtitle" style={{ color: 'var(--text-muted)' }}>
                                        Attempted on {new Date(selectedAttempt.date).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedAttempt(null)}
                                    className="sharp-modal-close"
                                >✕</button>
                            </div >

                            <div style={{ textAlign: 'center', marginBottom: '3rem', padding: '2rem', background: 'var(--primary-light)', borderRadius: '12px' }}>
                                <h3 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '0.5rem', lineHeight: 1 }}>
                                    {selectedAttempt.score} <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>/ {selectedAttempt.total}</span>
                                </h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                                    {Math.round((selectedAttempt.score / selectedAttempt.total) * 100)}% Score
                                </p>
                            </div>

                            <div className="quiz-results">
                                {loadingDetails ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                                        <div className="loader" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
                                    </div>
                                ) : (
                                    <>
                                        {selectedAttempt.answers && selectedAttempt.answers.map((res, idx) => (
                                            <div key={idx} className="sharp-card" style={{ marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
                                                <p style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '600' }}>
                                                    <span style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }}>Q{idx + 1}:</span>
                                                    {res.question}
                                                </p>

                                                <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1.5rem' }}>
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
                                        {(!loadingDetails && (!selectedAttempt.answers || selectedAttempt.answers.length === 0)) && (
                                            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Detailed breakdown not available for this attempt.</p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )
                }
            </div>
        </div>
    );
}
