import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import ProductDetail from '../views/ProductDetail.vue';
import Cart from '../views/Cart.vue';
import Checkout from '../views/Checkout.vue';
import LoginRegister from '../views/LoginRegister.vue';
import Profile from '../views/Profile.vue';
import OrderHistory from '../views/OrderHistory.vue';
import AdminDashboard from '../views/AdminDashboard.vue';

const routes = [
    { path: '/', name: 'Home', component: Home },
    { path: '/product/:id', name: 'ProductDetail', component: ProductDetail },
    { path: '/cart', name: 'Cart', component: Cart },
    { path: '/checkout', name: 'Checkout', component: Checkout, meta: { requiresAuth: true } },
    { path: '/login', name: 'LoginRegister', component: LoginRegister },
    { path: '/profile', name: 'Profile', component: Profile, meta: { requiresAuth: true } },
    { path: '/orders', name: 'OrderHistory', component: OrderHistory, meta: { requiresAuth: true } },
    { path: '/admin', name: 'AdminDashboard', component: AdminDashboard, meta: { requiresAuth: true, requiresAdmin: true } },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to) => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('token');

    if (to.meta.requiresAuth && !token) {
        return { name: 'LoginRegister', query: { redirect: to.fullPath } };
    }

    if (to.meta.requiresAdmin && user?.role !== 'admin') {
        return { name: 'Home' };
    }

    if (to.name === 'LoginRegister' && token) {
        return { name: 'Home' };
    }

    return true;
});

export default router;
