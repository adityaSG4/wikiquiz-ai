import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="sharp-not-found">
            <div className="sharp-not-found-content">
                <h1 className="sharp-not-found-title">404</h1>
                <h2 className="sharp-not-found-subtitle">Page Not Found</h2>
                <p className="sharp-not-found-text">
                    Oops! The page you're looking for doesn't exist.
                </p>
                <Link to="/" className="sharp-btn-primary">
                    Go Home
                </Link>
            </div>
        </div>
    );
}
