import { defineStore } from 'pinia';
import api from '../services/api';

export const useCartStore = defineStore('cart', {
    state: () => ({
        cart: null,
        loading: false,
        error: null,
    }),
    actions: {
        async fetchCart() {
            this.loading = true;
            this.error = null;
            try {
                const { data } = await api.get('/cart');
                this.cart = data;
            } catch (error) {
                this.error = 'Failed to fetch cart';
            } finally {
                this.loading = false;
            }
        },
        async addToCart(productId, quantity) {
            this.loading = true;
            this.error = null;
            try {
                const { data } = await api.post('/cart', { productId, quantity });
                this.cart = data;
            } catch (error) {
                this.error = 'Failed to add to cart';
            } finally {
                this.loading = false;
            }
        },
        async removeFromCart(cartItemId) {
            this.loading = true;
            this.error = null;
            try {
                const { data } = await api.delete(`/cart/${cartItemId}`);
                this.cart = data;
            } catch (error) {
                this.error = 'Failed to remove from cart';
            } finally {
                this.loading = false;
            }
        },
        async updateQuantity(cartItemId, quantity) {
            this.loading = true;
            this.error = null;
            try {
                const { data } = await api.put(`/cart/${cartItemId}`, { quantity });
                this.cart = data;
            } catch (error) {
                this.error = 'Failed to update quantity';
            } finally {
                this.loading = false;
            }
        },
    },
});
