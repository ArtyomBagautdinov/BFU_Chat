const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');

const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Подключаем html документ
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'BFU Chat'; 

// Запускаем в момент подключения клиента
io.on('connection', socket => { 
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Приветствуем подключенного пользователя 
    socket.emit('message', formatMessage(botName, 'Вы подключились к чату BFU!'));

    // Разослать всем сообщение при подключении к чату нового клиента
    socket.broadcast.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} подключился к чату`)
      );

    // Отослать информацию о пользователях и комнате
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Прослушиваем сообзения в чатах
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Отсылаем сообщения когда клиент отключается от чата
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

server.listen(3000, () => console.log(`Server running on port 3000`));
