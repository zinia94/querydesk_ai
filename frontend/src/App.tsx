// File: src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="container">
        <header className="header">
          <h1 className="title">
            🤖 QueryDesk<span className="highlight"> AI</span>
          </h1>
          <p className="subtitle">Semantic Search for Smarter Workflows</p>
          <nav style={{ marginTop: '2rem' }}>
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/about" className="nav-link">About</Link>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;