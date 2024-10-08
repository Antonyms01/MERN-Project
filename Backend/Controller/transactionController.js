const Transaction = require('../Models/Transaction');
const axios = require('axios');

//1 Seeding database
const seedDatabase = async (req, res) => {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        const transactions = response.data;

        // Clear existing data
        await Transaction.deleteMany({}); 

        //Save new transaction
        await Transaction.insertMany(transactions);

        res.status(200).send('Database seeded with transaction data');
    } catch (error) {
        console.error('Error seeding database:', error);
        res.status(500).send('Error seeding database');
    }
}; 


//2. All transaction(filter transaction using title, desc, price)
const listTransactions = async (req, res) => {
    const { month, page = 1, perPage = 10, minPrice, maxPrice, title, description } = req.query;

    if (!month) {
        return res.status(400).send("Month is required");
    }

    // Convert month name to month number (0-11) and add 1 to get 1-12
    const monthNumber = new Date(Date.parse(month + " 1, 2020")).getMonth() + 1; // January = 1

    
    const baseQuery = {
        $expr: {
            $eq: [{ $month: "$dateOfSale" }, monthNumber] // Compare the month of dateOfSale with monthNumber
        }
    };

    
    if (minPrice !== undefined && maxPrice !== undefined) {
        baseQuery.price = { $gte: Number(minPrice), $lte: Number(maxPrice) }; // Filter by price range
    } else if (minPrice !== undefined) {
        baseQuery.price = { $gte: Number(minPrice) }; // Filter by minimum price
    } else if (maxPrice !== undefined) {
        baseQuery.price = { $lte: Number(maxPrice) }; // Filter by maximum price
    }

    if (title) {
        baseQuery.title = { $regex: title, $options: 'i' }; // Case-insensitive regex match for title
    }
    if (description) {
        baseQuery.description = { $regex: description, $options: 'i' }; // Case-insensitive regex match for description
    }

    try {
        const total = await Transaction.countDocuments(baseQuery);

        const transactions = await Transaction.find(baseQuery)
            .skip((page - 1) * perPage)
            .limit(Number(perPage));

        const filteredTransactions = transactions.map(transaction => ({
            title: transaction.title,
            description: transaction.description,
            price: transaction.price,
            dateOfSale: transaction.dateOfSale,
            category: transaction.category,
            sold: transaction.sold
        }));

        res.json({
            total,
            transactions: filteredTransactions,
            currentPage: page,
            totalPages: Math.ceil(total / perPage)
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).send("Internal Server Error");
    }
    
};



//3. Statistics
const getStatistics = async (req, res) => {
    const { month } = req.query;

    if (!month) {
        return res.status(400).send("Month is required");
    }

    const monthNumber = new Date(Date.parse(month + " 1, 2020")).getMonth() + 1;

    try {
        const statistics = await fetchStatisticsData(monthNumber);
        res.json(statistics);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};


//4.Barchart

const getBarChartData = async (req, res) => {
    const { month } = req.query;

    if (!month) {
        return res.status(400).send("Month is required");
    }

    const monthNumber = new Date(Date.parse(month + " 1, 2020")).getMonth() + 1;

    try {
        const barChartData = await fetchBarChartData(monthNumber);
        res.json(barChartData);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};


//5 Piechart
const getPieChartData = async (req, res) => {
    const { month } = req.query;

    if (!month) {
        return res.status(400).send("Month is required");
    }

    const monthNumber = new Date(Date.parse(month + " 1, 2020")).getMonth() + 1;

    try {
        const pieChartData = await fetchPieChartData(monthNumber);
        res.json(pieChartData);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};


//6. Combined data of all above api
const getCombinedData = async (req, res) => {
    const { month } = req.query;

    if (!month) {
        return res.status(400).send("Month is required");
    }

    const monthNumber = new Date(Date.parse(month + " 1, 2020")).getMonth() + 1;

    try {
        const [statistics, barChartData, pieChartData] = await Promise.all([
            fetchStatisticsData(monthNumber),
            fetchBarChartData(monthNumber),
            fetchPieChartData(monthNumber)
        ]);

        res.json({
            statistics,
            barChartData,
            pieChartData
        });
    } catch (error) {
        console.error("Error fetching combined data:", error);
        res.status(500).send("Internal Server Error");
    }
};




// Fetch statistics data
const fetchStatisticsData = async (monthNumber) => {
    try {
        const soldItemsCount = await Transaction.countDocuments({
            $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber] },
            sold: true
        });

        const totalSales = await Transaction.aggregate([
            {
                $match: {
                    $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber] },
                    sold: true
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$price' }
                }
            }
        ]);

        const unsoldItemsCount = await Transaction.countDocuments({
            $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber] },
            sold: false
        });

        return {
            totalSales: totalSales[0] ? totalSales[0].total : 0,
            totalSoldItems: soldItemsCount,
            totalNotSoldItems: unsoldItemsCount
        };
    } catch (error) {
        throw new Error('Error fetching statistics data');
    }
};

// Fetch bar chart data
const fetchBarChartData = async (monthNumber) => {
    const ranges = [
        { min: 0, max: 100 },
        { min: 101, max: 200 },
        { min: 201, max: 300 },
        { min: 301, max: 400 },
        { min: 401, max: 500 },
        { min: 501, max: 600 },
        { min: 601, max: 700 },
        { min: 701, max: 800 },
        { min: 801, max: 900 },
        { min: 901, max: Infinity }
    ];

    return await Promise.all(ranges.map(async (range) => {
        const count = await Transaction.countDocuments({
            price: { $gte: range.min, $lt: range.max },
            $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber] }
        });

        return { range: `${range.min}-${range.max === Infinity ? 'above' : range.max}`, count };
    }));
};

// Fetch pie chart data
const fetchPieChartData = async (monthNumber) => {
    return await Transaction.aggregate([
        {
            $match: {
                $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber] }
            }
        },
        {
            $group: {
                _id: '$category',
                count: { $sum: 1 }
            }
        }
    ]);
};




module.exports = {
    seedDatabase,
    listTransactions,
    getStatistics,
    getBarChartData,
    getPieChartData,
    getCombinedData
};