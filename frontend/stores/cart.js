import { defineStore } from 'pinia';
import api from '../services/api';

export const useCartStore = defineStore('cart', {
    state: () => ({
        cart: null,
        loading: false,
        error: null,
    }),
    getters: {
        items: (state) => state.cart?.items || [],
        itemCount: (state) => (state.cart?.items || []).reduce((total, item) => total + (item.quantity || 0), 0),
        subtotal: (state) => (state.cart?.items || []).reduce((total, item) => {
            const price = item.product_id?.price || 0;
            return total + price * (item.quantity || 0);
        }, 0),
    },
    actions: {
        async fetchCart() {
            if (!localStorage.getItem('token')) {
                this.cart = null;
                return null;
            }

            this.loading = true;
            this.error = null;
            try {
                const { data } = await api.get('/cart');
                this.cart = data;
                return data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to fetch cart';
                throw this.error;
            } finally {
                this.loading = false;
            }
        },
        async addToCart(productId, quantity) {
            this.loading = true;
            this.error = null;
            try {
                await api.post('/cart', { productId, quantity });
                await this.fetchCart();
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to add to cart';
                throw this.error;
            } finally {
                this.loading = false;
            }
        },
        async removeFromCart(cartItemId) {
            this.loading = true;
            this.error = null;
            try {
                await api.delete(`/cart/${cartItemId}`);
                await this.fetchCart();
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to remove from cart';
                throw this.error;
            } finally {
                this.loading = false;
            }
        },
        async updateQuantity(cartItemId, quantity) {
            this.loading = true;
            this.error = null;
            try {
                await api.put(`/cart/${cartItemId}`, { quantity });
                await this.fetchCart();
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to update quantity';
                throw this.error;
            } finally {
                this.loading = false;
            }
        },
        async clearCart() {
            this.loading = true;
            this.error = null;
            try {
                await api.delete('/cart');
                await this.fetchCart();
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to clear cart';
                throw this.error;
            } finally {
                this.loading = false;
            }
        },
        resetCart() {
            this.cart = null;
            this.loading = false;
            this.error = null;
        },
    },
});
