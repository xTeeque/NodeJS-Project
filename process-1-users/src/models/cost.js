const mongoose = require('mongoose');

const costSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['food', 'health', 'housing', 'sport', 'education']
    },
    userid: {
        type: Number,
        required: true
    },
    sum: {
        type: Number,
        required: true,
        min: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Cost', costSchema, 'costs');
