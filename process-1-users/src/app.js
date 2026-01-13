/*
 * Users Service - Main Application File
 * This service handles all user-related operations like getting users list,
 * getting specific user details, and adding new users.
 * Port: 3001
 */

const express = require('express');
const { connectDB, logger } = require('./db');
const User = require('./models/user');
const Cost = require('./models/cost');

// creating the express app
const app = express();

// this middleware lets us read JSON from request body
app.use(express.json());

// middleware for logging - runs on every request that comes in
// we need this for the pino logs requirement
app.use((req, res, next) => {
    logger.info({ method: req.method, url: req.url }, 'User Service Request');
    next();
});

/*
 * GET /api/users
 * Returns all users from the database
 * No parameters needed
 */
app.get('/api/users', async (req, res) => {
    try {
        // find all users - empty object {} means no filter
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        // if something goes wrong return error with id and message
        res.status(500).json({ id: 0, message: error.message });
    }
});

/*
 * GET /api/users/:id
 * Returns details of a specific user including their total costs
 * The :id is a parameter in the URL (like /api/users/123123)
 */
app.get('/api/users/:id', async (req, res) => {
    try {
        // get the id from URL and convert to number
        const userId = parseInt(req.params.id);
        
        // look for user with this id
        const user = await User.findOne({ id: userId });
        
        // if user doesnt exist return 404 error
        if (!user) {
            return res.status(404).json({ id: userId, message: "User not found" });
        }

        // now we need to calculate total costs for this user
        // first get all costs that belong to this user
        const costs = await Cost.find({ userid: userId });
        
        // sum up all the costs using reduce
        // starts from 0 and adds each cost.sum to it
        const total = costs.reduce((sum, cost) => sum + cost.sum, 0);

        // return the user info with total
        res.json({
            first_name: user.first_name,
            last_name: user.last_name,
            id: user.id,
            total: total
        });
    } catch (error) {
        res.status(500).json({ id: req.params.id, message: error.message });
    }
});

/*
 * POST /api/add
 * Adds a new user to the database
 * Required fields in body: id, first_name, last_name, birthday
 */
app.post('/api/add', async (req, res) => {
    try {
        // destructuring - getting these fields from request body
        const { id, first_name, last_name, birthday } = req.body;
        
        // check if user with this id already exists
        const exists = await User.findOne({ id: id });
        if (exists) {
            throw new Error("User already exists");
        }

        // create new user object and save to database
        const newUser = new User({ id, first_name, last_name, birthday });
        await newUser.save();
        
        // return 201 (created) status with the new user data
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ id: req.body.id || 0, message: error.message });
    }
});

// get port from environment variable or use 3001 as default
const PORT = process.env.PORT || 3001;

// first connect to database, then start the server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log('Users Service running on port ' + PORT);
    });
});
