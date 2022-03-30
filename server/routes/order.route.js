const express = require('express');
const asyncHandler = require('express-async-handler');
const orderCtrl = require('../controllers/order.controller');

const router = express.Router();
module.exports = router;
router.get('/', asyncHandler(getAllOrders));
router.post('/create', asyncHandler(insert));

async function insert(req, res, next) {
    var newProduct = req.body;
    req.body.orderLines.forEach((line, index) => {
        req.body.orderLines[index].product = line.product._id
        console.log("🚀 ~ file: product.route.js ~ line 28 ~ req.body.orderLines.forEach ~ req.body.orderLines[index].product", req.body.orderLines[index].product)
        console.log("🚀 ~ file: product.route.js ~ line 27 ~ insert ~ line", line)
    });
    newProduct.customer = req.body.customer._id;
    console.log("🚀 ~ file: product.route.js ~ line 31 ~ insert ~ newProduct", newProduct)
    Promise.all(await orderCtrl.insert(newProduct).then((order) => {
        return res.json({ success: true, order: order, message: "Success Add" });
    }).catch((error) => {
        return res.json({ success: false, message: error.message });
    }));
}
async function getAllOrders(req, res, next) {
    await orderCtrl.allOrders(req.body).then((orders) => {
        return res.json({ success: true, orders: orders });
    }).catch((error) => {
        return res.json({ success: false, message: error.message });
    });
}