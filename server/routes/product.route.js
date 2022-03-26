const express = require('express');
const asyncHandler = require('express-async-handler');
const productCtrl = require('../controllers/product.controller');
const Product = require('../models/product.model');

const router = express.Router();
module.exports = router;
router.get('/', asyncHandler(getAllProducts));
router.delete('/:id', asyncHandler(deleteProduct));
router.put('/update', asyncHandler(updateProduct));
router.post('/create', asyncHandler(insert));
router.post('/createMany', asyncHandler(insertMany));

async function insert(req, res, next) {
  await productCtrl.insert(req.body).then((product) => {
    return res.json({ success: true, product: product, message:"Success Add" });
  }).catch((error) => {
    if (error.code === 11000) {
      let msg = error.keyPattern.barcode == 1 ? 'Product Barcode already exist!' : 'Product Name already exist!'
      return res.json({ success: false, message: msg });
    }
    return res.json({ success: false, message: error.message });
  });
}
async function updateProduct(req, res, next) {
  await productCtrl.updateProduct(req.body).then((product) => {
    return res.json({ success: true, product: product, message:"Success Update" });
  }).catch((error) => {
    if (error.code === 11000) {
      let msg = error.keyPattern.barcode == 1 ? 'Product Barcode already exist!' : 'Product Name already exist!'
      return res.json({ success: false, message: msg });
    }
    return res.json({ success: false, message: error.message });
  });
}
async function deleteProduct(req, res, next) {
  console.log(req.params.id);
  await productCtrl.deleteProduct(req.params.id).then((product) => {
     return res.json({ success: true, message:"Success Delete" });
  }).catch((error) => {
    return res.json({ success: false, message: error.message });
  });
}

async function insertMany(req, res, next) {
  await productCtrl.insertMany(req.body).then((products) => {
    return res.json({ success: true, products: products });
  }).catch((error) => {
    if (error.code === 11000) {
      let msg = error.keyPattern.barcode == 1 ? 'Product Barcode already exist!' : 'Product Name already exist!'
      return res.json({ success: false, message: msg });
    }
    return res.json({ success: false, message: error.message });
  });
}

async function getAllProducts(req, res) {
  await productCtrl.allProducts().then(products => {
    return res.json({ success: true, products: products });
  }).catch((error) => {
    return res.json({ success: false, message: error.message });
  })
}

// function products(req, res) {
//   var products = req.products;
//   products = products;
//   res.json({products});
// }

// function product(req, res) {
//   var product = req.product;
//   res.json({ product });
// }

