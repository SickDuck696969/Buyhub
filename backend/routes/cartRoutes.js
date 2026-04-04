const express = require('express');
const router = express.Router();
const {
    getCart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getCart).post(protect, addToCart).delete(protect, clearCart);
router.route('/:cartItemId').delete(protect, removeFromCart).put(protect, updateCartItemQuantity);

module.exports = router;
