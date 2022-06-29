const mongoose = require("mongoose");
const User = require('./userModel')

mongoose.connect('mongodb://localhost:27017/angularJs')

const Schema = mongoose.Schema;
const postSchema = new Schema({
  // subcription: { type: Boolean, default: false },
  // subcribers: { type: Number, default: 0},
  // author_id: { type: String, required: true},
  // author_name: { type: String, required: true},
  // author_email: { type: String, required: true},
  visible: { type: String, required: true},
  title: { type: String, required: true},
  article: { type: String, default: ''},
  date: { type: Date, default: Date.now},
  myUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User
  },
  view: { type: Number, default: 0}

  // posts: [{
  //   title: {type: String, required: true},
  //   article: {type: String, required: true}
  // }],
  //count: { type: Number, default: 0 },
  //date: { type: Date, default: Date.now },
  //subDate: { type: Date },
  //subEndDate: {type: Date }
})

// {
//   title: { type: String, required: true},
//   post: { type: String, default: ''},
//   view: { type: Number, default: 0 },
//   postDate: { type: Date, default: Date.now }
// }


module.exports = mongoose.model('post', postSchema);