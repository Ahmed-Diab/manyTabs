const express = require('express');
const productRoutes = require('./product.route');
const customerRoutes = require('./customer.route');
const orderRoutes = require('./order.route');

const router = express.Router();
router.use('/products', productRoutes);
router.use('/customers', customerRoutes);
router.use('/orders', orderRoutes);

module.exports = router;
