const mongoose = require('mongoose');
const Order = require('../schemas/Order');
const OrderItem = require('../schemas/OrderItem');
const Cart = require('../schemas/Cart');
const CartItem = require('../schemas/CartItem');
const Inventory = require('../schemas/Inventory');
const cartService = require('./cartService');

/**
 * Create a new order from the user's cart
 * @param {string} userId
 * @param {string} shippingAddress
 * @returns {Promise<Order>}
 */
const createOrder = async (userId, shippingAddress) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const cart = await cartService.getCart(userId);
        if (!cart || cart.items.length === 0) {
            throw new Error('Cart is empty');
        }

        let totalAmount = 0;
        const orderItems = [];

        for (const cartItemRef of cart.items) {
            const cartItem = await CartItem.findById(cartItemRef).populate('product_id').session(session);
            if (!cartItem) {
                throw new Error('Cart item not found');
            }

            const inventory = await Inventory.findOne({ product_id: cartItem.product_id._id }).session(session);
            if (!inventory || (inventory.stock_quantity - inventory.reserved_quantity) < cartItem.quantity) {
                throw new Error(`Not enough stock for product ${cartItem.product_id.name}`);
            }

            const orderItem = new OrderItem({
                order_id: null, // will be set later
                product_id: cartItem.product_id._id,
                name: cartItem.product_id.name,
                price: cartItem.product_id.price,
                image: cartItem.product_id.main_image,
                quantity: cartItem.quantity,
            });
            orderItems.push(orderItem);
            totalAmount += cartItem.product_id.price * cartItem.quantity;
        }

        const order = new Order({
            user_id: userId,
            items: orderItems.map(item => item._id),
            total_amount: totalAmount,
            shipping_address: shippingAddress,
        });

        for (const item of orderItems) {
            item.order_id = order._id;
            await item.save({ session });
        }

        for (const item of orderItems) {
            const inventory = await Inventory.findOne({ product_id: item.product_id }).session(session);
            inventory.stock_quantity -= item.quantity;
            inventory.reserved_quantity -= item.quantity;
            inventory.sold_quantity += item.quantity;
            await inventory.save({ session });
        }
        
        await order.save({ session });
        
        // Clear cart
        await CartItem.deleteMany({ cart_id: cart._id }).session(session);
        cart.items = [];
        await cart.save({ session });

        await session.commitTransaction();
        session.endSession();

        return order;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

const cancelOrder = async (orderId) => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw new Error('Order not found');
    }

    if (['shipping', 'delivered'].includes(order.status)) {
        throw new Error(`Cannot cancel order with status ${order.status}`);
    }

    // Release reserved stock if order is cancelled
    if (order.status === 'pending' || order.status === 'confirmed') {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            for (const itemId of order.items) {
                const orderItem = await OrderItem.findById(itemId).session(session);
                const inventory = await Inventory.findOne({ product_id: orderItem.product_id }).session(session);
                inventory.reserved_quantity -= orderItem.quantity; // Assuming stock was reserved, not decremented
                await inventory.save({ session });
            }
            order.status = 'cancelled';
            await order.save({ session });
            await session.commitTransaction();
            session.endSession();
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }


    return order;
};

/**
 * Update the status of an order
 * @param {string} orderId
 * @param {string} status
 * @returns {Promise<Order>}
 */
const updateOrderStatus = async (orderId, status) => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw new Error('Order not found');
    }
    order.status = status;
    await order.save();
    return order;
};

module.exports = {
    createOrder,
    updateOrderStatus,
    cancelOrder,
};
