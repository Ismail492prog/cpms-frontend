import React from 'react';
import { useTheme } from '../context/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            aria-label="Toggle dark/light mode"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
            {theme === 'light' ? (
                <span className="theme-icon">🌙</span>
            ) : (
                <span className="theme-icon">☀️</span>
            )}
            <span className="theme-text">
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </span>
        </button>
    );
};

export default ThemeToggle;