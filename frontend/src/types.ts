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

export type Tool = 'pen' | 'rect' | 'ellipse' | 'image' | 'select' | 'pan';

export interface Camera {
  x: number;
  y: number;
  scale: number;
}
