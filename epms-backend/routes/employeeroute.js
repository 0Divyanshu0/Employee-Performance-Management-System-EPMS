// epms-backend/routes/employeeroute.js
const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

// Public endpoints
router.get('/:userId/dashboard', employeeController.getEmployeeDashboard);
router.get('/:userId/goals', employeeController.getEmployeeGoals);
router.put('/goals/:goalId', employeeController.updateGoal);

module.exports = router;
