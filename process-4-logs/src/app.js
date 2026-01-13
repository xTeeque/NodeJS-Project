const express = require('express');
const mongoose = require('mongoose');
const { connectDB, logger } = require('./db'); 
const app = express();


app.use((req, res, next) => {
    logger.info({ method: req.method, url: req.url }, 'Logs Service Request');
    next();
});


app.get('/api/logs', async (req, res) => {
    try {
        
        const logs = await mongoose.connection.db.collection('logs').find({}).toArray();

        
        res.json(logs);
    } catch (error) {
        
        res.status(500).json({ id: 0, message: error.message });
    }
});


const PORT = 3004;


connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Logs Service running on port ${PORT}`);
    });
});