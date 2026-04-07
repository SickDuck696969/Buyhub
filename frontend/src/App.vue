<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="container header-content">
        <router-link to="/" class="brand-lockup">
          <span class="brand-core">Buy</span>
          <span class="brand-accent">hub</span>
        </router-link>

        <nav class="nav-links">
          <router-link to="/">Explore</router-link>
          <router-link to="/orders" v-if="isAuthenticated">Orders</router-link>
          <router-link to="/admin" v-if="isAdmin">Admin</router-link>
        </nav>

        <div class="header-actions">
          <router-link to="/cart" class="cart-chip">
            Cart
            <span class="cart-count">{{ cartCount }}</span>
          </router-link>
          <router-link v-if="isAuthenticated" to="/profile" class="button-secondary profile-link">
            {{ authStore.user?.name || 'Profile' }}
          </router-link>
          <router-link v-else to="/login" class="button-secondary profile-link">
            Login
          </router-link>
          <button v-if="isAuthenticated" class="logout-button" @click="handleLogout">Logout</button>
        </div>
      </div>
    </header>

    <section class="hero-strip">
      <div class="container hero-content">
        <div class="hero-stats card">
          <div>
            <strong>{{ authStore.isAuthenticated ? 'Signed in' : 'Guest' }}</strong>
          </div>
          <div>
            <strong>{{ cartCount }}</strong>
            <span>cart items</span>
          </div>
        </div>
      </div>
    </section>

    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';

const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const isAdmin = computed(() => authStore.isAdmin);
const cartCount = computed(() => cartStore.itemCount);

onMounted(() => {
  if (authStore.isAuthenticated && !cartStore.cart) {
    cartStore.fetchCart();
  }
});

const handleLogout = () => {
  authStore.logout();
  cartStore.resetCart();
  router.push('/');
};
</script>

<style>
@import './assets/main.css';

#app {
  min-height: 100vh;
}

.app-shell {
  min-height: 100vh;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(16px);
  background: rgba(8, 8, 8, 0.84);
  border-bottom: 1px solid var(--border-color);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 78px;
}

.brand-lockup {
  display: inline-flex;
  align-items: center;
  font-family: Impact, Haettenschweiler, "Arial Black", sans-serif;
  font-size: 1.8rem;
  letter-spacing: 0.01em;
}

.brand-core {
  color: #ffffff;
}

.brand-accent {
  color: #0c0c0c;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-strong));
  border-radius: 8px;
  padding: 0.08rem 0.45rem 0.16rem;
  margin-left: 0.18rem;
}

.nav-links,
.header-actions {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.nav-links a {
  color: var(--text-muted);
  font-weight: 700;
}

.nav-links a.router-link-active {
  color: var(--text-color);
}

.cart-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  border-radius: 999px;
  padding: 0.72rem 1rem;
  font-weight: 800;
}

.cart-count {
  min-width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--primary-color);
  color: #0c0c0c;
  font-size: 0.82rem;
}

.profile-link,
.logout-button {
  padding: 0.72rem 1rem;
}

.hero-strip {
  padding: 1.4rem 0 0.3rem;
}

.hero-content {
  display: flex;
  justify-content: flex-end;
}

.hero-stats {
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
  width: min(100%, 430px);
}

.hero-stats div {
  display: grid;
  gap: 0.18rem;
}

.hero-stats strong {
  font-size: 1.1rem;
}

.hero-stats span {
  color: var(--text-muted);
}

.app-main {
  padding: 1.25rem 0 3rem;
}

@media (max-width: 980px) {
  .header-content {
    flex-wrap: wrap;
    padding: 0.9rem 0;
  }

  .hero-content {
    justify-content: flex-start;
  }

  .hero-stats {
    width: 100%;
  }
}

@media (max-width: 720px) {
  .nav-links,
  .header-actions {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .brand-lockup {
    width: 100%;
  }
}
</style>
