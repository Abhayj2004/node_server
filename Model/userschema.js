const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId :String,
    name:String,
    email: String,
    image: String,
},{timestamps: true});

const User = new mongoose.model('users', userSchema);

module.exports = User;