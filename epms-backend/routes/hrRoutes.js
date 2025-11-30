const express = require('express');
const router = express.Router();
const hrController = require('../controllers/hrController');

// GET /api/hr/dashboard-data
router.get('/dashboard-data', hrController.getDashboardData);

module.exports = router;
