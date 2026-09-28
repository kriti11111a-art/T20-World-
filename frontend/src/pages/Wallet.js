import React, { useState, useEffect, useRef } from 'react';
import { Wallet as WalletIcon, ArrowDownCircle, ArrowUpCircle, Clock, RefreshCw, Plus, Minus, Link2, AlertCircle, Lock, Shield, TrendingUp, Upload, CheckCircle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import useWeb3 from '../hooks/useWeb3';
import toast from 'react-hot-toast';
import tokenManager from '../utils/tokenManager';
import { PLATFORM_DEPOSIT_WALLET } from '../config/web3Config';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Wallet = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, refreshUser } = useAuth();
  const { isDark, colors } = useTheme();
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState('balance');
  const [isLocking, setIsLocking] = useState(false);
  
  // Withdraw form state
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  
  // NEW: Deposit form state
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [depositTxHash, setDepositTxHash] = useState('');
  const [depositSuccess, setDepositSuccess] = useState(false);
  const tokenRef = useRef(null);

  const {
    account,
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet,
    usdtBalance,
    bnbBalance,
    isCorrectNetwork,
    switchToBSC,
    transferUSDT,
    refreshBalance,
  } = useWeb3();

  const withdrawalFee = 5;
  const minWithdraw = 1;

  const fetchWalletData = async () => {
    // Don't show loading spinner if we have cached data - instant UI
    if (deposits.length === 0 && withdrawals.length === 0 && investments.length === 0) {
      setLoading(true);
    }
    
    try {
      // Fetch deposits, withdrawals and investments in PARALLEL for speed
      const [depRes, withRes, invRes] = await Promise.all([
        fetch(`${API_URL}/api/deposits`, {
          headers: { 'Authorization': `Bearer ${tokenManager.get()}` }
        }),
        fetch(`${API_URL}/api/withdrawals`, {
          headers: { 'Authorization': `Bearer ${tokenManager.get()}` }
        }),
        fetch(`${API_URL}/api/investments`, {
          headers: { 'Authorization': `Bearer ${tokenManager.get()}` }
        })
      ]);

      if (depRes.ok) {
        const depData = await depRes.json();
        setDeposits(depData);
      }

      if (withRes.ok) {
        const withData = await withRes.json();
        setWithdrawals(withData);
      }

      if (invRes.ok) {
        const invData = await invRes.json();
        setInvestments(invData);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) {
      fetchWalletData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Lock wallet address permanently
  const handleLockWallet = async () => {
    if (!isConnected || !account) {
      toast.error('Please connect your wallet first!');
      return;
    }

    setIsLocking(true);
    const loadingToast = toast.loading('Locking wallet address...');

    try {
      const response = await fetch(`${API_URL}/api/user/lock-wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenManager.get()}`
        },
        body: JSON.stringify({ wallet_address: account })
      });

      if (response.ok) {
        toast.dismiss(loadingToast);
        toast.success('🔒 Wallet locked successfully! This address will be used for all withdrawals.', {
          duration: 6000,
        });
        await refreshUser();
      } else {
        const error = await response.json();
        toast.dismiss(loadingToast);
        toast.error(error.detail || 'Failed to lock wallet');
      }
    } catch (error) {
      console.error('Lock wallet error:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to lock wallet');
    }
    setIsLocking(false);
  };

  const calculateNetAmount = () => {
    if (!withdrawAmount) return null;
    const fee = (parseFloat(withdrawAmount) * withdrawalFee) / 100;
    const netAmount = parseFloat(withdrawAmount) - fee;
    return { fee, netAmount };
  };

  const handleWithdraw = async () => {
    // Check if wallet is locked
    if (!user?.locked_wallet_address) {
      toast.error('Please lock your wallet address first!');
      return;
    }

    if (!isConnected) {
      toast.error('Please connect your wallet!');
      return;
    }

    // Check if connected wallet matches locked wallet
    if (account?.toLowerCase() !== user?.locked_wallet_address?.toLowerCase()) {
      toast.error('Connected wallet does not match your locked withdrawal address!');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (amount < minWithdraw) {
      toast.error(`Minimum withdrawal is $${minWithdraw}`);
      return;
    }

    if (amount > (user?.balance || 0)) {
      toast.error('Insufficient balance!');
      return;
    }

    setIsWithdrawing(true);
    
    // Show instant feedback - no loading toast
    const fee = (amount * withdrawalFee) / 100;
    const netAmount = amount - fee;

    try {
      const withdrawalAddress = user?.locked_wallet_address || account;
      
      const response = await fetch(`${API_URL}/api/withdrawals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenManager.get()}`
        },
        body: JSON.stringify({
          amount: amount,
          wallet_address: withdrawalAddress
        })
      });

      if (response.ok) {
        // INSTANT success feedback
        toast.success(`✅ Withdrawal of $${netAmount.toFixed(2)} submitted!`, {
          duration: 4000,
        });
        setWithdrawAmount('');
        setShowWithdrawForm(false);
        
        // Update UI immediately with optimistic data
        const newWithdrawal = {
          id: `temp-${Date.now()}`,
          amount: amount,
          fee: fee,
          net_amount: netAmount,
          wallet_address: withdrawalAddress,
          status: 'pending',
          created_at: new Date().toISOString()
        };
        setWithdrawals(prev => [newWithdrawal, ...prev]);
        
        // Refresh data in background (don't await)
        fetchWalletData();
        refreshUser();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Withdrawal failed');
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast.error('Failed to process withdrawal');
    }
    setIsWithdrawing(false);
  };

  // NEW: Handle Web3 Deposit to Wallet Balance - BULLETPROOF
  const handleDepositToWallet = async () => {
    // STEP 1: Secure token in MULTIPLE places BEFORE MetaMask popup
    const securedToken = tokenManager.prepareForWeb3();
    tokenRef.current = securedToken;
    
    // Also store in window for extra safety
    if (typeof window !== 'undefined') {
      window.__DEPOSIT_TOKEN__ = securedToken;
    }
    
    if (!securedToken) {
      toast.error('Session expired. Please login again.');
      window.location.href = '/login';
      return;
    }
    
    console.log('✅ Token secured for Web3 deposit');
    
    if (!isConnected) {
      toast.error('Please connect your wallet first!');
      return;
    }

    if (!isCorrectNetwork) {
      await switchToBSC();
      return;
    }

    const amountNum = parseFloat(depositAmount);
    
    // Validate minimum deposit
    const isFirstDeposit = !user?.first_investment_done;
    if (isFirstDeposit && amountNum < 3) {
      toast.error('First deposit must be minimum $3 (Your $3 + $2 Welcome Bonus = $5 Investment Slab)');
      return;
    }
    
    if (!isFirstDeposit && amountNum < 1) {
      toast.error('Minimum deposit is $1');
      return;
    }

    if (amountNum > parseFloat(usdtBalance)) {
      toast.error('Insufficient USDT balance in wallet!');
      return;
    }

    setIsDepositing(true);
    setDepositSuccess(false);
    setDepositTxHash('');

    const loadingToast = toast.loading('Processing deposit...');

    try {
      // STEP 2: Do Web3 transfer (MetaMask popup will appear here)
      console.log(`💰 Transferring $${amountNum} USDT to platform wallet...`);
      const result = await transferUSDT(PLATFORM_DEPOSIT_WALLET, depositAmount);
      
      if (result.success) {
        setDepositTxHash(result.transactionHash);
        refreshBalance();
        
        toast.loading('Blockchain confirmed! Updating wallet...', {id: loadingToast});
        console.log('✅ Web3 transfer successful:', result.transactionHash);

        // STEP 3: After MetaMask - recover token from ALL sources
        const recoveredToken = tokenManager.get() || 
                               tokenRef.current || 
                               securedToken || 
                               (typeof window !== 'undefined' ? window.__DEPOSIT_TOKEN__ : null) ||
                               localStorage.getItem('token') ||
                               localStorage.getItem('backup_token');
        
        if (!recoveredToken) {
          console.error('❌ CRITICAL: All token recovery methods failed');
          toast.error('Session issue. Your deposit is safe - please refresh page to see balance.', {id: loadingToast});
          setIsDepositing(false);
          // Force refresh after 2 seconds
          setTimeout(() => window.location.reload(), 2000);
          return;
        }
        
        console.log('✅ Token recovered after MetaMask');

        // STEP 4: Call backend API to add amount to balance (with retry)
        let depositApiSuccess = false;
        let depositData = null;
        
        for (let attempt = 1; attempt <= 5; attempt++) {
          try {
            console.log(`📡 Deposit API attempt ${attempt}/5`);
            
            const depositRes = await fetch(`${API_URL}/api/deposits`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${recoveredToken}`
              },
              body: JSON.stringify({
                amount: amountNum,
                tx_hash: result.transactionHash
              })
            });
            
            depositData = await depositRes.json();
            
            if (depositRes.ok) {
              depositApiSuccess = true;
              console.log('✅ Deposit API success!', depositData);
              break;
            } else if (depositRes.status === 401) {
              // Token invalid - try to get fresh token
              console.log('⚠️ Token invalid, trying fresh token...');
              const freshToken = tokenManager.get() || localStorage.getItem('token');
              if (freshToken && freshToken !== recoveredToken) {
                // Retry with fresh token
                const retryRes = await fetch(`${API_URL}/api/deposits`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${freshToken}`
                  },
                  body: JSON.stringify({
                    amount: amountNum,
                    tx_hash: result.transactionHash
                  })
                });
                
                if (retryRes.ok) {
                  depositData = await retryRes.json();
                  depositApiSuccess = true;
                  console.log('✅ Retry with fresh token succeeded!');
                  break;
                }
              }
            }
            
            console.log(`❌ Attempt ${attempt} failed:`, depositData);
            
            if (attempt < 5) {
              await new Promise(r => setTimeout(r, 800));
            }
          } catch (fetchError) {
            console.error(`❌ Attempt ${attempt} network error:`, fetchError);
            if (attempt < 5) {
              await new Promise(r => setTimeout(r, 800));
            }
          }
        }

        if (!depositApiSuccess) {
          console.error('❌ All deposit attempts failed:', depositData);
          toast.error(depositData?.detail || 'Deposit record failed. Your funds are safe - refreshing page...', {id: loadingToast});
          // Force refresh to show updated balance
          setTimeout(() => window.location.reload(), 2000);
          setIsDepositing(false);
          return;
        }
        
        // SUCCESS!
        setDepositSuccess(true);
        toast.dismiss(loadingToast);
        
        // Check if first deposit auto-created investment
        if (depositData.auto_investment) {
          toast.success(`🎉 First deposit! $${depositData.auto_investment.amount} slab auto-created!`, {
            duration: 6000,
          });
        } else {
          toast.success(`✅ $${amountNum} deposited to your wallet!`, {
            duration: 5000,
          });
        }
        
        // INSTANT Refresh user data and wallet data
        try {
          await Promise.all([
            refreshUser(),
            fetchWalletData()
          ]);
          console.log('✅ User data refreshed instantly');
        } catch (e) {
          console.log('Refresh warning:', e);
        }
        
        // Reset form after 2 seconds
        setTimeout(() => {
          setShowDepositForm(false);
          setDepositAmount('');
          setDepositSuccess(false);
          setDepositTxHash('');
        }, 2000);
        
      }
    } catch (err) {
      console.error('❌ Deposit error:', err);
      toast.dismiss(loadingToast);
      
      if (err.code === 4001) {
        toast.error('Transaction rejected by user');
      } else {
        toast.error(err.message || 'Transaction failed');
      }
    } finally {
      setIsDepositing(false);
    }
  };

  const getAllTransactions = () => {
    const allTx = [
      ...deposits.map(d => ({ ...d, type: 'deposit' })),
      ...withdrawals.map(w => ({ ...w, type: 'withdrawal' })),
      ...investments.map(i => ({ ...i, type: 'investment', created_at: i.created_at || i.start_date }))
    ];
    return allTx.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  };

  const getFilteredTransactions = () => {
    if (activeTab === 'deposits') return deposits.map(d => ({ ...d, type: 'deposit' }));
    if (activeTab === 'withdrawals') return withdrawals.map(w => ({ ...w, type: 'withdrawal' }));
    if (activeTab === 'investments') return investments.map(i => ({ ...i, type: 'investment', created_at: i.created_at || i.start_date }));
    return getAllTransactions();
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return '#0ECB81';
      case 'pending':
        return '#FFD700';
      default:
        return '#FF4444';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'COMPLETE';
      case 'completed': return 'COMPLETE';
      case 'pending': return 'PENDING';
      default: return status?.toUpperCase() || 'UNKNOWN';
    }
  };

  const netCalc = calculateNetAmount();

  if (!isAuthenticated) {
    return (
      <div style={styles.page}>
        <Header />
        <div style={styles.container}>
          <div style={styles.authMessage}>
            <WalletIcon size={48} color="#0ECB81" />
            <h2>Please Login</h2>
            <p>You need to login to view your wallet</p>
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
        {/* Page Title - Centered */}
        <div style={styles.pageHeader}>
          <h1 style={{...styles.pageTitle, color: colors.text}}>Wallet</h1>
          <p style={{...styles.pageSubtitle, color: colors.textSecondary}}>Manage your funds and transactions</p>
        </div>

        {/* Single Long Wallet Card */}
        <div style={{
          background: colors.cardBg,
          border: `2px solid ${colors.accent}`,
          borderRadius: '20px',
          padding: '20px',
          marginBottom: '16px',
        }}>
          {/* Withdrawable Balance Card */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '18px 20px',
            background: isDark ? 'rgba(0, 208, 156, 0.1)' : 'rgba(0, 208, 156, 0.12)',
            borderRadius: '14px',
            marginBottom: '12px',
            border: '1px solid rgba(0, 208, 156, 0.4)',
          }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
              <div style={{
                width: '44px',
                height: '44px',
                background: `${colors.accent}25`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <WalletIcon size={24} color={colors.accent} />
              </div>
              <div>
                <span style={{fontSize: '11px', color: colors.accent, display: 'block', marginBottom: '2px', fontWeight: 600}}>WITHDRAWABLE BALANCE</span>
                <span style={{fontSize: '24px', fontWeight: 700, color: colors.accent}}>${user?.balance?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
            <span style={{fontSize: '13px', color: colors.accent, fontWeight: 600}}>USDT</span>
          </div>

          {/* Welcome Bonus Card - PINK */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '18px 20px',
            background: isDark ? 'rgba(255, 105, 180, 0.1)' : 'rgba(255, 105, 180, 0.12)',
            borderRadius: '14px',
            border: '1px solid rgba(255, 105, 180, 0.4)',
          }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
              <span style={{fontSize: '28px'}}>🎁</span>
              <div>
                <span style={{fontSize: '11px', color: '#FF69B4', display: 'block', marginBottom: '2px', fontWeight: 600}}>WELCOME BONUS</span>
                <span style={{fontSize: '24px', fontWeight: 700, color: '#FF69B4'}}>${user?.welcome_bonus?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
            <div style={{textAlign: 'right'}}>
              <span style={{fontSize: '13px', color: colors.textSecondary, fontWeight: 600}}>USDT</span>
              {(user?.total_invested || 0) === 0 && (user?.welcome_bonus || 0) > 0 && (
                <span style={{fontSize: '10px', color: '#FF6B6B', display: 'block', marginTop: '4px'}}>🔒 Stake first</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.actionButtons}>
          <button 
            data-testid="wallet-deposit-btn"
            style={{...styles.depositBtn, background: colors.gradient, boxShadow: colors.glowGreen}}
            onClick={() => {
              setShowDepositForm(!showDepositForm);
              setShowWithdrawForm(false);
            }}
          >
            <Plus size={20} />
            Deposit
          </button>
          <button 
            data-testid="wallet-withdraw-btn"
            style={{...styles.withdrawBtn, color: colors.accent, border: `2px solid ${colors.accent}`}}
            onClick={() => {
              setShowWithdrawForm(!showWithdrawForm);
              setShowDepositForm(false);
            }}
          >
            <Minus size={20} />
            Withdraw
          </button>
        </div>

        {/* ========== NEW: DEPOSIT FORM - WEB3 TO WALLET ========== */}
        {showDepositForm && (
          <div style={{
            background: isDark 
              ? 'linear-gradient(180deg, #0a2e1a 0%, #0d2a1b 100%)'
              : 'linear-gradient(180deg, #11998e 0%, #38ef7d 100%)',
            border: isDark 
              ? '2px solid rgba(14, 203, 129, 0.6)'
              : '3px solid #fff',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: isDark 
              ? '0 10px 40px rgba(14, 203, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              : '0 15px 50px rgba(56, 239, 125, 0.4), 0 5px 15px rgba(0, 0, 0, 0.2)',
          }}>
            <h3 data-testid="deposit-to-wallet-title" style={{
              fontSize: '20px',
              fontWeight: 700,
              marginBottom: '20px',
              color: isDark ? '#0ECB81' : '#fff',
              textAlign: 'center',
              textShadow: isDark ? '0 0 20px rgba(14, 203, 129, 0.5)' : '0 2px 4px rgba(0, 0, 0, 0.3)',
              letterSpacing: '1px',
            }}>💵 Deposit to Wallet</h3>

            {/* Success State */}
            {depositSuccess ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                padding: '30px',
                background: 'rgba(14, 203, 129, 0.15)',
                borderRadius: '16px',
                border: '2px solid #0ECB81',
              }}>
                <CheckCircle size={60} color="#0ECB81" />
                <span style={{color: '#0ECB81', fontSize: '20px', fontWeight: 700}}>Deposit Successful!</span>
                <span style={{color: isDark ? 'rgba(255,255,255,0.8)' : '#fff', fontSize: '14px', textAlign: 'center'}}>
                  ${depositAmount} has been added to your wallet balance
                </span>
                {depositTxHash && (
                  <a 
                    href={`https://bsctrace.com/tx/${depositTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#FFD700',
                      fontSize: '12px',
                      textDecoration: 'underline',
                    }}
                  >
                    View Transaction →
                  </a>
                )}
              </div>
            ) : !isConnected ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px',
                padding: '24px',
                background: isDark ? 'rgba(14, 203, 129, 0.1)' : 'rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                border: isDark ? '1px solid rgba(14, 203, 129, 0.3)' : '2px solid rgba(255, 255, 255, 0.3)',
              }}>
                <AlertCircle size={28} color={isDark ? '#0ECB81' : '#fff'} />
                <span data-testid="connect-wallet-message" style={{color: isDark ? '#0ECB81' : '#fff', fontWeight: 600, fontSize: '15px'}}>
                  Connect your wallet to deposit
                </span>
                <button style={{
                  background: isDark ? 'linear-gradient(135deg, #0ECB81 0%, #00E5A0 100%)' : '#fff',
                  color: isDark ? '#000' : '#11998e',
                  border: 'none',
                  padding: '14px 28px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                }} onClick={connectWallet} disabled={isConnecting}>
                  {isConnecting ? 'Connecting...' : '🔗 Connect Wallet'}
                </button>
              </div>
            ) : (
              <>
                {/* Connected Wallet Info */}
                <div style={{
                  background: isDark ? 'rgba(0, 208, 156, 0.15)' : 'rgba(255, 255, 255, 0.25)',
                  padding: '16px 18px',
                  borderRadius: '14px',
                  marginBottom: '18px',
                  border: isDark ? '2px solid rgba(0, 208, 156, 0.4)' : '2px solid rgba(255, 255, 255, 0.4)',
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                    <span style={{fontSize: '12px', color: isDark ? '#0ECB81' : '#fff', fontWeight: 600}}>Connected Wallet</span>
                    <span style={{fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.6)' : '#fff', fontFamily: 'monospace'}}>
                      {account?.slice(0, 8)}...{account?.slice(-6)}
                    </span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span style={{fontSize: '12px', color: isDark ? 'rgba(255,255,255,0.6)' : '#fff'}}>USDT Balance:</span>
                    <span style={{fontSize: '16px', color: '#FFD700', fontWeight: 700}}>${parseFloat(usdtBalance).toFixed(2)}</span>
                  </div>
                </div>

                {/* First Deposit Info */}
                {!user?.first_investment_done && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 152, 0, 0.15) 100%)',
                    border: '2px solid #FFD700',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <span style={{ fontSize: '20px' }}>🎁</span>
                    <div>
                      <div data-testid="first-deposit-min-message" style={{ color: '#FFD700', fontSize: '13px', fontWeight: 700 }}>
                        First Deposit: Min $3
                      </div>
                      <div style={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#fff', fontSize: '11px' }}>
                        $3 + $2 Bonus = $5 Investment Slab Auto-Created!
                      </div>
                    </div>
                  </div>
                )}

                {/* Amount Input */}
                <div style={{marginBottom: '18px'}}>
                  <label style={{
                    display: 'block',
                    fontSize: '15px',
                    color: isDark ? '#FFD700' : '#fff',
                    marginBottom: '10px',
                    fontWeight: 700,
                  }}>💵 Amount (USDT)</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder={!user?.first_investment_done ? "Min $3 (First Deposit)" : "Enter amount"}
                    style={{
                      width: '100%',
                      padding: '20px',
                      background: isDark ? '#0a0a0a' : '#fff',
                      border: isDark ? '4px solid #FF4500' : '4px solid #FF4500',
                      borderRadius: '14px',
                      color: isDark ? '#FF4500' : '#FF4500',
                      fontSize: '24px',
                      boxSizing: 'border-box',
                      fontWeight: 800,
                      textAlign: 'center',
                      boxShadow: isDark 
                        ? '0 0 25px rgba(255, 69, 0, 0.5), inset 0 2px 10px rgba(0,0,0,0.5)' 
                        : '0 4px 20px rgba(255, 69, 0, 0.4), inset 0 2px 5px rgba(0,0,0,0.1)',
                    }}
                    min={!user?.first_investment_done ? 3 : 1}
                    max={parseFloat(usdtBalance)}
                  />
                  {/* MAX Button */}
                  <button
                    onClick={() => setDepositAmount(parseFloat(usdtBalance).toFixed(2))}
                    style={{
                      marginTop: '10px',
                      width: '100%',
                      padding: '10px',
                      background: isDark ? 'rgba(255, 215, 0, 0.2)' : 'rgba(0,0,0,0.1)',
                      border: `1px solid ${isDark ? '#FFD700' : '#fff'}`,
                      borderRadius: '10px',
                      color: isDark ? '#FFD700' : '#fff',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    MAX: ${parseFloat(usdtBalance).toFixed(2)} USDT
                  </button>
                </div>

                {/* Deposit Info */}
                {depositAmount && parseFloat(depositAmount) >= 1 && (
                  <div style={{
                    background: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.15)',
                    padding: '16px',
                    borderRadius: '14px',
                    marginBottom: '18px',
                  }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#fff', marginBottom: '8px'}}>
                      <span>Deposit Amount:</span>
                      <span style={{fontWeight: 600}}>${parseFloat(depositAmount).toFixed(2)}</span>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#0ECB81', fontWeight: 600}}>
                      <span>➡️ Goes to Wallet Balance</span>
                      <span>✓ Free</span>
                    </div>
                    {!user?.first_investment_done && parseFloat(depositAmount) >= 3 && (
                      <div style={{
                        marginTop: '10px',
                        padding: '10px',
                        background: 'rgba(255, 215, 0, 0.15)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#FFD700',
                        textAlign: 'center',
                      }}>
                        🎉 First Deposit Auto Investment: ${parseFloat(depositAmount) + 2} Slab Created!
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <button 
                  style={{
                    width: '100%',
                    background: (() => {
                      const amt = parseFloat(depositAmount) || 0;
                      const minAmt = !user?.first_investment_done ? 3 : 1;
                      const canDeposit = amt >= minAmt && amt <= parseFloat(usdtBalance) && !isDepositing;
                      return canDeposit 
                        ? 'linear-gradient(135deg, #0ECB81 0%, #00E5A0 100%)'
                        : 'rgba(128, 128, 128, 0.5)';
                    })(),
                    color: '#fff',
                    border: 'none',
                    padding: '18px',
                    fontSize: '17px',
                    fontWeight: 700,
                    borderRadius: '14px',
                    cursor: (() => {
                      const amt = parseFloat(depositAmount) || 0;
                      const minAmt = !user?.first_investment_done ? 3 : 1;
                      return amt >= minAmt && amt <= parseFloat(usdtBalance) && !isDepositing ? 'pointer' : 'not-allowed';
                    })(),
                    boxShadow: '0 6px 20px rgba(14, 203, 129, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                  }}
                  onClick={handleDepositToWallet}
                  disabled={(() => {
                    const amt = parseFloat(depositAmount) || 0;
                    const minAmt = !user?.first_investment_done ? 3 : 1;
                    return isDepositing || amt < minAmt || amt > parseFloat(usdtBalance);
                  })()}
                >
                  {isDepositing ? (
                    <>
                      <Loader size={20} className="spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      Deposit ${depositAmount || '0'} to Wallet
                    </>
                  )}
                </button>

                <p style={{
                  fontSize: '11px',
                  color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.8)',
                  textAlign: 'center',
                  marginTop: '12px',
                }}>
                  💡 After deposit, go to <span style={{color: '#FFD700'}}>Trading Slab</span> page to invest your balance
                </p>
              </>
            )}
          </div>
        )}

        {/* Withdraw Form - CINEMATIC DESIGN */}
        {showWithdrawForm && (
          <div style={{
            background: isDark 
              ? 'linear-gradient(180deg, #1a0a2e 0%, #0d1b2a 100%)'
              : 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
            border: isDark 
              ? '2px solid rgba(255, 215, 0, 0.5)'
              : '3px solid #fff',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: isDark 
              ? '0 10px 40px rgba(255, 215, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              : '0 15px 50px rgba(118, 75, 162, 0.4), 0 5px 15px rgba(0, 0, 0, 0.2)',
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 700,
              marginBottom: '20px',
              color: isDark ? '#FFD700' : '#fff',
              textAlign: 'center',
              textShadow: isDark ? '0 0 20px rgba(255, 215, 0, 0.5)' : '0 2px 4px rgba(0, 0, 0, 0.3)',
              letterSpacing: '1px',
            }}>💰 Withdraw Funds</h3>

            {!isConnected ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px',
                padding: '24px',
                background: isDark ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                border: isDark ? '1px solid rgba(255, 215, 0, 0.3)' : '2px solid rgba(255, 255, 255, 0.3)',
              }}>
                <AlertCircle size={28} color={isDark ? '#FFD700' : '#fff'} />
                <span style={{color: isDark ? '#FFD700' : '#fff', fontWeight: 600, fontSize: '15px'}}>
                  Connect your wallet to withdraw
                </span>
                <button style={{
                  background: isDark ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' : '#fff',
                  color: isDark ? '#000' : '#764ba2',
                  border: 'none',
                  padding: '14px 28px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                }} onClick={connectWallet} disabled={isConnecting}>
                  {isConnecting ? 'Connecting...' : '🔗 Connect Wallet'}
                </button>
              </div>
            ) : !user?.locked_wallet_address ? (
              /* Wallet connected but not locked - show Lock button */
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px',
                padding: '24px',
                background: isDark 
                  ? 'linear-gradient(180deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.05) 100%)'
                  : 'rgba(255, 255, 255, 0.2)',
                border: isDark ? '1px solid rgba(255, 215, 0, 0.3)' : '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '16px',
                textAlign: 'center',
              }}>
                <Lock size={28} color={isDark ? '#FFD700' : '#fff'} />
                <span style={{fontSize: '15px', color: isDark ? '#FFD700' : '#fff', fontWeight: 600}}>
                  Lock your wallet to enable withdrawals
                </span>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  padding: '14px 18px',
                  background: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '10px',
                  width: '100%',
                }}>
                  <span style={{fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)'}}>Address:</span>
                  <span style={{fontSize: '13px', color: '#0ECB81', fontFamily: 'monospace', fontWeight: 600}}>
                    {account?.slice(0, 12)}...{account?.slice(-10)}
                  </span>
                </div>
                <button 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#000',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
                  }}
                  onClick={handleLockWallet}
                  disabled={isLocking}
                >
                  <Lock size={18} />
                  {isLocking ? 'Locking...' : '🔒 Lock & Enable Withdrawals'}
                </button>
                <span style={{fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)'}}>
                  ⚠️ This address will be permanently locked
                </span>
              </div>
            ) : (
              <>
                <div style={{
                  background: isDark ? 'rgba(0, 208, 156, 0.15)' : 'rgba(255, 255, 255, 0.25)',
                  padding: '16px 18px',
                  borderRadius: '14px',
                  marginBottom: '18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: isDark ? '2px solid rgba(0, 208, 156, 0.4)' : '2px solid rgba(255, 255, 255, 0.4)',
                }}>
                  <span style={{fontSize: '13px', color: isDark ? '#0ECB81' : '#fff', fontWeight: 700}}>To Wallet:</span>
                  <span style={{fontSize: '14px', color: isDark ? '#0ECB81' : '#fff', fontFamily: 'monospace', fontWeight: 700}}>
                    {user.locked_wallet_address?.slice(0, 10)}...{user.locked_wallet_address?.slice(-8)}
                  </span>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '10px',
                    color: '#0ECB81',
                    background: 'rgba(14, 203, 129, 0.2)',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontWeight: 600,
                  }}><Lock size={12} /> Locked</span>
                </div>

                <div style={{marginBottom: '18px'}}>
                  <label style={{
                    display: 'block',
                    fontSize: '15px',
                    color: isDark ? '#FF69B4' : '#fff',
                    marginBottom: '10px',
                    fontWeight: 700,
                    textShadow: isDark ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.2)',
                  }}>💵 Amount (USDT)</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder={`Min $${minWithdraw}`}
                    style={{
                      width: '100%',
                      padding: '18px',
                      background: isDark ? 'rgba(255, 105, 180, 0.1)' : 'rgba(255, 255, 255, 0.95)',
                      border: isDark ? '2px solid rgba(255, 105, 180, 0.4)' : '3px solid #764ba2',
                      borderRadius: '14px',
                      color: isDark ? '#fff' : '#333',
                      fontSize: '20px',
                      boxSizing: 'border-box',
                      fontWeight: 700,
                      textAlign: 'center',
                    }}
                    min={minWithdraw}
                    max={user?.balance || 0}
                  />
                </div>

                {netCalc && (
                  <div style={{
                    background: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.15)',
                    padding: '18px',
                    borderRadius: '14px',
                    marginBottom: '18px',
                    border: isDark ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                  }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#fff', marginBottom: '10px'}}>
                      <span>Amount:</span>
                      <span style={{fontWeight: 600}}>${parseFloat(withdrawAmount).toFixed(2)}</span>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#fff', marginBottom: '10px'}}>
                      <span>Fee ({withdrawalFee}%):</span>
                      <span style={{color: '#FF6B6B', fontWeight: 600}}>-${netCalc.fee.toFixed(2)}</span>
                    </div>
                    <div style={{height: '2px', background: 'rgba(255, 255, 255, 0.2)', margin: '12px 0'}}></div>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 700}}>
                      <span style={{color: isDark ? '#fff' : '#fff'}}>You receive:</span>
                      <span style={{color: '#0ECB81', textShadow: '0 0 10px rgba(14, 203, 129, 0.5)'}}>${netCalc.netAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <button 
                  style={{
                    width: '100%',
                    background: parseFloat(withdrawAmount) >= minWithdraw && parseFloat(withdrawAmount) <= (user?.balance || 0) 
                      ? 'linear-gradient(135deg, #0ECB81 0%, #00a86b 100%)'
                      : 'rgba(128, 128, 128, 0.5)',
                    color: '#fff',
                    border: 'none',
                    padding: '18px',
                    fontSize: '17px',
                    fontWeight: 700,
                    borderRadius: '14px',
                    cursor: parseFloat(withdrawAmount) >= minWithdraw ? 'pointer' : 'not-allowed',
                    boxShadow: parseFloat(withdrawAmount) >= minWithdraw ? '0 6px 20px rgba(14, 203, 129, 0.4)' : 'none',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                    letterSpacing: '0.5px',
                  }}
                  onClick={handleWithdraw}
                  disabled={isWithdrawing || parseFloat(withdrawAmount) < minWithdraw || parseFloat(withdrawAmount) > (user?.balance || 0)}
                >
                  {isWithdrawing ? '⏳ Processing...' : '🚀 Submit Withdrawal'}
                </button>
              </>
            )}
          </div>
        )}

        {/* Locked Wallet Section */}
        {user?.locked_wallet_address ? (
          <div style={{
            background: colors.cardBg,
            border: `2px solid ${colors.accent}`,
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '16px',
          }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
              <div style={{
                width: '48px',
                height: '48px',
                background: `${colors.accent}20`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Shield size={24} color={colors.accent} />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                <span style={{fontSize: '12px', color: colors.textSecondary, letterSpacing: '1px', fontWeight: 600}}>WITHDRAWAL ADDRESS (LOCKED)</span>
                <span style={{fontSize: '14px', color: colors.accent, fontFamily: 'monospace'}}>
                  {user.locked_wallet_address.slice(0, 12)}...{user.locked_wallet_address.slice(-10)}
                </span>
              </div>
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: `${colors.accent}20`,
              color: colors.accent,
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
            }}>
              <Lock size={14} />
              Secured
            </div>
            <p style={{fontSize: '12px', color: colors.textSecondary, margin: '12px 0 0 0'}}>
              This address is permanently locked. Contact support to change.
            </p>
          </div>
        ) : (
          <div style={{
            background: colors.cardBg,
            border: `2px solid #FFD700`,
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '16px',
          }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
              <Lock size={28} color="#FFD700" />
              <span style={{fontSize: '16px', fontWeight: 700, color: colors.text}}>Secure Your Withdrawals</span>
            </div>
            <p style={{fontSize: '14px', color: colors.textSecondary, margin: '0 0 16px 0', lineHeight: '1.5'}}>
              Lock your wallet address for secure withdrawals. Once locked, only this address can receive your funds.
            </p>
            
            {!isConnected ? (
              <button style={{
                background: `linear-gradient(135deg, #FFD700 0%, #FFA500 100%)`,
                color: '#000',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }} onClick={connectWallet} disabled={isConnecting}>
                <Link2 size={16} />
                {isConnecting ? 'Connecting...' : 'Connect Wallet First'}
              </button>
            ) : (
              <div>
                <div style={{
                  background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.05)',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  marginBottom: '12px',
                }}>
                  <span style={{fontSize: '11px', color: colors.textSecondary, display: 'block', marginBottom: '4px'}}>Address to Lock:</span>
                  <span style={{fontSize: '13px', color: colors.accent, fontFamily: 'monospace'}}>{account?.slice(0, 12)}...{account?.slice(-10)}</span>
                </div>
                <button 
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    color: '#000',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                  onClick={handleLockWallet}
                  disabled={isLocking}
                >
                  <Lock size={18} />
                  {isLocking ? 'Locking...' : 'Lock This Wallet Permanently'}
                </button>
                <p style={{fontSize: '11px', color: colors.textSecondary, margin: '10px 0 0 0', textAlign: 'center'}}>
                  ⚠️ This action cannot be undone. Only lock your permanent wallet.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Web3 Wallet Section */}
        <div style={{
          background: colors.cardBg,
          border: `2px solid ${colors.accent}`,
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <div style={{
              width: '48px',
              height: '48px',
              background: `${colors.accent}20`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <WalletIcon size={24} color={colors.accent} />
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '2px'}}>
              <span style={{fontSize: '12px', color: colors.textSecondary, letterSpacing: '1px', fontWeight: 600}}>WEB3 WALLET</span>
              <span style={{fontSize: '13px', color: colors.text, fontWeight: 500}}>MetaMask, Trust Wallet, Coinbase, OKX & more</span>
            </div>
          </div>
          {isConnected ? (
            <button style={{
              background: 'rgba(255, 107, 107, 0.2)',
              color: '#FF6B6B',
              border: '1px solid rgba(255, 107, 107, 0.4)',
              padding: '10px 16px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
            }} onClick={disconnectWallet}>
              Disconnect
            </button>
          ) : (
            <button style={{
              background: `${colors.accent}20`,
              color: colors.accent,
              border: `1px solid ${colors.accent}60`,
              padding: '10px 16px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }} onClick={connectWallet} disabled={isConnecting}>
              <Link2 size={16} />
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          background: colors.cardBg,
          padding: '6px',
          borderRadius: '12px',
          border: `1px solid ${colors.cardBorder}`,
        }}>
          <button 
            style={{
              flex: 1,
              padding: '12px 8px',
              background: activeTab === 'all' ? `${colors.accent}20` : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: activeTab === 'all' ? colors.accent : colors.textSecondary,
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button 
            style={{
              flex: 1,
              padding: '12px 8px',
              background: activeTab === 'deposits' ? `${colors.accent}20` : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: activeTab === 'deposits' ? colors.accent : colors.textSecondary,
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onClick={() => setActiveTab('deposits')}
          >
            Deposits ({deposits.length})
          </button>
          <button 
            style={{
              flex: 1,
              padding: '12px 8px',
              background: activeTab === 'investments' ? `${colors.accent}20` : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: activeTab === 'investments' ? colors.accent : colors.textSecondary,
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onClick={() => setActiveTab('investments')}
          >
            Invest ({investments.length})
          </button>
          <button 
            style={{
              flex: 1,
              padding: '12px 8px',
              background: activeTab === 'withdrawals' ? `${colors.accent}20` : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: activeTab === 'withdrawals' ? colors.accent : colors.textSecondary,
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onClick={() => setActiveTab('withdrawals')}
          >
            Withdraw ({withdrawals.length})
          </button>
        </div>

        {/* Transaction History */}
        <div style={{
          background: colors.cardBg,
          borderRadius: '16px',
          padding: '20px',
          border: `2px solid ${colors.accent}`,
        }}>
          <h2 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '16px',
            fontWeight: 600,
            marginBottom: '16px',
            color: colors.text,
          }}>
            <Clock size={20} color={colors.accent} />
            Transaction History
          </h2>

          {loading ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              padding: '40px',
              color: colors.textSecondary,
            }}>
              <RefreshCw size={24} className="spin" color={colors.accent} />
              <span>Loading...</span>
            </div>
          ) : getFilteredTransactions().length > 0 ? (
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              {getFilteredTransactions().map((tx, index) => (
                <div key={tx.id || index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
                  borderRadius: '12px',
                  padding: '14px',
                  border: `1px solid ${colors.cardBorder}`,
                }}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: tx.type === 'deposit' 
                        ? 'rgba(14, 203, 129, 0.2)' 
                        : tx.type === 'investment'
                        ? 'rgba(255, 215, 0, 0.2)'
                        : 'rgba(255, 107, 107, 0.2)'
                    }}>
                      {tx.type === 'deposit' ? (
                        <ArrowDownCircle size={20} color="#0ECB81" />
                      ) : tx.type === 'investment' ? (
                        <TrendingUp size={20} color="#FFD700" />
                      ) : (
                        <ArrowUpCircle size={20} color="#FF6B6B" />
                      )}
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '2px'}}>
                      <span style={{fontSize: '14px', fontWeight: 600, color: colors.text}}>
                        {tx.type === 'deposit' ? 'Deposit' : tx.type === 'investment' ? tx.plan_name || 'Investment' : 'Withdrawal'}
                      </span>
                      <span style={{fontSize: '11px', color: colors.textSecondary}}>{formatDate(tx.created_at)}</span>
                      {/* Investment ROI info */}
                      {tx.type === 'investment' && tx.daily_roi && (
                        <span style={{
                          fontSize: '10px',
                          color: '#FFD700',
                          background: 'rgba(255, 215, 0, 0.15)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          marginTop: '2px',
                          width: 'fit-content',
                        }}>
                          {tx.daily_roi}% Daily ROI
                        </span>
                      )}
                      {/* Transaction Hash - Clickable to BSCScan */}
                      {tx.tx_hash ? (
                        <a 
                          href={`https://bsctrace.com/tx/${tx.tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '10px',
                            color: '#FF69B4',
                            textDecoration: 'none',
                            background: 'rgba(255, 105, 180, 0.15)',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            marginTop: '4px',
                            width: 'fit-content',
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span style={{color: '#FF69B4', marginRight: '2px'}}>Tx Hash:</span>
                          <Link2 size={12} />
                          <span>{tx.tx_hash.slice(0, 8)}...{tx.tx_hash.slice(-6)}</span>
                        </a>
                      ) : tx.type === 'withdrawal' && tx.status === 'pending' ? (
                        <span style={{fontSize: '10px', color: colors.textSecondary, fontStyle: 'italic', marginTop: '4px'}}>Tx Hash: Pending...</span>
                      ) : null}
                    </div>
                  </div>
                  <div style={{textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px'}}>
                    <span style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: tx.type === 'deposit' ? '#0ECB81' : tx.type === 'investment' ? '#FFD700' : '#FF6B6B'
                    }}>
                      {tx.type === 'deposit' ? '+' : tx.type === 'investment' ? '' : '-'}${tx.amount?.toFixed(2) || '0.00'}
                    </span>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      color: getStatusColor(tx.status)
                    }}>
                      {getStatusText(tx.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              padding: '40px 20px',
              color: colors.textSecondary,
            }}>
              <WalletIcon size={48} color={colors.textSecondary} />
              <span>No transactions yet</span>
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
        
        /* Animated Lightning Bolt Styles */
        .bolt-container {
          position: relative;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
        }
        
        .bolt-glow {
          position: absolute;
          width: 45px;
          height: 45px;
          background: radial-gradient(circle, rgba(255, 215, 0, 0.6) 0%, rgba(255, 165, 0, 0.3) 40%, transparent 70%);
          border-radius: 50%;
          animation: pulseGlow 2s ease-in-out infinite;
        }
        
        .bolt-icon {
          position: relative;
          z-index: 2;
          color: #FFD700;
          filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 15px rgba(255, 165, 0, 0.5));
          animation: boltPulse 1.5s ease-in-out infinite, boltShake 0.1s ease-in-out infinite;
        }
        
        .bolt-spark {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #FFD700;
          border-radius: 50%;
          animation: sparkle 1.5s ease-in-out infinite;
        }
        
        .spark-1 {
          top: 5px;
          right: 8px;
          animation-delay: 0s;
        }
        
        .spark-2 {
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        
        /* Deposit Amount Input Placeholder - BRIGHT ORANGE */
        input[type="number"]::placeholder {
          color: #FF4500;
          opacity: 0.8;
          font-weight: 700;
        }
        
        /* Wallet Hero Container */
        .wallet-hero-container {
          position: relative;
          width: 180px;
          height: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Yellow Background Circle */
        .wallet-bg-circle {
          position: absolute;
          width: 130px;
          height: 130px;
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%);
          border-radius: 50%;
          z-index: 0;
          box-shadow: 0 0 40px rgba(255, 215, 0, 0.5), 0 0 80px rgba(255, 165, 0, 0.3);
          animation: bgPulse 3s ease-in-out infinite;
        }
        
        @keyframes bgPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.9; }
        }
        
        /* Wallet Image */
        .wallet-hero-img {
          width: 110px;
          height: 110px;
          position: relative;
          z-index: 2;
          animation: walletFloat 3s ease-in-out infinite;
          filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.3));
        }
        
        /* Wallet SVG Icon */
        .wallet-hero-svg {
          width: 100px;
          height: 100px;
          position: relative;
          z-index: 2;
          animation: walletFloat 3s ease-in-out infinite;
          filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.4));
        }
        
        @keyframes walletFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.02); }
        }
        
        /* Floating Particles */
        .particle {
          position: absolute;
          width: 8px;
          height: 8px;
          background: linear-gradient(135deg, #FFD700, #FFA500);
          border-radius: 50%;
          z-index: 3;
          animation: particleFloat 4s ease-in-out infinite;
        }
        
        .particle-1 { top: 10%; left: 15%; animation-delay: 0s; width: 6px; height: 6px; }
        .particle-2 { top: 20%; right: 10%; animation-delay: 0.5s; width: 10px; height: 10px; }
        .particle-3 { bottom: 25%; left: 10%; animation-delay: 1s; width: 5px; height: 5px; }
        .particle-4 { bottom: 15%; right: 15%; animation-delay: 1.5s; width: 8px; height: 8px; }
        .particle-5 { top: 40%; left: 5%; animation-delay: 2s; width: 4px; height: 4px; }
        .particle-6 { top: 35%; right: 5%; animation-delay: 2.5s; width: 7px; height: 7px; }
        
        @keyframes particleFloat {
          0%, 100% { 
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0.6;
          }
          25% {
            transform: translateY(-20px) translateX(10px) scale(1.2);
            opacity: 1;
          }
          50% { 
            transform: translateY(-30px) translateX(-5px) scale(0.8);
            opacity: 0.8;
          }
          75% {
            transform: translateY(-15px) translateX(15px) scale(1.1);
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)',
    color: '#ffffff',
  },
  container: {
    maxWidth: '450px',
    margin: '0 auto',
    padding: '80px 16px 20px 16px',
  },
  authMessage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '60px 20px',
    textAlign: 'center',
  },
  pageHeader: {
    marginBottom: '24px',
    textAlign: 'center',
  },
  walletIconHeader: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '16px',
    marginTop: '0px',
  },
  walletHeroBox: {
    width: '100%',
    maxWidth: '400px',
    height: '200px',
    background: '#ffffff',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  },
  walletHeroSvg: {
    width: '180px',
    height: '160px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#ffffff',
    marginBottom: '4px',
  },
  pageSubtitle: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '12px',
    cursor: 'pointer',
  },
  cardLabel: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: '2px',
    display: 'block',
    marginBottom: '12px',
  },
  cardValue: {
    display: 'flex',
    alignItems: 'center',
  },
  amountText: {
    fontSize: '36px',
    fontWeight: 700,
    color: '#0ECB81',
  },
  amountTextSmall: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#0ECB81',
  },
  usdtLabel: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#0ECB81',
    marginLeft: '10px',
  },
  usdtLabelSmall: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#0ECB81',
    marginLeft: '8px',
  },
  actionButtons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginTop: '8px',
    marginBottom: '16px',
  },
  depositBtn: {
    background: '#0ECB81',
    color: '#000',
    border: 'none',
    padding: '16px',
    fontSize: '16px',
    fontWeight: 600,
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  withdrawBtn: {
    background: 'transparent',
    color: '#0ECB81',
    border: '2px solid #0ECB81',
    padding: '14px',
    fontSize: '16px',
    fontWeight: 600,
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  withdrawCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(14, 203, 129, 0.3)',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '16px',
  },
  withdrawTitle: {
    fontSize: '16px',
    fontWeight: 600,
    marginBottom: '16px',
    color: '#fff',
  },
  connectFirst: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '20px',
    background: 'rgba(255, 215, 0, 0.1)',
    borderRadius: '10px',
    color: '#FFD700',
    fontSize: '14px',
    textAlign: 'center',
  },
  connectBtnSmall: {
    background: '#FFD700',
    color: '#000',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer',
    marginTop: '8px',
  },
  lockFirstBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '20px',
    background: 'linear-gradient(180deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.05) 100%)',
    border: '1px solid rgba(255, 215, 0, 0.3)',
    borderRadius: '12px',
    textAlign: 'center',
  },
  lockFirstText: {
    fontSize: '14px',
    color: '#FFD700',
    fontWeight: 500,
  },
  lockAddressPreview: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '12px 16px',
    background: 'rgba(0, 0, 0, 0.4)',
    borderRadius: '8px',
    width: '100%',
  },
  lockPreviewLabel: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  lockPreviewAddr: {
    fontSize: '13px',
    color: '#0ECB81',
    fontFamily: 'monospace',
  },
  lockNowBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    border: 'none',
    borderRadius: '10px',
    color: '#000',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  lockWarningSmall: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  lockedBadgeSmall: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '10px',
    color: '#0ECB81',
    background: 'rgba(14, 203, 129, 0.2)',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  walletAddress: {
    background: 'rgba(0, 208, 156, 0.15)',
    padding: '14px 16px',
    borderRadius: '12px',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '2px solid rgba(0, 208, 156, 0.4)',
  },
  addressLabel: {
    fontSize: '12px',
    color: '#0ECB81',
    fontWeight: 600,
  },
  address: {
    fontSize: '14px',
    color: '#0ECB81',
    fontFamily: 'monospace',
    fontWeight: 700,
  },
  inputGroup: {
    marginBottom: '16px',
  },
  inputLabel: {
    display: 'block',
    fontSize: '14px',
    color: '#FF69B4',
    marginBottom: '8px',
    fontWeight: 600,
  },
  input: {
    width: '100%',
    padding: '16px',
    background: 'rgba(255, 105, 180, 0.1)',
    border: '2px solid rgba(255, 105, 180, 0.4)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '18px',
    boxSizing: 'border-box',
    fontWeight: 600,
  },
  feeInfo: {
    background: 'rgba(0, 0, 0, 0.3)',
    padding: '14px',
    borderRadius: '10px',
    marginBottom: '16px',
  },
  feeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '8px',
  },
  feeDivider: {
    height: '1px',
    background: 'rgba(255, 255, 255, 0.1)',
    margin: '10px 0',
  },
  feeRowTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '15px',
    fontWeight: 600,
  },
  submitBtn: {
    width: '100%',
    background: '#0ECB81',
    color: '#000',
    border: 'none',
    padding: '16px',
    fontSize: '16px',
    fontWeight: 600,
    borderRadius: '12px',
    cursor: 'pointer',
  },
  web3Card: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  web3Left: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  web3Icon: {
    width: '44px',
    height: '44px',
    background: 'rgba(14, 203, 129, 0.15)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  web3Info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  web3Title: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: '1px',
  },
  web3Desc: {
    fontSize: '13px',
    color: '#fff',
  },
  connectBtn: {
    background: 'rgba(14, 203, 129, 0.2)',
    color: '#0ECB81',
    border: '1px solid rgba(14, 203, 129, 0.4)',
    padding: '10px 16px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  disconnectBtn: {
    background: 'rgba(255, 107, 107, 0.2)',
    color: '#FF6B6B',
    border: '1px solid rgba(255, 107, 107, 0.4)',
    padding: '10px 16px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
  },
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
  },
  tabActive: {
    background: 'rgba(14, 203, 129, 0.15)',
    color: '#0ECB81',
  },
  historySection: {
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '16px',
    fontWeight: 600,
    marginBottom: '16px',
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '40px',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  transactionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  txCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
    padding: '14px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  txLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  txIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  txType: {
    fontSize: '14px',
    fontWeight: 600,
  },
  txDate: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  txHashLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '10px',
    color: '#FFD700',
    textDecoration: 'none',
    background: 'rgba(255, 215, 0, 0.1)',
    padding: '4px 8px',
    borderRadius: '4px',
    marginTop: '4px',
    width: 'fit-content',
  },
  txHashLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    marginRight: '2px',
  },
  txHashPending: {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.4)',
    fontStyle: 'italic',
    marginTop: '4px',
  },
  txRight: {
    textAlign: 'right',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  txAmount: {
    fontSize: '16px',
    fontWeight: 700,
  },
  txStatus: {
    fontSize: '10px',
    fontWeight: 600,
  },
  emptyBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '40px 20px',
    color: 'rgba(255, 255, 255, 0.5)',
  },
};

export default Wallet;
