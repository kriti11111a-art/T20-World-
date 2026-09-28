import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const Maintenance = () => {
  const { isDark } = useTheme();
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  
  // Maintenance end time: 84 hours total (48 + 36) - ends March 30, 2026 12:00 PM IST
  const maintenanceEndTime = new Date('2026-03-30T12:00:00+05:30').getTime();
  
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = maintenanceEndTime - now;
      
      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [maintenanceEndTime]);
  
  const colors = {
    bg: isDark ? '#0a0a0f' : '#f5f5f5',
    cardBg: isDark ? 'rgba(20, 20, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    text: isDark ? '#FFFFFF' : '#1a1a2e',
    textSecondary: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
    accent: '#00D09C',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: isDark 
        ? 'linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 50%, #0a0a0f 100%)'
        : 'linear-gradient(180deg, #f0f0f0 0%, #e0e0e0 50%, #f0f0f0 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background particles */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              background: 'rgba(0, 208, 156, 0.3)',
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
      
      {/* Main Card */}
      <div style={{
        background: colors.cardBg,
        borderRadius: '30px',
        padding: '50px 40px',
        maxWidth: '420px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 30px 100px rgba(0, 208, 156, 0.2), 0 15px 50px rgba(0,0,0,0.3)',
        border: '2px solid rgba(0, 208, 156, 0.3)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glowing border animation */}
        <div style={{
          position: 'absolute',
          top: '-2px',
          left: '-2px',
          right: '-2px',
          bottom: '-2px',
          borderRadius: '32px',
          background: 'linear-gradient(45deg, #00D09C, #00E5A0, #FFD700, #00D09C)',
          backgroundSize: '400% 400%',
          animation: 'gradientMove 3s ease infinite',
          zIndex: -1,
          opacity: 0.5,
        }} />
        
        {/* Maintenance Icon */}
        <div style={{
          width: '120px',
          height: '120px',
          margin: '0 auto 30px',
          background: 'linear-gradient(135deg, rgba(0, 208, 156, 0.2) 0%, rgba(0, 229, 160, 0.1) 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '3px solid rgba(0, 208, 156, 0.4)',
          animation: 'pulse 2s infinite',
        }}>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#00D09C" strokeWidth="1.5">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
            <path d="M12 6v6l4 2"/>
            <path d="M9.5 2h5M12 2v2" strokeLinecap="round"/>
          </svg>
        </div>
        
        {/* Title */}
        <h1 style={{
          fontSize: '28px',
          fontWeight: 800,
          color: colors.text,
          marginBottom: '15px',
          letterSpacing: '1px',
        }}>
          SYSTEM UPDATE
        </h1>
        
        {/* Subtitle */}
        <p style={{
          fontSize: '16px',
          color: colors.accent,
          fontWeight: 600,
          marginBottom: '25px',
          letterSpacing: '2px',
        }}>
          UNDER MAINTENANCE
        </p>
        
        {/* Message */}
        <p style={{
          fontSize: '15px',
          color: colors.textSecondary,
          lineHeight: '1.8',
          marginBottom: '35px',
        }}>
          We are upgrading our platform with <strong style={{color: colors.accent}}>new features</strong> and 
          <strong style={{color: colors.accent}}> enhanced security</strong> to serve you better.
          <br/><br/>
          Thank you for your patience.
        </p>
        
        {/* Countdown Timer */}
        <div style={{
          background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
          borderRadius: '20px',
          padding: '25px',
          marginBottom: '30px',
        }}>
          <p style={{
            fontSize: '12px',
            color: colors.textSecondary,
            letterSpacing: '2px',
            marginBottom: '15px',
          }}>
            ESTIMATED TIME REMAINING
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
          }}>
            {/* Hours */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 208, 156, 0.2) 0%, rgba(0, 208, 156, 0.1) 100%)',
              borderRadius: '15px',
              padding: '15px 20px',
              minWidth: '70px',
              border: '1px solid rgba(0, 208, 156, 0.3)',
            }}>
              <div style={{
                fontSize: '32px',
                fontWeight: 800,
                color: colors.accent,
                fontFamily: "'Courier New', monospace",
              }}>
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <div style={{fontSize: '10px', color: colors.textSecondary, letterSpacing: '1px'}}>HOURS</div>
            </div>
            
            {/* Minutes */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%)',
              borderRadius: '15px',
              padding: '15px 20px',
              minWidth: '70px',
              border: '1px solid rgba(255, 215, 0, 0.3)',
            }}>
              <div style={{
                fontSize: '32px',
                fontWeight: 800,
                color: '#FFD700',
                fontFamily: "'Courier New', monospace",
              }}>
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <div style={{fontSize: '10px', color: colors.textSecondary, letterSpacing: '1px'}}>MINS</div>
            </div>
            
            {/* Seconds */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 105, 180, 0.2) 0%, rgba(255, 105, 180, 0.1) 100%)',
              borderRadius: '15px',
              padding: '15px 20px',
              minWidth: '70px',
              border: '1px solid rgba(255, 105, 180, 0.3)',
            }}>
              <div style={{
                fontSize: '32px',
                fontWeight: 800,
                color: '#FF69B4',
                fontFamily: "'Courier New', monospace",
              }}>
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <div style={{fontSize: '10px', color: colors.textSecondary, letterSpacing: '1px'}}>SECS</div>
            </div>
          </div>
        </div>
        
        {/* Features Coming */}
        <div style={{
          background: isDark ? 'rgba(0, 208, 156, 0.1)' : 'rgba(0, 208, 156, 0.08)',
          borderRadius: '15px',
          padding: '20px',
          border: '1px solid rgba(0, 208, 156, 0.2)',
        }}>
          <p style={{
            fontSize: '12px',
            color: colors.accent,
            fontWeight: 700,
            letterSpacing: '2px',
            marginBottom: '10px',
          }}>
            COMING SOON
          </p>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '13px',
            color: colors.textSecondary,
          }}>
            <span>✓ Enhanced Security Features</span>
            <span>✓ Improved Performance</span>
            <span>✓ New Trading Features</span>
          </div>
        </div>
        
        {/* Logo at bottom */}
        <div style={{
          marginTop: '30px',
          fontSize: '18px',
          fontWeight: 800,
          color: colors.accent,
          letterSpacing: '3px',
        }}>
          TRADE GENIUS
        </div>
      </div>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.5; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 208, 156, 0.4); }
          50% { transform: scale(1.05); box-shadow: 0 0 30px 10px rgba(0, 208, 156, 0.2); }
        }
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

export default Maintenance;
