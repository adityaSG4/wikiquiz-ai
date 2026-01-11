import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Important for Cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// Helper to get cookie by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Request Interceptor to add CSRF Token
apiClient.interceptors.request.use(config => {
    // Only add CSRF token for mutating requests
    if (['post', 'put', 'delete', 'patch'].includes(config.method)) {
        const csrfToken = getCookie('csrf_access_token');
        if (csrfToken) {
            config.headers['X-CSRF-TOKEN'] = csrfToken;
        }
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export const api = {
    // Auth
    async login(username, password) {
        const { data } = await apiClient.post('/auth/login', { username, password });
        return data;
    },

    async register(username, email, password) {
        const { data } = await apiClient.post('/auth/register', { username, email, password });
        return data;
    },

    async logout() {
        const { data } = await apiClient.post('/auth/logout');
        return data;
    },

    async getMe() {
        const { data } = await apiClient.get('/auth/me');
        return data;
    },

    // Quiz
    async generateQuiz(url) {
        const { data } = await apiClient.post('/generate', { url });
        return data;
    },

    async getQuizzes(params = {}) {
        const { data } = await apiClient.get('/quizzes', { params });
        return data;
    },

    async getUserHistory() {
        const { data } = await apiClient.get('/user/history');
        return data;
    },

    async getQuizAttemptDetails(attemptId) {
        const { data } = await apiClient.get(`/user/history/${attemptId}`);
        return data;
    },

    async getQuizDetails(id) {
        const { data } = await apiClient.get(`/quiz/${id}`);
        return data;
    },

    async submitQuiz(id, answers) {
        const { data } = await apiClient.post(`/quiz/${id}/submit`, { answers });
        return data;
    },
};

