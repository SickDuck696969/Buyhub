<template>
  <div class="container section-grid">
    <div class="page-heading">
      <div>
        <span class="pill">Checkout</span>
        <h1 class="page-title">Checkout</h1>
      </div>
    </div>

    <div v-if="cartStore.loading && !cartStore.cart" class="status-box">Loading checkout details...</div>
    <div v-else-if="!cartStore.items.length" class="status-box warning">
      Your cart is empty. Add products before checking out.
    </div>
    <section v-else class="checkout-grid">
      <form class="card checkout-form" @submit.prevent="placeOrder">
        <span class="pill">Shipping</span>
        <h2>Delivery address</h2>
        <label>
          <span>Shipping address</span>
          <textarea v-model="shippingAddress" placeholder="Street, district, city, country..." required />
        </label>
        <button :disabled="submitting">{{ submitting ? 'Placing order...' : 'Place order' }}</button>
        <div v-if="message" :class="['status-box', messageType]">{{ message }}</div>
      </form>

      <aside class="card checkout-summary">
        <span class="pill">Order recap</span>
        <h2>{{ cartStore.itemCount }} items</h2>
        <div class="summary-items">
          <div v-for="item in cartStore.items" :key="item._id" class="summary-item">
            <div>
              <strong>{{ item.product_id?.name }}</strong>
              <span>x{{ item.quantity }}</span>
            </div>
            <strong>${{ Number((item.product_id?.price || 0) * item.quantity).toLocaleString() }}</strong>
          </div>
        </div>
        <div class="summary-total">
          <span>Total</span>
          <strong>${{ Number(cartStore.subtotal).toLocaleString() }}</strong>
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { useCartStore } from '../stores/cart';

const router = useRouter();
const cartStore = useCartStore();

const shippingAddress = ref('');
const submitting = ref(false);
const message = ref('');
const messageType = ref('success');

onMounted(() => {
  cartStore.fetchCart();
});

const placeOrder = async () => {
  submitting.value = true;
  message.value = '';

  try {
    await api.post('/orders', {
      shippingAddress: shippingAddress.value,
    });

    await cartStore.fetchCart();
    messageType.value = 'success';
    message.value = 'Order created successfully. Redirecting to your order history...';
    setTimeout(() => {
      router.push('/orders');
    }, 900);
  } catch (err) {
    messageType.value = 'error';
    message.value = err.response?.data?.message || 'Unable to place this order.';
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.checkout-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 1.2rem;
}

.checkout-form,
.checkout-summary {
  padding: 1.25rem;
  display: grid;
  gap: 1rem;
}

.checkout-form h2,
.checkout-summary h2 {
  margin: 0;
}

.checkout-form span {
  display: block;
  margin-bottom: 0.45rem;
  color: var(--text-muted);
}

.summary-items {
  display: grid;
  gap: 0.8rem;
}

.summary-item,
.summary-total {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.summary-item div {
  display: grid;
}

.summary-item span {
  color: var(--text-muted);
}

.summary-total {
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  font-size: 1.1rem;
}

@media (max-width: 900px) {
  .checkout-grid {
    grid-template-columns: 1fr;
  }
}
</style>
