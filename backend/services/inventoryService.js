const Inventory = require('../schemas/Inventory');

/**
 * Get available stock for a product
 * @param {string} productId
 * @returns {Promise<number>}
 */
const getAvailableStock = async (productId) => {
    const inventory = await Inventory.findOne({ product_id: productId });
    if (!inventory) {
        throw new Error('Inventory not found');
    }
    return inventory.stock_quantity - inventory.reserved_quantity;
};

/**
 * Reserve stock for a product
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<void>}
 */
const reserveStock = async (productId, quantity) => {
    const inventory = await Inventory.findOne({ product_id: productId });
    if (!inventory) {
        throw new Error('Inventory not found');
    }

    const availableStock = inventory.stock_quantity - inventory.reserved_quantity;
    if (availableStock < quantity) {
        throw new Error('Not enough stock');
    }

    inventory.reserved_quantity += quantity;
    await inventory.save();
};

/**
 * Release stock for a product
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<void>}
 */
const releaseStock = async (productId, quantity) => {
    const inventory = await Inventory.findOne({ product_id: productId });
    if (!inventory) {
        throw new Error('Inventory not found');
    }

    inventory.reserved_quantity -= quantity;
    await inventory.save();
};

/**
 * Decrease stock after an order is placed
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<void>}
 */
const decreaseStock = async (productId, quantity) => {
    const inventory = await Inventory.findOne({ product_id: productId });
    if (!inventory) {
        throw new Error('Inventory not found');
    }

    inventory.stock_quantity -= quantity;
    inventory.sold_quantity += quantity;
    await inventory.save();
};

module.exports = {
    getAvailableStock,
    reserveStock,
    releaseStock,
    decreaseStock,
};
