import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(null);
  const [validating, setValidating] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setValidToken(false);
        setValidating(false);
        return;
      }
      
      try {
        const response = await axios.get(`http://localhost:8080/api/auth/validate-reset-token?token=${token}`);
        setValidToken(response.data.success);
      } catch {
        setValidToken(false);
      } finally {
        setValidating(false);
      }
    };
    
    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).*$/;
    if (!passwordRegex.test(password)) {
      toast.error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return;
    }
    
    setLoading(true);
    
    try {
      await axios.post('http://localhost:8080/api/auth/reset-password', {
        token,
        newPassword: password
      });
      
      toast.success('Password reset successful! Please login with your new password.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="loading-spinner">Validating token...</div>
        </div>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>CPMS</h1>
          <h2>Invalid or Expired Link</h2>
          <p>The password reset link is invalid or has expired.</p>
          <Link to="/forgot-password" className="btn-primary" style={{ display: 'block', textAlign: 'center', marginTop: '20px' }}>
            Request New Link
          </Link>
          <Link to="/login" style={{ display: 'block', textAlign: 'center', marginTop: '10px' }}>
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>CPMS</h1>
        <h2>Create New Password</h2>
        <p>Please enter your new password below.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Min 8 chars, 1 uppercase, 1 number"
            />
          </div>
          
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Re-enter your new password"
            />
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        
        <p className="auth-link">
          <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;