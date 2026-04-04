const cartService = require('../services/cartService');

const getCart = async (req, res, next) => {
    try {
        const cart = await cartService.getCart(req.user._id);
        res.json(cart);
    } catch (error) {
        next(error);
    }
};

const addToCart = async (req, res, next) => {
    const { productId, quantity } = req.body;
    try {
        const cart = await cartService.addToCart(req.user._id, productId, quantity);
        res.json(cart);
    } catch (error) {
        next(error);
    }
};

const removeFromCart = async (req, res, next) => {
    const { cartItemId } = req.params;
    try {
        const cart = await cartService.removeFromCart(req.user._id, cartItemId);
        res.json(cart);
    } catch (error) {
        next(error);
    }
};

const updateCartItemQuantity = async (req, res, next) => {
    const { cartItemId } = req.params;
    const { quantity } = req.body;
    try {
        const cart = await cartService.updateCartItemQuantity(req.user._id, cartItemId, quantity);
        res.json(cart);
    } catch (error) {
        next(error);
    }
};

const clearCart = async (req, res, next) => {
    try {
        const cart = await cartService.clearCart(req.user._id);
        res.json(cart);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
};
