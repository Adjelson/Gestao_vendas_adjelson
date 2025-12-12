const express = require('express');
const router = express.Router();
const companyController = require('../controllers/company.controller');
const { verifyToken, verifyAdmin, verifyCompany } = require('../middlewares/auth.middleware');

router.get('/settings', verifyToken, verifyCompany, verifyAdmin, companyController.getSettings);
router.put('/settings', verifyToken, verifyCompany, verifyAdmin, companyController.updateSettings);

module.exports = router;
