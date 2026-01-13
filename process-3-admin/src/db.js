/*
 * Database Connection and Logger Configuration
 * This file sets up the connection to MongoDB and configures pino logger
 */

const mongoose = require('mongoose');
const pino = require('pino');

// load environment variables from .env file
require('dotenv').config();

/*
 * connectDB function
 * Connects to MongoDB Atlas using the URI from .env file
 * We use async/await because connecting to database takes time
 */
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB error:', err);
    }
};

/*
 * Pino Logger Configuration
 * We use pino-mongodb transport to save logs directly to MongoDB
 * All logs go to the 'logs' collection in our database
 * This is required by the project specifications
 */
const logger = pino({
    transport: {
        target: 'pino-mongodb',
        options: {
            uri: process.env.MONGO_URI,
            collection: 'logs' 
        }
    }
});

// export both so we can use them in app.js
module.exports = { connectDB, logger };
