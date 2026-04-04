const orderService = require('../services/orderService');
const Order = require('../schemas/Order');

const createOrder = async (req, res, next) => {
    const { shippingAddress } = req.body;
    try {
        const order = await orderService.createOrder(req.user._id, shippingAddress);
        res.status(201).json(order);
    } catch (error) {
        next(error);
    }
};

const getUserOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user_id: req.user._id });
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (order) {
            res.json(order);
        } else {
            res.status(404);
            throw new Error('Order not found');
        }
    } catch (error) {
        next(error);
    }
};

const updateOrderStatus = async (req, res, next) => {
    const { status } = req.body;
    try {
        const order = await orderService.updateOrderStatus(req.params.id, status);
        res.json(order);
    } catch (error) {
        next(error);
    }
};


module.exports = {
    createOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
};
