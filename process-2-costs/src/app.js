const express = require('express');
const { connectDB, logger } = require('./db');
const Cost = require('./models/cost');
const Report = require('./models/report');
const User = require('./models/user');

const app = express();
app.use(express.json());

// Middleware לטיפול ב-trailing slash - מפנה /api/add/ ל-/api/add
app.use((req, res, next) => {
    if (req.path.endsWith('/') && req.path.length > 1) {
        const newPath = req.path.slice(0, -1);
        const query = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
        return res.redirect(307, newPath + query);
    }
    next();
});

app.use((req, res, next) => {
    logger.info({ method: req.method, url: req.url }, 'Costs Service Request');
    next();
});

app.post('/api/add', async (req, res) => {
    try {
        const { description, category, userid, sum, createdAt } = req.body;
        
        const userExists = await User.findOne({ id: userid });
        if (!userExists) {
            throw new Error("User not found");
        }
        const newCost = new Cost({
            description,
            category,
            userid,
            sum,
            createdAt: createdAt || new Date()
        });
        await newCost.save();
        res.status(201).json(newCost);
    } catch (error) {
        res.status(500).json({ id: req.body.userid || 0, message: error.message });
    }
});

app.get('/api/report', async (req, res) => {
    const { id, year, month } = req.query;
    if (!id || !year || !month) {
        return res.status(400).json({ id: 0, message: "Missing parameters" });
    }
    try {
        const existingReport = await Report.findOne({ 
            userid: parseInt(id), 
            year: parseInt(year), 
            month: parseInt(month) 
        });
        
        if (existingReport) {
            return res.json(existingReport.data);
        }
        
        const costs = await Cost.find({
            userid: parseInt(id),
            $expr: {
                $and: [
                    { $eq: [{ $year: "$createdAt" }, parseInt(year)] },
                    { $eq: [{ $month: "$createdAt" }, parseInt(month)] }
                ]
            }
        });
        
        const categories = ['food', 'health', 'housing', 'sport', 'education'];
        
        const reportData = { 
            userid: parseInt(id), 
            year: parseInt(year), 
            month: parseInt(month), 
            costs: [] 
        };
        
        categories.forEach(cat => {
            const catCosts = costs
                .filter(c => c.category === cat)
                .map(c => ({
                    sum: c.sum,
                    description: c.description,
                    day: c.createdAt.getDate()
                }));
            reportData.costs.push({ [cat]: catCosts });
        });
        
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        if (parseInt(year) < currentYear || 
            (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
            const newReport = new Report({
                userid: parseInt(id),
                year: parseInt(year),
                month: parseInt(month),
                data: reportData
            });
            await newReport.save();
            console.log(`📊 Computed report saved for user ${id}, ${year}-${month}`);
        }
        res.json(reportData);
    } catch (error) {
        res.status(500).json({ id: id || 0, message: error.message });
    }
});

const PORT = process.env.PORT || 3002;
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`✅ Costs Service running on port ${PORT}`);
    });
});
