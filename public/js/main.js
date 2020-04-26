const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Получаем пользователей и комнаты
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const socket = io();

// Подключиться к комнате
socket.emit('joinRoom', { username, room });

// Получаем комнаты и пользователей
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Сообщение от сервера
socket.on('message', message => {
  console.log(message);
  outputMessage(message);

  // Скролинг сообщений 
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Отправка сообщения
chatForm.addEventListener('submit', e => {
  e.preventDefault();

  // Получаем текст сообщения
  const msg = e.target.elements.msg.value;

  // Отсылаем сообщение на сервер
  socket.emit('chatMessage', msg);

  // Очищаем поле для ввода после конца написания сообщения
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Вывести сообщение в DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
  <p class="text">
    ${message.text}
  </p>`;
  document.querySelector('.chat-messages').appendChild(div);
}

// Добавляем название комнаты в DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Добавляем пользователя в DOM
function outputUsers(users) {
  userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
  `;
}
