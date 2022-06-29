const mongoose = require("mongoose");

mongoose.connect('mongodb://localhost:27017/angularJs')

const Schema = mongoose.Schema;
const adminSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  token: { type: String, default: ''}
})


module.exports = mongoose.model('admin', adminSchema);