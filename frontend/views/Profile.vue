<template>
  <div class="container section-grid">
    <div class="page-heading">
      <div>
        <span class="pill">Profile</span>
      </div>
    </div>

    <section class="profile-grid">
      <div class="card profile-card">
        <span class="pill">{{ authStore.isAdmin ? 'Admin account' : 'Customer account' }}</span>
        <h2>{{ authStore.user?.name }}</h2>
        <div class="profile-meta">
          <div>
            <span class="muted">Email</span>
            <strong>{{ authStore.user?.email }}</strong>
          </div>
          <div>
            <span class="muted">Role</span>
            <strong>{{ authStore.user?.role }}</strong>
          </div>
        </div>
        <button class="button-danger" @click="logout">Logout</button>
      </div>

      <div class="card quick-links">
        <span class="pill">Shortcuts</span>
        <h2>Links</h2>
        <router-link to="/orders" class="shortcut">View your orders</router-link>
        <router-link to="/cart" class="shortcut">Open cart</router-link>
        <router-link v-if="authStore.isAdmin" to="/admin" class="shortcut">Open admin dashboard</router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';

const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();

const logout = () => {
  authStore.logout();
  cartStore.resetCart();
  router.push('/');
};
</script>

<style scoped>
.profile-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 1.2rem;
}

.profile-card,
.quick-links {
  padding: 1.25rem;
  display: grid;
  gap: 1rem;
}

.profile-card h2,
.quick-links h2 {
  margin: 0;
}

.profile-meta {
  display: grid;
  gap: 0.9rem;
}

.profile-meta div {
  display: grid;
  gap: 0.2rem;
  padding: 0.9rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
}

.shortcut {
  padding: 1rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  font-weight: 700;
}

@media (max-width: 900px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}
</style>
