import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, TrendingUp, Users, Shield, Zap, ChevronRight, Globe, Wallet, Gift, PlayCircle, Clock, DollarSign } from 'lucide-react';
import { investmentPlans } from '../mock';
import Header from '../components/Header';
import Footer from '../components/Footer';
import OfferSlider from '../components/OfferSlider';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const Home = () => {
  const { isDark, colors } = useTheme();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [isOfferLive, setIsOfferLive] = useState(false);
  
  // Real contract liquidity from BSC
  const [liquidityData, setLiquidityData] = useState({
    balance_usd: 10500000,
    explorer_url: 'https://bsctrace.com/address/0x73feaa1eE314F8c655E354234017bE2193C9E24E'
  });
  
  // Check offer status
  const checkOfferStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/api/offers/status`);
      if (res.ok) {
        const data = await res.json();
        const hasLiveOffer = data.offers?.some(offer => offer.status === 'live');
        setIsOfferLive(hasLiveOffer);
      }
    } catch (error) {
      console.error('Error checking offer status:', error);
    }
  };

  useEffect(() => {
    checkOfferStatus();
    const interval = setInterval(checkOfferStatus, 30000);
    return () => clearInterval(interval);
  }, []);
  
  // Fetch real liquidity from contract
  const fetchLiquidity = async () => {
    try {
      const response = await fetch(`${API_URL}/api/contract/liquidity`);
      if (response.ok) {
        const data = await response.json();
        setLiquidityData(data);
      }
    } catch (error) {
      console.error('Error fetching liquidity:', error);
    }
  };
  
  useEffect(() => {
    // Fetch immediately
    fetchLiquidity();
    
    // Refresh every 10 seconds to sync with contract
    const interval = setInterval(fetchLiquidity, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Format number with commas
  const formatLiquidity = (num) => {
    return '$' + Math.round(num).toLocaleString('en-US');
  };
  
  return (
    <div style={{...styles.page, background: colors.background}}>
      <Header />
      
      <div style={styles.container}>
        {/* Offer Slider Banner - Sunday/Wednesday Special */}
        <OfferSlider />
        
        {/* Hero Section - BitNest Style */}
        <section style={styles.heroSection}>
          {/* Liquidity Display - Click to view Smart Contract */}
          <div 
            onClick={() => window.open(liquidityData.explorer_url, '_blank')}
            style={{
              ...styles.liquidityBox, 
              background: `rgba(${isDark ? '0, 255, 136' : '0, 200, 83'}, 0.05)`, 
              border: `1px solid ${colors.accent}40`,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span style={{...styles.liquidityLabel, color: isDark ? '#888' : '#666'}}>TOTAL LIQUIDITY</span>
            <span style={{
              ...styles.liquidityValue, 
              color: colors.accent,
              transition: 'all 0.5s ease'
            }}>
              {formatLiquidity(liquidityData.balance_usd)}
            </span>
            <span style={{
              fontSize: '10px',
              color: colors.accent,
              marginTop: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              🔗 Click to verify Smart Contract
            </span>
          </div>

          {/* Main Headline */}
          <h1 style={{...styles.heroTitle, color: colors.text}}>
            Join <span style={{...styles.heroAccent, color: colors.cyanHighlight || colors.accent}}>TRADEGO</span>
          </h1>
          <p style={{...styles.heroSubtitle, color: colors.electricBlue || colors.accentSecondary}}>
            For the Web 3.0 Economy
          </p>

          {/* Description */}
          <p style={{...styles.heroDescription, color: colors.textSecondary}}>
            Earn 5.5% to 7% Daily ROI with our Automated Smart Investment Platform. 
            Start investing from just $1!
          </p>

          {/* CTA Buttons */}
          <div style={styles.heroButtons}>
            <Link to="/register" style={{...styles.primaryBtn, background: colors.gradientButton || colors.gradient, boxShadow: colors.glowCyan || colors.glowGreen}} data-testid="get-started-btn">
              <Gift size={20} />
              GET STARTED
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" style={{...styles.secondaryBtn, color: colors.cyanHighlight || colors.accent, borderColor: `${colors.cyanHighlight || colors.accent}80`}} data-testid="connect-btn">
              <Wallet size={18} />
              Connect
            </Link>
          </div>
        </section>

        {/* Stats Cards Section - BitNest Grid */}
        <section style={styles.statsSection}>
          <div style={{...styles.statsCard, background: colors.cardBg, border: `1px solid ${colors.cardBorder}`}}>
            <div style={{...styles.statsIcon, background: `${colors.accent}15`}}>
              <TrendingUp size={24} color={colors.accent} />
            </div>
            <span style={{...styles.statsValue, color: colors.text}}>7%</span>
            <span style={styles.statsLabel}>DAILY ROI</span>
          </div>
          <div style={{...styles.statsCard, background: colors.cardBg, border: `1px solid ${colors.cardBorder}`}}>
            <div style={{...styles.statsIcon, background: `${colors.accentSecondary}15`}}>
              <Shield size={24} color={colors.accentSecondary} />
            </div>
            <span style={{...styles.statsValue, color: colors.text}}>20</span>
            <span style={styles.statsLabel}>DAYS</span>
          </div>
          <div style={{...styles.statsCard, background: colors.cardBg, border: `1px solid ${colors.cardBorder}`}}>
            <div style={{...styles.statsIcon, background: `${colors.gold}15`}}>
              <Users size={24} color={colors.gold} />
            </div>
            <span style={{...styles.statsValue, color: colors.text}}>5</span>
            <span style={styles.statsLabel}>LEVELS</span>
          </div>
          <div style={{...styles.statsCard, background: colors.cardBg, border: `1px solid ${colors.cardBorder}`}}>
            <div style={{...styles.statsIcon, background: `${colors.accent}15`}}>
              <Zap size={24} color={colors.accent} />
            </div>
            <span style={{...styles.statsValue, color: colors.text}}>$1</span>
            <span style={styles.statsLabel}>MIN INVEST</span>
          </div>
        </section>

        {/* BitNest Zone Section */}
        <section style={styles.zoneSection}>
          <h2 style={{...styles.sectionTitle, color: colors.text}}>
            <span style={{color: colors.accent}}>TradeGo</span> Zone
          </h2>
          
          <div style={styles.zoneGrid}>
            <Link to="/referral" style={{...styles.zoneItem, background: colors.cardBg, border: `1px solid ${colors.cardBorder}`}}>
              <div style={{...styles.zoneIcon, background: `${colors.accent}15`}}><Users size={24} color={colors.accent} /></div>
              <span style={{...styles.zoneLabel, color: colors.text}}>My Team</span>
            </Link>
            <Link to="/referral" style={{...styles.zoneItem, background: colors.cardBg, border: `1px solid ${colors.cardBorder}`}}>
              <div style={{...styles.zoneIcon, background: `${colors.accentSecondary}15`}}><Globe size={24} color={colors.accentSecondary} /></div>
              <span style={{...styles.zoneLabel, color: colors.text}}>Community</span>
            </Link>
            <Link to="/deposit" style={{...styles.zoneItem, background: colors.cardBg, border: `1px solid ${colors.cardBorder}`}}>
              <div style={{...styles.zoneIcon, background: `${colors.gold}15`}}><TrendingUp size={24} color={colors.gold} /></div>
              <span style={{...styles.zoneLabel, color: colors.text}}>Earn Daily</span>
            </Link>
            <Link to="/register" style={{...styles.zoneItem, background: colors.cardBg, border: `1px solid ${colors.cardBorder}`}}>
              <div style={{...styles.zoneIcon, background: `${colors.accent}15`}}><Gift size={24} color={colors.accent} /></div>
              <span style={{...styles.zoneLabel, color: colors.text}}>Events Zone</span>
            </Link>
          </div>
        </section>

        {/* Investment Plans Section - Premium Trading Slab Cards */}
        <section style={styles.packagesSection}>
          <h2 style={{...styles.sectionTitle, color: colors.text}}>Investment <span style={{color: colors.accent}}>Plans</span></h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {investmentPlans.map((plan, index) => (
              <div 
                key={plan.id} 
                style={{
                  background: isDark ? 'linear-gradient(180deg, #0a0a0a 0%, #121212 100%)' : '#FFFFFF',
                  border: `2px solid ${colors.accent}`,
                  borderRadius: '24px',
                  padding: '28px 24px',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isDark ? `0 0 20px ${colors.accent}20` : '0 4px 20px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                }}
              >
                {/* BNB Background Watermark - Cinematic */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  right: '20px',
                  transform: 'translateY(-50%)',
                  width: '150px',
                  height: '150px',
                  pointerEvents: 'none',
                  zIndex: 0,
                }}>
                  <svg viewBox="0 0 126.61 126.61" style={{width: '100%', height: '100%'}}>
                    <path fill="#F3BA2F" opacity="0.15" d="M38.73 53.2l24.59-24.58 24.6 24.6 14.3-14.31L63.32 0l-38.9 38.9zM0 63.31l14.3-14.31 14.31 14.31-14.31 14.3zM38.73 73.41l24.59 24.59 24.6-24.6 14.31 14.29-38.9 38.91-38.91-38.88zM97.99 63.31l14.3-14.31 14.32 14.31-14.31 14.3z"/>
                    <path fill="#F3BA2F" opacity="0.15" d="M77.83 63.3l-14.51-14.52-10.73 10.73-1.24 1.23-2.54 2.54 14.51 14.5 14.51-14.47z"/>
                  </svg>
                </div>

                {/* Card Header with USDT Icon */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '24px',
                  position: 'relative',
                  zIndex: 1,
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'rgba(38, 161, 123, 0.2)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(38, 161, 123, 0.4)',
                    boxShadow: '0 0 15px rgba(38, 161, 123, 0.3)',
                  }}>
                    <svg viewBox="0 0 32 32" style={{width: '28px', height: '28px'}}>
                      <circle cx="16" cy="16" r="16" fill="#26A17B"/>
                      <path fill="#fff" d="M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.658 0-.809 2.902-1.486 6.79-1.66v2.644c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.925-.06v-2.643c3.88.173 6.775.85 6.775 1.658 0 .81-2.895 1.485-6.775 1.657m0-3.59v-2.366h5.414V7.819H8.595v3.608h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.118 0 1.044 3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.116 0-1.043-3.301-1.914-7.694-2.117"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{
                      display: 'block',
                      fontSize: '12px',
                      color: isDark ? 'rgba(255, 255, 255, 0.4)' : '#888888',
                      letterSpacing: '3px',
                      marginBottom: '6px',
                      fontWeight: 500,
                    }}>TRADING SLAB {['ONE', 'TWO', 'THREE', 'FOUR'][index]}</span>
                    <div style={{ display: 'flex', alignItems: 'baseline' }}>
                      <span style={{
                        fontSize: '36px',
                        fontWeight: 700,
                        color: '#0ECB81',
                      }}>${plan.minInvestment}</span>
                      <span style={{
                        fontSize: '18px',
                        color: '#0ECB81',
                        marginLeft: '6px',
                        opacity: 0.8,
                      }}> - ${plan.maxInvestment.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Package Details */}
                <div style={{ marginBottom: '24px', position: 'relative', zIndex: 1 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 0',
                  }}>
                    <span style={{ fontSize: '16px', color: isDark ? 'rgba(255, 255, 255, 0.6)' : '#666666' }}>Daily ROI</span>
                    <span style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      color: isDark ? '#FFD700' : '#E65100',
                      textShadow: isDark ? '0 0 10px rgba(255, 215, 0, 0.4)' : 'none',
                    }}>{plan.dailyROI}%</span>
                  </div>
                  <div style={{ height: '1px', background: isDark ? 'rgba(255, 215, 0, 0.15)' : 'rgba(0,0,0,0.1)' }}></div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 0',
                  }}>
                    <span style={{ fontSize: '16px', color: isDark ? 'rgba(255, 255, 255, 0.6)' : '#666666' }}>Duration</span>
                    <span style={{ fontSize: '17px', fontWeight: 600, color: isDark ? '#FFFFFF' : '#333333' }}>{plan.duration} days</span>
                  </div>
                  <div style={{ height: '1px', background: isDark ? 'rgba(255, 215, 0, 0.15)' : 'rgba(0,0,0,0.1)' }}></div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 0',
                  }}>
                    <span style={{ fontSize: '16px', color: isDark ? 'rgba(255, 255, 255, 0.6)' : '#666666' }}>Total ROI</span>
                    <span style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      color: isDark ? '#FFD700' : '#E65100',
                      textShadow: isDark ? '0 0 10px rgba(255, 215, 0, 0.4)' : 'none',
                    }}>{plan.totalReturn}.0%</span>
                  </div>
                </div>

                {/* Select Plan Button */}
                <button
                  onClick={() => navigate(token ? '/deposit' : '/register')}
                  style={{
                    width: '100%',
                    padding: '16px 24px',
                    background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)',
                    border: 'none',
                    borderRadius: '14px',
                    color: '#000000',
                    fontSize: '16px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  Select Plan
                  <ChevronRight size={20} />
                </button>

                {/* OFFER LIVE Badge */}
                <div
                  style={{
                    marginTop: '12px',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: isOfferLive 
                      ? 'linear-gradient(90deg, rgba(14, 203, 129, 0.15) 0%, rgba(22, 224, 255, 0.15) 100%)'
                      : 'rgba(100, 100, 100, 0.1)',
                    border: isOfferLive 
                      ? '1px solid rgba(14, 203, 129, 0.5)'
                      : '1px solid rgba(100, 100, 100, 0.3)',
                    opacity: isOfferLive ? 1 : 0.5,
                    animation: isOfferLive ? 'offerPulse 2s ease-in-out infinite' : 'none',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {isOfferLive && (
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#0ECB81',
                      boxShadow: '0 0 8px #0ECB81',
                      animation: 'blink 1s ease-in-out infinite',
                    }} />
                  )}
                  <Gift size={16} color={isOfferLive ? '#0ECB81' : '#666'} />
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: isOfferLive ? '#0ECB81' : '#666',
                    letterSpacing: '1px',
                  }}>
                    {isOfferLive ? 'OFFER LIVE • +10% BONUS' : 'OFFER LIVE'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Core Principles Section - BitNest Style */}
        <section style={styles.principlesSection}>
          <h2 style={{...styles.sectionTitle, color: colors.text}}>Core <span style={{color: colors.accent}}>Principles</span></h2>
          
          <div style={styles.principlesGrid}>
            <div style={{
              ...styles.principleCard, 
              background: colors.cardBg, 
              border: isDark ? `1px solid ${colors.cardBorder}` : '2px solid #00C853',
              borderRadius: '12px'
            }}>
              <div style={{...styles.principleIcon, background: `${colors.accent}15`}}>
                <Shield size={32} color={colors.accent} />
              </div>
              <h3 style={{...styles.principleTitle, color: colors.text}}>Transparency</h3>
              <p style={{...styles.principleDesc, color: colors.textSecondary}}>All transactions are visible on the blockchain</p>
            </div>
            <div style={{
              ...styles.principleCard, 
              background: colors.cardBg, 
              border: isDark ? `1px solid ${colors.cardBorder}` : '2px solid #00C853',
              borderRadius: '12px'
            }}>
              <div style={{...styles.principleIcon, background: `${colors.accentSecondary}15`}}>
                <Zap size={32} color={colors.accentSecondary} />
              </div>
              <h3 style={{...styles.principleTitle, color: colors.text}}>Autonomy</h3>
              <p style={{...styles.principleDesc, color: colors.textSecondary}}>Smart contracts execute automatically</p>
            </div>
            <div style={{
              ...styles.principleCard, 
              background: colors.cardBg, 
              border: isDark ? `1px solid ${colors.cardBorder}` : '2px solid #00C853',
              borderRadius: '12px'
            }}>
              <div style={{...styles.principleIcon, background: `${colors.gold}15`}}>
                <TrendingUp size={32} color={colors.gold} />
              </div>
              <h3 style={{...styles.principleTitle, color: colors.text}}>High Returns</h3>
              <p style={{...styles.principleDesc, color: colors.textSecondary}}>Up to 7% daily ROI for 20 days</p>
            </div>
          </div>
        </section>

        {/* Referral Section - BitNest Style */}
        <section style={styles.referralSection}>
          <div style={{...styles.referralCard, background: colors.cardBg, border: `1px solid ${colors.accent}50`, boxShadow: colors.glowGreen}}>
            <span style={{...styles.referralTag, color: colors.accent, background: `${colors.accent}15`}}>REFERRAL PROGRAM</span>
            <h2 style={{...styles.referralTitle, color: colors.text}}>Refer & <span style={{color: colors.accent}}>Earn</span></h2>
            
            <div style={styles.referralFeatures}>
              <div style={{...styles.referralFeature, background: `${colors.background}80`}}>
                <div style={{...styles.referralFeatureIcon, background: `${colors.accent}15`}}>
                  <Gift size={20} color={colors.accent} />
                </div>
                <div>
                  <h4 style={{...styles.referralFeatureTitle, color: colors.text}}>Direct Bonus</h4>
                  <p style={{...styles.referralFeatureDesc, color: colors.textSecondary}}>$10 per referral investment</p>
                </div>
              </div>
              <div style={{...styles.referralFeature, background: `${colors.background}80`}}>
                <div style={{...styles.referralFeatureIcon, background: `${colors.accentSecondary}15`}}>
                  <Users size={20} color={colors.accentSecondary} />
                </div>
                <div>
                  <h4 style={{...styles.referralFeatureTitle, color: colors.text}}>5-Level Income</h4>
                  <p style={{...styles.referralFeatureDesc, color: colors.textSecondary}}>1% commission on all 5 levels</p>
                </div>
              </div>
            </div>

            {/* Network Visual */}
            <div style={{...styles.networkVisual, background: `${colors.background}80`}}>
              <div style={{...styles.networkYou, background: colors.gradient}}>YOU</div>
              <div style={{...styles.networkLine, background: `${colors.accent}50`}}></div>
              <div style={styles.networkLevels}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <div key={level} style={styles.networkLevel}>
                    <div style={{...styles.networkIcon, background: `${colors.accent}15`}}>
                      <Users size={14} color={colors.accent} />
                    </div>
                    <span style={{...styles.networkPercent, color: colors.accent}}>1%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section style={{...styles.ctaSection, background: colors.cardBg, border: `1px solid ${colors.accentSecondary}50`, boxShadow: colors.glowTeal}}>
          <h2 style={{...styles.ctaTitle, color: colors.text}}>
            Join the <span style={{color: colors.accent}}>Revolution</span>
          </h2>
          <p style={{...styles.ctaDesc, color: colors.accentSecondary}}>
            Smart Trading, Smart Earning
          </p>
          <Link to="/register" style={{...styles.ctaBtn, background: colors.gradient, boxShadow: colors.glowGreen}} data-testid="cta-join-btn">
            JOIN NOW
            <ArrowRight size={20} />
          </Link>
          <p style={{...styles.ctaWebsite, color: colors.gold}}>www.tradego.io</p>
        </section>
      </div>

      <Footer />
    </div>
  );
};

const styles = {
  page: {
    background: '#050505',
    minHeight: '100vh',
  },
  container: {
    padding: '100px 16px 60px',
    maxWidth: '500px',
    margin: '0 auto',
  },

  // Hero Section - BitNest Style
  heroSection: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  liquidityBox: {
    background: 'rgba(0, 255, 136, 0.05)',
    border: '1px solid rgba(0, 255, 136, 0.3)',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '30px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  liquidityLabel: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: '2px',
    marginBottom: '8px',
  },
  liquidityValue: {
    fontSize: '32px',
    fontWeight: 800,
    fontFamily: "'Outfit', sans-serif",
    background: 'linear-gradient(90deg, #00FFFF 0%, #00FF88 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroTitle: {
    fontSize: '28px',
    fontWeight: 700,
    fontFamily: "'Outfit', sans-serif",
    color: '#FFFFFF',
    lineHeight: 1.3,
    marginBottom: '8px',
  },
  heroAccent: {
    color: '#00FF88',
    textShadow: '0 0 30px rgba(0, 255, 136, 0.5)',
  },
  heroSubtitle: {
    fontSize: '16px',
    color: '#00FFFF',
    marginBottom: '16px',
    fontWeight: 500,
  },
  heroDescription: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 1.6,
    marginBottom: '28px',
    maxWidth: '350px',
    margin: '0 auto 28px',
  },
  heroButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    alignItems: 'center',
  },
  primaryBtn: {
    background: 'linear-gradient(90deg, #00FFFF 0%, #00FF88 100%)',
    color: '#000000',
    border: 'none',
    padding: '16px 32px',
    fontSize: '15px',
    fontWeight: 700,
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    maxWidth: '300px',
    justifyContent: 'center',
    textDecoration: 'none',
    boxShadow: '0 0 20px rgba(0, 255, 136, 0.4)',
    transition: 'all 0.3s ease',
  },
  secondaryBtn: {
    background: 'transparent',
    color: '#00FF88',
    border: '1px solid rgba(0, 255, 136, 0.5)',
    padding: '14px 32px',
    fontSize: '15px',
    fontWeight: 600,
    borderRadius: '12px',
    cursor: 'pointer',
    width: '100%',
    maxWidth: '300px',
    textDecoration: 'none',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
  },

  // Stats Section - BitNest Grid
  statsSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '40px',
  },
  statsCard: {
    background: '#111111',
    border: '1px solid #222222',
    borderRadius: '16px',
    padding: '20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
  },
  statsIcon: {
    width: '48px',
    height: '48px',
    background: 'rgba(0, 255, 136, 0.1)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '4px',
  },
  statsValue: {
    fontSize: '28px',
    fontWeight: 800,
    fontFamily: "'Outfit', sans-serif",
    color: '#FFFFFF',
  },
  statsLabel: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: '1px',
  },

  // Zone Section - BitNest Style
  zoneSection: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: 700,
    fontFamily: "'Outfit', sans-serif",
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: '24px',
  },
  titleAccent: {
    color: '#00FF88',
  },
  zoneGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  zoneItem: {
    background: '#111111',
    border: '1px solid #222222',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
  },
  zoneIcon: {
    width: '56px',
    height: '56px',
    background: 'rgba(0, 255, 136, 0.1)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#FFFFFF',
  },

  // Plans Section - BitNest Cards
  packagesSection: {
    marginBottom: '40px',
  },
  plansGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  planCard: {
    background: '#111111',
    border: '1px solid #222222',
    borderRadius: '20px',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  },
  trianglePattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #00FFFF 0%, #00FF88 100%)',
  },
  planHeader: {
    marginBottom: '20px',
  },
  planTier: {
    display: 'block',
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: '2px',
    marginBottom: '8px',
  },
  planRange: {
    display: 'flex',
    alignItems: 'baseline',
  },
  planMin: {
    fontSize: '36px',
    fontWeight: 800,
    fontFamily: "'Outfit', sans-serif",
    color: '#00FF88',
  },
  planMax: {
    fontSize: '18px',
    color: '#00FF88',
    marginLeft: '6px',
    opacity: 0.7,
  },
  planDetails: {
    marginBottom: '20px',
  },
  planRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
  },
  planLabel: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  planValue: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#FFFFFF',
  },
  planValueHighlight: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#00FFFF',
  },
  planDivider: {
    height: '1px',
    background: 'rgba(255, 255, 255, 0.08)',
  },
  investBtn: {
    background: 'transparent',
    color: '#00FF88',
    border: '1px solid rgba(0, 255, 136, 0.5)',
    padding: '14px 20px',
    fontSize: '14px',
    fontWeight: 600,
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
  },

  // Principles Section
  principlesSection: {
    marginBottom: '40px',
    overflow: 'hidden',
  },
  principlesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px',
    width: '100%',
    boxSizing: 'border-box',
  },
  principleCard: {
    background: '#111111',
    border: '1px solid #222222',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
    width: '100%',
    maxWidth: '100%',
  },
  principleIcon: {
    width: '60px',
    height: '60px',
    background: 'rgba(0, 255, 136, 0.1)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  principleTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#FFFFFF',
    marginBottom: '4px',
    margin: 0,
  },
  principleDesc: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.6)',
    margin: 0,
    lineHeight: 1.4,
  },

  // Referral Section
  referralSection: {
    marginBottom: '40px',
  },
  referralCard: {
    background: '#111111',
    border: '1px solid rgba(0, 255, 136, 0.3)',
    borderRadius: '20px',
    padding: '28px 24px',
    textAlign: 'center',
    boxShadow: '0 0 30px rgba(0, 255, 136, 0.1)',
  },
  referralTag: {
    display: 'inline-block',
    fontSize: '11px',
    color: '#00FF88',
    letterSpacing: '2px',
    marginBottom: '8px',
    background: 'rgba(0, 255, 136, 0.1)',
    padding: '6px 12px',
    borderRadius: '20px',
  },
  referralTitle: {
    fontSize: '24px',
    fontWeight: 700,
    fontFamily: "'Outfit', sans-serif",
    color: '#FFFFFF',
    marginBottom: '24px',
  },
  referralFeatures: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '24px',
  },
  referralFeature: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    textAlign: 'left',
    background: 'rgba(0, 0, 0, 0.3)',
    padding: '14px',
    borderRadius: '12px',
  },
  referralFeatureIcon: {
    width: '44px',
    height: '44px',
    background: 'rgba(0, 255, 136, 0.1)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  referralFeatureTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#FFFFFF',
    margin: 0,
    marginBottom: '2px',
  },
  referralFeatureDesc: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.6)',
    margin: 0,
  },
  networkVisual: {
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '16px',
    padding: '24px',
  },
  networkYou: {
    width: '50px',
    height: '50px',
    background: 'linear-gradient(90deg, #00FFFF 0%, #00FF88 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px',
    fontSize: '12px',
    fontWeight: 700,
    color: '#000000',
  },
  networkLine: {
    width: '2px',
    height: '24px',
    background: 'rgba(0, 255, 136, 0.3)',
    margin: '0 auto 12px',
  },
  networkLevels: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
  },
  networkLevel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  networkIcon: {
    width: '32px',
    height: '32px',
    background: 'rgba(0, 255, 136, 0.1)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  networkPercent: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#00FF88',
  },

  // CTA Section
  ctaSection: {
    background: '#111111',
    border: '1px solid rgba(0, 255, 255, 0.3)',
    borderRadius: '24px',
    padding: '40px 24px',
    textAlign: 'center',
    boxShadow: '0 0 40px rgba(0, 255, 255, 0.1)',
  },
  ctaTitle: {
    fontSize: '28px',
    fontWeight: 800,
    fontFamily: "'Outfit', sans-serif",
    color: '#FFFFFF',
    marginBottom: '8px',
  },
  ctaDesc: {
    fontSize: '14px',
    color: '#00FFFF',
    marginBottom: '24px',
  },
  ctaBtn: {
    background: 'linear-gradient(90deg, #00FFFF 0%, #00FF88 100%)',
    color: '#000000',
    border: 'none',
    padding: '16px 40px',
    fontSize: '16px',
    fontWeight: 700,
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    boxShadow: '0 0 30px rgba(0, 255, 136, 0.5)',
    marginBottom: '16px',
  },
  ctaWebsite: {
    fontSize: '13px',
    color: '#FFD700',
    fontWeight: 500,
    margin: 0,
  },
};

// Add CSS animations for OFFER LIVE badge
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes offerPulse {
    0%, 100% { 
      box-shadow: 0 0 5px rgba(14, 203, 129, 0.3);
      transform: scale(1);
    }
    50% { 
      box-shadow: 0 0 20px rgba(14, 203, 129, 0.6), 0 0 40px rgba(22, 224, 255, 0.3);
      transform: scale(1.02);
    }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
`;
document.head.appendChild(styleSheet);

export default Home;
