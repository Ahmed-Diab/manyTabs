const Customer = require('../models/customer.model');
module.exports = {
  insert,
  allCustomers,
  insertMany,
  deleteCustomer,
  updateCustomer,
  deleteMany
};

/// get All Customers
async function allCustomers() {
  var customers = await Customer.find({});
  return await customers;
}

// add new Customer
async function insert(customer) {
  return await new Customer(customer).save();
}

/// update Customer by _id
async function updateCustomer(customer) {
  return await Customer.findByIdAndUpdate(
    { _id: customer._id },
    {
      name: customer.name,
      email: customer.email,
      phoneNumber: customer.phoneNumber
    }, { new: true, returnDocument: "after" }).then(data => data).catch(error => error);
}
// Delete Customer By Id
async function deleteCustomer(id) {
  var customer = await Customer.deleteOne({ _id: id });
  return await customer;
}

// insert Many Many Customers >>> For PWA <<<
async function insertMany(customers) {
  return await Customer.insertMany(customers).then(data => data).catch(err => console.log(err.writeErrors));
}

// delete Many Customers >>>For PWA <<<
async function deleteMany(ids) {
  return await Customer.deleteMany({ _id: { $in: ids } }).then(data => data).catch(err => console.log(err.writeErrors));
}

