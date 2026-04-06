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
    expiresAt: {
        type: Date,
    },
}, { timestamps: true });
orderSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
module.exports = mongoose.model('Order', orderSchema);
