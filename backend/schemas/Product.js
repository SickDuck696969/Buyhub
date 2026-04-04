const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    main_image: {
        type: String,
        required: true,
    },
    images: [{
        type: String,
    }],
    category_id: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    brand_id: {
        type: Schema.Types.ObjectId,
        ref: 'Brand',
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
