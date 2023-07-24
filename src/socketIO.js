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
  const ball = new PlayerBall(socket);
  socket.join(roomId); // 클라이언트를 해당 방에 조인시킴
  return ball;
};

const endGame = (socket) => {
  socket.rooms.forEach((room) => {
    // 해당 클라이언트를 방에서 떠나게 함
    socket.to(room).emit('bye', socket.nickname, countRoomPlayers(room) - 1);
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

const countRoom = (roomName) => {
  return io.sockets.adapter.rooms.get(roomName)?.size;
};

const getRoomIdBySocketId = (socketId) => {
  for (const [roomId, room] of Object.entries(rooms)) {
    // 해당 룸의 볼 맵에서 소켓 아이디를 찾아서 있다면 해당 룸 아이디를 반환
    if (room.ballMap[socketId]) {
      return roomId;
    }
  }
  return null; // 소켓이 속한 방이 없는 경우 null 반환
};

// const rooms = new Map();
const rooms = {};

io.on('connection', (socket) => {
  socket.onAny((event) => {
    try {
      // console.log(`socket event : ${event}`);
    } catch (err) {
      console.error(`${event}에서 에러 발생 : ${err}`);
    }
  });

  socket.on('enter_room', (data) => {
    try {
      socket['nickname'] = data.nickname;
      socket['roomId'] = data.roomName;
      const roomId = data.roomName;
      console.log(`${socket.nickname}님이 방(${roomId})에 입장하셨습니다.`);

      socket.join(roomId);

      // 해당 방이 존재하지 않을 경우 새로운 방 객체 생성
      if (!rooms[roomId]) {
        rooms[roomId] = {
          balls: [], // 방 내에 있는 볼들을 저장하는 배열
          ballMap: {}, // 볼을 닉네임과 매핑하여 저장하는 객체
        };
      }

      const newBall = joinGame(socket, roomId);

      const roomClients = io.sockets.adapter.rooms.get(roomId);
      if (roomClients) {
        for (const clientId of roomClients) {
          if (clientId !== socket.id) {
            const ball = new PlayerBall(io.sockets.sockets.get(clientId));
            socket.emit('join_user', {
              id: ball.id,
              x: ball.x,
              y: ball.y,
              color: ball.color,
            });
          }
        }
      }

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
    console.log(
      `방(${socket.roomId})에 현재 ${countRoomPlayers(
        socket.roomId
      )}명이 입장해 있습니다.`
    );
  });

  socket.on('send_location', (data) => {
    // console.log(`Received location data from client:`, data);
    const roomId = data.roomName;
    // if (roomId) {
    //   // 해당 방에 플레이어가 속해있는지 확인하고 위치 업데이트

    // const ball = rooms[roomId].ballMap[socket.nickname];

    // 해당 방에 속한 모든 클라이언트들에게 위치 업데이트를 전달
    io.to(roomId).emit('update_state', {
      id: data.id,
      x: data.x,
      y: data.y,
      color: data.color,
    });

    // console.log(`${socket.nickname}의 위치가 업데이트되었습니다.`);
    // console.log(`${socket.nickname}의 x: ${ball.x}, y: ${ball.y}`);
  });

  socket.on('disconnecting', () => {
    endGame(socket);
  });

  socket.on('disconnect', (reason) => {
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
