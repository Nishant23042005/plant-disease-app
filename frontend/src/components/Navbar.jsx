import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo">
          🌿 PlantDetect
        </Link>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/history">History</Link>
          <button onClick={handleLogout}>Logout</button>
          <span className="user-email">👤 {user?.email || user?.name}</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;