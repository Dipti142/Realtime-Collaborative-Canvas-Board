import type { Socket } from 'socket.io';
import type { CursorMovePayload } from '../../types/index.js';

export function registerCursorHandlers(socket: Socket): void {
  //console.log('===========> Cursor handlers registered', socket.id);
  socket.on('cursor-move', ({ roomId, cursor }: CursorMovePayload) => {
    socket.to(roomId).emit('cursor-move', cursor);
    //console.log('=========>Cursor ', cursor);
  });
}
