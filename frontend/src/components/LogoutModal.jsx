import React from 'react';

export default function LogoutModal({ isOpen, onConfirm, onCancel }) {
    if (!isOpen) return null;

    return (
        <div className="sharp-modal-overlay" onClick={onCancel}>
            <div className="sharp-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="sharp-modal-header">
                    <h2 className="sharp-modal-title">Confirm Logout</h2>
                    <button className="sharp-modal-close" onClick={onCancel}>×</button>
                </div>
                <div className="sharp-modal-body">
                    <p>Are you sure you want to logout?</p>
                </div>
                <div className="sharp-modal-footer">
                    <button className="sharp-btn-outline" onClick={onCancel}>
                        Cancel
                    </button>
                    <button className="sharp-btn-primary" onClick={onConfirm}>
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
