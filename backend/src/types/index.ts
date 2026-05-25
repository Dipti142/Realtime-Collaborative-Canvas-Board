// Domain Models 
export interface CanvasElement {
  id: string;
  type: 'pen' | 'rect' | 'ellipse' | 'image';
  userId: string;
  points?: number[];
  x: number;
  y: number;
  width?: number;
  height?: number;
  stroke: string;
  strokeWidth: number;
  fill?: string;
  src?: string;
}
export interface RoomState {
  elements: CanvasElement[];
  users: string[];
}

//Socket Event Payloads
export interface ElementUpdatePayload {
  roomId: string;
  element: CanvasElement;
}
export interface ElementDeletePayload {
  roomId: string;
  elementId: string;
}

export interface CursorMovePayload {
  roomId: string;
  cursor: {x: number;y: number; userId: string};
}
