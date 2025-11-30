// epms-frontend/src/services/HRdashboard.service.js

const API_URL = 'http://localhost:5000/api/hr';


const calculateAvgScoreByDept = (feedbackList) => {
  if (!Array.isArray(feedbackList) || feedbackList.length === 0) {
    return { labels: [], datasets: [] };
  }

  const deptScores = {}; // { DeptName: { sum: number, count: number } }

  feedbackList.forEach(item => {

    const dept = item.department ?? 'Unknown';
    const score = Number(item.score ?? 0);

    if (!deptScores[dept]) deptScores[dept] = { sum: 0, count: 0 };
    deptScores[dept].sum += isNaN(score) ? 0 : score;
    deptScores[dept].count += 1;
  });

  const labels = Object.keys(deptScores);
  const data = labels.map(label => {
    const { sum, count } = deptScores[label];
    return count === 0 ? 0 : Number((sum / count).toFixed(2));
  });

  return {
    labels,
    datasets: [{
      label: 'Average Score',
      data,
      backgroundColor: ['#006A6A', '#8C5A5A', '#F0EDE1', '#A9BCD0', '#D4BEBE']
    }]
  };
};

// Added 'export' to make it a named export
export const getDashboardData = async () => {
  try {
    const response = await fetch(`${API_URL}/dashboard-data`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      // Try to parse error detail from server if available
      let errMsg = 'Failed to fetch dashboard data';
      try {
        const errBody = await response.json();
        errMsg = errBody.message || errMsg;
      } catch (_) {
        // --- FIX: Removed the stray '_' from this block ---
        // ignore JSON parse errors
      }
      throw new Error(errMsg);
    }

    const data = await response.json();

    // Debug logs to inspect server payload during development
    // Remove or reduce logs in production
    console.log('HR Service: Raw server payload:', data);

    // Defensive extraction of nested shapes
    const rawKpis = data?.kpis ?? {};
    const rawAnalytics = data?.analytics ?? {};
    const rawHeadcount = rawAnalytics?.headcountByDept ?? { labels: [], data: [] };
    const rawTurnover = rawAnalytics?.turnoverByDept ?? { labels: [], data: [] };
    const feedback = Array.isArray(data?.feedback) ? data.feedback : [];

    // Ensure numeric arrays (Chart.js expects numbers)
    const headcountLabels = Array.isArray(rawHeadcount.labels) ? rawHeadcount.labels : [];
    const headcountData = (Array.isArray(rawHeadcount.data) ? rawHeadcount.data : []).map(v => Number(v || 0));

    const turnoverLabels = Array.isArray(rawTurnover.labels) ? rawTurnover.labels : [];
    const turnoverData = (Array.isArray(rawTurnover.data) ? rawTurnover.data : []).map(v => Number(v || 0));

    // Build transformed objects matching component expectation
    const transformedData = {
      kpis: {
        totalEmployees: Number(rawKpis.totalEmployees ?? 0),
        averageScore: Number(rawKpis.averageScore ?? 0)
      },

      analytics: {
        deptHeadcountData: {
          labels: headcountLabels,
          datasets: [{
            label: 'Headcount',
            data: headcountData,
            borderRadius: 4,
            backgroundColor: '#006666' // keep single color here; component can apply gradients
          }]
        },

        turnoverByDeptData: {
          labels: turnoverLabels,
          datasets: [{
            label: 'Turnover',
            data: turnoverData,
            backgroundColor: ['#006A6A', '#8C5A5A', '#F0EDE1', '#A9BCD0', '#D4BEBE']
          }]
        },

        avgScoreData: calculateAvgScoreByDept(feedback)
      },

      feedback // pass the raw feedback array through (objects as returned by server)
    };

    // Final debug log (transformed)
    console.log('HR Service: Transformed payload for UI:', transformedData);

    return transformedData;
  } catch (error) {
    // Helpful error log for dev + bubble up to caller
    console.error('HR Service: getDashboardData error:', error);
    throw error;
  }
}

// No transformation just getting data.