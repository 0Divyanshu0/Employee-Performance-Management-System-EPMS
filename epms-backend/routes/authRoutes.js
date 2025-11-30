// epms-backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Maps POST /api/auth/login to the loginUser controller function
router.post('/login', authController.loginUser);

module.exports = router;