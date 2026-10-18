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
    enum:["admin","agent","user"],
    default:"user",
  },
  password:
  {
    type: String,
    required: true
  },
  isActive: {
    type:Boolean,
    default:true,
  },
  
},
{
  timestamps:true,
}
);

module.exports = mongoose.model("User", userSchema);
