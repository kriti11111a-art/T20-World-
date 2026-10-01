import React, { useState, useEffect, useCallback } from 'react';
import { THEME, GRADIENTS, SHADOWS, rgba } from '../config/themeConfig';

/**
 * OfferSlider Component
 * Displays Sunday/Wednesday Special Offers with countdown timers
 * 
 * States:
 * - "Starts In: DD:HH:MM:SS" - When offer is upcoming
 * - "🟢 LIVE" blinking + "Ends In: HH:MM:SS" - When offer is active
 * - Hidden when offer has ended
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
    // Refresh every 60 seconds to sync with server
    const refreshInterval = setInterval(fetchOffers, 60000);
    return () => clearInterval(refreshInterval);
  }, [fetchOffers]);

  // Countdown timer - runs every second
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
            // Countdown finished, need to refetch status
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

  // Format seconds to DD:HH:MM:SS or HH:MM:SS
  const formatCountdown = (seconds, inclueDays = true) => {
    if (!seconds || seconds <= 0) return '00:00:00';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (inclueDays && days > 0) {
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
    return null; // No active offers
  }

  return (
    <div style={styles.container} data-testid="offer-slider">
      <div style={styles.sliderWrapper}>
        {offers.map((offer, index) => {
          const isVisible = index === currentSlide;
          const countdown = countdowns[offer.offer_type];
          const isLive = offer.status === 'live';
          
          return (
            <div
              key={offer.offer_type}
              style={{
                ...styles.slide,
                opacity: isVisible ? 1 : 0,
                transform: `translateX(${(index - currentSlide) * 100}%)`,
                pointerEvents: isVisible ? 'auto' : 'none'
              }}
              onClick={() => onOfferClick && onOfferClick(offer)}
              data-testid={`offer-slide-${offer.offer_type}`}
            >
              {/* Banner Image */}
              <div style={styles.bannerContainer}>
                <img
                  src={offer.banner_url}
                  alt={`${offer.offer_type} Special Offer`}
                  style={styles.bannerImage}
                />
                
                {/* Overlay with Live/Countdown Info */}
                <div style={styles.overlayContainer}>
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
              </div>
            </div>
          );
        })}
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
    position: 'relative',
  },
  loadingContainer: {
    height: '180px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: THEME.bgCard,
    borderRadius: '16px',
    marginBottom: '16px',
  },
  loadingPulse: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${THEME.primaryBlue}, ${THEME.cyanHighlight})`,
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  sliderWrapper: {
    position: 'relative',
    width: '100%',
    height: '180px',
    overflow: 'hidden',
    borderRadius: '16px',
    boxShadow: SHADOWS.glowSubtle,
  },
  slide: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    transition: 'opacity 0.5s ease, transform 0.5s ease',
    cursor: 'pointer',
  },
  bannerContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '16px',
  },
  overlayContainer: {
    position: 'absolute',
    bottom: '12px',
    left: '12px',
    right: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    background: 'rgba(3, 26, 51, 0.9)',
    backdropFilter: 'blur(8px)',
    borderRadius: '12px',
    border: `1px solid ${rgba.cyan(0.3)}`,
  },
  liveIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 14px',
    background: rgba.success(0.2),
    borderRadius: '20px',
    border: `1px solid ${rgba.success(0.5)}`,
    animation: 'pulse-glow 2s ease-in-out infinite',
  },
  liveDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: THEME.success,
    boxShadow: `0 0 10px ${THEME.success}`,
    animation: 'blink 1s ease-in-out infinite',
  },
  liveText: {
    fontSize: '13px',
    fontWeight: '700',
    color: THEME.success,
    letterSpacing: '1px',
  },
  countdownContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '2px',
  },
  countdownLabel: {
    fontSize: '11px',
    color: THEME.textSecondary,
    fontWeight: '500',
  },
  countdownValue: {
    fontSize: '18px',
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: '2px',
  },
  dotsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '12px',
  },
  dot: {
    width: '10px',
    height: '10px',
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
