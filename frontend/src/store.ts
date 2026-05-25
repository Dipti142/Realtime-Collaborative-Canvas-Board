import { create } from 'zustand';
import type { CanvasElement, Camera, Tool } from './types';
import { v4 as uuidv4 } from 'uuid';

interface Action {
  type: 'ADD' | 'UPDATE' | 'DELETE';
  element: CanvasElement;
  prevElement?: CanvasElement;
}

interface BoardState {
  elements: CanvasElement[];
  camera: Camera;
  selectedTool: Tool;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  userId: string;
  roomId: string;
  undoStack: Action[];
  redoStack: Action[];
  cursors: Record<string, { x: number; y: number; userId: string }>;
  
  setRoomId: (id: string) => void;
  setElements: (elements: CanvasElement[]) => void;
  updateCursor: (cursor: { x: number; y: number; userId: string }) => void;
  removeCursor: (userId: string) => void;
  addElement: (element: CanvasElement, recordAction?: boolean) => void;
  updateElement: (element: CanvasElement, recordAction?: boolean) => void;
  deleteElement: (id: string, recordAction?: boolean) => void;
  setCamera: (camera: Partial<Camera>) => void;
  setTool: (tool: Tool) => void;
  setStrokeColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  
  undo: () => CanvasElement | undefined;
  redo: () => CanvasElement | undefined;
}

export const useStore = create<BoardState>((set, get) => ({
  elements: [],
  camera: { x: 0, y: 0, scale: 1 },
  selectedTool: 'pen',
  strokeColor: '#000000',
  fillColor: 'transparent',
  strokeWidth: 2,
  userId: uuidv4(),
  roomId: '',
  undoStack: [],
  redoStack: [],
  cursors: {},

  setRoomId: (roomId) => set({ roomId }),
  
  setElements: (elements) => set({ elements }),

  updateCursor: (cursor) => set((state) => ({
    cursors: { ...state.cursors, [cursor.userId]: cursor }
  })),

  removeCursor: (userId) => set((state) => {
    const newCursors = { ...state.cursors };
    delete newCursors[userId];
    return { cursors: newCursors };
  }),
  
  addElement: (element, recordAction = true) => {
    set((state) => {
      const newElements = [...state.elements, element];
      const newUndoStack = recordAction && element.userId === state.userId 
        ? [...state.undoStack, { type: 'ADD', element }] 
        : state.undoStack;
      
      return { 
        elements: newElements, 
        undoStack: newUndoStack,
        redoStack: recordAction ? [] : state.redoStack 
      };
    });
  },

  updateElement: (element, recordAction = true) => {
   // console.log('Updating element in store:', element);
    
    set((state) => {
      //console.log('Current elements before update:', state.elements);
      const prevElement = state.elements.find((el) => el.id === element.id);
      const newElements = state.elements.map((el) => 
        el.id === element.id ? element : el
      );
      
      if (!prevElement){
        newElements.push(element);
      }
      const newUndoStack = recordAction && element.userId === state.userId 
        ? [...state.undoStack, { type: 'UPDATE', element, prevElement }] 
        : state.undoStack;
      //console.log('Current elements after update:', newElements);
      //console.log('Undo stack after update:',prevElement);
      return { 
        elements: newElements, 
        undoStack: newUndoStack,
        redoStack: recordAction ? [] : state.redoStack 
      };
    });
  },

  deleteElement: (id, recordAction = true) => {
    set((state) => {
      const element = state.elements.find((el) => el.id === id);
      if (!element) return state;

      const newElements = state.elements.filter((el) => el.id !== id);
      const newUndoStack = recordAction && element.userId === state.userId 
        ? [...state.undoStack, { type: 'DELETE', element }] 
        : state.undoStack;

      return { 
        elements: newElements, 
        undoStack: newUndoStack,
        redoStack: recordAction ? [] : state.redoStack 
      };
    });
  },

  setCamera: (camera) => set((state) => ({ 
    camera: { ...state.camera, ...camera } 
  })),

  setTool: (selectedTool) => set({ selectedTool }),
  setStrokeColor: (strokeColor) => set({ strokeColor }),
  setStrokeWidth: (strokeWidth) => set({ strokeWidth }),

  undo: () => {
    const { undoStack, userId, elements } = get();
    if (undoStack.length === 0) return undefined;

    const lastAction = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);
    
    let affectedElement: CanvasElement | undefined;

    set((state) => {
      let newElements = [...state.elements];
      if (lastAction.type === 'ADD') {
        newElements = newElements.filter((el) => el.id !== lastAction.element.id);
        affectedElement = { ...lastAction.element }; // Signal delete to server
      } else if (lastAction.type === 'UPDATE' && lastAction.prevElement) {
        newElements = newElements.map((el) => 
          el.id === lastAction.element.id ? lastAction.prevElement! : el
        );
        affectedElement = lastAction.prevElement;
      } else if (lastAction.type === 'DELETE') {
        newElements.push(lastAction.element);
        affectedElement = lastAction.element;
      }

      return {
        elements: newElements,
        undoStack: newUndoStack,
        redoStack: [...state.redoStack, lastAction],
      };
    });

    return affectedElement;
  },

  redo: () => {
    const { redoStack } = get();
    if (redoStack.length === 0) return undefined;

    const lastAction = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);

    let affectedElement: CanvasElement | undefined;

    set((state) => {
      let newElements = [...state.elements];
      if (lastAction.type === 'ADD') {
        newElements.push(lastAction.element);
        affectedElement = lastAction.element;
      } else if (lastAction.type === 'UPDATE') {
        newElements = newElements.map((el) => 
          el.id === lastAction.element.id ? lastAction.element : el
        );
        affectedElement = lastAction.element;
      } else if (lastAction.type === 'DELETE') {
        newElements = newElements.filter((el) => el.id !== lastAction.element.id);
        affectedElement = lastAction.element; // Signal delete to server
      }

      return {
        elements: newElements,
        undoStack: [...state.undoStack, lastAction],
        redoStack: newRedoStack,
      };
    });

    return affectedElement;
  }
}));
