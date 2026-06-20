let socket = null;
let currentUser = null;
let currentUserId = null;
let usersState = [];

const root = document.body;
function formatDate(timestamp) {
  const date = new Date(timestamp);

  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function renderNicknameForm(errorText = '') {
  root.innerHTML = `
    <div class="nickname-modal">
      <div class="nickname-window">
        <h2>Выберите псевдоним</h2>

        ${errorText ? `<div class="nickname-error">${errorText}</div>` : ''}

        <input
          type="text"
          class="nickname-input"
          placeholder="Введите никнейм"
        >

        <button class="nickname-btn">
          Продолжить
        </button>
      </div>
    </div>
  `;

  const button = document.querySelector('.nickname-btn');

  button.addEventListener('click', () => {
    const input = document.querySelector('.nickname-input');
    const name = input.value.trim();

    if (!name) {
      return;
    }

    currentUser = name;
    connectToServer();
  });
}

function renderChat() {
  root.innerHTML = `
    <div class="chat">
      <aside class="users-panel">
        <h3>Users</h3>

        <ul class="users-list">
          <li>You</li>
        </ul>
      </aside>

      <section class="chat-panel">
        <div class="messages"></div>

        <form class="message-form">
          <input
            class="message-input"
            placeholder="Введите сообщение"
          >

          <button type="submit">
            Send
          </button>
        </form>
      </section>
    </div>
  `;

  renderUsers(usersState);

  const messageForm = document.querySelector('.message-form');
  const messageInput = document.querySelector('.message-input');

  messageForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const text = messageInput.value.trim();

    if (!text || !socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    socket.send(JSON.stringify({
      type: 'send',
      message: text,
    }));

    messageInput.value = '';
  });
}

function renderUsers(users) {
  const usersList = document.querySelector('.users-list');

  if (!usersList) {
    return;
  }

  usersList.innerHTML = users
    .map((user) => {
      const userName = user.id === currentUserId ? 'You' : user.name;
      return `<li>${userName}</li>`;
    })
    .join('');
}

function renderMessage(data) {
  const messages = document.querySelector('.messages');

  if (!messages) {
    return;
  }

  const message = document.createElement('div');
  message.classList.add('message');

  if (data.user.id === currentUserId) {
    message.classList.add('message_own');
  }

  const author = data.user.id === currentUserId ? 'You' : data.user.name;

  message.innerHTML = `
  <div class="message-header">
    <div class="message-author">${author}</div>
    <div class="message-date">${formatDate(data.created)}</div>
  </div>
  <div class="message-text">${data.message}</div>
`;

  messages.append(message);
  messages.scrollTop = messages.scrollHeight;
}

function connectToServer() {
  socket = new WebSocket('ws://localhost:7070');

  socket.addEventListener('open', () => {
    socket.send(JSON.stringify({
      type: 'join',
      name: currentUser,
    }));
  });

  socket.addEventListener('message', (event) => {
    let data;

    try {
      data = JSON.parse(event.data);
    } catch (error) {
      return;
    }

    if (data.type === 'error') {
      socket.close();
      socket = null;
      renderNicknameForm(data.message);
      return;
    }

    if (data.type === 'login') {
      currentUserId = data.user.id;
      renderChat();
      return;
    }

    if (data.type === 'users') {
      usersState = data.users;
      renderUsers(usersState);
      return;
    }

    if (data.type === 'send') {
      renderMessage(data);
    }
  });
}

renderNicknameForm();
