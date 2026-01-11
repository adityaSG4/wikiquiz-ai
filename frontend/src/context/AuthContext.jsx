import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

// Key for tracking if user might be logged in (not sensitive, just a flag)
const AUTH_FLAG_KEY = 'wikiquiz_auth_active';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        // Only call /me if we think user might be logged in
        const hasAuthFlag = localStorage.getItem(AUTH_FLAG_KEY);

        if (!hasAuthFlag) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const userData = await api.getMe();
            setUser(userData);
        } catch (err) {
            setUser(null);
            // Clear flag if auth failed
            localStorage.removeItem(AUTH_FLAG_KEY);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            await api.login(username, password);
            localStorage.setItem(AUTH_FLAG_KEY, 'true');

            try {
                const userData = await api.getMe();
                setUser(userData);
                return userData;
            } catch (error) {
                console.error('Error fetching user data after successful login:', error);
                throw error;
            }
        } catch (err) {
            localStorage.removeItem(AUTH_FLAG_KEY);
            throw err;
        }
    };

    const register = async (username, email, password) => {
        return await api.register(username, email, password);
    };

    const logout = async () => {
        try {
            await api.logout();
        } finally {
            setUser(null);
            localStorage.removeItem(AUTH_FLAG_KEY);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

