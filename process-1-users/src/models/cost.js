/*
 * Cost Model
 * Defines the schema for cost items in MongoDB
 * We need this here to calculate total costs for users
 */

const mongoose = require('mongoose');

const costSchema = new mongoose.Schema({
    // description of the cost item (like "milk" or "gym membership")
    description: {
        type: String,
        required: true,
        trim: true  // removes whitespace from beginning and end
    },
    // category must be one of these 5 options only
    // enum means it can only be one of the values in the array
    category: {
        type: String,
        required: true,
        enum: ['food', 'health', 'housing', 'sport', 'education']
    },
    // which user this cost belongs to
    userid: {
        type: Number,
        required: true
    },
    // the amount of money
    sum: {
        type: Number,
        required: true,
        min: 0  // cant be negative
    },
    // when the cost was created
    createdAt: {
        type: Date,
        default: Date.now  // if not provided, use current time
    }
}, {
    timestamps: true  // adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Cost', costSchema, 'costs');
