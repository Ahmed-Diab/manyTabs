const Order = require('../models/order.model');
const productCtrl = require('../controllers/product.controller');

module.exports = {
  allOrders,
  insert,
  deleteOrder,
  insertMany,
  deleteMany
};


/// get All Orders
async function allOrders() {
  var orders = await Order.find({}).populate("orderLines.product", { name: 1, barcode: 1 }).populate("customer", { name: 1 });
  return await orders;
}

// create order
async function insert(order) {
  await order.orderLines.forEach((line, index) => {
    order.orderLines[index].product = line.product._id;
  });
  order.customer = order.customer._id;
  var savedOrder = await new Order(order).save();
  return await Order.findById(savedOrder._id)
    .populate("orderLines.product", { name: 1 })
    .populate("customer").then(async (data) => {
      await productCtrl.reduceProductsBalance(data.orderLines);
      return data;
    });
}

/////////// delete Order
async function deleteOrder(id) {
  var order = await Order.findById(id).populate("orderLines.product");
  // update product Balance
  await productCtrl.addToProductsBalance(order.orderLines);
  var orderAfterDelete = await Order.deleteOne({ _id: id });
  return await orderAfterDelete;
}

// insert Many Many Orders >>> For PWA <<<
async function insertMany(orders) {
  return await Order.insertMany(orders).then(async or => {
    var ordersAfterSaved = [];
    await Promise.all(
      await or.map(async (data) => {
        // update product balance
        await productCtrl.reduceProductsBalance(data.orderLines);
        var orderAfterSaved = await Order.findById(data._id)
          .populate("orderLines.product", { name: 1 })
          .populate("customer");
        ordersAfterSaved.push(orderAfterSaved);
      }));
    return ordersAfterSaved;
  }).catch(err => console.log(err.writeErrors));

}

// delete Many Orders >>>For PWA <<<
async function deleteMany(ids) {
  await Promise.all(
    ids.map(async (id) => {
      var order = await Order.findById(id);
      // update product balance
      await productCtrl.addToProductsBalance(order.orderLines);
    }))
  return await Order.deleteMany({ _id: { $in: ids } }).then(data => data).catch(err => console.log(err.writeErrors));
}


