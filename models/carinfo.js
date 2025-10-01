const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  Username: { type: String, required: true },
  car_no: { type: String, required: true },
  lastPUC: { type: Date, required: true },
  lastInsurance: { type: Date, required: true },
  nextPUC: { type: Date, required: true },        // calculated and stored
  nextInsurance: { type: Date, required: true },
  email: { type: String, required: false }, 
  phonenumber: { type: Number, required: false },
  image: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Login', required: true }
});

const carinfo = mongoose.model('abc', userSchema,'abc');  

module.exports = carinfo;
