import React, { useState, useEffect } from 'react';

const CandlestickChart = () => {
  const [candles, setCandles] = useState([]);

  useEffect(() => {
    // Generate initial candlestick data
    const initialCandles = Array.from({ length: 40 }, (_, i) => {
      const open = 45 + Math.random() * 30;
      const close = open + (Math.random() - 0.5) * 8;
      const high = Math.max(open, close) + Math.random() * 5;
      const low = Math.min(open, close) - Math.random() * 5;
      
      return {
        id: i,
        open,
        high,
        low,
        close,
        isGreen: close > open,
      };
    });
    setCandles(initialCandles);

    // Animate - add new candle every 2 seconds
    const interval = setInterval(() => {
      setCandles((prevCandles) => {
        const newCandles = [...prevCandles.slice(1)];
        const lastClose = newCandles[newCandles.length - 1]?.close || 50;
        
        const open = lastClose;
        const change = (Math.random() - 0.45) * 6;
        const close = Math.max(30, Math.min(80, open + change));
        const high = Math.max(open, close) + Math.random() * 4;
        const low = Math.min(open, close) - Math.random() * 4;
        
        newCandles.push({
          id: Date.now(),
          open,
          high,
          low,
          close,
          isGreen: close > open,
        });
        
        return newCandles;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.chartContainer}>
      {/* Price Grid Lines */}
      <div style={styles.gridLines}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={styles.gridLine} />
        ))}
      </div>

      {/* Candlesticks */}
      <div style={styles.candlesContainer}>
        {candles.map((candle, index) => {
          const height = ((candle.high - candle.low) / 100) * 100;
          const bodyHeight = ((Math.abs(candle.close - candle.open)) / 100) * 100;
          const bodyTop = ((100 - Math.max(candle.open, candle.close)) / 100) * 100;
          const wickTop = ((100 - candle.high) / 100) * 100;
          
          return (
            <div
              key={candle.id}
              style={{
                ...styles.candleWrapper,
                left: `${(index / candles.length) * 100}%`,
              }}
            >
              {/* Wick (thin line) */}
              <div
                style={{
                  ...styles.wick,
                  top: `${wickTop}%`,
                  height: `${height}%`,
                }}
              />
              
              {/* Body (thick candle) */}
              <div
                style={{
                  ...styles.candleBody,
                  top: `${bodyTop}%`,
                  height: `${Math.max(bodyHeight, 2)}%`,
                  background: candle.isGreen
                    ? 'linear-gradient(180deg, #00FFD1 0%, #00AA88 100%)'
                    : 'linear-gradient(180deg, #FF4444 0%, #CC2222 100%)',
                  boxShadow: candle.isGreen
                    ? '0 0 10px rgba(0, 255, 209, 0.5)'
                    : '0 0 10px rgba(255, 68, 68, 0.5)',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Glowing overlay effect */}
      <div style={styles.glowOverlay} />
      
      {/* Market Info Overlay */}
      <div style={styles.marketInfo}>
        <div style={styles.infoBox}>
          <div style={styles.infoLabel}>BNB/USDT</div>
          <div style={styles.infoValue}>
            ${candles[candles.length - 1]?.close.toFixed(2) || '0.00'}
          </div>
          <div style={{
            ...styles.infoChange,
            color: candles[candles.length - 1]?.isGreen ? '#00FFD1' : '#FF4444',
          }}>
            {candles[candles.length - 1]?.isGreen ? '▲' : '▼'} 
            {' '}{Math.abs(((candles[candles.length - 1]?.close - candles[candles.length - 1]?.open) / candles[candles.length - 1]?.open * 100) || 0).toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  chartContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(180deg, #000000 0%, #0a0a0a 100%)',
    overflow: 'hidden',
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '20px 0',
    zIndex: 1,
  },
  gridLine: {
    width: '100%',
    height: '1px',
    background: 'rgba(255, 215, 0, 0.1)',
  },
  candlesContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    padding: '20px 10px',
    zIndex: 2,
  },
  candleWrapper: {
    position: 'absolute',
    width: '2%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wick: {
    position: 'absolute',
    width: '2px',
    background: 'rgba(255, 255, 255, 0.6)',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  candleBody: {
    position: 'absolute',
    width: '100%',
    left: 0,
    border: '1px solid rgba(255, 255, 255, 0.2)',
    transition: 'all 0.5s ease-in-out',
  },
  glowOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    background: 'linear-gradient(to top, rgba(255, 215, 0, 0.08), transparent)',
    pointerEvents: 'none',
    zIndex: 3,
  },
  marketInfo: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    zIndex: 10,
  },
  infoBox: {
    background: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(10px)',
    padding: '16px 24px',
    border: '1px solid rgba(255, 215, 0, 0.4)',
    boxShadow: '0 0 20px rgba(255, 215, 0, 0.2)',
  },
  infoLabel: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    marginBottom: '6px',
    fontWeight: 500,
  },
  infoValue: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#FFD700',
    textShadow: '0 0 20px rgba(255, 215, 0, 0.6)',
    marginBottom: '4px',
    letterSpacing: '-0.5px',
  },
  infoChange: {
    fontSize: '14px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
};

export default CandlestickChart;
