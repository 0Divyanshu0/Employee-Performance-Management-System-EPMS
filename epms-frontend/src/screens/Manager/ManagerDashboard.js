import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

// Import Core Components
import Header from '../../components/Header/Header.js';
import Sidebar from '../../components/Sidebar/Sidebar.js';

// Import Base CSS
import './ManagerDashboard.css';

// Import Service
import ManagerService from '../../services/manager.service.js';

// Import new child components
import DashboardAndTeamView from './components/DashboardAndTeamView/DashboardAndTeamView.js';
import GoalManagementView from './components/GoalManagementView/GoalManagementView.js';
import ProvideFeedbackModal from './components/ProvideFeedbackModal/ProvideFeedbackModal.js';
import ViewFeedbackModal from './components/ViewFeedbackModal/ViewFeedbackModal.js';
import AddGoalModal from './components/AddGoalModal/AddGoalModal.js';
// NEW: Import the new ConfirmDeleteModal
import ConfirmDeleteModal from './components/ConfirmDeleteModal/ConfirmDeleteModal.js';

const MANAGER_NAV_ITEMS = [
  { label: 'Dashboard', path: '/manager' },
  { label: 'Goal Management', path: '/manager/goals' },
];

const ManagerDashboard = ({ user, firstName, userRole, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data state
  const [team, setTeam] = useState([]);
  const [goals, setGoals] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [kpis, setKpis] = useState({ teamSize: 0, avgGoalCompletion: 0, goalsAssigned: 0, goalsComplete: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals / UI
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showProvideModal, setShowProvideModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null); // NEW: State for delete confirmation

  const [refreshCounter, setRefreshCounter] = useState(0);

  const managerId = user?.id || sessionStorage.getItem('userID') || localStorage.getItem('userId') || null;
  const navigate = useNavigate();

  // Load dashboard payload from backend
  const loadDashboard = async () => {
    if (!managerId) {
      setError('Missing managerId — please login.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const payload = await ManagerService.getManagerDashboard(managerId);
      setTeam(payload.team || []);
      setGoals(payload.goals || []);
      setFeedbacks(payload.feedbacks || []);
      setKpis(payload.kpis || { teamSize: 0, avgGoalCompletion: 0, goalsAssigned: 0, goalsComplete: 0 });
    } catch (err) {
      console.error('loadDashboard error:', err);
      setError(err.message || 'Failed to fetch manager dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [managerId, refreshCounter]);

  // Helper: display full name
  const getEmployeeFullName = (emp) => {
    if (!emp) return '-';
    const first = emp.FirstName ?? emp.firstName ?? '';
    const last = emp.LastName ?? emp.lastName ?? '';
    const display = `${first} ${last}`.trim();
    return display || emp.UserID || emp.userId || '-';
  };

  // Latest score for an employee
  const getLatestScoreForEmployee = (empId) => {
    if (!feedbacks || !feedbacks.length) return '-';
    const empFeedbacks = feedbacks
      .filter((f) => String(f.EmpID) === String(empId))
      .sort((a, b) => {
        const ta = a.CreatedAt ? new Date(a.CreatedAt).getTime() : (a.FeedbackID ?? a.id ?? 0);
        const tb = b.CreatedAt ? new Date(b.CreatedAt).getTime() : (b.FeedbackID ?? b.id ?? 0);
        return tb - ta;
      });
    if (!empFeedbacks.length) return '-';
    const latest = empFeedbacks[0];
    return latest.Score ?? latest.score ?? latest.rating ?? '-';
  };

  // Build EmpID -> employee object map
  const empById = {};
  team.forEach((emp) => {
    if (emp && emp.EmpID != null) empById[String(emp.EmpID)] = emp;
  });

  // UI: navigation handler
  const handleNavigate = (path) => {
    setSidebarOpen(false);
    navigate(path);
  };

  // --- Modal & Action Handlers ---

  const handleAddGoal = (employee) => {
    setSelectedEmployee(employee);
    setShowAddGoalModal(true);
  };

  const submitAddGoal = async (empId, title, description) => {
    try {
      await ManagerService.addGoal(empId, title, managerId, description);
      setShowAddGoalModal(false);
      setRefreshCounter((c) => c + 1);
    } catch (err) {
      console.error('Add goal failed:', err);
      setError(err.message || 'Failed to add goal');
    }
  };

  // UPDATED: This now *opens* the confirmation modal
  const handleDeleteGoal = (goalId) => {
    setGoalToDelete(goalId);
  };
  
  // NEW: This function runs when the user clicks "Delete" in the modal
  const onConfirmDelete = async () => {
    if (!goalToDelete) return;
    try {
      await ManagerService.deleteGoal(goalToDelete);
      setRefreshCounter((c) => c + 1);
    } catch (err) {
      console.error('Delete goal failed:', err);
      setError(err.message || 'Failed to delete goal');
    }
    setGoalToDelete(null); // Close the modal
  };

  // NEW: This function runs when the user clicks "Cancel" in the modal
  const onCancelDelete = () => {
    setGoalToDelete(null);
  };


  const handleUpdateGoalProgress = async (goalId, newPct) => {
    try {
      await ManagerService.updateGoalProgress(goalId, Number(newPct));
      setRefreshCounter((c) => c + 1);
    } catch (err) {
      console.error('Update goal failed:', err);
      setError(err.message || 'Failed to update goal');
    }
  };

  const handleProvideFeedback = (employee) => {
    setSelectedEmployee(employee);
    setShowProvideModal(true);
  };

  const submitFeedback = async (empId, rating, comments) => {
    try {
      await ManagerService.addFeedback(empId, managerId, rating, comments);
      setShowProvideModal(false);
      setRefreshCounter((c) => c + 1);
    } catch (err) {
      console.error('Add feedback failed:', err);
      setError(err.message || 'Failed to submit feedback');
    }
  };

  const handleViewFeedback = (employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

  // Props to pass down to child views
  const pageProps = {
    loading,
    error,
    kpis,
    team,
    goals,
    empById,
    getEmployeeFullName,
    getLatestScoreForEmployee,
    handleProvideFeedback,
    handleViewFeedback,
    handleAddGoal,
    handleDeleteGoal, // This now opens the modal
    handleUpdateGoalProgress,
    setGoals,
  };

  return (
    <div className="manager-dashboard">
      <Header
        userName={firstName}
        userRole={userRole}
        notifications={3}
        onLogout={onLogout}
        onMenuClick={() => setSidebarOpen(true)}
      />

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} navItems={MANAGER_NAV_ITEMS} onNavigate={handleNavigate} />

      <main className="manager-dashboard-content">
        <Routes>
          <Route index element={<DashboardAndTeamView {...pageProps} />} />
          <Route path="goals" element={<GoalManagementView {...pageProps} />} />
        </Routes>
      </main>

      {/* --- Modals --- */}
      {showProvideModal && selectedEmployee && (
        <ProvideFeedbackModal
          employee={selectedEmployee}
          onClose={() => {
            setShowProvideModal(false);
            setSelectedEmployee(null);
          }}
          onSubmit={(empId, rating, comments) => submitFeedback(empId, rating, comments)}
        />
      )}

      {showViewModal && selectedEmployee && (
        <ViewFeedbackModal
          employee={selectedEmployee}
          onClose={() => {
            setShowViewModal(false);
            setSelectedEmployee(null);
          }}
          fetchFeedback={async (empId) => {
            try {
              const res = await ManagerService.getEmployeeFeedback(empId);
              return res.feedback || [];
            } catch (err) {
              console.error('Failed to fetch employee feedback', err);
              return [];
            }
          }}
        />
      )}

      {showAddGoalModal && selectedEmployee && (
        <AddGoalModal
          employee={selectedEmployee}
          onClose={() => {
            setShowAddGoalModal(false);
            setSelectedEmployee(null);
          }}
          onSubmit={(empId, title, description) => submitAddGoal(empId, title, description)}
        />
      )}

      {/* NEW: Render the delete confirmation modal */}
      {goalToDelete && (
        <ConfirmDeleteModal
          onClose={onCancelDelete}
          onConfirm={onConfirmDelete}
        />
      )}
    </div>
  );
};

export default ManagerDashboard;