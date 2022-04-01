const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: [true, 'item name must be unique']
    },
    barcode: {
        type: String,
        required: true,
        unique: [true, 'item barcode must be unique']

    },
    price: {
        type: Number,
        required: true,
        default: 1
    },
    balance: {
        type: Number,
        required: true,
        default: 0
    }
});

module.exports = mongoose.model('Product', ProductSchema);
