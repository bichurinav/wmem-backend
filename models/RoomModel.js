import mongoose from "mongoose";
const Schema = mongoose.Schema;

const roomScheme = new Schema({
  roomID: String,
})

const Room = mongoose.model("Room", roomScheme);

export default Room;

