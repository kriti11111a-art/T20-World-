import React, { useState, useEffect } from 'react';
import { Copy, Users, DollarSign, UserCheck, TrendingUp, Gift, Layers, RefreshCw, Info, Briefcase } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import tokenManager from '../utils/tokenManager';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Referral = () => {
  const { user, token } = useAuth();
  const { isDark, colors } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [teamLevelTab, setTeamLevelTab] = useState('all');
  
  // Calculate initial stats from user data for INSTANT display
  const userBalance = user?.balance || 0;
  const userInvested = user?.total_invested || 0;
  const userEarned = user?.total_earned || 0;
  const totalBalance = userBalance + userInvested + userEarned;
  const initialEligibleLevels = totalBalance >= 100 ? 5 : (totalBalance >= 50 ? 3 : 0);
  
  const [stats, setStats] = useState({
    wallet_balance: totalBalance,
    eligible_levels: initialEligibleLevels,
    total_team: 0,
    active_members: 0,
    total_investment: 0,
    referral_earnings: user?.referral_earnings || 0,
    direct_rewards_earned: user?.direct_rewards_earned || 0
  });
  const [referrals, setReferrals] = useState([]);
  const [teamByLevel, setTeamByLevel] = useState(null);
  const [levelIncome, setLevelIncome] = useState([]);
  const [directRewards, setDirectRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const referralCode = user ? user.referral_code : 'TGXXXXXX';
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const teamLevelTabs = [
    { id: 'all', label: 'All' },
    { id: 'level_1', label: 'Level 1' },
    { id: 'level_2', label: 'Level 2' },
    { id: 'level_3', label: 'Level 3' },
    { id: 'level_4', label: 'Level 4' },
    { id: 'level_5', label: 'Level 5' },
    { id: 'level_6', label: 'Level 6' },
    { id: 'level_7', label: 'Level 7' },
    { id: 'level_8', label: 'Level 8' },
    { id: 'level_9', label: 'Level 9' },
    { id: 'level_10', label: 'Level 10' },
  ];

  // Level commission percentages
  const levelPercentages = {
    1: '1%', 2: '1%', 3: '1%', 4: '1%', 5: '1%',
    6: '0.6%', 7: '0.5%', 8: '0.4%', 9: '0.3%', 10: '0.2%'
  };

  useEffect(() => {
    // Fetch data immediately on mount
    fetchAllData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllData = async () => {
    const authToken = tokenManager.get();
    if (!authToken) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const headers = { 'Authorization': `Bearer ${authToken}` };
    
    try {
      // Fetch ALL data in parallel for instant loading
      const [statsRes, refRes, teamRes, levelRes, directRes] = await Promise.allSettled([
        fetch(`${API_URL}/api/referrals/stats`, { headers }),
        fetch(`${API_URL}/api/referrals`, { headers }),
        fetch(`${API_URL}/api/referrals/team-by-level`, { headers }),
        fetch(`${API_URL}/api/referrals/level-income`, { headers }),
        fetch(`${API_URL}/api/referrals/direct-rewards`, { headers })
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        const statsData = await statsRes.value.json();
        setStats(statsData);
      }
      if (refRes.status === 'fulfilled' && refRes.value.ok) {
        setReferrals(await refRes.value.json());
      }
      if (teamRes.status === 'fulfilled' && teamRes.value.ok) {
        setTeamByLevel(await teamRes.value.json());
      }
      if (levelRes.status === 'fulfilled' && levelRes.value.ok) {
        setLevelIncome(await levelRes.value.json());
      }
      if (directRes.status === 'fulfilled' && directRes.value.ok) {
        setDirectRewards(await directRes.value.json());
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
    }
    setLoading(false);
  };

  const fetchWithTimeout = async (url, options, timeout = 8000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  };

  const copyToClipboard = async (text, successMessage, isLink = false) => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        if (isLink) {
          setLinkCopied(true);
          setTimeout(() => setLinkCopied(false), 2000);
        } else {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
        toast.success(successMessage);
        return;
      }
    } catch (err) {
      console.log('Clipboard API failed, trying fallback');
    }
    
    // Fallback method using textarea
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        if (isLink) {
          setLinkCopied(true);
          setTimeout(() => setLinkCopied(false), 2000);
        } else {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
        toast.success(successMessage);
      } else {
        toast.error('Copy failed. Please copy manually.');
      }
    } catch (err) {
      toast.error('Copy failed. Please copy manually.');
    }
  };

  const handleCopyLink = () => {
    copyToClipboard(referralLink, 'Referral link copied!', true);
  };

  const handleCopyCode = () => {
    copyToClipboard(referralCode, 'Referral code copied!', false);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getEligibilityBadge = () => {
    const levels = stats?.eligible_levels || 0;
    if (levels >= 5) {
      return { text: '5 LEVELS ACTIVE', color: '#0ECB81', bg: 'rgba(14, 203, 129, 0.2)' };
    } else if (levels >= 3) {
      return { text: '3 LEVELS ACTIVE', color: '#FFD700', bg: 'rgba(255, 215, 0, 0.2)' };
    } else {
      return { text: 'NOT ELIGIBLE', color: '#FF6B6B', bg: 'rgba(255, 107, 107, 0.2)' };
    }
  };

  const eligibility = getEligibilityBadge();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'income', label: 'Income', icon: DollarSign },
  ];

  return (
    <div style={{...styles.page, background: colors.background}}>
      <Header />
      
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={{...styles.title, color: colors.text}}>Team & Refer</h1>
          <p style={{...styles.subtitle, color: colors.textSecondary}}>Earn up to 5 levels of commission</p>
        </div>

        {/* Eligibility Status Card */}
        <div style={{...styles.eligibilityCard, background: colors.cardBg, border: `2px solid ${colors.accent}`}}>
          <div style={styles.eligibilityLeft}>
            <span style={{...styles.eligibilityLabel, color: colors.textSecondary}}>YOUR ELIGIBILITY</span>
            <span style={{
              ...styles.eligibilityBadge,
              color: eligibility.color,
              background: eligibility.bg,
              border: `1px solid ${eligibility.color}`,
            }}>
              {eligibility.text}
            </span>
          </div>
          <div style={styles.eligibilityRight}>
            <span style={{...styles.balanceLabel, color: colors.textSecondary}}>Wallet Balance</span>
            <span style={{...styles.balanceValue, color: colors.text}}>${stats?.wallet_balance?.toFixed(2) || '0.00'}</span>
          </div>
        </div>

        {/* Eligibility Info */}
        <div style={{
          ...styles.infoBox,
          background: isDark ? 'rgba(255,215,0,0.1)' : 'rgba(230,81,0,0.08)',
          border: `2px solid ${isDark ? 'rgba(255,215,0,0.4)' : 'rgba(230,81,0,0.4)'}`,
        }}>
          <Info size={16} color={isDark ? '#FFD700' : '#E65100'} />
          <div style={{...styles.infoText, color: isDark ? '#FFD700' : '#E65100'}}>
            <span><strong>$50+</strong> wallet = 3 levels income</span>
            <span><strong>$100+</strong> wallet = 5 levels income</span>
            <span><strong>$200+</strong> wallet = 10 levels income</span>
          </div>
        </div>

        {/* Referral Code Card */}
        <div style={{
          ...styles.codeCard,
          background: isDark ? 'rgba(255,215,0,0.1)' : 'rgba(230,81,0,0.08)',
          border: `2px solid ${isDark ? '#FFD700' : '#E65100'}`,
          boxShadow: `0 0 15px ${isDark ? 'rgba(255,215,0,0.2)' : 'rgba(230,81,0,0.15)'}`,
        }}>
          <h3 style={{...styles.codeTitle, color: colors.text}}>🎯 Your Referral Code</h3>
          <div style={{
            ...styles.codeBox,
            background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.9)',
            border: `2px solid ${isDark ? '#FFD700' : '#E65100'}`,
          }}>
            <span style={{
              ...styles.codeValue, 
              color: isDark ? '#FFD700' : '#E65100',
              fontSize: '20px',
              fontWeight: 800,
              letterSpacing: '2px',
            }}>{referralCode}</span>
            <button 
              style={{
                ...styles.copyBtn,
                background: isDark ? '#FFD700' : '#E65100',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 700,
                fontSize: '14px',
              }} 
              onClick={handleCopyCode}
            >
              <Copy size={18} />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Referral Link */}
        <div style={{
          ...styles.linkCard,
          background: isDark ? 'rgba(14,203,129,0.1)' : 'rgba(14,203,129,0.08)',
          border: `2px solid ${colors.accent}`,
          boxShadow: `0 0 15px ${colors.accent}30`,
        }}>
          <h3 style={{...styles.linkTitle, color: colors.text}}>📎 Referral Link</h3>
          <div style={{
            ...styles.linkBox,
            background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.9)',
            border: `2px solid ${colors.accent}`,
          }}>
            <input
              type="text"
              value={referralLink}
              readOnly
              style={{
                ...styles.linkInput,
                color: isDark ? colors.accent : '#0a5c36',
                background: 'transparent',
                fontWeight: 600,
              }}
            />
            <button 
              style={{
                ...styles.copyLinkBtn,
                background: linkCopied ? '#0a5c36' : colors.accent,
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 700,
                fontSize: '14px',
              }} 
              onClick={handleCopyLink}
            >
              <Copy size={18} />
              {linkCopied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          ...styles.tabsContainer,
          background: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
        }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                style={{
                  ...styles.tab,
                  background: activeTab === tab.id ? `${colors.accent}20` : 'transparent',
                  color: activeTab === tab.id ? colors.accent : colors.textSecondary,
                }}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div style={{...styles.loadingBox, color: colors.textSecondary}}>
            <RefreshCw size={24} className="spin" color={colors.accent} />
            <span>Loading...</span>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div style={styles.overviewSection}>
                {/* Stats Grid - 5 boxes */}
                <div style={styles.statsGrid}>
                  <div style={{
                    ...styles.statCard,
                    background: colors.cardBg,
                    border: `2px solid ${colors.accent}`,
                  }}>
                    <Users size={24} color={isDark ? '#FFD700' : '#E65100'} />
                    <span style={{...styles.statValue, color: isDark ? '#FFD700' : '#E65100'}}>{stats?.total_team || 0}</span>
                    <span style={{...styles.statLabel, color: colors.textSecondary}}>Total Team</span>
                  </div>
                  <div style={{
                    ...styles.statCard,
                    background: colors.cardBg,
                    border: `2px solid ${colors.accent}`,
                  }}>
                    <UserCheck size={24} color={colors.accent} />
                    <span style={{...styles.statValueGreen, color: colors.accent}}>{stats?.active_members || 0}</span>
                    <span style={{...styles.statLabel, color: colors.textSecondary}}>Active Members</span>
                  </div>
                  <div style={{
                    ...styles.statCard,
                    background: colors.cardBg,
                    border: `2px solid ${colors.accent}`,
                  }}>
                    <Briefcase size={24} color="#00D4FF" />
                    <span style={{...styles.statValue, color: '#00D4FF'}}>${stats?.total_investment?.toFixed(2) || '0.00'}</span>
                    <span style={{...styles.statLabel, color: colors.textSecondary}}>Total Team Investment</span>
                  </div>
                  <div style={{
                    ...styles.statCard,
                    background: colors.cardBg,
                    border: `2px solid ${colors.accent}`,
                  }}>
                    <DollarSign size={24} color={colors.accent} />
                    <span style={{...styles.statValueGreen, color: colors.accent}}>${stats?.referral_earnings?.toFixed(2) || '0.00'}</span>
                    <span style={{...styles.statLabel, color: colors.textSecondary}}>Total Team Earnings</span>
                  </div>
                </div>

                {/* Level-wise Earnings */}
                <div style={{
                  ...styles.levelEarningsCard,
                  background: colors.cardBg,
                  border: `2px solid ${colors.accent}`,
                }}>
                  <h3 style={{...styles.sectionTitle, color: colors.text}}>
                    <Layers size={18} color={isDark ? '#FFD700' : '#E65100'} />
                    Level-wise Earnings (10 Levels)
                  </h3>
                  
                  {/* Level Eligibility Cards */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                    marginBottom: '16px',
                  }}>
                    <div style={{
                      background: isDark ? 'rgba(0, 208, 156, 0.1)' : 'rgba(0, 208, 156, 0.08)',
                      border: '2px solid rgba(0, 208, 156, 0.4)',
                      borderRadius: '10px',
                      padding: '10px 8px',
                      textAlign: 'center',
                    }}>
                      <div style={{fontSize: '11px', color: '#0ECB81', fontWeight: 700}}>$50+</div>
                      <div style={{fontSize: '10px', color: colors.textSecondary, marginTop: '2px'}}>3 Levels</div>
                    </div>
                    <div style={{
                      background: isDark ? 'rgba(138, 43, 226, 0.1)' : 'rgba(138, 43, 226, 0.08)',
                      border: '2px solid rgba(138, 43, 226, 0.5)',
                      borderRadius: '10px',
                      padding: '10px 8px',
                      textAlign: 'center',
                    }}>
                      <div style={{fontSize: '11px', color: '#8A2BE2', fontWeight: 700}}>$100+</div>
                      <div style={{fontSize: '10px', color: colors.textSecondary, marginTop: '2px'}}>5 Levels</div>
                    </div>
                    <div style={{
                      background: isDark ? 'rgba(255, 105, 180, 0.1)' : 'rgba(255, 105, 180, 0.08)',
                      border: '2px solid rgba(255, 105, 180, 0.4)',
                      borderRadius: '10px',
                      padding: '10px 8px',
                      textAlign: 'center',
                    }}>
                      <div style={{fontSize: '11px', color: '#FF69B4', fontWeight: 700}}>$200+</div>
                      <div style={{fontSize: '10px', color: colors.textSecondary, marginTop: '2px'}}>10 Levels</div>
                    </div>
                  </div>
                  
                  {/* Your Status */}
                  <div style={{
                    background: `${colors.accent}10`,
                    border: `1px solid ${colors.accent}40`,
                    borderRadius: '8px',
                    padding: '10px',
                    textAlign: 'center',
                    marginBottom: '14px',
                  }}>
                    <span style={{fontSize: '12px', color: colors.accent, fontWeight: 600}}>
                      Your Active: ${stats?.active_investment?.toFixed(2) || '0.00'} → {stats?.eligible_levels || 0} Levels
                    </span>
                  </div>
                  
                  {/* Level 1-5 Row */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '6px',
                    marginBottom: '8px',
                  }}>
                    {[1, 2, 3, 4, 5].map((level) => {
                      const earning = stats?.level_wise_earnings?.[level] || 0;
                      const isActive = level <= (stats?.eligible_levels || 0);
                      return (
                        <div 
                          key={level} 
                          style={{
                            background: isActive 
                              ? (isDark ? 'rgba(14, 203, 129, 0.15)' : 'rgba(14, 203, 129, 0.12)')
                              : (isDark ? 'rgba(150, 150, 150, 0.08)' : 'rgba(150, 150, 150, 0.1)'),
                            border: isActive 
                              ? '2px solid #0ECB81' 
                              : `2px solid ${isDark ? 'rgba(150,150,150,0.3)' : 'rgba(150,150,150,0.4)'}`,
                            borderRadius: '10px',
                            padding: '8px 4px',
                            textAlign: 'center',
                            opacity: isActive ? 1 : 0.5,
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <div style={{
                            fontSize: '10px', 
                            fontWeight: 700, 
                            color: isActive ? '#0ECB81' : (isDark ? '#888' : '#666'), 
                            marginBottom: '2px'
                          }}>L{level}</div>
                          <div style={{
                            fontSize: '11px', 
                            fontWeight: 800, 
                            color: isActive ? '#0ECB81' : (isDark ? '#666' : '#888')
                          }}>${earning.toFixed(2)}</div>
                          <div style={{
                            fontSize: '9px', 
                            color: isActive ? (isDark ? '#0ECB81' : '#0a8a5a') : (isDark ? '#555' : '#999'),
                            marginTop: '2px'
                          }}>{levelPercentages[level]}</div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Level 6-10 Row */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '6px',
                  }}>
                    {[6, 7, 8, 9, 10].map((level) => {
                      const earning = stats?.level_wise_earnings?.[level] || 0;
                      const isActive = level <= (stats?.eligible_levels || 0);
                      return (
                        <div 
                          key={level} 
                          style={{
                            background: isActive 
                              ? (isDark ? 'rgba(14, 203, 129, 0.15)' : 'rgba(14, 203, 129, 0.12)')
                              : (isDark ? 'rgba(150, 150, 150, 0.08)' : 'rgba(150, 150, 150, 0.1)'),
                            border: isActive 
                              ? '2px solid #0ECB81' 
                              : `2px solid ${isDark ? 'rgba(150,150,150,0.3)' : 'rgba(150,150,150,0.4)'}`,
                            borderRadius: '10px',
                            padding: '8px 4px',
                            textAlign: 'center',
                            opacity: isActive ? 1 : 0.5,
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <div style={{
                            fontSize: '10px', 
                            fontWeight: 700, 
                            color: isActive ? '#0ECB81' : (isDark ? '#888' : '#666'), 
                            marginBottom: '2px'
                          }}>L{level}</div>
                          <div style={{
                            fontSize: '11px', 
                            fontWeight: 800, 
                            color: isActive ? '#0ECB81' : (isDark ? '#666' : '#888')
                          }}>${earning.toFixed(2)}</div>
                          <div style={{
                            fontSize: '9px', 
                            color: isActive ? (isDark ? '#0ECB81' : '#0a8a5a') : (isDark ? '#555' : '#999'),
                            marginTop: '2px'
                          }}>{levelPercentages[level]}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Rewards Info */}
                <div style={{
                  ...styles.rewardsInfoCard,
                  background: isDark ? 'rgba(255,215,0,0.1)' : 'rgba(230,81,0,0.08)',
                  border: `1px solid ${isDark ? 'rgba(255,215,0,0.3)' : 'rgba(230,81,0,0.3)'}`,
                }}>
                  <h4 style={{...styles.rewardsTitle, color: colors.text}}>🎁 Direct Referral Bonus</h4>
                  <p style={{...styles.rewardsDesc, color: colors.textSecondary}}>
                    Get <strong style={{color: isDark ? '#FFD700' : '#E65100'}}>$10</strong> instant reward when your direct referral deposits <strong style={{color: isDark ? '#FFD700' : '#E65100'}}>$50 to $1000</strong>
                  </p>
                  <p style={{...styles.rewardsDesc, color: colors.textSecondary, marginTop: '8px'}}>
                    Get <strong style={{color: isDark ? '#FFD700' : '#E65100'}}>$10 + 5%</strong> instant reward when your direct referral deposits <strong style={{color: isDark ? '#FFD700' : '#E65100'}}>$1000+</strong>
                  </p>
                  <span style={{...styles.rewardsNote, color: colors.textSecondary}}>*You must have $50+ wallet balance to receive</span>
                </div>
              </div>
            )}

            {/* Team Tab */}
            {activeTab === 'team' && (
              <div style={styles.teamSection}>
                {/* Level Tabs - Card Style */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px',
                  marginBottom: '16px',
                }}>
                  {teamLevelTabs.map((tab) => {
                    const isActive = teamLevelTab === tab.id;
                    const count = teamByLevel?.counts?.[tab.id] || 0;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setTeamLevelTab(tab.id)}
                        style={{
                          padding: '12px 8px',
                          background: isActive 
                            ? 'linear-gradient(135deg, #00D09C 0%, #00E5A0 100%)' 
                            : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                          border: isActive ? '2px solid #00D09C' : `2px solid ${colors.cardBorder}`,
                          borderRadius: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: isActive ? '#000' : colors.textSecondary,
                        }}>{tab.label}</span>
                        <span style={{
                          fontSize: '16px',
                          fontWeight: 700,
                          color: isActive ? '#000' : colors.accent,
                          background: isActive ? 'rgba(0,0,0,0.15)' : `${colors.accent}20`,
                          padding: '4px 10px',
                          borderRadius: '8px',
                          minWidth: '30px',
                        }}>{count}</span>
                      </button>
                    );
                  })}
                </div>

                <h3 style={{...styles.sectionTitle, color: colors.text}}>
                  {teamLevelTab === 'all' ? 'All Team Members' : `Level ${teamLevelTab.split('_')[1]} Members`}
                </h3>

                {(teamByLevel?.[teamLevelTab]?.length > 0) ? (
                  <div style={styles.memberList}>
                    {teamByLevel[teamLevelTab].map((member, idx) => (
                      <div key={idx} style={{
                        ...styles.memberItem,
                        background: colors.cardBg,
                        border: `1px solid ${colors.cardBorder}`,
                      }}>
                        <div style={{...styles.memberAvatar, background: `${colors.accent}30`, color: colors.accent}}>
                          {member.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div style={styles.memberInfo}>
                          <span style={{...styles.memberName, color: colors.text}}>{member.username}</span>
                          <span style={{...styles.memberDate, color: colors.textSecondary}}>Joined: {formatDate(member.joined_date)}</span>
                        </div>
                        <div style={styles.memberRight}>
                          <span style={{...styles.memberLevel, background: `${colors.accent}20`, color: colors.accent}}>L{member.level}</span>
                          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px'}}>
                            <span style={{...styles.memberInvested, color: isDark ? '#FFD700' : '#E65100'}}>
                              Deposit: ${member.total_deposit?.toFixed(2) || '0.00'}
                            </span>
                            {member.active_investments > 0 && (
                              <span style={{fontSize: '10px', color: '#0ECB81'}}>
                                {member.active_investments} Active SLAB
                              </span>
                            )}
                          </div>
                          <span style={{
                            ...styles.memberStatus,
                            color: member.status === 'active' ? '#0ECB81' : '#FF6B6B',
                            background: member.status === 'active' ? 'rgba(14,203,129,0.2)' : 'rgba(255,107,107,0.2)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '10px',
                          }}>
                            {member.status === 'active' ? '✓ ACTIVE' : 'INACTIVE'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={styles.emptyBox}>
                    <Users size={40} color="rgba(255, 255, 255, 0.3)" />
                    <span>No members in {teamLevelTab === 'all' ? 'your team' : `Level ${teamLevelTab.split('_')[1]}`}</span>
                    <span style={styles.emptySubtext}>Share your referral link to build your team!</span>
                  </div>
                )}
              </div>
            )}

            {/* Income Tab */}
            {activeTab === 'income' && (
              <div style={styles.incomeSection}>
                {/* Direct Rewards */}
                <div style={{
                  ...styles.incomeBlock,
                  background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.03)',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '2px solid rgba(0, 0, 0, 0.1)',
                }}>
                  <h3 style={{...styles.sectionTitle, color: colors.text}}>
                    <Gift size={18} color="#FFD700" />
                    Direct Rewards ($10)
                  </h3>
                  {directRewards.length > 0 ? (
                    <div style={styles.incomeList}>
                      {directRewards.map((reward, idx) => (
                        <div key={idx} style={{
                          ...styles.incomeItem,
                          background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.04)',
                        }}>
                          <div style={styles.incomeLeft}>
                            <span style={{...styles.incomeUser, color: colors.text}}>{reward.new_user_username}</span>
                            <span style={{...styles.incomeDate, color: colors.textSecondary}}>{formatDate(reward.created_at)}</span>
                          </div>
                          <div style={styles.incomeRight}>
                            <span style={styles.incomeAmount}>+${reward.amount?.toFixed(2)}</span>
                            <span style={{...styles.incomeSource, color: colors.textSecondary}}>Deposit: ${reward.deposit_amount?.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{...styles.emptySmall, color: colors.textSecondary}}>No direct rewards yet</div>
                  )}
                </div>

                {/* Level Income */}
                <div style={{
                  ...styles.incomeBlock,
                  background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.03)',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '2px solid rgba(0, 0, 0, 0.1)',
                }}>
                  <h3 style={{...styles.sectionTitle, color: colors.text}}>
                    <Layers size={18} color="#0ECB81" />
                    Level Commission (1%)
                  </h3>
                  {levelIncome.length > 0 ? (
                    <div style={styles.incomeList}>
                      {levelIncome.map((income, idx) => (
                        <div key={idx} style={{
                          ...styles.incomeItem,
                          background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.04)',
                        }}>
                          <div style={styles.incomeLeft}>
                            <div style={styles.incomeUserRow}>
                              <span style={styles.levelTag}>L{income.level}</span>
                              <span style={{...styles.incomeUser, color: colors.text}}>{income.from_username}</span>
                            </div>
                            <span style={{...styles.incomeDate, color: colors.textSecondary}}>{formatDate(income.created_at)}</span>
                          </div>
                          <div style={styles.incomeRight}>
                            <span style={styles.incomeAmountGreen}>+${income.amount?.toFixed(2)}</span>
                            <span style={{...styles.incomeSource, color: colors.textSecondary}}>{income.transaction_type}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{...styles.emptySmall, color: colors.textSecondary}}>No level income yet</div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

const styles = {
  page: {
    background: '#000000',
    minHeight: '100vh',
  },
  container: {
    padding: '90px 16px 40px',
    maxWidth: '480px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#FFFFFF',
    marginBottom: '6px',
  },
  subtitle: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.6)',
  },

  // Eligibility Card
  eligibilityCard: {
    background: 'linear-gradient(180deg, #0d0d0d 0%, #151515 100%)',
    border: '2px solid rgba(255, 215, 0, 0.5)',
    borderRadius: '16px',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  eligibilityLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  eligibilityLabel: {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: '1px',
  },
  eligibilityBadge: {
    fontSize: '12px',
    fontWeight: 700,
    padding: '6px 12px',
    borderRadius: '20px',
    display: 'inline-block',
  },
  eligibilityRight: {
    textAlign: 'right',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  balanceLabel: {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  balanceValue: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#0ECB81',
  },

  // Info Box
  infoBox: {
    background: 'rgba(255, 215, 0, 0.1)',
    border: '1px solid rgba(255, 215, 0, 0.3)',
    borderRadius: '10px',
    padding: '12px',
    display: 'flex',
    gap: '10px',
    marginBottom: '16px',
  },
  infoText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Code Card
  codeCard: {
    background: 'linear-gradient(180deg, #0d0d0d 0%, #151515 100%)',
    border: '2px solid rgba(255, 215, 0, 0.5)',
    borderRadius: '14px',
    padding: '16px',
    marginBottom: '12px',
  },
  codeTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#FFFFFF',
    marginBottom: '10px',
  },
  codeBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'rgba(255, 215, 0, 0.1)',
    border: '2px solid rgba(255, 215, 0, 0.4)',
    borderRadius: '10px',
    padding: '12px 14px',
  },
  codeValue: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#FFD700',
    letterSpacing: '2px',
  },
  copyBtn: {
    background: '#FFD700',
    color: '#000000',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    fontWeight: 600,
  },

  // Link Card
  linkCard: {
    background: 'linear-gradient(180deg, #0d0d0d 0%, #151515 100%)',
    border: '2px solid rgba(255, 215, 0, 0.4)',
    borderRadius: '14px',
    padding: '16px',
    marginBottom: '16px',
  },
  linkTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#FFFFFF',
    marginBottom: '10px',
  },
  linkBox: {
    display: 'flex',
    gap: '8px',
  },
  linkInput: {
    flex: 1,
    background: 'rgba(255, 255, 255, 0.05)',
    border: '2px solid rgba(255, 215, 0, 0.3)',
    borderRadius: '10px',
    padding: '10px 12px',
    fontSize: '11px',
    color: '#FFD700',
    outline: 'none',
  },
  copyLinkBtn: {
    background: 'rgba(255, 215, 0, 0.15)',
    border: '2px solid rgba(255, 215, 0, 0.4)',
    borderRadius: '10px',
    padding: '10px 14px',
    cursor: 'pointer',
    color: '#FFD700',
  },

  // Tabs
  tabsContainer: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
    background: 'rgba(255, 255, 255, 0.03)',
    padding: '6px',
    borderRadius: '12px',
  },
  tab: {
    flex: 1,
    padding: '12px 8px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
  tabActive: {
    background: 'rgba(255, 215, 0, 0.15)',
    color: '#FFD700',
  },

  // Loading
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '40px',
    color: 'rgba(255, 255, 255, 0.6)',
  },

  // Stats Grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '16px',
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  statValue: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#FFD700',
  },
  statValueGreen: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#0ECB81',
  },
  statLabel: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    textAlign: 'center',
  },

  // Level Earnings Card
  levelEarningsCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '14px',
    padding: '12px',
    marginBottom: '16px',
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#FFFFFF',
    marginBottom: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  levelGrid: {
    display: 'flex',
    gap: '8px',
  },
  levelItem: {
    flex: 1,
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '10px',
    padding: '10px 6px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  levelBadge: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#FFD700',
  },
  levelEarning: {
    fontSize: '14px',
    fontWeight: 700,
  },
  levelPercent: {
    fontSize: '9px',
    color: 'rgba(255, 255, 255, 0.4)',
  },

  // Rewards Info
  rewardsInfoCard: {
    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.05) 100%)',
    border: '1px solid rgba(255, 215, 0, 0.3)',
    borderRadius: '14px',
    padding: '16px',
  },
  rewardsTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#FFFFFF',
    marginBottom: '8px',
  },
  rewardsDesc: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: '8px',
    lineHeight: 1.4,
  },
  rewardsNote: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.5)',
    fontStyle: 'italic',
  },

  // Team Section
  teamSection: {
    marginTop: '8px',
  },
  levelTabsContainer: {
    display: 'flex',
    gap: '6px',
    marginBottom: '16px',
    overflowX: 'auto',
    paddingBottom: '4px',
  },
  levelTab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    padding: '10px 12px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '11px',
    fontWeight: 500,
    cursor: 'pointer',
    minWidth: '50px',
  },
  levelTabActive: {
    background: 'rgba(255, 215, 0, 0.15)',
    border: '1px solid rgba(255, 215, 0, 0.5)',
    color: '#FFD700',
  },
  levelTabCount: {
    fontSize: '13px',
    fontWeight: 700,
  },
  memberLevel: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#FFD700',
    background: 'rgba(255, 215, 0, 0.2)',
    padding: '2px 6px',
    borderRadius: '4px',
    marginBottom: '2px',
  },
  memberList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  memberItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
  },
  memberAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#000',
    fontWeight: 700,
    fontSize: '16px',
  },
  memberInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  memberName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#FFFFFF',
  },
  memberDate: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  memberRight: {
    textAlign: 'right',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  memberInvested: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#0ECB81',
  },
  memberStatus: {
    fontSize: '10px',
    fontWeight: 600,
  },

  // Income Section
  incomeSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  incomeBlock: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '14px',
    padding: '16px',
  },
  incomeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  incomeItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '10px',
  },
  incomeLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  incomeUserRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  levelTag: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#FFD700',
    background: 'rgba(255, 215, 0, 0.2)',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  incomeUser: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#FFFFFF',
  },
  incomeDate: {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  incomeRight: {
    textAlign: 'right',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  incomeAmount: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#FFD700',
  },
  incomeAmountGreen: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#0ECB81',
  },
  incomeSource: {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'capitalize',
  },

  // Empty states
  emptyBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '40px 20px',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '14px',
  },
  emptySubtext: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.3)',
  },
  emptySmall: {
    padding: '20px',
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: '13px',
  },
};

export default Referral;
