import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// ===== TRADEGO GLOBAL THEME CONFIGURATION =====
// Change colors here to update the ENTIRE application
// Dark Navy + Electric Blue + Cyan - Premium Fintech Style

const DARK_THEME = {
  // Primary Backgrounds
  background: '#031A33',         // Main Background - Deep Navy
  bgSecondary: '#062544',        // Secondary Background
  cardBg: '#082B4D',             // Card Background
  
  // Accent Colors
  primaryBlue: '#087BFF',        // Primary Blue - Buttons, Links
  electricBlue: '#00BFFF',       // Electric Blue - Highlights
  cyanHighlight: '#16E0FF',      // Cyan Highlight - Active States, ROI
  
  // Text Colors
  text: '#FFFFFF',               // Primary Text - White
  textSecondary: '#B8C7DC',      // Secondary Text - Light Blue Grey
  textMuted: '#6B8299',          // Muted Text
  
  // Borders
  border: '#174D75',             // Border / Divider
  borderGlow: 'rgba(22, 224, 255, 0.3)',
  
  // Status Colors
  success: '#00D68F',            // Success Green
  error: '#FF4757',              // Error Red
  warning: '#FFBE0B',            // Warning Yellow
  gold: '#FFD700',               // Gold - VIP, Special
  
  // Input Styles
  inputBg: 'rgba(6, 37, 68, 0.8)',
  inputBorder: '#174D75',
  inputFocus: '#16E0FF',
  
  // Overlay
  overlay: 'rgba(3, 26, 51, 0.95)',
  
  // Gradients
  gradient: 'linear-gradient(90deg, #087BFF 0%, #16E0FF 100%)',
  gradientButton: 'linear-gradient(90deg, #087BFF 0%, #00BFFF 50%, #16E0FF 100%)',
  gradientGlow: 'linear-gradient(180deg, rgba(22, 224, 255, 0.15) 0%, rgba(0, 0, 0, 0) 100%)',
  
  // Shadows & Glows
  glowBlue: '0 0 20px rgba(8, 123, 255, 0.4)',
  glowCyan: '0 0 20px rgba(22, 224, 255, 0.4)',
  glowSubtle: '0 4px 24px rgba(22, 224, 255, 0.1)',
  cardShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  
  // Legacy Support (mapped to new values)
  accent: '#16E0FF',
  accentSecondary: '#00BFFF',
  cardBorder: '#174D75',
};

const LIGHT_THEME = {
  // Primary Backgrounds
  background: '#F0F4F8',         // Main Background - Light Blue Grey
  bgSecondary: '#FFFFFF',        // Secondary Background
  cardBg: '#FFFFFF',             // Card Background
  
  // Accent Colors
  primaryBlue: '#0066CC',        // Primary Blue - Darker for readability
  electricBlue: '#0099CC',       // Electric Blue
  cyanHighlight: '#00A3CC',      // Cyan Highlight
  
  // Text Colors
  text: '#0D2137',               // Primary Text - Dark Navy
  textSecondary: '#4A6B8A',      // Secondary Text
  textMuted: '#7A9AB8',          // Muted Text
  
  // Borders
  border: '#C4D4E4',             // Border / Divider
  borderGlow: 'rgba(0, 102, 204, 0.2)',
  
  // Status Colors
  success: '#00A86B',            // Success Green
  error: '#DC3545',              // Error Red
  warning: '#F59E0B',            // Warning Yellow
  gold: '#D4A017',               // Gold
  
  // Input Styles
  inputBg: '#FFFFFF',
  inputBorder: '#C4D4E4',
  inputFocus: '#0066CC',
  
  // Overlay
  overlay: 'rgba(255, 255, 255, 0.95)',
  
  // Gradients
  gradient: 'linear-gradient(90deg, #0066CC 0%, #00A3CC 100%)',
  gradientButton: 'linear-gradient(90deg, #0066CC 0%, #0099CC 50%, #00A3CC 100%)',
  gradientGlow: 'linear-gradient(180deg, rgba(0, 102, 204, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
  
  // Shadows & Glows
  glowBlue: '0 0 15px rgba(0, 102, 204, 0.3)',
  glowCyan: '0 0 15px rgba(0, 163, 204, 0.3)',
  glowSubtle: '0 4px 20px rgba(0, 0, 0, 0.08)',
  cardShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
  
  // Legacy Support
  accent: '#00A3CC',
  accentSecondary: '#0099CC',
  cardBorder: '#C4D4E4',
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true; // Default to dark (TradeGo primary theme)
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Apply theme to document
    const colors = isDark ? DARK_THEME : LIGHT_THEME;
    
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    document.body.style.backgroundColor = colors.background;
    document.body.style.color = colors.text;
    
    // Update CSS variables dynamically
    const root = document.documentElement;
    root.style.setProperty('--bg-main', colors.background);
    root.style.setProperty('--bg-secondary', colors.bgSecondary);
    root.style.setProperty('--bg-card', colors.cardBg);
    root.style.setProperty('--primary-blue', colors.primaryBlue);
    root.style.setProperty('--electric-blue', colors.electricBlue);
    root.style.setProperty('--cyan-highlight', colors.cyanHighlight);
    root.style.setProperty('--text-primary', colors.text);
    root.style.setProperty('--text-secondary', colors.textSecondary);
    root.style.setProperty('--text-muted', colors.textMuted);
    root.style.setProperty('--border-color', colors.border);
    root.style.setProperty('--success', colors.success);
    root.style.setProperty('--error', colors.error);
    root.style.setProperty('--warning', colors.warning);
    root.style.setProperty('--gold', colors.gold);
    
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const theme = {
    isDark,
    toggleTheme,
    colors: isDark ? DARK_THEME : LIGHT_THEME
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
