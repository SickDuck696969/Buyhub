<template>
  <div id="app">
    <header class="app-header">
      <div class="container header-content">
        <div class="logo">
          <router-link to="/">
            <span class="logo-buy">Buy</span><span class="logo-hub">hub</span>
          </router-link>
        </div>
        <nav class="nav-links">
          <router-link to="/">Home</router-link>
          <router-link to="/cart">Cart</router-link>
          <router-link to="/login">Login</router-link>
        </nav>
      </div>
    </header>
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
</script>

<style>
@import './assets/main.css';

.app-header {
  background-color: var(--background-color);
  color: white;
  padding: 15px 0;
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo a {
  display: inline-flex;
  align-items: center;
  font-size: 28px;
  font-weight: 700;
  text-decoration: none;
  letter-spacing: -0.5px;
}

.logo-buy {
  color: white;
}

.logo-hub {
  background-color: var(--primary-color);
  color: black;
  padding: 0 6px;
  margin-left: 2px;
  border-radius: 4px;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-links a {
  color: var(--text-color);
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}

.nav-links a:hover {
  color: var(--primary-color);
}

.app-main {
  min-height: calc(100vh - 60px);
  padding: 20px 0;
}
</style>