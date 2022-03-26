const Joi = require('joi');
const Product = require('../models/product.model');

const productSchema = Joi.object({
  name: Joi.string().required(),
  barcode: Joi.string().required(),
  price: Joi.number().required(),
  balance: Joi.number().required()
});

module.exports = {
  insert,
  allProducts,
  insertMany,
  deleteProduct,
  updateProduct,
  deleteMany
};

async function updateProduct(product) {
  return await Product.updateOne(
    { _id: product._id },
    {
      name: product.name,
      barcode: product.product,
      price: product.price,
      balance: product.balance
    });
}
async function insert(product) {
  return await new Product(product).save();
}

async function deleteMany(ids){
  return await Product.deleteMany({_id:{$in:ids}}).then(data => data).catch(err => console.log(err.writeErrors));
}

async function insertMany(products) {
  return await Product.insertMany(products).then(data => data).catch(err => console.log(err.writeErrors));
}

async function allProducts() {
  var products = await Product.find({});
  return await products;
}

async function deleteProduct(id) {
  var product = await Product.deleteOne({ _id: id });
  return await product;
}

