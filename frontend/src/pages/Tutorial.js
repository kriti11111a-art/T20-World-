import React from 'react';
import { PlayCircle, Clock, CheckCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';

const Tutorial = () => {
  const { isDark, colors } = useTheme();
  
  const tutorials = [
    {
      id: 1,
      title: 'How to Create Account',
      duration: '2:30',
      completed: true,
      thumbnail: '🎬',
    },
    {
      id: 2,
      title: 'How to Make First Deposit',
      duration: '4:15',
      completed: true,
      thumbnail: '💰',
    },
    {
      id: 3,
      title: 'Understanding Investment Plans',
      duration: '5:45',
      completed: false,
      thumbnail: '📊',
    },
    {
      id: 4,
      title: 'How to Withdraw Profits',
      duration: '3:20',
      completed: false,
      thumbnail: '🏦',
    },
    {
      id: 5,
      title: 'Referral System Explained',
      duration: '6:10',
      completed: false,
      thumbnail: '👥',
    },
    {
      id: 6,
      title: 'Security Best Practices',
      duration: '4:00',
      completed: false,
      thumbnail: '🔒',
    },
  ];

  return (
    <div style={{...styles.page, background: colors.background}}>
      <Header />
      
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={{...styles.title, color: colors.text}}>Tutorial</h1>
          <p style={{...styles.subtitle, color: colors.textSecondary}}>Learn how to use TradeGo platform</p>
        </div>

        {/* Progress */}
        <div style={{
          ...styles.progressCard, 
          background: isDark 
            ? 'linear-gradient(180deg, #0a0a0a 0%, #121212 100%)' 
            : '#FFFFFF',
          border: isDark 
            ? '1px solid rgba(0, 255, 209, 0.3)' 
            : '2px solid #00C853',
          borderRadius: '12px',
          boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={styles.progressInfo}>
            <span style={{...styles.progressLabel, color: colors.textSecondary}}>Your Progress</span>
            <span style={{...styles.progressValue, color: colors.gold}}>2 of 6 completed</span>
          </div>
          <div style={{
            ...styles.progressBar, 
            background: isDark ? 'rgba(0, 255, 209, 0.1)' : 'rgba(0, 200, 150, 0.15)'
          }}>
            <div style={{...styles.progressFill, width: '33%'}}></div>
          </div>
        </div>

        {/* Tutorial List */}
        <div style={styles.tutorialList}>
          {tutorials.map((tutorial) => (
            <div 
              key={tutorial.id} 
              style={{
                ...styles.tutorialCard,
                background: isDark 
                  ? 'linear-gradient(180deg, #0a0a0a 0%, #121212 100%)' 
                  : '#FFFFFF',
                border: isDark 
                  ? '1px solid rgba(0, 255, 209, 0.3)' 
                  : '2px solid #00C853',
                borderRadius: '12px',
                boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              <div style={{
                ...styles.thumbnail,
                background: isDark ? 'rgba(0, 255, 209, 0.1)' : 'rgba(0, 200, 150, 0.15)'
              }}>
                <span style={styles.thumbnailIcon}>{tutorial.thumbnail}</span>
                <div style={styles.playOverlay}>
                  <PlayCircle size={32} color={colors.gold} />
                </div>
              </div>
              <div style={styles.tutorialInfo}>
                <h3 style={{...styles.tutorialTitle, color: colors.text}}>{tutorial.title}</h3>
                <div style={styles.tutorialMeta}>
                  <span style={{...styles.duration, color: colors.textSecondary}}>
                    <Clock size={14} /> {tutorial.duration}
                  </span>
                  {tutorial.completed && (
                    <span style={{...styles.completedBadge, color: colors.gold}}>
                      <CheckCircle size={14} /> Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
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
    padding: '120px 5% 60px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: '36px',
    fontWeight: 700,
    color: '#FFFFFF',
    marginBottom: '12px',
  },
  subtitle: {
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  progressCard: {
    background: 'linear-gradient(180deg, #0a0a0a 0%, #121212 100%)',
    border: '1px solid rgba(0, 255, 209, 0.2)',
    padding: '24px',
    marginBottom: '30px',
  },
  progressInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  progressLabel: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  progressValue: {
    fontSize: '14px',
    color: '#FFD700',
    fontWeight: 600,
  },
  progressBar: {
    height: '8px',
    background: 'rgba(0, 255, 209, 0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  tutorialList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  tutorialCard: {
    background: 'linear-gradient(180deg, #0a0a0a 0%, #121212 100%)',
    border: '1px solid rgba(0, 255, 209, 0.2)',
    padding: '16px',
    display: 'flex',
    gap: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  thumbnail: {
    width: '100px',
    height: '70px',
    background: 'rgba(0, 255, 209, 0.1)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexShrink: 0,
  },
  thumbnailIcon: {
    fontSize: '28px',
  },
  playOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  tutorialInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '8px',
  },
  tutorialTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#FFFFFF',
    margin: 0,
  },
  tutorialMeta: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },
  duration: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.5)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  completedBadge: {
    fontSize: '12px',
    color: '#FFD700',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
};

export default Tutorial;
