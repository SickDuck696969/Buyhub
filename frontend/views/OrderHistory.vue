<template>
  <div class="container section-grid">
    <div class="page-heading">
      <div>
        <span class="pill">Orders</span>
      </div>
    </div>

    <div v-if="loading" class="status-box">Loading orders...</div>
    <div v-else-if="error" class="status-box error">{{ error }}</div>
    <div v-else-if="!orders.length" class="status-box warning">
      No orders yet. Once checkout succeeds, your orders will appear here.
    </div>
    <div v-else class="orders-list">
      <article v-for="order in orders" :key="order._id" class="card order-card">
        <div class="order-head">
          <div>
            <span class="pill">{{ order.status }}</span>
            <h2>Order {{ order._id.slice(-6).toUpperCase() }}</h2>
            <p class="muted">{{ formatDate(order.createdAt) }}</p>
          </div>
          <strong class="order-total">${{ Number(order.total_amount || 0).toLocaleString() }}</strong>
        </div>
        <div class="payment-row">
          <span class="muted">Payment</span>
          <strong :class="['payment-status', `payment-${order.payment?.status || 'none'}`]">
            {{ order.payment?.status || 'not created' }}
          </strong>
        </div>
        <p class="shipping">{{ order.shipping_address }}</p>
        <div class="order-items">
          <div v-for="item in order.items || []" :key="item._id" class="order-item">
            <span>{{ item.name }}</span>
            <span>x{{ item.quantity }}</span>
            <strong>${{ Number((item.price || 0) * item.quantity).toLocaleString() }}</strong>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import api from '../services/api';

const orders = ref([]);
const loading = ref(true);
const error = ref('');

const fetchOrders = async () => {
  loading.value = true;
  error.value = '';

  try {
    const { data } = await api.get('/orders');
    const ordersWithPayments = await Promise.all(
      data.map(async (order) => {
        try {
          const paymentResponse = await api.get(`/payments/order/${order._id}`);
          return {
            ...order,
            payment: paymentResponse.data,
          };
        } catch (error) {
          return {
            ...order,
            payment: null,
          };
        }
      })
    );

    orders.value = ordersWithPayments;
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to fetch orders.';
  } finally {
    loading.value = false;
  }
};

const formatDate = (value) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

onMounted(fetchOrders);
</script>

<style scoped>
.orders-list {
  display: grid;
  gap: 1rem;
}

.order-card {
  padding: 1.2rem;
  display: grid;
  gap: 0.9rem;
}

.order-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.order-head h2 {
  margin: 0.65rem 0 0.3rem;
}

.order-total {
  color: var(--primary-color);
  font-size: 1.3rem;
}

.shipping {
  margin: 0;
  color: var(--text-muted);
}

.payment-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
}

.payment-status {
  text-transform: capitalize;
}

.payment-completed {
  color: var(--success-color);
}

.payment-pending {
  color: var(--warning-color);
}

.payment-failed {
  color: var(--danger-color);
}

.order-items {
  display: grid;
  gap: 0.7rem;
}

.order-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
}

@media (max-width: 720px) {
  .order-head,
  .order-item {
    grid-template-columns: 1fr;
  }
}
</style>
