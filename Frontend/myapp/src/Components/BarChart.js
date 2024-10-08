// src/components/BarChart.js
import { getBarChartData } from '../api/api';
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import './TransactionDashboard.css';
Chart.register(CategoryScale, LinearScale, BarElement, Title);


const BarChart = ({ month }) => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [{
            label: 'Number of Items',
            data: [],
            backgroundColor: 'rgba(75, 192, 192, 0.6)', // Color for the bars
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
        }],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to fetch bar chart data based on the selected month
    const fetchBarChartData = async () => {
        setLoading(true);
        try {
            const data = await getBarChartData(month); // Fetch bar chart data from the API
            const labels = data.map(item => item.range); // Assuming your API returns an array of objects with a `range` property
            const values = data.map(item => item.count); // Assuming your API returns an array of objects with a `count` property

            setChartData({
                labels,
                datasets: [{
                    label: 'Number of Items',
                    data: values,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)', // Bar color
                    borderColor: 'rgba(75, 192, 192, 1)', // Bar border color
                    borderWidth: 1
                }],
            });
            setError(null); // Clear any previous errors
        } catch (err) {
            setError('Error fetching bar chart data');
            setChartData({ labels: [], datasets: [{ data: [] }] }); // Clear chart data on error
        } finally {
            setLoading(false);
        }
    };

    // Fetch bar chart data when the month changes
    useEffect(() => {
        fetchBarChartData(); // Fetch bar chart data when the component mounts or month changes
    }, [month]); // Only include 'month' in the dependency array

    if (loading) return <div>Loading bar chart...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div style={{ width: '60%', height: '400px', margin: '0 auto' }}> {/* Adjusted width and height */}
            <h3 style={{ textAlign: 'center' }}>Items Distribution by Price Range for {month}</h3>
            <Bar data={chartData} options={{
                responsive: true,
                maintainAspectRatio: false // Set to false to allow custom sizing
            }} />
        </div>
    );
};

export default BarChart;
