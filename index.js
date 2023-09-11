import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";

import roomRouter from "./routers/roomRouter.js";
import userRouter from "./routers/userRouter.js";
import UserController from "./controllers/UserController.js";
import RoomController from "./controllers/RoomController.js";
import User from "./models/UserModel.js";

const origin = "http://localhost:8080"

const app = express();

const httpServer = createServer(app);

async function main() {
  try{
      await mongoose.connect("mongodb://127.0.0.1:27017/whatdb");
      httpServer.listen(3000);
  }
  catch(err) {
      return console.log(err);
  }
}

const io = new Server(httpServer, {
  // options
    cors: { origin }
});

io.on("connection", (socket) => {

  socket.on('users:add', async (data) => {
    socket.join(data.roomID)
    UserController.add(socket, data, io)
  })

  socket.on('users:get', (data) => {
    socket.join(data.roomID)
    UserController.get(socket, data, io);
  })

  socket.on('users:list', async (roomID) => {
    const list = await UserController.getAllByRoomID(roomID)
    socket.emit('users:list', list);
  })

  socket.on('disconnect', async (reason) => {

    socket.join('kek');

    await UserController.setConnected(false, socket.id);

    if (reason === 'client namespace disconnect') {
      clearRoomsAndUsers();
    } else {
      // FIXME: поработать над таймом
      setTimeout(async () => {
        await clearRoomsAndUsers();
      }, 5000)
    }

    async function clearRoomsAndUsers() {
      const user = await UserController.getUserBySocket(socket.id);
      if (!user?.connected && user) {
        const roomID = user?.roomID;
        const users = await UserController.getAllByRoomID(roomID);

        if (users.length === 1) {
          await RoomController.removeBySocket(roomID);
          console.log(`DEL ROOM: ${roomID}`);
        }
        await UserController.removeBySocket(socket.id);
        io.to(roomID).emit('users:list', users.filter((el) => el.socketID !== socket.id));
        console.log(`DEL USER: ${user?.nickname}`);
      }
    }

  })

});

app.use(cors({ origin }))
app.use(express.json())
app.use('/api/room', roomRouter);
app.use('/api/user', userRouter);

main();

process.on("SIGINT", async() => {
  await mongoose.disconnect();
  console.log("Приложение завершило работу!");
  process.exit();
});