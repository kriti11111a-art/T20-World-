/**
 * TRADE GENIUS GLOBAL THEME CONFIGURATION
 * ========================================
 * 
 * Master theme file for the entire application.
 * Change colors here to update the ENTIRE app automatically.
 * 
 * Design: Dark Navy + Electric Blue + Cyan
 * Style: Premium, Classic, Modern Fintech / Trading
 */

// ===== TRADE GENIUS THEME COLORS =====
export const THEME = {
  // Primary Backgrounds
  bgMain: '#031A33',           // Main Background - Deep Navy
  bgSecondary: '#062544',      // Secondary Background
  bgCard: '#082B4D',           // Card Background
  
  // Accent Colors
  primaryBlue: '#087BFF',      // Primary Blue - Buttons, Links
  electricBlue: '#00BFFF',     // Electric Blue - Highlights
  cyanHighlight: '#16E0FF',    // Cyan Highlight - Active States, ROI
  
  // Text Colors
  textPrimary: '#FFFFFF',      // Primary Text - White
  textSecondary: '#B8C7DC',    // Secondary Text - Light Blue Grey
  textMuted: '#6B8299',        // Muted Text
  
  // Borders & Dividers
  border: '#174D75',           // Border / Divider
  borderGlow: 'rgba(22, 224, 255, 0.3)',
  
  // Status Colors
  success: '#00D68F',          // Success Green
  error: '#FF4757',            // Error Red
  warning: '#FFBE0B',          // Warning Yellow
  gold: '#FFD700',             // Gold - VIP, Special
  
  // Trading Colors (standard)
  buyGreen: '#0ECB81',         // Buy/Up - Binance Green
  sellRed: '#F6465D',          // Sell/Down - Binance Red
  
  // Input Styles
  inputBg: 'rgba(6, 37, 68, 0.8)',
  inputBorder: '#174D75',
  inputFocus: '#16E0FF',
  
  // Overlay
  overlay: 'rgba(3, 26, 51, 0.95)',
  overlayLight: 'rgba(3, 26, 51, 0.85)',
};

// ===== GRADIENTS =====
export const GRADIENTS = {
  primary: 'linear-gradient(135deg, #087BFF 0%, #16E0FF 100%)',
  button: 'linear-gradient(90deg, #087BFF 0%, #00BFFF 50%, #16E0FF 100%)',
  buttonHover: 'linear-gradient(90deg, #0A8FFF 0%, #00D4FF 50%, #20F0FF 100%)',
  cardBorder: 'linear-gradient(135deg, #174D75 0%, #16E0FF 50%, #174D75 100%)',
  glow: 'linear-gradient(180deg, rgba(22, 224, 255, 0.15) 0%, rgba(0, 0, 0, 0) 100%)',
  success: 'linear-gradient(135deg, #00D68F 0%, #00B87A 100%)',
  gold: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
  page: `linear-gradient(180deg, #031A33 0%, #041E38 100%)`,
};

// ===== SHADOWS & GLOWS =====
export const SHADOWS = {
  glowBlue: '0 0 20px rgba(8, 123, 255, 0.4)',
  glowCyan: '0 0 20px rgba(22, 224, 255, 0.4)',
  glowSubtle: '0 4px 24px rgba(22, 224, 255, 0.1)',
  card: '0 8px 32px rgba(0, 0, 0, 0.3)',
  cardHover: '0 0 30px rgba(22, 224, 255, 0.15)',
  button: '0 4px 15px rgba(8, 123, 255, 0.4)',
};

// ===== COMMON STYLES =====
export const CARD_STYLE = {
  background: THEME.bgCard,
  border: `1px solid ${THEME.border}`,
  borderRadius: '16px',
  boxShadow: SHADOWS.glowSubtle,
};

export const CARD_STYLE_HOVER = {
  ...CARD_STYLE,
  borderColor: 'rgba(22, 224, 255, 0.5)',
  boxShadow: SHADOWS.cardHover,
};

export const BUTTON_PRIMARY = {
  background: GRADIENTS.button,
  color: THEME.textPrimary,
  border: 'none',
  borderRadius: '12px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  boxShadow: SHADOWS.button,
};

export const BUTTON_OUTLINE = {
  background: 'transparent',
  color: THEME.cyanHighlight,
  border: `1px solid rgba(22, 224, 255, 0.5)`,
  borderRadius: '12px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
};

export const INPUT_STYLE = {
  background: THEME.inputBg,
  border: `1px solid ${THEME.inputBorder}`,
  borderRadius: '12px',
  color: THEME.textPrimary,
  fontSize: '14px',
  transition: 'all 0.3s ease',
};

// ===== RGBA HELPERS =====
export const rgba = {
  cyan: (alpha) => `rgba(22, 224, 255, ${alpha})`,
  blue: (alpha) => `rgba(8, 123, 255, ${alpha})`,
  success: (alpha) => `rgba(0, 214, 143, ${alpha})`,
  error: (alpha) => `rgba(255, 71, 87, ${alpha})`,
  warning: (alpha) => `rgba(255, 190, 11, ${alpha})`,
  gold: (alpha) => `rgba(255, 215, 0, ${alpha})`,
  white: (alpha) => `rgba(255, 255, 255, ${alpha})`,
  black: (alpha) => `rgba(0, 0, 0, ${alpha})`,
  buyGreen: (alpha) => `rgba(14, 203, 129, ${alpha})`,
  sellRed: (alpha) => `rgba(246, 70, 93, ${alpha})`,
};

// ===== PAGE CONTAINER STYLE =====
export const PAGE_STYLE = {
  minHeight: '100vh',
  background: THEME.bgMain,
  paddingTop: '80px',
  paddingBottom: '100px',
};

// ===== SECTION TITLE STYLE =====
export const SECTION_TITLE = {
  fontSize: '20px',
  fontWeight: '700',
  color: THEME.textPrimary,
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

// ===== AMOUNT HIGHLIGHT STYLE =====
export const AMOUNT_HIGHLIGHT = {
  color: THEME.cyanHighlight,
  fontWeight: '700',
};

// ===== STATUS BADGE STYLES =====
export const STATUS_BADGE = {
  active: {
    background: rgba.cyan(0.15),
    color: THEME.cyanHighlight,
    border: `1px solid ${rgba.cyan(0.3)}`,
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  success: {
    background: rgba.success(0.15),
    color: THEME.success,
    border: `1px solid ${rgba.success(0.3)}`,
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  warning: {
    background: rgba.warning(0.15),
    color: THEME.warning,
    border: `1px solid ${rgba.warning(0.3)}`,
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  error: {
    background: rgba.error(0.15),
    color: THEME.error,
    border: `1px solid ${rgba.error(0.3)}`,
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
};

export default THEME;
