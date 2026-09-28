import React, { useState, useEffect } from 'react';
import { Gift, Layers, RefreshCw, TrendingUp, Award, Clock, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';

// Custom Wallet SVG Icon for Salary Income
const WalletIcon = ({ size = 20, color = "#9B59B6" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="6" width="20" height="14" rx="2" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M2 10h20" stroke={color} strokeWidth="2"/>
    <path d="M6 14h4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 14h2" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M6 4h12c1.1 0 2 .9 2 2v0" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import tokenManager from '../utils/tokenManager';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const IncomeHistory = () => {
  const { user, isAuthenticated } = useAuth();
  const { isDark, colors } = useTheme();
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedRank, setExpandedRank] = useState(null);
  
  // Calculate initial stats from user data for INSTANT display
  const userEarned = user?.total_earned || 0;
  const userReferralEarnings = user?.referral_earnings || 0;
  const userDirectRewards = user?.direct_rewards_earned || 0;
  
  const [stats, setStats] = useState({
    referral_earnings: userReferralEarnings,
    direct_rewards_earned: userDirectRewards,
    wallet_balance: (user?.balance || 0) + (user?.total_invested || 0) + userEarned
  });
  const [directRewards, setDirectRewards] = useState([]);
  const [levelIncome, setLevelIncome] = useState([]);
  const [compounding, setCompounding] = useState([]);
  const [bonuses, setBonuses] = useState([]);
  const [salary, setSalary] = useState([]);
  const [dailyRoi, setDailyRoi] = useState([]);
  const [salaryRankInfo, setSalaryRankInfo] = useState(null);

  const tabs = [
    { id: 'all', label: 'All', icon: TrendingUp },
    { id: 'daily_roi', label: 'Daily ROI', icon: DollarSign },
    { id: 'direct', label: 'Direct Reward', icon: Gift },
    { id: 'level', label: 'Level Income', icon: Layers },
    { id: 'compound', label: 'Compounding', icon: RefreshCw },
    { id: 'salary', label: 'Salary', icon: WalletIcon },
    { id: 'bonus', label: 'Bonus', icon: Award },
  ];

  // Fetch data immediately on mount
  useEffect(() => {
    fetchAllData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh function for manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  const fetchAllData = async () => {
    const authToken = tokenManager.get();
    if (!authToken) {
      setLoading(false);
      return;
    }
    
    const headers = { 'Authorization': `Bearer ${authToken}` };
    
    try {
      // Fetch ALL data in parallel for instant loading
      const [roiRes, statsRes, directRes, levelRes, compoundRes, salaryRes, rankRes, bonusRes] = 
        await Promise.allSettled([
          fetch(`${API_URL}/api/income/daily-roi`, { headers }),
          fetch(`${API_URL}/api/referrals/stats`, { headers }),
          fetch(`${API_URL}/api/referrals/direct-rewards`, { headers }),
          fetch(`${API_URL}/api/referrals/level-income`, { headers }),
          fetch(`${API_URL}/api/income/compounding`, { headers }),
          fetch(`${API_URL}/api/income/salary`, { headers }),
          fetch(`${API_URL}/api/salary/rank-info`, { headers }),
          fetch(`${API_URL}/api/income/bonuses`, { headers })
        ]);

      // Set data immediately as it arrives
      if (roiRes.status === 'fulfilled' && roiRes.value.ok) {
        setDailyRoi(await roiRes.value.json());
      }
      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        setStats(await statsRes.value.json());
      }
      if (directRes.status === 'fulfilled' && directRes.value.ok) {
        setDirectRewards(await directRes.value.json());
      }
      if (levelRes.status === 'fulfilled' && levelRes.value.ok) {
        setLevelIncome(await levelRes.value.json());
      }
      if (compoundRes.status === 'fulfilled' && compoundRes.value.ok) {
        setCompounding(await compoundRes.value.json());
      }
      if (salaryRes.status === 'fulfilled' && salaryRes.value.ok) {
        setSalary(await salaryRes.value.json());
      }
      if (rankRes.status === 'fulfilled' && rankRes.value.ok) {
        setSalaryRankInfo(await rankRes.value.json());
      }
      if (bonusRes.status === 'fulfilled' && bonusRes.value.ok) {
        setBonuses(await bonusRes.value.json());
      }

    } catch (error) {
      console.error('Error fetching income data:', error);
    }
    setLoading(false);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAllTransactions = () => {
    const all = [
      ...directRewards.map(d => ({ ...d, type: 'direct', amount: d.amount })),
      ...levelIncome.map(l => ({ ...l, type: 'level', amount: l.amount })),
      ...compounding.map(c => ({ ...c, type: 'compound', amount: c.amount })),
      ...salary.map(s => ({ ...s, type: 'salary', amount: s.amount })),
      ...bonuses.map(b => ({ ...b, type: 'bonus', amount: b.amount })),
      ...dailyRoi.map(r => ({ ...r, type: 'daily_roi', amount: r.amount })),
    ];
    return all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  };

  const getFilteredTransactions = () => {
    switch (activeTab) {
      case 'direct':
        return directRewards.map(d => ({ ...d, type: 'direct' }));
      case 'level':
        return levelIncome.map(l => ({ ...l, type: 'level' }));
      case 'compound':
        return compounding.map(c => ({ ...c, type: 'compound' }));
      case 'salary':
        return salary.map(s => ({ ...s, type: 'salary' }));
      case 'bonus':
        return bonuses.map(b => ({ ...b, type: 'bonus' }));
      case 'daily_roi':
        return dailyRoi.map(r => ({ ...r, type: 'daily_roi' }));
      default:
        return getAllTransactions();
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'direct':
        return <Gift size={20} color="#FFD700" />;
      case 'level':
        return <Layers size={20} color="#0ECB81" />;
      case 'compound':
        return <RefreshCw size={20} color="#00D4FF" />;
      case 'salary':
        return <WalletIcon size={20} color="#9B59B6" />;
      case 'bonus':
        return <Award size={20} color="#FF6B6B" />;
      case 'daily_roi':
        return <DollarSign size={20} color="#0ECB81" />;
      default:
        return <TrendingUp size={20} color="#0ECB81" />;
    }
  };

  const getTransactionLabel = (tx) => {
    switch (tx.type) {
      case 'direct':
        return `Direct Reward from ${tx.new_user_username || 'User'}`;
      case 'level':
        return `Level ${tx.level} Income from ${tx.from_username || 'User'}`;
      case 'compound':
        return `Compounding - ${tx.plan_name || 'Investment'}`;
      case 'salary':
        return `${tx.rank_name || 'Salary'} Rank - ${Array(tx.stars || 1).fill('⭐').join('')}`;
      case 'bonus':
        return `${tx.bonus_type || 'Bonus'} Reward`;
      case 'daily_roi':
        return `Day ${tx.day_number}/${tx.total_days} - ${tx.plan_name || 'Investment'} ($${tx.investment_amount?.toFixed(2) || '0'})`;
      default:
        return 'Income';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'direct':
        return '#FFD700';
      case 'level':
        return '#0ECB81';
      case 'compound':
        return '#00D4FF';
      case 'salary':
        return '#9B59B6';
      case 'bonus':
        return '#FF6B6B';
      case 'daily_roi':
        return '#0ECB81';
      default:
        return '#0ECB81';
    }
  };

  // Calculate totals from actual data arrays (more accurate than stats)
  const totalDirectReward = directRewards.reduce((acc, d) => acc + (d.amount || 0), 0) || stats?.direct_rewards_earned || user?.direct_rewards_earned || 0;
  const totalLevelIncome = levelIncome.reduce((acc, l) => acc + (l.amount || 0), 0) || Object.values(stats?.level_wise_earnings || {}).reduce((a, b) => a + b, 0);
  const totalCompounding = compounding.reduce((acc, c) => acc + (c.amount || 0), 0);
  const totalSalary = salary.reduce((acc, s) => acc + (s.amount || 0), 0);
  const totalBonus = bonuses.reduce((acc, b) => acc + (b.amount || 0), 0);
  const totalDailyRoi = dailyRoi.reduce((acc, r) => acc + (r.amount || 0), 0);
  
  // Calculate TODAY's earnings
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  };
  
  const todayDirectReward = directRewards.filter(d => isToday(d.created_at)).reduce((acc, d) => acc + (d.amount || 0), 0);
  const todayLevelIncome = levelIncome.filter(l => isToday(l.created_at)).reduce((acc, l) => acc + (l.amount || 0), 0);
  const todayDailyRoi = dailyRoi.filter(r => isToday(r.created_at)).reduce((acc, r) => acc + (r.amount || 0), 0);
  const todaySalary = salary.filter(s => isToday(s.created_at)).reduce((acc, s) => acc + (s.amount || 0), 0);
  const todayBonus = bonuses.filter(b => isToday(b.created_at)).reduce((acc, b) => acc + (b.amount || 0), 0);
  const todayCompounding = compounding.filter(c => isToday(c.created_at)).reduce((acc, c) => acc + (c.amount || 0), 0);
  
  // Today's Total = All today's earnings
  const todayTotal = todayDirectReward + todayLevelIncome + todayDailyRoi + todaySalary + todayBonus + todayCompounding;
  
  // All Earning = Sum of all income types
  // Priority: Use calculated values if available, otherwise use user's stored values
  const calculatedTotal = totalDirectReward + totalLevelIncome + totalDailyRoi + totalCompounding + totalSalary + totalBonus;
  const userStoredTotal = (user?.total_earned || 0) + (user?.referral_earnings || 0);
  const totalIncome = Math.max(calculatedTotal, userStoredTotal);

  if (!isAuthenticated) {
    return (
      <div style={styles.page}>
        <Header />
        <div style={styles.container}>
          <div style={styles.authMessage}>
            <TrendingUp size={48} color="#0ECB81" />
            <h2>Please Login</h2>
            <p>You need to login to view your income history</p>
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
        <div style={styles.header}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div>
              <h1 style={{...styles.title, color: colors.text}}>Income History</h1>
              <p style={{...styles.subtitle, color: colors.textSecondary}}>Track all your earnings</p>
            </div>
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                background: isDark ? 'rgba(14, 203, 129, 0.2)' : 'rgba(14, 203, 129, 0.15)',
                border: `2px solid ${colors.accent}`,
                borderRadius: '12px',
                padding: '12px',
                cursor: refreshing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RefreshCw 
                size={22} 
                color={colors.accent} 
                style={{
                  animation: refreshing ? 'spin 1s linear infinite' : 'none',
                }}
              />
            </button>
          </div>
        </div>

        {/* 6 Summary Boxes */}
        <div style={styles.sixBoxGrid}>
          {/* Box 1: All Earning */}
          <div style={{...styles.incomeBox, background: colors.cardBg, borderColor: `${colors.accent}80`}}>
            <div style={{...styles.boxIcon, background: `${colors.accent}20`}}>
              <TrendingUp size={20} color={colors.accent} />
            </div>
            <span style={{...styles.boxLabel, color: colors.textSecondary}}>All Earning</span>
            <span style={{...styles.boxValue, color: colors.accent}}>${totalIncome.toFixed(2)}</span>
          </div>

          {/* Box 2: Rewards (Direct Reward) */}
          <div style={{...styles.incomeBox, background: colors.cardBg, borderColor: `${colors.gold}80`}}>
            <div style={{...styles.boxIcon, background: `${colors.gold}20`}}>
              <Gift size={20} color={colors.gold} />
            </div>
            <span style={{...styles.boxLabel, color: colors.textSecondary}}>Rewards</span>
            <span style={{...styles.boxValue, color: colors.gold}}>${totalDirectReward.toFixed(2)}</span>
          </div>

          {/* Box 3: Team Income (Level Income) */}
          <div style={{...styles.incomeBox, background: colors.cardBg, borderColor: `${colors.accentSecondary}80`}}>
            <div style={{...styles.boxIcon, background: `${colors.accentSecondary}20`}}>
              <Layers size={20} color={colors.accentSecondary} />
            </div>
            <span style={{...styles.boxLabel, color: colors.textSecondary}}>Team Income</span>
            <span style={{...styles.boxValue, color: '#00D4FF'}}>${totalLevelIncome.toFixed(2)}</span>
          </div>

          {/* Box 4: Today's Earnings (All income received today) */}
          <div style={{...styles.incomeBox, background: colors.cardBg, borderColor: 'rgba(255, 107, 107, 0.5)'}}>
            <div style={{...styles.boxIcon, background: 'rgba(255, 107, 107, 0.2)'}}>
              <DollarSign size={20} color="#FF6B6B" />
            </div>
            <span style={{...styles.boxLabel, color: colors.textSecondary}}>Today ROI</span>
            <span style={{...styles.boxValue, color: '#FF6B6B'}}>${todayTotal.toFixed(2)}</span>
          </div>

          {/* Box 5: Salary Income */}
          <div style={{...styles.incomeBox, background: colors.cardBg, borderColor: 'rgba(155, 89, 182, 0.5)'}}>
            <div style={{...styles.boxIcon, background: 'rgba(155, 89, 182, 0.2)'}}>
              <WalletIcon size={20} color="#9B59B6" />
            </div>
            <span style={{...styles.boxLabel, color: colors.textSecondary}}>Salary Income</span>
            <span style={{...styles.boxValue, color: '#9B59B6'}}>${totalSalary.toFixed(2)}</span>
          </div>

          {/* Box 6: Compounding */}
          <div style={{...styles.incomeBox, background: colors.cardBg, borderColor: 'rgba(52, 152, 219, 0.5)'}}>
            <div style={{...styles.boxIcon, background: 'rgba(52, 152, 219, 0.2)'}}>
              <RefreshCw size={20} color="#3498DB" />
            </div>
            <span style={{...styles.boxLabel, color: colors.textSecondary}}>Compounding</span>
            <span style={{...styles.boxValue, color: '#3498DB'}}>${totalCompounding.toFixed(2)}</span>
          </div>
        </div>

        {/* Salary Rank Card - NEW MECHANISM */}
        {salaryRankInfo && (
          <div style={{
            ...styles.salaryRankCard,
            background: colors.cardBg,
            border: `2px solid ${colors.accent}`,
          }}>
            <div style={styles.salaryRankHeader}>
              <h3 style={{...styles.salaryRankTitle, color: colors.text}}>🏆 Salary Rank</h3>
              {salaryRankInfo.current_rank > 0 && salaryRankInfo.daily_salary > 0 && (
                <span style={styles.dailySalaryBadge}>
                  ${salaryRankInfo.daily_salary}/day
                </span>
              )}
            </div>
            
            {/* Current Rank Display */}
            <div style={{
              ...styles.currentRankBox,
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            }}>
              <div style={styles.starsRow}>
                {salaryRankInfo.current_rank > 0 ? (
                  Array(salaryRankInfo.current_rank_info?.stars || 0).fill('⭐').map((star, i) => (
                    <span key={i} style={styles.star}>{star}</span>
                  ))
                ) : (
                  <span style={{...styles.noRankText, color: colors.textSecondary}}>No Rank Yet</span>
                )}
              </div>
              {salaryRankInfo.current_rank > 0 && (
                <span style={{...styles.rankName, color: colors.text}}>{salaryRankInfo.current_rank_info?.name}</span>
              )}
            </div>

            {/* Next Rank Info */}
            {salaryRankInfo.next_rank_info && (
              <div style={{
                ...styles.nextRankBox,
                background: isDark ? 'rgba(255,215,0,0.1)' : 'rgba(230,81,0,0.08)',
              }}>
                <span style={{...styles.nextRankLabel, color: colors.textSecondary}}>Next Rank: </span>
                <span style={styles.nextRankStars}>
                  {Array(salaryRankInfo.next_rank_info.stars).fill('⭐').join('')}
                </span>
                <span style={{...styles.nextRankName, color: colors.text}}> {salaryRankInfo.next_rank_info.name}</span>
                <span style={{...styles.nextRankSalary, color: isDark ? '#FFD700' : '#E65100'}}> - Reward ${salaryRankInfo.next_rank_info.reward}</span>
                {salaryRankInfo.next_rank_info.daily_salary > 0 && (
                  <span style={{...styles.nextRankSalary, color: '#00C853'}}> + ${salaryRankInfo.next_rank_info.daily_salary}/day</span>
                )}
              </div>
            )}

            {/* All Ranks List - Accordion Style with Progress Bars */}
            <div style={styles.allRanksSection}>
              <h4 style={{...styles.allRanksTitle, color: colors.text}}>All Salary Ranks</h4>
              <div style={styles.ranksList}>
                {Object.entries(salaryRankInfo.all_ranks || {}).map(([rankId, rank]) => {
                  const isExpanded = expandedRank === parseInt(rankId);
                  const isAchieved = parseInt(rankId) <= salaryRankInfo.current_rank;
                  
                  // Calculate progress percentages
                  const selfProgress = Math.min((salaryRankInfo.self_investment / rank.self_investment) * 100, 100);
                  const powerProgress = Math.min((salaryRankInfo.power_leg / rank.power_leg) * 100, 100);
                  const weakerProgress = Math.min((salaryRankInfo.weaker_leg / rank.weaker_leg) * 100, 100);
                  
                  return (
                    <div key={rankId} style={{marginBottom: '8px'}}>
                      {/* Rank Header - Clickable */}
                      <div 
                        onClick={() => setExpandedRank(isExpanded ? null : parseInt(rankId))}
                        style={{
                          ...styles.rankItem,
                          background: isAchieved 
                            ? (isDark ? 'rgba(0,200,83,0.15)' : 'rgba(0,200,83,0.1)')
                            : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                          borderColor: isAchieved ? '#00C853' : colors.cardBorder,
                          cursor: 'pointer',
                          borderRadius: isExpanded ? '12px 12px 0 0' : '12px',
                        }}
                      >
                        <div style={styles.rankItemLeft}>
                          <span style={styles.rankItemStars}>
                            {Array(rank.stars).fill('⭐').join('')}
                          </span>
                          <span style={{...styles.rankItemName, color: isAchieved ? '#00C853' : colors.text}}>{rank.name}</span>
                          {isAchieved && <span style={{color: '#00C853', fontSize: '12px', marginLeft: '8px'}}>✓</span>}
                        </div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0}}>
                          <div style={{textAlign: 'right', minWidth: '80px'}}>
                            <div style={{color: '#00E5FF', fontSize: '12px', fontWeight: 700}}>Reward ${rank.reward}</div>
                            {rank.daily_salary > 0 && (
                              <div style={{color: '#00FF88', fontSize: '11px', fontWeight: 600}}>+${rank.daily_salary}/day</div>
                            )}
                          </div>
                          {isExpanded ? <ChevronUp size={18} color={colors.textSecondary} /> : <ChevronDown size={18} color={colors.textSecondary} />}
                        </div>
                      </div>
                      
                      {/* Expanded Content */}
                      {isExpanded && (
                        <div style={{
                          background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                          border: `1px solid ${colors.cardBorder}`,
                          borderTop: 'none',
                          borderRadius: '0 0 12px 12px',
                          padding: '12px',
                        }}>
                          {/* Self Deposit - Full Width Card */}
                          <div style={{
                            background: isDark ? 'rgba(147,112,219,0.15)' : 'rgba(147,112,219,0.1)',
                            border: '2px solid #9370DB',
                            borderRadius: '10px',
                            padding: '12px',
                            marginBottom: '10px',
                          }}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                              <span style={{color: '#9370DB', fontWeight: 600, fontSize: '14px'}}>💰 Self Deposit</span>
                              <span style={{color: colors.text, fontWeight: 700}}>
                                ${salaryRankInfo.self_investment?.toFixed(0)} / ${rank.self_investment}
                              </span>
                            </div>
                            {/* Progress Bar */}
                            <div style={{
                              background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)',
                              borderRadius: '10px',
                              height: '10px',
                              overflow: 'hidden',
                            }}>
                              <div style={{
                                width: `${selfProgress}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #9370DB, #BA55D3)',
                                borderRadius: '10px',
                                transition: 'width 0.5s ease',
                              }} />
                            </div>
                            <div style={{textAlign: 'right', marginTop: '4px'}}>
                              <span style={{color: colors.textSecondary, fontSize: '11px'}}>{selfProgress.toFixed(0)}%</span>
                            </div>
                          </div>
                          
                          {/* Two Column Layout for Legs */}
                          <div style={{display: 'flex', gap: '10px'}}>
                            {/* Power Leg (Strong Leg) */}
                            <div style={{
                              flex: 1,
                              background: isDark ? 'rgba(0,200,83,0.15)' : 'rgba(0,200,83,0.1)',
                              border: '2px solid #00C853',
                              borderRadius: '10px',
                              padding: '10px',
                            }}>
                              <div style={{textAlign: 'center', marginBottom: '6px'}}>
                                <span style={{color: '#00C853', fontWeight: 600, fontSize: '12px'}}>💪 Strong Leg</span>
                              </div>
                              <div style={{textAlign: 'center', marginBottom: '8px'}}>
                                <span style={{color: colors.text, fontWeight: 700, fontSize: '14px'}}>
                                  ${salaryRankInfo.power_leg?.toFixed(0)}
                                </span>
                                <span style={{color: colors.textSecondary, fontSize: '11px'}}> / ${rank.power_leg?.toLocaleString()}</span>
                              </div>
                              {/* Progress Bar */}
                              <div style={{
                                background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)',
                                borderRadius: '8px',
                                height: '8px',
                                overflow: 'hidden',
                              }}>
                                <div style={{
                                  width: `${powerProgress}%`,
                                  height: '100%',
                                  background: 'linear-gradient(90deg, #00C853, #00E676)',
                                  borderRadius: '8px',
                                  transition: 'width 0.5s ease',
                                }} />
                              </div>
                              <div style={{textAlign: 'center', marginTop: '4px'}}>
                                <span style={{color: colors.textSecondary, fontSize: '10px'}}>{powerProgress.toFixed(0)}%</span>
                              </div>
                            </div>
                            
                            {/* Weaker Leg */}
                            <div style={{
                              flex: 1,
                              background: isDark ? 'rgba(255,152,0,0.15)' : 'rgba(255,152,0,0.1)',
                              border: '2px solid #FF9800',
                              borderRadius: '10px',
                              padding: '10px',
                            }}>
                              <div style={{textAlign: 'center', marginBottom: '6px'}}>
                                <span style={{color: '#FF9800', fontWeight: 600, fontSize: '12px'}}>🦿 Weaker Leg</span>
                              </div>
                              <div style={{textAlign: 'center', marginBottom: '8px'}}>
                                <span style={{color: colors.text, fontWeight: 700, fontSize: '14px'}}>
                                  ${salaryRankInfo.weaker_leg?.toFixed(0)}
                                </span>
                                <span style={{color: colors.textSecondary, fontSize: '11px'}}> / ${rank.weaker_leg?.toLocaleString()}</span>
                              </div>
                              {/* Progress Bar */}
                              <div style={{
                                background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)',
                                borderRadius: '8px',
                                height: '8px',
                                overflow: 'hidden',
                              }}>
                                <div style={{
                                  width: `${weakerProgress}%`,
                                  height: '100%',
                                  background: 'linear-gradient(90deg, #FF9800, #FFB74D)',
                                  borderRadius: '8px',
                                  transition: 'width 0.5s ease',
                                }} />
                              </div>
                              <div style={{textAlign: 'center', marginTop: '4px'}}>
                                <span style={{color: colors.textSecondary, fontSize: '10px'}}>{weakerProgress.toFixed(0)}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{
          ...styles.tabsContainer,
          background: isDark ? colors.cardBg : '#FFFFFF',
          border: isDark ? `1px solid ${colors.cardBorder}` : '2px solid #00C853',
        }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                style={{
                  ...styles.tab,
                  background: isActive 
                    ? (isDark ? `${colors.accent}20` : 'rgba(0, 200, 83, 0.15)') 
                    : (isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)'),
                  color: isActive 
                    ? colors.accent 
                    : (isDark ? 'rgba(255, 255, 255, 0.6)' : '#666'),
                  border: isActive 
                    ? `2px solid ${colors.accent}` 
                    : (isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #ddd'),
                }}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} />
                <span style={styles.tabLabel}>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Transaction List */}
        <div style={{
          ...styles.transactionSection,
          background: colors.cardBg,
          border: `2px solid ${colors.accent}`,
        }}>
          <h2 style={{...styles.sectionTitle, color: colors.text}}>
            {activeTab === 'all' ? 'All Income' : tabs.find(t => t.id === activeTab)?.label}
          </h2>
          
          {loading ? (
            <div style={{...styles.loadingBox, color: colors.textSecondary}}>
              <RefreshCw size={24} className="spin" color={colors.accent} />
              <span>Loading...</span>
            </div>
          ) : getFilteredTransactions().length > 0 ? (
            <div style={styles.transactionList}>
              {getFilteredTransactions().map((tx, index) => (
                <div key={tx.id || index} style={{
                  ...styles.transactionItem,
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${colors.cardBorder}`,
                }}>
                  <div style={styles.txLeft}>
                    <div style={{
                      ...styles.txIcon,
                      background: `${getTransactionColor(tx.type)}20`,
                    }}>
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div style={styles.txInfo}>
                      <span style={{
                        ...styles.txType,
                        color: getTransactionColor(tx.type),
                      }}>
                        {getTransactionLabel(tx)}
                      </span>
                      <span style={{...styles.txDate, color: colors.textSecondary}}>
                        <Clock size={12} /> {formatDate(tx.created_at)}
                      </span>
                    </div>
                  </div>
                  <div style={styles.txRight}>
                    <span style={{
                      ...styles.txAmount,
                      color: getTransactionColor(tx.type),
                    }}>
                      +${tx.amount?.toFixed(2) || '0.00'}
                    </span>
                    <span style={{...styles.txStatus, color: colors.textSecondary}}>
                      {tx.type.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{...styles.emptyBox, color: colors.textSecondary}}>
              <TrendingUp size={40} color={colors.textSecondary} />
              <span>No {activeTab === 'all' ? 'income' : tabs.find(t => t.id === activeTab)?.label.toLowerCase()} yet</span>
            </div>
          )}
        </div>
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
  authMessage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '60px 20px',
    textAlign: 'center',
    color: '#fff',
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
  sixBoxGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
    marginBottom: '16px',
  },
  fourBoxGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    marginBottom: '16px',
  },
  incomeBox: {
    background: 'linear-gradient(180deg, #0a0a0a 0%, #121212 100%)',
    border: '1px solid',
    borderRadius: '12px',
    padding: '12px 8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    textAlign: 'center',
  },
  boxIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxLabel: {
    fontSize: '9px',
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: 500,
    textAlign: 'center',
  },
  boxValue: {
    fontSize: '14px',
    fontWeight: 700,
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    marginBottom: '16px',
  },
  summaryCard: {
    background: 'linear-gradient(180deg, #0a0a0a 0%, #121212 100%)',
    border: '1px solid rgba(38, 161, 123, 0.3)',
    borderRadius: '12px',
    padding: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  summaryIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  summaryLabel: {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: '0.5px',
  },
  summaryValue: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#0ECB81',
  },
  tabsContainer: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
    overflowX: 'auto',
    paddingBottom: '8px',
    padding: '12px',
    borderRadius: '12px',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  },
  tab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '12px 14px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '11px',
    cursor: 'pointer',
    minWidth: '70px',
    flexShrink: 0,
    boxSizing: 'border-box',
  },
  tabActive: {
    background: 'rgba(14, 203, 129, 0.15)',
    border: '1px solid rgba(14, 203, 129, 0.5)',
    color: '#0ECB81',
  },
  tabLabel: {
    fontSize: '11px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    textAlign: 'center',
  },
  transactionSection: {
    background: 'linear-gradient(180deg, #0a0a0a 0%, #121212 100%)',
    border: '1px solid rgba(0, 255, 209, 0.2)',
    borderRadius: '16px',
    padding: '16px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#FFFFFF',
    marginBottom: '14px',
    paddingBottom: '10px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '40px',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  transactionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  transactionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  txLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1,
    minWidth: 0,
  },
  txIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  txInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
  },
  txType: {
    fontSize: '13px',
    fontWeight: 600,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  txDate: {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.5)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  txRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '2px',
    flexShrink: 0,
    marginLeft: '8px',
  },
  txAmount: {
    fontSize: '15px',
    fontWeight: 700,
  },
  txStatus: {
    fontSize: '9px',
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  emptyBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '40px 20px',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '14px',
  },
  // Salary Rank Card Styles
  salaryRankCard: {
    background: 'linear-gradient(180deg, #1a0a2e 0%, #0d0d0d 100%)',
    border: '2px solid rgba(155, 89, 182, 0.4)',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '16px',
  },
  salaryRankHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  salaryRankTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#FFFFFF',
    margin: 0,
  },
  dailySalaryBadge: {
    background: 'rgba(14, 203, 129, 0.2)',
    color: '#0ECB81',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 700,
  },
  currentRankBox: {
    background: 'rgba(155, 89, 182, 0.15)',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
    marginBottom: '12px',
  },
  starsRow: {
    fontSize: '24px',
    marginBottom: '6px',
  },
  star: {
    margin: '0 2px',
  },
  noRankText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '14px',
  },
  rankName: {
    color: '#9B59B6',
    fontSize: '18px',
    fontWeight: 700,
  },
  progressStatsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginBottom: '12px',
  },
  progressStat: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
    padding: '10px',
    textAlign: 'center',
  },
  progressLabel: {
    display: 'block',
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: '4px',
  },
  progressValue: {
    display: 'block',
    fontSize: '18px',
    fontWeight: 700,
    color: '#FFFFFF',
  },
  progressTarget: {
    display: 'block',
    fontSize: '9px',
    color: 'rgba(255, 215, 0, 0.8)',
    marginTop: '2px',
  },
  progressSubtext: {
    display: 'block',
    fontSize: '9px',
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: '2px',
  },
  nextRankBox: {
    background: 'rgba(255, 215, 0, 0.1)',
    borderRadius: '8px',
    padding: '10px',
    textAlign: 'center',
    marginBottom: '12px',
    fontSize: '12px',
  },
  nextRankLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  nextRankStars: {
    color: '#FFD700',
  },
  nextRankName: {
    color: '#FFD700',
    fontWeight: 600,
  },
  nextRankSalary: {
    color: '#0ECB81',
    fontWeight: 700,
  },
  allRanksSection: {
    marginTop: '12px',
  },
  allRanksTitle: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '8px',
    fontWeight: 600,
  },
  ranksList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  rankItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
    padding: '8px 10px',
    border: '1px solid transparent',
  },
  rankItemActive: {
    background: 'rgba(155, 89, 182, 0.2)',
    border: '1px solid rgba(155, 89, 182, 0.5)',
  },
  rankItemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  rankItemStars: {
    fontSize: '12px',
  },
  rankItemName: {
    fontSize: '12px',
    color: '#FFFFFF',
    fontWeight: 600,
  },
  rankItemRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '2px',
  },
  rankItemReq: {
    fontSize: '9px',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  rankItemSalary: {
    fontSize: '11px',
    color: '#0ECB81',
    fontWeight: 700,
  },
};

// Add CSS keyframes for spin animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
if (!document.getElementById('income-history-styles')) {
  styleSheet.id = 'income-history-styles';
  document.head.appendChild(styleSheet);
}

export default IncomeHistory;
