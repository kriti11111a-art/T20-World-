import React, { useState } from 'react';
import { DollarSign, Wallet, ArrowRight, Copy, ExternalLink, Link2, Lock, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import useWeb3 from '../hooks/useWeb3';
import { PLATFORM_WITHDRAWAL_WALLET } from '../config/web3Config';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Withdraw = () => {
  const { user, isAuthenticated, token, refreshUser } = useAuth();
  const { isDark, colors } = useTheme();
  const [amount, setAmount] = useState('');
  const [copied, setCopied] = useState(false);
  const [withdrawStatus, setWithdrawStatus] = useState(null); // 'pending', 'submitted', 'error'

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
    isMetaMaskInstalled
  } = useWeb3();

  const withdrawalFee = 5; // 5%
  
  // Use real user data from backend if logged in
  const availableBalance = user ? user.balance : 0;
  const totalInvested = user ? user.total_invested : 0;
  const totalEarnings = user ? user.total_earned : 0;

  const calculateNet = () => {
    if (!amount) return null;
    const fee = (parseFloat(amount) * withdrawalFee) / 100;
    const netAmount = parseFloat(amount) - fee;
    return { fee, netAmount };
  };

  const handleCopyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      toast.success('Wallet address copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error('Please connect your wallet first!');
      return;
    }

    if (parseFloat(amount) > availableBalance) {
      toast.error('Insufficient balance!');
      return;
    }
    
    if (parseFloat(amount) < 10) {
      toast.error('Minimum withdrawal is $10');
      return;
    }

    setWithdrawStatus('pending');
    const loadingToast = toast.loading('Processing withdrawal request...');
    
    try {
      const response = await fetch(`${API_URL}/api/withdrawals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          wallet_address: account
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.dismiss(loadingToast);
        toast.success(`✅ Withdrawal request submitted! You'll receive $${data.net_amount.toFixed(2)}`, {
          duration: 6000,
        });
        setWithdrawStatus('submitted');
        setAmount('');
        await refreshUser();
      } else {
        const error = await response.json();
        toast.dismiss(loadingToast);
        toast.error(error.detail || 'Withdrawal failed');
        setWithdrawStatus('error');
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to process withdrawal. Please try again.');
      setWithdrawStatus('error');
    }
  };

  const net = calculateNet();

  return (
    <div style={{...styles.page, background: colors.background}}>
      <Header />
      
      <div style={styles.container}>
        {/* Stats Section */}
        <div style={{
          ...styles.statsSection,
          background: colors.cardBg,
          border: `2px solid ${colors.accent}`,
        }}>
          {/* Balance Display with USDT Logo */}
          <div style={styles.balanceDisplay}>
            <div style={styles.usdtLogoLarge}>
              <svg viewBox="0 0 32 32" style={{width: '40px', height: '40px'}}>
                <circle cx="16" cy="16" r="16" fill="#26A17B"/>
                <path fill="#fff" d="M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.658 0-.809 2.902-1.486 6.79-1.66v2.644c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.925-.06v-2.643c3.88.173 6.775.85 6.775 1.658 0 .81-2.895 1.485-6.775 1.657m0-3.59v-2.366h5.414V7.819H8.595v3.608h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.118 0 1.044 3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.116 0-1.043-3.301-1.914-7.694-2.117"/>
              </svg>
            </div>
            <div style={styles.balanceRow}>
              <span style={{...styles.balanceAmount, color: colors.text}}>{availableBalance.toFixed(2)}</span>
              <span style={{...styles.balanceCurrency, color: colors.accent}}>USDT</span>
            </div>
          </div>

          {/* Stats Row */}
          <div style={styles.statsRow}>
            <div style={{
              ...styles.statItem,
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
            }}>
              <span style={{...styles.statLabel, color: colors.textSecondary}}>TOTAL INVESTED</span>
              <div style={styles.statValue}>
                <span style={{...styles.statAmount, color: colors.text}}>{totalInvested.toFixed(2)}</span>
                <span style={{...styles.statCurrency, color: colors.accent}}>USDT</span>
              </div>
            </div>
            <div style={{
              ...styles.statItem,
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
            }}>
              <span style={{...styles.statLabel, color: colors.textSecondary}}>TOTAL EARNINGS</span>
              <div style={styles.statValue}>
                <span style={{...styles.statAmount, color: colors.text}}>{totalEarnings.toFixed(2)}</span>
                <span style={{...styles.statCurrency, color: colors.accent}}>USDT</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={styles.actionButtons}>
            <button 
              style={styles.depositBtn}
              onClick={() => window.location.href = '/deposit'}
            >
              <span style={styles.btnIcon}>+</span>
              Deposit
            </button>
            <button 
              style={styles.withdrawBtnActive}
            >
              <span style={styles.btnIcon}>−</span>
              Withdraw
            </button>
          </div>
        </div>

        {/* Web3 Wallet Section */}
        <div style={styles.walletSection}>
          {!isConnected ? (
            <div style={{
              ...styles.walletCard,
              background: colors.cardBg,
              border: `2px solid ${colors.accent}`,
            }}>
              <div style={{...styles.walletIconWrapper, background: `${colors.gold}15`}}>
                <Wallet size={28} color={colors.gold} />
              </div>
              <div style={styles.walletInfo}>
                <span style={{...styles.walletLabel, color: colors.text}}>WEB3 WALLET</span>
                <span style={{...styles.walletDesc, color: colors.textSecondary}}>MetaMask, Trust Wallet, Coinbase, OKX & more</span>
              </div>
              <button 
                style={styles.connectWalletBtn}
                onClick={connectWallet}
                disabled={isConnecting}
              >
                <Link2 size={18} />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            </div>
          ) : (
            <div style={{
              ...styles.walletCard,
              background: colors.cardBg,
              border: `2px solid ${colors.accent}`,
            }}>
              <div style={{...styles.walletIconWrapper, background: `${colors.gold}15`}}>
                <Wallet size={28} color={colors.gold} />
              </div>
              <div style={styles.walletInfo}>
                <span style={{...styles.walletLabel, color: colors.text}}>CONNECTED WALLET</span>
                <span style={styles.walletConnected}>
                  <CheckCircle size={14} color="#00FF00" /> BSC Network
                </span>
              </div>
              <button 
                style={styles.disconnectBtn}
                onClick={disconnectWallet}
              >
                Disconnect
              </button>
            </div>
          )}

          {!isCorrectNetwork && isConnected && (
            <div style={styles.networkWarning}>
              <AlertCircle size={18} color="#FF6464" />
              <span>Wrong network! Please switch to BSC</span>
              <button style={styles.switchBtn} onClick={switchToBSC}>
                Switch to BSC
              </button>
            </div>
          )}
        </div>

        {/* BEP-20 Wallet Address Section */}
        <div style={styles.addressSection}>
          <div style={{
            ...styles.addressCard,
            background: colors.cardBg,
            border: `2px solid ${colors.accent}`,
          }}>
            <div style={{...styles.addressIconWrapper, background: `${colors.gold}15`}}>
              <Wallet size={24} color={colors.gold} />
            </div>
            <div style={styles.addressInfo}>
              <span style={{...styles.addressLabel, color: colors.textSecondary}}>BEP-20 WALLET ADDRESS</span>
              <span style={{...styles.addressValue, color: colors.text}}>
                {isConnected ? truncateAddress(account) : 'Not connected'}
              </span>
            </div>
            <div style={styles.addressActions}>
              <button 
                style={styles.iconBtn}
                onClick={handleCopyAddress}
                disabled={!isConnected}
                title={copied ? 'Copied!' : 'Copy address'}
              >
                <Copy size={20} color={copied ? '#00FF00' : colors.textSecondary} />
              </button>
              <button 
                style={styles.iconBtn}
                onClick={() => account && window.open(`https://bsctrace.com/address/${account}`, '_blank')}
                disabled={!isConnected}
                title="View on BSCScan"
              >
                <ExternalLink size={20} color={colors.textSecondary} />
              </button>
            </div>
          </div>
          
          {/* Locked Warning */}
          {isConnected && (
            <div style={{
              ...styles.lockedWarning,
              background: isDark ? 'rgba(255,215,0,0.1)' : 'rgba(230,81,0,0.1)',
              borderColor: isDark ? 'rgba(255,215,0,0.3)' : 'rgba(230,81,0,0.3)',
            }}>
              <Lock size={18} color={isDark ? '#FFD700' : '#E65100'} />
              <span style={{color: colors.textSecondary}}>Withdrawals will be sent to your connected wallet address</span>
            </div>
          )}
        </div>

        {/* Withdrawal Status */}
        {withdrawStatus && (
          <div style={{
            ...styles.statusCard,
            background: colors.cardBg,
            borderColor: withdrawStatus === 'submitted' ? '#00FF00' : '#FFD700',
          }}>
            {withdrawStatus === 'pending' && (
              <>
                <Loader size={24} color="#FFD700" className="spin" />
                <div style={styles.statusInfo}>
                  <span style={{...styles.statusTitle, color: colors.text}}>Processing Request...</span>
                  <span style={{...styles.statusDesc, color: colors.textSecondary}}>Please wait</span>
                </div>
              </>
            )}
            {withdrawStatus === 'submitted' && (
              <>
                <CheckCircle size={24} color="#00FF00" />
                <div style={styles.statusInfo}>
                  <span style={{...styles.statusTitle, color: colors.text}}>Withdrawal Request Submitted!</span>
                  <span style={{...styles.statusDesc, color: colors.textSecondary}}>Admin will process within 12-24 hours</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Withdrawal Form */}
        <div style={{
          ...styles.formCard,
          background: colors.cardBg,
          border: `2px solid ${colors.accent}`,
        }}>
          <h2 style={{...styles.formTitle, color: colors.text}}>Withdrawal Request</h2>
          
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={{...styles.label, color: colors.textSecondary}}>
                <DollarSign size={18} />
                Amount (USDT)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount to withdraw"
                style={{
                  ...styles.input,
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  color: colors.text,
                  borderColor: colors.cardBorder,
                }}
                min="10"
                max={availableBalance}
                step="0.01"
                required
              />
              <div style={{...styles.inputHelper, color: colors.textSecondary}}>
                Minimum: $10 | Maximum: ${availableBalance.toFixed(2)}
              </div>
            </div>

            {net && (
              <div style={{
                ...styles.calculationBox,
                background: isDark ? 'rgba(14,203,129,0.1)' : `${colors.accent}10`,
                borderColor: `${colors.accent}40`,
              }}>
                <h3 style={{...styles.calculationTitle, color: colors.text}}>Withdrawal Calculation</h3>
                <div style={styles.calculationGrid}>
                  <div style={{...styles.calculationRow, color: colors.textSecondary}}>
                    <span>Withdrawal Amount:</span>
                    <span style={{color: colors.text}}>${parseFloat(amount).toFixed(2)}</span>
                  </div>
                  <div style={{...styles.calculationRow, color: colors.textSecondary}}>
                    <span>Withdrawal Fee ({withdrawalFee}%):</span>
                    <span style={{color: '#FF6B6B'}}>-${net.fee.toFixed(2)}</span>
                  </div>
                  <div style={{...styles.calculationRow, ...styles.calculationTotal, borderColor: colors.cardBorder}}>
                    <span style={{color: colors.text}}>You will receive:</span>
                    <span style={{color: colors.accent}}>${net.netAmount.toFixed(2)} USDT</span>
                  </div>
                </div>
              </div>
            )}

            <div style={{
              ...styles.infoBox,
              background: isDark ? 'rgba(255,215,0,0.1)' : 'rgba(230,81,0,0.08)',
              borderColor: isDark ? 'rgba(255,215,0,0.3)' : 'rgba(230,81,0,0.3)',
            }}>
              <h4 style={{...styles.infoTitle, color: isDark ? '#FFD700' : '#E65100'}}>Important Information</h4>
              <ul style={{...styles.infoList, color: colors.textSecondary}}>
                <li>Withdrawal fee: {withdrawalFee}%</li>
                <li>Minimum withdrawal: $10</li>
                <li>Processing time: 12-24 hours after admin approval</li>
                <li>Only USDT on BEP-20 network</li>
                <li>Funds will be sent to your connected wallet address</li>
              </ul>
            </div>

            <button 
              type="submit" 
              style={{
                ...styles.btnPrimary,
                opacity: !isConnected || !amount || parseFloat(amount) < 10 ? 0.5 : 1,
                cursor: !isConnected || !amount || parseFloat(amount) < 10 ? 'not-allowed' : 'pointer'
              }}
              disabled={!isConnected || !amount || parseFloat(amount) < 10}
            >
              {!isConnected ? (
                <>
                  <Wallet size={20} />
                  Connect Wallet to Withdraw
                </>
              ) : (
                <>
                  Submit Withdrawal Request
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Admin Withdrawal Wallet Info */}
        <div style={{
          ...styles.adminInfo,
          background: colors.cardBg,
          borderColor: colors.cardBorder,
        }}>
          <span style={{...styles.adminLabel, color: colors.textSecondary}}>Admin Withdrawal Wallet:</span>
          <code style={{...styles.adminAddress, color: colors.accent}}>{PLATFORM_WITHDRAWAL_WALLET}</code>
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
  
  // Stats Section
  statsSection: {
    background: 'linear-gradient(180deg, #0d0d0d 0%, #151515 100%)',
    border: '1px solid rgba(38, 161, 123, 0.3)',
    borderRadius: '14px',
    padding: '20px 16px',
    marginBottom: '14px',
  },
  balanceDisplay: {
    textAlign: 'center',
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  usdtLogoLarge: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(38, 161, 123, 0.2)',
    boxShadow: '0 0 20px rgba(38, 161, 123, 0.4)',
  },
  balanceRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
  },
  balanceAmount: {
    fontSize: '36px',
    fontWeight: 700,
    color: '#0ECB81',
  },
  balanceCurrency: {
    fontSize: '16px',
    color: '#0ECB81',
    fontWeight: 500,
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '20px',
  },
  statItem: {
    textAlign: 'left',
  },
  statLabel: {
    fontSize: '9px',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: '1px',
    display: 'block',
    marginBottom: '4px',
    fontWeight: 500,
  },
  statValue: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
  },
  statAmount: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#0ECB81',
  },
  statCurrency: {
    fontSize: '11px',
    color: '#0ECB81',
  },
  actionButtons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  depositBtn: {
    background: 'transparent',
    color: '#FFD700',
    border: '2px solid rgba(255, 215, 0, 0.4)',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    borderRadius: '10px',
    transition: 'all 0.3s ease',
  },
  withdrawBtnActive: {
    background: '#FFD700',
    color: '#000000',
    border: 'none',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    borderRadius: '10px',
  },
  btnIcon: {
    fontSize: '16px',
    fontWeight: 700,
  },

  // Wallet Section
  walletSection: {
    marginBottom: '14px',
  },
  walletCard: {
    background: 'linear-gradient(180deg, #0d0d0d 0%, #151515 100%)',
    border: '1px solid rgba(255, 215, 0, 0.15)',
    borderRadius: '14px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  walletIconWrapper: {
    width: '44px',
    height: '44px',
    background: 'rgba(255, 215, 0, 0.1)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletInfo: {
    flex: 1,
    minWidth: '120px',
  },
  walletLabel: {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: '1px',
    display: 'block',
    marginBottom: '4px',
    fontWeight: 500,
  },
  walletDesc: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  walletConnected: {
    fontSize: '12px',
    color: '#00FF00',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  connectWalletBtn: {
    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    color: '#000000',
    border: 'none',
    padding: '10px 16px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    borderRadius: '10px',
  },
  disconnectBtn: {
    background: 'transparent',
    color: 'rgba(255, 255, 255, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '8px 12px',
    fontSize: '11px',
    cursor: 'pointer',
    borderRadius: '6px',
  },
  networkWarning: {
    background: 'rgba(255, 100, 100, 0.1)',
    border: '1px solid rgba(255, 100, 100, 0.3)',
    borderRadius: '8px',
    padding: '10px 12px',
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#FF6464',
    fontSize: '11px',
    flexWrap: 'wrap',
  },
  switchBtn: {
    background: '#FF6464',
    color: '#FFFFFF',
    border: 'none',
    padding: '4px 10px',
    fontSize: '10px',
    cursor: 'pointer',
    borderRadius: '4px',
    marginLeft: 'auto',
  },

  // Address Section
  addressSection: {
    marginBottom: '14px',
  },
  addressCard: {
    background: 'linear-gradient(180deg, #0d0d0d 0%, #151515 100%)',
    border: '1px solid rgba(255, 215, 0, 0.15)',
    borderRadius: '14px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  addressIconWrapper: {
    width: '44px',
    height: '44px',
    background: 'rgba(255, 215, 0, 0.1)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressInfo: {
    flex: 1,
    minWidth: '120px',
  },
  addressLabel: {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: '1px',
    display: 'block',
    marginBottom: '4px',
    fontWeight: 500,
  },
  addressValue: {
    fontSize: '13px',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  addressActions: {
    display: 'flex',
    gap: '8px',
  },
  iconBtn: {
    background: 'transparent',
    border: 'none',
    padding: '6px',
    cursor: 'pointer',
    opacity: 0.7,
    transition: 'opacity 0.3s ease',
  },
  lockedWarning: {
    background: 'rgba(255, 215, 0, 0.1)',
    border: '1px solid rgba(255, 215, 0, 0.3)',
    borderRadius: '8px',
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '8px',
    color: '#FFD700',
    fontSize: '11px',
  },

  // Status Card
  statusCard: {
    background: 'rgba(0, 0, 0, 0.5)',
    border: '1px solid',
    borderRadius: '10px',
    padding: '14px',
    marginBottom: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  statusInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  statusTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#FFFFFF',
  },
  statusDesc: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.6)',
  },

  // Form Card
  formCard: {
    background: 'linear-gradient(180deg, #0d0d0d 0%, #151515 100%)',
    border: '1px solid rgba(255, 215, 0, 0.15)',
    borderRadius: '14px',
    padding: '20px 16px',
    marginBottom: '14px',
  },
  formTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#FFFFFF',
    marginBottom: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  input: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    padding: '12px 14px',
    fontSize: '14px',
    color: '#FFFFFF',
    outline: 'none',
  },
  inputHelper: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  calculationBox: {
    background: 'rgba(255, 215, 0, 0.05)',
    border: '1px solid rgba(255, 215, 0, 0.2)',
    borderRadius: '8px',
    padding: '14px',
  },
  calculationTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#FFD700',
    marginBottom: '10px',
  },
  calculationGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  calculationRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  calculationTotal: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#FFD700',
    paddingTop: '8px',
    borderTop: '1px solid rgba(255, 215, 0, 0.2)',
    marginTop: '4px',
  },
  infoBox: {
    background: 'rgba(255, 184, 0, 0.05)',
    border: '1px solid rgba(255, 184, 0, 0.2)',
    borderRadius: '8px',
    padding: '12px',
  },
  infoTitle: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#FFB800',
    marginBottom: '8px',
  },
  infoList: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 1.7,
    paddingLeft: '16px',
    margin: 0,
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    color: '#000000',
    padding: '12px 24px',
    fontSize: '13px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    marginTop: '8px',
  },

  // Admin Info
  adminInfo: {
    textAlign: 'center',
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '8px',
  },
  adminLabel: {
    display: 'block',
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.4)',
    marginBottom: '6px',
  },
  adminAddress: {
    fontSize: '9px',
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: 'monospace',
    wordBreak: 'break-all',
  },
};

export default Withdraw;
