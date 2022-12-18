import { createRequire } from "module";
const require = createRequire(import.meta.url);

require('dotenv').config()

// import { createServer } from 'https';
// const server = createServer({
//   cert: readFileSync('/path/to/cert.pem'),
//   key: readFileSync('/path/to/key.pem')
// });

const WebSocket = require('ws');
const server = new WebSocket.Server({port: process.env.VITE_WEB_SOCKET_PORT});

let users = [];

server.on('connection', ws => {
  
  ws.on('message', message => {
    server.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        let data = JSON.parse(message);
        let user = findUserByName(data.name);
        if (data.command === 'removeUser') {
          removeUser(data.name);
        } else if (user) {
          user.score = data.score;
        } else {
          users.push(data);
        }
        client.send(JSON.stringify(users));
      }
    })
  });
  ws.send(JSON.stringify(users));
});

function findUserByName(name) {
  return users.find(i => i.name === name);
}

function removeUser(name) {
  users = users.filter(function (obj) {
    return obj.name !== name;
  });
}
