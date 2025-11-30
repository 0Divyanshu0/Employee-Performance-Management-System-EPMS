// src/services/manager.service.js
const API_BASE = 'http://localhost:5000/api/manager';

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    let errText = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      errText = body.message || JSON.stringify(body);
    } catch {}
    const err = new Error(errText);
    err.status = res.status;
    throw err;
  }
  // Some endpoints return 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

const getManagerDashboard = async (managerId) => {
  return request(`${API_BASE}/dashboard/${encodeURIComponent(managerId)}`);
};

const addGoal = async (empId, title, managerId, description = '') => {
  return request(`${API_BASE}/goal`, {
    method: 'POST',
    body: JSON.stringify({ EmpID: empId, Title: title, AssignedBy: managerId, Description: description }),
  });
};

const deleteGoal = async (goalId) => {
  return request(`${API_BASE}/goal/${encodeURIComponent(goalId)}`, { method: 'DELETE' });
};

const updateGoalProgress = async (goalId, completionPercent) => {
  return request(`${API_BASE}/goal/${encodeURIComponent(goalId)}/progress`, {
    method: 'PUT',
    body: JSON.stringify({ CompletionPercent: Number(completionPercent) }),
  });
};

const addFeedback = async (empId, managerId, score, comments = '') => {
  return request(`${API_BASE}/feedback`, {
    method: 'POST',
    body: JSON.stringify({ EmpID: empId, ManagerID: managerId, Score: Number(score), Comments: comments }),
  });
};

const getEmployeeFeedback = async (empId) => {
  return request(`${API_BASE}/feedback/${encodeURIComponent(empId)}`);
};

export default {
  getManagerDashboard,
  addGoal,
  deleteGoal,
  updateGoalProgress,
  addFeedback,
  getEmployeeFeedback,
};
