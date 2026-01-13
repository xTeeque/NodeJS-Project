const express = require('express');
const { connectDB, logger } = require('./db');
const User = require('./models/user');
const Cost = require('./models/cost');
const app = express();

app.use(express.json());


app.use((req, res, next) => {
    logger.info({ method: req.method, url: req.url }, 'User Service Request');
    next();
});


app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ id: 0, message: error.message });
    }
});


app.get('/api/users/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const user = await User.findOne({ id: userId });
        
        if (!user) {
            return res.status(404).json({ id: userId, message: "User not found" });
        }

        
        const costs = await Cost.find({ userid: userId });
        const total = costs.reduce((sum, cost) => sum + cost.sum, 0);

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


app.post('/api/add', async (req, res) => {
    try {
        const { id, first_name, last_name, birthday } = req.body;
        
        
        const exists = await User.findOne({ id: id });
        if (exists) {
            throw new Error("User already exists");
        }

        const newUser = new User({ id, first_name, last_name, birthday });
        await newUser.save();
        
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ id: req.body.id || 0, message: error.message });
    }
});

const PORT = process.env.PORT || 3001;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`✅ Users Service running on port ${PORT}`);
    });
});
