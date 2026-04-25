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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    setMobileMenuOpen(false);
  };

  const isAdminOrManager = userRole === 'ADMIN' || userRole === 'MANAGER';

  const getInitial = () => {
    if (user?.fullName) {
      return user.fullName.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Close mobile menu when navigating
  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="nav-brand" onClick={() => handleNavigation('/dashboard')}>
          <h1>🏗️ CPMS</h1>
          <span>Construction Project Management</span>
        </div>
        
        {/* Mobile menu button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
        
        <div className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
          {user && (
            <div className="nav-links">
              <button className="nav-link" onClick={() => handleNavigation('/dashboard')}>
                Dashboard
              </button>
              
              {isAdminOrManager && (
                <button className="nav-link" onClick={() => handleNavigation('/audit-logs')}>
                  📋 Audit Log
                </button>
              )}
              
              <button className="nav-link" onClick={() => handleNavigation('/alerts')}>
                🔔 Alerts
              </button>
            </div>
          )}
          
          <div className="nav-user">
            {user ? (
              <>
                <span className="user-name">Welcome, {user?.fullName}</span>
                {userRole && <span className="user-role">({userRole})</span>}
                
                <ThemeToggle />
                <NotificationBell />
                
                <Link to="/profile" className="profile-link" onClick={() => setMobileMenuOpen(false)}>
                  <div className="profile-avatar-small">
                    {getInitial()}
                  </div>
                </Link>
                
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </>
            ) : (
              <button onClick={() => handleNavigation('/login')} className="login-btn">
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;