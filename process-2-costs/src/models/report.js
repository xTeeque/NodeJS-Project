const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    userid: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    month: {
        type: Number,
        required: true
    },
    
    data: {
        type: Object,
        required: true
    }
});


module.exports = mongoose.model('Report', reportSchema, 'reports');