const inventoryService = require('../services/inventoryService');
const Inventory = require('../schemas/Inventory');

const getInventory = async (req, res, next) => {
    try {
        const inventory = await Inventory.find({}).populate('product_id', 'name');
        res.json(inventory);
    } catch (error)  {
        next(error);
    }
};

const getInventoryByProductId = async (req, res, next) => {
    try {
        const inventory = await Inventory.findOne({ product_id: req.params.productId });
        if (!inventory) {
            res.status(404);
            throw new Error('Inventory not found');
        }
        res.json(inventory);
    } catch (error) {
        next(error);
    }
};

const updateInventory = async (req, res, next) => {
    try {
        const { stock_quantity, reserved_quantity } = req.body;
        const inventory = await Inventory.findOne({ product_id: req.params.productId });

        if (!inventory) {
            // option to create one if not exists
            const newInventory = new Inventory({
                product_id: req.params.productId,
                stock_quantity: stock_quantity,
                reserved_quantity: reserved_quantity
            });
            await newInventory.save();
            return res.status(201).json(newInventory);
        }

        inventory.stock_quantity = stock_quantity;
        inventory.reserved_quantity = reserved_quantity;
        await inventory.save();
        res.json(inventory);
    } catch (error) {
        next(error);
    }
};


module.exports = {
    getInventory,
    getInventoryByProductId,
    updateInventory,
};
