/*
 * Report Model
 * This is used for the Computed Design Pattern
 * We save monthly reports here so we dont need to calculate them again
 * 
 * When someone asks for a report of a past month,
 * we calculate it once and save it here.
 * Next time they ask for same report, we just return the saved one.
 */

const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    // which user this report belongs to
    userid: {
        type: Number,
        required: true
    },
    // the year of this report
    year: {
        type: Number,
        required: true
    },
    // the month of this report (1-12)
    month: {
        type: Number,
        required: true
    },
    // the actual report data - we store it as object
    // contains userid, year, month, and costs array
    data: {
        type: Object,
        required: true
    }
});

// 'reports' is the collection name
module.exports = mongoose.model('Report', reportSchema, 'reports');
