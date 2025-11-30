// routes/managerRoute.js
const express = require('express');
const router = express.Router();
const managerController = require('../controllers/managerController');

// GET dashboard payload for manager
router.get('/dashboard/:managerId', managerController.getDashboardForManager);

// POST add a goal
router.post('/goal', managerController.addGoal);

// DELETE goal
router.delete('/goal/:goalId', managerController.deleteGoal);

// PUT update goal progress
router.put('/goal/:goalId/progress', managerController.updateGoalProgress);

// POST add feedback
router.post('/feedback', managerController.addFeedback);

// GET feedback for an employee
router.get('/feedback/:empId', managerController.getEmployeeFeedback);

module.exports = router;
