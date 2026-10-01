import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import tokenManager from '../utils/tokenManager';

const AuthContext = createContext(null);

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const AuthProvider = ({ children }) => {
  // Initialize from localStorage IMMEDIATELY - no waiting
  const [user, setUser] = useState(() => {
    try {
      const cachedUser = localStorage.getItem('cachedUser');
      return cachedUser ? JSON.parse(cachedUser) : null;
    } catch {
      return null;
    }
  });
  
  // Use tokenManager for initial token
  const [token, setToken] = useState(() => tokenManager.get());
  
  // Start with loading=false if we have cached data - INSTANT UI
  const [loading, setLoading] = useState(() => {
    const hasToken = tokenManager.exists();
    const hasCachedUser = localStorage.getItem('cachedUser');
    return hasToken && !hasCachedUser; // Only loading if token exists but no cache
  });
  const fetchAttempts = useRef(0);
  const lastFetchTime = useRef(0);
  const isFetching = useRef(false);

  // Sync token to tokenManager whenever it changes
  useEffect(() => {
    if (token) {
      tokenManager.set(token);
    }
  }, [token]);

  // Fetch user data - with retry logic and smart caching
  const fetchUser = useCallback(async (forceRefresh = false) => {
    const currentToken = tokenManager.get();
    
    if (!currentToken) {
      setLoading(false);
      return;
    }

    // Prevent concurrent fetches
    if (isFetching.current && !forceRefresh) {
      return;
    }

    // Prevent too frequent fetches (max once per 60 seconds unless forced)
    const now = Date.now();
    if (!forceRefresh && now - lastFetchTime.current < 60000 && user) {
      setLoading(false);
      return;
    }
    
    isFetching.current = true;
    lastFetchTime.current = now;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('cachedUser', JSON.stringify(userData));
        fetchAttempts.current = 0;
      } else if (response.status === 401) {
        // 401 means token is truly invalid - but double check the message
        try {
          const errorData = await response.json();
          const errorMsg = (errorData.detail || '').toLowerCase();
          
          // Only logout if explicitly told token is invalid/expired
          if (errorMsg.includes('expired') || errorMsg.includes('invalid') || errorMsg.includes('not authenticated')) {
            console.log('Token explicitly invalid, logging out');
            performLogout();
          } else {
            // Some other 401 error - keep session
            console.log('401 but not token issue, keeping session');
            loadCachedData();
          }
        } catch {
          // Can't parse error - keep session to be safe
          loadCachedData();
        }
      } else {
        // For ALL other errors (403, 500, timeout, etc.) - KEEP using cached data
        console.log('Server error, keeping session with cached data');
        loadCachedData();
      }
    } catch (error) {
      // Network errors - NEVER logout, always use cached data
      console.log('Network error, keeping session:', error.message);
      loadCachedData();
      fetchAttempts.current++;
    }
    isFetching.current = false;
    setLoading(false);
  }, [user]);

  // Helper to load cached data
  const loadCachedData = () => {
    if (!user) {
      try {
        const cached = localStorage.getItem('cachedUser');
        if (cached) {
          setUser(JSON.parse(cached));
        }
      } catch {}
    }
  };

  // Initial fetch on mount - background only, don't block UI
  useEffect(() => {
    if (token) {
      // If we have cached user, show UI immediately
      if (localStorage.getItem('cachedUser')) {
        setLoading(false);
      }
      // Fetch in background to update data
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Perform actual logout
  const performLogout = () => {
    tokenManager.clear();
    localStorage.removeItem('cachedUser');
    localStorage.removeItem('cachedInvestments');
    setToken(null);
    setUser(null);
    fetchAttempts.current = 0;
  };

  const register = async (email, password, username, referralCode = null) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          username,
          referral_code: referralCode
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Save token using tokenManager
        tokenManager.set(data.access_token);
        localStorage.setItem('cachedUser', JSON.stringify(data.user));
        
        setToken(data.access_token);
        setUser(data.user);
        fetchAttempts.current = 0;
        
        return { success: true };
      } else {
        return { success: false, error: data.detail || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout for login
      
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      const data = await response.json();
      console.log('Login response received');

      if (response.ok) {
        // Save token using tokenManager
        tokenManager.set(data.access_token);
        localStorage.setItem('cachedUser', JSON.stringify(data.user));
        
        setToken(data.access_token);
        setUser(data.user);
        fetchAttempts.current = 0;
        
        return { success: true };
      } else {
        return { success: false, error: data.detail || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.name === 'AbortError') {
        return { success: false, error: 'Request timeout. Server might be slow. Please try again.' };
      }
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  };

  const logout = () => {
    performLogout();
  };

  const refreshUser = async () => {
    // SAFER refresh - never logout on errors, just silently fail
    try {
      const currentToken = tokenManager.get();
      if (!currentToken) return;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout
      
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('cachedUser', JSON.stringify(userData));
      }
      // For ANY error - don't logout, just keep using existing data
    } catch (error) {
      console.log('Refresh failed, keeping existing session:', error.message);
      // Never logout on refresh errors
    }
  };
  
  // Function to get token for API calls (uses tokenManager)
  const getToken = () => tokenManager.get();

  // Check if user is authenticated (token exists and user data available)
  const isAuthenticated = !!(tokenManager.exists() && (user || localStorage.getItem('cachedUser')));

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      register,
      isAuthenticated,
      refreshUser,
      getToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
