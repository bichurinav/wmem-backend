import Room from "../models/RoomModel.js";
import randomatic from "randomatic";

export default  new (class RoomController {
  async create(req, res) {

    const roomID = randomatic('a0', 10);

    const room = new Room({ roomID });

    try {
      await room.save();

      res.status(200).json({
        roomID,
        message: 'Комната создана'
      })

    } catch(e) {
      return res.status(500).json({
        message: e
      })
    }
  }

  async removeBySocket(roomID) {
    return await Room.deleteOne({ roomID });
  }

  async findRoom(req, res) {

    const { roomID } = req.params; 

    try {
      const room = await Room.findOne({ roomID });

      if (!room) {
        res.status(200).send(false)
        return
      }

      res.status(200).json(room)

    } catch(e) {
      return res.status(500).json({
        message: e
      })
    }
  }
})()