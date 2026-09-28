import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, DollarSign, UserCheck, RefreshCw, Award } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import tokenManager from '../utils/tokenManager';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const NetworkTeams = () => {
  const { isDark, colors } = useTheme();
  const { token } = useAuth();
  
  const [stats, setStats] = useState({
    total_team: 0,
    active_members: 0,
    total_investment: 0,
    referral_earnings: 0,
    level_wise_earnings: {},
  });
  const [loading, setLoading] = useState(true);
  const [levelMembers, setLevelMembers] = useState({});

  // Fetch team stats from API
  const fetchTeamStats = async () => {
    const authToken = tokenManager.get();
    if (!authToken) return;
    
    try {
      const response = await fetch(`${API_URL}/api/referrals/stats`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching team stats:', error);
    }
    setLoading(false);
  };

  // Fetch level-wise members
  const fetchLevelMembers = async () => {
    const authToken = tokenManager.get();
    if (!authToken) return;
    
    try {
      const response = await fetch(`${API_URL}/api/referrals/team-levels`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLevelMembers(data);
      }
    } catch (error) {
      console.error('Error fetching level members:', error);
    }
  };

  useEffect(() => {
    // Fetch immediately on mount
    fetchTeamStats();
    fetchLevelMembers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const levelPercentages = {
    1: '1%', 2: '1%', 3: '1%', 4: '1%', 5: '1%',
    6: '0.6%', 7: '0.5%', 8: '0.4%', 9: '0.3%', 10: '0.2%'
  };

  return (
    <div style={{...styles.page, background: colors.background}}>
      <Header />
      
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={{...styles.title, color: colors.text}}>Network Teams</h1>
          <p style={{...styles.subtitle, color: colors.textSecondary}}>10 Level Deep Team Structure</p>
        </div>

        {/* Team Stats - Total and Active */}
        <div style={styles.statsGrid}>
          <div style={{...styles.statCard, background: colors.cardBg, border: `2px solid ${colors.accent}`}}>
            <div style={{...styles.statIcon, background: `${colors.gold}20`}}>
              <Users size={24} color={colors.gold} />
            </div>
            <div style={styles.statInfo}>
              <span style={{...styles.statValue, color: colors.text}}>
                {loading ? <RefreshCw size={18} className="spin" /> : stats.total_team}
              </span>
              <span style={{...styles.statLabel, color: colors.textSecondary}}>Total Team</span>
              <span style={{fontSize: '10px', color: colors.accent}}>(10 Levels)</span>
            </div>
          </div>
          <div style={{...styles.statCard, background: colors.cardBg, border: `2px solid ${colors.accent}`}}>
            <div style={{...styles.statIcon, background: 'rgba(14, 203, 129, 0.2)'}}>
              <UserCheck size={24} color="#0ECB81" />
            </div>
            <div style={styles.statInfo}>
              <span style={{...styles.statValue, color: '#0ECB81'}}>
                {loading ? <RefreshCw size={18} className="spin" /> : stats.active_members}
              </span>
              <span style={{...styles.statLabel, color: colors.textSecondary}}>Active Members</span>
              <span style={{fontSize: '10px', color: '#0ECB81'}}>(First Slab Done)</span>
            </div>
          </div>
          <div style={{...styles.statCard, background: colors.cardBg, border: `2px solid ${colors.accent}`}}>
            <div style={{...styles.statIcon, background: `${colors.gold}20`}}>
              <DollarSign size={24} color={colors.gold} />
            </div>
            <div style={styles.statInfo}>
              <span style={{...styles.statValue, color: colors.text}}>
                ${loading ? '...' : stats.total_investment?.toFixed(2)}
              </span>
              <span style={{...styles.statLabel, color: colors.textSecondary}}>Team Investment</span>
            </div>
          </div>
        </div>

        {/* Total Earnings Card */}
        <div style={{
          ...styles.earningsCard,
          background: `linear-gradient(135deg, ${colors.cardBg} 0%, rgba(255, 215, 0, 0.1) 100%)`,
          border: `2px solid ${colors.gold}`,
        }}>
          <Award size={28} color={colors.gold} />
          <div>
            <span style={{fontSize: '12px', color: colors.textSecondary}}>Total Level Earnings</span>
            <span style={{fontSize: '24px', fontWeight: 700, color: colors.gold, display: 'block'}}>
              ${stats.referral_earnings?.toFixed(2) || '0.00'}
            </span>
          </div>
        </div>

        {/* Level Breakdown - 10 Levels */}
        <div style={styles.levelSection}>
          <h2 style={{...styles.sectionTitle, color: colors.text}}>Team by Level (1-10)</h2>
          
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => {
            const levelData = levelMembers[level] || { count: 0, active: 0, investment: 0 };
            const earnings = stats.level_wise_earnings?.[level] || 0;
            
            return (
              <div key={level} style={{
                ...styles.levelCard,
                background: colors.cardBg,
                border: `1px solid ${level <= 5 ? colors.accent : 'rgba(255, 215, 0, 0.3)'}`,
              }}>
                <div style={styles.levelHeader}>
                  <div style={{
                    ...styles.levelBadge, 
                    background: level <= 5 ? `${colors.accent}30` : 'rgba(255, 215, 0, 0.2)'
                  }}>
                    <span style={{
                      color: level <= 5 ? colors.accent : colors.gold, 
                      fontWeight: 700,
                      fontSize: '14px'
                    }}>L{level}</span>
                  </div>
                  <div style={styles.levelInfo}>
                    <span style={{...styles.levelTitle, color: colors.text}}>Level {level}</span>
                    <span style={{...styles.levelSubtitle, color: colors.textSecondary}}>
                      {levelPercentages[level]} Commission
                    </span>
                  </div>
                  <div style={styles.levelStats}>
                    <span style={{
                      fontSize: '16px', 
                      fontWeight: 700, 
                      color: levelData.count > 0 ? colors.accent : colors.textSecondary
                    }}>
                      {levelData.count || 0}
                    </span>
                    <span style={{fontSize: '10px', color: colors.textSecondary}}>Members</span>
                  </div>
                </div>
                
                {/* Level Details Row */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '10px',
                  paddingTop: '10px',
                  borderTop: `1px solid ${colors.cardBorder}`
                }}>
                  <div style={{textAlign: 'center', flex: 1}}>
                    <span style={{fontSize: '14px', fontWeight: 600, color: '#0ECB81', display: 'block'}}>
                      {levelData.active || 0}
                    </span>
                    <span style={{fontSize: '10px', color: colors.textSecondary}}>Active</span>
                  </div>
                  <div style={{textAlign: 'center', flex: 1}}>
                    <span style={{fontSize: '14px', fontWeight: 600, color: colors.text, display: 'block'}}>
                      ${levelData.investment?.toFixed(0) || 0}
                    </span>
                    <span style={{fontSize: '10px', color: colors.textSecondary}}>Invested</span>
                  </div>
                  <div style={{textAlign: 'center', flex: 1}}>
                    <span style={{fontSize: '14px', fontWeight: 600, color: colors.gold, display: 'block'}}>
                      ${earnings?.toFixed(2) || '0.00'}
                    </span>
                    <span style={{fontSize: '10px', color: colors.textSecondary}}>Earned</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Card */}
        <div style={{
          background: isDark ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 215, 0, 0.15)',
          border: `1px solid ${colors.gold}`,
          borderRadius: '12px',
          padding: '16px',
          marginTop: '20px'
        }}>
          <h3 style={{color: colors.gold, fontSize: '14px', marginBottom: '8px'}}>💡 How Active Members Count?</h3>
          <p style={{color: colors.textSecondary, fontSize: '12px', margin: 0, lineHeight: 1.5}}>
            A member becomes <span style={{color: '#0ECB81', fontWeight: 600}}>ACTIVE</span> when they complete their 
            <span style={{color: colors.gold, fontWeight: 600}}> first SLAB investment</span> (any amount).
            Active members generate level commission for you!
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    paddingBottom: '80px',
  },
  container: {
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    marginTop: '4px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '20px',
  },
  statCard: {
    borderRadius: '12px',
    padding: '14px 10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  statIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statInfo: {
    textAlign: 'center',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: 700,
    display: 'block',
  },
  statLabel: {
    fontSize: '11px',
    display: 'block',
  },
  earningsCard: {
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
  },
  levelSection: {
    marginTop: '20px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 600,
    marginBottom: '16px',
  },
  levelCard: {
    borderRadius: '12px',
    padding: '14px',
    marginBottom: '10px',
  },
  levelHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  levelBadge: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: '14px',
    fontWeight: 600,
    display: 'block',
  },
  levelSubtitle: {
    fontSize: '11px',
  },
  levelStats: {
    textAlign: 'right',
  },
};

export default NetworkTeams;
