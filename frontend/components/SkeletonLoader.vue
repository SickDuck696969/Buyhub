<template>
  <div class="skeleton-loader"></div>
</template>

<style scoped>
.skeleton-loader {
  background-color: #f0f0f0;
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}
</style>
