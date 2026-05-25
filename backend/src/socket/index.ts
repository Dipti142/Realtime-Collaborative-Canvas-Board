import type { Server } from 'socket.io';
import { registerRoomHandlers } from './handlers/roomHandler.js';
import { registerElementHandlers } from './handlers/elementHandler.js';
import { registerCursorHandlers } from './handlers/cursorHandler.js';

export function registerSocketHandlers(io: Server): void {
  io.on('connection', (socket) => {
    registerRoomHandlers(socket);
    registerElementHandlers(socket);
    registerCursorHandlers(socket);
  });
}
