import React, { useState, useEffect, useCallback } from 'react';
import { THEME, SHADOWS, rgba } from '../config/themeConfig';

/**
 * OfferSlider Component
 * Displays Sunday/Wednesday Special Offers with countdown timers
 * Full banner image visible with proper aspect ratio
 */

const OfferSlider = ({ onOfferClick }) => {
  const [offers, setOffers] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [countdowns, setCountdowns] = useState({});

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  // Fetch offers status
  const fetchOffers = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/offers/status`);
      const data = await response.json();
      
      if (data.offers) {
        // Filter out ended offers, show only upcoming or live
        const activeOffers = data.offers.filter(
          offer => offer.status === 'upcoming' || offer.status === 'live'
        );
        setOffers(activeOffers);
        
        // Initialize countdowns
        const newCountdowns = {};
        activeOffers.forEach(offer => {
          if (offer.status === 'upcoming' && offer.starts_in_seconds) {
            newCountdowns[offer.offer_type] = {
              type: 'starts_in',
              seconds: offer.starts_in_seconds
            };
          } else if (offer.status === 'live' && offer.ends_in_seconds) {
            newCountdowns[offer.offer_type] = {
              type: 'ends_in',
              seconds: offer.ends_in_seconds
            };
          }
        });
        setCountdowns(newCountdowns);
      }
    } catch (error) {
      console.error('Failed to fetch offers:', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchOffers();
    const refreshInterval = setInterval(fetchOffers, 60000);
    return () => clearInterval(refreshInterval);
  }, [fetchOffers]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdowns(prev => {
        const updated = { ...prev };
        let shouldRefetch = false;
        
        Object.keys(updated).forEach(offerType => {
          if (updated[offerType].seconds > 0) {
            updated[offerType] = {
              ...updated[offerType],
              seconds: updated[offerType].seconds - 1
            };
          } else {
            shouldRefetch = true;
          }
        });
        
        if (shouldRefetch) {
          fetchOffers();
        }
        
        return updated;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [fetchOffers]);

  // Auto-slide if multiple offers
  useEffect(() => {
    if (offers.length > 1) {
      const slideTimer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % offers.length);
      }, 5000);
      return () => clearInterval(slideTimer);
    }
  }, [offers.length]);

  // Format seconds to countdown
  const formatCountdown = (seconds, includeDays = true) => {
    if (!seconds || seconds <= 0) return '00:00:00';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (includeDays && days > 0) {
      return `${String(days).padStart(2, '0')}:${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingPulse} />
      </div>
    );
  }

  if (offers.length === 0) {
    return null;
  }

  const currentOffer = offers[currentSlide];
  const countdown = countdowns[currentOffer?.offer_type];
  const isLive = currentOffer?.status === 'live';

  return (
    <div style={styles.container} data-testid="offer-slider">
      {/* Banner with full image */}
      <div 
        style={styles.bannerWrapper}
        onClick={() => onOfferClick && onOfferClick(currentOffer)}
      >
        <img
          src={currentOffer.banner_url}
          alt={`${currentOffer.offer_type} Special Offer`}
          style={styles.bannerImage}
          data-testid={`offer-slide-${currentOffer.offer_type}`}
        />
      </div>
      
      {/* Countdown Bar - Below Banner */}
      <div style={styles.countdownBar}>
        {/* Live Indicator */}
        {isLive && (
          <div style={styles.liveIndicator} data-testid="live-indicator">
            <span style={styles.liveDot} />
            <span style={styles.liveText}>LIVE</span>
          </div>
        )}
        
        {/* Countdown Timer */}
        <div style={styles.countdownContainer}>
          {countdown && (
            <>
              <span style={styles.countdownLabel}>
                {countdown.type === 'starts_in' ? 'Starts In:' : 'Ends In:'}
              </span>
              <span style={{
                ...styles.countdownValue,
                color: isLive ? THEME.success : THEME.cyanHighlight
              }}>
                {formatCountdown(countdown.seconds, countdown.type === 'starts_in')}
              </span>
            </>
          )}
        </div>
      </div>
      
      {/* Dots Navigation */}
      {offers.length > 1 && (
        <div style={styles.dotsContainer}>
          {offers.map((_, index) => (
            <button
              key={index}
              style={{
                ...styles.dot,
                background: index === currentSlide 
                  ? THEME.cyanHighlight 
                  : rgba.cyan(0.3)
              }}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    marginBottom: '16px',
  },
  loadingContainer: {
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: THEME.bgCard,
    borderRadius: '12px',
    marginBottom: '16px',
  },
  loadingPulse: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${THEME.primaryBlue}, ${THEME.cyanHighlight})`,
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  bannerWrapper: {
    position: 'relative',
    width: '100%',
    borderRadius: '12px 12px 0 0',
    overflow: 'hidden',
    cursor: 'pointer',
  },
  bannerImage: {
    width: '100%',
    height: 'auto',
    display: 'block',
  },
  countdownBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    background: THEME.bgCard,
    borderRadius: '0 0 12px 12px',
    borderTop: `1px solid ${rgba.cyan(0.2)}`,
  },
  liveIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    background: rgba.success(0.2),
    borderRadius: '16px',
    border: `1px solid ${rgba.success(0.5)}`,
    animation: 'pulse-glow 2s ease-in-out infinite',
  },
  liveDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: THEME.success,
    boxShadow: `0 0 8px ${THEME.success}`,
    animation: 'blink 1s ease-in-out infinite',
  },
  liveText: {
    fontSize: '11px',
    fontWeight: '700',
    color: THEME.success,
    letterSpacing: '1px',
  },
  countdownContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '1px',
  },
  countdownLabel: {
    fontSize: '10px',
    color: THEME.textSecondary,
    fontWeight: '500',
  },
  countdownValue: {
    fontSize: '16px',
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: '2px',
  },
  dotsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '10px',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    padding: 0,
  },
};

// Add CSS animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.1); opacity: 1; }
  }
  
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 5px rgba(0, 214, 143, 0.3); }
    50% { box-shadow: 0 0 15px rgba(0, 214, 143, 0.6); }
  }
`;
document.head.appendChild(styleSheet);

export default OfferSlider;
