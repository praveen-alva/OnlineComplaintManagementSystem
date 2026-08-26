const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email:
  {
    type: String,
    required: true,
    unique: true
  },
  type:
  {
    type: String,
    enum:["user","agent"],
    required: true
  },
  password:
  {
    type: String,
    required: true
  },
});

module.exports = mongoose.model('User', userSchema);
