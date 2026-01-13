const mongoose = require('mongoose');
const pino = require('pino');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB error:', err);
    }
};


const logger = pino({
    transport: {
        target: 'pino-mongodb',
        options: {
            uri: process.env.MONGO_URI,
            collection: 'logs' 
        }
    }
});

module.exports = { connectDB, logger };