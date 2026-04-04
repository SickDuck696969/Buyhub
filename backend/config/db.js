const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../schemas/User');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
        });
        console.log('MongoDB connected');
        await User.syncIndexes();
        console.log('User indexes synced');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
