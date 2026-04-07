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
          <ImageUploader
            v-model="productForm.main_image"
            upload-endpoint="/upload/product"
            label="Main image"
            helper-text="Paste a URL or upload one image from your computer."
            placeholder="Paste an image URL or uploaded path"
            required
          />
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
            <template v-if="editingCategoryId === category._id">
              <div class="inline-edit-grid">
                <input v-model="categoryEditForm.name" type="text" placeholder="Category name" />
                <input v-model="categoryEditForm.description" type="text" placeholder="Description" />
              </div>
              <div class="action-pair">
                <button @click="updateCategory(category._id)">Save</button>
                <button class="button-secondary" @click="cancelCategoryEdit">Cancel</button>
                <button class="button-danger" @click="removeCategory(category._id)">Delete</button>
              </div>
            </template>
            <template v-else>
              <div>
                <strong>{{ category.name }}</strong>
                <span>{{ category.description || 'No description' }}</span>
              </div>
              <div class="action-pair">
                <button class="button-secondary" @click="startCategoryEdit(category)">Edit</button>
                <button class="button-danger" @click="removeCategory(category._id)">Delete</button>
              </div>
            </template>
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
            <template v-if="editingBrandId === brand._id">
              <div class="inline-edit-grid">
                <input v-model="brandEditForm.name" type="text" placeholder="Brand name" />
                <input v-model="brandEditForm.description" type="text" placeholder="Description" />
              </div>
              <div class="action-pair">
                <button @click="updateBrand(brand._id)">Save</button>
                <button class="button-secondary" @click="cancelBrandEdit">Cancel</button>
                <button class="button-danger" @click="removeBrand(brand._id)">Delete</button>
              </div>
            </template>
            <template v-else>
              <div>
                <strong>{{ brand.name }}</strong>
                <span>{{ brand.description || 'No description' }}</span>
              </div>
              <div class="action-pair">
                <button class="button-secondary" @click="startBrandEdit(brand)">Edit</button>
                <button class="button-danger" @click="removeBrand(brand._id)">Delete</button>
              </div>
            </template>
          </div>
        </div>
      </div>

      <div class="card admin-panel">
        <span class="pill">Inventory</span>
        <h2>Inventory</h2>
        <div class="inventory-list">
          <div class="inventory-row inventory-header">
            <div><strong>Product Info</strong></div>
            <div><strong>Stock</strong></div>
            <div><strong>Reserved</strong></div>
            <div style="text-align: center;"><strong>Sold</strong></div>
            <div><strong>Action</strong></div>
          </div>
          
          <form
            v-for="entry in inventoryRows"
            :key="entry.product_id"
            class="inventory-row"
            @submit.prevent="saveInventory(entry)"
          >
            <div>
              <strong>{{ entry.product_name }}</strong>
              <br/>
              <span :class="['muted', { 'text-danger': entry.stock_quantity - entry.reserved_quantity < 0 }]">
                Available: {{ entry.stock_quantity - entry.reserved_quantity }}
              </span>
            </div>
            <input v-model.number="entry.stock_quantity" type="number" min="0" placeholder="Stock" title="Tổng kho (Stock)" />
            <input v-model.number="entry.reserved_quantity" type="number" min="0" placeholder="Reserved" title="Đang giữ/Đặt cọc (Reserved)" />
            <div class="sold-col">
              {{ entry.sold_quantity }}
            </div>
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
            <template v-if="editingProductId === product._id">
              <div class="product-edit-grid">
                <input v-model="productEditForm.name" type="text" placeholder="Product name" />
                <input v-model.number="productEditForm.price" type="number" min="0" placeholder="Price" />
                <ImageUploader
                  v-model="productEditForm.main_image"
                  upload-endpoint="/upload/product"
                  label="Main image"
                  helper-text="Paste a URL or replace it with a newly uploaded image."
                  placeholder="Paste an image URL or uploaded path"
                  required
                />
                <select v-model="productEditForm.category_id">
                  <option v-for="category in categories" :key="category._id" :value="category._id">
                    {{ category.name }}
                  </option>
                </select>
                <select v-model="productEditForm.brand_id">
                  <option v-for="brand in brands" :key="brand._id" :value="brand._id">
                    {{ brand.name }}
                  </option>
                </select>
                <textarea v-model="productEditForm.description" placeholder="Description" />
              </div>
              <div class="action-pair">
                <button @click="updateProduct(product._id)">Save</button>
                <button class="button-secondary" @click="cancelProductEdit">Cancel</button>
                <button class="button-danger" @click="deleteProduct(product._id)">Delete</button>
              </div>
            </template>
            <template v-else>
              <div>
                <strong>{{ product.name }}</strong>
                <span>{{ product.category_id?.name || 'No category' }} • {{ product.brand_id?.name || 'No brand' }}</span>
              </div>
              <div class="product-admin-actions">
                <strong>${{ Number(product.price || 0).toLocaleString() }}</strong>
                <button class="button-secondary" @click="startProductEdit(product)">Edit</button>
                <button class="button-danger" @click="deleteProduct(product._id)">Delete</button>
              </div>
            </template>
          </div>
        </div>
      </div>

      <div class="card admin-panel">
        <span class="pill">Payments</span>
        <h2>Payments</h2>
        <div class="payment-list">
          <form
            v-for="payment in payments"
            :key="payment._id"
            class="payment-row"
            @submit.prevent="savePaymentStatus(payment)"
          >
            <div>
              <strong>Order {{ payment.order_id?._id?.slice(-6)?.toUpperCase() || 'N/A' }}</strong>
              <span>${{ Number(payment.amount || 0).toLocaleString() }} • {{ payment.status }}</span>
            </div>
            <select v-model="payment.status">
              <option value="pending">pending</option>
              <option value="completed">completed</option>
              <option value="failed">failed</option>
            </select>
            <input v-model="payment.transaction_id" type="text" placeholder="Transaction ID" />
            <button>Save</button>
          </form>
        </div>
      </div>
      <div class="card admin-panel">
    <span class="pill">Orders</span>
    <h2>Orders Management</h2>
    <div class="order-list">
        <div v-for="order in orders" :key="order._id" class="order-row">
            <div class="order-info">
                <strong>Order #{{ order._id?.slice(-8)?.toUpperCase() || 'N/A' }}</strong>
                <span>{{ order.user_id || 'Unknown' }} ({{ order.user_id?.email || 'no email' }}) • ${{ Number(order.total_amount || 0).toLocaleString() }}</span>
                <!-- Hiển thị items - QUAN TRỌNG -->
                <div class="order-items">
                    <div v-for="item in order.items" :key="item._id" class="order-item">
                        <div class="item-info">
                            <img v-if="item.image" :src="resolveMediaUrl(item.image)" class="item-image" alt="item.name">
                            <div>
                                <div class="item-name">{{ item.name }}</div>
                                <div class="item-detail">Quantity: {{ item.quantity }} × ${{ Number(item.price).toLocaleString() }}</div>
                            </div>
                        </div>
                        <div class="item-total">
                            ${{ Number(item.price * item.quantity).toLocaleString() }}
                        </div>
                    </div>
                </div>
                
                <span class="order-address">
                    {{ order.shipping_address && order.shipping_address !== 'placeholder' 
                        ? order.shipping_address 
                        : 'No shipping address' 
                    }}
                </span>
                <span class="order-date">{{ new Date(order.createdAt).toLocaleString() }}</span>
            </div>
            <div class="order-actions">
                <select 
                    v-model="order.status" 
                    @change="updateOrderStatus(order._id, order.status)"
                    :disabled="updatingOrderId === order._id"
                >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipping">Shipping</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>
        </div>
    </div>
</div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import ImageUploader from '../components/ImageUploader.vue';
import api from '../services/api';
import { resolveMediaUrl } from '../utils/media';

const categories = ref([]);
const brands = ref([]);
const inventory = ref([]);
const products = ref([]);
const payments = ref([]);
const message = ref('');
const messageType = ref('success');
const submittingProduct = ref(false);
const submittingCategory = ref(false);
const submittingBrand = ref(false);
const editingCategoryId = ref('');
const editingBrandId = ref('');
const editingProductId = ref('');
const orders = ref([]);
const editingOrderId = ref('');
const orderStatusForm = ref({});

const categoryForm = ref({
  name: '',
  description: '',
});

const brandForm = ref({
  name: '',
  description: '',
});

const categoryEditForm = ref({
  name: '',
  description: '',
});

const brandEditForm = ref({
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

const productEditForm = ref({
  name: '',
  price: '',
  description: '',
  main_image: '',
  category_id: '',
  brand_id: '',
});

const inventoryRows = computed(() => {
  const inventoryMap = new Map(
    inventory.value.map((entry) => {
      const productId = entry.product_id?._id || entry.product_id;
      return [productId, entry];
    })
  );

  return products.value.map((product) => {
    const existing = inventoryMap.get(product._id);

    return {
      _id: existing?._id || '',
      product_id: product._id,
      product_name: product.name,
      stock_quantity: existing?.stock_quantity ?? 0,
      reserved_quantity: existing?.reserved_quantity ?? 0,
      sold_quantity: existing?.sold_quantity ?? 0,
    };
  });
});

const setMessage = (type, text) => {
  messageType.value = type;
  message.value = text;
};

const fetchDashboardData = async () => {
    try {
        const [categoriesRes, brandsRes, inventoryRes, productsRes, paymentsRes, ordersRes] = await Promise.all([
            api.get('/categories'),
            api.get('/brands'),
            api.get('/inventory'),
            api.get('/products'),
            api.get('/payments'),
            api.get('/orders/admin/all'),  // thêm vào
        ]);

        categories.value = categoriesRes.data;
        brands.value = brandsRes.data;
        inventory.value = inventoryRes.data;
        products.value = productsRes.data;
        payments.value = paymentsRes.data;
        orders.value = ordersRes.data;  // thêm vào
    } catch (err) {
        setMessage('error', err.response?.data?.message || 'Failed to load admin dashboard data.');
    }
};

const updateOrderStatus = async (orderId, newStatus) => {
    try {
        await api.put(`/orders/${orderId}/status`, { status: newStatus });
        setMessage('success', 'Order status updated successfully.');
        await fetchDashboardData();
    } catch (err) {
        setMessage('error', err.response?.data?.message || 'Unable to update order status.');
    }
};

const fetchOrders = async () => {
    try {
        const response = await api.get('/orders/admin/all');
        orders.value = response.data;
    } catch (err) {
        setMessage('error', err.response?.data?.message || 'Failed to load orders.');
    }
};

// const fetchDashboardData = async () => {
//   try {
//     const [categoriesRes, brandsRes, inventoryRes, productsRes, paymentsRes] = await Promise.all([
//       api.get('/categories'),
//       api.get('/brands'),
//       api.get('/inventory'),
//       api.get('/products'),
//       api.get('/payments'),
//     ]);

//     categories.value = categoriesRes.data;
//     brands.value = brandsRes.data;
//     inventory.value = inventoryRes.data;
//     products.value = productsRes.data;
//     payments.value = paymentsRes.data;
//   } catch (err) {
//     setMessage('error', err.response?.data?.message || 'Failed to load admin dashboard data.');
//   }
// };

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

const startCategoryEdit = (category) => {
  editingCategoryId.value = category._id;
  categoryEditForm.value = {
    name: category.name || '',
    description: category.description || '',
  };
};

const cancelCategoryEdit = () => {
  editingCategoryId.value = '';
  categoryEditForm.value = { name: '', description: '' };
};

const updateCategory = async (categoryId) => {
  try {
    await api.put(`/categories/${categoryId}`, categoryEditForm.value);
    setMessage('success', 'Category updated.');
    cancelCategoryEdit();
    await fetchDashboardData();
  } catch (err) {
    setMessage('error', err.response?.data?.message || 'Unable to update category.');
  }
};

const startBrandEdit = (brand) => {
  editingBrandId.value = brand._id;
  brandEditForm.value = {
    name: brand.name || '',
    description: brand.description || '',
  };
};

const cancelBrandEdit = () => {
  editingBrandId.value = '';
  brandEditForm.value = { name: '', description: '' };
};

const updateBrand = async (brandId) => {
  try {
    await api.put(`/brands/${brandId}`, brandEditForm.value);
    setMessage('success', 'Brand updated.');
    cancelBrandEdit();
    await fetchDashboardData();
  } catch (err) {
    setMessage('error', err.response?.data?.message || 'Unable to update brand.');
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
    await api.put(`/inventory/${entry.product_id}`, {
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

const startProductEdit = (product) => {
  editingProductId.value = product._id;
  productEditForm.value = {
    name: product.name || '',
    price: product.price || '',
    description: product.description || '',
    main_image: product.main_image || '',
    category_id: product.category_id?._id || product.category_id || '',
    brand_id: product.brand_id?._id || product.brand_id || '',
  };
};

const cancelProductEdit = () => {
  editingProductId.value = '';
  productEditForm.value = {
    name: '',
    price: '',
    description: '',
    main_image: '',
    category_id: '',
    brand_id: '',
  };
};

const updateProduct = async (productId) => {
  try {
    await api.put(`/products/${productId}`, {
      ...productEditForm.value,
      images: productEditForm.value.main_image ? [productEditForm.value.main_image] : [],
    });
    setMessage('success', 'Product updated.');
    cancelProductEdit();
    await fetchDashboardData();
  } catch (err) {
    setMessage('error', err.response?.data?.message || 'Unable to update product.');
  }
};

const savePaymentStatus = async (payment) => {
  try {
    await api.put(`/payments/${payment._id}/status`, {
      status: payment.status,
      transaction_id: payment.transaction_id || '',
    });
    setMessage('success', 'Payment updated.');
    await fetchDashboardData();
  } catch (err) {
    setMessage('error', err.response?.data?.message || 'Unable to update payment.');
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
.product-admin-list,
.payment-list {
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

.inline-edit-grid,
.product-edit-grid {
  display: grid;
  gap: 0.7rem;
}

/* Updated inventory grid columns */
.inventory-row {
  grid-template-columns: 1.5fr 0.6fr 0.6fr 0.4fr auto;
}

/* New classes for inventory */
.inventory-header {
  background: transparent !important;
  padding-bottom: 0.2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0;
  margin-bottom: 0.5rem;
}

.sold-col {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: var(--text-muted);
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  height: 100%;
}

.text-danger {
  color: #ff4d4f !important;
  font-weight: bold;
}

.payment-row {
  display: grid;
  grid-template-columns: 1.3fr 0.6fr 0.9fr auto;
  gap: 0.8rem;
  align-items: center;
  padding: 0.95rem 1rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
}

.payment-row span {
  display: block;
  margin-top: 0.2rem;
  color: var(--text-muted);
}

.product-admin-actions {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.action-pair {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

@media (max-width: 980px) {
  .admin-grid,
  .form-grid.compact,
  .inventory-row,
  .payment-row,
  .tag-card,
  .product-admin-card {
    grid-template-columns: 1fr;
  }
}
.order-list {
    display: grid;
    gap: 0.8rem;
}

.order-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.8rem;
    align-items: center;
    padding: 0.95rem 1rem;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.04);
}

.order-info {
    display: grid;
    gap: 0.3rem;
}

.order-info span {
    display: block;
    color: var(--text-muted);
    font-size: 0.85rem;
}

.order-address {
    font-size: 0.8rem;
    color: #888;
}

.order-date {
    font-size: 0.75rem;
    color: #666;
}

.order-actions select {
    padding: 0.5rem;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    cursor: pointer;
}

.order-actions select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

@media (max-width: 980px) {
    .order-row {
        grid-template-columns: 1fr;
    }
}

.order-items {
    margin: 0.5rem 0;
    padding: 0.5rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
}

.order-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.order-item:last-child {
    border-bottom: none;
}

.item-info {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.item-image {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: 4px;
}

.item-name {
    font-weight: 500;
    font-size: 0.9rem;
}

.item-detail {
    font-size: 0.8rem;
    color: var(--text-muted);
}

.item-total {
    font-weight: bold;
    color: #4caf50;
}

</style>
