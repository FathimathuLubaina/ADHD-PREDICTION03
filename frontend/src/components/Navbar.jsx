import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { ageGroup, theme } = useThemeMode();
  const navigate = useNavigate();

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinkClass = ({ isActive }) =>
    'nav-link' + (isActive ? ' nav-link-active' : '');

  return (
    <header className="nav-shell">
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-logo">
            <div className="nav-logo-mark" />
            <div className="nav-title">
              <span className="nav-title-main">ADHD AWARE</span>
              <span className="nav-title-sub">Sri Kanyaka Parameswari College</span>
            </div>
          </div>
          <div className="nav-links">
            <NavLink to="/" className={getNavLinkClass}>
              <span>Home</span>
            </NavLink>
            <NavLink to="/about" className={getNavLinkClass}>
              <span>About Us</span>
            </NavLink>
            <NavLink to="/contact" className={getNavLinkClass}>
              <span>Contact</span>
            </NavLink>
            <NavLink to="/help" className={getNavLinkClass}>
              <span>Help</span>
            </NavLink>
            <NavLink to="/history" className={getNavLinkClass}>
              <span>History</span>
            </NavLink>
          </div>
          <div className="nav-right">
            <span className="chip">
              {ageGroup ? `${ageGroup} Mode` : 'Select age group'}
            </span>
            <button
              className="btn btn-outline"
              style={{ borderColor: theme.primary, color: theme.primary }}
              onClick={handleLogout}
            >
              {user?.name?.split(' ')[0] || 'Account'} · Logout
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}

