import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import MainHeader from './components/MainHeader';
import TopStrip from './components/TopStrip';
import Login from './components/Login';
import About from './components/About';
import Planner from './components/Planner';

function App() {
  const [username, setUsername] = useState('');

  return (
    <Router>
      <div className="Main">
        <TopStrip />
        <Routes>
          <Route path="/" element={<MainHeader />} />
          <Route path="/login" element={<Login setUsername={setUsername} />} />
          <Route path="/about" element={<About />} />
          <Route path="/planner" element={<Planner username={username} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
