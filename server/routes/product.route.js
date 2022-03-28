const express = require('express');
const asyncHandler = require('express-async-handler');
const productCtrl = require('../controllers/product.controller');
const Product = require('../models/product.model');

const router = express.Router();
module.exports = router;
router.get('/', asyncHandler(getAllProducts));
router.post('/create', asyncHandler(insert));
router.put('/update', asyncHandler(updateProduct));
router.delete('/:id', asyncHandler(deleteProduct));
router.post('/createMany', asyncHandler(insertMany));
router.post('/deleteMany', asyncHandler(deleteMany));
router.post('/updateMany', asyncHandler(updateMany));

async function getAllProducts(req, res) {
  await productCtrl.allProducts().then(products => {
    return res.json({ success: true, products: products });
  }).catch((error) => {
    return res.json({ success: false, message: error.message });
  })
}

async function insert(req, res, next) {
  await productCtrl.insert(req.body).then((product) => {
    return res.json({ success: true, product: product, message: "Success Add" });
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
    return res.json({ success: true, product: product, message: "Success Update" });
  }).catch((error) => {
    if (error.code === 11000) {
      let msg = error.keyPattern.barcode == 1 ? 'Product Barcode already exist!' : 'Product Name already exist!'
      return res.json({ success: false, message: msg });
    }
    return res.json({ success: false, message: error.message });
  });
}

async function deleteProduct(req, res, next) {
  await productCtrl.deleteProduct(req.params.id).then((product) => {
    return res.json({ success: true, message: "Success Delete" });
  }).catch((error) => {
    return res.json({ success: false, message: error.message });
  });
}

async function updateMany(req, res, next) {
  var updatedData = [];
  await Promise.all(
    req.body.map(async obj => {
      await productCtrl.updateProduct(obj).then(async (d) => {
        if (d && d.barcode) {
          await updatedData.push(d);
        }
      })
    })
  );
  return res.json({ success: true, products: updatedData });
}

async function insertMany(req, res, next) {
  await productCtrl.insertMany(req.body).then((data) => {
    return res.json({ success: true, products: data });
  }).catch((error) => {
    if (error.code === 11000) {
      let msg = error.keyPattern.barcode == 1 ? 'Product Barcode already exist!' : 'Product Name already exist!'
      return res.json({ success: false, message: msg });
    }
    return res.json({ success: false, message: error.message });
  });
}

async function deleteMany(req, res, next) {
  await productCtrl.deleteMany(req.body).then((data) => {
    return res.json({ success: true, data: data, message: "Success Deleted" });
  }).catch((error) => {
    if (error.code === 11000) {
      let msg = error.keyPattern.barcode == 1 ? 'Product Barcode already exist!' : 'Product Name already exist!'
      return res.json({ success: false, message: msg });
    }
    return res.json({ success: false, message: error.message });
  });
}