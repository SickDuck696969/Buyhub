const Payment = require('../schemas/Payment');
const Order = require('../schemas/Order');
const paymentService = require('../services/paymentService');

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private/Admin
const getPayments = async (req, res, next) => {
    try {
        const payments = await Payment.find({})
            .populate('order_id')
            .sort({ createdAt: -1 });

        res.json(payments);
    } catch (error) {
        next(error);
    }
};

const canAccessOrderPayment = async (orderId, user) => {
    const order = await Order.findById(orderId);

    if (!order) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        throw error;
    }

    const isOwner = order.user_id.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
        const error = new Error('Not authorized to access this payment');
        error.statusCode = 403;
        throw error;
    }

    return order;
};

// @desc    Create a payment for an order
// @route   POST /api/payments
// @access  Private
const createPayment = async (req, res, next) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            res.status(400);
            throw new Error('orderId is required');
        }

        await canAccessOrderPayment(orderId, req.user);
        const payment = await paymentService.createPayment(orderId);
        const populatedPayment = await Payment.findById(payment._id).populate('order_id');

        res.status(201).json(populatedPayment);
    } catch (error) {
        if (error.statusCode) {
            res.status(error.statusCode);
        }
        next(error);
    }
};

// @desc    Get payment by id
// @route   GET /api/payments/:id
// @access  Private
const getPaymentById = async (req, res, next) => {
    try {
        const payment = await Payment.findById(req.params.id).populate('order_id');

        if (!payment) {
            res.status(404);
            throw new Error('Payment not found');
        }

        await canAccessOrderPayment(payment.order_id._id, req.user);
        res.json(payment);
    } catch (error) {
        if (error.statusCode) {
            res.status(error.statusCode);
        }
        next(error);
    }
};

// @desc    Get payment by order id
// @route   GET /api/payments/order/:orderId
// @access  Private
const getPaymentByOrderId = async (req, res, next) => {
    try {
        await canAccessOrderPayment(req.params.orderId, req.user);
        const payment = await Payment.findOne({ order_id: req.params.orderId }).populate('order_id');

        if (!payment) {
            res.status(404);
            throw new Error('Payment not found');
        }

        res.json(payment);
    } catch (error) {
        if (error.statusCode) {
            res.status(error.statusCode);
        }
        next(error);
    }
};

// @desc    Update payment status
// @route   PUT /api/payments/:id/status
// @access  Private/Admin
const updatePaymentStatus = async (req, res, next) => {
    try {
        const { status, transaction_id } = req.body;

        if (!status) {
            res.status(400);
            throw new Error('status is required');
        }

        const payment = await paymentService.updatePaymentStatus(req.params.id, status, transaction_id);
        const populatedPayment = await Payment.findById(payment._id).populate('order_id');

        res.json(populatedPayment);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPayments,
    createPayment,
    getPaymentById,
    getPaymentByOrderId,
    updatePaymentStatus,
};
