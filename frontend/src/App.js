import React, { useEffect, useState } from "react";
import "./App.css";
import "./styles/theme.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "react-hot-toast";
import LoadingAnimation from "./components/LoadingAnimation";
import BottomNav from "./components/BottomNav";

// Import Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Deposit from "./pages/Deposit";
import MyInvestments from "./pages/MyInvestments";
import Withdraw from "./pages/Withdraw";
import Wallet from "./pages/Wallet";
import Referral from "./pages/Referral";
import Admin from "./pages/Admin";
import IncomeHistory from "./pages/IncomeHistory";
import Tutorial from "./pages/Tutorial";
import Guide from "./pages/Guide";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Maintenance from "./pages/Maintenance";
import Invest from "./pages/Invest";
import Market from "./pages/Market";

// ============ MAINTENANCE MODE CONFIG ============
// Set to true to enable maintenance mode
// Maintenance: 84 hours (48 + 36) - ends March 30, 2026 12:00 PM IST
const MAINTENANCE_MODE = true;
const MAINTENANCE_END = new Date('2026-03-30T12:00:00+05:30').getTime(); // 84 hours total
// =================================================

// Route change loading wrapper - SIMPLIFIED
const RouteLoadingWrapper = ({ children }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [location.pathname]);
  
  return (
    <>
      {loading && <LoadingAnimation duration={800} />}
      <div style={{ display: loading ? 'none' : 'block' }}>
        {children}
      </div>
    </>
  );
};

// Bottom Nav Wrapper - Only show on logged-in pages
const BottomNavWrapper = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, [location.pathname]);
  
  // Pages where bottom nav should NOT show
  const hideOnPages = ['/', '/login', '/register', '/maintenance', '/admin'];
  const shouldHide = hideOnPages.includes(location.pathname);
  
  if (!isLoggedIn || shouldHide) {
    return null;
  }
  
  return <BottomNav />;
};

function App() {
  // Hide initial HTML loader when React mounts
  useEffect(() => {
    const initialLoader = document.getElementById('initial-loader');
    if (initialLoader) {
      // Small delay to ensure smooth transition - FASTER (800ms)
      setTimeout(() => {
        initialLoader.classList.add('hidden');
      }, 800); // Match RouteLoadingWrapper duration
    }
  }, []);

  // AGGRESSIVE: Remove any injected Emergent badges
  useEffect(() => {
    const removeEmergentBadge = () => {
      // Remove by selectors
      const selectors = [
        '#emergent-badge',
        'a[href*="emergent"]',
        'a[href*="app.emergent.sh"]',
        'img[src*="avatars.githubusercontent.com"]',
        'img[src*="emergent"]',
        'a[target="_blank"][style*="fixed"]',
        'a[style*="position: fixed"]',
        'div[style*="Made with"]',
        'a[style*="bottom: 20px"]',
        'a[style*="z-index: 9999"]'
      ];
      selectors.forEach(selector => {
        try {
          document.querySelectorAll(selector).forEach(el => {
            el.remove();
          });
        } catch(e) {}
      });
      
      // Also find and remove any element containing "Made with Emergent" text
      document.querySelectorAll('a, div, p, span').forEach(el => {
        if (el.textContent && el.textContent.includes('Made with Emergent')) {
          el.remove();
        }
        if (el.textContent && el.textContent.includes('Emergent')) {
          const style = window.getComputedStyle(el);
          if (style.position === 'fixed') {
            el.remove();
          }
        }
      });
      
      // Remove any fixed positioned elements at the bottom that look like badges
      document.querySelectorAll('a').forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.position === 'fixed' && parseInt(style.bottom) < 50) {
          el.remove();
        }
      });
    };
    
    // Run immediately and multiple times to catch dynamically injected elements
    removeEmergentBadge();
    const intervals = [100, 300, 500, 1000, 2000, 3000, 5000];
    intervals.forEach(ms => setTimeout(removeEmergentBadge, ms));
    
    // Continuous observer
    const observer = new MutationObserver(() => {
      removeEmergentBadge();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Also run on interval as backup
    const intervalId = setInterval(removeEmergentBadge, 2000);
    
    return () => {
      observer.disconnect();
      clearInterval(intervalId);
    };
  }, []);

// Maintenance Mode Wrapper - blocks all routes except admin
const MaintenanceWrapper = ({ children, isAdmin }) => {
  const now = new Date().getTime();
  const isMaintenanceActive = MAINTENANCE_MODE && now < MAINTENANCE_END;
  
  // Allow admin to bypass maintenance
  if (isMaintenanceActive && !isAdmin) {
    return <Maintenance />;
  }
  
  return children;
};

// Protected route wrapper that checks maintenance mode
const ProtectedRoute = ({ element }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checked, setChecked] = useState(false);
  
  useEffect(() => {
    // Check if current user is admin from localStorage (cached as 'cachedUser')
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('cachedUser');
    
    if (userData && token) {
      try {
        const user = JSON.parse(userData);
        const adminCheck = user.is_admin === true || user.email === 'admin@tradego.com';
        setIsAdmin(adminCheck);
      } catch (e) {
        setIsAdmin(false);
      }
    }
    setChecked(true);
  }, []);
  
  // Wait for check to complete
  if (!checked) {
    return null;
  }
  
  const now = new Date().getTime();
  const isMaintenanceActive = MAINTENANCE_MODE && now < MAINTENANCE_END;
  
  // Admin can always access
  if (isAdmin) {
    return element;
  }
  
  // Maintenance mode active - show maintenance page
  if (isMaintenanceActive) {
    return <Maintenance />;
  }
  
  return element;
};

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="App">
          <BrowserRouter>
            <RouteLoadingWrapper>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/maintenance" element={<Maintenance />} />
                <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
                <Route path="/deposit" element={<ProtectedRoute element={<Deposit />} />} />
                <Route path="/my-investments" element={<ProtectedRoute element={<MyInvestments />} />} />
                <Route path="/withdraw" element={<ProtectedRoute element={<Withdraw />} />} />
                <Route path="/wallet" element={<ProtectedRoute element={<Wallet />} />} />
                <Route path="/referral" element={<ProtectedRoute element={<Referral />} />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/income-history" element={<ProtectedRoute element={<IncomeHistory />} />} />
                <Route path="/tutorial" element={<ProtectedRoute element={<Tutorial />} />} />
                <Route path="/guide" element={<ProtectedRoute element={<Guide />} />} />
                <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
                <Route path="/notifications" element={<ProtectedRoute element={<Notifications />} />} />
                <Route path="/invest" element={<ProtectedRoute element={<Invest />} />} />
                <Route path="/market" element={<ProtectedRoute element={<Market />} />} />
              </Routes>
              
              {/* Bottom Navigation - Show on logged-in pages */}
              <BottomNavWrapper />
            </RouteLoadingWrapper>
          </BrowserRouter>
        
        {/* Toast Notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#0ECB81',
                secondary: '#000',
              },
              style: {
                border: '1px solid rgba(14, 203, 129, 0.5)',
              },
            },
            error: {
              iconTheme: {
                primary: '#FF4444',
                secondary: '#000',
              },
              style: {
                border: '1px solid rgba(255, 68, 68, 0.5)',
              },
            },
          }}
        />
      </div>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
