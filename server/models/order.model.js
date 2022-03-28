 const mongoose = require('mongoose');
const orderLineSchema = new mongoose.Schema({
    price:{
        type:Number,
        min:1
    },
    quntity:{
        type:Number,
        min:1
    },
    total:{
        type:Number,
        default:()=>price * quntity
    },
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product'
    }
})
const OrderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    createdAt:{
        type:Date,
        default : new Date()
    },
    total:{
        type:Number,
        min:.01
    },
    orderLines:{
        type:[orderLineSchema]
     }
});

module.exports = mongoose.model('Order', OrderSchema);
