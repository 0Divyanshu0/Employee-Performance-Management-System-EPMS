import React from 'react';
import { Bar, Doughnut, Pie, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    LineElement,
    PointElement,
} from 'chart.js';
import './AnalyticsChart.css';

// Register
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    LineElement,
    PointElement
);

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false }
    }
};

const AnalyticsChart = ({ type, title, data, className }) => {

    const renderChart = () => {
        switch (type) {

            /* -------------------------------------------------------
               BAR CHART — APPLY SOLID COLOR ONLY HERE
            --------------------------------------------------------*/
            case 'bar':
                const solidBarData = {
                    ...data,
                    datasets: data.datasets.map(ds => ({
                        ...ds,
                        backgroundColor: "#006666",   // solid color
                        borderRadius: 6
                    }))
                };
                return <Bar data={solidBarData} options={chartOptions} />;

            /* -------------------------------------------------------
               DOUGHNUT CHART — KEEP DEFAULT COLORS (NO CHANGES)
            --------------------------------------------------------*/
            case 'doughnut':
                return (
                    <Doughnut
                        data={data}     // <--- keep original colors
                        options={{
                            ...chartOptions,
                            plugins: { legend: { display: true, position: "bottom" } }
                        }}
                    />
                );

            /* -------------------------------------------------------
               PIE CHART — KEEP DEFAULT COLORS (NO CHANGES)
            --------------------------------------------------------*/
            case 'pie':
                return (
                    <Pie
                        data={data}     // <--- keep original colors
                        options={{
                            ...chartOptions,
                            plugins: { legend: { display: true, position: "bottom" } }
                        }}
                    />
                );

            /* -------------------------------------------------------
               LINE CHART — untouched
            --------------------------------------------------------*/
            case 'line':
                return <Line data={data} options={chartOptions} />;

            default:
                return <p style={{ color: "red" }}>Invalid chart type</p>;
        }
    };

    return (
        <div className={`hr-chart-wrapper ${className || ''}`}>
            <h3 className="hr-chart-title">{title}</h3>
            <div className="hr-chart-inner-wrapper">{renderChart()}</div>
        </div>
    );
};

export default AnalyticsChart;
