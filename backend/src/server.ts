import http from 'http';
import { Server } from 'socket.io';
import { app } from './app.js';
import { config } from './config/index.js';
import { registerSocketHandlers } from './socket/index.js';

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: config.corsOrigins,
    methods: ['GET', 'POST'],
  },
});

registerSocketHandlers(io);

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
