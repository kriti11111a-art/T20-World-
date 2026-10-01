import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Search, Star, Clock } from 'lucide-react';
import Header from '../components/Header';
import { useTheme } from '../context/ThemeContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Market = () => {
  const { colors } = useTheme();
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('crypto');

  // Sample crypto data with realistic prices
  const cryptoData = [
    { symbol: 'BTC', name: 'Bitcoin', price: 67432.50, change: 2.45, icon: '₿' },
    { symbol: 'ETH', name: 'Ethereum', price: 3521.80, change: 1.82, icon: 'Ξ' },
    { symbol: 'BNB', name: 'BNB', price: 598.25, change: -0.54, icon: '◈' },
    { symbol: 'SOL', name: 'Solana', price: 172.40, change: 5.21, icon: '◎' },
    { symbol: 'XRP', name: 'XRP', price: 0.5234, change: -1.23, icon: '✕' },
    { symbol: 'ADA', name: 'Cardano', price: 0.4521, change: 0.87, icon: '₳' },
    { symbol: 'DOGE', name: 'Dogecoin', price: 0.1245, change: 3.45, icon: 'Ð' },
    { symbol: 'DOT', name: 'Polkadot', price: 7.82, change: -2.12, icon: '●' },
  ];

  const forexData = [
    { symbol: 'EUR/USD', name: 'Euro/Dollar', price: 1.0892, change: 0.12 },
    { symbol: 'GBP/USD', name: 'Pound/Dollar', price: 1.2734, change: -0.08 },
    { symbol: 'USD/JPY', name: 'Dollar/Yen', price: 154.82, change: 0.24 },
    { symbol: 'AUD/USD', name: 'Aussie/Dollar', price: 0.6543, change: 0.15 },
    { symbol: 'USD/CAD', name: 'Dollar/Loonie', price: 1.3654, change: -0.05 },
    { symbol: 'USD/INR', name: 'Dollar/Rupee', price: 83.42, change: 0.03 },
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const filteredData = (activeTab === 'crypto' ? cryptoData : forexData).filter(item =>
    item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: '#031A33',
      paddingTop: '80px',
      paddingBottom: '100px',
    }}>
      <Header />
      
      <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 800,
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <TrendingUp size={24} color="#16E0FF" />
            Market
          </h1>
          <button
            onClick={() => setLoading(true)}
            style={{
              background: 'rgba(22, 224, 255, 0.15)',
              border: '1px solid rgba(22, 224, 255, 0.3)',
              borderRadius: '10px',
              padding: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RefreshCw size={18} color="#16E0FF" className={loading ? 'spin' : ''} />
          </button>
        </div>

        {/* Search Bar */}
        <div style={{
          position: 'relative',
          marginBottom: '20px',
        }}>
          <Search
            size={18}
            color="#6B8299"
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
          <input
            type="text"
            placeholder="Search markets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 14px 14px 44px',
              background: 'rgba(6, 37, 68, 0.6)',
              border: '1px solid rgba(23, 77, 117, 0.5)',
              borderRadius: '12px',
              color: '#FFFFFF',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '0',
          marginBottom: '20px',
          background: 'rgba(6, 37, 68, 0.6)',
          borderRadius: '12px',
          padding: '4px',
          border: '1px solid rgba(23, 77, 117, 0.5)',
        }}>
          <button
            onClick={() => setActiveTab('crypto')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'crypto'
                ? 'linear-gradient(90deg, #087BFF 0%, #16E0FF 100%)'
                : 'transparent',
              color: activeTab === 'crypto' ? '#FFFFFF' : '#B8C7DC',
              transition: 'all 0.3s ease',
            }}
          >
            Crypto
          </button>
          <button
            onClick={() => setActiveTab('forex')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'forex'
                ? 'linear-gradient(90deg, #087BFF 0%, #16E0FF 100%)'
                : 'transparent',
              color: activeTab === 'forex' ? '#FFFFFF' : '#B8C7DC',
              transition: 'all 0.3s ease',
            }}
          >
            Forex
          </button>
        </div>

        {/* Market List */}
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#B8C7DC',
          }}>
            <RefreshCw size={32} color="#16E0FF" className="spin" style={{ marginBottom: '16px' }} />
            <p>Loading market data...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredData.map((item, index) => (
              <div
                key={index}
                style={{
                  background: 'linear-gradient(145deg, #0a1929 0%, #0d2847 100%)',
                  borderRadius: '14px',
                  padding: '16px',
                  border: '1px solid rgba(23, 77, 117, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'rgba(22, 224, 255, 0.15)',
                    border: '1px solid rgba(22, 224, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    color: '#16E0FF',
                    fontWeight: 700,
                  }}>
                    {item.icon || item.symbol.charAt(0)}
                  </div>
                  <div>
                    <div style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#FFFFFF',
                    }}>
                      {item.symbol}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#6B8299',
                    }}>
                      {item.name}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                  }}>
                    ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: item.price < 1 ? 4 : 2 })}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: item.change >= 0 ? '#0ECB81' : '#F6465D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '4px',
                  }}>
                    {item.change >= 0 ? (
                      <TrendingUp size={14} />
                    ) : (
                      <TrendingDown size={14} />
                    )}
                    {item.change >= 0 ? '+' : ''}{item.change}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Last Updated */}
        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#6B8299',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}>
          <Clock size={14} />
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* CSS for spin animation */}
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

export default Market;
