import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useMobile } from '../hooks/useMobile';

export default function Profile() {
    const { user } = useAuth();
    const isMobile = useMobile();

    const formatUsername = (name) => {
        if (!name) return '';
        // Only truncate on smaller screens
        if (isMobile && name.length > 12) {
            return `${name.slice(0, 12)}…`;
        }
        return name;
    };

    const formatEmail = (email) => {
        if (!email) return '';
        // Only truncate on smaller screens
        if (isMobile && email.length > 19) {
            return `${email.slice(0, 19)}…`;
        }
        return email;
    };


    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Page Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="sharp-page-title">Profile</h1>
                <p className="sharp-page-subtitle">Manage your account settings</p>
            </div>

            {/* Profile Card */}
            <div className="sharp-card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                    <div className="sharp-avatar">
                        {user?.username?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            letterSpacing: '0.02em',
                            color: '#1a1a1a',
                            marginBottom: '0.25rem'
                        }}>{formatUsername(user?.username)}</h2>
                        <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1rem' }}>{formatEmail(user?.email)}</p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span className="sharp-badge sharp-badge-success">Active Scholar</span>
                            <span className="sharp-badge sharp-badge-primary">Pro Member</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Account Information Card */}
            <div className="sharp-card">
                <h3 className="sharp-section-title">Account Information</h3>
                <div>
                    <div className="sharp-info-row">
                        <span className="sharp-info-label">Username</span>
                        <span className="sharp-info-value">{formatUsername(user?.username)}</span>
                    </div>
                    <div className="sharp-info-row">
                        <span className="sharp-info-label">Email</span>
                        <span className="sharp-info-value">{formatEmail(user?.email)}</span>
                    </div>
                    <div className="sharp-info-row">
                        <span className="sharp-info-label">Member Since</span>
                        <span className="sharp-info-value">January 2026</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
