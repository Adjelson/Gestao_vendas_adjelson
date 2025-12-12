const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/', verifyToken, productsController.listProducts);
router.post('/', verifyToken, productsController.createProduct); // Simplify: All logged users can create for MVP
router.put('/:id', verifyToken, productsController.updateProduct);

module.exports = router;
