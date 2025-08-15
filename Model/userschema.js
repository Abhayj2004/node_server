// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//     googleId :String,
//     name:String,
//     email: String,
//     image: String,
// },{timestamps: true});

// const User = new mongoose.model('users', userSchema);

// module.exports = User;

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
