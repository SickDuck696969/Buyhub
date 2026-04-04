const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [{
        type: Schema.Types.ObjectId,
        ref: 'OrderItem',
    }],
    total_amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'],
        default: 'pending',
    },
    shipping_address: {
        type: String,
        required: true,
    },
    payment_id: {
        type: Schema.Types.ObjectId,
        ref: 'Payment',
    },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
