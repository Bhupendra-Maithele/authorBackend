//import { friend } from './friendModel'
const mongoose = require("mongoose");

mongoose.connect('mongodb://localhost:27017/angularJs')

const Schema = mongoose.Schema;
const userSchema = new Schema({
  status: { type: Boolean, default: false},
  bio: { type: String, default: "Hi, I am blogger user."},
  name: { type: String, required: true },
  email: { type: String, unique: true },
  //mobile: { type: Number, default: 1234567890 },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now },
  token: { type: String, default:"" },
  // friend: { type: array, default: []}
  //isActive: { type: Boolean, default: false },
  //device_info: { type: Array, default: []}
})


module.exports = mongoose.model('user', userSchema);