import app from './app';
import http from 'http';
import { Server } from 'socket.io';
import { instrument } from '@socket.io/admin-ui';

const expressServer = http.createServer(app);

const io = new Server(expressServer, {
  cors: {
    origin: ['https://admin.socket.io', 'http://localhost:3000'],
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
    return this.socket.nickname;
  }
}

let disconnectingSockets = new Set();

const getPlayerColor = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
};

const joinGame = (socket, roomId) => {
  const ball = new PlayerBall(socket); // 방에 대한 정보는 볼에 저장하지 않음
  rooms[roomId].balls.push(ball);
  rooms[roomId].ballMap[socket.nickname] = ball;
  return ball;
};

const endGame = (socket) => {
  const roomId = getRoomIdBySocketId(socket.id);
  if (rooms[roomId]) {
    for (let i = 0; i < rooms[roomId].balls.length; i++) {
      if (rooms[roomId].balls[i].id == socket.nickname) {
        rooms[roomId].balls.splice(i, 1);
        break;
      }
    }
    delete rooms[roomId].ballMap[socket.nickname];
  }
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
const getRoomIdBySocketId = (socketId) => {
  // io.sockets.adapter 에서 해당 소켓의 정보를 얻음
  const socketRooms = io.sockets.adapter.sockets.get(socketId);
  if (socketRooms) {
    // 소켓이 속한 방의 ID를 추출하여 반환
    const roomIds = Array.from(socketRooms);
    return roomIds[0]; // 하나의 소켓은 하나의 방에만 속할 것으로 가정
  }
  return null; // 소켓이 속한 방이 없는 경우 null 반환
};

// const rooms = new Map();
const rooms = {};
io.on('connection', (socket) => {
  socket.onAny((event) => {
    try {
      console.log(`socket event : ${event}`);
    } catch (err) {
      console.error(`${event}에서 에러 발생 : ${err}`);
    }
  });

  socket.on('enter_room', (data) => {
    try {
      socket['nickname'] = data.nickname;
      const roomId = data.roomName; // 방 ID로 사용할 유니크한 값
      console.log(`${socket.nickname}님이 방(${roomId})에 입장하셨습니다.`);

      socket.join(roomId);

      // 해당 방이 존재하지 않을 경우 새로운 방 객체 생성
      if (!rooms[roomId]) {
        rooms[roomId] = {
          balls: [], // 방 내에 있는 볼들을 저장하는 배열
          ballMap: {}, // 볼을 닉네임과 매핑하여 저장하는 객체
        };
      }

      let newBall = joinGame(socket, roomId); // roomId를 인자로 전달

      // 해당 방에 있는 모든 플레이어의 정보를 새로운 볼에게 보냄
      for (const ball of rooms[roomId].balls) {
        if (ball.id !== socket.nickname) {
          socket.emit('join_user', {
            id: ball.id,
            x: ball.x,
            y: ball.y,
            color: ball.color,
          });
        }
      }
      // 해당 방에 있는 모든 플레이어에게 새로운 볼의 정보를 보냄
      io.to(roomId).emit('join_user', {
        id: socket.nickname,
        x: newBall.x,
        y: newBall.y,
        color: newBall.color,
      });

      io.sockets.emit('room_change', publicRooms());
    } catch (err) {
      console.error(`Error during enter_room event: ${err}`);
    }
  });

  socket.on('send_location', (data) => {
    const roomId = getRoomIdBySocketId(socket.id);
    if (rooms[roomId]) {
      rooms[roomId].ballMap[socket.nickname].x = data.x;
      rooms[roomId].ballMap[socket.nickname].y = data.y;
      socket.to(roomId).broadcast.emit('update_state', {
        id: data.id,
        x: data.x,
        y: data.y,
      });
    }
  });

  socket.on('disconnecting', () => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit('bye', socket.nickname, countRoom(room) - 1);
    });
  });

  socket.on('disconnect', (reason) => {
    try {
      if (disconnectingSockets.has(socket.id)) {
        return;
      }
      disconnectingSockets.add(socket.id);

      console.log(`${socket.nickname}님이 ${reason}의 이유로 퇴장하셨습니다. `);
      endGame(socket);
      io.sockets.emit('room_change', publicRooms());
    } catch (err) {
      console.error(`Disconnect Error : ${err}`);
    } finally {
      disconnectingSockets.delete(socket.id);
    }
  });

  socket.on('new_message', (msg, room, callback) => {
    socket.to(room).emit('new_message', `${socket.nickname} : ${msg}`);
    console.log(`${socket.nickname} : ${msg}`);
    callback();
  });
});

export default expressServer;
