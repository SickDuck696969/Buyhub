<template>
  <div class="review-card card">
    <div class="review-header">
      <div>
        <strong class="review-user">{{ review.user_id?.name || 'Verified buyer' }}</strong>
        <p class="review-date">{{ formatDate(review.createdAt) }}</p>
      </div>
      <span class="review-rating">{{ renderStars(review.rating) }}</span>
    </div>
    <p class="review-comment">{{ review.comment }}</p>
    <div v-if="review.images && review.images.length" class="review-images">
      <img v-for="image in review.images" :key="image" :src="resolveMediaUrl(image)" alt="Review image" />
    </div>
  </div>
</template>

<script setup>
import { resolveMediaUrl } from '../utils/media';

defineProps({
  review: {
    type: Object,
    required: true,
  },
});

const renderStars = (rating) => '★'.repeat(Number(rating || 0)) + '☆'.repeat(5 - Number(rating || 0));
const formatDate = (value) => new Date(value).toLocaleDateString();
</script>

<style scoped>
.review-card {
  padding: 1rem;
}

.review-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.8rem;
}

.review-user {
  font-size: 1rem;
}

.review-date {
  margin: 0.2rem 0 0;
  color: var(--text-muted);
  font-size: 0.88rem;
}

.review-rating {
  color: var(--primary-color);
  font-weight: 800;
}

.review-comment {
  margin: 0;
  color: #f1f1f1;
}

.review-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.review-images img {
  max-width: 100px;
  max-height: 100px;
  border-radius: 12px;
  object-fit: cover;
}
</style>
