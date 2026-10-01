import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart3, Bot, Wallet, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const BottomNav = () => {
  const location = useLocation();
  const { colors } = useTheme();
  
  const navItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/' },
    { id: 'market', icon: BarChart3, label: 'Market', path: '/market' },
    { id: 'bot', icon: Bot, label: 'Bot', path: '/dashboard', isCenter: true },
    { id: 'assets', icon: Wallet, label: 'Assets', path: '/wallet' },
    { id: 'mine', icon: User, label: 'Mine', path: '/profile' },
  ];

  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/') return true;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav style={styles.container}>
      {/* Background glow effect */}
      <div style={styles.glowEffect} />
      
      <div style={styles.navWrapper}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          if (item.isCenter) {
            // Center Bot button - elevated with glow
            return (
              <Link 
                key={item.id} 
                to={item.path}
                style={styles.centerItem}
              >
                <div style={{
                  ...styles.centerIconWrapper,
                  background: active 
                    ? 'linear-gradient(135deg, #087BFF 0%, #16E0FF 100%)'
                    : 'linear-gradient(135deg, #0a1929 0%, #0d2847 100%)',
                  boxShadow: active
                    ? '0 0 30px rgba(22, 224, 255, 0.6), 0 0 60px rgba(8, 123, 255, 0.3)'
                    : '0 0 20px rgba(22, 224, 255, 0.4), 0 0 40px rgba(8, 123, 255, 0.2)',
                }}>
                  <Icon 
                    size={28} 
                    color={active ? '#FFFFFF' : '#16E0FF'} 
                    strokeWidth={2}
                  />
                </div>
                <span style={{
                  ...styles.centerLabel,
                  color: active ? '#16E0FF' : '#B8C7DC',
                }}>
                  {item.label}
                </span>
              </Link>
            );
          }
          
          return (
            <Link 
              key={item.id} 
              to={item.path}
              style={styles.navItem}
            >
              <div style={styles.iconWrapper}>
                <Icon 
                  size={24} 
                  color={active ? '#16E0FF' : '#6B8299'} 
                  strokeWidth={active ? 2.5 : 2}
                />
                {active && <div style={styles.activeIndicator} />}
              </div>
              <span style={{
                ...styles.label,
                color: active ? '#16E0FF' : '#6B8299',
                fontWeight: active ? 600 : 500,
              }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

const styles = {
  container: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(180deg, rgba(3, 26, 51, 0.95) 0%, #031A33 100%)',
    borderTop: '1px solid rgba(23, 77, 117, 0.5)',
    backdropFilter: 'blur(20px)',
    zIndex: 1000,
    paddingBottom: 'env(safe-area-inset-bottom)',
  },
  glowEffect: {
    position: 'absolute',
    top: '-20px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '120px',
    height: '40px',
    background: 'radial-gradient(ellipse, rgba(22, 224, 255, 0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  navWrapper: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    padding: '8px 10px 10px',
    maxWidth: '500px',
    margin: '0 auto',
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textDecoration: 'none',
    padding: '8px 12px',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    minWidth: '60px',
  },
  iconWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '4px',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: '-8px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '20px',
    height: '3px',
    background: 'linear-gradient(90deg, #087BFF 0%, #16E0FF 100%)',
    borderRadius: '2px',
    boxShadow: '0 0 10px rgba(22, 224, 255, 0.6)',
  },
  label: {
    fontSize: '11px',
    marginTop: '2px',
    transition: 'all 0.3s ease',
  },
  centerItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textDecoration: 'none',
    marginTop: '-30px',
    position: 'relative',
  },
  centerIconWrapper: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '3px solid rgba(22, 224, 255, 0.6)',
    transition: 'all 0.3s ease',
  },
  centerLabel: {
    fontSize: '11px',
    marginTop: '6px',
    fontWeight: 600,
    transition: 'all 0.3s ease',
  },
};

export default BottomNav;
