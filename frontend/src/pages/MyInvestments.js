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
          background: 'rgba(6, 37, 68, 0.6)',
          borderRadius: '12px',
          padding: '4px',
          border: '1px solid rgba(23, 77, 117, 0.5)',
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
                ? 'linear-gradient(90deg, #087BFF 0%, #16E0FF 100%)' 
                : 'transparent',
              color: activeTab === 'active' ? '#FFFFFF' : '#B8C7DC',
              boxShadow: activeTab === 'active' ? '0 4px 15px rgba(22, 224, 255, 0.4)' : 'none',
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
                ? 'linear-gradient(90deg, #087BFF 0%, #16E0FF 100%)' 
                : 'transparent',
              color: activeTab === 'completed' ? '#FFFFFF' : '#B8C7DC',
              boxShadow: activeTab === 'completed' ? '0 4px 15px rgba(22, 224, 255, 0.4)' : 'none',
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
              
              return (
                <div
                  key={inv.id}
                  style={{
                    background: 'linear-gradient(145deg, #0a1929 0%, #0d2847 50%, #0a1929 100%)',
                    borderRadius: '20px',
                    padding: '0',
                    marginBottom: '24px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(22, 224, 255, 0.3)',
                    border: '1px solid rgba(22, 224, 255, 0.4)',
                  }}
                >
                  {/* Background Chart Pattern */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: '60%',
                    opacity: 0.15,
                    background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 100'%3E%3Cpath d='M0,80 L20,70 L40,75 L60,50 L80,55 L100,30 L120,40 L140,20 L160,35 L180,15 L200,25' stroke='%2316E0FF' fill='none' stroke-width='2'/%3E%3Cpath d='M0,90 L20,85 L40,88 L60,70 L80,72 L100,55 L120,60 L140,45 L160,50 L180,35 L200,40' stroke='%23087BFF' fill='none' stroke-width='1.5' opacity='0.5'/%3E%3C/svg%3E") no-repeat right center`,
                    backgroundSize: 'contain',
                    pointerEvents: 'none',
                  }} />
                  
                  {/* Candlestick Pattern Overlay */}
                  <div style={{
                    position: 'absolute',
                    top: '20%',
                    right: '5%',
                    width: '50%',
                    height: '60%',
                    opacity: 0.08,
                    background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 60'%3E%3Crect x='10' y='20' width='6' height='25' fill='%230ECB81'/%3E%3Cline x1='13' y1='10' x2='13' y2='20' stroke='%230ECB81' stroke-width='2'/%3E%3Cline x1='13' y1='45' x2='13' y2='55' stroke='%230ECB81' stroke-width='2'/%3E%3Crect x='25' y='15' width='6' height='30' fill='%23F6465D'/%3E%3Cline x1='28' y1='5' x2='28' y2='15' stroke='%23F6465D' stroke-width='2'/%3E%3Cline x1='28' y1='45' x2='28' y2='55' stroke='%23F6465D' stroke-width='2'/%3E%3Crect x='40' y='25' width='6' height='20' fill='%230ECB81'/%3E%3Cline x1='43' y1='15' x2='43' y2='25' stroke='%230ECB81' stroke-width='2'/%3E%3Cline x1='43' y1='45' x2='43' y2='50' stroke='%230ECB81' stroke-width='2'/%3E%3Crect x='55' y='10' width='6' height='35' fill='%230ECB81'/%3E%3Cline x1='58' y1='5' x2='58' y2='10' stroke='%230ECB81' stroke-width='2'/%3E%3Cline x1='58' y1='45' x2='58' y2='55' stroke='%230ECB81' stroke-width='2'/%3E%3Crect x='70' y='20' width='6' height='25' fill='%23F6465D'/%3E%3Cline x1='73' y1='10' x2='73' y2='20' stroke='%23F6465D' stroke-width='2'/%3E%3Cline x1='73' y1='45' x2='73' y2='50' stroke='%23F6465D' stroke-width='2'/%3E%3Crect x='85' y='15' width='6' height='28' fill='%230ECB81'/%3E%3Cline x1='88' y1='8' x2='88' y2='15' stroke='%230ECB81' stroke-width='2'/%3E%3Cline x1='88' y1='43' x2='88' y2='55' stroke='%230ECB81' stroke-width='2'/%3E%3C/svg%3E") no-repeat right center`,
                    backgroundSize: 'contain',
                    pointerEvents: 'none',
                  }} />
                  
                  {/* Card content wrapper */}
                  <div style={{
                    padding: '20px',
                    position: 'relative',
                    zIndex: 1,
                  }}>
                    {/* Top row: Logo + Status */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '16px',
                    }}>
                      {/* TradeGo Logo - Round */}
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        border: '2px solid rgba(22, 224, 255, 0.6)',
                        boxShadow: '0 0 20px rgba(22, 224, 255, 0.4), 0 0 40px rgba(8, 123, 255, 0.2)',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#0a1628',
                      }}>
                        <img 
                          src="/app-logo.png" 
                          alt="TradeGo" 
                          style={{
                            width: '80%',
                            height: '80%',
                            objectFit: 'contain',
                          }}
                        />
                      </div>
                      
                      {/* Status Badge - ACTIVE or COMPLETE */}
                      <div style={{
                        background: isCompleted 
                          ? 'rgba(255, 215, 0, 0.2)'
                          : 'rgba(14, 203, 129, 0.2)',
                        color: isCompleted ? '#FFD700' : '#0ECB81',
                        padding: '8px 20px',
                        borderRadius: '25px',
                        fontSize: '13px',
                        fontWeight: 800,
                        letterSpacing: '1px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        border: isCompleted 
                          ? '1px solid rgba(255, 215, 0, 0.5)'
                          : '1px solid rgba(14, 203, 129, 0.5)',
                        textTransform: 'uppercase',
                      }}>
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: isCompleted ? '#FFD700' : '#0ECB81',
                          boxShadow: isCompleted 
                            ? '0 0 10px #FFD700'
                            : '0 0 10px #0ECB81',
                        }} />
                        {isCompleted ? 'COMPLETE' : 'ACTIVE'}
                      </div>
                    </div>
                    
                    {/* Plan Name + Amount */}
                    <div style={{marginBottom: '20px'}}>
                      <div style={{
                        fontSize: '12px',
                        color: 'rgba(184, 199, 220, 0.8)',
                        letterSpacing: '3px',
                        textTransform: 'uppercase',
                        marginBottom: '6px',
                        fontWeight: 600,
                      }}>
                        TRADING <span style={{color: '#16E0FF'}}>SLAB {inv.plan_id || 1}</span>
                      </div>
                      <div style={{
                        fontSize: '42px',
                        fontWeight: 800,
                        color: '#FFFFFF',
                        letterSpacing: '2px',
                        fontFamily: "'Inter', sans-serif",
                        display: 'flex',
                        alignItems: 'baseline',
                      }}>
                        <span style={{color: '#16E0FF'}}>$</span>
                        <span>{Math.floor(inv.amount)}</span>
                        <span style={{color: '#16E0FF', fontSize: '28px'}}>.{(inv.amount % 1).toFixed(2).slice(2)}</span>
                      </div>
                    </div>
                    
                    {/* Progress Section */}
                    <div style={{
                      background: 'rgba(6, 37, 68, 0.6)',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      marginBottom: '16px',
                      border: '1px solid rgba(23, 77, 117, 0.5)',
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '10px',
                      }}>
                        <span style={{
                          color: '#FFFFFF',
                          fontSize: '13px',
                          fontWeight: 700,
                          letterSpacing: '1px',
                        }}>
                          PROGRESS
                        </span>
                        <span style={{
                          color: '#16E0FF',
                          fontSize: '18px',
                          fontWeight: 800,
                        }}>
                          {progressPercent.toFixed(0)}%
                        </span>
                      </div>
                      <div style={{
                        height: '8px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${progressPercent}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #087BFF 0%, #16E0FF 100%)',
                          borderRadius: '4px',
                          transition: 'width 0.5s ease',
                          boxShadow: '0 0 15px rgba(22, 224, 255, 0.5)',
                        }} />
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '8px',
                      }}>
                        <span style={{color: '#B8C7DC', fontSize: '12px', fontWeight: 600}}>
                          Day {inv.days_completed}/{inv.total_days}
                        </span>
                        <span style={{color: '#16E0FF', fontSize: '12px', fontWeight: 700}}>
                          {isCompleted ? '✓ Completed' : `${inv.total_days - inv.days_completed} days left`}
                        </span>
                      </div>
                    </div>
                    
                    {/* Bottom Stats - 3 Equal Cards */}
                    <div style={{
                      display: 'flex',
                      gap: '10px',
                    }}>
                      {/* Daily ROI Card */}
                      <div style={{
                        flex: 1,
                        background: 'rgba(22, 224, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '14px 10px',
                        textAlign: 'center',
                        border: '1px solid rgba(22, 224, 255, 0.3)',
                      }}>
                        <div style={{fontSize: '10px', color: '#B8C7DC', letterSpacing: '1px', marginBottom: '6px', fontWeight: 600}}>DAILY ROI</div>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'}}>
                          <span style={{color: '#16E0FF', fontSize: '10px'}}>📊</span>
                          <span style={{fontSize: '20px', fontWeight: 800, color: '#16E0FF'}}>{inv.daily_roi}%</span>
                        </div>
                        <div style={{fontSize: '10px', color: '#B8C7DC', marginTop: '4px'}}>${dailyEarning.toFixed(2)}/day</div>
                      </div>
                      
                      {/* Earned Card */}
                      <div style={{
                        flex: 1,
                        background: 'rgba(255, 215, 0, 0.1)',
                        borderRadius: '12px',
                        padding: '14px 10px',
                        textAlign: 'center',
                        border: '1px solid rgba(255, 215, 0, 0.3)',
                      }}>
                        <div style={{fontSize: '10px', color: '#B8C7DC', letterSpacing: '1px', marginBottom: '6px', fontWeight: 600}}>EARNED</div>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'}}>
                          <span style={{color: '#FFD700', fontSize: '10px'}}>🪙</span>
                          <span style={{fontSize: '20px', fontWeight: 800, color: '#FFD700'}}>${(inv.earned_so_far || 0).toFixed(2)}</span>
                        </div>
                        <div style={{fontSize: '10px', color: '#B8C7DC', marginTop: '4px'}}>Total</div>
                      </div>
                      
                      {/* Pending Card */}
                      <div style={{
                        flex: 1,
                        background: 'rgba(186, 85, 211, 0.1)',
                        borderRadius: '12px',
                        padding: '14px 10px',
                        textAlign: 'center',
                        border: '1px solid rgba(186, 85, 211, 0.3)',
                      }}>
                        <div style={{fontSize: '10px', color: '#B8C7DC', letterSpacing: '1px', marginBottom: '6px', fontWeight: 600}}>PENDING</div>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'}}>
                          <span style={{color: '#DA70D6', fontSize: '10px'}}>⏰</span>
                          <span style={{fontSize: '20px', fontWeight: 800, color: '#DA70D6'}}>${(inv.pending_roi || 0).toFixed(2)}</span>
                        </div>
                        <div style={{fontSize: '10px', color: '#B8C7DC', marginTop: '4px'}}>Claim</div>
                      </div>
                    </div>
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
