const mongoose = require('mongoose');
const Order = require('../schemas/Order');
const OrderItem = require('../schemas/OrderItem');
const Cart = require('../schemas/Cart');
const CartItem = require('../schemas/CartItem');
const Inventory = require('../schemas/Inventory');
const cartService = require('./cartService');
const inventoryService = require('./inventoryService')

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
            expiresAt: new Date(Date.now() + 1800 * 1000)
        });

        for (const item of orderItems) {
            item.order_id = order._id;
            await item.save({ session });
        }
        
        await order.save({ session });

        for (const item of orderItems) {
            await inventoryService.reserveStock(item.product_id._id);
        }

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
const updateOrderStatus = async (orderId, body) => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw new Error('Order not found');
    }
    console.log(body);
    if (body.status !== undefined) {
        order.status = body.status;
        const items = await OrderItem.find({ order_id: order._id });
        for(const item of items){
            inventoryService.reserveStock(item.product_id.toString());
        }
    }

    if (body.expiresAt !== undefined) {
        order.expiresAt = body.expiresAt;
    }

    if (body.shippingAddress !== undefined) {
        order.shipping_address = body.shippingAddress;
    }
    await order.save();
    return order;
};

module.exports = {
    createOrder,
    updateOrderStatus,
    cancelOrder,
};
