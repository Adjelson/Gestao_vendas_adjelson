const express = require('express');
const router = express.Router();
const { listCustomers, createCustomer } = require('../controllers/customers.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.get('/', listCustomers);
router.post('/', createCustomer);

module.exports = router;
