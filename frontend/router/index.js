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
    { path: '/checkout', name: 'Checkout', component: Checkout },
    { path: '/login', name: 'LoginRegister', component: LoginRegister },
    { path: '/profile', name: 'Profile', component: Profile },
    { path: '/orders', name: 'OrderHistory', component: OrderHistory },
    { path: '/admin', name: 'AdminDashboard', component: AdminDashboard },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
