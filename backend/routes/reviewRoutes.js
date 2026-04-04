const express = require('express');
const router = express.Router();
const {
    createReview,
    updateReview,
    deleteReview,
    getProductReviews,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.route('/').post(protect, createReview);
router.route('/:id').put(protect, updateReview).delete(protect, deleteReview);
router.route('/product/:productId').get(getProductReviews);

module.exports = router;
