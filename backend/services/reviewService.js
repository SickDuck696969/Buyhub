const Review = require('../schemas/Review');
const Order = require('../schemas/Order');
const OrderItem = require('../schemas/OrderItem');

/**
 * Check if a user can review a product
 * @param {string} userId
 * @param {string} productId
 * @returns {Promise<boolean>}
 */
const canUserReviewProduct = async (userId, productId) => {
    // Check if the user has already reviewed the product
    const existingReview = await Review.findOne({ user_id: userId, product_id: productId });
    if (existingReview) {
        return false;
    }

    // Check if the user has purchased the product and the order is delivered
    const orders = await Order.find({ user_id: userId, status: 'delivered' });
    const orderIds = orders.map(order => order._id);

    const orderItem = await OrderItem.findOne({ order_id: { $in: orderIds }, product_id: productId });

    return !!orderItem;
};


/**
 * Create a new review
 * @param {string} userId
 * @param {string} productId
 * @param {number} rating
 * @param {string} comment
 * @param {Array<string>} images
 * @returns {Promise<Review>}
 */
const createReview = async (userId, productId, rating, comment, images) => {
    const canReview = await canUserReviewProduct(userId, productId);
    if (!canReview) {
        throw new Error('User cannot review this product');
    }

    const review = new Review({
        user_id: userId,
        product_id: productId,
        rating,
        comment,
        images,
    });

    await review.save();
    return review;
};

/**
 * Update an existing review
 * @param {string} reviewId
 * @param {string} userId
 * @param {number} rating
 * @param {string} comment
 * @param {Array<string>} images
 * @returns {Promise<Review>}
 */
const updateReview = async (reviewId, userId, rating, comment, images) => {
    const review = await Review.findById(reviewId);

    if (!review) {
        throw new Error('Review not found');
    }

    if (review.user_id._id.toString() !== userId.toString()) {
        console.log("reviewid: " + review.user_id._id.toString());
        console.log(userId.toString());
        throw new Error('User not authorized to delete this review');
    }

    review.rating = rating;
    review.comment = comment;
    review.images = images;

    await review.save();
    return review;
};

/**
 * Delete a review
 * @param {string} reviewId
 * @param {string} userId
 * @returns {Promise<void>}
 */
const deleteReview = async (reviewId, userId) => {
    const review = await Review.findById(reviewId);

    if (!review) {
        throw new Error('Review not found');
    }

    if (review.user_id._id.toString() !== userId.toString()) {
        throw new Error('User not authorized to delete this review');
    }

    await review.deleteOne();
};


module.exports = {
    createReview,
    updateReview,
    deleteReview,
    canUserReviewProduct,
};
