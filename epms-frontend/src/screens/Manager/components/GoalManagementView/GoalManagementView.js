import React, { useEffect, useState } from 'react';
import Button from '../../../../components/Button/Button.js';

// Import this component's specific CSS
import './GoalManagementView.css';

// This is the view for the "Goal Management" route
const GoalManagementView = (props) => {
  const {
    loading,
    error,
    team,
    goals,
    getEmployeeFullName,
    handleDeleteGoal,
  } = props;

  const [openEmployeeId, setOpenEmployeeId] = useState(null);

  useEffect(() => {
    if (team && team.length > 0) {
      setOpenEmployeeId(team[0].EmpID);
    }
  }, [team]);

  if (loading) return <div className="hr-loading-message">Loading goals...</div>;
  if (error) return <div className="hr-error-message">Error: {error}</div>;

  return (
    <section className="team-overview-section" id="goal-management">
      <h2 className="section-title">Goals Management (Team)</h2>

      {team.length === 0 && <div style={{ padding: 12 }}>No team members found.</div>}

      {team.map((emp) => {
        const employeeGoals = goals.filter((g) => String(g.EmpID) === String(emp.EmpID));
        const isOpen = openEmployeeId === emp.EmpID;

        return (
          <div key={emp.EmpID} className="employee-goal-group">
            <h3 className="employee-goal-header" onClick={() => setOpenEmployeeId(isOpen ? null : emp.EmpID)}>
              Goals for {getEmployeeFullName(emp)}
              <span className={`accordion-arrow ${isOpen ? 'open' : ''}`}>&#9660;</span>
            </h3>

            {isOpen && (
              <div className="manager-goals-list">
                {employeeGoals.length === 0 && (
                  <div style={{ padding: 12, fontSize: '14px', color: '#666' }}>
                    No goals assigned to this employee yet.
                  </div>
                )}

                {employeeGoals.map((g) => {
                  const progress = g.CompletionPercent ?? 0;
                  return (
                    <div key={g.GoalID} className="manager-goal-item">
                      <div className="goal-meta">
                        <div className="goal-title">
                          <strong>{g.Title}</strong>
                        </div>
                        <div className="goal-progress-bar-container">
                          <div
                            className="goal-progress-bar-fill"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <div className="goal-progress-text">{progress}% Complete</div>
                        <div className="goal-assigned">
                          {g.Description && <small>{g.Description}</small>}
                        </div>
                      </div>
                      <div className="goal-actions">
                        <Button
                          size="sm"
                          color="primary" 
                          onClick={() => handleDeleteGoal(g.GoalID)}
                          className="remove-goal-btn"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
};

export default GoalManagementView;