const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../schemas/User');
const Category = require('../schemas/Category');

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://lazybone300_db_user:To8OFcuPArR4t6kK@cluster0.ivmiewn.mongodb.net/?appName=Cluster0");
        console.log('MongoDB connected');
        await User.syncIndexes();
        console.log('User indexes synced');
        await Category.syncIndexes();
        console.log('Category indexes synced');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
