const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');

router.get('/', verifyToken, verifyAdmin, usersController.listUsers);
router.post('/', verifyToken, verifyAdmin, usersController.createUser);
router.patch('/:id/toggle-status', verifyToken, verifyAdmin, usersController.toggleUserStatus);

module.exports = router;
