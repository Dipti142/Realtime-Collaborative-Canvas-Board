import type { Socket } from 'socket.io';
import * as rooms from '../../services/roomService.js';

export function registerRoomHandlers(socket: Socket): void {
  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    rooms.addUser(roomId, socket.id);
    socket.emit('room-state', rooms.getRoomElements(roomId));
  });

  socket.on('disconnecting', () => {
    for (const roomId of socket.rooms) {
      rooms.removeUser(roomId, socket.id);
      //console.log(`User ${socket.id} left room ${roomId}`);
    }
  });
}
