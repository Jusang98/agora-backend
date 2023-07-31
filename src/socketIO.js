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

// socket.io에 대한 추가 설정
instrument(io, {
  auth: false,
});

// 초기 플레이어 위치 설정
const startX = 0;
const startZ = 0;

class PlayerBall {
  constructor(socket) {
    this.socket = socket;
    this.x = startX;
    this.z = startZ;
  }

  get id() {
    return this.socket.nickname;
  }
}

// 퇴장 중인 소켓들을 추적하기 위한 Set
const disconnectingSockets = new Set();
// 방 정보를 저장하는 Map
const rooms = new Map();

// 플레이어가 게임에 참가하는 함수
const joinGame = (socket, roomId) => {
  const ball = new PlayerBall(socket);
  socket.join(roomId);
  return ball;
};

// 게임 종료 시 처리하는 함수
const endGame = (socket) => {
  socket.rooms.forEach((room) => {
    socket.to(room).emit("bye", socket.nickname, countRoomPlayers(room) - 1);
    socket.leave(room);
  });
};

// publicRooms 함수가 수정되었습니다.
// 이제 io.sockets.adapter.rooms를 통해 더 간단하게 방 정보를 가져옵니다.
const publicRooms = () => {
  const publicRooms = [];
  io.sockets.adapter.rooms.forEach((_, key) => {
    const playerCount = countRoomPlayers(key);
    publicRooms.push({ roomName: key, playerCount });
  });
  return publicRooms;
};

const countRoomPlayers = (roomName) => {
  return io.sockets.adapter.rooms.get(roomName)?.size || 0;
};

// socket.io의 connection 이벤트 처리
io.on("connection", (socket) => {
  // sendlocation 이벤트 빼고 찍히게

  socket.onAny((event) => {
    try {
      if (event != "send_location") {
        console.log(`socket 이벤트: ${event}`);
      }
    } catch (err) {
      console.error(`${event}에서 에러 발생: ${err}`);
    }
  });

  socket.on("enter_room", (data) => {
    try {
      socket.nickname = data.nickName;
      socket.roomId = data.roomName;

      console.log(
        `${socket.nickname}님이 방(${socket.roomId})에 입장하셨습니다.`
      );
      socket.join(socket.roomId);
      if (!rooms.has(socket.roomId)) {
        rooms.set(socket.roomId, { balls: [], ballMap: {} });
      }
      const newBall = joinGame(socket, socket.roomId);
      const roomPlayerCount = countRoomPlayers(socket.roomId);

      // 클라이언트에게 입장한 유저 수를 보내는 용도
      io.to(socket.id).emit("welcome", socket.nickname, roomPlayerCount);
      // 새로운 유저
      io.to(socket.id).emit("new_user", {
        id: socket.roomId,
        roomPlayerCount: roomPlayerCount,
        nickName: socket.nickname,
      });
      //기존 유저
      socket.broadcast.to(socket.roomId).emit("origin_user", {
        nickName: socket.nickname,
        enter: "입장",
      });
      const roomClients = io.sockets.adapter.rooms.get(socket.roomId);
      if (roomClients) {
        for (const clientId of roomClients) {
          if (clientId !== socket.id) {
            const ball = new PlayerBall(io.sockets.sockets.get(clientId));
            socket
              .to(socket.roomId)
              .emit("welcome", socket.nickname, roomPlayerCount);
            socket.emit("join_user", {
              id: ball.id,
              x: ball.x,
              z: ball.z,
            });
          }
        }
      }

      io.to(socket.roomId).emit("join_user", {
        id: socket.nickname,
        x: newBall.x,
        z: newBall.z,
      });

      console.log(
        `방(${socket.roomId})에 현재 ${countRoomPlayers(
          socket.roomId
        )}명이 입장해 있습니다.`
      );
    } catch (err) {
      console.error(`enter_room 이벤트 처리 중 오류 발생: ${err}`);
    }
  });

  socket.on("send_location", (data) => {
    const roomId = data.roomName;
    // 해당 방에 속한 모든 클라이언트들에게 위치 업데이트를 전달
    io.to(roomId).emit("update_state", {
      id: data.id,
      x: data.x,
      z: data.z,
    });
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
        socket.broadcast.to(socket.roomId).emit("origin_user", {
          nickName: socket.nickname,
          quit: "퇴장",
        });
      }

      console.log(
        `방(${socket.roomId})에 현재 ${countRoomPlayers(
          socket.roomId
        )}명이 입장해 있습니다.`
      );

      endGame(socket);
      io.sockets.emit("room_change", publicRooms());
    } catch (err) {
      console.error(`disconnect 이벤트 처리 중 오류 발생: ${err}`);
    } finally {
      disconnectingSockets.delete(socket.id);
    }
  });

  socket.on("new_message", (msg, room, callback) => {
    socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
    console.log(`${socket.nickname}: ${msg}`);
    callback();
  });
});

export default expressServer;
