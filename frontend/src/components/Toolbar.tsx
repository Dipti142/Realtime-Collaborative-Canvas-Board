import React, { useRef } from 'react';
import { useStore } from '../store';
import { 
  Pencil, 
  Square, 
  Circle, 
  Move, 
  Undo2, 
  Redo2, 
  Image as ImageIcon,
  Share2,
  Minus,
  Plus
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

const Toolbar: React.FC = () => {
  const {
    selectedTool,
    setTool,
    strokeColor,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
    undo,
    redo,
    userId,
    roomId,
    addElement,
  } = useStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const socketRef = useRef<any>(null);
  
  // eslint-disable-next-line
  if (!socketRef.current) {
    socketRef.current = io(SOCKET_URL);
  }

  const handleUndo = () => {
    const lastAction = useStore.getState().undoStack[useStore.getState().undoStack.length - 1];
    const affected = undo();
    console.log("LAST ACTIONN  Undo====>", lastAction);
    console.log("Affected element after undo:", affected);
    console.log('Current undo stack after undo:', useStore.getState().undoStack);
    if (affected && lastAction) {
      if (lastAction.type === 'ADD') {
        socketRef.current.emit('element-delete', { roomId, elementId: affected.id });
      } else {
        socketRef.current.emit('element-update', { roomId, element: affected });
      }
    }
  };

  const handleRedo = () => {
    const lastAction = useStore.getState().redoStack[useStore.getState().redoStack.length - 1];
    const affected = redo();
    console.log("LAST ACTIONN  Redo====>", lastAction);
    console.log("Affected element after redo:", affected);
    console.log('Current redo stack after redo:', useStore.getState().redoStack);
    if (affected && lastAction) {
      if (lastAction.type === 'DELETE') {
        socketRef.current.emit('element-delete', { roomId, elementId: affected.id });
      } else {
        socketRef.current.emit('element-update', { roomId, element: affected });
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const element = {
            id: uuidv4(),
            type: 'image' as const,
            userId,
            x: 100,
            y: 100,
            width: img.width / 2,
            height: img.height / 2,
            stroke: 'transparent',
            strokeWidth: 0,
            src,
          };
          addElement(element);
          socketRef.current.emit('element-update', { roomId, element });
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    }
  };

  const shareRoom = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Room link copied to clipboard!');
  };

  return (
    <div className="toolbar-wrapper">
      <div className="toolbar">
        <div className="toolbar-section">
          <button 
            className={`tool-btn ${selectedTool === 'pen' ? 'active' : ''}`}
            onClick={() => setTool('pen')}
            title="Pen"
          >
            <Pencil size={20} />
          </button>
          <button 
            className={`tool-btn ${selectedTool === 'rect' ? 'active' : ''}`}
            onClick={() => setTool('rect')}
            title="Rectangle"
          >
            <Square size={20} />
          </button>
          <button 
            className={`tool-btn ${selectedTool === 'ellipse' ? 'active' : ''}`}
            onClick={() => setTool('ellipse')}
            title="Ellipse"
          >
            <Circle size={20} />
          </button>
          <button 
            className={`tool-btn ${selectedTool === 'pan' ? 'active' : ''}`}
            onClick={() => setTool('pan')}
            title="Pan"
          >
            <Move size={20} />
          </button>
        </div>
        
        <div className="separator" />

        <div className="toolbar-section">
          <div className="color-picker-wrapper">
            <input 
              type="color" 
              className="color-picker"
              value={strokeColor} 
              onChange={(e) => setStrokeColor(e.target.value)}
              title="Stroke Color"
            />
          </div>

          <div className="stroke-width-control">
            <button className="icon-btn" onClick={() => setStrokeWidth(Math.max(1, strokeWidth - 1))}><Minus size={14}/></button>
            <span className="width-label">{strokeWidth}</span>
            <button className="icon-btn" onClick={() => setStrokeWidth(strokeWidth + 1)}><Plus size={14}/></button>
          </div>
        </div>

        <div className="separator" />

        <div className="toolbar-section">
          <button className="tool-btn" onClick={() => fileInputRef.current?.click()} title="Upload Image">
            <ImageIcon size={20} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept="image/*" 
            onChange={handleImageUpload} 
          />
        </div>

        <div className="separator" />

        <div className="toolbar-section">
          <button className="tool-btn" onClick={handleUndo} title="Undo">
            <Undo2 size={20} />
          </button>
          <button className="tool-btn" onClick={handleRedo} title="Redo">
            <Redo2 size={20} />
          </button>
        </div>

        <div className="separator" />

        <div className="toolbar-section">
          <button className="share-btn" onClick={shareRoom}>
            <Share2 size={16} /> <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
