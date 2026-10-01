import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageCircle, Globe, Zap, Send } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Footer = () => {
  const { colors } = useTheme();
  
  return (
    <footer style={{...styles.footer, background: colors.background, borderTop: `1px solid ${colors.cardBorder}`}}>
      <div style={styles.container}>
        <div style={styles.grid}>
          {/* Brand Section */}
          <div style={{...styles.card, background: colors.cardBg, border: `2px solid ${colors.accent}`}}>
            <div style={styles.brandHeader}>
              <div style={{
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                border: '2px solid rgba(22, 224, 255, 0.6)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0a1628',
                boxShadow: '0 0 15px rgba(22, 224, 255, 0.4)',
              }}>
                <img src="/app-logo.png" alt="TradeGo" style={{width: '80%', height: '80%', objectFit: 'contain'}} />
              </div>
              <h2 style={{...styles.brandTitle, color: colors.text}}>
                <span style={{color: colors.cyanHighlight || colors.accent}}>Trade</span>Go
              </h2>
            </div>
            <p style={{...styles.brandDesc, color: colors.textSecondary}}>
              Smart Trading, Smart Earning<br />
              Daily ROI: 5.5% - 7%
            </p>
          </div>

          {/* Quick Links */}
          <div style={{...styles.card, background: colors.cardBg, border: `2px solid ${colors.accent}`}}>
            <h3 style={{...styles.sectionTitle, color: colors.text}}>Quick Links</h3>
            <div style={styles.linkList}>
              <Link to="/" style={{...styles.link, color: colors.textSecondary}}>Home</Link>
              <Link to="/login" style={{...styles.link, color: colors.textSecondary}}>Login</Link>
              <Link to="/register" style={{...styles.link, color: colors.textSecondary}}>Register</Link>
              <Link to="/dashboard" style={{...styles.link, color: colors.textSecondary}}>Dashboard</Link>
            </div>
          </div>

          {/* Support */}
          <div style={{...styles.card, background: colors.cardBg, border: `2px solid ${colors.accent}`}}>
            <h3 style={{...styles.sectionTitle, color: colors.text}}>Support</h3>
            <div style={styles.linkList}>
              <a href="#" style={{...styles.link, color: colors.textSecondary}}>
                <Mail size={16} color={colors.accentSecondary} />
                support@tradego.io
              </a>
              <a href="#" style={{...styles.link, color: colors.textSecondary}}>
                <Send size={16} color={colors.accentSecondary} />
                Telegram Support
              </a>
              <a href="#" style={{...styles.link, color: colors.textSecondary}}>
                <Globe size={16} color={colors.accentSecondary} />
                Join Community
              </a>
            </div>
          </div>

          {/* Investment Info */}
          <div style={{...styles.card, background: colors.cardBg, border: `2px solid ${colors.accent}`}}>
            <h3 style={{...styles.sectionTitle, color: colors.text}}>Investment Plans</h3>
            <div style={styles.planList}>
              <div style={{...styles.planItem, background: `${colors.accent}08`, border: `1px solid ${colors.accent}30`}}>
                <span style={{...styles.planName, color: colors.textSecondary}}>SLAB 1</span>
                <span style={{...styles.planRate, color: colors.accent}}>5.5%</span>
              </div>
              <div style={{...styles.planItem, background: `${colors.accent}08`, border: `1px solid ${colors.accent}30`}}>
                <span style={{...styles.planName, color: colors.textSecondary}}>SLAB 2</span>
                <span style={{...styles.planRate, color: colors.accent}}>6.0%</span>
              </div>
              <div style={{...styles.planItem, background: `${colors.accent}08`, border: `1px solid ${colors.accent}30`}}>
                <span style={{...styles.planName, color: colors.textSecondary}}>SLAB 3</span>
                <span style={{...styles.planRate, color: colors.accent}}>6.5%</span>
              </div>
              <div style={{...styles.planItem, background: `${colors.accent}08`, border: `1px solid ${colors.accent}30`}}>
                <span style={{...styles.planName, color: colors.textSecondary}}>SLAB 4</span>
                <span style={{...styles.planRate, color: colors.accent}}>7.0%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{...styles.bottomBar, borderTop: `1px solid ${colors.cardBorder}`}}>
          <p style={{...styles.copyright, color: colors.textMuted}}>
            © 2025 TradeGo - All Rights Reserved
          </p>
          <div style={styles.bottomLinks}>
            <a href="#" style={{...styles.bottomLink, color: colors.textMuted}}>Privacy Policy</a>
            <a href="#" style={{...styles.bottomLink, color: colors.textMuted}}>Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    background: '#050505',
    borderTop: '1px solid #222222',
    padding: '40px 16px 20px',
    marginTop: '40px',
  },
  container: {
    maxWidth: '500px',
    margin: '0 auto',
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '24px',
  },
  card: {
    background: '#111111',
    border: '1px solid #222222',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  brandHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  brandIcon: {
    width: '40px',
    height: '40px',
    background: 'rgba(0, 255, 136, 0.1)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: '20px',
    fontWeight: 700,
    fontFamily: "'Outfit', sans-serif",
    color: '#FFFFFF',
    margin: 0,
  },
  brandAccent: {
    color: '#00FF88',
  },
  brandDesc: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 1.6,
    margin: 0,
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#FFFFFF',
    margin: 0,
  },
  linkList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  link: {
    color: 'rgba(255, 255, 255, 0.6)',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'color 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  planList: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  planItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    background: 'rgba(0, 255, 136, 0.05)',
    borderRadius: '8px',
    border: '1px solid rgba(0, 255, 136, 0.1)',
  },
  planName: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  planRate: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#00FF88',
  },
  bottomBar: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '20px',
    borderTop: '1px solid #222222',
    gap: '12px',
  },
  copyright: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: '12px',
    margin: 0,
    textAlign: 'center',
  },
  bottomLinks: {
    display: 'flex',
    gap: '20px',
  },
  bottomLink: {
    color: 'rgba(255, 255, 255, 0.3)',
    textDecoration: 'none',
    fontSize: '11px',
    transition: 'color 0.3s ease',
  },
};

export default Footer;
