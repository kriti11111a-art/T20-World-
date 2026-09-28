import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Clock, DollarSign, RefreshCw, Wallet, ArrowDownCircle, RotateCcw } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import tokenManager from '../utils/tokenManager';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const MyInvestments = () => {
  const { user, token, refreshUser } = useAuth();
  const { isDark, colors } = useTheme();
  
  const [investments, setInvestments] = useState(() => {
    const cached = localStorage.getItem('cachedInvestments');
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [successModal, setSuccessModal] = useState({ show: false, type: '', amount: 0 });
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'completed'

  const fetchInvestments = useCallback(async (showLoader = true, showToast = false) => {
    const authToken = tokenManager.get();
    if (!authToken) return;
    
    if (showLoader && investments.length === 0) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    
    if (showToast) {
      toast.loading('Refreshing...', { id: 'refresh-toast' });
    }
    
    try {
      const res = await fetch(`${API_URL}/api/investments`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        const sorted = data.sort((a, b) => {
          if (a.status === 'active' && b.status !== 'active') return -1;
          if (a.status !== 'active' && b.status === 'active') return 1;
          return new Date(b.created_at) - new Date(a.created_at);
        });
        setInvestments(sorted);
        localStorage.setItem('cachedInvestments', JSON.stringify(sorted));
        if (showToast) {
          toast.success('Refreshed!', { id: 'refresh-toast' });
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching investments:', error);
        if (showToast) {
          toast.error('Failed to refresh', { id: 'refresh-toast' });
        }
      }
    }
    setLoading(false);
    setRefreshing(false);
  }, [token, investments.length]);

  // Fetch immediately on mount
  useEffect(() => {
    fetchInvestments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate totals
  const activeInvestments = investments.filter(inv => inv.status === 'active' && inv.days_completed < inv.total_days);
  const completedInvestments = investments.filter(inv => inv.status === 'completed' || inv.days_completed >= inv.total_days);
  const totalPendingROI = investments.reduce((sum, inv) => sum + (inv.pending_roi || 0), 0);
  
  // Get investments based on active tab
  const displayedInvestments = activeTab === 'active' ? activeInvestments : completedInvestments;

  // Withdraw ALL pending ROI to balance
  const handleWithdrawAll = async () => {
    if (totalPendingROI <= 0) {
      toast.error('No ROI available to withdraw');
      return;
    }
    
    const authToken = tokenManager.get();
    if (!authToken) {
      toast.error('Session expired. Please login again.');
      return;
    }
    
    setProcessing(true);
    const withdrawAmount = totalPendingROI;
    const loadingToast = toast.loading('Withdrawing all ROI...');
    
    try {
      // Withdraw from all investments with pending ROI in PARALLEL
      const investmentsWithROI = investments.filter(inv => (inv.pending_roi || 0) > 0);
      
      const withdrawPromises = investmentsWithROI.map(inv => 
        fetch(`${API_URL}/api/investments/${inv.id}/withdraw-roi`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        })
      );
      
      const results = await Promise.allSettled(withdrawPromises);
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value.ok).length;
      
      toast.dismiss(loadingToast);
      
      if (successCount > 0) {
        // Update local state FIRST
        setInvestments(prev => prev.map(inv => ({ ...inv, pending_roi: 0 })));
        
        // Show success modal
        setSuccessModal({ show: true, type: 'withdraw', amount: withdrawAmount });
        
        // Refresh user data
        setTimeout(() => {
          refreshUser();
          fetchInvestments(false, false);
        }, 2000);
      } else {
        toast.error('Withdrawal failed. Please try again.');
      }
      
    } catch (error) {
      console.error('Withdraw error:', error);
      toast.dismiss(loadingToast);
      toast.error('Network error. Please try again.');
    }
    setProcessing(false);
  };

  // Re-compound ALL pending ROI into new investment
  const handleRecompoundAll = async () => {
    if (totalPendingROI < 1) {
      toast.error('Minimum $1 required for compounding');
      return;
    }
    
    const authToken = tokenManager.get();
    if (!authToken) {
      toast.error('Session expired. Please login again.');
      return;
    }
    
    setProcessing(true);
    const compoundAmount = totalPendingROI;
    const loadingToast = toast.loading('Compounding all ROI...');
    
    try {
      // Compound from all investments with pending ROI in PARALLEL
      const investmentsWithROI = investments.filter(inv => (inv.pending_roi || 0) >= 1);
      
      const compoundPromises = investmentsWithROI.map(inv => 
        fetch(`${API_URL}/api/investments/${inv.id}/compound`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        })
      );
      
      const results = await Promise.allSettled(compoundPromises);
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value.ok).length;
      
      toast.dismiss(loadingToast);
      
      if (successCount > 0) {
        // Update local state FIRST
        setInvestments(prev => prev.map(inv => ({ ...inv, pending_roi: 0 })));
        
        // Show success modal
        setSuccessModal({ show: true, type: 'compound', amount: compoundAmount });
        
        // CRITICAL: Refresh user data and investments to update UI
        setTimeout(() => {
          refreshUser();
          fetchInvestments(false, false);
        }, 2000);
      } else {
        toast.error('Compounding failed. Please try again.');
      }
      
    } catch (error) {
      console.error('Compound error:', error);
      toast.dismiss(loadingToast);
      toast.error('Network error. Please try again.');
    }
    setProcessing(false);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div style={{...styles.page, background: colors.background}}>
      <Header />
      
      <div style={styles.container}>
        {/* Page Title */}
        <div style={styles.titleRow}>
          <h1 style={{...styles.title, color: colors.text}}>
            <DollarSign size={24} color={colors.accent} />
            My Investments
          </h1>
          <button 
            style={{
              ...styles.refreshBtn,
              background: `${colors.accent}15`,
              border: `1px solid ${colors.accent}`,
              color: colors.accent,
              opacity: refreshing ? 0.7 : 1,
            }}
            onClick={() => {
              fetchInvestments(false, true);
            }}
            disabled={refreshing}
          >
            <RefreshCw size={18} className={refreshing ? 'spin' : ''} style={{
              transition: 'transform 0.3s ease'
            }} />
          </button>
        </div>

        {/* ========== AVAILABLE BALANCE BOX ========== */}
        <div style={{
          ...styles.balanceBox,
          background: isDark 
            ? 'linear-gradient(135deg, rgba(0, 208, 156, 0.15) 0%, rgba(0, 229, 160, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(0, 200, 83, 0.15) 0%, rgba(0, 230, 118, 0.1) 100%)',
          border: `2px solid ${colors.accent}`,
        }}>
          <div style={styles.balanceHeader}>
            <Wallet size={24} color={colors.accent} />
            <span style={{...styles.balanceTitle, color: colors.text}}>Available Rewards</span>
          </div>
          
          <div style={styles.balanceAmount}>
            <span style={{...styles.balanceValue, color: colors.accent}}>
              ${totalPendingROI.toFixed(2)}
            </span>
            <span style={{...styles.balanceLabel, color: colors.textSecondary}}>
              Accumulated from all slabs
            </span>
          </div>
          
          <div style={styles.balanceActions}>
            <button 
              style={{
                ...styles.actionBtn,
                background: 'linear-gradient(135deg, #00D09C 0%, #00E5A0 100%)',
                color: '#000',
                opacity: processing || totalPendingROI <= 0 ? 0.5 : 1,
              }}
              onClick={handleWithdrawAll}
              disabled={processing || totalPendingROI <= 0}
            >
              <ArrowDownCircle size={18} />
              Withdraw
            </button>
            <button 
              style={{
                ...styles.actionBtn,
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                color: '#000',
                opacity: processing || totalPendingROI < 1 ? 0.5 : 1,
              }}
              onClick={handleRecompoundAll}
              disabled={processing || totalPendingROI < 1}
            >
              <RotateCcw size={18} />
              Re-Compound
            </button>
          </div>
        </div>

        {/* ========== TABS - ACTIVE / COMPLETED ========== */}
        <div style={{
          display: 'flex',
          gap: '0px',
          marginBottom: '20px',
          background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          borderRadius: '12px',
          padding: '4px',
        }}>
          <button
            onClick={() => setActiveTab('active')}
            style={{
              flex: 1,
              padding: '14px 20px',
              border: 'none',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              background: activeTab === 'active' 
                ? 'linear-gradient(135deg, #00D09C 0%, #00E5A0 100%)' 
                : 'transparent',
              color: activeTab === 'active' ? '#000' : colors.textSecondary,
              boxShadow: activeTab === 'active' ? '0 4px 15px rgba(0, 208, 156, 0.4)' : 'none',
            }}
          >
            <Clock size={18} />
            Active ({activeInvestments.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            style={{
              flex: 1,
              padding: '14px 20px',
              border: 'none',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              background: activeTab === 'completed' 
                ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' 
                : 'transparent',
              color: activeTab === 'completed' ? '#000' : colors.textSecondary,
              boxShadow: activeTab === 'completed' ? '0 4px 15px rgba(255, 215, 0, 0.4)' : 'none',
            }}
          >
            <CheckCircle size={18} />
            Complete ({completedInvestments.length})
          </button>
        </div>

        {/* ========== INVESTMENT CARDS ========== */}

        {loading ? (
          <div style={styles.loadingContainer}>
            <RefreshCw size={32} color={colors.accent} className="spin" />
            <span style={{color: colors.textSecondary}}>Loading investments...</span>
          </div>
        ) : displayedInvestments.length === 0 ? (
          <div style={{
            ...styles.emptyState,
            background: isDark ? colors.cardBg : '#FFFFFF',
            border: `2px solid ${activeTab === 'active' ? colors.accent : '#FFD700'}`,
          }}>
            {activeTab === 'active' ? (
              <>
                <Clock size={48} color={colors.accent} />
                <h3 style={{color: colors.text}}>No Active Investments</h3>
                <p style={{color: colors.textSecondary}}>Start investing to see your active slabs here</p>
              </>
            ) : (
              <>
                <CheckCircle size={48} color="#FFD700" />
                <h3 style={{color: colors.text}}>No Completed Investments</h3>
                <p style={{color: colors.textSecondary}}>Your completed investments will appear here</p>
              </>
            )}
          </div>
        ) : (
          <div style={styles.investmentsList}>
            {displayedInvestments.map((inv) => {
              const dailyEarning = inv.amount * inv.daily_roi / 100;
              const progressPercent = Math.min((inv.days_completed / inv.total_days) * 100, 100);
              const isCompleted = inv.status === 'completed' || inv.days_completed >= inv.total_days;
              
              // Premium ATM Card gradients - works in both modes
              const cardGradients = {
                1: 'linear-gradient(135deg, #1a237e 0%, #283593 30%, #3949ab 60%, #1a237e 100%)',
                2: 'linear-gradient(135deg, #1b1b1b 0%, #2d2d2d 30%, #3d3d3d 60%, #1b1b1b 100%)',
                3: 'linear-gradient(135deg, #4a148c 0%, #6a1b9a 30%, #7b1fa2 60%, #4a148c 100%)',
                4: 'linear-gradient(135deg, #b8860b 0%, #daa520 30%, #ffd700 60%, #b8860b 100%)',
              };
              const cardGradient = cardGradients[inv.plan_id] || cardGradients[2];
              
              return (
                <div
                  key={inv.id}
                  style={{
                    background: cardGradient,
                    borderRadius: '24px',
                    padding: '0',
                    marginBottom: '24px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: isCompleted 
                      ? '0 20px 60px rgba(0,0,0,0.4), 0 10px 30px rgba(0,0,0,0.3)'
                      : '0 25px 80px rgba(0, 208, 156, 0.35), 0 15px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                    border: 'none',
                  }}
                >
                  {/* Premium metallic shine overlay */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
                      linear-gradient(125deg, 
                        transparent 0%, 
                        rgba(255,255,255,0.05) 25%, 
                        rgba(255,255,255,0.15) 40%,
                        rgba(255,255,255,0.05) 55%,
                        transparent 100%
                      )
                    `,
                    pointerEvents: 'none',
                  }} />
                  
                  {/* Holographic rainbow effect */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    right: 0,
                    bottom: 0,
                    width: '200%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                    animation: 'shimmer 3s infinite',
                    pointerEvents: 'none',
                  }} />
                  
                  {/* Card content wrapper */}
                  <div style={{
                    padding: '24px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '320px',
                  }}>
                    {/* Top row: Chip + Status */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px',
                    }}>
                      {/* EMV Chip - Fully visible realistic design */}
                      <div style={{
                        width: '55px',
                        height: '42px',
                        background: 'linear-gradient(145deg, #f4e4a6 0%, #d4af37 30%, #f4d03f 50%, #c9a227 70%, #f4e4a6 100%)',
                        borderRadius: '8px',
                        display: 'grid',
                        gridTemplateColumns: '1fr 2px 1fr',
                        gridTemplateRows: '1fr 2px 1fr 2px 1fr',
                        gap: '0px',
                        padding: '5px 8px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.2)',
                        border: '1px solid rgba(180, 140, 60, 0.5)',
                      }}>
                        {/* Chip grid pattern */}
                        <div style={{background: 'linear-gradient(135deg, #b8860b 0%, #daa520 100%)', borderRadius: '2px'}} />
                        <div style={{background: 'rgba(139, 115, 85, 0.6)'}} />
                        <div style={{background: 'linear-gradient(135deg, #daa520 0%, #b8860b 100%)', borderRadius: '2px'}} />
                        <div style={{background: 'rgba(139, 115, 85, 0.6)', gridColumn: 'span 3'}} />
                        <div style={{background: 'linear-gradient(135deg, #c9a227 0%, #f4d03f 100%)', borderRadius: '2px'}} />
                        <div style={{background: 'rgba(139, 115, 85, 0.6)'}} />
                        <div style={{background: 'linear-gradient(135deg, #f4d03f 0%, #c9a227 100%)', borderRadius: '2px'}} />
                        <div style={{background: 'rgba(139, 115, 85, 0.6)', gridColumn: 'span 3'}} />
                        <div style={{background: 'linear-gradient(135deg, #daa520 0%, #b8860b 100%)', borderRadius: '2px'}} />
                        <div style={{background: 'rgba(139, 115, 85, 0.6)'}} />
                        <div style={{background: 'linear-gradient(135deg, #b8860b 0%, #daa520 100%)', borderRadius: '2px'}} />
                      </div>
                      
                      {/* Status Badge */}
                      <div style={{
                        background: isCompleted 
                          ? 'linear-gradient(135deg, #ff4757 0%, #ff3f34 100%)'
                          : 'linear-gradient(135deg, #00D09C 0%, #00E5A0 100%)',
                        color: '#fff',
                        padding: '8px 16px',
                        borderRadius: '25px',
                        fontSize: '11px',
                        fontWeight: 800,
                        letterSpacing: '1px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: isCompleted
                          ? '0 4px 20px rgba(255, 71, 87, 0.5)'
                          : '0 4px 20px rgba(0, 208, 156, 0.5)',
                        textTransform: 'uppercase',
                      }}>
                        {isCompleted ? '✓ COMPLETE' : (
                          <>
                            <span style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: '#fff',
                              boxShadow: '0 0 10px #fff',
                            }} />
                            ACTIVE
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Middle: Plan name + Amount (card number style) */}
                    <div style={{marginTop: '8px'}}>
                      <div style={{
                        fontSize: '10px',
                        color: 'rgba(255,255,255,0.6)',
                        letterSpacing: '3px',
                        textTransform: 'uppercase',
                        marginBottom: '4px',
                        fontWeight: 500,
                      }}>
                        {inv.plan_name}
                      </div>
                      <div style={{
                        fontSize: '28px',
                        fontWeight: 800,
                        color: '#00E5A0',
                        letterSpacing: '4px',
                        fontFamily: "'Courier New', 'Monaco', monospace",
                        textShadow: '0 0 30px rgba(0, 229, 160, 0.6), 0 2px 10px rgba(0,0,0,0.3)',
                      }}>
                        ${inv.amount.toFixed(2)}
                      </div>
                    </div>
                    
                    {/* Progress Section */}
                    <div style={{
                      background: 'rgba(0,0,0,0.25)',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      backdropFilter: 'blur(10px)',
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '6px',
                      }}>
                        <span style={{
                          color: 'rgba(255,255,255,0.8)',
                          fontSize: '10px',
                          fontWeight: 700,
                          letterSpacing: '1px',
                        }}>
                          PROGRESS
                        </span>
                        <span style={{
                          color: isCompleted ? '#FFD700' : '#FF69B4',
                          fontSize: '14px',
                          fontWeight: 800,
                        }}>
                          {progressPercent.toFixed(0)}%
                        </span>
                      </div>
                      <div style={{
                        height: '6px',
                        background: 'rgba(255,255,255,0.15)',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${progressPercent}%`,
                          height: '100%',
                          background: isCompleted 
                            ? 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)'
                            : 'linear-gradient(90deg, #FF69B4 0%, #FF1493 50%, #FF69B4 100%)',
                          borderRadius: '3px',
                          transition: 'width 0.5s ease',
                          boxShadow: '0 0 15px rgba(255, 105, 180, 0.6)',
                        }} />
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '4px',
                      }}>
                        <span style={{color: 'rgba(255,255,255,0.5)', fontSize: '9px', fontWeight: 600}}>
                          Day {inv.days_completed}/{inv.total_days}
                        </span>
                        <span style={{color: isCompleted ? '#FFD700' : '#FF69B4', fontSize: '9px', fontWeight: 700}}>
                          {isCompleted ? '✓ Done' : `${inv.total_days - inv.days_completed} days left`}
                        </span>
                      </div>
                    </div>
                    
                    {/* Bottom stats row */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '8px',
                      marginTop: '8px',
                    }}>
                      {/* Daily ROI */}
                      <div style={{
                        flex: 1,
                        background: 'rgba(0, 208, 156, 0.2)',
                        borderRadius: '10px',
                        padding: '8px 6px',
                        textAlign: 'center',
                        border: '1px solid rgba(0, 208, 156, 0.4)',
                      }}>
                        <div style={{fontSize: '8px', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.5px'}}>DAILY ROI</div>
                        <div style={{fontSize: '16px', fontWeight: 800, color: '#00E5A0'}}>{inv.daily_roi}%</div>
                        <div style={{fontSize: '8px', color: 'rgba(255,255,255,0.5)'}}>${dailyEarning.toFixed(2)}/day</div>
                      </div>
                      
                      {/* Earned */}
                      <div style={{
                        flex: 1,
                        background: 'rgba(255, 215, 0, 0.2)',
                        borderRadius: '10px',
                        padding: '8px 6px',
                        textAlign: 'center',
                        border: '1px solid rgba(255, 215, 0, 0.4)',
                      }}>
                        <div style={{fontSize: '8px', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.5px'}}>EARNED</div>
                        <div style={{fontSize: '16px', fontWeight: 800, color: '#FFD700'}}>${(inv.earned_so_far || 0).toFixed(2)}</div>
                        <div style={{fontSize: '8px', color: 'rgba(255,255,255,0.5)'}}>Total</div>
                      </div>
                      
                      {/* Pending */}
                      <div style={{
                        flex: 1,
                        background: 'rgba(255, 105, 180, 0.2)',
                        borderRadius: '10px',
                        padding: '8px 6px',
                        textAlign: 'center',
                        border: '1px solid rgba(255, 105, 180, 0.4)',
                      }}>
                        <div style={{fontSize: '8px', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.5px'}}>PENDING</div>
                        <div style={{fontSize: '16px', fontWeight: 800, color: '#FF69B4'}}>${(inv.pending_roi || 0).toFixed(2)}</div>
                        <div style={{fontSize: '8px', color: 'rgba(255,255,255,0.5)'}}>Claim</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* COMPLETE watermark for completed cards */}
                  {isCompleted && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%) rotate(-20deg)',
                      fontSize: '36px',
                      fontWeight: 900,
                      color: 'rgba(255, 215, 0, 0.15)',
                      letterSpacing: '10px',
                      textShadow: '0 0 30px rgba(255, 215, 0, 0.2)',
                      pointerEvents: 'none',
                      whiteSpace: 'nowrap',
                    }}>
                      COMPLETE
                    </div>
                  )}
                  
                  {/* Contactless payment icon */}
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '80px',
                    opacity: 0.4,
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="rgba(255,255,255,0.5)"/>
                      <path d="M7 12c0-2.76 2.24-5 5-5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none"/>
                      <path d="M9 12c0-1.66 1.34-3 3-3" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none"/>
                      <path d="M11 12c0-.55.45-1 1-1" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none"/>
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Success Modal */}
      {successModal.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }}>
          <div style={{
            background: isDark ? '#1a1a2e' : '#ffffff',
            borderRadius: '24px',
            padding: '40px 30px',
            textAlign: 'center',
            maxWidth: '340px',
            width: '100%',
            border: `3px solid ${successModal.type === 'withdraw' ? '#0ECB81' : '#FFD700'}`,
            boxShadow: `0 0 40px ${successModal.type === 'withdraw' ? 'rgba(14, 203, 129, 0.4)' : 'rgba(255, 215, 0, 0.4)'}`,
          }}>
            {/* Success Icon */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: successModal.type === 'withdraw' 
                ? 'linear-gradient(135deg, #0ECB81 0%, #00E5A0 100%)' 
                : 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: `0 0 30px ${successModal.type === 'withdraw' ? 'rgba(14, 203, 129, 0.5)' : 'rgba(255, 215, 0, 0.5)'}`,
            }}>
              <CheckCircle size={45} color={successModal.type === 'withdraw' ? '#fff' : '#000'} strokeWidth={3} />
            </div>
            
            {/* Title */}
            <h2 style={{
              fontSize: '26px',
              fontWeight: 700,
              color: successModal.type === 'withdraw' ? '#0ECB81' : '#FFD700',
              marginBottom: '8px',
            }}>
              SUCCESS!
            </h2>
            
            {/* Amount */}
            <div style={{
              fontSize: '36px',
              fontWeight: 700,
              color: colors.text,
              marginBottom: '12px',
            }}>
              ${successModal.amount.toFixed(2)}
            </div>
            
            {/* Message */}
            <p style={{
              fontSize: '15px',
              color: colors.textSecondary,
              marginBottom: '24px',
              lineHeight: '1.5',
            }}>
              {successModal.type === 'withdraw' 
                ? 'Successfully transferred to your Wallet Balance!' 
                : 'Successfully re-compounded into a new Investment Slab!'}
            </p>
            
            {/* Close Button */}
            <button
              onClick={() => setSuccessModal({ show: false, type: '', amount: 0 })}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: successModal.type === 'withdraw' 
                  ? 'linear-gradient(135deg, #0ECB81 0%, #00E5A0 100%)' 
                  : 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                color: successModal.type === 'withdraw' ? '#fff' : '#000',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {successModal.type === 'withdraw' ? 'Go to Wallet' : 'View Investments'}
            </button>
          </div>
        </div>
      )}

      <Footer />
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.4;
            transform: scale(0.8);
          }
        }
        .pulse-dot {
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
  },
  container: {
    padding: '100px 16px 80px',
    maxWidth: '500px',
    margin: '0 auto',
  },
  
  // Complete Stamp Overlay
  completeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    zIndex: 10,
  },
  completeStamp: {
    fontSize: '42px',
    fontWeight: 900,
    color: '#DC3545',
    border: '5px solid #DC3545',
    borderRadius: '12px',
    padding: '8px 24px',
    transform: 'rotate(-15deg)',
    textTransform: 'uppercase',
    letterSpacing: '3px',
    textShadow: '0 0 10px rgba(220, 53, 69, 0.5)',
    background: 'rgba(220, 53, 69, 0.1)',
  },
  
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: 0,
  },
  refreshBtn: {
    padding: '10px',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  
  // Available Balance Box
  balanceBox: {
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
  },
  balanceHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px',
  },
  balanceTitle: {
    fontSize: '16px',
    fontWeight: 600,
  },
  balanceAmount: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  balanceValue: {
    fontSize: '42px',
    fontWeight: 700,
    display: 'block',
  },
  balanceLabel: {
    fontSize: '13px',
    display: 'block',
    marginTop: '4px',
  },
  balanceActions: {
    display: 'flex',
    gap: '12px',
  },
  actionBtn: {
    flex: 1,
    padding: '14px 12px',
    borderRadius: '12px',
    border: 'none',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
  },
  
  // Stats Grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginBottom: '24px',
  },
  statCard: {
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  statIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: '12px',
    fontWeight: 500,
  },
  statValue: {
    fontSize: '20px',
    fontWeight: 700,
  },
  
  // Section Header
  sectionHeader: {
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
  },
  
  // Investment Cards
  investmentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  investmentCard: {
    borderRadius: '16px',
    padding: '20px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  planName: {
    fontSize: '18px',
    fontWeight: 700,
    display: 'block',
    marginBottom: '4px',
  },
  planAmount: {
    fontSize: '28px',
    fontWeight: 700,
  },
  statusBadge: {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 600,
  },
  
  // Progress Section - Horizontal at TOP
  progressSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '16px',
    borderRadius: '14px',
    marginBottom: '16px',
  },
  circularProgress: {
    position: 'relative',
    width: '80px',
    height: '80px',
    flexShrink: 0,
  },
  progressCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
  },
  progressPercent: {
    fontSize: '20px',
    fontWeight: 700,
  },
  progressInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  progressTitle: {
    fontSize: '16px',
    fontWeight: 600,
  },
  progressDays: {
    fontSize: '14px',
  },
  progressRemaining: {
    fontSize: '13px',
    fontWeight: 600,
  },
  
  // Mini Cards - Full Width 2x2 Grid
  miniCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  miniCardFull: {
    borderRadius: '14px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '6px',
  },
  miniLabelFull: {
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  miniValueFull: {
    fontSize: '24px',
    fontWeight: 700,
  },
  miniSubFull: {
    fontSize: '12px',
  },
  progressContainer: {
    marginBottom: '16px',
  },
  progressBar: {
    height: '8px',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '6px',
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: '12px',
  },
  cardInfoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  infoLabel: {
    fontSize: '11px',
  },
  infoValue: {
    fontSize: '14px',
    fontWeight: 600,
  },
  
  // States
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    gap: '16px',
  },
  emptyState: {
    borderRadius: '16px',
    padding: '60px 20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
};

export default MyInvestments;
