import React from 'react';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import './App.css';

function App() {
  return (
    <div className="App">
      <Toolbar />
      <Canvas />
    </div>
  );
}

export default App;
