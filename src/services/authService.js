import api from './api';

export const authService = {
    async login(email, password) {
        const response = await api.post('/v1/auth/login', { email, password });
        if (response.data.access_token) {
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('refresh_token', response.data.refresh_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    async register(data) {
        const response = await api.post('/v1/auth/register', data);
        if (response.data.access_token) {
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('refresh_token', response.data.refresh_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    async logout() {
        try {
            await api.post('/v1/auth/logout');
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
        }
    },

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('user'));
    },

    isAuthenticated() {
        return !!localStorage.getItem('access_token');
    }
};
