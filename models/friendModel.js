const mongoose = require("mongoose");
const User = require('./userModel')

mongoose.connect('mongodb://localhost:27017/angularJs')

const Schema = mongoose.Schema;
const friendSchema = new Schema({
  friendList: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User
  }
})


module.exports = mongoose.model('friend', friendSchema);