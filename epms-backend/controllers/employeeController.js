// epms-backend/controllers/employeeController.js
const { poolPromise, sql } = require('../db');

/**
 * GET /api/employee/:userId/dashboard
 * Returns: { empId, latestScore, goals, summary }
 */
exports.getEmployeeDashboard = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: 'userId parameter is required.' });

    const pool = await poolPromise;

    // Resolve EmpID
    const empQuery = `SELECT ed.EmpID FROM EmployeeDetails ed WHERE ed.UserID = @userId`;
    const empResult = await pool.request().input('userId', sql.NVarChar(128), userId).query(empQuery);
    const empId = empResult.recordset[0]?.EmpID ?? null;
    if (!empId) return res.status(404).json({ message: `Employee not found for userId: ${userId}` });

    // Latest feedback (score)
    const scoreQuery = `
      SELECT TOP (1) Score, Comments, ManagerID, CreatedAt
      FROM Feedback
      WHERE EmpID = @empId
      ORDER BY CreatedAt DESC, FeedbackID DESC
    `;
    const scoreResult = await pool.request().input('empId', sql.Int, empId).query(scoreQuery);
    const latestScore = scoreResult.recordset[0] ?? null;

    // Goals
    const goalsQuery = `
      SELECT GoalID, Title, CompletionPercent, Status, AssignedBy, CreatedAt
      FROM Goals
      WHERE EmpID = @empId
      ORDER BY CreatedAt ASC, GoalID ASC
    `;
    const goalsResult = await pool.request().input('empId', sql.Int, empId).query(goalsQuery);
    const goals = goalsResult.recordset || [];

    const active = goals.filter((g) => (g.Status || '').toLowerCase() !== 'complete').length;
    const complete = goals.filter((g) => (g.Status || '').toLowerCase() === 'complete').length;

    return res.status(200).json({
      empId,
      latestScore,
      goals,
      summary: { total: goals.length, active, complete },
    });
  } catch (err) {
    console.error('💥 SQL Error in getEmployeeDashboard:', err);
    return res.status(500).json({
      message: 'Failed to fetch dashboard data.',
      error: err.originalError?.info?.message || err.message,
    });
  }
};

/**
 * GET /api/employee/:userId/goals
 */
exports.getEmployeeGoals = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: 'userId parameter is required.' });

    const pool = await poolPromise;
    const empQuery = `SELECT ed.EmpID FROM EmployeeDetails ed WHERE ed.UserID = @userId`;
    const empResult = await pool.request().input('userId', sql.NVarChar(128), userId).query(empQuery);
    const empId = empResult.recordset[0]?.EmpID ?? null;
    if (!empId) return res.status(404).json({ message: `Employee not found for userId: ${userId}` });

    const goalsQuery = `
      SELECT GoalID, Title, CompletionPercent, Status, AssignedBy, CreatedAt
      FROM Goals
      WHERE EmpID = @empId
      ORDER BY CreatedAt ASC, GoalID ASC
    `;
    const goalsResult = await pool.request().input('empId', sql.Int, empId).query(goalsQuery);

    return res.status(200).json({ empId, goals: goalsResult.recordset || [] });
  } catch (err) {
    console.error('💥 SQL Error in getEmployeeGoals:', err);
    return res.status(500).json({
      message: 'Failed to fetch goals.',
      error: err.originalError?.info?.message || err.message,
    });
  }
};

/**
 * PUT /api/employee/goals/:goalId
 * Body: { completionPercent }
 */
exports.updateGoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    const { completionPercent } = req.body;

    if (!goalId) return res.status(400).json({ message: 'goalId parameter is required.' });
    if (completionPercent === undefined || completionPercent === null) {
      return res.status(400).json({ message: 'completionPercent is required in body.' });
    }

    const pct = Number(completionPercent);
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
      return res.status(400).json({ message: 'completionPercent must be between 0 and 100.' });
    }

    const pool = await poolPromise;
    const newStatus = pct === 100 ? 'Complete' : 'In Progress';

    const updateQuery = `
      UPDATE Goals
      SET CompletionPercent = @completionPercent,
          Status = @newStatus
      OUTPUT inserted.GoalID, inserted.Title, inserted.CompletionPercent, inserted.Status, inserted.AssignedBy, inserted.CreatedAt
      WHERE GoalID = @goalId
    `;
    const updateResult = await pool
      .request()
      .input('completionPercent', sql.Int, pct)
      .input('newStatus', sql.NVarChar(50), newStatus)
      .input('goalId', sql.Int, Number(goalId))
      .query(updateQuery);

    const updated = updateResult.recordset[0] ?? null;
    if (!updated) return res.status(404).json({ message: 'Goal not found.' });

    return res.status(200).json({ updated });
  } catch (err) {
    console.error('💥 SQL Error in updateGoal:', err);
    return res.status(500).json({
      message: 'Failed to update goal.',
      error: err.originalError?.info?.message || err.message,
    });
  }
};
