const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const inventorySchema = new Schema({
    product_id: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        unique: true,
    },
    stock_quantity: {
        type: Number,
        required: true,
        default: 0,
    },
    reserved_quantity: {
        type: Number,
        required: true,
        default: 0,
    },
    sold_quantity: {
        type: Number,
        required: true,
        default: 0,
    },
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
