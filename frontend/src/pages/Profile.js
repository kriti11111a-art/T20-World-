import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Copy, Shield, Bell, Wallet, TrendingUp, DollarSign, Users } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import tokenManager from '../utils/tokenManager';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const { isDark, colors } = useTheme();
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [teamStats, setTeamStats] = useState({ total_team: 0, active_members: 0, referral_earnings: 0 });

  // Fetch team stats on mount
  useEffect(() => {
    const fetchTeamStats = async () => {
      const authToken = tokenManager.get();
      if (!authToken) return;
      
      try {
        const response = await fetch(`${API_URL}/api/referrals/stats`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (response.ok) {
          const data = await response.json();
          setTeamStats(data);
        }
      } catch (error) {
        console.error('Error fetching team stats:', error);
      }
    };
    
    if (isAuthenticated) {
      fetchTeamStats();
    }
  }, [isAuthenticated]);

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'wallet') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  // Get first letter of username for avatar
  const getInitial = () => {
    if (user?.username) return user.username.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  if (!isAuthenticated || !user) {
    return (
      <div style={{...styles.page, background: colors.background}}>
        <Header />
        <div style={styles.container}>
          <div style={{
            ...styles.authMessage, 
            background: isDark ? colors.cardBg : '#FFFFFF',
            border: isDark ? `1px solid ${colors.cardBorder}` : '2px solid #00C853'
          }}>
            <User size={48} color={colors.gold} />
            <h2 style={{color: colors.text}}>Please Login</h2>
            <p style={{color: colors.textSecondary}}>You need to login to view your profile</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{...styles.page, background: colors.background}}>
      <Header />
      
      <div style={styles.container}>
        {/* Page Header */}
        <div style={styles.pageHeader}>
          <div style={{
            ...styles.headerIcon,
            background: isDark ? 'rgba(0, 255, 136, 0.1)' : 'rgba(0, 200, 83, 0.1)'
          }}>
            <User size={24} color={colors.accent} />
          </div>
          <div>
            <h1 style={{...styles.pageTitle, color: colors.text}}>Profile</h1>
            <p style={{...styles.pageSubtitle, color: colors.textSecondary}}>Manage your account information</p>
          </div>
        </div>

        {/* Main Profile Card - Professional Layout */}
        <div style={{
          ...styles.profileCard,
          background: isDark 
            ? 'linear-gradient(180deg, #0a0a0a 0%, #121212 100%)' 
            : '#FFFFFF',
          border: isDark 
            ? '1px solid rgba(0, 255, 209, 0.3)' 
            : '2px solid #00C853'
        }}>
          {/* Avatar */}
          <div style={styles.avatarContainer}>
            <div style={{
              ...styles.avatar,
              background: 'transparent',
              padding: 0,
              overflow: 'visible',
              border: '2px solid #10B981',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.7), 0 0 30px rgba(13, 148, 136, 0.5)'
            }}>
              <img 
                src="/tg-logo.png" 
                alt="Profile" 
                style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', display: 'block'}}
              />
            </div>
          </div>

          {/* User Name */}
          <h2 style={{...styles.userName, color: colors.text}}>
            {user.username || 'User'}
          </h2>

          {/* Email */}
          <div style={styles.infoRow}>
            <Mail size={18} color={colors.textSecondary} />
            <span style={{...styles.infoText, color: colors.textSecondary}}>
              {user.email || 'N/A'}
            </span>
          </div>

          {/* Joined Date */}
          <div style={{
            ...styles.joinedBadge,
            background: isDark ? 'rgba(0, 255, 209, 0.15)' : 'rgba(0, 200, 83, 0.15)',
            border: isDark ? '1px solid rgba(0, 255, 209, 0.3)' : '1px solid rgba(0, 200, 83, 0.3)'
          }}>
            <Calendar size={16} color={colors.accent} />
            <span style={{...styles.joinedText, color: colors.accent}}>
              Joined {formatDate(user.created_at)}
            </span>
          </div>
        </div>

        {/* Stats Grid - 4 Cards */}
        <div style={styles.statsGrid}>
          {/* Total Balance */}
          <div style={{
            ...styles.statCard,
            background: isDark 
              ? 'linear-gradient(180deg, #0a0a0a 0%, #121212 100%)' 
              : '#FFFFFF',
            border: isDark 
              ? '1px solid rgba(0, 255, 209, 0.3)' 
              : '2px solid #00C853'
          }}>
            <div style={{
              ...styles.statIcon,
              background: isDark ? 'rgba(0, 255, 209, 0.1)' : 'rgba(0, 200, 83, 0.1)'
            }}>
              <Wallet size={22} color={colors.accent} />
            </div>
            <span style={{...styles.statLabel, color: colors.textSecondary}}>TOTAL BALANCE</span>
            <span style={{...styles.statValue, color: colors.accent}}>
              ${(user.balance || 0).toFixed(2)}
            </span>
          </div>

          {/* Total Invested */}
          <div style={{
            ...styles.statCard,
            background: isDark 
              ? 'linear-gradient(180deg, #0a0a0a 0%, #121212 100%)' 
              : '#FFFFFF',
            border: isDark 
              ? '1px solid rgba(0, 255, 209, 0.3)' 
              : '2px solid #00C853'
          }}>
            <div style={{
              ...styles.statIcon,
              background: isDark ? 'rgba(0, 255, 136, 0.1)' : 'rgba(0, 200, 83, 0.1)'
            }}>
              <TrendingUp size={22} color={colors.accent} />
            </div>
            <span style={{...styles.statLabel, color: colors.textSecondary}}>TOTAL INVESTED</span>
            <span style={{...styles.statValue, color: colors.gold}}>
              ${(user.total_invested || 0).toFixed(2)}
            </span>
          </div>

          {/* Total Earnings */}
          <div style={{
            ...styles.statCard,
            background: isDark 
              ? 'linear-gradient(180deg, #0a0a0a 0%, #121212 100%)' 
              : '#FFFFFF',
            border: isDark 
              ? '1px solid rgba(0, 255, 209, 0.3)' 
              : '2px solid #00C853'
          }}>
            <div style={{
              ...styles.statIcon,
              background: isDark ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 152, 0, 0.1)'
            }}>
              <DollarSign size={22} color={colors.gold} />
            </div>
            <span style={{...styles.statLabel, color: colors.textSecondary}}>TOTAL EARNINGS</span>
            <span style={{...styles.statValue, color: '#FFD700'}}>
              ${(user.total_earned || 0).toFixed(2)}
            </span>
          </div>

          {/* Total Referrals */}
          <div style={{
            ...styles.statCard,
            background: isDark 
              ? 'linear-gradient(180deg, #0a0a0a 0%, #121212 100%)' 
              : '#FFFFFF',
            border: isDark 
              ? '1px solid rgba(0, 255, 209, 0.3)' 
              : '2px solid #00C853'
          }}>
            <div style={{
              ...styles.statIcon,
              background: isDark ? 'rgba(255, 152, 0, 0.1)' : 'rgba(255, 152, 0, 0.1)'
            }}>
              <Users size={22} color="#FF9800" />
            </div>
            <span style={{...styles.statLabel, color: colors.textSecondary}}>TOTAL TEAM</span>
            <span style={{...styles.statValue, color: '#FF9800'}}>
              {teamStats.total_team || user?.referral_count || 0}
            </span>
          </div>
        </div>

        {/* Team Stats Card - NEW */}
        <div style={{
          ...styles.referralCard,
          background: isDark 
            ? 'linear-gradient(180deg, #0a0a0a 0%, #121212 100%)' 
            : '#FFFFFF',
          border: isDark 
            ? '1px solid rgba(14, 203, 129, 0.4)' 
            : '2px solid #00C853',
          marginBottom: '20px'
        }}>
          <h3 style={{...styles.cardTitle, color: colors.text}}>Team Performance</h3>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px'}}>
            <div style={{textAlign: 'center', padding: '12px', background: isDark ? 'rgba(255,152,0,0.1)' : 'rgba(255,152,0,0.08)', borderRadius: '10px'}}>
              <span style={{fontSize: '18px', fontWeight: 700, color: '#FF9800', display: 'block'}}>
                {teamStats.total_team || 0}
              </span>
              <span style={{fontSize: '10px', color: colors.textSecondary}}>Total Team</span>
            </div>
            <div style={{textAlign: 'center', padding: '12px', background: isDark ? 'rgba(14,203,129,0.1)' : 'rgba(14,203,129,0.08)', borderRadius: '10px'}}>
              <span style={{fontSize: '18px', fontWeight: 700, color: '#0ECB81', display: 'block'}}>
                {teamStats.active_members || 0}
              </span>
              <span style={{fontSize: '10px', color: colors.textSecondary}}>Active</span>
            </div>
            <div style={{textAlign: 'center', padding: '12px', background: isDark ? 'rgba(255,215,0,0.1)' : 'rgba(255,215,0,0.08)', borderRadius: '10px'}}>
              <span style={{fontSize: '18px', fontWeight: 700, color: colors.gold, display: 'block'}}>
                ${(teamStats.referral_earnings || 0).toFixed(2)}
              </span>
              <span style={{fontSize: '10px', color: colors.textSecondary}}>Earnings</span>
            </div>
          </div>
        </div>

        {/* Referral Code Card */}
        <div style={{
          ...styles.referralCard,
          background: isDark 
            ? 'linear-gradient(180deg, #0a0a0a 0%, #121212 100%)' 
            : '#FFFFFF',
          border: isDark 
            ? '1px solid rgba(255, 215, 0, 0.4)' 
            : '2px solid #00C853'
        }}>
          <h3 style={{...styles.cardTitle, color: colors.text}}>Your Referral Code</h3>
          <div style={{
            ...styles.referralBox,
            background: isDark ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 152, 0, 0.1)',
            border: isDark ? '2px solid rgba(255, 215, 0, 0.4)' : '2px solid #FF9800'
          }}>
            <span style={{...styles.referralCode, color: colors.gold}}>{user.referral_code || 'N/A'}</span>
            <button 
              style={{
                ...styles.copyReferralBtn,
                background: colors.gold,
                color: '#000000'
              }}
              onClick={() => handleCopy(user.referral_code || '', 'code')}
            >
              <Copy size={18} />
              {copiedCode ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Settings Card */}
        <div style={{
          ...styles.settingsCard,
          background: isDark 
            ? 'linear-gradient(180deg, #0a0a0a 0%, #121212 100%)' 
            : '#FFFFFF',
          border: isDark 
            ? '1px solid rgba(0, 255, 209, 0.3)' 
            : '2px solid #00C853'
        }}>
          <h3 style={{...styles.cardTitle, color: colors.text}}>Settings</h3>
          
          <div style={styles.settingsList}>
            <div style={{
              ...styles.settingItem,
              background: isDark ? 'rgba(255, 215, 0, 0.05)' : 'rgba(0, 200, 83, 0.05)'
            }}>
              <div style={styles.settingLeft}>
                <div style={{
                  ...styles.settingIcon,
                  background: isDark ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255, 152, 0, 0.15)'
                }}>
                  <Shield size={22} color={colors.gold} />
                </div>
                <div style={styles.settingInfo}>
                  <span style={{...styles.settingLabel, color: colors.text}}>Two-Factor Authentication</span>
                  <span style={{...styles.settingDesc, color: colors.textSecondary}}>Add extra security</span>
                </div>
              </div>
              <button style={{
                ...styles.enableBtn,
                background: isDark ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255, 152, 0, 0.15)',
                color: colors.gold,
                border: `2px solid ${colors.gold}40`
              }}>Enable</button>
            </div>

            <div style={{
              ...styles.settingItem,
              background: isDark ? 'rgba(255, 215, 0, 0.05)' : 'rgba(0, 200, 83, 0.05)'
            }}>
              <div style={styles.settingLeft}>
                <div style={{
                  ...styles.settingIcon,
                  background: isDark ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255, 152, 0, 0.15)'
                }}>
                  <Bell size={22} color={colors.gold} />
                </div>
                <div style={styles.settingInfo}>
                  <span style={{...styles.settingLabel, color: colors.text}}>Email Notifications</span>
                  <span style={{...styles.settingDesc, color: colors.textSecondary}}>Get updates about investments</span>
                </div>
              </div>
              <div style={styles.toggle}>
                <div style={{
                  ...styles.toggleTrack,
                  background: `${colors.gold}40`
                }}>
                  <div style={{...styles.toggleThumb, background: colors.gold}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

const styles = {
  page: {
    background: '#000000',
    minHeight: '100vh',
  },
  container: {
    padding: '100px 16px 60px',
    maxWidth: '500px',
    margin: '0 auto',
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
  },
  headerIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: 700,
    margin: 0,
    fontStyle: 'normal',
  },
  pageSubtitle: {
    fontSize: '14px',
    margin: 0,
    marginTop: '4px',
  },
  
  // Profile Card - Professional Layout
  profileCard: {
    borderRadius: '16px',
    padding: '32px 24px',
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  avatarContainer: {
    marginBottom: '20px',
  },
  avatar: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: '48px',
    fontWeight: 700,
    color: '#FFFFFF',
    textShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  userName: {
    fontSize: '28px',
    fontWeight: 700,
    margin: 0,
    marginBottom: '12px',
    fontStyle: 'normal',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  infoText: {
    fontSize: '16px',
  },
  joinedBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '25px',
  },
  joinedText: {
    fontSize: '14px',
    fontWeight: 600,
  },

  // Stats Grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginBottom: '20px',
  },
  statCard: {
    borderRadius: '16px',
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  statIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.5px',
  },
  statValue: {
    fontSize: '22px',
    fontWeight: 700,
  },

  // Referral Card
  referralCard: {
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '16px',
    margin: 0,
    marginBottom: '16px',
  },
  referralBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderRadius: '12px',
  },
  referralCode: {
    fontSize: '24px',
    fontWeight: 700,
    letterSpacing: '2px',
  },
  copyReferralBtn: {
    border: 'none',
    padding: '12px 20px',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: 600,
  },

  // Settings Card
  settingsCard: {
    borderRadius: '16px',
    padding: '24px',
  },
  settingsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  settingItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderRadius: '12px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  settingLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
    minWidth: '180px',
  },
  settingIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  settingLabel: {
    fontSize: '15px',
    fontWeight: 500,
  },
  settingDesc: {
    fontSize: '12px',
  },
  enableBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
  },
  toggle: {
    cursor: 'pointer',
  },
  toggleTrack: {
    width: '50px',
    height: '28px',
    borderRadius: '14px',
    padding: '3px',
    display: 'flex',
    alignItems: 'center',
  },
  toggleThumb: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    marginLeft: 'auto',
    transition: 'margin 0.2s ease',
  },
  authMessage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '60px 20px',
    textAlign: 'center',
    borderRadius: '16px',
  },
};

export default Profile;
