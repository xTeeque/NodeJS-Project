/*
 * User Model
 * We need this model here to check if user exists
 * before adding a cost item for them
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // our custom id (not the MongoDB _id)
    id: {
        type: Number,
        required: true,
        unique: true
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    birthday: {
        type: Date,
        required: true
    }
});

// 'users' is the collection name in MongoDB
module.exports = mongoose.model('User', userSchema, 'users');
