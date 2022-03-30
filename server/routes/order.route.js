const express = require('express');
const asyncHandler = require('express-async-handler');
const orderCtrl = require('../controllers/order.controller');
const router = express.Router();
module.exports = router;

router.get('/', asyncHandler(getAllOrders));
router.post('/create', asyncHandler(insert));
router.post('/deleteMany', asyncHandler(deleteMany));
router.post('/createMany', asyncHandler(createMany));
router.delete('/:id', asyncHandler(deleteOrder));

// >>>>>> Get All orders
async function getAllOrders(req, res, next) {
    await orderCtrl.allOrders(req.body).then((orders) => {
        return res.json({ success: true, orders: orders });
    }).catch((error) => {
        return res.json({ success: false, message: error.message });
    });
}
// >>>>>>>>>>>> CREATE New Order <<<<<<<<< ////////
async function insert(req, res, next) {
    await orderCtrl.insert(req.body).then(async (order) => {
        res.json({ success: true, order: order, message: "Success Add" });
    }).catch((error) => {
        return res.json({ success: false, message: error.message });
    });
}
/// >>>>>>>>>>>> Delete Order <<<<<<<<<<< //////
async function deleteOrder(req, res, next) {
    await orderCtrl.deleteOrder(req.params.id).then((order) => {
        return res.json({ success: true, message: "Success Delete" });
    }).catch((error) => {
        return res.json({ success: false, message: error.message });
    });
}

/////////// >>>>>>>>>> CREATE Many PWA <<<<<<<< //////
async function createMany(req, res, next) {
    await orderCtrl.insertMany(req.body).then((data) => {
        return res.json({ success: true, orders: data });
    }).catch((error) => {
        return res.json({ success: false, message: error.message });
    });
}

/////////// >>>>>>>>>> DELETE Many PWA <<<<<<<< //////
async function deleteMany(req, res, next) {
    await orderCtrl.deleteMany(req.body).then((data) => {
        return res.json({ success: true, data: data, message: "Success Deleted" });
    }).catch((error) => {
        return res.json({ success: false, message: error.message });
    });
}