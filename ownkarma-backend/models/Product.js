const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    tagline: {
        type: String,
        trim: true
    },
    description: String,
    price: {
        type: Number,
        required: true,
        min: 0
    },
    compareAtPrice: {
        type: Number,
        min: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    productType: {
        type: String,
        enum: ['hoodie', 'tshirt', 'jacket', 'accessory', 'other', ''],
        default: ''
    },
    images: [{
        url: String,
        alt: String
    }],
    thumbnail: String,
    // Available sizes for this product
    sizes: [{
        type: String,
        trim: true
    }],
    // Visual customization for the frontend
    themeColor: {
        type: String,
        default: '#646464ff'
    },
    glowColor: {
        type: String,
        default: '255, 255, 255'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Which frontend pages to list this product on
    listOnPages: [{
        type: String,
        enum: ['divine', 'karma-eye', 'destiny', 'broken-hourglass', 'products']
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema);
