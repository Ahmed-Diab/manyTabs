const express = require('express');
const asyncHandler = require('express-async-handler');
const orderCtrl = require('../controllers/order.controller');

const router = express.Router();
module.exports = router;
router.get('/', asyncHandler(getAllOrders));
router.post('/create', asyncHandler(insert));


async function insert(req, res, next) {
    await orderCtrl.insert(req.body).then((order) => {
        return res.json({ success: true, order: order, message: "Success Add" });
    }).catch((error) => {
        return res.json({ success: false, message: error.message });
    });
}
async function getAllOrders(req, res, next) {
    await orderCtrl.allOrders(req.body).then((orders) => {
        return res.json({ success: true, orders: orders });
    }).catch((error) => {
        return res.json({ success: false, message: error.message });
    });
}