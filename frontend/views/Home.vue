<template>
  <div class="home-page container">
    <div class="layout-grid">
      <!-- Sidebar for Categories -->
      <aside class="sidebar card">
        <h3 class="sidebar-title">Categories</h3>
        <ul class="category-list">
          <li 
            class="category-item" 
            :class="{ active: !selectedCategory }" 
            @click="selectCategory('')"
          >
            All Products
          </li>
          <li 
            v-for="cat in categories" 
            :key="cat._id" 
            class="category-item"
            :class="{ active: selectedCategory === cat._id }"
            @click="selectCategory(cat._id)"
          >
            {{ cat.name }}
          </li>
        </ul>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Top bar for sorting -->
        <div class="top-bar card">
          <span class="result-count">Showing {{ products.length }} products</span>
          <div class="sort-options">
            <label for="sort">Sort by: </label>
            <select id="sort" v-model="selectedSort" @change="fetchProducts">
              <option value="">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div v-if="loading" class="loading-state">
          <p>Loading products...</p>
        </div>
        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
        </div>
        <div v-else-if="products.length === 0" class="empty-state">
          <p>No products found.</p>
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
    </div>
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

    const { data } = await api.get('/products', { params });
    products.value = data;
  } catch (err) {
    error.value = 'Failed to fetch products';
  } finally {
    loading.value = false;
  }
};

const selectCategory = (categoryId) => {
  selectedCategory.value = categoryId;
  fetchProducts();
};

const addToCart = (product) => {
  cartStore.addToCart(product._id, 1);
};

onMounted(() => {
  fetchCategories();
  fetchProducts();
});
</script>

<style scoped>
.layout-grid {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 20px;
  align-items: start;
}

.sidebar {
  padding: 15px 0;
}

.sidebar-title {
  padding: 0 15px;
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
  color: var(--text-color);
}

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.category-item {
  padding: 10px 15px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  color: var(--text-color);
}

.category-item:hover {
  background: var(--background-color);
}

.category-item.active {
  color: var(--primary-color);
  font-weight: 500;
  background: rgba(238, 77, 45, 0.05); /* very light primary */
  border-left: 3px solid var(--primary-color);
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  margin-bottom: 20px;
}

.result-count {
  color: var(--text-muted);
}

.sort-options select {
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  outline: none;
  font-family: inherit;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 40px;
  background: var(--surface-color);
  border-radius: var(--border-radius);
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .layout-grid {
    grid-template-columns: 1fr;
  }
  .sidebar {
    margin-bottom: 15px;
  }
}
</style>
