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
        const orders = await Order.find({ user_id: req.user._id })
            .populate('items')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user_id', 'name email')
            .populate('items');

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
    console.log(req.body);
    try {
        const order = await orderService.updateOrderStatus(req.params.id, req.body);
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
