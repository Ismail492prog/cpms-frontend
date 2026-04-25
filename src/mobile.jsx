import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './styles/global.css'
import './styles/mobile.css'

// Mobile specific error handler
window.addEventListener('error', function(e) {
  console.error('Global error:', e.error);
  document.body.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: sans-serif;">
      <h3>⚠️ Loading Error</h3>
      <p style="color: #666;">${e.error?.message || 'Failed to load app'}</p>
      <button onclick="location.reload()" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px;">Retry</button>
      <p style="font-size: 12px; margin-top: 20px;">Check your internet connection and try again</p>
    </div>
  `;
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);