<template>
  <div class="home-page container section-grid">
    <section class="showcase-grid">
      <aside class="filters card">
        <div class="filters-header">
          <span class="pill">Browse</span>
          <h2>Products</h2>
        </div>

        <label class="field-group">
          <span>Search products</span>
          <input v-model="searchTerm" type="text" placeholder="Search by product name..." @keyup.enter="fetchProducts" />
        </label>

        <label class="field-group">
          <span>Sort</span>
          <select v-model="selectedSort" @change="fetchProducts">
            <option value="">Newest arrivals</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </label>

        <div class="categories-block">
          <span class="field-label">Categories</span>
          <button class="category-button" :class="{ active: !selectedCategory }" @click="selectCategory('')">
            All products
          </button>
          <button
            v-for="cat in categories"
            :key="cat._id"
            class="category-button"
            :class="{ active: selectedCategory === cat._id }"
            @click="selectCategory(cat._id)"
          >
            {{ cat.name }}
          </button>
        </div>

        <button @click="fetchProducts">Refresh catalog</button>
      </aside>

      <main class="catalog">
        <div class="page-heading">
          <div>
            <span class="pill">Live inventory</span>
            <h2 class="page-title">Catalog</h2>
          </div>
          <div class="catalog-stats">
            <div class="card stat-card">
              <strong>{{ categories.length }}</strong>
              <span>categories</span>
            </div>
            <div class="card stat-card">
              <strong>{{ products.length }}</strong>
              <span>results</span>
            </div>
          </div>
        </div>

        <div v-if="loading" class="status-box">Loading products...</div>
        <div v-else-if="error" class="status-box error">{{ error }}</div>
        <div v-else-if="products.length === 0" class="status-box warning">
          No products matched your current filters.
        </div>
        <div v-else class="product-grid">
          <ProductCard
            v-for="product in products"
            :key="product._id"
            :product="product"
            @add-to-cart="addToCart(product)"
          />
        </div>
      </main>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import ProductCard from '../components/ProductCard.vue';
import { useCartStore } from '../stores/cart';

const products = ref([]);
const categories = ref([]);
const loading = ref(true);
const error = ref(null);
const cartStore = useCartStore();

const selectedCategory = ref('');
const selectedSort = ref('');
const searchTerm = ref('');

const fetchCategories = async () => {
  try {
    const { data } = await api.get('/categories');
    categories.value = data;
  } catch (err) {
    console.error('Failed to fetch categories', err);
  }
};

const fetchProducts = async () => {
  loading.value = true;
  error.value = null;
  try {
    const params = {};
    if (selectedCategory.value) params.category = selectedCategory.value;
    if (selectedSort.value) params.sort = selectedSort.value;
    if (searchTerm.value.trim()) params.search = searchTerm.value.trim();

    const { data } = await api.get('/products', { params });
    products.value = data;
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to fetch products';
  } finally {
    loading.value = false;
  }
};

const selectCategory = (categoryId) => {
  selectedCategory.value = categoryId;
  fetchProducts();
};

const addToCart = async (product) => {
  try {
    await cartStore.addToCart(product._id, 1);
  } catch (err) {
    error.value = typeof err === 'string' ? err : 'Unable to add product to cart.';
  }
};

onMounted(() => {
  fetchCategories();
  fetchProducts();
});
</script>

<style scoped>
.showcase-grid {
  display: grid;
  grid-template-columns: minmax(280px, 320px) 1fr;
  gap: 1.25rem;
}

.filters {
  padding: 1.2rem;
  position: sticky;
  top: 106px;
  display: grid;
  gap: 1rem;
  align-self: start;
}

.filters-header h2 {
  margin: 0.7rem 0 0;
}

.field-group {
  display: grid;
  gap: 0.45rem;
}

.field-group span,
.field-label {
  color: var(--text-muted);
  font-size: 0.92rem;
  font-weight: 700;
}

.categories-block {
  display: grid;
  gap: 0.65rem;
}

.category-button {
  justify-content: flex-start;
  width: 100%;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-color);
  padding-inline: 1rem;
}

.category-button.active {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-strong));
  color: #0c0c0c;
}

.catalog-stats {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.stat-card {
  min-width: 120px;
  padding: 1rem 1.1rem;
  display: grid;
  gap: 0.15rem;
}

.stat-card strong {
  font-size: 1.5rem;
}

.stat-card span {
  color: var(--text-muted);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}

@media (max-width: 768px) {
  .showcase-grid {
    grid-template-columns: 1fr;
  }

  .filters {
    position: static;
  }
}
</style>
