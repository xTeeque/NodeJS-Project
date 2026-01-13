/*
 * Cost Model
 * Defines the schema for cost items in MongoDB
 * Each cost has a description, category, userid, sum and date
 */

const mongoose = require('mongoose');

const costSchema = new mongoose.Schema({
    // description of what the cost is for
    description: {
        type: String,
        required: true,
        trim: true  // removes extra spaces
    },
    // category - can only be one of these 5 values
    category: {
        type: String,
        required: true,
        // enum validates that only these values are allowed
        enum: ['food', 'health', 'housing', 'sport', 'education']
    },
    // the user id this cost belongs to
    userid: {
        type: Number,
        required: true
    },
    // amount of money spent
    sum: {
        type: Number,
        required: true,
        min: 0  // cannot be negative
    },
    // when was this cost created
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true  // automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Cost', costSchema, 'costs');
