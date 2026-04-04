const express = require('express');
const router = express.Router();
const {
    createPayment,
    getPaymentById,
    getPaymentByOrderId,
    updatePaymentStatus,
} = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
    .post(protect, createPayment);

router.route('/order/:orderId')
    .get(protect, getPaymentByOrderId);

router.route('/:id')
    .get(protect, getPaymentById);

router.route('/:id/status')
    .put(protect, admin, updatePaymentStatus);

module.exports = router;
