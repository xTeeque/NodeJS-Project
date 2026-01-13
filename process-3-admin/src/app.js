const express = require('express');
const { connectDB, logger } = require('./db');
const app = express();


app.use((req, res, next) => {
    logger.info({ method: req.method, url: req.url }, 'Admin Request');
    next();
});


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


app.get('/api/about', (req, res) => {
    res.json(team);
});

const PORT = process.env.PORT || 3003;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`✅ Admin Service running on port ${PORT}`);
    });
});
