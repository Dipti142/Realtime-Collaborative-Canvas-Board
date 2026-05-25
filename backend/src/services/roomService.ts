import type { CanvasElement, RoomState } from '../types/index.js';

// ─── In-Memory Store ─────────────────────────────────────────────

const rooms: Record<string, RoomState> = {};

// ─── Public API ──────────────────────────────────────────────────

export function getOrCreateRoom(roomId: string): RoomState {
  if (!rooms[roomId]) {
    rooms[roomId] = { elements: [], users: [] };
  }
  return rooms[roomId];
}

export function addUser(roomId: string, userId: string): void {
  const room = getOrCreateRoom(roomId);
  room.users.push(userId);
}

export function removeUser(roomId: string, userId: string): void {
  const room = rooms[roomId];
  if (!room) return;
  room.users = room.users.filter((id) => id !== userId);
}

export function getRoomElements(roomId: string): CanvasElement[] {
  return rooms[roomId]?.elements ?? [];
}

export function upsertElement(roomId: string, element: CanvasElement): void {
  const room = rooms[roomId];
  if (!room) return;

  const index = room.elements.findIndex((el) => el.id === element.id);
  if (index !== -1) {
    room.elements[index] = element;
  } else {
    room.elements.push(element);
  }
}

export function deleteElement(roomId: string, elementId: string): void {
  const room = rooms[roomId];
  if (!room) return;
  room.elements = room.elements.filter((el) => el.id !== elementId);
}
