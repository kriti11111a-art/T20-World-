import React, { useState, useEffect, useCallback } from 'react';
import { THEME, rgba } from '../config/themeConfig';

/**
 * OfferSlider Component - Final Logic
 * 
 * Normal State: Both cards show "COMING SOON"
 * When Admin-set Start Time arrives:
 *   - COMING SOON → LIVE (blinking green dot)
 *   - Live card locks to first position
 *   - Auto-scroll stops
 *   - "Ends In" countdown shows
 * After 24 hours:
 *   - LIVE → COMING SOON
 *   - Auto-scroll resumes
 */

const OfferSlider = ({ onOfferClick }) => {
  const [offers, setOffers] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [countdowns, setCountdowns] = useState({});
  const [liveOfferLocked, setLiveOfferLocked] = useState(null); // Track which offer is LIVE and locked

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  // Fetch offers status
  const fetchOffers = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/offers/status`);
      const data = await response.json();
      
      if (data.offers) {
        // Sort offers - LIVE ones come first
        const sortedOffers = [...data.offers].sort((a, b) => {
          if (a.status === 'live' && b.status !== 'live') return -1;
          if (b.status === 'live' && a.status !== 'live') return 1;
          return 0;
        });
        
        setOffers(sortedOffers);
        
        // Check if any offer is LIVE
        const liveOffer = sortedOffers.find(o => o.status === 'live');
        if (liveOffer) {
          setLiveOfferLocked(liveOffer.offer_type);
          setCurrentSlide(0); // Lock to first position
        } else {
          setLiveOfferLocked(null);
        }
        
        // Initialize countdowns
        const newCountdowns = {};
        sortedOffers.forEach(offer => {
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
    const refreshInterval = setInterval(fetchOffers, 30000); // Refresh every 30 seconds
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

  // Auto-slide ONLY when NO offer is LIVE (10 seconds interval)
  useEffect(() => {
    if (offers.length > 1 && !liveOfferLocked) {
      const slideTimer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % offers.length);
      }, 10000);
      return () => clearInterval(slideTimer);
    }
  }, [offers.length, liveOfferLocked]);

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

  // Get status text and style
  const getStatusDisplay = (offer) => {
    const countdown = countdowns[offer.offer_type];
    
    if (offer.status === 'live') {
      return {
        showLive: true,
        showComingSoon: false,
        countdownLabel: 'Ends In:',
        countdownValue: countdown ? formatCountdown(countdown.seconds, false) : '00:00:00',
        countdownColor: THEME.success
      };
    } else if (offer.status === 'upcoming') {
      return {
        showLive: false,
        showComingSoon: true,
        countdownLabel: 'Starts In:',
        countdownValue: countdown ? formatCountdown(countdown.seconds, true) : '--:--:--',
        countdownColor: THEME.cyanHighlight
      };
    } else {
      // Not configured or ended
      return {
        showLive: false,
        showComingSoon: true,
        countdownLabel: null,
        countdownValue: null,
        countdownColor: null
      };
    }
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
  const statusDisplay = getStatusDisplay(currentOffer);

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
      
      {/* Status Bar - Below Banner */}
      <div style={styles.statusBar}>
        {/* Left Side - LIVE or COMING SOON */}
        {statusDisplay.showLive ? (
          <div style={styles.liveIndicator} data-testid="live-indicator">
            <span style={styles.liveDot} />
            <span style={styles.liveText}>LIVE</span>
          </div>
        ) : (
          <div style={styles.comingSoonBadge} data-testid="coming-soon-indicator">
            <span style={styles.comingSoonText}>COMING SOON</span>
          </div>
        )}
        
        {/* Right Side - Countdown */}
        {statusDisplay.countdownLabel && (
          <div style={styles.countdownContainer}>
            <span style={styles.countdownLabel}>{statusDisplay.countdownLabel}</span>
            <span style={{...styles.countdownValue, color: statusDisplay.countdownColor}}>
              {statusDisplay.countdownValue}
            </span>
          </div>
        )}
      </div>
      
      {/* Dots Navigation - Only show if NOT locked */}
      {offers.length > 1 && (
        <div style={styles.dotsContainer}>
          {offers.map((offer, index) => (
            <button
              key={offer.offer_type}
              style={{
                ...styles.dot,
                background: index === currentSlide 
                  ? THEME.cyanHighlight 
                  : rgba.cyan(0.3),
                cursor: liveOfferLocked ? 'not-allowed' : 'pointer',
                opacity: liveOfferLocked && index !== 0 ? 0.4 : 1
              }}
              onClick={() => {
                // Only allow manual slide change if no offer is LIVE
                if (!liveOfferLocked) {
                  setCurrentSlide(index);
                }
              }}
              disabled={!!liveOfferLocked}
              aria-label={`${offer.offer_type} offer`}
            />
          ))}
          {liveOfferLocked && (
            <span style={styles.lockedText}>🔒</span>
          )}
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
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    background: `linear-gradient(135deg, ${THEME.bgCard} 0%, rgba(8, 43, 77, 0.95) 100%)`,
    borderRadius: '0 0 12px 12px',
    border: `1px solid ${rgba.cyan(0.25)}`,
    borderTop: 'none',
  },
  liveIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 12px',
    background: rgba.success(0.15),
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
  comingSoonBadge: {
    display: 'flex',
    alignItems: 'center',
    padding: '5px 12px',
    background: rgba.cyan(0.1),
    borderRadius: '16px',
    border: `1px solid ${rgba.cyan(0.3)}`,
  },
  comingSoonText: {
    fontSize: '11px',
    fontWeight: '700',
    color: THEME.cyanHighlight,
    letterSpacing: '0.5px',
  },
  countdownContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  countdownLabel: {
    fontSize: '11px',
    color: THEME.textSecondary,
    fontWeight: '500',
  },
  countdownValue: {
    fontSize: '15px',
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: '2px',
  },
  dotsContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    marginTop: '10px',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    border: 'none',
    transition: 'all 0.3s ease',
    padding: 0,
  },
  lockedText: {
    fontSize: '12px',
    marginLeft: '4px',
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
