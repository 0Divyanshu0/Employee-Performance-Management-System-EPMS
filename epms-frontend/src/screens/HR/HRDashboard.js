import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { CSVLink } from 'react-csv';

// --- REUSABLE COMPONENT IMPORTS ---
import Header from '../../components/Header/Header.js';
import Sidebar from '../../components/Sidebar/Sidebar.js';
import KpiCard from '../../components/KpiCard/KpiCard.js';
import Button from '../../components/Button/Button.js';
import AnalyticsChart from './components/AnalyticsChart/AnalyticsChart.js';
import ManagerFeedbackList from './components/ManagerFeedbackList/ManagerFeedbackList.js';

// --- MUI ICON IMPORTS ---
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// --- IMPORT THE NEW SERVICE ---
import { getDashboardData } from '../../services/hrdashboard.service.js';

// --- IMPORT BASE CSS ---
import './HRDashboard.css';

// --- Define Navigation Items ---
const HR_NAV_ITEMS = [
  { label: "Dashboard", path: "/hr" },
  { label: "Analytics", path: "/hr/analytics" },
];

const HRDashboard = ({ firstName, userRole, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // --- STATE FOR DYNAMIC DATA ---
  const [kpiData, setKpiData] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({
    deptHeadcountData: { labels: [], datasets: [] },
    turnoverByDeptData: { labels: [], datasets: [] },
    avgScoreData: { labels: [], datasets: [] },
  });
  const [managerFeedbackData, setManagerFeedbackData] = useState([]);

  const [csvData, setCsvData] = useState({
    headcount: [],
    turnover: [],
    scores: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Don't use useffect for api call.

  // --- USEEFFECT TO FETCH DATA ON MOUNT ---
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getDashboardData();

        // --- 1. KPI DATA ---
        setKpiData([
          {
            title: 'Total Employees',
            content: data.kpis.totalEmployees.toString(),
            IconComponent: PeopleIcon,
          },
          {
            title: 'Avg. Score',
            content: `${data.kpis.averageScore.toFixed(2)}/10`,
            IconComponent: TrendingUpIcon,
          },
        ]);

        // --- 2. ANALYTICS DATA (WITH GRADIENT) ---
        const headcountDataWithGradient = {
          ...data.analytics.deptHeadcountData,
          datasets: [
            {
              ...data.analytics.deptHeadcountData.datasets[0],
              backgroundColor: (context) => {
                const chart = context.chart;
                const { ctx, chartArea } = chart;
                if (!chartArea) return null;
                const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                gradient.addColorStop(0, '#f7f6f6ff');
                gradient.addColorStop(0.5, '#d4d3bcff');
                gradient.addColorStop(1, '#d4d3a8');
                return gradient;
              },
            },
          ],
        };

        setAnalyticsData({
          deptHeadcountData: headcountDataWithGradient,
          turnoverByDeptData: data.analytics.turnoverByDeptData,
          avgScoreData: data.analytics.avgScoreData,
        });

        // --- 3. CSV EXPORT DATA ---
        setCsvData({
          headcount: data.analytics.deptHeadcountData.labels.map((label, index) => ({
            Department: label,
            Headcount: data.analytics.deptHeadcountData.datasets[0]?.data[index] || 0,
          })),
          turnover: data.analytics.turnoverByDeptData.labels.map((label, index) => ({
            Department: label,
            Turnover: data.analytics.turnoverByDeptData.datasets[0]?.data[index] || 0,
          })),
          scores: data.analytics.avgScoreData.labels.map((label, index) => ({
            Department: label,
            AverageScore: data.analytics.avgScoreData.datasets[0]?.data[index] || 0,
          })),
        });

        // --- 4. FEEDBACK DATA ---
        setManagerFeedbackData(data.feedback);
      } catch (err) {
        console.error('ERROR loading dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleNavigate = (path) => {
    setSidebarOpen(false);
    navigate(path);
  };

  // Props to pass down to child views
  const homeProps = { isLoading, error, kpiData, managerFeedbackData };
  const analyticsProps = { isLoading, error, analyticsData, csvData, CSVLink, Button };

  return (
    <div className="hr-dashboard">
      <Header
        userName={firstName}
        userRole={userRole}
        notifications={5}
        onLogout={onLogout}
        onMenuClick={() => setSidebarOpen(true)}
      />

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navItems={HR_NAV_ITEMS}
        onNavigate={handleNavigate}
      />

      <main className="hr-dashboard-content">
        <Routes>
          <Route index element={<HRHomeView {...homeProps} />} />
          <Route path="analytics" element={<AnalyticsView {...analyticsProps} />} />
        </Routes>
      </main>
    </div>
  );
};

// --- Child Component 1: HR Home View ---
const HRHomeView = ({ isLoading, error, kpiData, managerFeedbackData }) => {
  if (isLoading) {
    return <div className="hr-loading-message">Loading Dashboard Data...</div>;
  }

  if (error) {
    return <div className="hr-error-message">Error: {error}</div>;
  }

  return (
    <>
      <section className="hr-welcome-section" id="dashboard">
        <h1 className="hr-welcome-title"><b>HR Dashboard</b></h1>
      </section>

      <section className="hr-kpi-overview">
        {kpiData.map((kpi, index) => (
          <KpiCard
            key={index}
            title={kpi.title}
            content={kpi.content}
            IconComponent={kpi.IconComponent}
          />
        ))}
      </section>

      <section className="hr-feedback-section" id="feedback">
        <h2 className="hr-section-title">Manager Feedback</h2>
        <ManagerFeedbackList feedbackList={managerFeedbackData} />
      </section>
    </>
  );
};

// --- Child Component 2: Analytics View ---
const AnalyticsView = ({ isLoading, error, analyticsData, csvData, CSVLink, Button }) => {

  if (isLoading) {
    return <div className="hr-loading-message">Loading Analytics Data...</div>;
  }

  if (error) {
    return <div className="hr-error-message">Error: {error}</div>;
  }

  return (
    <section className="hr-analytics-section" id="analytics">
      <div className="hr-section-header">
        <h2 className="hr-section-title">Department Analytics</h2>
        <div className="hr-export-buttons">
          
          <CSVLink
            data={csvData.headcount}
            filename={"department-headcount.csv"}
            className="csv-link"
            target="_blank"
          >
            <Button size="sm" color="primary">Export Headcount</Button>
          </CSVLink>

          <CSVLink
            data={csvData.turnover}
            filename={"department-turnover.csv"}
            className="csv-link"
            target="_blank"
          >
            <Button size="sm" color="primary">Export Turnover</Button>
          </CSVLink>

          <CSVLink
            data={csvData.scores}
            filename={"department-average-score.csv"}
            className="csv-link"
            target="_blank"
          >
            <Button size="sm" color="primary">Export Scores</Button>
          </CSVLink>
        </div>
      </div>

      <div className="hr-charts-container">
        <AnalyticsChart
          type="bar"
          title="Department Headcount"
          data={analyticsData.deptHeadcountData}

        />
        <AnalyticsChart
          type="doughnut"
          title="Turnover by Department"
          data={analyticsData.turnoverByDeptData}
        />
        <AnalyticsChart
          type="pie"
          title="Average Score by Dept"
          data={analyticsData.avgScoreData}
        />
      </div>
    </section>
  );
};

export default HRDashboard;