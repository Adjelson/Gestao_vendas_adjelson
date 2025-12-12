const express = require('express');
const router = express.Router();
const { getDashboardSummary, getForecast, getSellerPerformance, getTopCustomers } = require('../controllers/analytics.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.get('/summary', getDashboardSummary);
router.get('/forecast', getForecast);
router.get('/performance/sellers', getSellerPerformance);
router.get('/performance/customers', getTopCustomers);

module.exports = router;
