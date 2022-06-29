const mongoose = require("mongoose");

mongoose.connect('mongodb://localhost:27017/angularJs')

const Schema = mongoose.Schema;
const friendSchema = new Schema({
  friendList: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User
  }
})


module.exports = mongoose.model('admin', friendSchema);