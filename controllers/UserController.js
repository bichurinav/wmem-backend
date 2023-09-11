import User from "../models/UserModel.js";

export default  new (class UserController {
  async add(socket, data, io) {

    const user = new User({
      socketID: socket.id,
      nickname: data.nickname,
      roomID: data.roomID,
      total: 0,
      connected: true,
    })

    try {
      const existUser = await User.findOne({ socketID: socket.id });

      if (existUser) {
        throw "на Frontend не должно быть повтороного создания user"       
      }

      await user.save();
      socket.emit('users:add', user);
      io.to(data.roomID).emit('users:message', `В эту супер комнату зашел -> ${data.nickname}`);

      const list = await this.getAllByRoomID(data.roomID)
      io.to(data.roomID).emit('users:list', list);
    } catch(e) {
      console.error(e);
    }
  }

  async get(socket, data, io) {
      socket.id = data?.socketID;
      await this.setConnected(true, socket.id);
      socket.emit('users:get', data);
  }

  async findUser(req, res) {

    const { socketID, roomID } = req.query;

    try {

      if (!socketID || !roomID) {
        throw 'Не был передан socketID или roomID'
      }

      const user = await User.findOne({ roomID, socketID });

      if (!user) {
        res.status(200).send(false)
        return
      }

      res.status(200).json(user)

    } catch(e) {
      return res.status(500).json({
        message: e
      })
    }
  }

  async getAllByRoomID(roomID) {
   return await User.find({ roomID })
  }

  async removeBySocket(socketID) {
    return await User.deleteOne({ socketID });
  }

  async setConnected(state, socketID) {
    return await User.findOneAndUpdate({ socketID }, { connected: state });
  }

  async getUserBySocket(socketID) {
    return await User.findOne({ socketID })
  }

})()