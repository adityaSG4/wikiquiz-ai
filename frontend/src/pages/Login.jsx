import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMobile } from '../hooks/useMobile';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showMobileNotice, setShowMobileNotice] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const isMobile = useMobile();

    useEffect(() => {
        // Show mobile notice on mobile devices
        if (isMobile) {
            setShowMobileNotice(true);
            // Auto-hide after 10 seconds
            const timer = setTimeout(() => {
                setShowMobileNotice(false);
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [isMobile]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const user = await login(username, password);
            // Only navigate if login was successful and user is set
            if (user) {
                navigate('/', { replace: true });
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            {/* Mobile Cookie Notice */}
            {showMobileNotice && (
                <div className="sharp-mobile-notice">
                    <div className="sharp-mobile-notice-content">
                        <div className="sharp-mobile-notice-header">
                            <span className="sharp-mobile-notice-icon">📱</span>
                            <h3>Mobile Browser Notice</h3>
                            <button 
                                className="sharp-mobile-notice-close"
                                onClick={() => setShowMobileNotice(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="sharp-mobile-notice-body">
                            <p><strong>Using Mobile?</strong></p>
                            <p>If login fails, enable cookies in Chrome:</p>
                            <ol>
                                <li>Settings → Site settings → Cookies</li>
                                <li>Allow third-party cookies</li>
                            </ol>
                            <p><em>This notice will auto-dismiss in 10 seconds</em></p>
                        </div>
                    </div>
                </div>
            )}

            <div className="auth-card">
                <h1 className="auth-title">Login</h1>
                <p className="auth-subtitle">Enter your credentials</p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="sharp-input-group">
                        <label className="sharp-label">Username</label>
                        <input
                            type="text"
                            className="sharp-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="sharp-input-group">
                        <label className="sharp-label">Password</label>
                        <input
                            type="password"
                            className="sharp-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="sharp-btn" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="auth-footer">
                    <span className="auth-footer-text">Don't have an account? </span>
                    <Link to="/register" className="auth-footer-link">Sign Up</Link>
                </div>
            </div>
        </div>
    );
}
