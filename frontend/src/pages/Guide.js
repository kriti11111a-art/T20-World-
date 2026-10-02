import React from 'react';
import { FileText, Download, Globe, CheckCircle, DollarSign, Clock, Users, RefreshCw, Gift, Zap } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';

const Guide = () => {
  const { isDark, colors } = useTheme();
  const API_URL = process.env.REACT_APP_BACKEND_URL;

  // Language options with flags (emoji flags)
  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  ];

  // Key points data
  const keyPoints = [
    { icon: DollarSign, text: 'Min deposit: $1' },
    { icon: DollarSign, text: 'Min withdrawal: $1' },
    { icon: DollarSign, text: 'Withdrawal fee: 5%' },
    { icon: Clock, text: 'Processing: 01-06 hrs' },
    { icon: Users, text: '5-Level referral' },
    { icon: RefreshCw, text: 'Recompound available' },
  ];

  // Investment slabs
  const slabs = [
    { range: '$1 - $19', roi: '5.5%' },
    { range: '$20 - $299', roi: '6.0%' },
    { range: '$300 - $2,999', roi: '6.5%' },
    { range: '$3,000+', roi: '7.0%' },
  ];

  const handleDownload = (langCode) => {
    // Download language-specific PDF
    window.open(`${API_URL}/api/download/guide/${langCode}`, '_blank');
  };

  return (
    <div style={{...styles.page, background: colors.background}}>
      <Header />
      
      <div style={styles.container}>
        {/* Header Section */}
        <div style={{
          ...styles.header,
          background: colors.cardBg,
          border: `2px solid ${colors.accent}`,
        }}>
          <div style={{...styles.headerIcon, background: `${colors.accent}20`}}>
            <FileText size={32} color={colors.accent} />
          </div>
          <h1 style={{...styles.title, color: colors.text}}>Platform Guide</h1>
          <p style={{...styles.subtitle, color: colors.textSecondary}}>Download TradeGo guide in your language</p>
        </div>

        {/* Quick Features */}
        <div style={{
          ...styles.featuresRow,
          background: colors.cardBg,
          border: `2px solid ${colors.accent}`,
        }}>
          <div style={{
            ...styles.featureItem,
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            border: `1px solid ${colors.accent}40`,
          }}>
            <CheckCircle size={18} color={colors.accent} style={{flexShrink: 0}} />
            <span style={{color: colors.text, fontSize: '11px'}}>Investment Slabs</span>
          </div>
          <div style={{
            ...styles.featureItem,
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            border: `1px solid ${colors.accent}40`,
          }}>
            <CheckCircle size={18} color={colors.accent} style={{flexShrink: 0}} />
            <span style={{color: colors.text, fontSize: '11px'}}>Referral System</span>
          </div>
          <div style={{
            ...styles.featureItem,
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            border: `1px solid ${colors.accent}40`,
          }}>
            <CheckCircle size={18} color={colors.accent} style={{flexShrink: 0}} />
            <span style={{color: colors.text, fontSize: '11px'}}>Withdraw/Recompound</span>
          </div>
          <div style={{
            ...styles.featureItem,
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            border: `1px solid ${colors.accent}40`,
          }}>
            <CheckCircle size={18} color={colors.accent} style={{flexShrink: 0}} />
            <span style={{color: colors.text, fontSize: '11px'}}>20-Day Charts</span>
          </div>
        </div>

        {/* Daily ROI Slabs Section */}
        <div style={{
          ...styles.slabsSection,
          background: colors.cardBg,
          border: `2px solid ${colors.accent}`,
        }}>
          <h2 style={{...styles.sectionTitle, color: colors.text}}>Daily ROI Slabs</h2>
          <div style={styles.slabsGrid}>
            {slabs.map((slab, index) => (
              <div key={index} style={{
                ...styles.slabCard,
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${colors.accent}50`,
              }}>
                <div style={{...styles.slabRange, color: colors.text}}>{slab.range}</div>
                <div style={{...styles.slabRoi, color: isDark ? '#FFD700' : '#E65100'}}>{slab.roi}</div>
                <div style={{...styles.slabDaily, color: colors.textSecondary}}>Daily</div>
              </div>
            ))}
          </div>
          <p style={{...styles.slabNote, color: colors.textSecondary}}>Duration: 20 Days • ROI at 12:00 AM IST</p>
        </div>

        {/* Weekly Offer Section */}
        <div style={{
          ...styles.offerSection,
          background: isDark ? 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)' : 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)',
          border: `2px solid ${isDark ? '#FFD700' : '#FFA000'}`,
        }}>
          <div style={styles.offerHeader}>
            <div style={{
              ...styles.offerIconBox,
              background: isDark ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 160, 0, 0.2)',
            }}>
              <Gift size={24} color={isDark ? '#FFD700' : '#FF8F00'} />
            </div>
            <h2 style={{...styles.offerTitle, color: isDark ? '#FFD700' : '#E65100'}}>
              Weekly Special Offer
            </h2>
          </div>
          
          <div style={{
            ...styles.offerBadge,
            background: isDark ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255, 160, 0, 0.15)',
            border: `1px solid ${isDark ? '#FFD700' : '#FFA000'}40`,
          }}>
            <Zap size={16} color={isDark ? '#FFD700' : '#FF8F00'} />
            <span style={{color: isDark ? '#FFD700' : '#E65100', fontWeight: 600}}>10% Deposit Bonus</span>
          </div>

          <div style={styles.offerDetails}>
            <div style={{
              ...styles.offerDetailItem,
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              border: `1px solid ${isDark ? '#FFD700' : '#FFA000'}30`,
            }}>
              <span style={{color: colors.textSecondary, fontSize: '12px'}}>Schedule</span>
              <span style={{color: colors.text, fontWeight: 600, fontSize: '13px'}}>Sunday & Wednesday</span>
            </div>
            <div style={{
              ...styles.offerDetailItem,
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              border: `1px solid ${isDark ? '#FFD700' : '#FFA000'}30`,
            }}>
              <span style={{color: colors.textSecondary, fontSize: '12px'}}>Time</span>
              <span style={{color: colors.text, fontWeight: 600, fontSize: '13px'}}>6:00 PM - 8:00 PM IST</span>
            </div>
            <div style={{
              ...styles.offerDetailItem,
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              border: `1px solid ${isDark ? '#FFD700' : '#FFA000'}30`,
            }}>
              <span style={{color: colors.textSecondary, fontSize: '12px'}}>Minimum Deposit</span>
              <span style={{color: isDark ? '#00FF88' : '#2E7D32', fontWeight: 700, fontSize: '15px'}}>$50</span>
            </div>
          </div>

          <div style={{
            ...styles.offerNote,
            background: isDark ? 'rgba(0, 255, 136, 0.1)' : 'rgba(46, 125, 50, 0.1)',
            border: `1px dashed ${isDark ? '#00FF88' : '#2E7D32'}50`,
          }}>
            <CheckCircle size={16} color={isDark ? '#00FF88' : '#2E7D32'} />
            <span style={{color: isDark ? '#00FF88' : '#2E7D32', fontSize: '12px', fontWeight: 500}}>
              Deposit $50+ during offer window and get 10% bonus instantly!
            </span>
          </div>
        </div>

        {/* Key Points Section */}
        <div style={{
          ...styles.keyPointsSection,
          background: colors.cardBg,
          border: `2px solid ${colors.accent}`,
        }}>
          <h2 style={{...styles.keyPointsTitle, color: colors.text}}>
            <CheckCircle size={22} color={colors.accent} />
            Key Points
          </h2>
          <div style={styles.keyPointsGrid}>
            {keyPoints.map((point, index) => {
              const Icon = point.icon;
              return (
                <div key={index} style={{
                  ...styles.keyPoint,
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${colors.accent}50`,
                  borderRadius: '8px',
                  padding: '10px',
                }}>
                  <CheckCircle size={14} color={colors.accent} style={{flexShrink: 0}} />
                  <span style={{color: colors.text, fontSize: '11px'}}>{point.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Download Guide Section */}
        <div style={{
          ...styles.downloadSection,
          background: colors.cardBg,
          border: `2px solid ${colors.accent}`,
        }}>
          <div style={styles.downloadHeader}>
            <Globe size={28} color={colors.accent} />
            <h2 style={{...styles.downloadTitle, color: colors.text}}>Download Guide (6 Languages)</h2>
          </div>
          
          <div style={styles.languageGrid}>
            {languages.map((lang) => (
              <div 
                key={lang.code} 
                style={{
                  ...styles.languageCard,
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  border: `1px solid ${colors.cardBorder}`,
                }}
                onClick={() => handleDownload(lang.code)}
              >
                <div style={styles.flagContainer}>
                  <span style={styles.flag}>{lang.flag}</span>
                </div>
                <span style={{...styles.langName, color: colors.text}}>{lang.name}</span>
                <Download size={18} color={colors.accent} />
              </div>
            ))}
          </div>
          
          <p style={{...styles.downloadNote, color: colors.textSecondary}}>
            10-page comprehensive PDF with recompounding calculator, referral guide, and FAQs
          </p>
        </div>

        {/* Quick Info */}
        <div style={{
          ...styles.quickInfo,
          background: colors.cardBg,
          border: `2px solid ${colors.accent}`,
        }}>
          <div style={{
            ...styles.infoItem,
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            border: `1px solid ${colors.accent}50`,
          }}>
            <span style={{...styles.infoLabel, color: colors.textSecondary}}>Support</span>
            <span style={{...styles.infoValue, color: colors.accent, fontSize: '10px'}}>support@tradego.io</span>
          </div>
          <div style={{
            ...styles.infoItem,
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            border: `1px solid ${colors.accent}50`,
          }}>
            <span style={{...styles.infoLabel, color: colors.textSecondary}}>Website</span>
            <span style={{...styles.infoValue, color: colors.accent, fontSize: '10px'}}>tradego.io</span>
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
    padding: '100px 5% 60px',
    maxWidth: '500px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  headerIcon: {
    width: '60px',
    height: '60px',
    background: 'rgba(0, 255, 209, 0.1)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#FFFFFF',
    marginBottom: '8px',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.6)',
    margin: '8px 0 0 0',
  },
  featuresRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginBottom: '25px',
    padding: '16px',
    borderRadius: '16px',
  },
  featureItem: {
    background: 'rgba(0, 255, 209, 0.05)',
    border: '1px solid rgba(0, 255, 209, 0.2)',
    borderRadius: '8px',
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#FFFFFF',
    fontWeight: 500,
    wordBreak: 'break-word',
    overflow: 'hidden',
  },
  slabsSection: {
    background: 'linear-gradient(180deg, #0a0a0a 0%, #0d0d0d 100%)',
    border: '2px solid rgba(0, 255, 209, 0.3)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#FFFFFF',
    marginBottom: '20px',
    margin: '0 0 20px 0',
  },
  slabsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginBottom: '16px',
  },
  slabCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
  },
  slabRange: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '8px',
  },
  slabRoi: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#00FFD1',
    marginBottom: '4px',
  },
  slabDaily: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  slabNote: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    margin: 0,
  },
  offerSection: {
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
  },
  offerHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  offerIconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerTitle: {
    fontSize: '20px',
    fontWeight: 700,
    margin: 0,
  },
  offerBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '25px',
    marginBottom: '16px',
  },
  offerDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    marginBottom: '16px',
  },
  offerDetailItem: {
    borderRadius: '10px',
    padding: '12px 8px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  offerNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    borderRadius: '10px',
  },
  keyPointsSection: {
    background: 'linear-gradient(180deg, #0a0a0a 0%, #0d0d0d 100%)',
    border: '2px solid rgba(0, 255, 209, 0.3)',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '20px',
    overflow: 'hidden',
  },
  keyPointsTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '18px',
    fontWeight: 700,
    color: '#FFFFFF',
    marginBottom: '16px',
    margin: '0 0 16px 0',
  },
  keyPointsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    width: '100%',
  },
  keyPoint: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#FFFFFF',
    fontWeight: 500,
    wordBreak: 'break-word',
  },
  downloadSection: {
    background: 'linear-gradient(180deg, #0a0a0a 0%, #0d0d0d 100%)',
    border: '2px solid rgba(0, 255, 209, 0.3)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
  },
  downloadHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
  },
  downloadTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#FFFFFF',
    margin: 0,
  },
  languageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '16px',
  },
  languageCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  flagContainer: {
    width: '40px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flag: {
    fontSize: '28px',
  },
  langName: {
    fontSize: '13px',
    color: '#FFFFFF',
    fontWeight: 500,
  },
  downloadNote: {
    fontSize: '12px',
    color: '#00FFD1',
    textAlign: 'center',
    margin: 0,
  },
  quickInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '16px',
    borderRadius: '16px',
    marginBottom: '20px',
    overflow: 'hidden',
  },
  infoItem: {
    flex: 1,
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '12px 8px',
    textAlign: 'center',
    overflow: 'hidden',
    minWidth: 0,
  },
  infoLabel: {
    display: 'block',
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: '4px',
  },
  infoValue: {
    fontSize: '11px',
    color: '#00FFD1',
    wordBreak: 'break-all',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontWeight: 500,
  },
};

export default Guide;
