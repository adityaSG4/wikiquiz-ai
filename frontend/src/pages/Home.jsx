import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import QuizModal from '../components/QuizModal';
import Statistics from '../components/Statistics';
import Profile from '../components/Profile';
import LogoutModal from '../components/LogoutModal';

import { useDebounce } from '../hooks/useDebounce';
import { useMobile } from '../hooks/useMobile';

export default function Home() {
    const [activeTab, setActiveTab] = useState('generate');
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [quizzes, setQuizzes] = useState([]);
    const [activeQuizId, setActiveQuizId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [openingQuiz, setOpeningQuiz] = useState(false);
    const [generatedQuizData, setGeneratedQuizData] = useState(null);
    const { logout, user } = useAuth();

    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const isMobile = useMobile();

    // Debounce search term to avoid excessive filtering on every keystroke
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    useEffect(() => {
        if (activeTab === 'quizzes') {
            fetchQuizzes();
        }
    }, [activeTab, sortBy, sortOrder]);

    const fetchQuizzes = async () => {
        setFetching(true);
        try {
            const data = await api.getQuizzes({ sort_by: sortBy, order: sortOrder });
            setQuizzes(data);
        } catch (err) {
            console.error(err);
        } finally {
            setFetching(false);
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!url) return;
        setLoading(true);
        try {
            const data = await api.generateQuiz(url);
            setUrl('');
            setGeneratedQuizData(data); // Store the full data including questions
            setActiveQuizId(data.quiz_id);
        } catch (err) {
            alert(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    // Filter quizzes based on debounced search term
    const filteredQuizzes = quizzes.filter(quiz =>
        quiz.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (quiz.summary && quiz.summary.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
    );

    const formatUsername = (name) => {
        if (!name) return '';
        // Only truncate on smaller screens
        if (isMobile && name.length > 12) {
            return `${name.slice(0, 12)}…`;
        }
        return name;
    };

    const handleLogoutConfirm = () => {
        setShowLogoutModal(false);
        logout();
    };

    const handleLogoutCancel = () => {
        setShowLogoutModal(false);
    };

    

    return (
        <div className="container">
            {/* Sharp Header */}
            <header className="sharp-header">
                <div className="sharp-header-brand">WikiQuiz</div>
                <div className="sharp-header-user">
                    <span className="sharp-header-username" title={user?.username}>Hi, {formatUsername(user?.username)}</span>
                    <button onClick={() => setShowLogoutModal(true)} className="sharp-header-logout">
                        Logout
                    </button>
                </div>
            </header>

            {/* Sharp Tabs */}
            <div className="sharp-tabs">
                {['generate', 'quizzes', 'statistics', 'profile'].map(tab => (
                    <button
                        key={tab}
                        className={`sharp-tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'generate' ? 'Dashboard' : tab}
                    </button>
                ))}
            </div>

            {activeTab === 'generate' && (
                <div className="sharp-generate-section">
                    <div className="sharp-generate-header">
                        <h1 className="sharp-page-title">Generate Quiz</h1>
                        <p className="sharp-page-subtitle">Transform Wikipedia articles into interactive quizzes</p>
                    </div>
                    
                    <div className="sharp-generate-card">
                        <form onSubmit={handleGenerate} className="sharp-generate-form">
                            <input
                                type="url"
                                className="sharp-generate-input"
                                placeholder="Paste Wikipedia Article URL..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                required
                            />
                            <button type="submit" className="sharp-generate-btn" disabled={loading}>
                                {loading ? '...' : 'Generate'}
                            </button>
                        </form>
                    </div>
                    <div className="sharp-generate-text">
                        <p>
                            ✨ Transform any Wikipedia article into a quiz in seconds
                        </p>
                    </div>
                </div>
            )}

            {activeTab === 'quizzes' && (
                <div>
                    {/* Page Header */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h1 className="sharp-page-title">My Quizzes</h1>
                        <p className="sharp-page-subtitle">Manage your quiz collection</p>
                    </div>

                    {/* Search and Sort Controls */}
                    <div className="sharp-quizzes-controls" style={{ marginBottom: '2rem' }}>
                        <div className="sharp-quizzes-search">
                            <input
                                type="text"
                                className="sharp-search"
                                placeholder="Search quizzes by title or content..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="sharp-quizzes-sort">
                            <span style={{ fontSize: '0.7rem', color: '#888', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Sort by:</span>
                            <div className="sharp-sort-control">
                                <select
                                    value={`${sortBy}-${sortOrder}`}
                                    onChange={(e) => {
                                        const [newSort, newOrder] = e.target.value.split('-');
                                        setSortBy(newSort);
                                        setSortOrder(newOrder);
                                    }}
                                    className="sharp-select"
                                >
                                    <option value="date-desc">Newest First</option>
                                    <option value="date-asc">Oldest First</option>
                                    <option value="title-asc">Title (A-Z)</option>
                                    <option value="title-desc">Title (Z-A)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Quiz Cards Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {fetching ? (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem' }}>
                                <div className="loader" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
                            </div>
                        ) : (
                            <>
                                {filteredQuizzes.map(quiz => (
                                    <div key={quiz.id} className="sharp-quiz-card">
                                        <div>
                                            <h3 className="sharp-quiz-title" title={quiz.title}>{quiz.title}</h3>
                                            <p className="sharp-quiz-summary">{quiz.summary}</p>
                                        </div>

                                        <div className="sharp-quiz-footer">
                                            <span className="sharp-quiz-date">
                                                {new Date(quiz.created_at).toLocaleDateString()}
                                            </span>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {quiz.url && (
                                                    <a
                                                        href={openingQuiz ? undefined : quiz.url}
                                                        onClick={(e) => openingQuiz && e.preventDefault()}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="sharp-btn-outline"
                                                        disabled={!quiz.url || openingQuiz}
                                                        style={{ padding: '0.5rem 1rem', fontSize: '0.65rem', opacity: !quiz.url || openingQuiz ? 0.5 : 1 }}
                                                    >
                                                        Read
                                                    </a>
                                                )}
                                                <button
                                                    className="sharp-btn-primary"
                                                    onClick={() => {
                                                        setOpeningQuiz(true);
                                                        setActiveQuizId(quiz.id);
                                                    }}
                                                    style={{ padding: '0.5rem 1rem', fontSize: '0.65rem' }}
                                                    disabled={openingQuiz}
                                                >
                                                    {openingQuiz && activeQuizId === quiz.id ? '...' : 'Start'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {filteredQuizzes.length === 0 && quizzes.length > 0 && (
                                    <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888', fontSize: '0.9rem' }}>
                                        No quizzes match your search.
                                    </p>
                                )}
                                {quizzes.length === 0 && (
                                    <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888', fontSize: '0.9rem' }}>
                                        No quizzes found. Generate one!
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'statistics' && <Statistics />}
            {activeTab === 'profile' && <Profile />}

            {
                activeQuizId && (
                    <QuizModal
                        quizId={activeQuizId}
                        initialData={generatedQuizData && generatedQuizData.quiz_id === activeQuizId ? generatedQuizData : null}
                        onClose={() => {
                            setActiveQuizId(null);
                            setOpeningQuiz(false);
                            setGeneratedQuizData(null);
                        }}
                        onOpen={() => setOpeningQuiz(false)}
                    />
                )
            }

            <LogoutModal
                isOpen={showLogoutModal}
                onConfirm={handleLogoutConfirm}
                onCancel={handleLogoutCancel}
            />
        </div >
    );
}

