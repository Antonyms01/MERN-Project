// src/api/api.js
import axios from 'axios';

const BASE_URL = 'http://localhost:8000'; // Adjust this to match your API's base URL

// Function to get transactions based on filters
// src/api/api.js


// Function to get transactions based on filters
export const getTransactions = async (month, searchText, searchType, minPrice, maxPrice, page, perPage) => {
    try {
        const params = {
            month,
            page,
            perPage,
        };

        // Only add search parameters if they exist
        if (searchType === 'title') {
            params.title = searchText;
        } else if (searchType === 'description') {
            params.description = searchText;
        } else if (searchType === 'price') {
            if (minPrice) params.minPrice = minPrice; // Add minPrice if it has a value
            if (maxPrice) params.maxPrice = maxPrice; // Add maxPrice if it has a value
        }

        const response = await axios.get(`${BASE_URL}/transaction`, { params });
        return response.data; // Return the fetched data
    } catch (error) {
        console.error("Error fetching transactions:", error);
        throw error;
    }
};



// Function to get statistics based on the month
export const getStatistics = async (month) => {
    try {
        const response = await axios.get(`${BASE_URL}/transaction/statistics`, {
            params: { month } // Send the month as a parameter
        });
        return response.data; // Return the fetched data
    } catch (error) {
        console.error("Error fetching statistics:", error);
        throw error;
    }
};

export const getBarChartData = async (month) => {
    try {
        const response = await axios.get(`${BASE_URL}/transaction/bar-chart`, {
            params: { month } // Send the month as a parameter
        });
        return response.data; // Return the fetched data
    } catch (error) {
        console.error("Error fetching pie chart data:", error);
        throw error;
    }
};
