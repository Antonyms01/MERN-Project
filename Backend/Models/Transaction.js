const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    dateOfSale: Date,
    category: String,
    sold: { type: Boolean, default: false } 
});

const Transaction = mongoose.model('Transaction', TransactionSchema);
module.exports = Transaction;
