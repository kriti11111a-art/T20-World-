import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, X, LogOut, LayoutDashboard, TrendingUp, 
  Wallet, ArrowLeftRight, Users, UserPlus, 
  PlayCircle, FileText, User as UserIcon, Gift, Shield, DollarSign, Zap, Globe, Bell, Sun, Moon, Star
} from 'lucide-react';
import '../styles/header-mobile.css';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user, token } = useAuth();
  const { isDark, toggleTheme, colors } = useTheme();
  
  const isLoggedIn = isAuthenticated;

  // Fetch unread count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/api/notifications/unread-count`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unread_count || 0);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };
    
    fetchUnreadCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const handleBellClick = () => {
    // Navigate to notifications page
    navigate('/notifications');
  };
  
  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const loggedInNavLinks = [
    { path: '/deposit', label: 'Trading Slab', icon: TrendingUp },
    { path: '/my-investments', label: 'My Investment', icon: DollarSign },
    { path: '/income-history', label: 'Income History', icon: ArrowLeftRight },
    { path: '/guide', label: 'Guide', icon: FileText },
    { path: '/tutorial', label: 'Tutorial', icon: PlayCircle },
    ...((user?.is_admin || user?.email === 'admin@tradego.com') ? [{ path: '/admin', label: 'Admin Panel', icon: Shield, isAdmin: true }] : []),
    { path: '#logout', label: 'Logout', icon: LogOut, isLogout: true },
  ];

  const loggedOutNavLinks = [
    { path: '/', label: 'Home', icon: LayoutDashboard },
    { path: '/login', label: 'Login', icon: UserIcon },
    { path: '/register', label: 'Register', icon: Gift },
  ];

  const navLinks = isLoggedIn ? loggedInNavLinks : loggedOutNavLinks;

  const desktopNavLinks = isLoggedIn
    ? [
        { path: '/deposit', label: 'Investments', icon: TrendingUp },
        { path: '/my-investments', label: 'My Assets', icon: DollarSign },
        { path: '/income-history', label: 'History', icon: ArrowLeftRight },
      ]
    : loggedOutNavLinks;

  const handleNavClick = (path) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <header style={{...styles.header, background: colors.background, borderBottom: `1px solid ${colors.cardBorder}`}}>
      <div style={styles.container}>
        <Link to="/" style={styles.logoLink}>
          <div style={styles.logoWrapper}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: `2px solid ${colors.cyanHighlight || colors.accent}`,
              boxShadow: `0 0 15px rgba(22, 224, 255, 0.8), 0 0 30px rgba(8, 123, 255, 0.5)`,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              background: '#000'
            }}>
              <img 
                src="/app-logo.png" 
                alt="TradeGo" 
                style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', display: 'block'}}
              />
            </div>
            <h1 style={{...styles.logo, color: colors.text}}>
              <span style={{color: colors.cyanHighlight || colors.accent}}>Trade</span>Go
            </h1>
          </div>
        </Link>

        {/* Right Side Actions */}
        <div style={styles.rightActions}>
          {/* Desktop Navigation */}
          <nav className="desktop-nav" style={styles.nav}>
            {desktopNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  ...styles.navLink,
                  color: location.pathname === link.path ? colors.accent : colors.textSecondary,
                }}
              >
                {link.label}
              </Link>
            ))}
            {isLoggedIn ? (
              <button onClick={handleLogout} style={{...styles.connectBtn, background: colors.gradientButton || colors.gradient, boxShadow: colors.glowCyan || colors.glowGreen}}>
                <LogOut size={16} />
                Logout
              </button>
            ) : (
              <Link to="/login" style={{...styles.connectBtn, background: colors.gradientButton || colors.gradient, boxShadow: colors.glowCyan || colors.glowGreen}}>
                <Wallet size={16} />
                Connect
              </Link>
            )}
          </nav>

          {/* Mobile: Icons + Hamburger */}
          <div style={styles.mobileActions}>
            {/* Theme Toggle Button */}
            <button 
              style={{
                ...styles.iconBtn,
                background: isDark ? 'rgba(255, 215, 0, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                borderRadius: '10px',
                padding: '8px',
              }}
              onClick={toggleTheme}
              data-testid="theme-toggle-btn"
            >
              {isDark ? (
                <Sun size={20} color="#FFD700" />
              ) : (
                <Moon size={20} color="#1A1A1A" />
              )}
            </button>
            
            {/* Notification Bell with Count */}
            <div style={{ position: 'relative', zIndex: 100 }}>
              <button 
                style={{
                  ...styles.iconBtn,
                  background: 'transparent',
                  borderRadius: '10px',
                  padding: '10px',
                  cursor: 'pointer',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  touchAction: 'manipulation',
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleBellClick();
                }}
                data-testid="notification-bell"
              >
                <Bell size={20} color={colors.text} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#FF4444',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 700,
                    minWidth: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `2px solid ${colors.background}`,
                    pointerEvents: 'none',
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
            
            <button
              className="hamburger-menu-btn"
              style={styles.hamburgerBtn}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="hamburger-menu-btn"
            >
              <Menu size={26} color={colors.accent} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Navigation */}
      {isMobileMenuOpen && (
        <>
          <div 
            style={{...styles.overlay, background: isDark ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.5)'}} 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          <div style={{...styles.sidebar, background: colors.cardBg, borderRight: `1px solid ${colors.cardBorder}`}}>
            {/* Sidebar Header */}
            <div style={{...styles.sidebarHeader, borderBottom: `1px solid ${colors.cardBorder}`}}>
              <div style={styles.sidebarLogoWrapper}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '2px solid rgba(22, 224, 255, 0.6)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#0a1628',
                }}>
                  <img src="/app-logo.png" alt="TradeGo" style={{width: '80%', height: '80%', objectFit: 'contain'}} />
                </div>
                <h2 style={{...styles.sidebarTitle, color: colors.text}}>
                  <span style={{color: colors.cyanHighlight || colors.accent}}>Trade</span>Go
                </h2>
              </div>
              <button
                style={styles.closeBtn}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X size={24} color={colors.cyanHighlight || colors.accent} />
              </button>
            </div>

            <div style={{...styles.navLabel, color: colors.textMuted}}>NAVIGATION</div>

            {/* Sidebar Menu Items */}
            <div style={styles.sidebarMenu}>
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                
                // Special styling for Logout button
                if (link.isLogout) {
                  return (
                    <button
                      key={link.path}
                      onClick={handleLogout}
                      style={{
                        ...styles.sidebarItem,
                        border: '2px solid #DC3545',
                        background: 'rgba(220, 53, 69, 0.15)',
                        color: '#DC3545',
                        marginTop: '10px',
                      }}
                      data-testid="nav-logout"
                    >
                      <Star 
                        size={16} 
                        fill="#DC3545"
                        color="#DC3545"
                        style={{marginRight: '8px'}}
                      />
                      <div style={{
                        ...styles.iconWrapper,
                        background: 'rgba(220, 53, 69, 0.2)',
                        color: '#DC3545',
                      }}>
                        <Icon size={20} />
                      </div>
                      <span style={{
                        ...styles.sidebarItemText,
                        color: '#DC3545',
                        fontWeight: 600,
                      }}>{link.label}</span>
                    </button>
                  );
                }
                
                // Skip admin link in regular menu (handled separately)
                if (link.isAdmin) return null;
                
                return (
                  <button
                    key={link.path}
                    onClick={() => handleNavClick(link.path)}
                    style={{
                      ...styles.sidebarItem,
                      border: isActive ? '2px solid #00D09C' : `2px solid ${colors.accent}`,
                      background: isActive ? 'linear-gradient(135deg, #00D09C 0%, #00E5A0 50%, #00F5B0 100%)' : `${colors.accent}10`,
                      color: isActive ? '#000000' : colors.text,
                      boxShadow: isActive ? '0 0 20px rgba(0, 208, 156, 0.5)' : 'none',
                    }}
                    data-testid={`nav-${link.label.toLowerCase().replace(' ', '-')}`}
                  >
                    <Star 
                      size={16} 
                      fill={isActive ? '#000000' : colors.accent} 
                      color={isActive ? '#000000' : colors.accent}
                      style={{marginRight: '8px'}}
                    />
                    <div style={{
                      ...styles.iconWrapper,
                      background: isActive ? 'rgba(0, 0, 0, 0.2)' : `${colors.accent}20`,
                      color: isActive ? '#000000' : colors.accent,
                    }}>
                      <Icon size={20} />
                    </div>
                    <span style={{
                      ...styles.sidebarItemText,
                      color: isActive ? '#000000' : colors.text,
                      fontWeight: isActive ? 700 : 500,
                    }}>{link.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Admin Panel Button - Only for admins */}
            {isLoggedIn && (user?.is_admin || user?.email === 'admin@tradego.com') && (
              <div style={{padding: '12px', borderTop: `1px solid ${colors.cardBorder}`, marginTop: '10px'}}>
                <button 
                  onClick={() => handleNavClick('/admin')} 
                  style={{...styles.adminBtn, background: colors.gradient, boxShadow: colors.glowGreen}}
                >
                  <div style={styles.adminIconWrapper}>
                    <Shield size={20} color="#000" />
                  </div>
                  <span style={styles.adminText}>Admin Panel</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </header>
  );
};

const styles = {
  header: {
    borderBottom: '1px solid #222222',
    padding: '12px 16px',
    position: 'fixed',
    top: 0,
    width: '100%',
    height: '70px',
    zIndex: 100,
    boxSizing: 'border-box',
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: '1400px',
    margin: '0 auto',
    height: '100%',
  },
  logoLink: {
    textDecoration: 'none',
  },
  logoWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    background: 'rgba(0, 255, 136, 0.1)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 15px rgba(0, 255, 136, 0.3)',
  },
  logo: {
    fontSize: '20px',
    fontWeight: 700,
    fontFamily: "'Outfit', sans-serif",
    color: '#FFFFFF',
    margin: 0,
  },
  logoAccent: {
    color: '#00FF88',
  },
  rightActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '28px',
  },
  navLink: {
    color: 'rgba(255, 255, 255, 0.6)',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'color 0.3s ease',
  },
  navLinkActive: {
    color: '#00FF88',
  },
  connectBtn: {
    background: 'linear-gradient(90deg, #00FFFF 0%, #00FF88 100%)',
    color: '#000000',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    boxShadow: '0 0 15px rgba(0, 255, 136, 0.3)',
  },
  mobileActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    opacity: 0.7,
  },
  hamburgerBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.85)',
    zIndex: 998,
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '300px',
    height: '100vh',
    background: '#0a0a0a',
    borderRight: '1px solid #222222',
    zIndex: 999,
    overflowY: 'auto',
    animation: 'slideIn 0.3s ease-out',
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #222222',
  },
  sidebarLogoWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  sidebarLogoIcon: {
    width: '36px',
    height: '36px',
    background: 'rgba(0, 255, 136, 0.1)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarTitle: {
    fontSize: '18px',
    fontFamily: "'Outfit', sans-serif",
    color: '#FFFFFF',
    fontWeight: 700,
    margin: 0,
  },
  titleAccent: {
    color: '#00FF88',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
  },
  navLabel: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.3)',
    letterSpacing: '2px',
    padding: '20px 20px 12px',
    fontWeight: 500,
  },
  sidebarMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '0 12px',
    flex: 1,
    paddingBottom: '20px',
  },
  sidebarItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    background: 'transparent',
    border: '1px solid #333333',
    borderRadius: '12px',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '15px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    width: '100%',
    textAlign: 'left',
  },
  sidebarItemActive: {
    background: 'rgba(0, 255, 136, 0.1)',
    border: '1px solid #00FF88',
    color: '#00FF88',
    boxShadow: '0 0 15px rgba(0, 255, 136, 0.2)',
  },
  iconWrapper: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px',
    background: '#111111',
    color: '#00FF88',
    transition: 'all 0.3s ease',
  },
  iconWrapperActive: {
    background: 'rgba(0, 255, 136, 0.15)',
    boxShadow: '0 0 15px rgba(0, 255, 136, 0.3)',
  },
  sidebarItemText: {
    flex: 1,
  },
  logoutSection: {
    padding: '16px 12px',
    borderTop: '1px solid #222222',
    marginTop: '20px',
    paddingBottom: '30px',
  },
  adminBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px 14px',
    background: 'linear-gradient(90deg, #00FFFF 0%, #00FF88 100%)',
    border: 'none',
    borderRadius: '12px',
    color: '#000',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    width: '100%',
    marginBottom: '12px',
    boxShadow: '0 0 20px rgba(0, 255, 136, 0.4)',
  },
  adminIconWrapper: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px',
    background: 'rgba(0, 0, 0, 0.2)',
  },
  adminText: {
    flex: 1,
  },
  sidebarLogout: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 16px',
    background: 'rgba(220, 53, 69, 0.15)',
    border: '2px solid #DC3545',
    borderRadius: '12px',
    color: '#DC3545',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
  },
};

// Add mobile styles
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('header-mobile-styles');
  if (!existingStyle) {
    const style = document.createElement('style');
    style.id = 'header-mobile-styles';
    style.innerHTML = `
      @keyframes slideIn {
        from { transform: translateX(-100%); }
        to { transform: translateX(0); }
      }
      
      .hamburger-menu-btn { display: flex !important; }
      .desktop-nav { display: none !important; }
      
      @media (min-width: 1024px) {
        .hamburger-menu-btn { display: none !important; }
        .desktop-nav { display: flex !important; }
      }
    `;
    document.head.appendChild(style);
  }
}

export default Header;
