<template>
  <div class="review-card">
    <div class="review-header">
      <span class="review-user">{{ review.user.name }}</span>
      <span class="review-rating">{{ review.rating }} / 5</span>
    </div>
    <p class="review-comment">{{ review.comment }}</p>
    <div v-if="review.images && review.images.length" class="review-images">
      <img v-for="image in review.images" :key="image" :src="image" alt="Review image" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  review: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
.review-card {
  border: 1px solid #eee;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
}
.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-weight: bold;
}
.review-images {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}
.review-images img {
  max-width: 100px;
  max-height: 100px;
}
</style>
