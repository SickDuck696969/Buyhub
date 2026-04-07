<template>
  <div class="container section-grid product-detail-page">
    <div v-if="loading" class="status-box">Loading product details...</div>
    <div v-else-if="error" class="status-box error">{{ error }}</div>
    <template v-else-if="product">
      <section class="product-detail-grid">
        <div class="gallery card">
          <img :src="resolveMediaUrl(product.main_image, fallbackImage)" :alt="product.name" />
        </div>

        <div class="summary card">
          <span class="pill">{{ product.category_id?.name || 'Featured item' }}</span>
          <h1>{{ product.name }}</h1>
          <p class="description">{{ product.description }}</p>

          <div class="price-row">
            <strong>${{ Number(product.price || 0).toLocaleString() }}</strong>
            <span :class="['stock-state', stockClass]">{{ stockLabel }}</span>
          </div>

          <div class="info-grid">
            <div>
              <span class="muted">Brand</span>
              <strong>{{ product.brand_id?.name || 'Unknown brand' }}</strong>
            </div>
            <div>
              <span class="muted">Available stock</span>
              <strong>{{ inventory ? Math.max((inventory.stock_quantity || 0) - (inventory.reserved_quantity || 0), 0) : 'N/A' }}</strong>
            </div>
          </div>

          <div class="action-row">
            <label class="qty-picker">
              <span>Qty</span>
              <input v-model.number="quantity" type="number" min="1" />
            </label>
            <button :disabled="cartStore.loading" @click="handleAddToCart">
              {{ cartStore.loading ? 'Adding...' : 'Add to cart' }}
            </button>
          </div>

          <div v-if="actionMessage" :class="['status-box', actionMessageType]">{{ actionMessage }}</div>
        </div>
      </section>

      <section class="detail-panels">
        <div class="card panel">
          <div class="panel-header">
            <div>
              <span class="pill">Reviews</span>
              <h2>Customer feedback</h2>
            </div>
            <span class="muted">{{ reviews.length }} reviews</span>
          </div>

          <form v-if="authStore.isAuthenticated" class="review-form" @submit.prevent="submitReview">
            <div class="review-grid">
              <label>
                <span>Rating</span>
                <select v-model.number="reviewForm.rating">
                  <option :value="5">5 - Excellent</option>
                  <option :value="4">4 - Great</option>
                  <option :value="3">3 - Good</option>
                  <option :value="2">2 - Fair</option>
                  <option :value="1">1 - Poor</option>
                </select>
              </label>
            </div>
            <ImageUploader
              v-model="reviewForm.images"
              upload-endpoint="/upload/review"
              label="Review images"
              helper-text="Optional: upload photos from your device."
              :allow-url-input="false"
              multiple
              @uploading-change="isReviewImagesUploading = $event"
            />
            <label>
              <span>Comment</span>
              <textarea v-model="reviewForm.comment" placeholder="Share your experience with this product..." />
            </label>
            <button :disabled="submittingReview || isReviewImagesUploading">
              {{ isReviewImagesUploading ? 'Uploading images...' : (submittingReview ? 'Posting...' : 'Submit review') }}
            </button>
          </form>
          <div v-else class="status-box warning">
            Sign in to add this item to cart and leave a review after delivery.
          </div>

          <div v-if="reviewMessage" :class="['status-box', reviewMessageType]">{{ reviewMessage }}</div>

          <div v-if="reviews.length" class="review-list">
            <ReviewCard v-for="review in reviews" :key="review._id" :review="review" />
          </div>
          <div v-else class="status-box">No reviews yet for this product.</div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';
import ImageUploader from '../components/ImageUploader.vue';
import ReviewCard from '../components/ReviewCard.vue';
import { dedupeMediaSources, resolveMediaUrl, splitImageSources } from '../utils/media';

const fallbackImage = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();

const product = ref(null);
const inventory = ref(null);
const reviews = ref([]);
const loading = ref(true);
const error = ref('');
const quantity = ref(1);
const actionMessage = ref('');
const actionMessageType = ref('success');
const reviewMessage = ref('');
const reviewMessageType = ref('success');
const submittingReview = ref(false);
const isReviewImagesUploading = ref(false);
const reviewForm = ref({
  rating: 5,
  comment: '',
  images: [],
});

const stockClass = computed(() => {
  const available = inventory.value
    ? Math.max((inventory.value.stock_quantity || 0) - (inventory.value.reserved_quantity || 0), 0)
    : 0;
  return available > 0 ? 'in-stock' : 'out-stock';
});

const stockLabel = computed(() => stockClass.value === 'in-stock' ? 'In stock' : 'Out of stock');

const fetchProduct = async () => {
  loading.value = true;
  error.value = '';

  try {
    const [productResponse, inventoryResponse, reviewResponse] = await Promise.all([
      api.get(`/products/${route.params.id}`),
      api.get(`/inventory/${route.params.id}`).catch(() => ({ data: null })),
      api.get(`/reviews/product/${route.params.id}`).catch(() => ({ data: [] })),
    ]);

    product.value = productResponse.data;
    inventory.value = inventoryResponse.data;
    reviews.value = reviewResponse.data;
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load product details.';
  } finally {
    loading.value = false;
  }
};

const handleAddToCart = async () => {
  actionMessage.value = '';

  if (!authStore.isAuthenticated) {
    router.push({ name: 'LoginRegister', query: { redirect: route.fullPath } });
    return;
  }

  try {
    await cartStore.addToCart(route.params.id, Math.max(quantity.value, 1));
    actionMessageType.value = 'success';
    actionMessage.value = 'Product added to cart.';
  } catch (err) {
    actionMessageType.value = 'error';
    actionMessage.value = typeof err === 'string' ? err : 'Unable to add this product to cart.';
  }
};

const submitReview = async () => {
  reviewMessage.value = '';

  if (isReviewImagesUploading.value) {
    reviewMessageType.value = 'warning';
    reviewMessage.value = 'Please wait for review images to finish uploading.';
    return;
  }

  submittingReview.value = true;

  try {
    const normalizedImages = dedupeMediaSources(
      Array.isArray(reviewForm.value.images)
        ? reviewForm.value.images
        : splitImageSources(reviewForm.value.images)
    );

    const { data } = await api.post('/reviews', {
      productId: route.params.id,
      rating: reviewForm.value.rating,
      comment: reviewForm.value.comment,
      images: normalizedImages,
    });

    reviews.value = [data, ...reviews.value];
    reviewMessageType.value = 'success';
    reviewMessage.value = 'Review submitted successfully.';
    reviewForm.value = { rating: 5, comment: '', images: [] };
  } catch (err) {
    reviewMessageType.value = 'error';
    reviewMessage.value = err.response?.data?.message || 'Unable to submit review.';
  } finally {
    submittingReview.value = false;
  }
};

watch(() => route.params.id, fetchProduct);
onMounted(fetchProduct);
</script>

<style scoped>
.product-detail-grid {
  display: grid;
  grid-template-columns: minmax(320px, 1.05fr) minmax(320px, 1fr);
  gap: 1.2rem;
}

.gallery {
  overflow: hidden;
  min-height: 480px;
}

.gallery img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.summary {
  padding: 1.4rem;
  display: grid;
  gap: 1rem;
}

.summary h1 {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3.2rem);
  line-height: 0.98;
}

.description {
  margin: 0;
  color: var(--text-muted);
  font-size: 1rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.price-row strong {
  font-size: 2rem;
  color: var(--primary-color);
}

.stock-state {
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  font-weight: 800;
}

.stock-state.in-stock {
  background: rgba(57, 217, 138, 0.12);
  color: #98f2bf;
}

.stock-state.out-stock {
  background: rgba(255, 103, 103, 0.12);
  color: #ffc4c4;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.info-grid div {
  display: grid;
  gap: 0.25rem;
  padding: 0.95rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
}

.action-row {
  display: flex;
  gap: 1rem;
  align-items: end;
}

.qty-picker {
  max-width: 120px;
}

.qty-picker span,
.review-form span {
  display: block;
  margin-bottom: 0.45rem;
  color: var(--text-muted);
}

.panel {
  padding: 1.2rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-end;
  margin-bottom: 1rem;
}

.panel-header h2 {
  margin: 0.65rem 0 0;
}

.review-form {
  display: grid;
  gap: 1rem;
  margin-bottom: 1rem;
}

.review-grid {
  display: grid;
  grid-template-columns: minmax(0, 220px);
  gap: 1rem;
}

.review-list {
  display: grid;
  gap: 0.9rem;
  margin-top: 1rem;
}

@media (max-width: 900px) {
  .product-detail-grid,
  .review-grid {
    grid-template-columns: 1fr;
  }

  .gallery {
    min-height: 320px;
  }

  .action-row,
  .info-grid {
    grid-template-columns: 1fr;
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
