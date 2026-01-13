/*
 * User Model
 * Defines the schema for users in MongoDB
 * This tells mongoose what fields a user document should have
 */

const mongoose = require('mongoose');

// define the schema - like a blueprint for user documents
const userSchema = new mongoose.Schema({
    // user id - this is different from MongoDB's _id
    // we use our own id as required by the project
    id: {
        type: Number,
        required: true,
        unique: true  // no two users can have same id
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

// create and export the model
// third parameter 'users' is the collection name in MongoDB
module.exports = mongoose.model('User', userSchema, 'users');
