import React from 'react';
import { useTheme } from '../context/ThemeContext';
import Header from './Header';
import Footer from './Footer';

const ThemedPage = ({ children, showHeader = true, showFooter = true, style = {} }) => {
  const { colors } = useTheme();
  
  return (
    <div style={{
      background: colors.background,
      minHeight: '100vh',
      color: colors.text,
      ...style
    }}>
      {showHeader && <Header />}
      {children}
      {showFooter && <Footer />}
    </div>
  );
};

// Export theme hook for use in pages
export const usePageTheme = () => {
  const { isDark, colors, toggleTheme } = useTheme();
  
  // Generate common styles based on theme
  const getThemedStyles = () => ({
    page: {
      background: colors.background,
      minHeight: '100vh',
      color: colors.text,
    },
    card: {
      background: colors.cardBg,
      border: `1px solid ${colors.cardBorder}`,
      borderRadius: '16px',
      padding: '20px',
    },
    cardHighlight: {
      background: colors.cardBg,
      border: `1px solid ${colors.accent}50`,
      borderRadius: '16px',
      padding: '20px',
      boxShadow: colors.glowGreen,
    },
    title: {
      color: colors.text,
      fontFamily: "'Outfit', sans-serif",
      fontWeight: 700,
    },
    subtitle: {
      color: colors.textSecondary,
    },
    accent: {
      color: colors.accent,
    },
    accentSecondary: {
      color: colors.accentSecondary,
    },
    gold: {
      color: colors.gold,
    },
    input: {
      background: colors.inputBg,
      border: `1px solid ${colors.inputBorder}`,
      borderRadius: '12px',
      padding: '14px 16px',
      color: colors.text,
      fontSize: '15px',
      width: '100%',
      outline: 'none',
    },
    button: {
      background: colors.gradient,
      color: '#000',
      border: 'none',
      borderRadius: '12px',
      padding: '14px 24px',
      fontWeight: 700,
      cursor: 'pointer',
      boxShadow: colors.glowGreen,
    },
    buttonOutline: {
      background: 'transparent',
      color: colors.accent,
      border: `1px solid ${colors.accent}80`,
      borderRadius: '12px',
      padding: '14px 24px',
      fontWeight: 600,
      cursor: 'pointer',
    },
    label: {
      color: colors.textSecondary,
      fontSize: '13px',
      fontWeight: 500,
      marginBottom: '8px',
      display: 'block',
    },
    divider: {
      height: '1px',
      background: colors.cardBorder,
    },
    iconWrapper: {
      width: '48px',
      height: '48px',
      background: `${colors.accent}15`,
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    badge: {
      background: `${colors.accent}15`,
      color: colors.accent,
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 600,
    },
    tab: {
      background: 'transparent',
      color: colors.textSecondary,
      border: 'none',
      padding: '10px 16px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 500,
    },
    tabActive: {
      background: `${colors.accent}15`,
      color: colors.accent,
      border: 'none',
      padding: '10px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 600,
    },
  });

  return {
    isDark,
    colors,
    toggleTheme,
    getThemedStyles,
  };
};

export default ThemedPage;
