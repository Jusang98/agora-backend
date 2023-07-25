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

const startX = 1024 / 2;
const startY = 768 / 2;

class PlayerBall {
  constructor(socket) {
    this.socket = socket;
    this.x = startX;
    this.y = startY;
    this.color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  }

  get id() {
    return this.socket.nickname;
  }
}

let disconnectingSockets = new Set();

const joinGame = (socket, roomId) => {
  const ball = new PlayerBall(socket);
  socket.join(roomId); // 클라이언트를 해당 방에 조인시킴

  return ball;
};

const endGame = (socket) => {
  socket.rooms.forEach((room) => {
    // 해당 클라이언트를 방에서 떠나게 함
    socket.to(room).emit("bye", socket.nickname, countRoomPlayers(room) - 1);
    socket.leave(room);
  });
};

const publicRooms = () => {
  const rooms = io.sockets.adapter.rooms;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    const playerCount = countRoomPlayers(key);
    publicRooms.push({ roomName: key, playerCount });
  });
  return publicRooms;
};

const countRoomPlayers = (roomName) => {
  return io.sockets.adapter.rooms.get(roomName)?.size || 0;
};

const rooms = new Map();

io.on("connection", (socket) => {
  socket.onAny((event) => {
    try {
      console.log(`socket event : ${event}`);
    } catch (err) {
      console.error(`${event}에서 에러 발생 : ${err}`);
    }
  });

  socket.on("enter_room", (data) => {
    try {
      socket.nickname = data.nickName;
      socket.roomId = data.roomName;
      const roomId = data.roomName;
      const nickname = data.nickName;
      console.log(`${nickname}님이 방(${roomId})에 입장하셨습니다.`);
      socket.join(roomId);
      if (!rooms.has(roomId)) {
        rooms.set(roomId, { balls: [], ballMap: {} });
      }
      const newBall = joinGame(socket, roomId);
      const roomClients = io.sockets.adapter.rooms.get(roomId);
      if (roomClients) {
        for (const clientId of roomClients) {
          if (clientId !== socket.id) {
            const ball = new PlayerBall(io.sockets.sockets.get(clientId));
            socket.emit("join_user", {
              id: ball.id,
              x: ball.x,
              y: ball.y,
              color: ball.color,
            });
          }
        }
      }
      const roomPlayerCount = countRoomPlayers(data.roomName);
      socket
        .to(data.roomName)
        .emit("welcome", socket.nickname, roomPlayerCount);
      io.to(roomId).emit("join_user", {
        id: socket.nickname,
        x: newBall.x,
        y: newBall.y,
        color: newBall.color,
      });
      io.sockets.emit("room_change", publicRooms());
    } catch (err) {
      console.error(`Error during enter_room event: ${err}`);
    }
    console.log(
      `방(${socket.roomId})에 현재 ${countRoomPlayers(
        socket.roomId
      )}명이 입장해 있습니다.`
    );
  });

  socket.on("send_location", (data) => {
    const roomId = data.roomName;
    // 해당 방에 속한 모든 클라이언트들에게 위치 업데이트를 전달
    io.to(roomId).emit("update_state", {
      id: data.id,
      x: data.x,
      y: data.y,
      color: data.color,
    });

    // console.log(`${socket.nickname}의 위치가 업데이트되었습니다.`);
    // console.log(`${socket.nickname}의 x: ${ball.x}, y: ${ball.y}`);
  });

  socket.on("disconnecting", () => {
    endGame(socket);
  });

  socket.on("disconnect", (reason) => {
    try {
      if (disconnectingSockets.has(socket.id)) {
        return;
      }
      disconnectingSockets.add(socket.id);

      if (socket.nickname) {
        console.log(
          `${socket.nickname}님이 ${reason}의 이유로 퇴장하셨습니다.`
        );
      }

      console.log(
        `방(${socket.roomId})에 현재 ${countRoomPlayers(
          socket.roomId
        )}명이 입장해 있습니다.`
      );

      endGame(socket);
      io.sockets.emit("room_change", publicRooms());
    } catch (err) {
      console.error(`Disconnect Error : ${err}`);
    } finally {
      disconnectingSockets.delete(socket.id);
    }
  });

  socket.on("new_message", (msg, room, callback) => {
    socket.to(room).emit("new_message", `${socket.nickname} : ${msg}`);
    console.log(`${socket.nickname} : ${msg}`);
    callback();
  });
});

export default expressServer;
