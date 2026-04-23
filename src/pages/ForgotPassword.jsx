import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post('const API_BASE_URL = https://cpms-backend-production.up.railway.app/api/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('Password reset email sent!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>CPMS</h1>
          <h2>Check Your Email</h2>
          <p>We've sent a password reset link to:</p>
          <p><strong>{email}</strong></p>
          <p>Please check your inbox and follow the instructions.</p>
          <Link to="/login" className="btn-primary" style={{ display: 'block', textAlign: 'center', marginTop: '20px' }}>
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
        <h2>Forgot Password</h2>
        <p>Enter your email address and we'll send you a link to reset your password.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="manager@example.com"
            />
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        
        <p className="auth-link">
          <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;