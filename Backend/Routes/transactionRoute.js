const express = require("express");
const {
    seedDatabase,
    listTransactions,
    getStatistics,
    getBarChartData,
    getPieChartData,
    getCombinedData
} = require('../Controller/transactionController');

const router = express.Router();

// Route to seed the database
router.get('/seed', seedDatabase);

// Route for listing transactions
router.get('/', listTransactions);

// Route for getting statistics
router.get('/statistics', getStatistics);

// Route for getting bar chart data
router.get('/bar-chart', getBarChartData);

// Route for getting pie chart data
router.get('/pie-chart', getPieChartData);

// Route for combined data
router.get('/combined', getCombinedData);

module.exports = router;