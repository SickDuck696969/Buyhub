import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user') || 'null'),
        token: localStorage.getItem('token'),
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
        isAdmin: (state) => state.user?.role === 'admin',
        displayName: (state) => state.user?.name || state.user?.email || 'Guest',
    },
    actions: {
        async login(email, password) {
            try {
                const { data } = await api.post('/auth/login', { email, password });
                this.setSession(data);
                return data;
            } catch (error) {
                throw error.response?.data?.message || error.message || 'Login failed';
            }
        },
        async register(name, email, password) {
            try {
                const { data } = await api.post('/auth/register', { name, email, password });
                this.setSession(data);
                return data;
            } catch (error) {
                throw error.response?.data?.message || error.message || 'Registration failed';
            }
        },
        setSession(data) {
            this.user = data;
            this.token = data.token;
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('token', data.token);
        },
        logout() {
            this.user = null;
            this.token = null;
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        },
    },
});
