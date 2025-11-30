// controllers/managerController.js
const { poolPromise, sql } = require('../db');

// Helper to safely pick number or 0
const num = (v) => (v == null ? 0 : Number(v));

exports.getDashboardForManager = async (req, res) => {
  const { managerId } = req.params;
  if (!managerId) return res.status(400).json({ message: 'Missing managerId' });

  try {
    const pool = await poolPromise;

    // 1) Team members under this manager
    const teamQuery = `
      SELECT ed.EmpID, ed.UserID, u.FirstName, u.LastName, ed.JobTitle, ed.DeptID
      FROM EmployeeDetails ed
      LEFT JOIN Users u ON u.UserID = ed.UserID
      WHERE ed.ManagerID = @managerId
    `;
    const teamResult = await pool.request().input('managerId', sql.NVarChar, managerId).query(teamQuery);
    const team = teamResult.recordset || [];

    // 2) Goals assigned to team members (join to get owner UserID too)
    // Fetching all goals whose EmpID is in team
    const empIds = team.map(t => t.EmpID);
    let goals = [];
    if (empIds.length > 0) {
      const tvp = empIds.join(','); // simple in-clause
      const goalsQuery = `
        SELECT GoalID, EmpID, Title, CompletionPercent, Status, AssignedBy, CreatedAt
        FROM Goals
        WHERE EmpID IN (${empIds.map((_, i) => `@id${i}`).join(',')})
        ORDER BY CreatedAt DESC
      `;
      const request = pool.request();
      empIds.forEach((id, i) => request.input(`id${i}`, sql.Int, id));
      const goalsResult = await request.query(goalsQuery);
      goals = goalsResult.recordset || [];
    }

    // 3) Feedback entries for team members
    let feedbacks = [];
    if (empIds.length > 0) {
      const request = pool.request();
      empIds.forEach((id, i) => request.input(`id${i}`, sql.Int, id));
      const fbQuery = `
        SELECT FeedbackID, EmpID, ManagerID, Score, Comments, CreatedAt
        FROM Feedback
        WHERE EmpID IN (${empIds.map((_, i) => `@id${i}`).join(',')})
        ORDER BY CreatedAt DESC
      `;
      const fbResult = await request.query(fbQuery);
      feedbacks = fbResult.recordset || [];
    }

    // 4) KPIs: team size, avg goal completion, counts
    const teamSize = team.length;
    const goalsAssigned = goals.length;
    const goalsComplete = goals.filter(g => Number(g.CompletionPercent) === 100).length;
    const avgGoalCompletion = goalsAssigned ? (goals.reduce((s, g) => s + num(g.CompletionPercent), 0) / goalsAssigned) : 0;

    const kpis = {
      teamSize,
      avgGoalCompletion: Number(avgGoalCompletion.toFixed(2)),
      goalsAssigned,
      goalsComplete
    };

    return res.json({
      team,
      goals,
      feedbacks,
      kpis
    });

  } catch (err) {
    console.error('managerController.getDashboardForManager error:', err);
    return res.status(500).json({ message: 'Failed to fetch manager dashboard', error: err.message });
  }
};

exports.addGoal = async (req, res) => {
  const { EmpID, Title, AssignedBy, Description } = req.body;
  if (!EmpID || !Title || !AssignedBy) return res.status(400).json({ message: 'EmpID, Title and AssignedBy are required' });

  try {
    const pool = await poolPromise;
    const insertQuery = `
      INSERT INTO Goals (EmpID, Title, CompletionPercent, Status, AssignedBy, CreatedAt)
      OUTPUT inserted.GoalID, inserted.EmpID, inserted.Title, inserted.CompletionPercent, inserted.Status, inserted.AssignedBy, inserted.CreatedAt
      VALUES (@EmpID, @Title, 0, 'In Progress', @AssignedBy, GETDATE())
    `;
    const result = await pool.request()
      .input('EmpID', sql.Int, EmpID)
      .input('Title', sql.NVarChar, Title)
      .input('AssignedBy', sql.NVarChar, AssignedBy)
      .query(insertQuery);

    const inserted = result.recordset[0];
    return res.status(201).json({ goal: inserted });
  } catch (err) {
    console.error('managerController.addGoal error:', err);
    return res.status(500).json({ message: 'Failed to add goal', error: err.message });
  }
};

exports.deleteGoal = async (req, res) => {
  const { goalId } = req.params;
  if (!goalId) return res.status(400).json({ message: 'Missing goalId' });
  try {
    const pool = await poolPromise;
    const result = await pool.request().input('goalId', sql.Int, goalId).query(`
      DELETE FROM Goals WHERE GoalID = @goalId
    `);
    if (result.rowsAffected[0] === 0) return res.status(404).json({ message: 'Goal not found' });
    return res.status(204).send();
  } catch (err) {
    console.error('managerController.deleteGoal error:', err);
    return res.status(500).json({ message: 'Failed to delete goal', error: err.message });
  }
};

exports.updateGoalProgress = async (req, res) => {
  const { goalId } = req.params;
  const { CompletionPercent } = req.body;
  if (CompletionPercent == null) return res.status(400).json({ message: 'CompletionPercent is required' });

  try {
    const pool = await poolPromise;
    // Set status depending on completion
    const status = Number(CompletionPercent) === 100 ? 'Completed' : 'In Progress';
    const result = await pool.request()
      .input('goalId', sql.Int, goalId)
      .input('CompletionPercent', sql.Int, Number(CompletionPercent))
      .input('status', sql.NVarChar, status)
      .query(`
        UPDATE Goals
        SET CompletionPercent = @CompletionPercent, Status = @status
        OUTPUT inserted.GoalID, inserted.EmpID, inserted.Title, inserted.CompletionPercent, inserted.Status
        WHERE GoalID = @goalId
      `);

    if (result.rowsAffected[0] === 0) return res.status(404).json({ message: 'Goal not found' });
    return res.json({ goal: result.recordset[0] });
  } catch (err) {
    console.error('managerController.updateGoalProgress error:', err);
    return res.status(500).json({ message: 'Failed to update goal', error: err.message });
  }
};

exports.addFeedback = async (req, res) => {
  const { EmpID, ManagerID, Score, Comments } = req.body;
  if (!EmpID || !ManagerID || Score == null) return res.status(400).json({ message: 'EmpID, ManagerID and Score are required' });

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('EmpID', sql.Int, EmpID)
      .input('ManagerID', sql.NVarChar, ManagerID)
      .input('Score', sql.Decimal(4,2), Score)
      .input('Comments', sql.NVarChar, Comments || '')
      .query(`
        INSERT INTO Feedback (EmpID, ManagerID, Score, Comments, CreatedAt)
        OUTPUT inserted.FeedbackID, inserted.EmpID, inserted.ManagerID, inserted.Score, inserted.Comments, inserted.CreatedAt
        VALUES (@EmpID, @ManagerID, @Score, @Comments, GETDATE())
      `);

    return res.status(201).json({ feedback: result.recordset[0] });
  } catch (err) {
    console.error('managerController.addFeedback error:', err);
    return res.status(500).json({ message: 'Failed to add feedback', error: err.message });
  }
};

exports.getEmployeeFeedback = async (req, res) => {
  const { empId } = req.params;
  if (!empId) return res.status(400).json({ message: 'Missing empId' });

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('empId', sql.Int, empId)
      .query(`
        SELECT FeedbackID, EmpID, ManagerID, Score, Comments, CreatedAt
        FROM Feedback
        WHERE EmpID = @empId
        ORDER BY CreatedAt DESC
      `);
    return res.json({ feedback: result.recordset || [] });
  } catch (err) {
    console.error('managerController.getEmployeeFeedback error:', err);
    return res.status(500).json({ message: 'Failed to fetch employee feedback', error: err.message });
  }
};
