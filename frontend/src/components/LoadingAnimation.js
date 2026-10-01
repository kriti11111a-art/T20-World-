import React, { useState, useEffect } from 'react';

const LoadingAnimation = ({ duration = 1200, onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!visible) return null;

  return (
    <div className="loading-animation-overlay">
      <style>{`
        .loading-animation-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999999;
        }
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 25px;
          padding: 30px 40px;
          background: rgba(20, 25, 30, 0.95);
          border-radius: 16px;
          border: 1px solid rgba(255, 215, 0, 0.2);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.1);
          min-height: 120px;
        }
        .candle-container {
          display: flex;
          align-items: flex-end;
          gap: 15px;
          height: 90px;
        }
        .candle {
          display: flex;
          flex-direction: column;
          align-items: center;
          transform-origin: bottom center;
        }
        .candle-1 { animation: pulse1 0.8s ease-in-out infinite; }
        .candle-2 { animation: pulse2 0.8s ease-in-out infinite 0.2s; }
        .candle-3 { animation: pulse3 0.8s ease-in-out infinite 0.4s; }
        .candle-4 { animation: pulse1 0.8s ease-in-out infinite 0.3s; }
        @keyframes pulse1 {
          0%, 100% { transform: scaleY(1); opacity: 1; }
          50% { transform: scaleY(1.3); opacity: 0.9; }
        }
        @keyframes pulse2 {
          0%, 100% { transform: scaleY(1.2); opacity: 1; }
          50% { transform: scaleY(0.8); opacity: 0.9; }
        }
        @keyframes pulse3 {
          0%, 100% { transform: scaleY(0.9); opacity: 1; }
          50% { transform: scaleY(1.2); opacity: 0.9; }
        }
        .wick {
          width: 2px;
          border-radius: 1px;
        }
        .candle-body {
          width: 20px;
          border-radius: 4px;
        }
        .green-wick { background: #0ECB81; }
        .red-wick { background: #F6465D; }
        .green-body {
          background: linear-gradient(180deg, #0ECB81 0%, #00a86b 100%);
          box-shadow: 0 0 20px rgba(14, 203, 129, 0.6);
        }
        .red-body {
          background: linear-gradient(180deg, #F6465D 0%, #d63447 100%);
          box-shadow: 0 0 20px rgba(246, 70, 93, 0.6);
        }
        .logo-text {
          font-size: 28px;
          font-weight: 800;
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 2px;
          margin: 0;
          text-shadow: 0 0 30px rgba(255, 215, 0, 0.4);
        }
        .tagline {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .progress-container {
          width: 200px;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
        }
        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #FFD700 0%, #0ECB81 50%, #FFD700 100%);
          border-radius: 2px;
          animation: progressMove 1.2s ease-out forwards;
        }
        @keyframes progressMove {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
      
      <div className="loading-container">
        <div className="candle-container">
          {/* Green Candle */}
          <div className="candle candle-1">
            <div className="wick green-wick" style={{height: '15px'}}></div>
            <div className="candle-body green-body" style={{height: '40px'}}></div>
            <div className="wick green-wick" style={{height: '10px'}}></div>
          </div>
          
          {/* Red Candle */}
          <div className="candle candle-2">
            <div className="wick red-wick" style={{height: '12px'}}></div>
            <div className="candle-body red-body" style={{height: '50px'}}></div>
            <div className="wick red-wick" style={{height: '8px'}}></div>
          </div>
          
          {/* Green Candle */}
          <div className="candle candle-3">
            <div className="wick green-wick" style={{height: '18px'}}></div>
            <div className="candle-body green-body" style={{height: '35px'}}></div>
            <div className="wick green-wick" style={{height: '12px'}}></div>
          </div>
          
          {/* Red Candle */}
          <div className="candle candle-4">
            <div className="wick red-wick" style={{height: '10px'}}></div>
            <div className="candle-body red-body" style={{height: '30px'}}></div>
            <div className="wick red-wick" style={{height: '15px'}}></div>
          </div>
        </div>
        
        <h1 className="logo-text">TradeGo</h1>
        <p className="tagline">Smart Trading, Smart Earning</p>
        
        <div className="progress-container">
          <div className="progress-bar"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
