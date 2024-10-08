// src/components/Statistics.js
import React, { useEffect, useState } from 'react';
import { getStatistics } from '../api/api'; // Import the API function to fetch statistics
import './Statistics.css';

const Statistics = ({ month }) => {
    const [statistics, setStatistics] = useState({
        totalSales: 0,
        totalSoldItems: 0,
        totalNotSoldItems: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to fetch statistics based on the selected month
    const fetchStatistics = async () => {
        setLoading(true);
        try {
            const data = await getStatistics(month); // Fetch statistics
            setStatistics(data); // Update statistics state
            setError(null); // Clear any previous errors
        } catch (err) {
            setError('Error fetching statistics');
            setStatistics({ totalSales: 0, totalSoldItems: 0, totalNotSoldItems: 0 }); // Clear statistics on error
        } finally {
            setLoading(false);
        }
    };

    // Fetch statistics when the month changes
    useEffect(() => {
        fetchStatistics(); // Fetch statistics when the component mounts or month changes
    }, [month]);

    if (loading) return <div>Loading statistics...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="statistics">
            <h3>Statistics for {month}</h3>
            <table className="statistics-table">
                <thead>
                    <tr>
                        <th>Total Sales Amount</th>
                        <th>Total Sold Items</th>
                        <th>Total Not Sold Items</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${statistics.totalSales.toFixed(2)}</td>
                        <td>{statistics.totalSoldItems}</td>
                        <td>{statistics.totalNotSoldItems}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default Statistics;
