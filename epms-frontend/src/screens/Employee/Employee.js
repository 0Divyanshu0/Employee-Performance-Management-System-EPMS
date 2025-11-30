// src/screens/Employee/Employee.js
import React, { useEffect, useState } from 'react';
import './Employee.css';

// MUI Icons
import ScoreboardIcon from '@mui/icons-material/Scoreboard';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';

// Components
import Header from '../../components/Header/Header.js';
import Sidebar from '../../components/Sidebar/Sidebar.js';
import KpiCard from '../../components/KpiCard/KpiCard.js';
import Button from '../../components/Button/Button.js';
import GoalItem from '../../components/GoalItem/GoalItem.js';

// Service
import EmployeeService from '../../services/employee.service';

const EMPLOYEE_NAV_ITEMS = [
  { label: 'Dashboard', path: '#dashboard' },
  { label: 'My Goals', path: '#goals' },
];
const MANAGER_NAV_ITEMS = [
  { label: 'Dashboard', path: '/manager/dashboard' },
  { label: 'Team Reviews', path: '/manager/reviews' },
  { label: 'Reports', path: '/manager/reports' },
];

const Employee = ({ userId: propUserId, firstName: propFirstName = 'User', userRole = 'Employee', onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // data state
  const [latestScore, setLatestScore] = useState(null);
  const [goals, setGoals] = useState([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, complete: 0 });

  // ui state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [tempProgress, setTempProgress] = useState(0);

  // special flag: show "unmapped" UI if Users exists but no EmployeeDetails mapped
  const [isUnmapped, setIsUnmapped] = useState(false);

  // Resolve userId from (1) prop, (2) sessionStorage (userID), (3) localStorage (userId)
  // This tolerates different naming used across your app.
  const resolvedUserId = propUserId
    || (typeof window !== 'undefined' && (sessionStorage.getItem('userID') || sessionStorage.getItem('userId')))
    || (typeof window !== 'undefined' && (localStorage.getItem('userId') || localStorage.getItem('userID')))
    || null;

  const firstName = propFirstName || (typeof window !== 'undefined' ? sessionStorage.getItem('firstName') || localStorage.getItem('firstName') : 'User');

  const navItems = userRole === 'Employee' ? EMPLOYEE_NAV_ITEMS : MANAGER_NAV_ITEMS;

  const mapApiGoalToUi = (g) => ({
    id: g.GoalID ?? g.goalId ?? g.id,
    title: g.Title ?? g.title,
    progress: Number(g.CompletionPercent ?? g.completionPercent ?? 0),
    status: g.Status ?? g.status ?? (Number(g.CompletionPercent ?? g.completionPercent ?? 0) === 100 ? 'Complete' : 'In Progress'),
    assignedBy: g.AssignedBy ?? g.assignedBy ?? null,
    createdAt: g.CreatedAt ?? g.createdAt ?? null,
  });

  const loadDashboard = async () => {
    if (!resolvedUserId) {
      setError('Missing userId: please login.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setIsUnmapped(false);

      const payload = await EmployeeService.fetchEmployeeDashboard(resolvedUserId);

      setLatestScore(payload.latestScore ?? null);

      const apiGoals = Array.isArray(payload.goals) ? payload.goals : [];
      setGoals(apiGoals.map(mapApiGoalToUi));

      setSummary(payload.summary ?? {
        total: apiGoals.length,
        active: apiGoals.filter(g => (g.Status ?? '').toLowerCase() !== 'complete').length,
        complete: apiGoals.filter(g => (g.Status ?? '').toLowerCase() === 'complete').length,
      });

      setIsUnmapped(false);
    } catch (err) {
      const msg = (err && err.message) ? err.message : String(err);
      console.error('Error loading employee dashboard', err);

      if (msg.toLowerCase().includes('employee not found')) {
        setIsUnmapped(true);
        setLatestScore(null);
        setGoals([]);
        setSummary({ total: 0, active: 0, complete: 0 });
        setError(null);
      } else {
        setError(msg || 'Failed to load dashboard.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedUserId]);

  // edit handlers
  const startEditing = (goal) => {
    setEditingGoalId(goal.id);
    setTempProgress(goal.progress);
  };

  const cancelEditing = () => {
    setEditingGoalId(null);
    setTempProgress(0);
  };

  const saveProgress = async () => {
    if (editingGoalId === null) return;

    const prev = goals.map(g => ({ ...g }));
    setGoals(curr => curr.map(g => g.id === editingGoalId ? { ...g, progress: Number(tempProgress), status: Number(tempProgress) === 100 ? 'Complete' : 'In Progress' } : g));
    setEditingGoalId(null);
    setTempProgress(0);

    try {
      const res = await EmployeeService.updateGoalProgress(editingGoalId, Number(tempProgress));
      const updated = res?.updated ?? res;
      if (updated) {
        const updatedUi = mapApiGoalToUi(updated);
        setGoals(curr => curr.map(g => g.id === updatedUi.id ? updatedUi : g));
      }
      await loadDashboard();
    } catch (err) {
      console.error('Failed to save goal progress', err);
      setGoals(prev);
      setError('Failed to save progress. Try again.');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleContactHR = () => {
    const hrEmail = 'hr@yourcompany.com';
    const subject = encodeURIComponent(`Please map my account: ${resolvedUserId}`);
    const body = encodeURIComponent(`Hi HR,\n\nMy account (UserID: ${resolvedUserId}, Name: ${firstName}) is not mapped to EmployeeDetails in the EPMS database. Please help map me so I can see my goals and scores.\n\nThanks.`);
    window.location.href = `mailto:${hrEmail}?subject=${subject}&body=${body}`;
  };

  const overallScoreText = latestScore ? `${Number(latestScore.Score ?? latestScore.score ?? 0).toFixed(2)} / 10` : '0 / 10';
  const activeGoalsText = `${summary.active ?? goals.filter(g => g.status?.toLowerCase() !== 'complete').length} active`;
  const completedText = `${summary.complete ?? 0} completed`;

  const handleNavigate = (path) => {
    setSidebarOpen(false);
    if (path.startsWith('#')) {
      const id = path.substring(1);
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="employee-dashboard">
    <Header
    userName={firstName}
    userRole={userRole}
    notifications={3}
    onLogout={onLogout}
    onMenuClick={() => setSidebarOpen(true)}
    showMenuIcon={false}   // ✅ Hide menu icon ONLY for Employee
/>


      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} navItems={navItems} onNavigate={handleNavigate} />

      <main className="dashboard-content">
        <section className="welcome-section" id="dashboard">
          <h1 className="welcome-title"><b>Employee Dashboard</b></h1>
        </section>

        {loading && <div style={{ padding: 16 }}>Loading dashboard...</div>}
        {error && <div style={{ padding: 16, color: 'crimson' }}>{error}</div>}

        {isUnmapped && (
          <div style={{ margin: '12px 0', padding: 16, borderRadius: 8, background: '#fff7e6', border: '1px solid #ffecb3' }}>
            <strong>Your account isn't mapped yet</strong>
            <p style={{ margin: '8px 0' }}>
              We couldn't find an Employee profile for <code>{resolvedUserId}</code>.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button onClick={handleContactHR} size="sm" color="secondary">Contact HR / Admin</Button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            <section className="kpi-overview">
              <KpiCard title="Overall Score" content={overallScoreText} IconComponent={ScoreboardIcon} />
              <KpiCard title="Active Goals" content={activeGoalsText} details={completedText} IconComponent={TrackChangesIcon} />
            </section>

            <section className="goals-section" id="goals">
              <h2 className="goals-title">My Goals</h2>
              <p className="goals-subtitle">Track your progress toward your objectives</p>
              <div className="goals-scroll-container">
              <div className="goals-list">
                {goals.length === 0 && <div style={{ padding: 16 }}>No goals found.</div>}

                {goals.map(goal => {
                  const isEditing = editingGoalId === goal.id;
                  const isComplete = Number(goal.progress) === 100;

                  return (
                    <div key={goal.id} className={`goal-row ${isComplete ? 'goal-complete' : ''}`}>
                      <div className="goal-left">
                        <GoalItem title={goal.title} progress={isEditing ? tempProgress : goal.progress} />
                      </div>

                      <div className="goal-right">
                        {!isEditing ? (
                          <div className="action-group">
                            <Button onClick={() => startEditing(goal)} size="sm" color="secondary" className="edit-btn">Edit</Button>
                          </div>
                        ) : (
                          <div style={{ width: '100%' }} className="edit-group">
                            <div className="slider-wrap">
                              <label htmlFor={`slider-${goal.id}`}>Progress: <strong>{tempProgress}%</strong></label>
                              <input id={`slider-${goal.id}`} type="range" min="0" max="100" value={tempProgress} onChange={(e) => setTempProgress(Number(e.target.value))} />
                            </div>

                            <div className="edit-actions" style={{ marginTop: 6 }}>
                              <Button onClick={cancelEditing} size="sm" color="tertiary" className="cancel-btn">Cancel</Button>
                              <Button onClick={saveProgress} size="sm" color="primary" className="save-btn">Save</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Employee;