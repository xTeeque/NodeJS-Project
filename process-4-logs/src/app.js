/*
 * Logs Service - Main Application File
 * This service returns all log entries from the database
 * The logs are created by all other services using pino logger
 * Port: 3004
 */

const express = require('express');
const mongoose = require('mongoose');
const { connectDB, logger } = require('./db'); 

const app = express();

// logging middleware - yes we also log requests to this service
app.use((req, res, next) => {
    logger.info({ method: req.method, url: req.url }, 'Logs Service Request');
    next();
});

/*
 * GET /api/logs
 * Returns all log entries from the logs collection
 * We access the collection directly using mongoose.connection
 * because pino-mongodb creates the logs, not a mongoose model
 */
app.get('/api/logs', async (req, res) => {
    try {
        // get logs directly from collection
        // we use mongoose.connection.db to access the raw MongoDB driver
        // then find all documents and convert to array
        const logs = await mongoose.connection.db.collection('logs').find({}).toArray();

        res.json(logs);
    } catch (error) {
        res.status(500).json({ id: 0, message: error.message });
    }
});

// port for this service
const PORT = process.env.PORT || 3004;

// connect to database then start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log('Logs Service running on port ' + PORT);
    });
});
