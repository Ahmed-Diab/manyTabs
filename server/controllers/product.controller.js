const Product = require('../models/product.model');
module.exports = {
  insert,
  allProducts,
  insertMany,
  deleteProduct,
  updateProduct,
  deleteMany,
  addToProductsBalance,
  reduceProductsBalance
};

/// get All Products
async function allProducts() {
  var products = await Product.find({});
  return await products;
}
// update product quntity 
async function addToProductsBalance(orderLines) {
  await orderLines.forEach(async orderLine => {
    await Product.findByIdAndUpdate(
      { _id: orderLine.product._id },
      { $inc: { balance: orderLine.quntity } }).then(data => data).catch(error => error);
  });
}

async function reduceProductsBalance(orderLines) {
  await orderLines.forEach(async orderLine => {
    await Product.findByIdAndUpdate(
      { _id: orderLine.product._id },
      { $inc: { balance: -orderLine.quntity } }).then(data => data).catch(error => error);
  });
}

// add new Product
async function insert(product) {
  return await new Product(product).save();
}

/// update Product by _id
async function updateProduct(product) {
  return await Product.findByIdAndUpdate(
    { _id: product._id },
    {
      name: product.name,
      barcode: product.barcode,
      price: product.price,
      balance: product.balance
    }, { returnDocument: "after" }).then(data => data).catch(error => error);
}
// Delete Product By Id
async function deleteProduct(id) {
  var product = await Product.deleteOne({ _id: id });
  return await product;
}

// insert Many Many Products >>> For PWA <<<
async function insertMany(products) {
  return await Product.insertMany(products).then(data => data).catch(err => console.log(err.writeErrors));
}

// delete Many Products >>>For PWA <<<
async function deleteMany(ids) {
  return await Product.deleteMany({ _id: { $in: ids } }).then(data => data).catch(err => console.log(err.writeErrors));
}

