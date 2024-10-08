const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const dbConnect = require('./Helpers/dbConnectHelper');
const cors = require('cors');

//Route calling
 const transactionRoute = require("./Routes/transactionRoute");


const dotEnv = require("dotenv").config();

const { notFound, errorHandler } = require("./Middlewares/errorHandler");



// Enable CORS for your React frontend
app.use(cors({
    origin: 'http://localhost:3000', // Replace with your React frontend URL
    credentials: true	
}));

const initialize = async (callback) => {
	let initError;

	try {
		dbConnect();
	} catch (err) {
		initError = err;
	}
	
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: false }));

	// In your app.js or server.js
	app.use('/transaction', transactionRoute);
	
	app.use(notFound);
	app.use(errorHandler);
	app.use(cors());



	callback(initError, app);

}


module.exports = {
	initialize
}