const Cart = require('../schemas/Cart');
const CartItem = require('../schemas/CartItem');
const inventoryService = require('./inventoryService');
const Product = require('../schemas/Product');

/**
 * Get user's cart
 * @param {string} userId
 */
const getCart = async (userId) => {
    let cart = await Cart.findOne({ user_id: userId }).populate({
        path: 'items',
        populate: {
            path: 'product_id',
            model: 'Product'
        }
    });

    if (!cart) {
        cart = new Cart({ user_id: userId, items: [] });
        await cart.save();
    }

    return cart;
};

/**
 * Add item to cart
 * @param {string} userId
 * @param {string} productId
 * @param {number} quantity
 */
const addToCart = async (userId, productId, quantity) => {
    let cart = await getCart(userId);

    const availableStock = await inventoryService.getAvailableStock(productId);
    if (availableStock < quantity) {
        throw new Error('Not enough stock');
    }

    const product = await Product.findById(productId);
    if (!product) {
        throw new Error('Product not found');
    }

    let cartItem = await CartItem.findOne({ cart_id: cart._id, product_id: productId });

    if (cartItem) {
        // Item already in cart, update quantity
        cartItem.quantity += quantity;
    } else {
        // New item
        cartItem = new CartItem({
            cart_id: cart._id,
            product_id: productId,
            quantity: quantity,
        });
        cart.items.push(cartItem._id);
    }

    await inventoryService.reserveStock(productId, quantity);
    await cartItem.save();
    await cart.save();

    return cart;
};

/**
 * Remove item from cart
 * @param {string} userId
 * @param {string} cartItemId
 */
const removeFromCart = async (userId, cartItemId) => {
    const cart = await getCart(userId);
    const cartItem = await CartItem.findById(cartItemId);

    if (!cartItem || !cart.items.includes(cartItem._id)) {
        throw new Error('Cart item not found');
    }

    await inventoryService.releaseStock(cartItem.product_id, cartItem.quantity);

    await CartItem.findByIdAndDelete(cartItemId);
    cart.items.pull(cartItemId);
    await cart.save();

    return cart;
};

/**
 * Update cart item quantity
 * @param {string} userId
 * @param {string} cartItemId
 * @param {number} quantity
 */
const updateCartItemQuantity = async (userId, cartItemId, quantity) => {
    const cart = await getCart(userId);
    const cartItem = await CartItem.findById(cartItemId);

    if (!cartItem || !cart.items.includes(cartItem._id)) {
        throw new Error('Cart item not found');
    }

    const diff = quantity - cartItem.quantity;

    if (diff > 0) {
        await inventoryService.reserveStock(cartItem.product_id, diff);
    } else {
        await inventoryService.releaseStock(cartItem.product_id, -diff);
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    return cart;
};

/**
 * Clear cart
 * @param {string} userId
 */
const clearCart = async (userId) => {
    const cart = await getCart(userId);

    for (const item of cart.items) {
        const cartItem = await CartItem.findById(item);
        if (cartItem) {
            await inventoryService.releaseStock(cartItem.product_id, cartItem.quantity);
            await CartItem.findByIdAndDelete(item);
        }
    }

    cart.items = [];
    await cart.save();
    return cart;
};

module.exports = {
    getCart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
};
