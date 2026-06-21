WebSocket Chat

Frontend

GitHub Pages:

https://sergei-yudin.github.io/JS.sse-ws/

Backend

Render:

https://js-sse-ws.onrender.com

Description

Веб-чат на WebSocket.

Реализованы следующие возможности:

* регистрация пользователя по никнейму;
* проверка уникальности никнейма;
* отображение списка подключённых пользователей;
* обмен сообщениями в режиме реального времени;
* удаление пользователя из списка при отключении;
* отображение даты и времени сообщений;
* выравнивание собственных сообщений справа;
* выравнивание сообщений других пользователей слева;
* автоматическое обновление списка пользователей.

Stack

Frontend

* JavaScript (ES6+)
* Webpack
* HTML
* CSS
* GitHub Pages

Backend

* Node.js
* Koa
* WebSocket (ws)
* Render

Installation

Backend

cd backend
npm install
npm start

Frontend

cd frontend
npm install
npm start

Build

cd frontend
npm run build

CI/CD

Для автоматического деплоя используется GitHub Actions.

При каждом push в ветку master выполняется:

1. установка зависимостей;
2. сборка frontend;
3. публикация проекта на GitHub Pages.

Author

Sergei Yudin
