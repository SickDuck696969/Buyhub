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
        displayName: (state) => state.user?.fullName || state.user?.username || state.user?.email || 'Guest',
    },
    actions: {
        async login(email, password) {
            try {
                const { data } = await api.post('/auth/login', { email, password });
                const profileResponse = await api.get('/auth/me', {
                    headers: {
                        Authorization: `Bearer ${data.token}`,
                    },
                });

                this.setSession({
                    ...profileResponse.data.data,
                    token: data.token,
                    loginCount: data.loginCount,
                });

                return data;
            } catch (error) {
                throw error.response?.data?.message || error.message || 'Login failed';
            }
        },
        async register(name, email, password) {
            try {
                const username = email.split('@')[0];
                const { data } = await api.post('/auth/register', {
                    username,
                    fullName: name,
                    email,
                    password,
                    role: 'user',
                });

                await this.login(email, password);
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
