const Review = require('../schemas/Review');
const reviewService = require('../services/reviewService');

const reviewUserProjection = 'username fullName email avatarUrl';

const createReview = async (req, res, next) => {
    const { productId, rating, comment, images } = req.body;
    try {
        const review = await reviewService.createReview(req.user._id, productId, rating, comment, images);
        const populatedReview = await Review.findById(review._id).populate('user_id', reviewUserProjection);
        res.status(201).json(populatedReview);
    } catch (error) {
        next(error);
    }
};

const updateReview = async (req, res, next) => {
    const { rating, comment, images } = req.body;
    try {
        const review = await reviewService.updateReview(req.params.id, req.user._id, rating, comment, images);
        const populatedReview = await Review.findById(review._id).populate('user_id', reviewUserProjection);
        res.json(populatedReview);
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
        const reviews = await Review.find({ product_id: req.params.productId })
            .populate('user_id', reviewUserProjection)
            .sort({ createdAt: -1 });
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
