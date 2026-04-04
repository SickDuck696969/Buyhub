const Payment = require('../schemas/Payment');
const Order = require('../schemas/Order');

/**
 * Create a new payment record for an order
 * @param {string} orderId
 * @returns {Promise<Payment>}
 */
const createPayment = async (orderId) => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw new Error('Order not found');
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
