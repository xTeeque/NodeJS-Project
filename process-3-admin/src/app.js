/*
 * Admin Service - Main Application File
 * This service returns information about the development team
 * Port: 3003
 */

const express = require('express');
const { connectDB, logger } = require('./db');

const app = express();

// logging middleware - logs every request
app.use((req, res, next) => {
    logger.info({ method: req.method, url: req.url }, 'Admin Request');
    next();
});

/*
 * Team members data
 * According to project requirements, this should not be stored in database
 * It can be hardcoded here or stored in .env file
 * We chose to hardcode it since its simpler
 */
const team = [
    { 
        first_name: "Ofir",    
        last_name: "Nesher"        
    },
    {
        first_name: "Asaf",
        last_name: "Arusi"
    }    
];

/*
 * GET /api/about
 * Returns the development team members
 * Only returns first_name and last_name as required
 */
app.get('/api/about', (req, res) => {
    res.json(team);
});

// get port from environment or use default
const PORT = process.env.PORT || 3003;

// connect to database then start server
// we still connect to DB here for the logging to work
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log('Admin Service running on port ' + PORT);
    });
});
