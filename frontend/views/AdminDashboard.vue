<template>
  <div class="container section-grid">
    <div class="page-heading">
      <div>
        <span class="pill">Admin</span>
        <h1 class="page-title">Admin</h1>
      </div>
    </div>

    <div v-if="message" :class="['status-box', messageType]">{{ message }}</div>

    <section class="admin-grid">
      <div class="card admin-panel">
        <span class="pill">Create product</span>
        <h2>Create product</h2>
        <form class="form-grid" @submit.prevent="submitProduct">
          <input v-model="productForm.name" type="text" placeholder="Product name" required />
          <input v-model.number="productForm.price" type="number" min="0" placeholder="Price" required />
          <textarea v-model="productForm.description" placeholder="Description" required />
          <input v-model="productForm.main_image" type="text" placeholder="Main image URL or uploaded path" required />
          <select v-model="productForm.category_id" required>
            <option value="" disabled>Select category</option>
            <option v-for="category in categories" :key="category._id" :value="category._id">
              {{ category.name }}
            </option>
          </select>
          <select v-model="productForm.brand_id" required>
            <option value="" disabled>Select brand</option>
            <option v-for="brand in brands" :key="brand._id" :value="brand._id">
              {{ brand.name }}
            </option>
          </select>
          <button :disabled="submittingProduct">{{ submittingProduct ? 'Saving...' : 'Create product' }}</button>
        </form>
      </div>

      <div class="card admin-panel">
        <span class="pill">Categories</span>
        <h2>Categories</h2>
        <form class="form-grid compact" @submit.prevent="createCategory">
          <input v-model="categoryForm.name" type="text" placeholder="Category name" required />
          <input v-model="categoryForm.description" type="text" placeholder="Description" />
          <button :disabled="submittingCategory">{{ submittingCategory ? 'Saving...' : 'Add category' }}</button>
        </form>
        <div class="tag-list">
          <div v-for="category in categories" :key="category._id" class="tag-card">
            <div>
              <strong>{{ category.name }}</strong>
              <span>{{ category.description || 'No description' }}</span>
            </div>
            <button class="button-danger" @click="removeCategory(category._id)">Delete</button>
          </div>
        </div>
      </div>
    </section>

    <section class="admin-grid">
      <div class="card admin-panel">
        <span class="pill">Brands</span>
        <h2>Brands</h2>
        <form class="form-grid compact" @submit.prevent="createBrand">
          <input v-model="brandForm.name" type="text" placeholder="Brand name" required />
          <input v-model="brandForm.description" type="text" placeholder="Description" />
          <button :disabled="submittingBrand">{{ submittingBrand ? 'Saving...' : 'Add brand' }}</button>
        </form>
        <div class="tag-list">
          <div v-for="brand in brands" :key="brand._id" class="tag-card">
            <div>
              <strong>{{ brand.name }}</strong>
              <span>{{ brand.description || 'No description' }}</span>
            </div>
            <button class="button-danger" @click="removeBrand(brand._id)">Delete</button>
          </div>
        </div>
      </div>

      <div class="card admin-panel">
        <span class="pill">Inventory</span>
        <h2>Inventory</h2>
        <div class="inventory-list">
          <form
            v-for="entry in inventory"
            :key="entry._id || entry.product_id?._id"
            class="inventory-row"
            @submit.prevent="saveInventory(entry)"
          >
            <div>
              <strong>{{ entry.product_id?.name || entry.product_id }}</strong>
              <span class="muted">Product ID: {{ entry.product_id?._id || entry.product_id }}</span>
            </div>
            <input v-model.number="entry.stock_quantity" type="number" min="0" placeholder="Stock" />
            <input v-model.number="entry.reserved_quantity" type="number" min="0" placeholder="Reserved" />
            <button>Save</button>
          </form>
        </div>
      </div>
    </section>

    <section class="admin-grid">
      <div class="card admin-panel">
        <span class="pill">Products</span>
        <h2>Products</h2>
        <div class="product-admin-list">
          <div v-for="product in products" :key="product._id" class="product-admin-card">
            <div>
              <strong>{{ product.name }}</strong>
              <span>{{ product.category_id?.name || 'No category' }} • {{ product.brand_id?.name || 'No brand' }}</span>
            </div>
            <div class="product-admin-actions">
              <strong>${{ Number(product.price || 0).toLocaleString() }}</strong>
              <button class="button-danger" @click="deleteProduct(product._id)">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import api from '../services/api';

const categories = ref([]);
const brands = ref([]);
const inventory = ref([]);
const products = ref([]);
const message = ref('');
const messageType = ref('success');
const submittingProduct = ref(false);
const submittingCategory = ref(false);
const submittingBrand = ref(false);

const categoryForm = ref({
  name: '',
  description: '',
});

const brandForm = ref({
  name: '',
  description: '',
});

const productForm = ref({
  name: '',
  price: '',
  description: '',
  main_image: '',
  category_id: '',
  brand_id: '',
});

const setMessage = (type, text) => {
  messageType.value = type;
  message.value = text;
};

const fetchDashboardData = async () => {
  try {
    const [categoriesRes, brandsRes, inventoryRes, productsRes] = await Promise.all([
      api.get('/categories'),
      api.get('/brands'),
      api.get('/inventory'),
      api.get('/products'),
    ]);

    categories.value = categoriesRes.data;
    brands.value = brandsRes.data;
    inventory.value = inventoryRes.data;
    products.value = productsRes.data;
  } catch (err) {
    setMessage('error', err.response?.data?.message || 'Failed to load admin dashboard data.');
  }
};

const submitProduct = async () => {
  submittingProduct.value = true;

  try {
    await api.post('/products', {
      ...productForm.value,
      images: productForm.value.main_image ? [productForm.value.main_image] : [],
    });
    setMessage('success', 'Product created successfully.');
    productForm.value = {
      name: '',
      price: '',
      description: '',
      main_image: '',
      category_id: '',
      brand_id: '',
    };
    await fetchDashboardData();
  } catch (err) {
    setMessage('error', err.response?.data?.message || 'Unable to create product.');
  } finally {
    submittingProduct.value = false;
  }
};

const createCategory = async () => {
  submittingCategory.value = true;

  try {
    await api.post('/categories', categoryForm.value);
    setMessage('success', 'Category created successfully.');
    categoryForm.value = { name: '', description: '' };
    await fetchDashboardData();
  } catch (err) {
    setMessage('error', err.response?.data?.message || 'Unable to create category.');
  } finally {
    submittingCategory.value = false;
  }
};

const createBrand = async () => {
  submittingBrand.value = true;

  try {
    await api.post('/brands', brandForm.value);
    setMessage('success', 'Brand created successfully.');
    brandForm.value = { name: '', description: '' };
    await fetchDashboardData();
  } catch (err) {
    setMessage('error', err.response?.data?.message || 'Unable to create brand.');
  } finally {
    submittingBrand.value = false;
  }
};

const removeCategory = async (categoryId) => {
  try {
    await api.delete(`/categories/${categoryId}`);
    setMessage('success', 'Category deleted.');
    await fetchDashboardData();
  } catch (err) {
    setMessage('error', err.response?.data?.message || 'Unable to delete category.');
  }
};

const removeBrand = async (brandId) => {
  try {
    await api.delete(`/brands/${brandId}`);
    setMessage('success', 'Brand deleted.');
    await fetchDashboardData();
  } catch (err) {
    setMessage('error', err.response?.data?.message || 'Unable to delete brand.');
  }
};

const saveInventory = async (entry) => {
  try {
    const productId = entry.product_id?._id || entry.product_id;
    await api.put(`/inventory/${productId}`, {
      stock_quantity: Number(entry.stock_quantity || 0),
      reserved_quantity: Number(entry.reserved_quantity || 0),
    });
    setMessage('success', 'Inventory updated.');
    await fetchDashboardData();
  } catch (err) {
    setMessage('error', err.response?.data?.message || 'Unable to update inventory.');
  }
};

const deleteProduct = async (productId) => {
  try {
    await api.delete(`/products/${productId}`);
    setMessage('success', 'Product removed.');
    await fetchDashboardData();
  } catch (err) {
    setMessage('error', err.response?.data?.message || 'Unable to delete product.');
  }
};

onMounted(fetchDashboardData);
</script>

<style scoped>
.admin-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.2rem;
}

.admin-panel {
  padding: 1.25rem;
  display: grid;
  gap: 1rem;
}

.admin-panel h2 {
  margin: 0;
}

.form-grid {
  display: grid;
  gap: 0.8rem;
}

.form-grid.compact {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.tag-list,
.inventory-list,
.product-admin-list {
  display: grid;
  gap: 0.8rem;
}

.tag-card,
.product-admin-card,
.inventory-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.8rem;
  align-items: center;
  padding: 0.95rem 1rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
}

.tag-card span,
.product-admin-card span {
  display: block;
  margin-top: 0.2rem;
  color: var(--text-muted);
}

.inventory-row {
  grid-template-columns: 1.5fr 0.6fr 0.6fr auto;
}

.product-admin-actions {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

@media (max-width: 980px) {
  .admin-grid,
  .form-grid.compact,
  .inventory-row,
  .tag-card,
  .product-admin-card {
    grid-template-columns: 1fr;
  }
}
</style>
