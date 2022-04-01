const express = require('express');
const asyncHandler = require('express-async-handler');
const customerCtrl = require('../controllers/customer.controller');
 
const router = express.Router();
module.exports = router;
router.get('/', asyncHandler(getAllCustomers));
router.post('/create', asyncHandler(insert));
router.put('/update', asyncHandler(updateCustomer));
router.delete('/:id', asyncHandler(deleteCustomer));
router.post('/createMany', asyncHandler(insertMany));
router.post('/deleteMany', asyncHandler(deleteMany));
router.post('/updateMany', asyncHandler(updateMany));


//////// >> Get all Customers <<<<<<<\\\\\\\\\\
async function getAllCustomers(req, res) {
  await customerCtrl.allCustomers().then(customers => {
    return res.json({ success: true, customers: customers });
  }).catch((error) => {
    return res.json({ success: false, message: error.message });
  })
}
//////// >> Create New Customers <<<<<<<\\\\\\\\\\
async function insert(req, res, next) {
  await customerCtrl.insert(req.body).then((customer) => {
    return res.json({ success: true, customer: customer, message: "Success Add" });
  }).catch((error) => {
    if (error.code === 11000) {
      let msg = error.keyPattern.phoneNumber == 1 ? 'Customer Phone Number already exist!' : 'Customer Email already exist!'
      return res.json({ success: false, message: msg });
    }
    return res.json({ success: false, message: error.message });
  });
}
//////// >> Update  Customer <<<<<<<\\\\\\\\\\
async function updateCustomer(req, res, next) {
  await customerCtrl.updateCustomer(req.body).then((customer) => {
    return res.json({ success: true, customer: customer, message: "Success Update" });
  }).catch((error) => {
    if (error.code === 11000) {
      let msg = error.keyPattern.phoneNumber == 1 ? 'Customer Phone Number already exist!' : 'Customer Email already exist!'
      return res.json({ success: false, message: msg });
    }
    return res.json({ success: false, message: error.message });
  });
}

//////// >>  Delete Customers <<<<<<<\\\\\\\\\\
async function deleteCustomer(req, res, next) {
  await customerCtrl.deleteCustomer(req.params.id).then((customer) => {
    return res.json({ success: true, message: "Success Delete" });
  }).catch((error) => {
    return res.json({ success: false, message: error.message });
  });
}
/// >>>>>> Update Many Custmoer >>>>>>> PWA <<<<<<<<
async function updateMany(req, res, next) {
  var updatedCustomers = [];
  await Promise.all(
    req.body.map(async obj => {
      await customerCtrl.updateCustomer(obj).then(async (customer) => {
        if (customer) {
          await updatedCustomers.push(customer);
        }
      })
    })
  );
  return res.json({ success: true, customers: await updatedCustomers });
}

/// >>>>>> Insert Many Custmoer >>>>> PWA <<<<<<< 
async function insertMany(req, res, next) {
  await customerCtrl.insertMany(req.body).then((data) => {
    return res.json({ success: true, customers: data });
  }).catch((error) => {
    if (error.code === 11000) {
      let msg = error.keyPattern.phoneNumber == 1 ? 'Customer Phone Number already exist!' : 'Customer Email already exist!'
      return res.json({ success: false, message: msg });
    }
    return res.json({ success: false, message: error.message });
  });
}
/// >>>>>>  Delete Many Custmoer >>> PWA <<<<<<< 
async function deleteMany(req, res, next) {
  await customerCtrl.deleteMany(req.body).then((data) => {
    return res.json({ success: true, data: data, message: "Success Deleted" });
  }).catch((error) => {
    return res.json({ success: false, message: error.message });
  });
}