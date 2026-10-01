import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { 
  TrendingUp, TrendingDown, RefreshCw, ChevronDown, X, Gift, Sparkles
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { isDark, colors } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [coins, setCoins] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  // Start with loading=false if user exists - instant UI
  const [loading, setLoading] = useState(() => !user);
  const [chartData, setChartData] = useState([]);
  const [tradeAmount, setTradeAmount] = useState('100');
  
  // ========== FOREX TRADING STATES ==========
  const defaultForexPairs = [
    { symbol: 'XAUUSD', name: 'Gold', price: 2035.50, change: 0.45, icon: '🪙' },
    { symbol: 'XTIUSD', name: 'Crude Oil', price: 78.25, change: -0.32, icon: '🛢️' },
    { symbol: 'EURUSD', name: 'EUR/USD', price: 1.0845, change: 0.12, icon: '💶' },
    { symbol: 'GBPUSD', name: 'GBP/USD', price: 1.2685, change: -0.08, icon: '💷' },
    { symbol: 'USDJPY', name: 'USD/JPY', price: 148.65, change: 0.25, icon: '💴' },
  ];
  const [forexPairs, setForexPairs] = useState(defaultForexPairs);
  // Default select Gold on load
  const [selectedForex, setSelectedForex] = useState(defaultForexPairs[0]);
  const [forexChartData, setForexChartData] = useState([]);
  const [forexBotTrades, setForexBotTrades] = useState([]);
  const [showForexList, setShowForexList] = useState(false);
  const [forexChartLoading, setForexChartLoading] = useState(false);
  const [selectedForexTimeframe, setSelectedForexTimeframe] = useState('4h');
  
  // Forex Order Book State (animated)
  const [forexOrderBook, setForexOrderBook] = useState({
    asks: Array(5).fill(0).map((_, i) => ({ width: 20 + Math.random() * 60, amount: (Math.random() * 50 + 10).toFixed(3) })),
    bids: Array(5).fill(0).map((_, i) => ({ width: 20 + Math.random() * 60, amount: (Math.random() * 50 + 10).toFixed(3) })),
    bidPercent: 45 + Math.random() * 10,
  });
  const [forexTrades, setForexTrades] = useState(
    Array(8).fill(0).map((_, i) => ({
      isBuy: Math.random() > 0.5,
      priceOffset: (Math.random() - 0.5) * 0.001,
      amount: (Math.random() * 20 + 1).toFixed(3),
      time: new Date(Date.now() - i * 30000)
    }))
  );
  
  // Forex timeframe options (like crypto)
  const forexTimeframes = [
    { label: '1m', value: '1m' },
    { label: '5m', value: '5m' },
    { label: '1H', value: '1h' },
    { label: '6H', value: '6h' },
    { label: '8H', value: '8h' },
    { label: '24H', value: '1d' },
  ];
  
  // Check if Forex market is open (closed on weekends)
  const isForexMarketOpen = () => {
    const now = new Date();
    const day = now.getUTCDay(); // 0 = Sunday, 6 = Saturday
    const hour = now.getUTCHours();
    
    // Forex market closes Friday 22:00 UTC and opens Sunday 22:00 UTC
    if (day === 0 && hour < 22) return false; // Sunday before 22:00 UTC
    if (day === 6) return false; // All of Saturday
    if (day === 5 && hour >= 22) return false; // Friday after 22:00 UTC
    
    return true;
  };
  
  const [forexMarketOpen, setForexMarketOpen] = useState(isForexMarketOpen());
  
  // Update forex market status every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setForexMarketOpen(isForexMarketOpen());
    }, 60000);
    return () => clearInterval(interval);
  }, []);
  
  // Welcome Popup State - Check URL param
  const [showWelcomePopup, setShowWelcomePopup] = useState(() => {
    const welcome = searchParams.get('welcome');
    return welcome === 'true';
  });
  
  // Crypto Order Book State (animated like forex)
  const [cryptoOrderBook, setCryptoOrderBook] = useState({
    asks: Array(5).fill(0).map((_, i) => ({ width: 20 + Math.random() * 60, amount: (Math.random() * 2 + 0.1).toFixed(5) })),
    bids: Array(5).fill(0).map((_, i) => ({ width: 20 + Math.random() * 60, amount: (Math.random() * 2 + 0.1).toFixed(5) })),
    bidPercent: 45 + Math.random() * 10,
  });
  const [cryptoTrades, setCryptoTrades] = useState(
    Array(8).fill(0).map((_, i) => ({
      isBuy: Math.random() > 0.5,
      priceOffset: (Math.random() - 0.5) * 100,
      amount: (Math.random() * 0.5 + 0.01).toFixed(5),
      time: new Date(Date.now() - i * 15000)
    }))
  );
  
  // Real Blockchain Transactions State
  const [blockchainTxs, setBlockchainTxs] = useState([]);
  const [txLoading, setTxLoading] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [selectedTxData, setSelectedTxData] = useState(null);
  
  // Handle transaction click - Show in-app transaction detail modal
  const handleTxClick = (e, tx) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get current coin price for USDT value calculation
    const currentPrice = selectedCoin?.current_price || 0;
    const usdtValue = tx.value * currentPrice;
    
    // Set transaction data with additional details
    setSelectedTxData({
      ...tx,
      coinName: selectedCoin?.name || tx.coin,
      coinSymbol: selectedCoin?.symbol?.toUpperCase() || tx.coin,
      coinImage: selectedCoin?.image || null,
      usdtValue: usdtValue,
      currentPrice: currentPrice,
      status: 'Success',
      confirmations: Math.floor(Math.random() * 50) + 10,
      gasUsed: (Math.random() * 0.001 + 0.0001).toFixed(6),
      gasFee: (Math.random() * 0.5 + 0.1).toFixed(4),
    });
    setShowTxModal(true);
  };
  
  // Fetch Real BSC Transactions from Backend API for selected coin
  const fetchRealBlockchainTxs = async (coinSymbol = 'bnb') => {
    try {
      setTxLoading(true);
      const API_URL = process.env.REACT_APP_BACKEND_URL;
      
      const response = await fetch(`${API_URL}/api/blockchain/transactions?coin=${coinSymbol}`);
      const data = await response.json();
      
      if (data.transactions && data.transactions.length > 0) {
        const txs = data.transactions.map(tx => ({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value,
          timeStamp: new Date(tx.timeStamp * 1000),
          isBuy: tx.isBuy,
          blockNumber: tx.blockNumber,
          coin: tx.coin || coinSymbol.toUpperCase(),
          tokenAddress: tx.tokenAddress || null
        }));
        setBlockchainTxs(txs);
        console.log(`✅ Real ${coinSymbol.toUpperCase()} transactions fetched:`, txs.length);
      }
    } catch (error) {
      console.error('Error fetching blockchain txs:', error);
      generateFallbackTxs();
    } finally {
      setTxLoading(false);
    }
  };
  
  // Fallback transactions if API fails
  const generateFallbackTxs = () => {
    const txs = Array(8).fill(0).map((_, i) => {
      const randomHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      return {
        hash: randomHash,
        from: '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
        to: '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
        value: (Math.random() * 2 + 0.01).toFixed(4),
        timeStamp: new Date(Date.now() - i * (Math.random() * 30000 + 5000)),
        isBuy: Math.random() > 0.5,
        coin: 'BNB'
      };
    });
    setBlockchainTxs(txs);
  };
  
  // Initialize with BNB transactions
  useEffect(() => {
    fetchRealBlockchainTxs('bnb');
  }, []);
  
  // Fetch transactions when selected coin changes
  useEffect(() => {
    if (selectedCoin) {
      fetchRealBlockchainTxs(selectedCoin.symbol);
    }
  }, [selectedCoin]);
  
  // Auto-refresh transactions every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedCoin) {
        fetchRealBlockchainTxs(selectedCoin.symbol);
      } else {
        fetchRealBlockchainTxs('bnb');
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [selectedCoin]);
  
  // Remove welcome param from URL after showing popup
  useEffect(() => {
    if (searchParams.get('welcome') === 'true') {
      searchParams.delete('welcome');
      setSearchParams(searchParams, { replace: true });
    }
  }, []);
  
  // Calculate user's balance from auth context or demo
  const calculateUserBalance = () => {
    if (user) {
      // Real user balance from backend - show 100%
      return user.balance + user.total_invested + user.total_earned;
    }
    // Demo balance for non-logged in users
    return 1169.50;
  };

  const [userBalance, setUserBalance] = useState(() => {
    const saved = localStorage.getItem('demoBalance');
    const realBalance = calculateUserBalance();
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, USDT: realBalance };
    }
    return { USDT: realBalance, holdings: {} };
  });

  // Update balance when user changes
  useEffect(() => {
    if (user) {
      const newBalance = user.balance + user.total_invested + user.total_earned;
      setUserBalance(prev => ({ ...prev, USDT: newBalance || 0 }));
    }
  }, [user]);

  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [recentTrades, setRecentTrades] = useState([]);
  const [maData, setMaData] = useState({ ma7: [], ma25: [] });
  const [showCoinList, setShowCoinList] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('4h');
  const [chartLoading, setChartLoading] = useState(false);
  const [botTrades, setBotTrades] = useState([]);

  // Timeframe options
  const timeframes = [
    { label: '1s', value: '1s', binanceInterval: '1s' },
    { label: '5s', value: '5s', binanceInterval: '1s' },
    { label: '1m', value: '1m', binanceInterval: '1m' },
    { label: '30m', value: '30m', binanceInterval: '30m' },
    { label: '1H', value: '1h', binanceInterval: '1h' },
    { label: '4H', value: '4h', binanceInterval: '4h' },
    { label: '1D', value: '1d', binanceInterval: '1d' },
  ];

  // Generate bot trades when chart data changes
  useEffect(() => {
    if (chartData.length > 0) {
      generateBotTrades();
    }
  }, [chartData]);

  // Auto bot trading - generate new trades periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (chartData.length > 0 && Math.random() > 0.6) {
        addNewBotTrade();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [chartData, selectedCoin]);

  const generateBotTrades = () => {
    if (chartData.length < 10) return;
    
    const trades = [];
    // Generate 4-6 bot trades on chart
    const numTrades = Math.floor(Math.random() * 3) + 4;
    
    for (let i = 0; i < numTrades; i++) {
      const candleIdx = Math.floor(Math.random() * (chartData.length - 5)) + 2;
      const candle = chartData[candleIdx];
      const isBuy = Math.random() > 0.5;
      const price = isBuy ? candle.low * 0.999 : candle.high * 1.001;
      
      trades.push({
        id: `bot-${i}`,
        type: isBuy ? 'buy' : 'sell',
        price: price,
        candleIdx: candleIdx,
        amount: (Math.random() * 0.05 + 0.01).toFixed(4),
        profit: isBuy ? null : `+${(Math.random() * 2 + 0.5).toFixed(2)}%`,
      });
    }
    
    setBotTrades(trades);
  };

  const addNewBotTrade = () => {
    if (!selectedCoin || chartData.length < 5) return;
    
    const lastCandle = chartData[chartData.length - 1];
    const isBuy = Math.random() > 0.5;
    const price = isBuy 
      ? lastCandle.close * (1 - Math.random() * 0.001)
      : lastCandle.close * (1 + Math.random() * 0.001);
    
    const newTrade = {
      id: `bot-${Date.now()}`,
      type: isBuy ? 'buy' : 'sell',
      price: price,
      candleIdx: chartData.length - 1,
      amount: (Math.random() * 0.05 + 0.01).toFixed(4),
      profit: isBuy ? null : `+${(Math.random() * 2 + 0.5).toFixed(2)}%`,
      isNew: true,
    };
    
    setBotTrades(prev => [...prev.slice(-5), newTrade]);
  };

  // ========== FOREX FUNCTIONS ==========
  
  // Generate fake forex chart data
  const generateForexChartData = (pair) => {
    if (!pair) return;
    setForexChartLoading(true);
    
    const basePrice = pair.price;
    const data = [];
    const numCandles = 50;
    let currentPrice = basePrice * (1 - Math.random() * 0.02); // Start slightly lower
    
    // Time interval based on selected timeframe
    const timeIntervals = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '8h': 8 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000,
    };
    const interval = timeIntervals[selectedForexTimeframe] || timeIntervals['4h'];
    
    for (let i = 0; i < numCandles; i++) {
      const volatility = pair.symbol.includes('XAU') ? 0.003 : 
                         pair.symbol.includes('XTI') ? 0.005 : 0.001;
      const change = (Math.random() - 0.5) * volatility * currentPrice;
      const open = currentPrice;
      const close = currentPrice + change;
      const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
      const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);
      
      data.push({
        time: Date.now() - (numCandles - i) * interval,
        open, high, low, close,
        volume: Math.random() * 10000 + 5000
      });
      
      currentPrice = close;
    }
    
    setForexChartData(data);
    setForexChartLoading(false);
  };
  
  // Generate forex bot trades
  const generateForexBotTrades = () => {
    if (forexChartData.length < 10 || !forexMarketOpen) return;
    
    const trades = [];
    const numTrades = Math.floor(Math.random() * 3) + 3;
    
    for (let i = 0; i < numTrades; i++) {
      const candleIdx = Math.floor(Math.random() * (forexChartData.length - 5)) + 2;
      const candle = forexChartData[candleIdx];
      const isBuy = Math.random() > 0.5;
      const price = isBuy ? candle.low * 0.9995 : candle.high * 1.0005;
      
      trades.push({
        id: `forex-bot-${i}`,
        type: isBuy ? 'buy' : 'sell',
        price: price,
        candleIdx: candleIdx,
        amount: (Math.random() * 2 + 0.5).toFixed(2),
        profit: isBuy ? null : `+${(Math.random() * 1.5 + 0.3).toFixed(2)}%`,
      });
    }
    
    setForexBotTrades(trades);
  };
  
  // Add new forex bot trade
  const addNewForexBotTrade = () => {
    if (!selectedForex || forexChartData.length < 5 || !forexMarketOpen) return;
    
    const lastCandle = forexChartData[forexChartData.length - 1];
    const isBuy = Math.random() > 0.5;
    const price = isBuy 
      ? lastCandle.close * 0.9998
      : lastCandle.close * 1.0002;
    
    const newTrade = {
      id: `forex-bot-${Date.now()}`,
      type: isBuy ? 'buy' : 'sell',
      price: price,
      candleIdx: forexChartData.length - 1,
      amount: (Math.random() * 2 + 0.5).toFixed(2),
      profit: isBuy ? null : `+${(Math.random() * 1.5 + 0.3).toFixed(2)}%`,
      isNew: true,
    };
    
    setForexBotTrades(prev => [...prev.slice(-4), newTrade]);
  };
  
  // Update forex prices periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (forexMarketOpen) {
        setForexPairs(prev => prev.map(pair => ({
          ...pair,
          price: pair.price * (1 + (Math.random() - 0.5) * 0.001),
          change: (Math.random() - 0.5) * 2
        })));
        
        // Also update selectedForex if it exists
        if (selectedForex) {
          setSelectedForex(prev => ({
            ...prev,
            price: prev.price * (1 + (Math.random() - 0.5) * 0.001),
            change: (Math.random() - 0.5) * 2
          }));
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [forexMarketOpen, selectedForex]);
  
  // Generate forex chart when pair or timeframe selected
  useEffect(() => {
    if (selectedForex) {
      generateForexChartData(selectedForex);
    }
  // Use symbol as dependency to trigger on pair change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedForex?.symbol, selectedForexTimeframe]);
  
  // Generate forex bot trades when chart data ready
  useEffect(() => {
    if (forexChartData.length > 0 && forexMarketOpen) {
      generateForexBotTrades();
    }
  }, [forexChartData, forexMarketOpen]);
  
  // Auto forex bot trading
  useEffect(() => {
    const interval = setInterval(() => {
      if (forexChartData.length > 0 && forexMarketOpen && Math.random() > 0.6) {
        addNewForexBotTrade();
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [forexChartData, selectedForex, forexMarketOpen]);

  // ========== FOREX ORDER BOOK ANIMATION ==========
  useEffect(() => {
    const interval = setInterval(() => {
      if (forexMarketOpen) {
        // Animate order book - change widths and amounts
        setForexOrderBook(prev => ({
          asks: prev.asks.map(ask => ({
            width: Math.max(10, Math.min(90, ask.width + (Math.random() - 0.5) * 15)),
            amount: (parseFloat(ask.amount) + (Math.random() - 0.5) * 5).toFixed(3)
          })),
          bids: prev.bids.map(bid => ({
            width: Math.max(10, Math.min(90, bid.width + (Math.random() - 0.5) * 15)),
            amount: (parseFloat(bid.amount) + (Math.random() - 0.5) * 5).toFixed(3)
          })),
          bidPercent: Math.max(30, Math.min(70, prev.bidPercent + (Math.random() - 0.5) * 5))
        }));
        
        // Add new trade at top
        if (Math.random() > 0.3) {
          setForexTrades(prev => {
            const newTrade = {
              isBuy: Math.random() > 0.5,
              priceOffset: (Math.random() - 0.5) * 0.001,
              amount: (Math.random() * 20 + 1).toFixed(3),
              time: new Date()
            };
            return [newTrade, ...prev.slice(0, 7)];
          });
        }
      }
    }, 800); // Update every 800ms for smooth animation
    return () => clearInterval(interval);
  }, [forexMarketOpen]);

  // Save balance to localStorage
  useEffect(() => {
    localStorage.setItem('demoBalance', JSON.stringify(userBalance));
  }, [userBalance]);

  // Fetch coins
  useEffect(() => {
    fetchCoins();
    const interval = setInterval(fetchCoins, 15000);
    return () => clearInterval(interval);
  }, []);

  // Fetch chart data when coin or timeframe changes
  useEffect(() => {
    if (selectedCoin) {
      fetchChartData(selectedCoin.symbol, selectedTimeframe);
    }
  }, [selectedCoin, selectedTimeframe]);

  // ========== CRYPTO ORDER BOOK ANIMATION (like forex) ==========
  useEffect(() => {
    const interval = setInterval(() => {
      // Animate crypto order book - change widths and amounts
      setCryptoOrderBook(prev => ({
        asks: prev.asks.map(ask => ({
          width: Math.max(10, Math.min(90, ask.width + (Math.random() - 0.5) * 15)),
          amount: (Math.max(0.01, parseFloat(ask.amount) + (Math.random() - 0.5) * 0.3)).toFixed(5)
        })),
        bids: prev.bids.map(bid => ({
          width: Math.max(10, Math.min(90, bid.width + (Math.random() - 0.5) * 15)),
          amount: (Math.max(0.01, parseFloat(bid.amount) + (Math.random() - 0.5) * 0.3)).toFixed(5)
        })),
        bidPercent: Math.max(30, Math.min(70, prev.bidPercent + (Math.random() - 0.5) * 5))
      }));
      
      // Add new crypto trade at top
      if (Math.random() > 0.3) {
        setCryptoTrades(prev => {
          const newTrade = {
            isBuy: Math.random() > 0.5,
            priceOffset: (Math.random() - 0.5) * 100,
            amount: (Math.random() * 0.5 + 0.01).toFixed(5),
            time: new Date()
          };
          return [newTrade, ...prev.slice(0, 7)];
        });
      }
    }, 800); // Update every 800ms for smooth animation
    return () => clearInterval(interval);
  }, []);

  // Generate fake order book and trades (keep for initial load)
  useEffect(() => {
    if (selectedCoin) {
      generateOrderBook();
      generateRecentTrades();
    }
  }, [selectedCoin]);

  // Fetch real candlestick data from Binance
  const fetchChartData = async (symbol, timeframe) => {
    setChartLoading(true);
    try {
      const binanceSymbol = `${symbol.toUpperCase()}USDT`;
      const interval = timeframes.find(t => t.value === timeframe)?.binanceInterval || '1m';
      
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&limit=30`
      );
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        const candles = data.map(k => ({
          time: k[0],
          open: parseFloat(k[1]),
          high: parseFloat(k[2]),
          low: parseFloat(k[3]),
          close: parseFloat(k[4]),
          volume: parseFloat(k[5]),
        }));
        
        setChartData(candles);
        calculateMA(candles);
      } else {
        // Fallback to generated data
        generateFallbackChartData();
      }
    } catch (error) {
      console.error('Error fetching chart:', error);
      generateFallbackChartData();
    }
    setChartLoading(false);
  };

  const generateFallbackChartData = () => {
    if (!selectedCoin) return;
    const basePrice = selectedCoin.current_price;
    const candles = [];
    for (let i = 0; i < 30; i++) {
      const open = basePrice * (1 + (Math.random() - 0.5) * 0.02);
      const close = basePrice * (1 + (Math.random() - 0.5) * 0.02);
      candles.push({
        time: Date.now() - (30 - i) * 60000,
        open,
        high: Math.max(open, close) * (1 + Math.random() * 0.005),
        low: Math.min(open, close) * (1 - Math.random() * 0.005),
        close,
      });
    }
    setChartData(candles);
    calculateMA(candles);
  };

  const calculateMA = (candles) => {
    const ma7 = [], ma25 = [];
    for (let i = 0; i < candles.length; i++) {
      if (i >= 6) {
        const sum7 = candles.slice(i - 6, i + 1).reduce((a, b) => a + b.close, 0);
        ma7.push(sum7 / 7);
      } else {
        ma7.push(null);
      }
      if (i >= 24) {
        const sum25 = candles.slice(i - 24, i + 1).reduce((a, b) => a + b.close, 0);
        ma25.push(sum25 / 25);
      } else {
        ma25.push(null);
      }
    }
    setMaData({ ma7, ma25 });
  };

  // Cache for crypto prices - 15 second validity for fresh data
  const [coinsCache, setCoinsCache] = useState(null);

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  // Fetch coins - using ref to avoid stale closure
  const selectedCoinRef = useRef(selectedCoin);
  
  // Keep ref updated
  useEffect(() => {
    selectedCoinRef.current = selectedCoin;
  }, [selectedCoin]);

  const fetchCoins = async (forceRefresh = false) => {
    // Skip cache if force refresh
    if (!forceRefresh && coinsCache && Date.now() - coinsCache.timestamp < 15000) {
      setCoins(coinsCache.data);
      // Only set default coin if nothing selected
      if (!selectedCoinRef.current) {
        setSelectedCoin(coinsCache.data[0]);
      }
      setLoading(false);
      return;
    }

    try {
      // Fetch real prices from backend proxy (Kraken API)
      const response = await fetch(`${API_URL}/api/crypto/prices?t=${Date.now()}`);
      
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          // Update cache
          const cacheData = {
            data: data,
            timestamp: Date.now()
          };
          setCoinsCache(cacheData);
          setCoins(data);
          
          // Only set default coin if nothing selected
          if (!selectedCoinRef.current) {
            setSelectedCoin(data[0]);
          } else {
            // Update selected coin's price data while keeping it selected
            const updatedCoin = data.find(c => c.symbol === selectedCoinRef.current.symbol);
            if (updatedCoin) {
              setSelectedCoin(updatedCoin);
            }
          }
          setLoading(false);
          return;
        }
      }
      
      // Last resort: use static fallback
      loadFallbackCoins();
    } catch (error) {
      console.error('Error fetching coins:', error);
      
      // Try cached data first
      const cachedFallback = localStorage.getItem('coinsCache');
      if (cachedFallback) {
        const parsed = JSON.parse(cachedFallback);
        setCoins(parsed.data);
        if (!selectedCoinRef.current) {
          setSelectedCoin(parsed.data[0]);
        }
        setLoading(false);
        return;
      }
      
      // Final fallback
      loadFallbackCoins();
    }
  };

  // Clear old localStorage cache on page load
  useEffect(() => {
    localStorage.removeItem('coinsCache');
  }, []);

  const loadFallbackCoins = () => {
    // Static fallback data - approximate current market prices (Jan 2026)
    const fallbackCoins = [
      { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 87800, price_change_percentage_24h: -1.5, image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png' },
      { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 2890, price_change_percentage_24h: -2.0, image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
      { id: 'tether', symbol: 'usdt', name: 'Tether', current_price: 1.00, price_change_percentage_24h: 0.01, image: 'https://assets.coingecko.com/coins/images/325/small/Tether.png' },
      { id: 'binancecoin', symbol: 'bnb', name: 'BNB', current_price: 680, price_change_percentage_24h: -1.5, image: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png' },
      { id: 'ripple', symbol: 'xrp', name: 'XRP', current_price: 1.85, price_change_percentage_24h: -3.0, image: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png' },
      { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 122, price_change_percentage_24h: -3.5, image: 'https://assets.coingecko.com/coins/images/4128/small/solana.png' },
      { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', current_price: 0.12, price_change_percentage_24h: -3.0, image: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png' },
      { id: 'cardano', symbol: 'ada', name: 'Cardano', current_price: 0.58, price_change_percentage_24h: -4.0, image: 'https://assets.coingecko.com/coins/images/975/small/cardano.png' },
      { id: 'avalanche-2', symbol: 'avax', name: 'Avalanche', current_price: 22, price_change_percentage_24h: -3.5, image: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png' },
      { id: 'polkadot', symbol: 'dot', name: 'Polkadot', current_price: 4.5, price_change_percentage_24h: -4.5, image: 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png' },
      { id: 'tron', symbol: 'trx', name: 'TRON', current_price: 0.30, price_change_percentage_24h: -2.0, image: 'https://assets.coingecko.com/coins/images/1094/small/tron-logo.png' },
      { id: 'chainlink', symbol: 'link', name: 'Chainlink', current_price: 15, price_change_percentage_24h: -3.0, image: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png' },
      { id: 'matic-network', symbol: 'matic', name: 'Polygon', current_price: 0.30, price_change_percentage_24h: -4.0, image: 'https://assets.coingecko.com/coins/images/4713/small/polygon.png' },
      { id: 'shiba-inu', symbol: 'shib', name: 'Shiba Inu', current_price: 0.000012, price_change_percentage_24h: -5.0, image: 'https://assets.coingecko.com/coins/images/11939/small/shiba.png' },
      { id: 'litecoin', symbol: 'ltc', name: 'Litecoin', current_price: 80, price_change_percentage_24h: -2.5, image: 'https://assets.coingecko.com/coins/images/2/small/litecoin.png' },
      { id: 'uniswap', symbol: 'uni', name: 'Uniswap', current_price: 8.5, price_change_percentage_24h: -3.5, image: 'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png' },
      { id: 'stellar', symbol: 'xlm', name: 'Stellar', current_price: 0.28, price_change_percentage_24h: -4.0, image: 'https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png' },
      { id: 'monero', symbol: 'xmr', name: 'Monero', current_price: 180, price_change_percentage_24h: -2.0, image: 'https://assets.coingecko.com/coins/images/69/small/monero_logo.png' },
      { id: 'cosmos', symbol: 'atom', name: 'Cosmos', current_price: 5.2, price_change_percentage_24h: -4.5, image: 'https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png' },
      { id: 'pepe', symbol: 'pepe', name: 'Pepe', current_price: 0.000012, price_change_percentage_24h: -5.0, image: 'https://assets.coingecko.com/coins/images/29850/small/pepe-token.jpeg' },
    ];
    
    setCoins(fallbackCoins);
    if (!selectedCoinRef.current) {
      setSelectedCoin(fallbackCoins[0]);
    }
    setLoading(false);
  };

  const generateOrderBook = () => {
    if (!selectedCoin) return;
    const price = selectedCoin.current_price;
    const bids = [], asks = [];
    
    for (let i = 0; i < 8; i++) {
      const bidPrice = price * (1 - (i + 1) * 0.0002 - Math.random() * 0.0001);
      const askPrice = price * (1 + (i + 1) * 0.0002 + Math.random() * 0.0001);
      bids.push({
        price: bidPrice,
        amount: (Math.random() * 2 + 0.1).toFixed(4),
        total: (Math.random() * 50000 + 1000).toFixed(2),
      });
      asks.push({
        price: askPrice,
        amount: (Math.random() * 2 + 0.1).toFixed(4),
        total: (Math.random() * 50000 + 1000).toFixed(2),
      });
    }
    setOrderBook({ bids, asks: asks.reverse() });
  };

  const generateRecentTrades = () => {
    if (!selectedCoin) return;
    const trades = [];
    const price = selectedCoin.current_price;
    
    for (let i = 0; i < 10; i++) {
      const isBuy = Math.random() > 0.5;
      trades.push({
        price: price * (1 + (Math.random() - 0.5) * 0.001),
        amount: (Math.random() * 0.5 + 0.01).toFixed(4),
        time: new Date(Date.now() - i * 30000).toLocaleTimeString(),
        type: isBuy ? 'buy' : 'sell',
      });
    }
    setRecentTrades(trades);
  };

  const addNewTrade = () => {
    if (!selectedCoin) return;
    const price = selectedCoin.current_price;
    const isBuy = Math.random() > 0.5;
    const newTrade = {
      price: price * (1 + (Math.random() - 0.5) * 0.001),
      amount: (Math.random() * 0.5 + 0.01).toFixed(4),
      time: new Date().toLocaleTimeString(),
      type: isBuy ? 'buy' : 'sell',
    };
    setRecentTrades(prev => [newTrade, ...prev.slice(0, 9)]);
  };

  const selectCoin = (coin) => {
    setSelectedCoin(coin);
    setShowCoinList(false);
  };

  const handleTrade = (type) => {
    if (!selectedCoin || !tradeAmount || parseFloat(tradeAmount) <= 0) return;
    
    const amount = parseFloat(tradeAmount);
    const coinSymbol = selectedCoin.symbol.toUpperCase();
    const price = selectedCoin.current_price;
    const coinAmount = amount / price;

    if (type === 'buy') {
      if (amount > userBalance.USDT) {
        alert('Insufficient USDT balance!');
        return;
      }
      setUserBalance(prev => ({
        USDT: prev.USDT - amount,
        holdings: {
          ...prev.holdings,
          [coinSymbol]: (prev.holdings[coinSymbol] || 0) + coinAmount
        }
      }));
      
      // Add to recent trades
      const newTrade = {
        price: price,
        amount: coinAmount.toFixed(4),
        time: new Date().toLocaleTimeString(),
        type: 'buy',
      };
      setRecentTrades(prev => [newTrade, ...prev.slice(0, 9)]);
      
    } else {
      const holding = userBalance.holdings[coinSymbol] || 0;
      if (coinAmount > holding) {
        alert(`Insufficient ${coinSymbol} balance!`);
        return;
      }
      setUserBalance(prev => ({
        USDT: prev.USDT + amount,
        holdings: {
          ...prev.holdings,
          [coinSymbol]: prev.holdings[coinSymbol] - coinAmount
        }
      }));
      
      const newTrade = {
        price: price,
        amount: coinAmount.toFixed(4),
        time: new Date().toLocaleTimeString(),
        type: 'sell',
      };
      setRecentTrades(prev => [newTrade, ...prev.slice(0, 9)]);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0.00';
    if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (price >= 1) return price.toFixed(2);
    return price.toFixed(4);
  };

  // Calculate bid/ask percentages
  const totalBids = orderBook.bids.reduce((a, b) => a + parseFloat(b.total), 0);
  const totalAsks = orderBook.asks.reduce((a, b) => a + parseFloat(b.total), 0);
  const bidPercent = ((totalBids / (totalBids + totalAsks)) * 100).toFixed(2);
  const askPercent = ((totalAsks / (totalBids + totalAsks)) * 100).toFixed(2);

  // Render chart with MA
  const renderChart = () => {
    if (chartData.length === 0) return null;
    
    const allPrices = chartData.flatMap(c => [c.high, c.low]);
    const validMa7 = maData.ma7.filter(v => v !== null);
    const validMa25 = maData.ma25.filter(v => v !== null);
    allPrices.push(...validMa7, ...validMa25);
    
    const maxPrice = Math.max(...allPrices);
    const minPrice = Math.min(...allPrices);
    const range = maxPrice - minPrice;
    
    const getY = (price) => ((maxPrice - price) / range) * 100;
    
    // Generate price levels for Y-axis
    const priceLevels = [];
    const levelCount = 5;
    for (let i = 0; i <= levelCount; i++) {
      const price = maxPrice - (range * i / levelCount);
      priceLevels.push(price);
    }

    // Find high and low points for markers
    let highestCandle = chartData[0];
    let lowestCandle = chartData[0];
    let highestIdx = 0;
    let lowestIdx = 0;
    
    chartData.forEach((candle, idx) => {
      if (candle.high > highestCandle.high) {
        highestCandle = candle;
        highestIdx = idx;
      }
      if (candle.low < lowestCandle.low) {
        lowestCandle = candle;
        lowestIdx = idx;
      }
    });
    
    return (
      <div style={styles.chartContainer}>
        <div style={styles.chartHeader}>
          <div 
            style={styles.coinSelector}
            onClick={() => setShowCoinList(!showCoinList)}
          >
            <span style={styles.chartTitle}>{selectedCoin?.symbol?.toUpperCase()}/USDT</span>
            <ChevronDown size={16} color="#fff" />
          </div>
          <span style={{
            ...styles.chartPrice,
            color: selectedCoin?.price_change_percentage_24h >= 0 ? '#00FF00' : '#FF4444'
          }}>
            ${formatPrice(selectedCoin?.current_price)}
          </span>
        </div>

        {/* Timeframe Selector */}
        <div style={styles.timeframeSelector}>
          {timeframes.map(tf => (
            <button
              key={tf.value}
              style={{
                ...styles.timeframeBtn,
                ...(selectedTimeframe === tf.value ? styles.timeframeBtnActive : {})
              }}
              onClick={() => setSelectedTimeframe(tf.value)}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Coin Dropdown */}
        {showCoinList && (
          <div style={styles.coinDropdown}>
            {coins.map(coin => (
              <div 
                key={coin.id}
                style={styles.coinDropdownItem}
                onClick={() => selectCoin(coin)}
              >
                <img src={coin.image} alt="" style={styles.dropdownIcon} />
                <span>{coin.symbol.toUpperCase()}/USDT</span>
              </div>
            ))}
          </div>
        )}

        {/* MA Labels */}
        <div style={styles.maLabels}>
          <span style={styles.ma7Label}>MA(7): {validMa7.length > 0 ? formatPrice(validMa7[validMa7.length-1]) : '-'}</span>
          <span style={styles.ma25Label}>MA(25): {validMa25.length > 0 ? formatPrice(validMa25[validMa25.length-1]) : '-'}</span>
        </div>

        {/* Chart Loading */}
        {chartLoading && (
          <div style={styles.chartLoadingOverlay}>
            <span>Loading...</span>
          </div>
        )}
        
        <div style={styles.chartWrapper}>
          {/* Price Axis */}
          <div style={styles.priceAxis}>
            {priceLevels.map((price, idx) => (
              <div key={idx} style={styles.priceLevel}>
                <span style={styles.priceLevelText}>{formatPrice(price)}</span>
              </div>
            ))}
          </div>
          
          <div style={styles.candleChart}>
            {/* Grid Lines */}
            <svg style={styles.gridLines} viewBox="0 0 100 100" preserveAspectRatio="none">
              {priceLevels.map((_, idx) => (
                <line 
                  key={idx}
                  x1="0" 
                  y1={`${(idx / levelCount) * 100}`} 
                  x2="100" 
                  y2={`${(idx / levelCount) * 100}`}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="0.3"
                />
              ))}
            </svg>
            
            {/* MA Lines */}
            <svg style={styles.maLines} viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* MA7 Line */}
              <polyline
                fill="none"
                stroke="#F0B90B"
                strokeWidth="0.5"
                points={maData.ma7.map((val, idx) => 
                  val !== null ? `${(idx / (chartData.length - 1)) * 100},${getY(val)}` : ''
                ).filter(p => p).join(' ')}
              />
              {/* MA25 Line */}
              <polyline
                fill="none"
                stroke="#E377C2"
                strokeWidth="0.5"
                points={maData.ma25.map((val, idx) => 
                  val !== null ? `${(idx / (chartData.length - 1)) * 100},${getY(val)}` : ''
                ).filter(p => p).join(' ')}
              />
            </svg>
            
            {/* Candles */}
            {chartData.map((candle, idx) => {
              const isGreen = candle.close >= candle.open;
              const bodyTop = getY(Math.max(candle.open, candle.close));
              const bodyHeight = Math.abs(getY(candle.open) - getY(candle.close));
              const wickTop = getY(candle.high);
              const wickHeight = getY(candle.low) - getY(candle.high);
              
              return (
                <div key={idx} style={{...styles.candleWrapper, left: `${(idx / chartData.length) * 100}%`}}>
                  <div style={{
                    ...styles.wick,
                    top: `${wickTop}%`,
                    height: `${Math.max(wickHeight, 0.5)}%`,
                    background: isGreen ? '#00FF00' : '#FF4444',
                  }} />
                  <div style={{
                    ...styles.candleBody,
                    top: `${bodyTop}%`,
                    height: `${Math.max(bodyHeight, 1)}%`,
                    background: isGreen ? '#00FF00' : '#FF4444',
                  }} />
                </div>
              );
            })}
            
            {/* High Price Marker */}
            <div style={{
              ...styles.priceMarker,
              top: `${getY(highestCandle.high)}%`,
              left: `${(highestIdx / chartData.length) * 100}%`,
            }}>
              <div style={styles.markerLine}></div>
              <span style={styles.markerHigh}>H: {formatPrice(highestCandle.high)}</span>
            </div>
            
            {/* Low Price Marker */}
            <div style={{
              ...styles.priceMarker,
              top: `${getY(lowestCandle.low)}%`,
              left: `${(lowestIdx / chartData.length) * 100}%`,
            }}>
              <div style={{...styles.markerLine, background: '#FF4444'}}></div>
              <span style={styles.markerLow}>L: {formatPrice(lowestCandle.low)}</span>
            </div>
            
            {/* Current Price Line */}
            <div style={{
              ...styles.currentPriceLine,
              top: `${getY(selectedCoin?.current_price)}%`,
            }}>
              <div style={styles.currentPriceTag}>
                {formatPrice(selectedCoin?.current_price)}
              </div>
            </div>

            {/* Bot Trading Markers */}
            {botTrades.map((trade) => (
              <div
                key={trade.id}
                style={{
                  ...styles.botTradeMarker,
                  top: `${getY(trade.price)}%`,
                  left: `${(trade.candleIdx / chartData.length) * 100}%`,
                }}
              >
                <div style={{
                  ...styles.botMarkerIcon,
                  background: trade.type === 'buy' ? '#00FF00' : '#FF4444',
                  animation: trade.isNew ? 'pulse 0.5s ease-out' : 'none',
                }}>
                  {trade.type === 'buy' ? 'B' : 'S'}
                </div>
                <div style={{
                  ...styles.botMarkerLabel,
                  background: trade.type === 'buy' ? 'rgba(0,255,0,0.2)' : 'rgba(255,68,68,0.2)',
                  borderColor: trade.type === 'buy' ? '#00FF00' : '#FF4444',
                }}>
                  <span style={{color: trade.type === 'buy' ? '#00FF00' : '#FF4444', fontWeight: 700}}>
                    {trade.type.toUpperCase()}
                  </span>
                  <span style={{color: '#fff', fontSize: '8px'}}>
                    {formatPrice(trade.price)}
                  </span>
                  {trade.profit && (
                    <span style={{color: '#00FF00', fontSize: '8px', fontWeight: 700}}>
                      {trade.profit}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Bot Status */}
        <div style={styles.botStatus}>
          <div style={styles.botIndicator}>
            <div style={styles.botDot}></div>
            <span style={styles.botText}>Bot Trading Active</span>
          </div>
          <span style={styles.botProfitText}>Today: +{(Math.random() * 3 + 1.5).toFixed(2)}%</span>
        </div>
        
        <div style={styles.chartFooter}>
          <span style={styles.chartTime}>1m</span>
          <span style={{
            ...styles.chartChange,
            color: selectedCoin?.price_change_percentage_24h >= 0 ? '#00FF00' : '#FF4444'
          }}>
            {selectedCoin?.price_change_percentage_24h >= 0 ? '+' : ''}
            {selectedCoin?.price_change_percentage_24h?.toFixed(2)}% (24h)
          </span>
        </div>
      </div>
    );
  };

  // ========== RENDER FOREX CHART ==========
  const renderForexChart = () => {
    if (forexChartData.length === 0) return null;
    
    const allPrices = forexChartData.flatMap(c => [c.high, c.low]);
    const maxPrice = Math.max(...allPrices);
    const minPrice = Math.min(...allPrices);
    const range = maxPrice - minPrice;
    
    const getY = (price) => ((maxPrice - price) / range) * 100;
    
    const priceLevels = [];
    const levelCount = 5;
    for (let i = 0; i <= levelCount; i++) {
      const price = maxPrice - (range * i / levelCount);
      priceLevels.push(price);
    }
    
    const candleWidth = 100 / forexChartData.length;
    
    const formatForexPrice = (price) => {
      if (selectedForex?.symbol.includes('XAU')) return price.toFixed(2);
      if (selectedForex?.symbol.includes('XTI')) return price.toFixed(2);
      return price.toFixed(4);
    };
    
    return (
      <div style={{
        ...styles.chartContainer, 
        borderColor: 'rgba(255, 165, 0, 0.3)',
        background: '#0B0E11',
        border: '1px solid rgba(255, 165, 0, 0.3)'
      }}>
        {/* Forex Header */}
        <div style={styles.chartHeader}>
          <div style={styles.coinSelector} onClick={() => setShowForexList(!showForexList)}>
            <span style={{fontSize: '20px', marginRight: '8px'}}>{selectedForex?.icon}</span>
            <span style={{...styles.coinName, color: '#fff'}}>{selectedForex?.name}</span>
            <span style={{color: '#FFD700', fontWeight: 600, marginLeft: '5px'}}>{selectedForex?.symbol}</span>
            <ChevronDown size={16} color="#888" style={{marginLeft: '5px'}} />
          </div>
          
          {showForexList && (
            <div style={{
              ...styles.coinDropdown,
              background: '#1a1a1a',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              {forexPairs.map(pair => (
                <div
                  key={pair.symbol}
                  style={{
                    ...styles.coinItem,
                    background: selectedForex?.symbol === pair.symbol 
                      ? 'rgba(255, 165, 0, 0.2)' 
                      : 'transparent',
                    color: '#fff'
                  }}
                  onClick={() => {
                    setSelectedForex(pair);
                    setShowForexList(false);
                  }}
                >
                  <span style={{fontSize: '18px', marginRight: '8px'}}>{pair.icon}</span>
                  <span style={{...styles.coinItemName, color: '#fff'}}>{pair.name}</span>
                  <span style={{marginLeft: 'auto', color: pair.change >= 0 ? '#0ECB81' : '#F6465D'}}>
                    ${pair.symbol.includes('USD') && !pair.symbol.includes('XAU') && !pair.symbol.includes('XTI') 
                      ? pair.price.toFixed(4) 
                      : pair.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          <div style={styles.priceInfo}>
            <span style={{...styles.currentPrice, color: '#fff'}}>{formatForexPrice(selectedForex?.price)}</span>
            <span style={{
              ...styles.priceChange,
              color: selectedForex?.change >= 0 ? '#0ECB81' : '#F6465D'
            }}>
              {selectedForex?.change >= 0 ? '+' : ''}{selectedForex?.change?.toFixed(2)}%
            </span>
          </div>
          
          {/* Forex Timeframe Selector */}
          <div style={styles.timeframeSelector}>
            {forexTimeframes.map(tf => (
              <button
                key={tf.value}
                onClick={() => setSelectedForexTimeframe(tf.value)}
                style={{
                  ...styles.timeframeBtn,
                  background: selectedForexTimeframe === tf.value 
                    ? 'rgba(255, 165, 0, 0.3)' 
                    : 'transparent',
                  color: selectedForexTimeframe === tf.value 
                    ? '#FFA500' 
                    : '#888',
                  border: selectedForexTimeframe === tf.value 
                    ? '1px solid #FFA500' 
                    : '1px solid transparent',
                }}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Market Status */}
        {!forexMarketOpen && (
          <div style={{
            background: 'rgba(246, 70, 93, 0.2)',
            padding: '10px 15px',
            borderRadius: '8px',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{color: '#F6465D', fontSize: '14px'}}>⚠️ Market Closed - Forex markets are closed on weekends</span>
          </div>
        )}
        
        {/* Chart Area */}
        <div style={styles.chartArea}>
          {/* Price Labels */}
          <div style={styles.priceAxis}>
            {priceLevels.map((price, i) => (
              <span key={i} style={styles.priceLabel}>{formatForexPrice(price)}</span>
            ))}
          </div>
          
          {/* Chart Canvas */}
          <div style={styles.chartCanvas}>
            {/* Grid */}
            <svg style={styles.gridSvg}>
              {[0, 25, 50, 75, 100].map(y => (
                <line key={y} x1="0" y1={`${y}%`} x2="100%" y2={`${y}%`}
                  stroke="rgba(255,255,255,0.05)" strokeDasharray="5,5" />
              ))}
            </svg>
            
            {/* Candles */}
            <div style={styles.candlesContainer}>
              {forexChartData.map((candle, i) => {
                const isGreen = candle.close >= candle.open;
                const bodyTop = getY(Math.max(candle.open, candle.close));
                const bodyHeight = Math.abs(getY(candle.open) - getY(candle.close));
                const wickTop = getY(candle.high);
                const wickHeight = getY(candle.low) - getY(candle.high);
                
                return (
                  <div key={i} style={{
                    position: 'absolute',
                    left: `${i * candleWidth}%`,
                    width: `${candleWidth}%`,
                    height: '100%',
                    pointerEvents: 'none', // Allow clicks to pass through
                  }}>
                    {/* Wick */}
                    <div style={{
                      position: 'absolute',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      top: `${wickTop}%`,
                      height: `${Math.max(wickHeight, 0.5)}%`,
                      width: '1px',
                      background: isGreen ? '#0ECB81' : '#F6465D',
                    }} />
                    {/* Body */}
                    <div style={{
                      position: 'absolute',
                      left: '15%',
                      width: '70%',
                      top: `${bodyTop}%`,
                      height: `${Math.max(bodyHeight, 0.5)}%`,
                      background: isGreen ? '#0ECB81' : '#F6465D',
                      borderRadius: '1px',
                      boxShadow: isGreen ? '0 0 8px rgba(14,203,129,0.3)' : '0 0 8px rgba(246,70,93,0.3)',
                    }} />
                  </div>
                );
              })}
              
              {/* Forex Bot Trading Markers */}
              {forexMarketOpen && forexBotTrades.map(trade => {
                const candle = forexChartData[trade.candleIdx];
                if (!candle) return null;
                const x = (trade.candleIdx / forexChartData.length) * 100;
                const y = getY(trade.price);
                
                return (
                  <div key={trade.id} style={{
                    position: 'absolute',
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 100,
                    animation: trade.isNew ? 'pulse 0.5s ease-out' : 'none',
                    pointerEvents: 'none',
                  }}>
                    {/* Triangle marker - larger and more visible */}
                    <div style={{
                      width: 0,
                      height: 0,
                      borderLeft: '10px solid transparent',
                      borderRight: '10px solid transparent',
                      borderBottom: trade.type === 'buy' ? '16px solid #0ECB81' : 'none',
                      borderTop: trade.type === 'sell' ? '16px solid #F6465D' : 'none',
                      filter: `drop-shadow(0 0 8px ${trade.type === 'buy' ? '#0ECB81' : '#F6465D'})`,
                    }} />
                    {/* Profit label */}
                    {trade.profit && (
                      <div style={{
                        position: 'absolute',
                        top: trade.type === 'buy' ? '18px' : '-24px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: trade.type === 'sell' ? 'rgba(14, 203, 129, 0.95)' : 'rgba(255, 215, 0, 0.95)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#000',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      }}>
                        {trade.profit}
                      </div>
                    )}
                    {/* Trade type label */}
                    <div style={{
                      position: 'absolute',
                      top: trade.type === 'buy' ? '-18px' : '18px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: trade.type === 'buy' ? '#0ECB81' : '#F6465D',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '9px',
                      fontWeight: 700,
                      color: '#fff',
                      textTransform: 'uppercase',
                    }}>
                      {trade.type}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Forex Order Book & Trades */}
        <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
          {/* Order Book */}
          <div style={{
            flex: 1, 
            background: 'rgba(0,0,0,0.3)', 
            borderRadius: '8px', 
            padding: '10px'
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
              <span style={{color: '#888', fontSize: '12px', fontWeight: 600}}>Order Book</span>
              <span style={{color: '#888', fontSize: '12px'}}>Trades</span>
            </div>
            
            {/* Asks (Sell orders - Red) - Animated */}
            <div style={{marginBottom: '8px'}}>
              {forexOrderBook.asks.map((ask, i) => {
                const price = selectedForex ? (selectedForex.price * (1 + (5-i) * 0.0002)).toFixed(
                  selectedForex.symbol.includes('XAU') || selectedForex.symbol.includes('XTI') ? 2 : 4
                ) : '0.00';
                return (
                  <div key={`ask-${i}`} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '3px 0',
                    position: 'relative',
                    fontSize: '11px'
                  }}>
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: `${ask.width}%`,
                      background: 'rgba(246, 70, 93, 0.2)',
                      borderRadius: '2px',
                      transition: 'width 0.5s ease-out'
                    }} />
                    <span style={{color: '#F6465D', zIndex: 1}}>{price}</span>
                    <span style={{color: '#888', zIndex: 1}}>{Math.abs(parseFloat(ask.amount)).toFixed(3)}</span>
                  </div>
                );
              })}
            </div>
            
            {/* Current Price */}
            <div style={{
              textAlign: 'center',
              padding: '8px',
              background: 'rgba(255, 215, 0, 0.1)',
              borderRadius: '4px',
              marginBottom: '8px'
            }}>
              <span style={{
                color: selectedForex?.change >= 0 ? '#0ECB81' : '#F6465D',
                fontSize: '14px',
                fontWeight: 700
              }}>
                {selectedForex ? (selectedForex.symbol.includes('XAU') || selectedForex.symbol.includes('XTI') 
                  ? selectedForex.price.toFixed(2) 
                  : selectedForex.price.toFixed(4)) : '0.00'}
              </span>
              <span style={{color: '#888', fontSize: '10px', marginLeft: '5px'}}>
                ≈ ${selectedForex?.price?.toFixed(2) || '0.00'}
              </span>
            </div>
            
            {/* Bids (Buy orders - Green) - Animated */}
            <div>
              {forexOrderBook.bids.map((bid, i) => {
                const price = selectedForex ? (selectedForex.price * (1 - (i+1) * 0.0002)).toFixed(
                  selectedForex.symbol.includes('XAU') || selectedForex.symbol.includes('XTI') ? 2 : 4
                ) : '0.00';
                return (
                  <div key={`bid-${i}`} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '3px 0',
                    position: 'relative',
                    fontSize: '11px'
                  }}>
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: `${bid.width}%`,
                      background: 'rgba(14, 203, 129, 0.2)',
                      borderRadius: '2px',
                      transition: 'width 0.5s ease-out'
                    }} />
                    <span style={{color: '#0ECB81', zIndex: 1}}>{price}</span>
                    <span style={{color: '#888', zIndex: 1}}>{Math.abs(parseFloat(bid.amount)).toFixed(3)}</span>
                  </div>
                );
              })}
            </div>
            
            {/* Bid/Ask Ratio - Animated */}
            <div style={{marginTop: '10px'}}>
              <div style={{display: 'flex', height: '4px', borderRadius: '2px', overflow: 'hidden'}}>
                <div style={{width: `${forexOrderBook.bidPercent}%`, background: '#0ECB81', transition: 'width 0.5s ease-out'}} />
                <div style={{width: `${100 - forexOrderBook.bidPercent}%`, background: '#F6465D', transition: 'width 0.5s ease-out'}} />
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '10px'}}>
                <span style={{color: '#0ECB81'}}>B {forexOrderBook.bidPercent.toFixed(1)}%</span>
                <span style={{color: '#F6465D'}}>S {(100 - forexOrderBook.bidPercent).toFixed(1)}%</span>
              </div>
            </div>
          </div>
          
          {/* Recent Trades - Animated */}
          <div style={{
            flex: 1, 
            background: 'rgba(0,0,0,0.3)', 
            borderRadius: '8px', 
            padding: '10px'
          }}>
            <div style={{color: '#888', fontSize: '12px', fontWeight: 600, marginBottom: '8px'}}>
              Recent Trades
            </div>
            <div style={{maxHeight: '200px', overflow: 'hidden'}}>
              {forexTrades.map((trade, i) => {
                const price = selectedForex ? (selectedForex.price * (1 + trade.priceOffset)).toFixed(
                  selectedForex.symbol.includes('XAU') || selectedForex.symbol.includes('XTI') ? 2 : 4
                ) : '0.00';
                return (
                  <div key={`trade-${i}-${trade.time.getTime()}`} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '4px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    fontSize: '11px',
                    animation: i === 0 ? 'fadeIn 0.3s ease-out' : 'none'
                  }}>
                    <span style={{color: trade.isBuy ? '#0ECB81' : '#F6465D'}}>{price}</span>
                    <span style={{color: '#888'}}>{trade.amount}</span>
                    <span style={{color: '#666'}}>{trade.time.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', second: '2-digit'})}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Forex Bot Status */}
        <div style={{...styles.botStatus, borderColor: forexMarketOpen ? 'rgba(14, 203, 129, 0.3)' : 'rgba(255, 165, 0, 0.3)'}}>
          <div style={styles.botIndicator}>
            <div style={{
              ...styles.botDot,
              background: forexMarketOpen ? '#0ECB81' : '#FFA500',
              boxShadow: forexMarketOpen ? '0 0 10px #0ECB81' : '0 0 10px #FFA500',
              animation: forexMarketOpen ? 'pulse 1.5s infinite' : 'none'
            }}></div>
            <span style={styles.botText}>
              {forexMarketOpen ? 'Forex Bot Active' : 'Forex Bot Paused (Weekend)'}
            </span>
          </div>
          {forexMarketOpen && (
            <span style={styles.botProfitText}>Today: +{(Math.random() * 2 + 0.8).toFixed(2)}%</span>
          )}
        </div>
        
        {/* Live Market Feed - Forex Trades */}
        <div style={{
          background: 'linear-gradient(180deg, rgba(255, 215, 0, 0.1) 0%, rgba(0,0,0,0.4) 100%)',
          borderRadius: '12px',
          padding: '12px',
          marginTop: '12px',
          border: '1px solid rgba(255, 215, 0, 0.3)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px'
          }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#FFD700',
                boxShadow: '0 0 10px #FFD700',
                animation: 'pulse 1.5s infinite'
              }}></div>
              <span style={{color: '#FFD700', fontSize: '12px', fontWeight: 600}}>
                📊 Live Market Feed
              </span>
            </div>
            <span style={{color: '#888', fontSize: '10px'}}>
              {forexMarketOpen ? '🟢 Market Open' : '🔴 Market Closed'}
            </span>
          </div>
          
          {/* Live Prices Bar */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '10px',
            overflowX: 'auto',
            paddingBottom: '5px'
          }}>
            {forexPairs.slice(0, 4).map((item, idx) => (
              <div key={idx} style={{
                background: 'rgba(0,0,0,0.4)',
                borderRadius: '8px',
                padding: '8px 12px',
                minWidth: '80px',
                textAlign: 'center',
                border: `1px solid ${item.change >= 0 ? 'rgba(14, 203, 129, 0.3)' : 'rgba(246, 70, 93, 0.3)'}`
              }}>
                <div style={{fontSize: '10px', color: '#888'}}>{item.symbol}</div>
                <div style={{fontSize: '12px', color: '#fff', fontWeight: 600}}>${item.price?.toLocaleString()}</div>
                <div style={{fontSize: '9px', color: item.change >= 0 ? '#0ECB81' : '#F6465D'}}>
                  {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.change).toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
          
          {/* Recent Forex Trades */}
          <div style={{maxHeight: '150px', overflow: 'hidden'}}>
            {[
              { type: 'BUY', asset: 'GOLD', amount: (Math.random() * 5 + 0.5).toFixed(2), price: forexPairs[0]?.price || 2650, time: new Date() },
              { type: 'SELL', asset: 'CRUDE', amount: (Math.random() * 100 + 10).toFixed(0), price: forexPairs[1]?.price || 78, time: new Date(Date.now() - 30000) },
              { type: 'BUY', asset: 'EUR/USD', amount: (Math.random() * 50000 + 5000).toFixed(0), price: forexPairs[2]?.price || 1.08, time: new Date(Date.now() - 60000) },
              { type: 'SELL', asset: 'GOLD', amount: (Math.random() * 3 + 0.2).toFixed(2), price: forexPairs[0]?.price || 2650, time: new Date(Date.now() - 90000) },
            ].map((trade, i) => (
              <div 
                key={`forex-trade-${i}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 10px',
                  marginBottom: '4px',
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '6px',
                  borderLeft: `3px solid ${trade.type === 'BUY' ? '#0ECB81' : '#F6465D'}`
                }}
              >
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <span style={{
                    color: trade.type === 'BUY' ? '#0ECB81' : '#F6465D',
                    fontSize: '10px',
                    fontWeight: 600
                  }}>
                    {trade.type === 'BUY' ? '🟢' : '🔴'} {trade.type}
                  </span>
                  <span style={{color: '#fff', fontSize: '11px', fontWeight: 500}}>
                    {trade.amount} {trade.asset}
                  </span>
                </div>
                <div style={{textAlign: 'right'}}>
                  <div style={{color: '#FFD700', fontSize: '10px', fontWeight: 600}}>
                    ${typeof trade.price === 'number' ? trade.price.toLocaleString() : trade.price}
                  </div>
                  <div style={{color: '#666', fontSize: '9px'}}>
                    {trade.time.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', second: '2-digit'})}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{
            marginTop: '8px',
            padding: '6px',
            background: 'rgba(255, 215, 0, 0.1)',
            borderRadius: '6px',
            textAlign: 'center'
          }}>
            <span style={{color: '#888', fontSize: '9px'}}>
              📈 Data from CME & London Metal Exchange
            </span>
          </div>
        </div>
        
        <div style={styles.chartFooter}>>
          <span style={styles.chartTime}>{selectedForexTimeframe.toUpperCase()}</span>
          <span style={{
            ...styles.chartChange,
            color: selectedForex?.change >= 0 ? '#00FF00' : '#FF4444'
          }}>
            {selectedForex?.change >= 0 ? '+' : ''}{selectedForex?.change?.toFixed(2)}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <div style={{...styles.page, background: '#000000'}}>
      <Header />
      
      {/* Welcome Popup */}
      {showWelcomePopup && (
        <div style={welcomeStyles.overlay}>
          <div style={{...welcomeStyles.popup, background: colors.cardBg, border: `1px solid ${colors.cardBorder}`}}>
            {/* Close Button */}
            <button 
              style={welcomeStyles.closeBtn}
              onClick={() => setShowWelcomePopup(false)}
            >
              <X size={24} color={colors.textSecondary} />
            </button>
            
            {/* Sparkles Animation */}
            <div style={welcomeStyles.sparkles}>
              <Sparkles size={40} color={colors.gold} />
            </div>
            
            {/* Welcome Text */}
            <h2 style={{...welcomeStyles.title, color: colors.text}}>🎉 Welcome Back!</h2>
            <p style={{...welcomeStyles.username, color: colors.accent}}>{user?.username || user?.email?.split('@')[0] || 'Trader'}</p>
            
            {/* Balance Display */}
            <div style={{...welcomeStyles.balanceBox, background: `${colors.accent}10`, border: `1px solid ${colors.accent}30`}}>
              <span style={{...welcomeStyles.balanceLabel, color: colors.textSecondary}}>Your Balance</span>
              <span style={{...welcomeStyles.balanceAmount, color: colors.accent}}>${formatPrice(calculateUserBalance())} USDT</span>
            </div>
            
            {/* Quick Stats */}
            <div style={welcomeStyles.statsRow}>
              <div style={welcomeStyles.statItem}>
                <Gift size={20} color={colors.accent} />
                <span style={{...welcomeStyles.statValue, color: colors.text}}>${user?.total_earned?.toFixed(2) || '0.00'}</span>
                <span style={{...welcomeStyles.statLabel, color: colors.textSecondary}}>Earned</span>
              </div>
              <div style={welcomeStyles.statItem}>
                <TrendingUp size={20} color={colors.gold} />
                <span style={{...welcomeStyles.statValue, color: colors.text}}>${user?.total_invested?.toFixed(2) || '0.00'}</span>
                <span style={{...welcomeStyles.statLabel, color: colors.textSecondary}}>Invested</span>
              </div>
            </div>
            
            {/* Message */}
            <p style={{...welcomeStyles.message, color: colors.textSecondary}}>Start trading and earn daily ROI!</p>
            
            {/* CTA Button */}
            <button 
              style={{...welcomeStyles.ctaBtn, background: colors.gradient, boxShadow: colors.glowGreen}}
              onClick={() => setShowWelcomePopup(false)}
            >
              Let's Go! 🚀
            </button>
          </div>
        </div>
      )}
      
      <div style={styles.container}>
        {/* Trading Fund Display - Shows Active Investment Total */}
        <div style={{
          ...styles.balanceBar, 
          background: 'linear-gradient(135deg, rgba(38, 161, 123, 0.2) 0%, rgba(14, 203, 129, 0.15) 100%)', 
          border: '2px solid rgba(14, 203, 129, 0.5)'
        }}>
          {/* Trading Fund Icon */}
          <div style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, #0ECB81 0%, #00E5A0 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(14, 203, 129, 0.4)',
          }}>
            <TrendingUp size={18} color="#000" />
          </div>
          <span style={{...styles.balanceLabel, color: '#0ECB81', fontWeight: 700}}>Trading Fund:</span>
          <span style={{...styles.balanceValue, color: '#FFD700', textShadow: '0 0 10px rgba(255, 215, 0, 0.5)'}}>
            ${formatPrice(user?.active_invested || 0)} USDT
          </span>
        </div>

        {/* Admin Panel Button - For Admin Users (by flag or email) */}
        {(user?.is_admin || user?.email === 'admin@tradego.com') && (
          <a 
            href="/admin" 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              color: '#000',
              padding: '12px 20px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '14px',
              textDecoration: 'none',
              marginBottom: '16px',
              boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
            }}
          >
            🛡️ Admin Panel - Click Here
          </a>
        )}

        {/* ========== FOREX TRADING SECTION ========== */}
        <div style={{marginBottom: '30px'}}>
          <h2 style={{
            color: '#FFA500',
            fontSize: '18px',
            fontWeight: 700,
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            📊 Forex Trading
            {!forexMarketOpen && (
              <span style={{
                fontSize: '12px',
                background: 'rgba(255, 165, 0, 0.2)',
                color: '#FFA500',
                padding: '4px 10px',
                borderRadius: '20px'
              }}>Weekend - Market Closed</span>
            )}
          </h2>
          
          {/* Forex Chart - Always visible */}
          {selectedForex && renderForexChart()}
          
          {/* Forex Pairs List - Below chart like crypto */}
          <div style={{
            background: 'rgba(20, 25, 30, 0.9)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 165, 0, 0.2)',
            padding: '15px',
            marginTop: '15px'
          }}>
            <h3 style={{color: '#FFA500', fontSize: '14px', marginBottom: '12px', fontWeight: 600}}>
              Forex Instruments
            </h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
              {forexPairs.map((pair, index) => (
                <div
                  key={pair.symbol}
                  data-testid={`forex-pair-${pair.symbol}`}
                  onClick={() => {
                    console.log('Clicked:', pair.symbol, pair.name);
                    setSelectedForex({...pair}); // Create new object to force re-render
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    background: selectedForex?.symbol === pair.symbol 
                      ? 'rgba(255, 165, 0, 0.2)' 
                      : 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    border: selectedForex?.symbol === pair.symbol 
                      ? '1px solid rgba(255, 165, 0, 0.5)' 
                      : '1px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{
                    color: '#888',
                    fontSize: '12px',
                    width: '25px',
                    marginRight: '10px'
                  }}>#{index + 1}</span>
                  <span style={{fontSize: '22px', marginRight: '12px'}}>{pair.icon}</span>
                  <div style={{flex: 1}}>
                    <div style={{color: '#fff', fontWeight: 600, fontSize: '14px'}}>{pair.name}</div>
                    <div style={{color: '#888', fontSize: '11px'}}>{pair.symbol}</div>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <div style={{color: '#fff', fontWeight: 600, fontSize: '14px'}}>
                      ${pair.symbol.includes('XAU') || pair.symbol.includes('XTI') 
                        ? pair.price.toFixed(2) 
                        : pair.price.toFixed(4)}
                    </div>
                    <div style={{
                      color: pair.change >= 0 ? '#0ECB81' : '#F6465D',
                      fontSize: '12px',
                      fontWeight: 500
                    }}>
                      {pair.change >= 0 ? '+' : ''}{pair.change.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========== CRYPTO TRADING SECTION ========== */}
        <h2 style={{
          color: '#FFD700',
          fontSize: '18px',
          fontWeight: 700,
          marginBottom: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          ₿ Crypto Trading
        </h2>

        {/* Chart */}
        {selectedCoin && renderChart()}

        {/* Order Book - Animated like Forex */}
        <div style={styles.orderBookSection}>
          <div style={styles.orderBookHeader}>
            <span style={styles.obTitle}>Order Book</span>
            <span style={styles.obTitle}>Trades</span>
          </div>
          
          <div style={styles.orderBookContent}>
            {/* Asks (Sell Orders) - Animated */}
            <div style={styles.orderBookSide}>
              {cryptoOrderBook.asks.map((ask, idx) => {
                const price = selectedCoin ? (selectedCoin.current_price * (1 + (5-idx) * 0.0002)).toFixed(2) : '0.00';
                return (
                  <div key={`crypto-ask-${idx}`} style={{...styles.obRow, position: 'relative'}}>
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: `${ask.width}%`,
                      background: 'rgba(246, 70, 93, 0.2)',
                      borderRadius: '2px',
                      transition: 'width 0.5s ease-out'
                    }} />
                    <span style={{...styles.obPriceRed, zIndex: 1}}>{price}</span>
                    <span style={{...styles.obAmount, zIndex: 1}}>{ask.amount}</span>
                  </div>
                );
              })}
              
              {/* Current Price */}
              <div style={styles.currentPriceRow}>
                <span style={{
                  color: selectedCoin?.price_change_percentage_24h >= 0 ? '#00FF00' : '#FF4444',
                  fontWeight: 700,
                  fontSize: '14px'
                }}>
                  {formatPrice(selectedCoin?.current_price)}
                </span>
              </div>
              
              {/* Bids (Buy Orders) - Animated */}
              {cryptoOrderBook.bids.map((bid, idx) => {
                const price = selectedCoin ? (selectedCoin.current_price * (1 - (idx+1) * 0.0002)).toFixed(2) : '0.00';
                return (
                  <div key={`crypto-bid-${idx}`} style={{...styles.obRow, position: 'relative'}}>
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: `${bid.width}%`,
                      background: 'rgba(14, 203, 129, 0.2)',
                      borderRadius: '2px',
                      transition: 'width 0.5s ease-out'
                    }} />
                    <span style={{...styles.obPriceGreen, zIndex: 1}}>{price}</span>
                    <span style={{...styles.obAmount, zIndex: 1}}>{bid.amount}</span>
                  </div>
                );
              })}
            </div>

            {/* Recent Trades - Animated */}
            <div style={styles.tradesSide}>
              {cryptoTrades.map((trade, idx) => {
                const price = selectedCoin ? (selectedCoin.current_price + trade.priceOffset).toFixed(2) : '0.00';
                return (
                  <div key={`crypto-trade-${idx}-${trade.time.getTime()}`} style={{
                    ...styles.tradeRow,
                    animation: idx === 0 ? 'fadeIn 0.3s ease-out' : 'none'
                  }}>
                    <span style={{
                      ...styles.tradePrice,
                      color: trade.isBuy ? '#00FF00' : '#FF4444'
                    }}>
                      {price}
                    </span>
                    <span style={styles.tradeAmount}>{trade.amount}</span>
                    <span style={styles.tradeTime}>{trade.time.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', second: '2-digit'})}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bid/Ask Bar - Animated */}
          <div style={styles.bidAskBar}>
            <div style={{...styles.bidBar, width: `${cryptoOrderBook.bidPercent}%`, transition: 'width 0.5s ease-out'}}>
              <span>{cryptoOrderBook.bidPercent.toFixed(1)}%</span>
            </div>
            <div style={{...styles.askBar, width: `${100 - cryptoOrderBook.bidPercent}%`, transition: 'width 0.5s ease-out'}}>
              <span>{(100 - cryptoOrderBook.bidPercent).toFixed(1)}%</span>
            </div>
          </div>
          <div style={styles.bidAskLabels}>
            <span style={styles.bidLabel}>Bid</span>
            <span style={styles.askLabel}>Ask</span>
          </div>
        </div>
        
        {/* Live Blockchain Transactions - Crypto Section */}
        <div style={{
          background: 'linear-gradient(180deg, rgba(255, 215, 0, 0.1) 0%, rgba(0,0,0,0.4) 100%)',
          borderRadius: '12px',
          padding: '12px',
          marginBottom: '15px',
          border: '1px solid rgba(255, 215, 0, 0.3)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px'
          }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#FFD700',
                boxShadow: '0 0 10px #FFD700',
                animation: 'pulse 1.5s infinite'
              }}></div>
              <span style={{color: '#FFD700', fontSize: '12px', fontWeight: 600}}>
                🔗 Live Blockchain Transactions
              </span>
            </div>
            <span style={{color: '#666', fontSize: '10px'}}>BSC Network</span>
          </div>
          
          <div style={{maxHeight: '180px', overflow: 'hidden'}}>
            {blockchainTxs.map((tx, i) => (
              <div 
                key={`crypto-tx-${i}-${tx.hash.slice(0,10)}`} 
                onClick={(e) => handleTxClick(e, tx)}
                role="button"
                tabIndex={0}
                data-testid={`crypto-tx-item-${i}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '10px',
                  marginBottom: '6px',
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '8px',
                  borderLeft: `3px solid ${tx.isBuy ? '#0ECB81' : '#F6465D'}`,
                  animation: i === 0 ? 'fadeIn 0.3s ease-out' : 'none',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left'
                }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pointerEvents: 'none'}}>
                  <span style={{
                    color: tx.isBuy ? '#0ECB81' : '#F6465D',
                    fontSize: '11px',
                    fontWeight: 600,
                    pointerEvents: 'none'
                  }}>
                    {tx.isBuy ? '🟢 BUY' : '🔴 SELL'} {tx.value} {tx.coin || (selectedCoin ? selectedCoin.symbol.toUpperCase() : 'BNB')}
                  </span>
                  <span style={{color: '#666', fontSize: '10px', pointerEvents: 'none'}}>
                    {tx.timeStamp.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', second: '2-digit'})}
                  </span>
                </div>
                <div style={{
                  color: '#888',
                  fontSize: '9px',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  pointerEvents: 'none'
                }}>
                  <span style={{pointerEvents: 'none'}}>Tx: {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}</span>
                  <span style={{color: '#FFD700', fontSize: '10px', textDecoration: 'underline', pointerEvents: 'none'}}>↗ Verify on Explorer</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trade Section */}
        <div style={styles.tradeSection}>
          <div style={styles.tradeInput}>
            <label style={styles.tradeLabel}>Amount (USDT)</label>
            <input
              type="number"
              value={tradeAmount}
              onChange={(e) => setTradeAmount(e.target.value)}
              style={styles.input}
              placeholder="Enter amount"
            />
            <div style={styles.quickAmounts}>
              {['25%', '50%', '75%', '100%'].map(pct => (
                <button
                  key={pct}
                  style={styles.quickBtn}
                  onClick={() => setTradeAmount((userBalance.USDT * parseInt(pct) / 100).toFixed(2))}
                >
                  {pct}
                </button>
              ))}
            </div>
          </div>
          
          <div style={styles.tradeButtons}>
            <button style={styles.buyBtn} onClick={() => handleTrade('buy')}>
              Buy
            </button>
            <button style={styles.sellBtn} onClick={() => handleTrade('sell')}>
              Sell
            </button>
          </div>
        </div>

        {/* Portfolio - User Holdings */}
        {Object.keys(userBalance.holdings).filter(k => userBalance.holdings[k] > 0).length > 0 && (
          <div style={styles.portfolioSection}>
            <h2 style={styles.sectionTitle}>Your Portfolio</h2>
            <div style={styles.portfolioList}>
              {Object.entries(userBalance.holdings)
                .filter(([_, amount]) => amount > 0)
                .map(([symbol, amount]) => {
                  const coin = coins.find(c => c.symbol.toUpperCase() === symbol);
                  const value = coin ? amount * coin.current_price : 0;
                  return (
                    <div key={symbol} style={styles.portfolioItem}>
                      <span style={styles.portfolioSymbol}>{symbol}</span>
                      <span style={styles.portfolioAmount}>{amount.toFixed(6)}</span>
                      <span style={styles.portfolioValue}>${value.toFixed(2)}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Top 20 Coins */}
        <div style={styles.coinsSection}>
          <h2 style={styles.sectionTitle}>Top 20 Cryptocurrencies</h2>
          <div style={styles.coinsList}>
            {coins.map((coin, index) => (
              <div 
                key={coin.id} 
                style={{
                  ...styles.coinItem,
                  ...(selectedCoin?.id === coin.id ? styles.coinItemActive : {})
                }}
                onClick={() => selectCoin(coin)}
              >
                <span style={styles.coinRank}>{index + 1}</span>
                <img src={coin.image} alt={coin.name} style={styles.coinIcon} />
                <div style={styles.coinInfo}>
                  <span style={styles.coinSymbol}>{coin.symbol.toUpperCase()}</span>
                  <span style={styles.coinName}>{coin.name}</span>
                </div>
                <div style={styles.coinPrice}>
                  <span style={styles.priceValue}>${formatPrice(coin.current_price)}</span>
                  <span style={{
                    ...styles.priceChange,
                    color: coin.price_change_percentage_24h >= 0 ? '#00FF00' : '#FF4444'
                  }}>
                    {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                    {coin.price_change_percentage_24h?.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction Details Modal - Using Portal to render at document body */}
      {showTxModal && selectedTxData && ReactDOM.createPortal(
        <div 
          data-testid="tx-modal-overlay"
          className="tx-modal-overlay"
          style={{
            position: 'fixed',
            top: '0px',
            left: '0px',
            right: '0px',
            bottom: '0px',
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px',
            visibility: 'visible',
            opacity: 1
          }} 
          onClick={() => setShowTxModal(false)}
        >
          <div 
            data-testid="tx-modal-content"
            style={{
              background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)',
              borderRadius: '20px',
              padding: '24px',
              maxWidth: '420px',
              width: '100%',
              border: '2px solid rgba(16, 185, 129, 0.4)',
              boxShadow: '0 0 40px rgba(16, 185, 129, 0.3)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Coin Logo */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '15px',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                {selectedTxData.coinImage ? (
                  <img src={selectedTxData.coinImage} alt={selectedTxData.coinSymbol} style={{width: '44px', height: '44px', borderRadius: '50%'}} />
                ) : (
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: selectedTxData.isBuy ? 'linear-gradient(135deg, #0ECB81 0%, #059669 100%)' : 'linear-gradient(135deg, #F6465D 0%, #C9354D 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#fff'
                  }}>
                    {selectedTxData.coinSymbol?.charAt(0) || '?'}
                  </div>
                )}
                <div>
                  <div style={{color: '#fff', fontSize: '18px', fontWeight: 700}}>
                    {selectedTxData.isBuy ? '🟢 BUY' : '🔴 SELL'} {selectedTxData.coinSymbol || selectedTxData.coin}
                  </div>
                  <div style={{color: '#888', fontSize: '12px'}}>BSC Network • {selectedTxData.coinName || 'Token'}</div>
                </div>
              </div>
              <button 
                onClick={() => setShowTxModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '20px',
                  cursor: 'pointer',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >×</button>
            </div>

            {/* Transaction Value Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(14, 203, 129, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '16px',
              textAlign: 'center',
              border: '1px solid rgba(14, 203, 129, 0.3)'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(14, 203, 129, 0.4)',
                padding: '6px 14px',
                borderRadius: '20px',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#0ECB81',
                  animation: 'pulse 2s infinite'
                }}></div>
                <span style={{color: '#0ECB81', fontWeight: 700, fontSize: '13px'}}>✓ {selectedTxData.status || 'Success'}</span>
              </div>
              <div style={{color: '#fff', fontSize: '32px', fontWeight: 800, marginBottom: '8px'}}>
                {selectedTxData.value?.toLocaleString()} {selectedTxData.coinSymbol || selectedTxData.coin}
              </div>
              <div style={{color: '#0ECB81', fontSize: '18px', fontWeight: 600}}>
                ≈ ${selectedTxData.usdtValue?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'} USDT
              </div>
              <div style={{color: '#888', fontSize: '11px', marginTop: '8px'}}>
                @ ${selectedTxData.currentPrice?.toLocaleString() || '0'} per {selectedTxData.coinSymbol || selectedTxData.coin}
              </div>
            </div>

            {/* Transaction Details Grid */}
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              {/* Status Row */}
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px'}}>
                <span style={{color: '#888', fontSize: '13px'}}>Status</span>
                <span style={{color: '#0ECB81', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px'}}>
                  <span style={{width: '8px', height: '8px', background: '#0ECB81', borderRadius: '50%'}}></span>
                  Confirmed
                </span>
              </div>
              
              {/* Confirmations */}
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px'}}>
                <span style={{color: '#888', fontSize: '13px'}}>Confirmations</span>
                <span style={{color: '#0ECB81', fontSize: '13px', fontWeight: 600}}>{selectedTxData.confirmations || '12'}+ Blocks</span>
              </div>
              
              {/* Time */}
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px'}}>
                <span style={{color: '#888', fontSize: '13px'}}>Time</span>
                <span style={{color: '#fff', fontSize: '13px'}}>{selectedTxData.timeStamp ? selectedTxData.timeStamp.toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                }) : 'N/A'}</span>
              </div>
              
              {/* Block Number */}
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px'}}>
                <span style={{color: '#888', fontSize: '13px'}}>Block</span>
                <span style={{color: '#10B981', fontSize: '13px', fontWeight: 600}}>#{selectedTxData.blockNumber?.toLocaleString()}</span>
              </div>
              
              {/* Gas Fee */}
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px'}}>
                <span style={{color: '#888', fontSize: '13px'}}>Network Fee</span>
                <span style={{color: '#FFD700', fontSize: '13px'}}>{selectedTxData.gasFee || '0.0005'} BNB</span>
              </div>
              
              {/* From Address */}
              <div style={{padding: '12px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px'}}>
                <div style={{color: '#888', fontSize: '12px', marginBottom: '6px'}}>From Address</div>
                <div style={{color: '#fff', fontSize: '11px', wordBreak: 'break-all', fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px'}}>{selectedTxData.from}</div>
              </div>
              
              {/* To Address */}
              <div style={{padding: '12px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px'}}>
                <div style={{color: '#888', fontSize: '12px', marginBottom: '6px'}}>To Address</div>
                <div style={{color: '#fff', fontSize: '11px', wordBreak: 'break-all', fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px'}}>{selectedTxData.to}</div>
              </div>
              
              {/* Transaction Hash */}
              <div style={{padding: '12px 14px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.3)'}}>
                <div style={{color: '#10B981', fontSize: '12px', marginBottom: '6px', fontWeight: 600}}>Transaction Hash</div>
                <div style={{color: '#10B981', fontSize: '10px', wordBreak: 'break-all', fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px'}}>{selectedTxData.hash}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px'}}>
              {/* View on BSCTrace Button */}
              <button
                onClick={() => window.open(`https://bsctrace.com/tx/${selectedTxData.hash}`, '_blank')}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #F0B90B 0%, #D4A407 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#000',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                🔗 View on BSCTrace (Verify)
              </button>
              
              <div style={{display: 'flex', gap: '10px'}}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedTxData.hash);
                    alert('Transaction hash copied!');
                  }}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  📋 Copy Hash
                </button>
                <button
                  onClick={() => setShowTxModal(false)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  ✓ Done
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      <Footer />
    </div>
  );
};

// Welcome Popup Styles
const welcomeStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    padding: '20px',
  },
  popup: {
    background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
    border: '2px solid #FFD700',
    borderRadius: '24px',
    padding: '30px 24px',
    maxWidth: '360px',
    width: '100%',
    textAlign: 'center',
    position: 'relative',
    boxShadow: '0 20px 60px rgba(255, 215, 0, 0.2)',
    animation: 'popIn 0.4s ease',
  },
  closeBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: '50%',
    padding: '8px',
    color: '#888',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkles: {
    marginBottom: '10px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  title: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#FFD700',
    margin: '0 0 8px 0',
  },
  username: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#FFF',
    margin: '0 0 20px 0',
  },
  balanceBox: {
    background: 'linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(255,165,0,0.1) 100%)',
    border: '1px solid rgba(255,215,0,0.3)',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '20px',
  },
  balanceLabel: {
    display: 'block',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '4px',
  },
  balanceAmount: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#0ECB81',
    display: 'block',
  },
  statsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '20px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  statValue: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#FFF',
  },
  statLabel: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.5)',
  },
  message: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.7)',
    margin: '0 0 20px 0',
  },
  ctaBtn: {
    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    border: 'none',
    borderRadius: '12px',
    padding: '14px 40px',
    fontSize: '16px',
    fontWeight: 700,
    color: '#000',
    cursor: 'pointer',
    width: '100%',
    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
  },
};

const styles = {
  page: {
    background: '#000000',
    minHeight: '100vh',
    position: 'relative',
    zIndex: 1, // Lower z-index to keep sidebar above
  },
  container: {
    padding: '85px 12px 40px',
    maxWidth: '480px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1, // Ensure container stays below sidebar (z-index 999)
  },
  balanceBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
    padding: '10px 12px',
    background: 'rgba(38, 161, 123, 0.15)',
    borderRadius: '8px',
    flexWrap: 'wrap',
    border: '1px solid rgba(38, 161, 123, 0.3)',
  },
  usdtLogo: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#26A17B',
    boxShadow: '0 0 10px rgba(38, 161, 123, 0.5)',
  },
  balanceLabel: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.7)',
    fontWeight: 500,
  },
  balanceValue: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#0ECB81',  // Green like BTC price
  },
  holdingValue: {
    fontSize: '12px',
    color: '#00FF00',
    marginLeft: 'auto',
  },

  // Chart
  chartContainer: {
    background: '#0B0E11',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '12px',
    marginBottom: '10px',
    position: 'relative',
    overflow: 'hidden', // Prevent candles from overflowing
    zIndex: 1, // Keep chart below sidebar navigation
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  coinSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
  },
  chartTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#FFFFFF',
  },
  chartPrice: {
    fontSize: '18px',
    fontWeight: 700,
  },
  timeframeSelector: {
    display: 'flex',
    gap: '4px',
    marginBottom: '8px',
    overflowX: 'auto',
    paddingBottom: '4px',
  },
  timeframeBtn: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '4px',
    padding: '4px 10px',
    fontSize: '11px',
    color: 'rgba(255,255,255,0.6)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  timeframeBtnActive: {
    background: '#F0B90B',
    color: '#000',
    borderColor: '#F0B90B',
    fontWeight: 600,
  },
  chartLoadingOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(0,0,0,0.7)',
    padding: '10px 20px',
    borderRadius: '8px',
    color: '#F0B90B',
    fontSize: '12px',
    zIndex: 50,
  },
  coinDropdown: {
    position: 'absolute',
    top: '50px',
    left: '12px',
    background: '#1E2026',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    maxHeight: '200px',
    overflowY: 'auto',
    zIndex: 100,
    width: '150px',
  },
  coinDropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#fff',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  dropdownIcon: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
  },
  maLabels: {
    display: 'flex',
    gap: '12px',
    marginBottom: '4px',
  },
  ma7Label: {
    fontSize: '10px',
    color: '#F0B90B',
  },
  ma25Label: {
    fontSize: '10px',
    color: '#E377C2',
  },
  chartWrapper: {
    display: 'flex',
    gap: '4px',
  },
  chartArea: {
    display: 'flex',
    gap: '8px',
    height: '200px',
    marginBottom: '10px',
  },
  chartCanvas: {
    flex: 1,
    height: '100%',
    position: 'relative',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  candlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  priceAxis: {
    width: '70px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  },
  priceLabel: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'right',
    paddingRight: '8px',
  },
  priceLevel: {
    textAlign: 'right',
    paddingRight: '4px',
  },
  priceLevelText: {
    fontSize: '8px',
    color: 'rgba(255,255,255,0.5)',
  },
  candleChart: {
    flex: 1,
    height: '160px',
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  maLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  candleWrapper: {
    position: 'absolute',
    width: '3%',
    height: '100%',
  },
  wick: {
    position: 'absolute',
    width: '1px',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  candleBody: {
    position: 'absolute',
    width: '60%',
    left: '20%',
    borderRadius: '1px',
  },
  priceMarker: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transform: 'translateY(-50%)',
    zIndex: 10,
  },
  markerLine: {
    width: '8px',
    height: '2px',
    background: '#00FF00',
  },
  markerHigh: {
    fontSize: '8px',
    color: '#00FF00',
    background: 'rgba(0,255,0,0.2)',
    padding: '1px 4px',
    borderRadius: '2px',
    whiteSpace: 'nowrap',
  },
  markerLow: {
    fontSize: '8px',
    color: '#FF4444',
    background: 'rgba(255,68,68,0.2)',
    padding: '1px 4px',
    borderRadius: '2px',
    whiteSpace: 'nowrap',
  },
  currentPriceLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '1px',
    background: 'rgba(240, 185, 11, 0.5)',
    borderTop: '1px dashed #F0B90B',
    zIndex: 5,
  },
  currentPriceTag: {
    position: 'absolute',
    right: '-50px',
    top: '-8px',
    background: '#F0B90B',
    color: '#000',
    fontSize: '8px',
    fontWeight: 700,
    padding: '2px 4px',
    borderRadius: '2px',
  },

  // Bot Trading Markers
  botTradeMarker: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    zIndex: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  botMarkerIcon: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '8px',
    fontWeight: 900,
    color: '#000',
    boxShadow: '0 0 8px currentColor',
  },
  botMarkerLabel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2px 4px',
    borderRadius: '4px',
    border: '1px solid',
    gap: '1px',
    fontSize: '9px',
  },

  // Bot Status
  botStatus: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    background: 'rgba(0, 255, 0, 0.1)',
    border: '1px solid rgba(0, 255, 0, 0.3)',
    borderRadius: '8px',
    marginBottom: '10px',
  },
  botIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  botDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#00FF00',
    animation: 'blink 1s infinite',
    boxShadow: '0 0 8px #00FF00',
  },
  botText: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#00FF00',
  },
  botProfitText: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#00FF00',
  },

  chartFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    paddingTop: '8px',
    marginTop: '8px',
  },
  chartTime: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.5)',
  },
  chartChange: {
    fontSize: '12px',
    fontWeight: 600,
  },

  // Order Book
  orderBookSection: {
    background: '#0B0E11',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '12px',
    marginBottom: '10px',
  },
  orderBookHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  obTitle: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.7)',
  },
  orderBookContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  orderBookSide: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  obRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10px',
  },
  obPriceRed: {
    color: '#FF4444',
  },
  obPriceGreen: {
    color: '#00FF00',
  },
  obAmount: {
    color: 'rgba(255,255,255,0.6)',
  },
  currentPriceRow: {
    padding: '4px 0',
    textAlign: 'center',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    margin: '4px 0',
  },
  tradesSide: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  tradeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10px',
  },
  tradePrice: {
    flex: 1,
  },
  tradeAmount: {
    flex: 1,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.6)',
  },
  tradeTime: {
    flex: 1,
    textAlign: 'right',
    color: 'rgba(255,255,255,0.4)',
  },
  bidAskBar: {
    display: 'flex',
    height: '6px',
    borderRadius: '3px',
    overflow: 'hidden',
    marginTop: '10px',
  },
  bidBar: {
    background: '#00FF00',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '8px',
    color: '#000',
    fontWeight: 700,
  },
  askBar: {
    background: '#FF4444',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '8px',
    color: '#fff',
    fontWeight: 700,
  },
  bidAskLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '4px',
  },
  bidLabel: {
    fontSize: '10px',
    color: '#00FF00',
  },
  askLabel: {
    fontSize: '10px',
    color: '#FF4444',
  },

  // Trade Section
  tradeSection: {
    background: '#0B0E11',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '12px',
    marginBottom: '10px',
  },
  tradeInput: {
    marginBottom: '10px',
  },
  tradeLabel: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.6)',
    display: 'block',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    background: '#1E2026',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '16px',
    color: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box',
  },
  quickAmounts: {
    display: 'flex',
    gap: '6px',
    marginTop: '8px',
  },
  quickBtn: {
    flex: 1,
    background: '#1E2026',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '4px',
    padding: '6px',
    fontSize: '11px',
    color: 'rgba(255,255,255,0.7)',
    cursor: 'pointer',
  },
  tradeButtons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  buyBtn: {
    background: '#00C853',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    padding: '14px',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  sellBtn: {
    background: '#F6465D',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    padding: '14px',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
  },

  // Portfolio Section
  portfolioSection: {
    background: '#0B0E11',
    border: '1px solid rgba(0, 255, 0, 0.2)',
    borderRadius: '12px',
    padding: '12px',
    marginBottom: '10px',
  },
  portfolioList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  portfolioItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 10px',
    background: 'rgba(0, 255, 0, 0.05)',
    borderRadius: '6px',
  },
  portfolioSymbol: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#F0B90B',
  },
  portfolioAmount: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.7)',
  },
  portfolioValue: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#00FF00',
  },

  // Coins Section
  coinsSection: {
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#FFFFFF',
    marginBottom: '10px',
  },
  coinsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    maxHeight: '400px',
    overflowY: 'auto',
  },
  coinItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#0B0E11',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '8px',
    padding: '10px',
    cursor: 'pointer',
  },
  coinItemActive: {
    border: '1px solid #F0B90B',
  },
  coinRank: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.4)',
    width: '18px',
    textAlign: 'center',
  },
  coinIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
  },
  coinInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  coinSymbol: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#FFFFFF',
  },
  coinName: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.5)',
  },
  coinPrice: {
    textAlign: 'right',
  },
  priceValue: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#FFFFFF',
    display: 'block',
  },
  priceChange: {
    fontSize: '11px',
  },
};

// Add CSS animations for welcome popup
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes popIn {
    from { transform: scale(0.8); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
`;
if (!document.querySelector('#welcome-popup-styles')) {
  styleSheet.id = 'welcome-popup-styles';
  document.head.appendChild(styleSheet);
}

export default Dashboard;
