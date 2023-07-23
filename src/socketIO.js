import app from "./app";
import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";

const expressServer = http.createServer(app);
const io = new Server(expressServer, {
  cors: {
    origin: ["https://admin.socket.io", "http://localhost:3000"],
    credentials: true,
  },
});
instrument(io, {
  auth: false,
});

const publicRooms = () => {
  const sids = io.sockets.adapter.sids;
  const rooms = io.sockets.adapter.rooms;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
};

const countRoom = (roomName) => {
  return io.sockets.adapter.rooms.get(roomName)?.size;
};

io.on("connection", (socket) => {
  socket["nickname"] = "anon";

  socket.onAny((event) => {
    console.log(`socket event : ${event}`);
  });

  socket.on("enter_room", (roomName, nickName, callback) => {
    socket["nickname"] = nickName;
    socket.join(roomName);

    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
    io.sockets.emit("room_change", publicRooms());
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1);
    });
  });

  socket.on("disconnect", () => {
    io.sockets.emit("room_change", publicRooms());
  });

  socket.on("new_message", (msg, room, callback) => {
    socket.to(room).emit("new_message", `${socket.nickname} : ${msg}`);
    callback();
  });

  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});

export default expressServer;
