const Payment = require('../schemas/Payment');
const Order = require('../schemas/Order');
const CartItem = require('../schemas/CartItem');
const cartService = require('./cartService');
const mongoose = require('mongoose');

/**
 * Create a new payment record for an order
 * @param {string} orderId
 * @returns {Promise<Payment>}
 */
const createPayment = async (orderId) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    const order = await Order.findById(orderId);
    if (!order) {
        throw new Error('Order not found');
    }

    const cart = await cartService.getCart(order.user_id);
    if (!cart || cart.items.length === 0) {
        throw new Error('Cart is empty');
    }

    const existingPayment = await Payment.findOne({ order_id: orderId });
    if (existingPayment) {
        throw new Error('Payment already exists for this order');
    }

    const payment = new Payment({
        order_id: orderId,
        amount: order.total_amount,
    });

    await payment.save();

    order.payment_id = payment._id;
    await order.save();

    await CartItem.deleteMany({ cart_id: cart._id }).session(session);
    cart.items = [];
    await cart.save({ session });
    await session.commitTransaction();
    session.endSession();
    return payment;
};

/**
 * Update the status of a payment
 * @param {string} paymentId
 * @param {string} status
 * @param {string} transactionId
 * @returns {Promise<Payment>}
 */
const updatePaymentStatus = async (paymentId, status, transactionId) => {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
        throw new Error('Payment not found');
    }

    if (payment.status === 'completed') {
        throw new Error('Payment has already been completed');
    }

    payment.status = status;
    payment.transaction_id = transactionId;
    await payment.save();

    return payment;
};

module.exports = {
    createPayment,
    updatePaymentStatus,
};
