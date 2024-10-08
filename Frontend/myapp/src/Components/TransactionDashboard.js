import React, { useState, useEffect } from 'react';
import { getTransactions } from '../api/api'; // Your API function to fetch transactions
import Statistics from './Statistics'; // Import the Statistics component
import './TransactionDashboard.css';
import BarChart from './BarChart.js';
const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const searchTypes = [
    { value: 'title', label: 'Title' },
    { value: 'description', label: 'Description' },
    { value: 'price', label: 'Price' }
];

const TransactionDashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [month, setMonth] = useState('March'); // Default to March
    const [searchText, setSearchText] = useState('');
    const [searchType, setSearchType] = useState('title'); // Default search type
    const [minPrice, setMinPrice] = useState(''); // State for minimum price
    const [maxPrice, setMaxPrice] = useState(''); // State for maximum price
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10); // Default 10 items per page

    // Function to fetch transactions based on month and search text
    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const data = await getTransactions(month, searchText, searchType, minPrice, maxPrice, page, perPage);
            setTransactions(data.transactions);
            setError(null); // Clear any previous errors
        } catch (err) {
            setError('Error fetching transactions');
            setTransactions([]); // Clear transactions on error
        } finally {
            setLoading(false);
        }
    };

    // Function to handle search when the button is clicked
    const handleSearch = () => {
        setPage(1); // Reset to page 1 on search
        fetchTransactions(); // Fetch transactions when search button is clicked
    };

    const handleMonthChange = (e) => {
        setMonth(e.target.value);
        setPage(1); // Reset to page 1 on month change
        fetchTransactions(); // Fetch transactions immediately when month changes
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchText(value); // Update the search text state
        
        // If the search box is cleared, fetch transactions for the selected month
        if (value === '') {
            fetchTransactions(); // Fetch transactions for the selected month immediately
        }
    };

    const handleMinPriceChange = (e) => {
        setMinPrice(e.target.value); // Update the minimum price state
    };

    const handleMaxPriceChange = (e) => {
        setMaxPrice(e.target.value); // Update the maximum price state
    };

    const handleSearchTypeChange = (e) => {
        setSearchType(e.target.value); // Update the search type
        setSearchText(''); // Clear search text when changing type
        setMinPrice(''); // Clear minimum price
        setMaxPrice(''); // Clear maximum price
    };

    // Clear all fields and fetch the initial list of transactions for the selected month
    const handleClear = () => {
        setSearchText(''); // Clear search text
        setMinPrice(''); // Clear minimum price
        setMaxPrice(''); // Clear maximum price
        setPage(1); // Reset to page 1
        fetchTransactions(); // Fetch transactions for the selected month immediately
    };

    // Fetch transactions when the component mounts or page changes
    useEffect(() => {
        fetchTransactions(); // Fetch transactions when the component mounts
    }, [month, page, perPage]); // Dependencies to trigger fetching

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="transaction-dashboard">
            <h2>Transaction Dashboard</h2>
            <div className="controls">
                <select onChange={handleSearchTypeChange} value={searchType}>
                    {searchTypes.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                </select>
                {searchType === 'price' ? (
                    <div>
                        <input
                            type="text"
                            placeholder="Min Price"
                            value={minPrice}
                            onChange={handleMinPriceChange}
                        />
                        <input
                            type="text"
                            placeholder="Max Price"
                            value={maxPrice}
                            onChange={handleMaxPriceChange}
                        />
                    </div>
                ) : (
                    <input
                        type="text"
                        placeholder={`Search by ${searchType}`}
                        value={searchText}
                        onChange={handleSearchChange}
                    />
                )}
                <button onClick={handleSearch}>Search</button>
                <button onClick={handleClear}>Clear</button> {/* Clear button */}
                <select value={month} onChange={handleMonthChange}>
                    {months.map((m, index) => (
                        <option key={index} value={m}>{m}</option>
                    ))}
                </select>
            </div>

            {/* Statistics Component */}
           {/* Pass the selected month as a prop */}

            <table className="transactions-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Category</th>
                        <th>Sold</th>
                    </tr>
                </thead>
               
                <tbody>
                    {transactions.length > 0 ? (
                        transactions.map((transaction) => (
                            <tr key={transaction.id}>
                                <td>{transaction.id}</td>
                                <td>{transaction.title}</td>
                                <td>{transaction.description}</td>
                                <td>${transaction.price}</td>
                                <td>{transaction.category}</td>
                                <td>{transaction.sold ? 'Yes' : 'No'}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6">No transactions found</td>
                        </tr>
                    )}
                </tbody>
            </table>
            <div className="pagination">
                <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1}>
                    Previous
                </button>
                <span>Page No: {page}</span>
                <button onClick={() => setPage((prev) => prev + 1)}>Next</button>
                <span>Per Page: {perPage}</span>
            </div>

            <Statistics month={month} /> 
            <BarChart month={month}/>
            
        </div>
    );
};

export default TransactionDashboard;
