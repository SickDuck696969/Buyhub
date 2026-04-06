const Inventory = require('../schemas/Inventory');
const Order = require('../schemas/Order');
const CartItem = require('../schemas/CartItem');
const OrderItem = require('../schemas/OrderItem');
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
const reserveStock = async (productId) => {
    console.log(productId);
    const inventory = await Inventory.findOne({ product_id: productId });
    const orders = await Order.find();
    if (!inventory) {
        throw new Error('Inventory not found');
    }
    if (!orders) {
        throw new Error('no orders not found');
    }

    inventory.stock_quantity += inventory.reserved_quantity;
    inventory.reserved_quantity = 0;

    for (const order of orders) {
        if(order.status !== 'delivered'){
            const items = await OrderItem.find({ order_id: order._id });
            for(const item of items){
                console.log("item: " + item.product_id);
                console.log("inventory: " + inventory.product_id._id);
                if(item.product_id.toString() === inventory.product_id._id.toString()){
                    console.log("matched");
                    console.log("item: " + item.product_id);
                    console.log("inventory: " + inventory.product_id._id);
                    console.log("------------------");
                    inventory.stock_quantity -= item.quantity;
                    inventory.reserved_quantity += item.quantity;
                }
            }
        }
    }

    inventory.stock_quantity += inventory.sold_quantity;
    inventory.sold_quantity = 0;

    for (const order of orders) {
        if(order.status === 'delivered'){
            const items = await OrderItem.find({ order_id: order._id });
            for(const item of items){
                console.log("item: " + item.product_id);
                console.log("inventory: " + inventory.product_id._id);
                if(item.product_id.toString() === inventory.product_id._id.toString()){
                    console.log("matched");
                    console.log("item: " + item.product_id);
                    console.log("inventory: " + inventory.product_id._id);
                    console.log("------------------");
                    inventory.stock_quantity -= item.quantity;
                    inventory.sold_quantity += item.quantity;
                }
            }
        }
    }

    console.log(inventory.reserved_quantity);
    console.log(inventory.stock_quantity);
    console.log(inventory.sold_quantity);

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
