import React from 'react';
import KpiCard from '../../../../components/KpiCard/KpiCard.js';
import Button from '../../../../components/Button/Button.js';
import GroupsIcon from '@mui/icons-material/Groups';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// Import this component's specific CSS
import './DashboardAndTeamView.css';

// This is the view for the "Dashboard" (index) route
const DashboardAndTeamView = (props) => {
  const {
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
  } = props;

  if (loading) return <div className="hr-loading-message">Loading dashboard...</div>;
  if (error) return <div className="hr-error-message">Error: {error}</div>;

  return (
    <>
      <section className="page-title-section" id="dashboard">
        <h1 className="page-title"><b>Manager Dashboard</b></h1>
      </section>

      <section className="kpi-overview-manager">
        <KpiCard title="Team Size" content={String(kpis.teamSize || 0)} IconComponent={GroupsIcon} />
        <KpiCard
          title="Goal Completion"
          content={`${Math.round(kpis.avgGoalCompletion || 0)}%`}
          details={`${kpis.goalsAssigned || 0} team goals`}
          IconComponent={CheckCircleOutlineIcon}
        />
      </section>

      <section className="team-overview-section" id="team-overview">
        <h2 className="section-title">Team Overview</h2>

        <div className="team-table-container">
          <table className="team-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Latest Score</th>
                <th>Goal Progress</th>
                <th>Feedback</th>
                <th>Goals</th>
              </tr>
            </thead>
            <tbody>
              {team.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: 20, textAlign: 'center' }}>
                    No team members found.
                  </td>
                </tr>
              ) : (
                team.map((emp) => {
                  const empGoals = goals.filter((g) => String(g.EmpID) === String(emp.EmpID));
                  const avgProgress = empGoals.length
                    ? Math.round(empGoals.reduce((s, g) => s + Number(g.CompletionPercent ?? 0), 0) / empGoals.length)
                    : 0;
                  const latestScore = getLatestScoreForEmployee(emp.EmpID);

                  return (
                    <tr key={emp.EmpID}>
                      <td>
                        {empById[String(emp.EmpID)] ? getEmployeeFullName(empById[String(emp.EmpID)]) : getEmployeeFullName(emp)}
                      </td>
                      <td>{emp.JobTitle || '-'}</td>
                      <td>{latestScore}</td>
                      <td>{avgProgress}%</td>
                      <td>
                        <div className="action-buttons">
                          <Button size="sm" color="primary" onClick={() => handleProvideFeedback(emp)}>
                            Provide
                          </Button>
                          <Button size="sm" color="secondary" onClick={() => handleViewFeedback(emp)}>
                            View
                          </Button>
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Button size="sm" color="primary" onClick={() => handleAddGoal(emp)}>
                            Add Goal
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
};

export default DashboardAndTeamView;