<template>
  <div class="login-register">
    <h1>{{ isLogin ? 'Login' : 'Register' }}</h1>
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
      <button type="submit">{{ isLogin ? 'Login' : 'Register' }}</button>
    </form>
    <p>
      {{ isLogin ? 'Need an account?' : 'Already have an account?' }}
      <button @click="isLogin = !isLogin">
        {{ isLogin ? 'Register' : 'Login' }}
      </button>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const isLogin = ref(true);
const name = ref('');
const email = ref('');
const password = ref('');

const handleSubmit = async () => {
  try {
    if (isLogin.value) {
      await authStore.login(email.value, password.value);
    } else {
      await authStore.register(name.value, email.value, password.value);
    }
    router.push('/');
  } catch (error) {
    console.error(error);
    // You can add user-facing error messages here
  }
};
</script>

<style scoped>
.login-register {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
}
form div {
  margin-bottom: 1rem;
}
</style>
