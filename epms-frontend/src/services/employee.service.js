// epms-frontend/src/services/employee.service.js
const API_URL = 'http://localhost:5000/api/employee';

async function fetchEmployeeDashboard(userId) {
  if (!userId) throw new Error('userId is required');
  const res = await fetch(`${API_URL}/${encodeURIComponent(userId)}/dashboard`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || 'Failed to fetch employee dashboard');
  }
  return res.json();
}

async function fetchEmployeeGoals(userId) {
  if (!userId) throw new Error('userId is required');
  const res = await fetch(`${API_URL}/${encodeURIComponent(userId)}/goals`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || 'Failed to fetch employee goals');
  }
  return res.json();
}

async function updateGoalProgress(goalId, completionPercent) {
  if (goalId === undefined || goalId === null) throw new Error('goalId is required');
  if (completionPercent === undefined || completionPercent === null) throw new Error('completionPercent is required');

  const res = await fetch(`${API_URL}/goals/${encodeURIComponent(goalId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completionPercent }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || 'Failed to update goal');
  }

  return res.json();
}

const EmployeeService = {
  fetchEmployeeDashboard,
  fetchEmployeeGoals,
  updateGoalProgress,
};

export default EmployeeService;
