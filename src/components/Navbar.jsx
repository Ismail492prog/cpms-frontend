import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle'; 

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('USER');

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://cpms-backend-production.up.railway.app/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setUserRole(response.data.role || 'USER');
      } catch (error) {
        console.error('Failed to fetch user role:', error);
      }
    };
    
    if (user) {
      fetchUserRole();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdminOrManager = userRole === 'ADMIN' || userRole === 'MANAGER';

  // Get first letter of user's name for avatar
  const getInitial = () => {
    if (user?.fullName) {
      return user.fullName.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => navigate('/dashboard')}>
        <h1>🏗️ CPMS</h1>
        <span>Construction Project Management</span>
      </div>
      
      {user && (
        <div className="nav-links">
          <button className="nav-link" onClick={() => navigate('/dashboard')}>
            Dashboard
          </button>
          
          {isAdminOrManager && (
            <button className="nav-link" onClick={() => navigate('/audit-logs')}>
              📋 Audit Log
            </button>
          )}
          
          <button className="nav-link" onClick={() => navigate('/alerts')}>
            🔔 Alerts
          </button>
        </div>
      )}
      
      <div className="nav-user">
        {user ? (
          <>
            <span className="user-name">Welcome, {user?.fullName}</span>
            {userRole && <span className="user-role">({userRole})</span>}
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Notification Bell */}
            <NotificationBell />
            
            {/* ✅ Profile Link - NEW */}
            <Link to="/profile" className="profile-link">
              <div className="profile-avatar-small">
                {getInitial()}
              </div>
            </Link>
            
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </>
        ) : (
          <button onClick={() => navigate('/login')} className="login-btn">
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;