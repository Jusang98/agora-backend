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
    this.color = getPlayerColor();
  }

  get id() {
    return this.socket.id;
  }
}

let balls = [];
let ballMap = {};

const getPlayerColor = () => {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
};

const joinGame = (socket) => {
  let ball = new PlayerBall(socket);

  balls.push(ball);
  ballMap[socket.id] = ball;

  return ball;
};

const endGame = (socket) => {
  for (let i = 0; i < balls.length; i++) {
    if (balls[i].id == socket.id) {
      balls.splice(i, 1);
      break;
    }
  }
  delete ballMap[socket.id];
};

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
  socket.emit("user_id", socket.id);
  console.log(`${socket.id}님이 입장하셨습니다.`);
  let newBall = joinGame(socket);
  for (let i = 0; i < balls.length; i++) {
    let ball = balls[i];
    socket.emit("join_user", {
      id: ball.id,
      x: ball.x,
      y: ball.y,
      color: ball.color,
    });
  }

  socket["nickname"] = "anon";

  socket.onAny((event) => {
    console.log(`socket event : ${event}`);
  });

  socket.on("enter_room", (data) => {
    socket["nickname"] = data.nickName;
    socket.join(data.roomName);

    socket
      .to(data.roomName)
      .emit("welcome", socket.nickname, countRoom(data.roomName));

    socket.to(data.roomName).emit("join_user", {
      id: socket.id,
      x: newBall.x,
      y: newBall.y,
      color: newBall.color,
    });

    socket.to(data.roomName).emit("update_state", {
      id: socket.id,
      x: newBall.x,
      y: newBall.y,
    });

    io.sockets.emit("room_change", publicRooms());
  });

  socket.on("send_location", (data) => {
    socket.to(data.roomName).broadcast.emit("update_state", {
      id: data.id,
      x: data.x,
      y: data.y,
    });
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1);
    });
  });

  socket.on("disconnect", (reason) => {
    console.log(`${socket.id}님이 ${reason}의 이유로 퇴장하셨습니다. `);
    endGame(socket);
    io.sockets.emit("room_change", publicRooms());
  });

  socket.on("new_message", (msg, room, callback) => {
    socket.to(room).emit("new_message", `${socket.nickname} : ${msg}`);
    console.log(`${socket.nickname} : ${msg}`);
    callback();
  });

  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});

export default expressServer;
