import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')),
        token: localStorage.getItem('token'),
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
        isAdmin: (state) => state.user?.role === 'admin',
    },
    actions: {
        async login(email, password) {
            const { data } = await api.post('/auth/login', { email, password });
            this.user = data;
            this.token = data.token;
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('token', data.token);
        },
        async register(name, email, password) {
            const { data } = await api.post('/auth/register', { name, email, password });
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
