import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainHeader from './components/MainHeader';
import TopStrip from './components/TopStrip';
import Login from './components/Login';
import About from './components/About';
import Planner from './components/Planner';
import './App.css';

function App() {
  const [username, setUsername] = React.useState('');

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
