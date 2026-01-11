import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (username.length > 12 || username.length === 0 || username.includes(' ') || username.includes('\t') || username.includes('\n') || username.includes('\r')) {
            setError('Please enter a valid username');
            return;
        }
        if(password.length < 8 || password.includes(' ') || password.includes('\t') || password.includes('\n') || password.includes('\r')) {
            setError('Please enter a valid password');
            return;
        }
        if(!email.includes('@') || !email.includes('.') || email.includes(' ') || email.startsWith('@') || email.endsWith('@') || email.startsWith('.') || email.endsWith('.')) {
            setError('Please enter a valid email address');
            return;
        }


        setLoading(true);
        try {
            await register(username, email, password);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">Sign Up</h1>
                <p className="auth-subtitle">Create your account</p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="sharp-input-group">
                        <label className="sharp-label">Username</label>
                        <input
                            type="text"
                            className="sharp-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            maxLength={12}
                            required
                        />
                    </div>
                    <div className="sharp-input-group">
                        <label className="sharp-label">Email</label>
                        <input
                            type="email"
                            className="sharp-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="auth-footer">
                    <span className="auth-footer-text">Already have an account? </span>
                    <Link to="/login" className="auth-footer-link">Login</Link>
                </div>
            </div>
        </div>
    );
}
