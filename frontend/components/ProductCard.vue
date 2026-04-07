<template>
  <div class="product-card card">
    <router-link :to="`/product/${product._id}`" class="card-link">
      <div class="image-wrapper">
        <img :src="resolveMediaUrl(product.main_image, fallbackImage)" :alt="product.name" class="product-image" />
      </div>
      <div class="product-info">
        <div class="product-meta">
          <span class="pill">{{ product.category_id?.name || 'Featured' }}</span>
        </div>
        <h3 class="product-name">{{ product.name }}</h3>
        <p class="product-description">{{ product.description || 'No description available yet.' }}</p>
        <div class="product-footer">
          <span class="product-price">${{ formatPrice(product.price) }}</span>
        </div>
      </div>
    </router-link>
    <div class="product-actions">
      <button class="add-btn" @click="addToCart">Add to cart</button>
      <router-link :to="`/product/${product._id}`" class="details-link">View details</router-link>
    </div>
  </div>
</template>

<script setup>
import { resolveMediaUrl } from '../utils/media';

const fallbackImage = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80';

defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['add-to-cart']);

const addToCart = () => {
  emit('add-to-cart');
};

const formatPrice = (value) => Number(value || 0).toLocaleString();
</script>

<style scoped>
.product-card {
  display: grid;
  grid-template-rows: 1fr auto;
  overflow: hidden;
  min-height: 100%;
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  border-color: rgba(249, 168, 38, 0.28);
  box-shadow: var(--shadow-hard);
}

.card-link {
  display: grid;
}

.image-wrapper {
  width: 100%;
  padding-top: 72%;
  position: relative;
  background:
    linear-gradient(160deg, rgba(249, 168, 38, 0.25), rgba(255, 255, 255, 0.03)),
    #111;
}

.product-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 1rem;
  display: grid;
  gap: 0.65rem;
}

.product-meta {
  display: flex;
  justify-content: flex-start;
}

.product-name {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-color);
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-description {
  margin: 0;
  min-height: 3.1em;
  font-size: 0.92rem;
  color: var(--text-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 1.18rem;
  font-weight: 900;
  color: var(--primary-color);
}

.product-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0 1rem 1rem;
}

.add-btn {
  flex: 1;
}

.details-link {
  color: var(--text-muted);
  font-size: 0.92rem;
  font-weight: 700;
}
</style>
