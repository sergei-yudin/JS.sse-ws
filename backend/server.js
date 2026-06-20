const http = require('http');
const Koa = require('koa');
const Router = require('koa-router');
const WS = require('ws');
const app = new Koa();

app.use(async (ctx, next) => {
  const origin = ctx.request.get('Origin');
  if (!origin) {
    return await next();
  }

  const headers = { 'Access-Control-Allow-Origin': '*', };

  if (ctx.request.method !== 'OPTIONS') {
    ctx.response.set({ ...headers });
    try {
      return await next();
    } catch (e) {
      e.headers = { ...e.headers, ...headers };
      throw e;
    }
  }

  if (ctx.request.get('Access-Control-Request-Method')) {
    ctx.response.set({
      ...headers,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
    });

    if (ctx.request.get('Access-Control-Request-Headers')) {
      ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Request-Headers'));
    }

    ctx.response.status = 204;
  }
});

const router = new Router();

// TODO: write code here

router.get('/index', async (ctx) => {
  ctx.response.body = 'hello';
});

app.use(router.routes()).use(router.allowedMethods());

const wsClients = new Set();
const users = new Map();
function getUsersList() {
    return Array.from(users.values());
}

function broadcast(data) {
    const message = JSON.stringify(data);

    wsClients.forEach((client) => {
        if (client.readyState === WS.OPEN) {
            client.send(message);
        }
    });
}
const port = process.env.PORT || 7070;

const server = http.createServer(app.callback());

const wsServer = new WS.Server({
    server,
});

wsServer.on('connection', (ws) => {
    wsClients.add(ws);

    ws.on('message', (data) => {
      let message;

      try {
        message = JSON.parse(data.toString());
      } catch (error) {
        return;
      }

      if (message.type === 'join') {
        const isNameTaken = getUsersList().some((user) => user.name === message.name);

        if (isNameTaken) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Никнейм уже занят',
          }));
          return;
        }

        const user = {
          id: Date.now().toString(),
          name: message.name,
        };

        users.set(ws, user);

        ws.send(JSON.stringify({
          type: 'login',
          user,
        }));

        broadcast({
          type: 'users',
          users: getUsersList(),
        });

        return;
      }

      if (message.type === 'send') {
        const user = users.get(ws);

        if (!user) {
          return;
        }

          broadcast({
              type: 'send',
              message: message.message,
              user,
              created: Date.now(),
          });
      }
    });

    ws.on('close', () => {
      wsClients.delete(ws);
      users.delete(ws);

      broadcast({
        type: 'users',
        users: getUsersList(),
      });
    });
});

server.listen(port, () => {
    console.log(`Server started on ${port}`);
});
