const express = require('express');
const router = express.Router();
const {
    createOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    getAllOrders,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

router.route('/').post(protect, createOrder).get(protect, getUserOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/status').put(protect, updateOrderStatus);

router.route('/admin/all').get(protect, admin, getAllOrders);

module.exports = router;
