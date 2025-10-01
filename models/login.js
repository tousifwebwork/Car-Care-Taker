    const mongoose = require('mongoose');

    const loginSchema = new mongoose.Schema({
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        email: { type: String, required: false, unique: true }   
    });

    module.exports = mongoose.model('Login', loginSchema);
