import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userScheme = new Schema({
  socketID: String,
  nickname: String,
  roomID: String,
  total: Number,
  connected: Boolean
})

const User = mongoose.model("User", userScheme)

export default User;