import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true; // Default to dark
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Apply theme to document
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.style.backgroundColor = '#050505';
      document.body.style.color = '#FFFFFF';
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.style.backgroundColor = '#F5F5F5';
      document.body.style.color = '#1A1A1A';
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const theme = {
    isDark,
    toggleTheme,
    colors: isDark ? {
      // Dark Theme Colors
      background: '#050505',
      cardBg: '#111111',
      cardBorder: '#222222',
      text: '#FFFFFF',
      textSecondary: 'rgba(255, 255, 255, 0.6)',
      textMuted: 'rgba(255, 255, 255, 0.4)',
      accent: '#00FF88',
      accentSecondary: '#00FFFF',
      gold: '#FFD700',
      inputBg: 'rgba(0, 0, 0, 0.5)',
      inputBorder: '#333333',
      overlay: 'rgba(0, 0, 0, 0.85)',
      success: '#00FF88',
      error: '#FF3B30',
      gradient: 'linear-gradient(90deg, #00FFFF 0%, #00FF88 100%)',
      glowGreen: '0 0 20px rgba(0, 255, 136, 0.4)',
      glowTeal: '0 0 20px rgba(0, 255, 255, 0.4)',
    } : {
      // Light Theme Colors
      background: '#F5F5F5',
      cardBg: '#FFFFFF',
      cardBorder: '#E0E0E0',
      text: '#1A1A1A',
      textSecondary: 'rgba(0, 0, 0, 0.6)',
      textMuted: 'rgba(0, 0, 0, 0.4)',
      accent: '#00C853',
      accentSecondary: '#00BCD4',
      gold: '#FF9800',
      inputBg: '#FFFFFF',
      inputBorder: '#CCCCCC',
      overlay: 'rgba(255, 255, 255, 0.9)',
      success: '#00C853',
      error: '#F44336',
      gradient: 'linear-gradient(90deg, #00BCD4 0%, #00C853 100%)',
      glowGreen: '0 0 15px rgba(0, 200, 83, 0.3)',
      glowTeal: '0 0 15px rgba(0, 188, 212, 0.3)',
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
