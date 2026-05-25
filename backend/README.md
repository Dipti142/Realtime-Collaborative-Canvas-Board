# Realtime Collaborative Canvas Board

a collaborative whiteboard application built with react, konva.js, and Socket.io.
## Features

- **Infinite Canvas**: Pan by dragging (Middle Mouse Button or Space + Left Click) and Zoom using the mouse wheel.
- **Drawing Tools**: Pen, Rectangle, and Ellipse.
- **Image Upload**: Upload images and place them on the canvas.
- **Realtime Collaboration**: Share the room URL to draw with others in realtime.
- **Remote Cursors**: See where other users are pointing on the canvas.
- **Per-User Undo/Redo**: Undo and Redo your own actions without affecting others.
- **No Auth**: Open the app and start drawing immediately.

## Installation

### Prerequisites

- Node.js (v18 or later)
- npm

### 1. Clone the repository

```bash
# In your terminal
mkdir canvas-board
cd canvas-board
# (Copy files into this directory)
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## Running the Application

### 1. Start the Backend Server

```bash
cd backend
npm run dev
```
The server will start on `http://localhost:3001`.
### 2. Start the Frontend Application

In a new terminal:
```bash
cd frontend
npm run dev
```
The application will be available at `http://localhost:5173`.

## Technical Stack

- **Frontend**: React, TypeScript, Vite, `react-konva` (Canvas rendering), Zustand (State management), Lucide React (Icons).
- **Backend**: Node.js, Express, Socket.io (Realtime communication).



