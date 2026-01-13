/*
 * Costs Service - Main Application File
 * This service handles adding cost items and generating monthly reports
 * Port: 3002
 */

const express = require('express');
const { connectDB, logger } = require('./db');
const Cost = require('./models/cost');
const Report = require('./models/report');
const User = require('./models/user');

const app = express();

// middleware to parse JSON in request body
app.use(express.json());

/*
 * Middleware to handle trailing slash in URLs
 * For example: /api/add/ will redirect to /api/add
 * Using 307 status to keep the same HTTP method (POST stays POST)
 */
app.use((req, res, next) => {
    if (req.path.endsWith('/') && req.path.length > 1) {
        const newPath = req.path.slice(0, -1);
        const query = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
        return res.redirect(307, newPath + query);
    }
    next();
});

// logging middleware - logs every request to MongoDB
app.use((req, res, next) => {
    logger.info({ method: req.method, url: req.url }, 'Costs Service Request');
    next();
});

/*
 * POST /api/add
 * Adds a new cost item for a user
 * Required fields: description, category, userid, sum
 * Optional: createdAt (defaults to current date)
 */
app.post('/api/add', async (req, res) => {
    try {
        const { description, category, userid, sum, createdAt } = req.body;
        
        // first check if the user exists in database
        // we cant add cost for user that doesnt exist
        const userExists = await User.findOne({ id: userid });
        if (!userExists) {
            throw new Error("User not found");
        }
        
        // create new cost object
        const newCost = new Cost({
            description,
            category,
            userid,
            sum,
            createdAt: createdAt || new Date()  // use provided date or current date
        });
        
        // save to database
        await newCost.save();
        
        // return 201 created status with the new cost
        res.status(201).json(newCost);
    } catch (error) {
        res.status(500).json({ id: req.body.userid || 0, message: error.message });
    }
});

/*
 * GET /api/report
 * Returns monthly cost report for a specific user
 * Query parameters: id (userid), year, month
 * 
 * This endpoint implements the Computed Design Pattern:
 * If the report is for a past month, we save it to database
 * so next time we dont need to calculate it again
 */
app.get('/api/report', async (req, res) => {
    const { id, year, month } = req.query;
    
    // validate that all required parameters are provided
    if (!id || !year || !month) {
        return res.status(400).json({ id: 0, message: "Missing parameters" });
    }
    
    try {
        /*
         * Computed Design Pattern Implementation:
         * First check if we already have this report saved in database
         * If yes, just return it (no need to calculate again)
         */
        const existingReport = await Report.findOne({ 
            userid: parseInt(id), 
            year: parseInt(year), 
            month: parseInt(month) 
        });
        
        if (existingReport) {
            // report already exists, return it directly
            return res.json(existingReport.data);
        }
        
        // report doesnt exist, need to calculate it
        // find all costs for this user in the specified month and year
        const costs = await Cost.find({
            userid: parseInt(id),
            // using $expr to extract year and month from createdAt date
            $expr: {
                $and: [
                    { $eq: [{ $year: "$createdAt" }, parseInt(year)] },
                    { $eq: [{ $month: "$createdAt" }, parseInt(month)] }
                ]
            }
        });
        
        // all the categories we need to include in report
        const categories = ['food', 'health', 'housing', 'sport', 'education'];
        
        // build the report data structure
        const reportData = { 
            userid: parseInt(id), 
            year: parseInt(year), 
            month: parseInt(month), 
            costs: [] 
        };
        
        // for each category, filter the costs and format them
        categories.forEach(cat => {
            const catCosts = costs
                .filter(c => c.category === cat)
                .map(c => ({
                    sum: c.sum,
                    description: c.description,
                    day: c.createdAt.getDate()  // get just the day number
                }));
            // add to costs array as object with category name as key
            reportData.costs.push({ [cat]: catCosts });
        });
        
        /*
         * Computed Design Pattern - Saving:
         * If this is a past month, save the report for future requests
         * We dont save current or future months because they might change
         */
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;  // getMonth returns 0-11
        
        if (parseInt(year) < currentYear || 
            (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
            // this is a past month, save the report
            const newReport = new Report({
                userid: parseInt(id),
                year: parseInt(year),
                month: parseInt(month),
                data: reportData
            });
            await newReport.save();
            console.log('Computed report saved for user ' + id + ', ' + year + '-' + month);
        }
        
        res.json(reportData);
    } catch (error) {
        res.status(500).json({ id: id || 0, message: error.message });
    }
});

// get port from environment or use default
const PORT = process.env.PORT || 3002;

// connect to database then start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log('Costs Service running on port ' + PORT);
    });
});
