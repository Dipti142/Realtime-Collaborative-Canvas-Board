import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Line, Rect, Ellipse, Image as KonvaImage, Circle } from 'react-konva';
import { useStore } from '../store';
import { v4 as uuidv4 } from 'uuid';
import { io, Socket } from 'socket.io-client';
import type { CanvasElement } from '../types';

const SOCKET_URL = 'http://localhost:3001';

const ImageComponent = ({ src, x, y, width, height }: any) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setImage(img);
  }, [src]);

  return <KonvaImage image={image} x={x} y={y} width={width} height={height} />;
};

const Canvas: React.FC = () => {
  const {
    elements,
    camera,
    selectedTool,
    strokeColor,
    strokeWidth,
    userId,
    roomId,
    setElements,
    addElement,
    updateElement,
    deleteElement,
    setCamera,
    setRoomId,
    cursors,
    updateCursor,
  } = useStore();

  const [isDrawing, setIsDrawing] = useState(false);
  const [newElement, setNewElement] = useState<CanvasElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const socketRef = useRef<Socket | null>(null);
  const stageRef = useRef<any>(null);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let currentRoomId = urlParams.get('room');
    if (!currentRoomId) {
      currentRoomId = uuidv4();
      window.history.replaceState({}, '', `?room=${currentRoomId}`);
    }
    setRoomId(currentRoomId);

    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.emit('join-room', currentRoomId);

    socket.on('room-state', (remoteElements: CanvasElement[]) => {
     // console.log('Received room state:', remoteElements);
      setElements(remoteElements);
    });

    socket.on('element-update', (element: CanvasElement) => {
      //console.log('Received element update:', element);
      updateElement(element, false);
    });

    socket.on('element-delete', (elementId: string) => {
      deleteElement(elementId, true);
    });

    socket.on('cursor-move', (cursor: any) => {
      //console.log('Received cursor move:', cursor);
      updateCursor(cursor);
    });

    return () => {
      socket.disconnect();
    };
  }, [setElements, updateElement, deleteElement, updateCursor, setRoomId]);

  const getPointerPosition = () => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const pointer = stage.getPointerPosition();
    return {
      x: (pointer.x - camera.x) / camera.scale,
      y: (pointer.y - camera.y) / camera.scale,
    };
  };

  const handleMouseDown = (e: any) => {
    if (selectedTool === 'pan' || e.evt.button === 1 || (e.evt.button === 0 && e.evt.spaceKey)) {
      return;
    }

    const { x, y } = getPointerPosition();
    setIsDrawing(true);

    const id = uuidv4();
    let element: CanvasElement;

    if (selectedTool === 'pen') {
      element = {
        id,
        type: 'pen',
        userId,
        points: [x, y],
        x,
        y,
        stroke: strokeColor,
        strokeWidth,
      };
    } else if (selectedTool === 'rect') {
      element = {
        id,
        type: 'rect',
        userId,
        x,
        y,
        width: 0,
        height: 0,
        stroke: strokeColor,
        strokeWidth,
      };
    } else if (selectedTool === 'ellipse') {
      element = {
        id,
        type: 'ellipse',
        userId,
        x,
        y,
        width: 0,
        height: 0,
        stroke: strokeColor,
        strokeWidth,
      };
    } else {
      return;
    }

    setNewElement(element);
  };

  const handleMouseMove = (e: any) => {
    const { x, y } = getPointerPosition();
    
    socketRef.current?.emit('cursor-move', {
      roomId,
      cursor: { x, y, userId }
    });

    if (e.evt.buttons === 4 || (e.evt.buttons === 1 && selectedTool === 'pan')) {
      setCamera({
        x: camera.x + e.evt.movementX,
        y: camera.y + e.evt.movementY,
      });
      return;
    }

    if (!isDrawing || !newElement) return;

    let updatedElement = { ...newElement };

    if (updatedElement.type === 'pen') {
      updatedElement.points = [...(updatedElement.points || []), x, y];
    } else if (updatedElement.type === 'rect' || updatedElement.type === 'ellipse') {
      updatedElement.width = x - updatedElement.x;
      updatedElement.height = y - updatedElement.y;
    }

    setNewElement(updatedElement);
  };

  const handleMouseUp = () => {
    if (!isDrawing || !newElement) {
      setIsDrawing(false);
      return;
    }

    setIsDrawing(false);
    addElement(newElement);
    
    socketRef.current?.emit('element-update', {
      roomId,
      element: newElement,
    });
    
    setNewElement(null);
  };

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = camera.scale;
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - camera.x) / oldScale,
      y: (pointer.y - camera.y) / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * 1.1 : oldScale / 1.1;

    setCamera({
      scale: newScale,
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  return (
    <div className="canvas-container">
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        ref={stageRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        scaleX={camera.scale}
        scaleY={camera.scale}
        x={camera.x}
        y={camera.y}
      >
        <Layer>
          {elements.map((el) => {
            if (el.type === 'pen') {
              return (
                <Line
                  key={el.id}
                  points={el.points}
                  stroke={el.stroke}
                  strokeWidth={el.strokeWidth}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                />
              );
            }
            if (el.type === 'rect') {
              return (
                <Rect
                  key={el.id}
                  x={el.x}
                  y={el.y}
                  width={el.width}
                  height={el.height}
                  stroke={el.stroke}
                  strokeWidth={el.strokeWidth}
                />
              );
            }
            if (el.type === 'ellipse') {
              return (
                <Ellipse
                  key={el.id}
                  x={el.x + (el.width || 0) / 2}
                  y={el.y + (el.height || 0) / 2}
                  radiusX={Math.abs((el.width || 0) / 2)}
                  radiusY={Math.abs((el.height || 0) / 2)}
                  stroke={el.stroke}
                  strokeWidth={el.strokeWidth}
                />
              );
            }
            if (el.type === 'image' && el.src) {
              return (
                <ImageComponent
                  key={el.id}
                  src={el.src}
                  x={el.x}
                  y={el.y}
                  width={el.width}
                  height={el.height}
                />
              );
            }
            return null;
          })}
          {Object.values(cursors).map((cursor: any) => {
            if (cursor.userId === userId) return null;
            return (
              <Circle
                key={cursor.userId}
                x={cursor.x}
                y={cursor.y}
                radius={5 / camera.scale}
                fill="#ff4757"
              />
            );
          })}
          {newElement && (
            <>
              {newElement.type === 'pen' && (
                <Line
                  points={newElement.points}
                  stroke={newElement.stroke}
                  strokeWidth={newElement.strokeWidth}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                />
              )}
              {newElement.type === 'rect' && (
                <Rect
                  x={newElement.x}
                  y={newElement.y}
                  width={newElement.width}
                  height={newElement.height}
                  stroke={newElement.stroke}
                  strokeWidth={newElement.strokeWidth}
                />
              )}
              {newElement.type === 'ellipse' && (
                <Ellipse
                  x={newElement.x + (newElement.width || 0) / 2}
                  y={newElement.y + (newElement.height || 0) / 2}
                  radiusX={Math.abs((newElement.width || 0) / 2)}
                  radiusY={Math.abs((newElement.height || 0) / 2)}
                  stroke={newElement.stroke}
                  strokeWidth={newElement.strokeWidth}
                />
              )}
            </>
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default Canvas;
