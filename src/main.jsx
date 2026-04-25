import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './styles/global.css'
import './styles/responsive.css';

// ✅ Service worker removed to fix caching issues
// The service worker was causing old cached versions to load
// requiring force refresh (Ctrl+Shift+R) to see updates
// Removing it ensures the app always loads the latest version

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
);