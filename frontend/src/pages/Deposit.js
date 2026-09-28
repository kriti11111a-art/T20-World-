import React, { useState, useEffect, useRef } from 'react';
import { Copy, DollarSign, Upload, Wallet, Link2, CheckCircle, AlertCircle, Loader, ChevronRight, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { investmentPlans } from '../mock';
import Header from '../components/Header';
import Footer from '../components/Footer';
import useWeb3 from '../hooks/useWeb3';
import { PLATFORM_DEPOSIT_WALLET } from '../config/web3Config';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import tokenManager from '../utils/tokenManager';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Deposit = () => {
  const navigate = useNavigate();
  const { user, token, refreshUser } = useAuth();
  const { isDark, colors } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [amount, setAmount] = useState('');
  const [txStatus, setTxStatus] = useState(null);
  const [txHash, setTxHash] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showInvestForm, setShowInvestForm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);
  
  // Active investments and deposits from backend
  const [activeInvestments, setActiveInvestments] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('wallet'); // 'wallet' or 'balance'

  const {
    account,
    usdtBalance,
    bnbBalance,
    isConnected,
    isConnecting,
    isCorrectNetwork,
    connectWallet,
    disconnectWallet,
    switchToBSC,
    transferUSDT,
    refreshBalance,
  } = useWeb3();

  // Fetch investments and deposits from backend
  useEffect(() => {
    if (token) {
      fetchUserData();
    }
  }, [token]);

  const fetchUserData = async () => {
    const authToken = tokenManager.get();
    if (!authToken) return;
    
    setLoadingData(true);
    try {
      // Fetch investments and deposits in PARALLEL for faster loading
      const [invRes, depRes] = await Promise.all([
        fetch(`${API_URL}/api/investments`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }),
        fetch(`${API_URL}/api/deposits`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      ]);
      
      if (invRes.ok) {
        const invData = await invRes.json();
        // Show active first, then completed at the end
        const sortedInvestments = invData.sort((a, b) => {
          if (a.status === 'active' && b.status !== 'active') return -1;
          if (a.status !== 'active' && b.status === 'active') return 1;
          return 0;
        });
        setActiveInvestments(sortedInvestments);
      }

      if (depRes.ok) {
        const depData = await depRes.json();
        setDeposits(depData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
    setLoadingData(false);
  };

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(PLATFORM_DEPOSIT_WALLET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleInvestNow = (plan) => {
    setSelectedPlan(plan);
    setShowInvestForm(true);
    // First deposit requires minimum $3
    const isFirstDeposit = !user?.first_investment_done;
    const minAmount = isFirstDeposit ? Math.max(3, plan.minInvestment) : plan.minInvestment;
    setAmount(minAmount.toString());
  };

  // Use ref to store token - refs persist across re-renders
  const tokenRef = useRef(null);
  
  // Keep tokenRef updated
  useEffect(() => {
    const currentToken = tokenManager.get();
    if (currentToken) {
      tokenRef.current = currentToken;
    }
  }, [token]);

  // BULLETPROOF: Make API call with guaranteed token
  const makeAuthenticatedRequest = async (url, options = {}) => {
    // Get token from tokenManager (tries 6+ different sources)
    const authToken = tokenManager.get() || tokenRef.current;
    
    if (!authToken) {
      throw new Error('NO_TOKEN');
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      ...(options.headers || {})
    };
    
    return fetch(url, { ...options, headers });
  };

  const handleDeposit = async () => {
    // STEP 1: Secure token BEFORE anything else
    const securedToken = tokenManager.prepareForWeb3();
    tokenRef.current = securedToken;
    
    if (!securedToken) {
      toast.error('Session expired. Please login again.');
      window.location.href = '/login';
      return;
    }
    
    console.log('Token secured for Web3 transaction');
    
    if (!isConnected) {
      toast.error('Please connect your wallet first!');
      return;
    }

    if (!isCorrectNetwork) {
      await switchToBSC();
      return;
    }

    // Validate amount
    const amountNum = parseFloat(amount);
    const isFirstDeposit = !user?.first_investment_done;
    
    if (isFirstDeposit && amountNum < 3) {
      toast.error('First deposit must be minimum $3. This will be combined with your $2 welcome bonus to create a $5 investment slab.');
      return;
    }
    
    if (amountNum < selectedPlan.minInvestment || amountNum > selectedPlan.maxInvestment) {
      toast.error(`Amount must be between $${selectedPlan.minInvestment} and $${selectedPlan.maxInvestment.toLocaleString()}`);
      return;
    }

    if (parseFloat(amount) > parseFloat(usdtBalance)) {
      toast.error('Insufficient USDT balance!');
      return;
    }

    setIsProcessing(true);
    setTxStatus('pending');

    try {
      // STEP 2: Do Web3 transfer (MetaMask popup will appear here)
      const result = await transferUSDT(PLATFORM_DEPOSIT_WALLET, amount);
      
      if (result.success) {
        setTxHash(result.transactionHash);
        setTxStatus('success');
        refreshBalance();

        // STEP 3: After MetaMask - get token from ALL possible sources
        const recoveredToken = tokenManager.get() || tokenRef.current || securedToken;
        
        if (!recoveredToken) {
          console.error('CRITICAL: All token recovery methods failed');
          toast.error('Session issue. Transaction completed but please verify in your wallet.');
          setIsProcessing(false);
          return;
        }
        
        console.log('Token recovered after MetaMask:', recoveredToken.substring(0, 20) + '...');

        // STEP 4: Call deposit API with retry mechanism
        let depositSuccess = false;
        let depositData = null;
        
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            console.log(`Deposit API attempt ${attempt}/3`);
            
            const depositRes = await fetch(`${API_URL}/api/deposits`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${recoveredToken}`
              },
              body: JSON.stringify({
                amount: parseFloat(amount),
                tx_hash: result.transactionHash
              })
            });
            
            depositData = await depositRes.json();
            
            if (depositRes.ok) {
              depositSuccess = true;
              console.log('Deposit API success!');
              break;
            } else if (depositRes.status === 401) {
              // Token actually invalid - try recovering again
              const freshToken = tokenManager.get();
              if (freshToken && freshToken !== recoveredToken) {
                console.log('Retrying with fresh token...');
                continue;
              }
            }
            
            console.log(`Attempt ${attempt} failed:`, depositData);
            
            if (attempt < 3) {
              await new Promise(r => setTimeout(r, 1000));
            }
          } catch (fetchError) {
            console.error(`Attempt ${attempt} network error:`, fetchError);
            if (attempt < 3) {
              await new Promise(r => setTimeout(r, 1000));
            }
          }
        }

        if (!depositSuccess) {
          console.error('All deposit attempts failed:', depositData);
          toast.error(depositData?.detail || 'Deposit failed. Your funds are safe - please contact support.');
          setIsProcessing(false);
          return;
        }
            
        console.log('Deposit response:', depositData);

        // Check if auto_investment was created (first deposit)
        if (depositData.auto_investment) {
          // First deposit - slab was auto-created
          const autoInv = depositData.auto_investment;
          
          setSuccessData({
            amount: autoInv.amount,
            planName: autoInv.plan_name,
            dailyROI: autoInv.daily_roi,
            txHash: result.transactionHash,
            isFirstDeposit: true,
            message: autoInv.message
          });
          setShowSuccessModal(true);
          
          // Scroll to top so modal is fully visible
          window.scrollTo({ top: 0, behavior: 'smooth' });
          
          // Close invest form
          setShowInvestForm(false);
          setSelectedPlan(null);
          setAmount('');
          
          console.log('First deposit auto investment created');
        } else {
          // Not first deposit - need to create investment manually
          await new Promise(resolve => setTimeout(resolve, 500));

          // Create investment record - using recovered token
          const investRes = await fetch(`${API_URL}/api/investments`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${recoveredToken}`
            },
            body: JSON.stringify({
              plan_id: selectedPlan.id,
              amount: parseFloat(amount)
            })
          });

          if (!investRes.ok) {
            const errData = await investRes.json();
            console.error('Investment creation failed:', errData);
            toast.error(`Investment failed: ${errData.detail || 'Unknown error'}. Please contact support.`);
          } else {
            const investData = await investRes.json();
            console.log('Investment created successfully');
            
            // Show Success Modal
            setSuccessData({
              amount: parseFloat(amount),
              planName: selectedPlan.name,
              dailyROI: selectedPlan.dailyROI,
              txHash: result.transactionHash
            });
            setShowSuccessModal(true);
            
            // Scroll to top so modal is fully visible
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Close invest form
            setShowInvestForm(false);
            setSelectedPlan(null);
            setAmount('');
          }
        }

        // Refresh data WITHOUT causing logout - use try-catch
        try {
          await fetchUserData();
        } catch (e) {
          console.log('Data refresh failed, but transaction complete');
        }
      }
    } catch (err) {
      console.error('Deposit error:', err);
      setTxStatus('error');
      
      if (err.code === 4001) {
        toast.error('Transaction rejected by user');
      } else {
        toast.error(err.message || 'Transaction failed');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Withdraw to Balance (Claim ROI)
  const handleWithdrawToBalance = async (investmentId, pendingAmount) => {
    if (pendingAmount <= 0) {
      toast('⏰ Already claimed! Next claim after 12:00 AM IST', {
        duration: 4000,
        icon: '⚠️',
        style: {
          background: '#1a1a1a',
          color: '#FFD700',
          border: '1px solid rgba(255, 215, 0, 0.5)',
        },
      });
      return;
    }

    const authToken = tokenManager.get();
    if (!authToken) {
      toast.error('Session expired. Please login again.');
      return;
    }

    const loadingToast = toast.loading('Processing withdrawal...');

    try {
      const response = await fetch(`${API_URL}/api/investments/${investmentId}/withdraw-roi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        toast.dismiss(loadingToast);
        toast.success(`✅ $${pendingAmount.toFixed(2)} transferred to your balance!`, {
          duration: 5000,
          icon: '💵',
        });
        await fetchUserData();
        await refreshUser();
      } else {
        const error = await response.json();
        toast.dismiss(loadingToast);
        toast.error(error.detail || 'Withdraw failed');
      }
    } catch (error) {
      console.error('Withdraw error:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to withdraw. Please try again.');
    }
  };

  // Handle Withdraw ALL ROI from ALL slabs at once
  const handleWithdrawAll = async () => {
    const authToken = tokenManager.get();
    if (!authToken) {
      toast.error('Session expired. Please login again.');
      return;
    }

    // Calculate total pending ROI from all active investments
    const totalPending = activeInvestments
      .filter(inv => inv.status === 'active')
      .reduce((sum, inv) => sum + (inv.pending_roi || 0), 0);

    if (totalPending <= 0) {
      toast('⏰ No ROI to withdraw! Next ROI after 12:00 AM IST', {
        duration: 4000,
        icon: '⚠️',
        style: {
          background: '#1a1a1a',
          color: '#FFD700',
          border: '1px solid rgba(255, 215, 0, 0.5)',
        },
      });
      return;
    }

    const loadingToast = toast.loading('Withdrawing from all slabs...');

    try {
      // Call withdraw for each active investment with pending ROI
      const withdrawPromises = activeInvestments
        .filter(inv => inv.status === 'active' && (inv.pending_roi || 0) > 0)
        .map(inv => 
          fetch(`${API_URL}/api/investments/${inv.id}/withdraw-roi`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            }
          })
        );

      const results = await Promise.allSettled(withdrawPromises);
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value.ok).length;

      toast.dismiss(loadingToast);
      
      if (successCount > 0) {
        toast.success(`✅ $${totalPending.toFixed(2)} withdrawn from ${successCount} slab(s)!`, {
          duration: 5000,
          icon: '💵',
        });
        await fetchUserData();
        await refreshUser();
      } else {
        toast.error('Withdrawal failed. Please try again.');
      }
    } catch (error) {
      console.error('Withdraw all error:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to withdraw. Please try again.');
    }
  };

  // Handle Re-Compound (Creates NEW investment)
  const handleCompound = async (investmentId, pendingAmount) => {
    if (pendingAmount < 1) {
      if (pendingAmount <= 0) {
        toast('⏰ No ROI to compound! Next ROI after 12:00 AM IST', {
          duration: 4000,
          icon: '⚠️',
          style: {
            background: '#1a1a1a',
            color: '#FFD700',
            border: '1px solid rgba(255, 215, 0, 0.5)',
          },
        });
      } else {
        toast.error(`Minimum $1 required. Current: $${pendingAmount.toFixed(2)}`);
      }
      return;
    }

    const authToken = tokenManager.get();
    if (!authToken) {
      toast.error('Session expired. Please login again.');
      return;
    }

    const loadingToast = toast.loading('Creating new investment...');

    try {
      const response = await fetch(`${API_URL}/api/investments/${investmentId}/compound`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        toast.dismiss(loadingToast);
        toast.success(`🎉 New investment created with $${pendingAmount.toFixed(2)}!`, {
          duration: 5000,
          icon: '✨',
        });
        await fetchUserData();
        await refreshUser();
      } else {
        const error = await response.json();
        toast.dismiss(loadingToast);
        toast.error(error.detail || 'Compound failed');
      }
    } catch (error) {
      console.error('Compound error:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to compound. Please try again.');
    }
  };

  // Handle Invest with Available Balance
  const handleInvestWithBalance = async () => {
    const amountNum = parseFloat(amount);
    
    // FIRST DEPOSIT CHECK: Minimum $3 for first time users
    const isFirstDeposit = !user?.first_investment_done;
    if (isFirstDeposit && amountNum < 3) {
      toast.error('First investment must be minimum $3. This will be combined with your $2 welcome bonus to create a $5 investment slab.');
      return;
    }
    
    if (amountNum < selectedPlan.minInvestment || amountNum > selectedPlan.maxInvestment) {
      toast.error(`Amount must be between $${selectedPlan.minInvestment} and $${selectedPlan.maxInvestment.toLocaleString()}`);
      return;
    }

    // Total available = balance + welcome_bonus
    const totalAvailable = (user?.balance || 0) + (user?.welcome_bonus || 0);
    
    if (amountNum > totalAvailable) {
      toast.error('Insufficient available balance!');
      return;
    }

    // Use tokenManager for bulletproof token retrieval
    const authToken = tokenManager.get();
    if (!authToken) {
      toast.error('Session expired. Please login again.');
      window.location.href = '/login';
      return;
    }

    setIsProcessing(true);
    const loadingToast = toast.loading('Creating investment from balance...');

    try {
      const response = await fetch(`${API_URL}/api/investments/from-balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          plan_id: selectedPlan.id,
          amount: amountNum
        })
      });

      if (response.ok) {
        const investData = await response.json();
        toast.dismiss(loadingToast);
        
        // Show Success Modal
        setSuccessData({
          amount: amountNum,
          planName: selectedPlan.name,
          dailyROI: selectedPlan.dailyROI,
          txHash: null // No tx hash for balance investments
        });
        setShowSuccessModal(true);
        
        // Scroll to top so modal is fully visible
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        setTxStatus('success');
        
        // CRITICAL: Refresh user data to update wallet balance in UI
        try {
          await refreshUser();
          await fetchUserData();
        } catch (e) {
          console.log('Data refresh failed');
        }
        
        setShowInvestForm(false);
        setSelectedPlan(null);
        setAmount('');
      } else {
        const error = await response.json();
        toast.dismiss(loadingToast);
        toast.error(error.detail || 'Investment failed');
        setTxStatus('error');
      }
    } catch (error) {
      console.error('Invest from balance error:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to create investment. Please try again.');
      setTxStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateReturns = () => {
    if (!amount || !selectedPlan) return null;
    const dailyEarning = (parseFloat(amount) * selectedPlan.dailyROI) / 100;
    const totalEarning = dailyEarning * 20;
    // Principal is returned daily in ROI (5% principal + 0.5% profit), NOT separately
    const totalReturn = totalEarning; // Only ROI, no separate principal
    return { dailyEarning, totalEarning, totalReturn };
  };

  const returns = calculateReturns();

  return (
    <div style={{...styles.page, background: colors.background}}>
      <Header />
      
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.pageHeader}>
          <h1 style={{...styles.pageTitle, color: colors.text}}>Trading Slab</h1>
          <p style={{...styles.pageSubtitle, color: colors.textSecondary}}>Choose your trading slab and start earning daily ROI</p>
        </div>

        {/* MY WALLET Card - Cinematic Design */}
        <div style={{
          background: isDark 
            ? 'linear-gradient(135deg, #0a1f1a 0%, #0d2818 50%, #142e1f 100%)' 
            : 'linear-gradient(135deg, #0d4f3c 0%, #0ECB81 50%, #00E5A0 100%)',
          border: isDark ? '2px solid rgba(14, 203, 129, 0.5)' : '3px solid rgba(255, 255, 255, 0.5)',
          borderRadius: '24px',
          padding: '28px',
          marginBottom: '24px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: isDark 
            ? '0 10px 40px rgba(14, 203, 129, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
            : '0 15px 50px rgba(14, 203, 129, 0.4), 0 5px 15px rgba(0, 0, 0, 0.2)',
        }}>
          {/* Background Glow Effect */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '200px',
            height: '200px',
            background: isDark 
              ? 'radial-gradient(circle, rgba(14, 203, 129, 0.3) 0%, transparent 70%)' 
              : 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }} />
          
          {/* Wallet Icon & Title */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '20px',
            position: 'relative',
            zIndex: 1,
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: isDark 
                ? 'linear-gradient(135deg, #0ECB81 0%, #00E5A0 100%)' 
                : 'linear-gradient(135deg, #fff 0%, #f0f0f0 100%)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isDark 
                ? '0 8px 25px rgba(14, 203, 129, 0.4)' 
                : '0 8px 20px rgba(0, 0, 0, 0.2)',
            }}>
              <Wallet size={32} color={isDark ? '#000' : '#0d4f3c'} />
            </div>
            <div>
              <span style={{
                fontSize: '13px', 
                color: isDark ? '#0ECB81' : 'rgba(255, 255, 255, 0.9)', 
                display: 'block', 
                fontWeight: 700,
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}>💰 MY WALLET</span>
              <span style={{
                fontSize: '36px', 
                fontWeight: 800, 
                color: isDark ? '#fff' : '#fff',
                textShadow: isDark ? '0 0 20px rgba(14, 203, 129, 0.5)' : '0 2px 10px rgba(0, 0, 0, 0.3)',
              }}>${(user?.balance || 0).toFixed(2)}</span>
            </div>
          </div>
          
          {/* Welcome Bonus Badge */}
          {(user?.welcome_bonus || 0) > 0 && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, rgba(255, 105, 180, 0.2) 0%, rgba(255, 182, 193, 0.2) 100%)',
              border: '2px solid #FF69B4',
              borderRadius: '12px',
              padding: '10px 16px',
              marginBottom: '16px',
            }}>
              <span style={{fontSize: '18px'}}>🎁</span>
              <span style={{color: '#FF69B4', fontWeight: 700, fontSize: '14px'}}>
                Welcome Bonus: ${(user?.welcome_bonus || 0).toFixed(2)}
              </span>
            </div>
          )}
          
          {/* Tip to deposit - Cinematic */}
          <div style={{
            background: isDark 
              ? 'linear-gradient(90deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 152, 0, 0.1) 100%)' 
              : 'rgba(0, 0, 0, 0.2)',
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: isDark ? '1px solid rgba(255, 215, 0, 0.3)' : '2px solid rgba(255, 255, 255, 0.4)',
            position: 'relative',
            zIndex: 1,
          }}>
            <span style={{
              fontSize: '13px',
              color: isDark ? '#FFD700' : '#fff',
              fontWeight: 600,
            }}>
              💸 Add funds via Web3 Wallet
            </span>
            <button 
              onClick={() => navigate('/wallet')}
              style={{
                background: isDark ? '#FFD700' : '#fff',
                color: isDark ? '#000' : '#0d4f3c',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              }}
            >
              Go to Wallet →
            </button>
          </div>
        </div>

        {/* Transaction Status */}
        {txStatus && (
          <div style={{
            ...styles.txStatusCard,
            borderColor: txStatus === 'success' ? '#00FF00' : txStatus === 'error' ? '#FF6464' : '#FFD700',
          }}>
            {txStatus === 'pending' && (
              <>
                <Loader size={24} color="#FFD700" className="spin" />
                <div style={styles.txStatusInfo}>
                  <span style={styles.txStatusTitle}>Transaction Processing...</span>
                  <span style={styles.txStatusDesc}>Please confirm in your wallet</span>
                </div>
              </>
            )}
            {txStatus === 'success' && (
              <>
                <CheckCircle size={24} color="#00FF00" />
                <div style={styles.txStatusInfo}>
                  <span style={styles.txStatusTitle}>Investment Successful!</span>
                  <a 
                    href={`https://bsctrace.com/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.txLink}
                  >
                    View on BSCScan →
                  </a>
                </div>
              </>
            )}
            {txStatus === 'error' && (
              <>
                <AlertCircle size={24} color="#FF6464" />
                <div style={styles.txStatusInfo}>
                  <span style={styles.txStatusTitle}>Transaction Failed</span>
                  <span style={styles.txStatusDesc}>Please try again</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Investment Packages - Separate Cards */}
        <div style={styles.packagesSection}>
          {investmentPlans.map((plan, index) => (
            <div 
              key={plan.id} 
              style={{
                background: isDark ? 'linear-gradient(180deg, #0a0a0a 0%, #121212 100%)' : colors.cardBg,
                border: selectedPlan?.id === plan.id ? '2px solid #FFD700' : `2px solid ${colors.accent}`,
                borderRadius: '24px',
                padding: '28px 24px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: selectedPlan?.id === plan.id ? '0 0 40px rgba(255, 215, 0, 0.3)' : `0 0 20px ${colors.accent}20`,
                transition: 'all 0.3s ease',
              }}
            >
              {/* BNB Background Watermark - Cinematic */}
              <div style={styles.bnbWatermark} className="bnb-cinematic">
                <svg viewBox="0 0 126.61 126.61" style={{width: '100%', height: '100%'}}>
                  <path fill="#F3BA2F" opacity="0.15" d="M38.73 53.2l24.59-24.58 24.6 24.6 14.3-14.31L63.32 0l-38.9 38.9zM0 63.31l14.3-14.31 14.31 14.31-14.31 14.3zM38.73 73.41l24.59 24.59 24.6-24.6 14.31 14.29-38.9 38.91-38.91-38.88zM97.99 63.31l14.3-14.31 14.32 14.31-14.31 14.3z"/>
                  <path fill="#F3BA2F" opacity="0.15" d="M77.83 63.3l-14.51-14.52-10.73 10.73-1.24 1.23-2.54 2.54 14.51 14.5 14.51-14.47z"/>
                </svg>
              </div>

              {/* Card Header with USDT Icon */}
              <div style={styles.packageHeader}>
                <div style={styles.usdtIcon}>
                  <svg viewBox="0 0 32 32" style={{width: '28px', height: '28px'}}>
                    <circle cx="16" cy="16" r="16" fill="#26A17B"/>
                    <path fill="#fff" d="M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.658 0-.809 2.902-1.486 6.79-1.66v2.644c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.925-.06v-2.643c3.88.173 6.775.85 6.775 1.658 0 .81-2.895 1.485-6.775 1.657m0-3.59v-2.366h5.414V7.819H8.595v3.608h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.118 0 1.044 3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.116 0-1.043-3.301-1.914-7.694-2.117"/>
                  </svg>
                </div>
                <div style={styles.packageTitleSection}>
                  <span style={{...styles.packageTier, color: colors.textSecondary}}>TRADING SLAB {['ONE', 'TWO', 'THREE', 'FOUR'][index]}</span>
                  <div style={styles.packageRange}>
                    <span style={{...styles.packageMin, color: colors.accent}}>${plan.minInvestment}</span>
                    <span style={{...styles.packageMax, color: colors.textSecondary}}> - ${plan.maxInvestment.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Package Details */}
              <div style={styles.packageDetails}>
                <div style={styles.packageRow}>
                  <span style={{...styles.packageLabel, color: colors.textSecondary}}>Daily ROI</span>
                  <span style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: isDark ? '#FFD700' : '#E65100',
                    textShadow: isDark ? '0 0 10px rgba(255, 215, 0, 0.4)' : 'none',
                  }}>{plan.dailyROI}%</span>
                </div>
                <div style={{...styles.packageDivider, background: isDark ? 'rgba(255, 215, 0, 0.15)' : `${colors.accent}30`}}></div>
                <div style={styles.packageRow}>
                  <span style={{...styles.packageLabel, color: colors.textSecondary}}>Duration</span>
                  <span style={{...styles.packageValue, color: colors.text}}>{plan.duration} days</span>
                </div>
                <div style={{...styles.packageDivider, background: isDark ? 'rgba(255, 215, 0, 0.15)' : `${colors.accent}30`}}></div>
                <div style={styles.packageRow}>
                  <span style={{...styles.packageLabel, color: colors.textSecondary}}>Total ROI</span>
                  <span style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: isDark ? '#FFD700' : '#E65100',
                    textShadow: isDark ? '0 0 10px rgba(255, 215, 0, 0.4)' : 'none',
                  }}>{plan.totalReturn}.0%</span>
                </div>
              </div>

              {/* Inline Investment Form - Shows when this plan is selected */}
              {selectedPlan?.id === plan.id && showInvestForm ? (
                <div style={{
                  ...styles.inlineInvestForm,
                  background: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.95)',
                  borderTop: `1px solid ${colors.cardBorder}`,
                }}>
                  <div style={{...styles.inlineFormDivider, background: colors.cardBorder}}></div>
                  
                  {/* First Deposit Info Banner */}
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
                        <div style={{ color: '#FFD700', fontSize: '14px', fontWeight: 700 }}>
                          First Deposit: Minimum $3
                        </div>
                        <div style={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#666', fontSize: '12px' }}>
                          $3 + $2 Welcome Bonus = $5 Investment Slab Auto-Created!
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div style={styles.inputGroup}>
                    <label style={{...styles.inputLabel, color: colors.text}}>
                      Amount (USDT) - Min: ${!user?.first_investment_done ? '3 (First Deposit)' : plan.minInvestment}, Max: ${plan.maxInvestment.toLocaleString()}
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={`$${!user?.first_investment_done ? '3' : plan.minInvestment} - $${plan.maxInvestment.toLocaleString()}`}
                      style={{
                        ...styles.input,
                        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        color: colors.text,
                        borderColor: colors.cardBorder,
                      }}
                      min={!user?.first_investment_done ? 3 : plan.minInvestment}
                      max={plan.maxInvestment}
                    />
                    {/* First Deposit Validation Message */}
                    {!user?.first_investment_done && amount && parseFloat(amount) < 3 && (
                      <div style={{...styles.validationError, background: 'rgba(255, 107, 107, 0.1)', padding: '8px 12px', borderRadius: '8px', marginTop: '8px'}}>
                        ⚠️ First deposit minimum $3 required (Your $3 + $2 bonus = $5 slab)
                      </div>
                    )}
                    {/* Regular Validation Message */}
                    {amount && (parseFloat(amount) < plan.minInvestment || parseFloat(amount) > plan.maxInvestment) && (user?.first_investment_done || parseFloat(amount) >= 3) && (
                      <div style={styles.validationError}>
                        Amount must be between ${plan.minInvestment} and ${plan.maxInvestment.toLocaleString()}
                      </div>
                    )}
                    {/* MAX Button - Only Balance */}
                    <div style={styles.maxBtnRow}>
                      <button 
                        onClick={() => {
                          const maxAllowed = Math.min((user?.balance || 0) + (user?.welcome_bonus || 0), plan.maxInvestment);
                          setAmount(maxAllowed.toString());
                        }}
                        style={styles.maxBtnBalance}
                      >
                        MAX Balance: ${((user?.balance || 0) + (user?.welcome_bonus || 0)).toFixed(2)}
                      </button>
                    </div>
                  </div>

                  {/* Returns Preview */}
                  {amount && parseFloat(amount) >= plan.minInvestment && parseFloat(amount) <= plan.maxInvestment && (
                    <div style={{
                      ...styles.inlineReturnsBox,
                      background: isDark ? 'rgba(14,203,129,0.1)' : `${colors.accent}10`,
                      border: `1px solid ${colors.accent}40`,
                    }}>
                      <div style={{...styles.returnRow, color: colors.text}}>
                        <span style={{color: colors.textSecondary}}>Daily Earning:</span>
                        <span style={{...styles.returnValue, color: colors.accent}}>${(parseFloat(amount) * plan.dailyROI / 100).toFixed(2)}</span>
                      </div>
                      <div style={{...styles.returnRow, ...styles.returnTotal, borderColor: colors.cardBorder}}>
                        <span style={{color: colors.text}}>Total Return ({plan.duration} days):</span>
                        <span style={{...styles.returnValueBig, color: isDark ? '#FFD700' : '#E65100'}}>${(parseFloat(amount) * plan.dailyROI / 100 * plan.duration).toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {/* Payment Method - ONLY Balance Option (Web3 Deposit is on Wallet page) */}
                  <div style={styles.paymentMethodSection}>
                    <span style={{...styles.paymentMethodLabel, color: colors.text}}>Payment Method:</span>
                    <div style={{
                      background: `${colors.accent}15`,
                      border: `2px solid ${colors.accent}`,
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <DollarSign size={22} color={colors.accent} />
                        <div>
                          <span style={{color: colors.accent, fontWeight: 700, fontSize: '15px'}}>My Wallet</span>
                          <span style={{color: colors.textSecondary, fontSize: '12px', display: 'block'}}>From earnings & deposits</span>
                        </div>
                      </div>
                      <span style={{color: colors.accent, fontWeight: 700, fontSize: '18px'}}>${(user?.balance || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Invest Button - ONLY Balance option */}
                  {(() => {
                    const amountNum = parseFloat(amount) || 0;
                    const isFirstDeposit = !user?.first_investment_done;
                    const minRequired = isFirstDeposit ? 3 : plan.minInvestment;
                    const isValidAmount = amountNum >= minRequired && amountNum <= plan.maxInvestment;
                    const totalAvailable = (user?.balance || 0) + (user?.welcome_bonus || 0);
                    const canInvest = amount && isValidAmount && !isProcessing && amountNum <= totalAvailable;
                    
                    return (
                      <button
                        onClick={handleInvestWithBalance}
                        disabled={!canInvest}
                        style={{
                          ...styles.investBtnGreen,
                          opacity: canInvest ? 1 : 0.5,
                          cursor: canInvest ? 'pointer' : 'not-allowed',
                        }}
                      >
                        {isProcessing ? (
                          <>
                            <Loader size={20} className="spin" />
                            Processing...
                          </>
                        ) : amountNum > totalAvailable ? (
                          <>Insufficient Balance</>
                        ) : isFirstDeposit && amountNum < 3 ? (
                          <>First Investment Min $3 Required</>
                        ) : !isValidAmount && amount ? (
                          <>Invalid Amount</>
                        ) : (
                          <>
                            <DollarSign size={20} />
                            Pay ${amount || '0'} from Balance
                          </>
                        )}
                      </button>
                    );
                  })()}

                  {/* Cancel Button */}
                  <button 
                    style={styles.cancelBtn}
                    onClick={() => {
                      setShowInvestForm(false);
                      setSelectedPlan(null);
                      setAmount('');
                      setPaymentMethod('wallet');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                /* Invest Now Button - Shows when this plan is NOT selected */
                <button 
                  style={styles.investNowBtn}
                  onClick={() => handleInvestNow(plan)}
                >
                  Invest Now
                  <ChevronRight size={20} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Link to My Investments Page */}
        {token && (
          <div style={styles.viewInvestmentsLink}>
            <a href="/my-investments" style={styles.viewInvestmentsBtn}>
              <TrendingUp size={18} />
              View My Investments ({activeInvestments.length})
              <ChevronRight size={18} />
            </a>
          </div>
        )}

      </div>

      {/* SUCCESS MODAL - Shows after successful investment */}
      {showSuccessModal && successData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: isDark ? 'linear-gradient(180deg, #0a1a0a 0%, #0d1f0d 100%)' : '#FFFFFF',
            border: '3px solid #00FF88',
            borderRadius: '24px',
            padding: '32px 24px',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 0 60px rgba(0, 255, 136, 0.4)',
            animation: 'modalPop 0.4s ease-out'
          }}>
            {/* Success Icon */}
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #00FF88 0%, #00D4AA 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 0 30px rgba(0, 255, 136, 0.5)'
            }}>
              <CheckCircle size={48} color="#FFFFFF" />
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#00FF88',
              margin: '0 0 8px 0',
              textShadow: '0 0 20px rgba(0, 255, 136, 0.5)'
            }}>
              {successData.isFirstDeposit ? '🎉 Welcome to Trade Genius!' : 'Investment Successful!'}
            </h2>

            <p style={{
              fontSize: '16px',
              color: isDark ? 'rgba(255,255,255,0.7)' : '#666',
              margin: '0 0 24px 0'
            }}>
              {successData.isFirstDeposit 
                ? 'Your first investment slab has been auto-created with welcome bonus!' 
                : 'Your new trading slab has been created'}
            </p>

            {/* First Deposit Bonus Badge */}
            {successData.isFirstDeposit && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 152, 0, 0.2) 100%)',
                border: '2px solid #FFD700',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '24px' }}>🎁</span>
                <span style={{ color: '#FF69B4', fontSize: '14px', fontWeight: 600 }}>
                  $2 Welcome Bonus Applied!
                </span>
              </div>
            )}

            {/* Investment Details */}
            <div style={{
              background: isDark ? 'rgba(0, 255, 136, 0.1)' : 'rgba(0, 200, 83, 0.1)',
              border: `1px solid ${isDark ? 'rgba(0, 255, 136, 0.3)' : '#00C853'}`,
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#666', fontSize: '14px' }}>Amount Invested</span>
                <span style={{ color: '#00FF88', fontSize: '18px', fontWeight: 700 }}>${successData.amount}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#666', fontSize: '14px' }}>Plan</span>
                <span style={{ color: isDark ? '#FFFFFF' : '#333', fontSize: '14px', fontWeight: 600 }}>{successData.planName}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#666', fontSize: '14px' }}>Daily ROI</span>
                <span style={{ color: '#FF69B4', fontSize: '14px', fontWeight: 600 }}>{successData.dailyROI}%</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#666', fontSize: '14px' }}>Duration</span>
                <span style={{ color: isDark ? '#FFFFFF' : '#333', fontSize: '14px', fontWeight: 600 }}>20 Days</span>
              </div>
            </div>

            {/* Expected Returns - Only ROI (Principal returns daily in ROI, not separately) */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 105, 180, 0.15) 0%, rgba(255, 20, 147, 0.15) 100%)',
              border: '1px solid rgba(255, 105, 180, 0.4)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#666', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                Expected Total Return
              </span>
              <span style={{ color: '#FF69B4', fontSize: '24px', fontWeight: 700 }}>
                ${(successData.amount * successData.dailyROI / 100 * 20).toFixed(2)}
              </span>
            </div>

            {/* TX Hash */}
            {successData.txHash && (
              <div style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px',
                wordBreak: 'break-all'
              }}>
                <span style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#999', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                  Transaction Hash
                </span>
                <span style={{ color: isDark ? 'rgba(255,255,255,0.8)' : '#333', fontSize: '11px' }}>
                  {successData.txHash.slice(0, 20)}...{successData.txHash.slice(-10)}
                </span>
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={() => {
                setShowSuccessModal(false);
                setSuccessData(null);
                setTxStatus(null);
              }}
              style={{
                background: 'linear-gradient(135deg, #00FF88 0%, #00D4AA 100%)',
                color: '#000000',
                border: 'none',
                padding: '16px 40px',
                fontSize: '16px',
                fontWeight: 700,
                borderRadius: '12px',
                cursor: 'pointer',
                width: '100%',
                boxShadow: '0 4px 20px rgba(0, 255, 136, 0.4)'
              }}
            >
              Continue Trading
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
        @keyframes modalPop {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
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
    padding: '100px 16px 60px',
    maxWidth: '100%',
    margin: '0 auto',
  },
  pageHeader: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  pageTitle: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#FFFFFF',
    marginBottom: '8px',
  },
  pageSubtitle: {
    fontSize: '15px',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  
  // View Investments Link
  viewInvestmentsLink: {
    marginTop: '20px',
    marginBottom: '20px',
  },
  viewInvestmentsBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    padding: '16px 20px',
    background: 'linear-gradient(135deg, #0ECB81 0%, #0A9F65 100%)',
    border: 'none',
    borderRadius: '14px',
    color: '#FFF',
    fontSize: '15px',
    fontWeight: 600,
    textDecoration: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(14, 203, 129, 0.3)',
  },

  // Wallet Card
  walletCard: {
    background: 'linear-gradient(180deg, #0d0d0d 0%, #151515 100%)',
    border: '2px solid rgba(255, 215, 0, 0.5)',
    borderRadius: '20px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  walletIconWrapper: {
    width: '56px',
    height: '56px',
    background: 'rgba(255, 215, 0, 0.15)',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletInfo: {
    flex: 1,
    minWidth: '140px',
  },
  walletLabel: {
    display: 'block',
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: '1px',
    marginBottom: '4px',
  },
  walletDesc: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  connectBtn: {
    background: '#FFD700',
    color: '#000000',
    border: 'none',
    padding: '14px 28px',
    fontSize: '15px',
    fontWeight: 600,
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  // Balance Card
  balanceCard: {
    background: 'linear-gradient(180deg, #0d0d0d 0%, #151515 100%)',
    border: '2px solid rgba(255, 215, 0, 0.5)',
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '20px',
  },
  balanceRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px',
  },
  balanceItem: {
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '16px',
    borderRadius: '12px',
  },
  balanceHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  usdtLogoSmall: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(38, 161, 123, 0.2)',
  },
  bnbLogoSmall: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(243, 186, 47, 0.2)',
  },
  balanceLabel: {
    display: 'block',
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: '1px',
    marginBottom: '6px',
  },
  balanceLabelUsdt: {
    fontSize: '11px',
    color: 'rgba(38, 161, 123, 0.8)',
    letterSpacing: '1px',
    fontWeight: 500,
  },
  balanceLabelBnb: {
    fontSize: '11px',
    color: 'rgba(243, 186, 47, 0.8)',
    letterSpacing: '1px',
    fontWeight: 500,
  },
  balanceValue: {
    display: 'block',
    fontSize: '22px',
    fontWeight: 700,
    color: '#FFD700',
  },
  balanceValueUsdt: {
    display: 'block',
    fontSize: '22px',
    fontWeight: 700,
    color: '#0ECB81',
  },
  balanceValueBnb: {
    display: 'block',
    fontSize: '22px',
    fontWeight: 700,
    color: '#F3BA2F',
  },
  disconnectBtn: {
    background: 'transparent',
    color: 'rgba(255, 255, 255, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '10px 20px',
    fontSize: '14px',
    borderRadius: '8px',
    cursor: 'pointer',
    width: '100%',
  },

  // Available Balance Card (Earnings)
  availableBalanceCard: {
    background: 'linear-gradient(180deg, #0d0d0d 0%, #151515 100%)',
    border: '2px solid rgba(14, 203, 129, 0.5)',
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '20px',
  },
  balanceLabelEarnings: {
    fontSize: '11px',
    color: 'rgba(14, 203, 129, 0.8)',
    letterSpacing: '1px',
    fontWeight: 500,
  },
  balanceValueEarnings: {
    display: 'block',
    fontSize: '22px',
    fontWeight: 700,
    color: '#0ECB81',
  },
  earningsLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontSize: '12px',
    color: 'rgba(14, 203, 129, 0.7)',
    marginTop: '8px',
  },

  // Transaction Status
  txStatusCard: {
    background: 'rgba(0, 0, 0, 0.5)',
    border: '2px solid',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  txStatusInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  txStatusTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#FFFFFF',
  },
  txStatusDesc: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  txLink: {
    fontSize: '14px',
    color: '#FFD700',
    textDecoration: 'none',
  },

  // Inline Investment Form (inside each slab)
  inlineInvestForm: {
    marginTop: '20px',
    paddingTop: '20px',
    position: 'relative',
    zIndex: 1,
  },
  inlineFormDivider: {
    height: '1px',
    background: 'rgba(255, 215, 0, 0.3)',
    marginBottom: '20px',
  },
  inlineReturnsBox: {
    background: 'rgba(255, 215, 0, 0.08)',
    border: '1px solid rgba(255, 215, 0, 0.3)',
    borderRadius: '12px',
    padding: '14px',
    marginBottom: '16px',
  },
  cancelBtn: {
    background: 'transparent',
    color: 'rgba(255, 255, 255, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '14px',
    fontSize: '14px',
    fontWeight: 500,
    borderRadius: '12px',
    cursor: 'pointer',
    width: '100%',
    marginTop: '10px',
  },

  // Investment Form (OLD - keeping for reference)
  investFormCard: {
    background: 'linear-gradient(180deg, #0d0d0d 0%, #151515 100%)',
    border: '2px solid rgba(255, 215, 0, 0.6)',
    borderRadius: '20px',
    padding: '28px 24px',
    marginBottom: '30px',
    boxShadow: '0 0 30px rgba(255, 215, 0, 0.2)',
  },
  investFormHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  investFormTitle: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#FFD700',
    margin: 0,
  },
  closeFormBtn: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px 8px',
  },
  selectedPlanInfo: {
    background: 'rgba(255, 215, 0, 0.08)',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '20px',
  },
  selectedPlanRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '15px',
    color: 'rgba(255, 255, 255, 0.8)',
    padding: '6px 0',
  },
  highlight: {
    color: '#FFD700',
    fontWeight: 600,
  },
  inputGroup: {
    marginBottom: '20px',
  },
  inputLabel: {
    display: 'block',
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '8px',
  },
  input: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '2px solid rgba(255, 215, 0, 0.3)',
    borderRadius: '12px',
    padding: '16px',
    fontSize: '18px',
    color: '#FFFFFF',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
  },
  validationError: {
    color: '#FF4444',
    fontSize: '12px',
    marginTop: '8px',
    padding: '8px 12px',
    background: 'rgba(255, 68, 68, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 68, 68, 0.3)',
  },
  maxBtn: {
    background: 'transparent',
    border: 'none',
    color: '#FFD700',
    fontSize: '13px',
    cursor: 'pointer',
    marginTop: '8px',
    padding: 0,
  },
  maxBtnRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '8px',
    flexWrap: 'wrap',
  },
  maxBtnWallet: {
    background: 'rgba(255, 215, 0, 0.1)',
    border: '1px solid rgba(255, 215, 0, 0.3)',
    color: '#FFD700',
    fontSize: '11px',
    cursor: 'pointer',
    padding: '6px 10px',
    borderRadius: '6px',
  },
  maxBtnBalance: {
    background: 'rgba(14, 203, 129, 0.1)',
    border: '1px solid rgba(14, 203, 129, 0.3)',
    color: '#0ECB81',
    fontSize: '11px',
    cursor: 'pointer',
    padding: '6px 10px',
    borderRadius: '6px',
  },
  // Payment Method Selection
  paymentMethodSection: {
    marginTop: '16px',
    marginBottom: '16px',
  },
  paymentMethodLabel: {
    display: 'block',
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '10px',
    letterSpacing: '0.5px',
  },
  paymentMethodRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  paymentMethodBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '2px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '12px',
    padding: '14px 10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '12px',
    transition: 'all 0.3s ease',
  },
  paymentMethodBtnActive: {
    background: 'rgba(255, 215, 0, 0.15)',
    border: '2px solid #FFD700',
    color: '#FFD700',
  },
  paymentMethodBtnActiveGreen: {
    background: 'rgba(14, 203, 129, 0.15)',
    border: '2px solid #0ECB81',
    color: '#0ECB81',
  },
  paymentMethodBalance: {
    fontSize: '14px',
    fontWeight: 700,
  },
  investBtnGreen: {
    background: '#0ECB81',
    color: '#000000',
    border: 'none',
    padding: '18px',
    fontSize: '16px',
    fontWeight: 700,
    borderRadius: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
  },
  returnsBox: {
    background: 'rgba(255, 215, 0, 0.08)',
    border: '1px solid rgba(255, 215, 0, 0.3)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '20px',
  },
  returnRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.8)',
    padding: '8px 0',
  },
  returnTotal: {
    borderTop: '1px solid rgba(255, 215, 0, 0.3)',
    marginTop: '8px',
    paddingTop: '12px',
  },
  returnValue: {
    color: '#FFFFFF',
    fontWeight: 500,
  },
  returnValueBig: {
    color: '#FFD700',
    fontWeight: 700,
    fontSize: '18px',
  },
  investBtn: {
    background: '#FFD700',
    color: '#000000',
    border: 'none',
    padding: '18px',
    fontSize: '16px',
    fontWeight: 700,
    borderRadius: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
  },

  // Packages Section
  packagesSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    marginBottom: '30px',
  },
  packageCard: {
    background: 'linear-gradient(180deg, #0a0a0a 0%, #121212 100%)',
    border: '2px solid rgba(255, 215, 0, 0.4)',
    borderRadius: '24px',
    padding: '28px 24px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 0 20px rgba(255, 215, 0, 0.1)',
    transition: 'all 0.3s ease',
  },
  packageCardSelected: {
    border: '2px solid #FFD700',
    boxShadow: '0 0 40px rgba(255, 215, 0, 0.3)',
  },
  packageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
  },
  ethIcon: {
    width: '52px',
    height: '52px',
    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 165, 0, 0.1) 100%)',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255, 215, 0, 0.3)',
  },
  bnbIcon: {
    width: '48px',
    height: '48px',
    background: 'rgba(243, 186, 47, 0.15)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(243, 186, 47, 0.3)',
  },
  usdtIcon: {
    width: '48px',
    height: '48px',
    background: 'rgba(38, 161, 123, 0.2)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(38, 161, 123, 0.4)',
    boxShadow: '0 0 15px rgba(38, 161, 123, 0.3)',
  },
  bnbWatermark: {
    position: 'absolute',
    top: '50%',
    right: '20px',
    transform: 'translateY(-50%)',
    width: '150px',
    height: '150px',
    pointerEvents: 'none',
    zIndex: 0,
  },
  usdtWatermark: {
    position: 'absolute',
    top: '50%',
    right: '20px',
    transform: 'translateY(-50%)',
    width: '150px',
    height: '150px',
    pointerEvents: 'none',
    zIndex: 0,
  },
  ethSymbol: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#FFD700',
  },
  packageTitleSection: {
    flex: 1,
  },
  packageTier: {
    display: 'block',
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: '3px',
    marginBottom: '6px',
    fontWeight: 500,
  },
  packageRange: {
    display: 'flex',
    alignItems: 'baseline',
  },
  packageMin: {
    fontSize: '36px',
    fontWeight: 700,
    color: '#0ECB81',  // Green like Bitcoin price
  },
  packageMax: {
    fontSize: '18px',
    color: '#0ECB81',  // Green like Bitcoin price
    marginLeft: '6px',
    opacity: 0.8,
  },
  packageDetails: {
    marginBottom: '24px',
  },
  packageRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 0',
  },
  packageLabel: {
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  packageValue: {
    fontSize: '17px',
    fontWeight: 600,
    color: '#FFFFFF',
  },
  packageValueHighlight: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#FFD700',
    textShadow: '0 0 10px rgba(255, 215, 0, 0.4)',
  },
  packageDivider: {
    height: '1px',
    background: 'rgba(255, 215, 0, 0.15)',
  },
  investNowBtn: {
    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    color: '#000000',
    border: 'none',
    padding: '18px 24px',
    fontSize: '17px',
    fontWeight: 700,
    borderRadius: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    boxShadow: '0 4px 20px rgba(255, 215, 0, 0.3)',
    transition: 'all 0.3s ease',
  },

  // Platform Info
  platformInfo: {
    background: 'rgba(255, 255, 255, 0.02)',
    padding: '20px',
    borderRadius: '16px',
    textAlign: 'center',
  },
  platformLabel: {
    display: 'block',
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.4)',
    marginBottom: '12px',
  },
  platformRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  platformAddress: {
    fontSize: '11px',
    color: '#FFD700',
    fontFamily: 'monospace',
    wordBreak: 'break-all',
  },
  copyBtn: {
    background: 'rgba(255, 215, 0, 0.15)',
    border: '1px solid rgba(255, 215, 0, 0.3)',
    color: '#FFD700',
    padding: '8px 14px',
    fontSize: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },

  // Active Investments Section
  activeInvestmentsSection: {
    marginTop: '30px',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#FFFFFF',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  loadingBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '30px',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  investmentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  investmentCard: {
    background: 'linear-gradient(180deg, #0d0d0d 0%, #151515 100%)',
    border: '1px solid rgba(38, 161, 123, 0.3)',
    borderRadius: '16px',
    padding: '16px',
  },
  invHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '14px',
  },
  invIconWrapper: {
    width: '40px',
    height: '40px',
    background: 'rgba(38, 161, 123, 0.2)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  invInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  invPlanName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#FFFFFF',
  },
  invAmount: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#0ECB81',
  },
  invStatus: {
    textAlign: 'right',
  },
  invStatusActive: {
    fontSize: '10px',
    color: '#0ECB81',
    background: 'rgba(14, 203, 129, 0.15)',
    padding: '4px 10px',
    borderRadius: '10px',
    fontWeight: 600,
  },
  invProgress: {
    marginBottom: '14px',
  },
  progressBar: {
    height: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  progressBarOld: {
    height: '100%',
    background: 'linear-gradient(90deg, #0ECB81, #26A17B)',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  progressTextOld: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  earnedText: {
    color: '#0ECB81',
    fontWeight: 600,
  },
  invDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    paddingTop: '12px',
  },
  invDetailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  invDetailLabel: {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  invDetailValue: {
    fontSize: '13px',
    color: '#FFD700',
    fontWeight: 600,
  },
  emptyBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '14px',
  },
  emptySubtext: {
    fontSize: '12px',
    marginTop: '8px',
    color: 'rgba(255, 255, 255, 0.3)',
  },

  // Deposit History Section
  depositHistorySection: {
    marginTop: '20px',
    marginBottom: '20px',
  },
  depositsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  depositCard: {
    background: 'linear-gradient(180deg, #0d0d0d 0%, #151515 100%)',
    border: '1px solid rgba(38, 161, 123, 0.2)',
    borderRadius: '12px',
    padding: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  depLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  depIcon: {
    width: '36px',
    height: '36px',
    background: 'rgba(38, 161, 123, 0.2)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  depInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  depType: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#0ECB81',
  },
  depDate: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  depRight: {
    textAlign: 'right',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  depAmount: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#0ECB81',
  },
  depStatus: {
    fontSize: '10px',
    fontWeight: 600,
  },

  // Active Investment Card - Same style as Trading SLAB
  activePackageCard: {
    background: 'linear-gradient(180deg, #0d0d0d 0%, #151515 100%)',
    borderRadius: '20px',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
    border: '2px solid rgba(14, 203, 129, 0.3)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    marginBottom: '16px',
  },
  activeInvestAmount: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#0ECB81',
  },
  packageValueGreen: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#0ECB81',
  },
  activeProgressBar: {
    height: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '16px',
    marginBottom: '16px',
  },
  activeProgressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #0ECB81, #26A17B)',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  pendingRoiBox: {
    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 165, 0, 0.08) 100%)',
    border: '1px solid rgba(255, 215, 0, 0.4)',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  pendingRoiInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  pendingRoiLabel: {
    fontSize: '11px',
    color: 'rgba(255, 215, 0, 0.8)',
    letterSpacing: '1px',
  },
  pendingRoiAmount: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#FFD700',
  },
  claimableBadge: {
    fontSize: '12px',
    color: '#0ECB81',
    background: 'rgba(14, 203, 129, 0.2)',
    padding: '8px 16px',
    borderRadius: '20px',
    fontWeight: 600,
    border: '1px solid rgba(14, 203, 129, 0.3)',
  },
  activeActionBtns: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  compoundBtnNew: {
    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    color: '#000000',
    border: 'none',
    padding: '16px 20px',
    fontSize: '15px',
    fontWeight: 600,
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
  },
  withdrawBtnNew: {
    background: 'transparent',
    color: '#0ECB81',
    border: '2px solid #0ECB81',
    padding: '14px 20px',
    fontSize: '15px',
    fontWeight: 600,
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'all 0.3s ease',
  },
  minNoteNew: {
    fontSize: '11px',
    color: 'rgba(255, 215, 0, 0.7)',
    textAlign: 'center',
    display: 'block',
    marginTop: '8px',
    fontStyle: 'italic',
  },
  // Completed Investment Styles
  completedPackageCard: {
    border: '2px solid rgba(255, 68, 68, 0.4)',
    opacity: 0.85,
  },
  completeBadge: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'linear-gradient(135deg, #FF4444 0%, #CC0000 100%)',
    color: '#ffffff',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '1px',
    textTransform: 'uppercase',
    boxShadow: '0 4px 12px rgba(255, 68, 68, 0.4)',
    zIndex: 10,
  },
  completedMessage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '16px',
    background: 'rgba(255, 68, 68, 0.1)',
    border: '1px solid rgba(255, 68, 68, 0.3)',
    borderRadius: '12px',
    color: '#FF6666',
    fontSize: '13px',
    fontWeight: 500,
  },

  // View Investments Link
  viewInvestmentsLink: {
    marginTop: '30px',
    marginBottom: '20px',
  },
  viewInvestmentsBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    background: 'linear-gradient(135deg, #0ECB81 0%, #26A17B 100%)',
    border: 'none',
    borderRadius: '16px',
    color: '#000000',
    fontSize: '16px',
    fontWeight: 600,
    textDecoration: 'none',
    boxShadow: '0 4px 20px rgba(14, 203, 129, 0.3)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
};

export default Deposit;
