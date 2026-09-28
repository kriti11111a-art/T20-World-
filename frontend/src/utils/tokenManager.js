/**
 * BULLETPROOF TOKEN MANAGER
 * This ensures token NEVER gets lost during Web3/MetaMask interactions
 * 
 * The problem: React state resets when MetaMask popup appears
 * The solution: Store token in multiple persistent locations and always recover it
 */

const TOKEN_KEY = 'token';
const BACKUP_KEY = 'backup_token';
const EMERGENCY_KEY = 'emergency_token';

class TokenManager {
  constructor() {
    // Initialize with any existing token
    this._memoryToken = null;
    this._recover();
  }

  // Store token in ALL possible locations
  set(token) {
    if (!token || token.length < 20) return;
    
    this._memoryToken = token;
    
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(BACKUP_KEY, token);
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(BACKUP_KEY, token);
      sessionStorage.setItem(EMERGENCY_KEY, token);
      
      // Also store in window object as last resort
      if (typeof window !== 'undefined') {
        window.__AUTH_TOKEN__ = token;
      }
    } catch (e) {
      console.warn('TokenManager: Storage error', e);
    }
  }

  // Get token from ANY available source
  get() {
    // Priority order: memory > localStorage > sessionStorage > window
    const sources = [
      this._memoryToken,
      this._safeGet(localStorage, TOKEN_KEY),
      this._safeGet(localStorage, BACKUP_KEY),
      this._safeGet(sessionStorage, TOKEN_KEY),
      this._safeGet(sessionStorage, BACKUP_KEY),
      this._safeGet(sessionStorage, EMERGENCY_KEY),
      typeof window !== 'undefined' ? window.__AUTH_TOKEN__ : null,
    ];

    for (const token of sources) {
      if (token && token.length > 20) {
        // Found valid token - sync it everywhere
        this._syncToken(token);
        return token;
      }
    }

    return null;
  }

  // Safe get from storage (handles errors)
  _safeGet(storage, key) {
    try {
      return storage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  // Sync token to all locations
  _syncToken(token) {
    if (!token) return;
    this._memoryToken = token;
    
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(BACKUP_KEY, token);
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(BACKUP_KEY, token);
      if (typeof window !== 'undefined') {
        window.__AUTH_TOKEN__ = token;
      }
    } catch (e) {
      // Ignore storage errors
    }
  }

  // Recover token on initialization
  _recover() {
    const token = this.get();
    if (token) {
      this._syncToken(token);
    }
  }

  // Clear all tokens (for logout)
  clear() {
    this._memoryToken = null;
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(BACKUP_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(BACKUP_KEY);
      sessionStorage.removeItem(EMERGENCY_KEY);
      if (typeof window !== 'undefined') {
        window.__AUTH_TOKEN__ = null;
      }
    } catch (e) {
      // Ignore
    }
  }

  // Check if token exists
  exists() {
    return !!this.get();
  }

  // Prepare for Web3 interaction (backup token before MetaMask opens)
  prepareForWeb3() {
    const token = this.get();
    if (token) {
      // Double-store everywhere before MetaMask popup
      this.set(token);
      console.log('TokenManager: Prepared for Web3, token secured');
    }
    return token;
  }
}

// Singleton instance
const tokenManager = new TokenManager();

// Export both the instance and the class
export default tokenManager;
export { TokenManager };
