var mongoose = require("mongoose");
var Schema = mongoose.Schema;

(userSchema = new Schema({
  username: String,
  password: String,
  name: String,
  profileImage: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
})),
  (user = mongoose.model("user", userSchema));

module.exports = user;
