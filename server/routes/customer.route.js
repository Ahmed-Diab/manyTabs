const express = require('express');
const asyncHandler = require('express-async-handler');
const productCtrl = require('../controllers/product.controller');

const router = express.Router();
module.exports = router;
router.get('/', (req, res) => {
  res.json({message:'GET request to the homepage'})
});

// create new product
async function create(req, res, next) {
  let product = await productCtrl.insert(req.body);
  product = product.toObject();
  req.product = product;
  next();
}
 
  
function product(req, res) {
  let product = req.product;
  res.json({ product });
}
