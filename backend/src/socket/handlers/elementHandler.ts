import type { Socket } from 'socket.io';
import type { ElementUpdatePayload, ElementDeletePayload } from '../../types/index.js';
import * as roomService from '../../services/roomService.js';

export function registerElementHandlers(socket: Socket): void {
  //console.log('Element handlers registered', socket.id);
  socket.on('element-update', ({ roomId, element }: ElementUpdatePayload) => {
    roomService.upsertElement(roomId, element);
    socket.to(roomId).emit('element-update', element);
  });

  socket.on('element-delete', ({ roomId, elementId }: ElementDeletePayload) => {
    roomService.deleteElement(roomId, elementId);
    socket.to(roomId).emit('element-delete', elementId);
  });
}
