const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://Admin:admin@ritikkhandelwal.rzdel.mongodb.net/amount-management-app?retryWrites=true&w=majority&appName=Ritikkhandelwal");
        console.log('MongoDB connected');
    } catch (err) {
        console.error('Database connection failed:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
