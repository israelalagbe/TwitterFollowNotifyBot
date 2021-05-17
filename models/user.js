const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String
    },
    twitter_user_id: {
        type: String,
        unique: true,
        required: true,
    },
    access_token: {
        type: String,
        required: true,
    },
    access_token_secret: {
        type: String,
        required: true,
    },
    followers_count: Number,
    following_count: Number,
    followers: [{
        type: String,
        required: true
    }]
}, {
    timestamps: true
}, );

const User = mongoose.model('User', userSchema);

module.exports = User;