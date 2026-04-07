<template>
  <div class="container section-grid">
    <div class="page-heading">
      <div>
        <span class="pill">Cart</span>
        <h1 class="page-title">Your cart</h1>
      </div>
      <button v-if="items.length" class="button-secondary" @click="clearCart">Clear cart</button>
    </div>

    <div v-if="!authStore.isAuthenticated" class="status-box warning">
      Please log in to access your cart and start checkout.
    </div>
    <div v-else-if="cartStore.loading && !cartStore.cart" class="status-box">Loading your cart...</div>
    <div v-else-if="cartStore.error" class="status-box error">{{ cartStore.error }}</div>
    <div v-else-if="!items.length" class="status-box">
      Your cart is empty right now. Explore the catalog and add something worth buying.
    </div>
    <section v-else class="cart-layout">
      <div class="cart-items">
        <article v-for="item in items" :key="item._id" class="cart-item card">
          <img :src="resolveMediaUrl(item.product_id?.main_image, fallbackImage)" :alt="item.product_id?.name" />
          <div class="cart-item-content">
            <router-link :to="`/product/${item.product_id?._id}`" class="item-name">
              {{ item.product_id?.name || 'Unknown product' }}
            </router-link>
            <p class="item-price">${{ Number(item.product_id?.price || 0).toLocaleString() }}</p>
            <div class="item-actions">
              <label>
                <span>Quantity</span>
                <input
                  :value="item.quantity"
                  type="number"
                  min="1"
                  @change="updateQuantity(item._id, $event.target.value)"
                />
              </label>
              <button class="button-danger" @click="removeItem(item._id)">Remove</button>
            </div>
          </div>
          <strong class="line-total">${{ Number((item.product_id?.price || 0) * item.quantity).toLocaleString() }}</strong>
        </article>
      </div>

      <aside class="card summary">
        <span class="pill">Summary</span>
        <h2>Summary</h2>
        <div class="summary-line">
          <span>Items</span>
          <strong>{{ cartStore.itemCount }}</strong>
        </div>
        <div class="summary-line">
          <span>Subtotal</span>
          <strong>${{ Number(cartStore.subtotal).toLocaleString() }}</strong>
        </div>
      <button class="checkout-button" @click="makeorder">
        Proceed to checkout
      </button>
      </aside>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { ref } from 'vue';
import { resolveMediaUrl } from '../utils/media';

const shippingAddress = ref('');

const router = useRouter();

const fallbackImage = 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80';

const authStore = useAuthStore();
const cartStore = useCartStore();
const items = computed(() => cartStore.items);

onMounted(() => {
  if (authStore.isAuthenticated) {
    cartStore.fetchCart();
  }
});

const makeorder = async () => {
  try {
    const { data: order } = await api.post('/orders', {
      shippingAddress: "placeholder",
    });
    router.push(`/checkout/${order._id}`);
  } catch (err) {
    console.error("Checkout error:", err);
  }
}

const updateQuantity = async (cartItemId, value) => {
  const quantity = Math.max(Number(value) || 1, 1);
  await cartStore.updateQuantity(cartItemId, quantity);
};

const removeItem = async (cartItemId) => {
  await cartStore.removeFromCart(cartItemId);
};

const clearCart = async () => {
  await cartStore.clearCart();
};
</script>

<style scoped>
.cart-layout {
  display: grid;
  grid-template-columns: 1.6fr 0.8fr;
  gap: 1.2rem;
  align-items: start;
}

.cart-items {
  display: grid;
  gap: 1rem;
}

.cart-item {
  padding: 1rem;
  display: grid;
  grid-template-columns: 120px 1fr auto;
  gap: 1rem;
  align-items: center;
}

.cart-item img {
  width: 120px;
  height: 120px;
  border-radius: 18px;
  object-fit: cover;
}

.cart-item-content {
  display: grid;
  gap: 0.6rem;
}

.item-name {
  font-size: 1.15rem;
  font-weight: 800;
}

.item-price {
  margin: 0;
  color: var(--text-muted);
}

.item-actions {
  display: flex;
  gap: 0.75rem;
  align-items: end;
  flex-wrap: wrap;
}

.item-actions label {
  min-width: 130px;
}

.item-actions span {
  display: block;
  margin-bottom: 0.4rem;
  color: var(--text-muted);
}

.line-total {
  font-size: 1.1rem;
  color: var(--primary-color);
}

.summary {
  padding: 1.2rem;
  display: grid;
  gap: 1rem;
  position: sticky;
  top: 106px;
}

.summary h2 {
  margin: 0;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkout-button {
  width: 100%;
}

@media (max-width: 900px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }

  .summary {
    position: static;
  }

  .cart-item {
    grid-template-columns: 1fr;
  }

  .cart-item img {
    width: 100%;
    height: 240px;
  }
}
</style>
