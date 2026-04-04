const reviewService = require('../services/reviewService');

const createReview = async (req, res, next) => {
    const { productId, rating, comment, images } = req.body;
    try {
        const review = await reviewService.createReview(req.user._id, productId, rating, comment, images);
        res.status(201).json(review);
    } catch (error) {
        next(error);
    }
};

const updateReview = async (req, res, next) => {
    const { rating, comment, images } = req.body;
    try {
        const review = await reviewService.updateReview(req.params.id, req.user._id, rating, comment, images);
        res.json(review);
    } catch (error) {
        next(error);
    }
};

const deleteReview = async (req, res, next) => {
    try {
        await reviewService.deleteReview(req.params.id, req.user._id);
        res.json({ message: 'Review removed' });
    } catch (error) {
        next(error);
    }
};

const getProductReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ product_id: req.params.productId });
        res.json(reviews);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createReview,
    updateReview,
    deleteReview,
    getProductReviews,
};
