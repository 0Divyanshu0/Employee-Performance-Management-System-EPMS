// epms-backend/controllers/hrController.js
// epms-backend/controllers/hrController.js
const { poolPromise, sql } = require('../db');

/**
 * GET /api/hr/dashboard-data
 * Response:
 * {
 *   kpis: { totalEmployees, averageScore },
 *   analytics: {
 *     headcountByDept: { labels: [], data: [] },
 *     turnoverByDept: { labels: [], data: [] }
 *   },
 *   feedback: [...]
 * }
 */
/**
 * GET /api/hr/dashboard-data
 * Response:
 * {
 *   kpis: { totalEmployees, averageScore },
 *   analytics: {
 *     headcountByDept: { labels: [], data: [] },
 *     turnoverByDept: { labels: [], data: [] }
 *   },
 *   feedback: [...]
 * }
 */
exports.getDashboardData = async (req, res) => {
  try {
    const pool = await poolPromise;

    // 1) KPI: totalEmployees (Employees + Managers) and averageScore
    // totalEmployees counts Users with role Employee or Manager
    const kpiQuery = `
      SELECT
        (SELECT COUNT(1) FROM Users WHERE UserRole IN ('Employee','Manager')) AS totalEmployees,
        (SELECT CASE WHEN COUNT(1)=0 THEN 0 ELSE CAST(AVG(CAST(Score AS FLOAT)) AS DECIMAL(9,2)) END FROM Feedback) AS averageScore;
    `;
    const kpiResult = await pool.request().query(kpiQuery);
    const kpiRow = kpiResult.recordset[0] || { totalEmployees: 0, averageScore: 0 };

    // 2) Headcount by department (Employees + Managers assigned to employees in that dept)
    //
    // We avoid using Users.DeptID because your Users table doesn't have that column.
    // Instead:
    //  - employeesCount = count of EmployeeDetails rows for that DeptID
    //  - managersCount  = count of DISTINCT ManagerID values present on EmployeeDetails for that DeptID
    // This gives a reasonable per-department "headcount including managers" without relying
    // on Users having a DeptID column.
    const headcountQuery = `
      SELECT
        d.DeptName,
        ISNULL(emp.EmployeeCount, 0) + ISNULL(mgr.ManagerCount, 0) AS Headcount
      FROM Departments d
      LEFT JOIN (
        SELECT DeptID, COUNT(1) AS EmployeeCount
        FROM EmployeeDetails
        GROUP BY DeptID
      ) emp ON emp.DeptID = d.DeptID
      LEFT JOIN (
        SELECT DeptID, COUNT(DISTINCT ManagerID) AS ManagerCount
        FROM EmployeeDetails
        WHERE ManagerID IS NOT NULL
        GROUP BY DeptID
      ) mgr ON mgr.DeptID = d.DeptID
      ORDER BY d.DeptName;
    `;
    const headcountResult = await pool.request().query(headcountQuery);
    const headcountLabels = headcountResult.recordset.map(r => r.DeptName);
    const headcountData = headcountResult.recordset.map(r => Number(r.Headcount));

    // 3) Turnover by department (using DepartmentRevenue table)
    const turnoverQuery = `
      SELECT d.DeptName AS DeptName, ISNULL(dr.Revenue,0) AS Revenue
      FROM Departments d
      LEFT JOIN DepartmentRevenue dr ON dr.DeptID = d.DeptID
      ORDER BY d.DeptName;
    `;
    const turnoverResult = await pool.request().query(turnoverQuery);
    const turnoverLabels = turnoverResult.recordset.map(r => r.DeptName);
    const turnoverData = turnoverResult.recordset.map(r => Number(r.Revenue));

    // 4) Recent manager feedback list (most recent 20)
    const feedbackQuery = `
      SELECT TOP (20)
        f.FeedbackID AS id,
        ISNULL(u.FirstName + ' ' + u.LastName, ed.UserID) AS empName,
        f.ManagerID AS managerName,
        d.DeptName AS department,
        f.Score AS score,
        f.Comments AS feedbackText,
        f.CreatedAt
      FROM Feedback f
      INNER JOIN EmployeeDetails ed ON ed.EmpID = f.EmpID
      LEFT JOIN Users u ON u.UserID = ed.UserID
      LEFT JOIN Departments d ON d.DeptID = ed.DeptID
      ORDER BY f.CreatedAt DESC, f.FeedbackID DESC;
    `;
    const feedbackResult = await pool.request().query(feedbackQuery);
    const feedbackRows = feedbackResult.recordset.map(r => ({
      id: r.id,
      empName: r.empName,
      managerName: r.managerName,
      department: r.department,
      score: Number(r.score),
      feedbackText: r.feedbackText,
      createdAt: r.CreatedAt
    }));

    // Compose response
    const response = {
      kpis: {
        totalEmployees: Number(kpiRow.totalEmployees || 0),
        averageScore: Number(kpiRow.averageScore || 0)
      },
      analytics: {
        headcountByDept: {
          labels: headcountLabels,
          data: headcountData
        },
        turnoverByDept: {
          labels: turnoverLabels,
          data: turnoverData
        }
      },
      feedback: feedbackRows
    };

    return res.status(200).json(response);
  } catch (err) {
    console.error('💥 SQL Error getting dashboard data:', err);
    return res.status(500).json({
      message: 'Failed to fetch dashboard data.',
      error: err.originalError?.info?.message || err.message
    });
  }
};
