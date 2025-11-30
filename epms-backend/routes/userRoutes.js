// epms-backend/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET /api/users - Fetch All Users
router.get('/', userController.getAllUsers);

// POST /api/users - Create New User
router.post('/', userController.createUser);

// PUT /api/users/:userId - Update Existing User
// Note the dynamic parameter ':userId'
router.put('/:userId', userController.updateUser);

// DELETE /api/users/:userId - Delete User
// Note the dynamic parameter ':userId'
router.delete('/:userId', userController.deleteUser);

module.exports = router;