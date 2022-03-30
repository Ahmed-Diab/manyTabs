const Order = require('../models/order.model');
module.exports = {
  allOrders,
  insert
};

/// get All Orders
async function allOrders() {
  var orders = await Order.find({}).populate("orderLines.product", {name:1}).populate("customer", {name:1});
  // //var orders = await Order.find({})
  ////   .populate({path:'orderLines', populate:'product'}).populate("customer");
  return await orders;
}

// add new Customer
async function insert(order) {
  // .populate("orderLines.product", {name:1}).populate("customer");
  var or =  await new Order(order).save();
  return await Order.findById(or._id).populate("orderLines.product", {name:1}).populate("customer");
}

