<template>
  <div class="container auth-page">
    <section class="auth-layout">
      <div class="auth-card card">
        <span class="pill">{{ isLogin ? 'Welcome back' : 'Create account' }}</span>
        <h2>{{ isLogin ? 'Login' : 'Register' }}</h2>
        <form @submit.prevent="handleSubmit">
          <div v-if="!isLogin">
            <label for="name">Name</label>
            <input type="text" v-model="name" id="name" required />
          </div>
          <div>
            <label for="email">Email</label>
            <input type="email" v-model="email" id="email" required />
          </div>
          <div>
            <label for="password">Password</label>
            <input type="password" v-model="password" id="password" required />
          </div>
          <button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Processing...' : isLogin ? 'Login' : 'Register' }}
          </button>
        </form>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <p class="toggle-copy">
          {{ isLogin ? 'Need an account?' : 'Already have an account?' }}
          <button type="button" class="button-secondary switch-button" @click="toggleMode">
            {{ isLogin ? 'Register' : 'Login' }}
          </button>
        </p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRoute, useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const isLogin = ref(true);
const name = ref('');
const email = ref('');
const password = ref('');
const isSubmitting = ref(false);
const errorMessage = ref('');

const handleSubmit = async () => {
  errorMessage.value = '';
  isSubmitting.value = true;

  try {
    if (isLogin.value) {
      await authStore.login(email.value, password.value);
    } else {
      await authStore.register(name.value, email.value, password.value);
    }
    router.push(route.query.redirect || '/');
  } catch (error) {
    errorMessage.value = typeof error === 'string' ? error : 'Unable to continue. Please try again.';
    console.error(error);
  } finally {
    isSubmitting.value = false;
  }
};

const toggleMode = () => {
  isLogin.value = !isLogin.value;
  errorMessage.value = '';
};
</script>

<style scoped>
.auth-layout {
  display: grid;
  grid-template-columns: minmax(320px, 520px);
  justify-content: center;
}

.auth-card {
  padding: 1.4rem;
}

.auth-card {
  display: grid;
  gap: 1rem;
}

.auth-card h2 {
  margin: 0;
}

form {
  display: grid;
  gap: 1rem;
}

label {
  display: block;
  margin-bottom: 0.45rem;
  color: var(--text-muted);
}

.toggle-copy {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin: 0;
}

.error-message {
  color: #ffc7c7;
  margin: 0;
}

@media (max-width: 900px) {
  .auth-layout {
    grid-template-columns: 1fr;
  }
}
</style>
