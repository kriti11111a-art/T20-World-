# TradeGo - Investment Platform PRD

## Original Problem Statement
Build a full-stack investment platform "TradeGo" using React, FastAPI, and MongoDB with:
- Investment system with tiered "slabs" for daily ROI
- Welcome bonus for new users ($2 non-withdrawable)
- Multi-level referral commission structure
- Live Trading Feed (Crypto) - Real BSC blockchain data
- Live Market Feed (Forex) - Simulated realistic data
- Live Liquidity Display - Synced with real BSC smart contract
- Admin Panel for user management

## User's Language Preference
Hindi (mixed with English)

## Investment SLABs
| SLAB | Range | Daily ROI | Duration |
|------|-------|-----------|----------|
| SLAB 1 | $1 - $19 | 5.5% | 20 days |
| SLAB 2 | $20 - $299 | 6.0% | 20 days |
| SLAB 3 | $300 - $2,999 | 6.5% | 20 days |
| SLAB 4 | $3,000 - $50,000 | 7.0% | 20 days |

## Completed Features ✅

### Core Features
- [x] User registration and authentication (30-day JWT session)
- [x] Investment from balance with all 4 SLABs
- [x] Welcome bonus system ($2 for new users)
- [x] Balance deduction logic (bonus first, then balance)
- [x] Daily ROI distribution (scheduled at 12:00 AM IST)

### Dashboard Offer Slider & 10% Deposit Bonus (NEW - Oct 2026)
- [x] Sunday/Wednesday Special Offer Banners on Market page
- [x] Countdown Timer: "Starts In: DD:HH:MM:SS" for upcoming offers
- [x] Blinking "🟢 LIVE" indicator with "Ends In: HH:MM:SS" countdown for active offers
- [x] Auto 10% bonus on deposits during active offer window (subsequent deposits only)
- [x] Admin Panel > Offers tab to configure Start/End datetime for both offers
- [x] Admin can activate/deactivate offers
- [x] Banner images: /sunday-special-banner.webp, /wednesday-special-banner.webp
- [x] Public API: GET /api/offers/status (shows all offer statuses)
- [x] Admin APIs: GET/POST/DELETE /api/admin/offers/{sunday|wednesday}

### Dashboard
- [x] Forex Trading section with simulated market data (Gold, Oil, EUR/USD, etc.)
- [x] Crypto Trading section with live chart and order book
- [x] Live Blockchain Transactions feed
  - BNB: REAL transactions from BSC blockchain
  - Other tokens (DOGE, USDT, etc.): Simulated live feed (due to BSC RPC limits)
- [x] Total Liquidity display synced with BSC contract

### Admin Panel
- [x] User management (view, search)
- [x] Login as User feature
- [x] Block/Unblock users
- [x] Adjust funds (add/deduct balance)
- [x] View deposits and withdrawals
- [x] Offers tab - Configure Sunday/Wednesday Special offers

### UI/UX
- [x] Dark theme with neon green accents (BitNest style)
- [x] Day/Night mode toggle
- [x] Animated TG Coin logo on login page
- [x] Responsive design

## Known Limitations (MOCKED)
- **Token Transactions**: DOGE, USDT, BTC, ETH etc. show SIMULATED live feed (not real blockchain data) due to BSC public RPC rate limits on eth_getLogs
- **Forex Data**: Simulated market data (not connected to real forex API)

## Test Credentials
- **Test User**: testinvestor1@test.com / Test@123
- **Admin**: admin@tradego.com / Admin@123

## API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/auth/register | POST | User registration |
| /api/auth/login | POST | User login |
| /api/auth/me | GET | Get current user |
| /api/investments/from-balance | POST | Create investment from balance |
| /api/investments | GET | Get user investments |
| /api/blockchain/transactions | GET | Get live blockchain transactions |
| /api/contract/liquidity | GET | Get contract liquidity |
| /api/admin/users | GET | Admin: List users |
| /api/admin/users/{id}/block | POST | Admin: Block user |
| /api/admin/users/{id}/unblock | POST | Admin: Unblock user |
| /api/admin/users/{id}/login-as | POST | Admin: Login as user |

## Tech Stack
- **Frontend**: React, TailwindCSS, Recharts
- **Backend**: FastAPI, Motor (async MongoDB), APScheduler
- **Database**: MongoDB
- **Blockchain**: BSC (Binance Smart Chain) via RPC

## File Structure
```
/app
├── backend/
│   ├── server.py          # Main FastAPI server
│   ├── requirements.txt
│   └── .env
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Dashboard.js
    │   │   ├── Admin.js
    │   │   ├── Login.js
    │   │   └── ...
    │   ├── context/
    │   │   ├── AuthContext.js
    │   │   └── ThemeContext.js
    │   └── mock.js
    └── public/
        ├── trade-genius-bull-logo.png
        └── tg-coin-logo.png
```

## Upcoming Tasks (P2)
- [ ] Admin "Give Bonus" UI improvement
- [ ] Tutorial Page content
- [ ] Admin Page Day/Night theming
- [ ] Add "Unity" logo (waiting for user to provide)

## Future Tasks (P3)
- [ ] Code refactoring (split monolithic files)
- [ ] Two-Factor Authentication (2FA)
- [ ] Real Binance Trading Integration

## Session History
- **Dec 2025**: Initial MVP development
- **Feb 2026**: Fixed investment SLAB issue, rewrote blockchain transactions endpoint
- **Feb 25, 2026**: Fixed "Invalid Token" bug in Deposit.js - Implemented token caching at function start to prevent token loss during MetaMask popup interactions

## Bug Fixes (Feb 25, 2026)

### 1. Invalid Token Bug Fix - BULLETPROOF SOLUTION

**Problem:** Token would get lost during MetaMask wallet popup interactions causing "Invalid token" errors repeatedly.

**BULLETPROOF SOLUTION IMPLEMENTED:**

1. **New TokenManager Utility** (`/app/frontend/src/utils/tokenManager.js`):
   - Singleton class that stores token in 6+ locations simultaneously
   - Memory variable, localStorage (2 keys), sessionStorage (3 keys), window object
   - `prepareForWeb3()` method to secure token before MetaMask opens
   - `get()` method tries ALL sources and auto-syncs when token found
   
2. **AuthContext Updated**:
   - Now uses tokenManager instead of direct localStorage access
   - Added `getToken()` method for components to use
   
3. **Deposit.js Updated**:
   - Uses `tokenManager.prepareForWeb3()` BEFORE MetaMask popup
   - Uses `useRef` to store token that persists across re-renders
   - 3-attempt retry mechanism for deposit API

### 2. Team & Referral Page Fixes

**Problems Fixed:**
- Team data कभी show होता था, कभी नहीं
- Level-wise breakdown सिर्फ 5 levels तक था
- Profile page में team data नहीं था
- Data instantly नहीं load हो रहा था

**Fixes Applied:**

1. **Backend API Updated** (`/api/referrals/team-by-level`):
   - Changed from recursive approach to BFS
   - Extended from 5 levels to 10 levels
   - Now returns counts for all 10 levels

2. **Referral.js Updated**:
   - Uses tokenManager for reliable token access
   - Parallel fetch for instant loading
   - Removed dependency on `token` state

3. **NetworkTeams.js Updated**:
   - Uses tokenManager
   - Removed 5-second polling (was causing issues)
   - Data fetches on mount only

4. **Profile.js Updated**:
   - Added team stats fetch on mount
   - New "Team Performance" card showing:
     - Total Team count
     - Active Members count  
     - Total Team Earnings

**Files Modified:**
- `/app/frontend/src/utils/tokenManager.js` (NEW)
- `/app/frontend/src/context/AuthContext.js`
- `/app/frontend/src/pages/Deposit.js`
- `/app/frontend/src/pages/Referral.js`
- `/app/frontend/src/pages/NetworkTeams.js`
- `/app/frontend/src/pages/Profile.js`
- `/app/backend/server.py`

### 3. Admin Panel Speed Optimization

**Problem:** Admin Panel data 10-20 seconds बाद load होता था

**Fixes Applied:**
- All API calls now use `tokenManager.get()` instead of waiting for React state
- Data fetches immediately on component mount (no dependency on token state)
- Removed 15-second timeout that was causing delays
- All 6 admin APIs fetch in parallel simultaneously
- Removed unnecessary 30-second auto-refresh interval

**Files Modified:**
- `/app/frontend/src/pages/Admin.js` - Complete optimization
- `/app/frontend/src/pages/Wallet.js` - TokenManager integration

**API Speed Verified:**
- Admin Stats API: ~122ms response time
- All data fetches in parallel for instant loading

### 4. Direct Reward Eligibility Fix

**Problem:** Direct Reward ($10) नहीं मिल रहा था जब referrer का balance $50+ था (invested में)

**Root Cause:** Code सिर्फ `balance` check कर रहा था, लेकिन Dashboard में `balance + total_invested + total_earned` दिखता है।

**Fix Applied:**
- Changed eligibility check from just `balance` to `balance + total_invested`
- Now if Total Value (balance + invested) >= $50, referrer is eligible for Direct Reward
- Same logic: If Total Value >= $50, eligible for Level Income

**Test Verified:**
- Referrer: Balance $0, Invested $52 → Total Value $52 (eligible!)
- New User deposited $60
- Referrer received: $10 (Direct Reward) + $0.62 (Level 1 Income) = $10.62 ✅

**File Modified:** `/app/backend/server.py` - `process_direct_reward()` function

### 5. P0 Bug Fix - Wallet Balance Not Updating After Investing (Feb 26, 2026)

**Problem:** जब user "Invest from Balance" करता था, तो investment successful हो जाता था but UI में wallet balance update नहीं होता था। User को manually page refresh करना पड़ता था।

**Root Cause:** `handleInvestWithBalance` function में `refreshUser()` call missing था। Backend correctly balance deduct कर रहा था but frontend state update नहीं हो रहा था।

**Fix Applied:**
1. **Deposit.js** - Added `refreshUser()` call after successful investment from balance
2. **MyInvestments.js** - Added `refreshUser()` call after successful re-compound operation

**Files Modified:**
- `/app/frontend/src/pages/Deposit.js` - `handleInvestWithBalance()` function
- `/app/frontend/src/pages/MyInvestments.js` - `handleRecompoundAll()` function

**Test Verified:**
- User with $7 balance invested $2
- Balance immediately updated to $5 in UI ✅
- No manual page refresh required

### 6. Income History Page Verified (Feb 26, 2026)

**Features Tested & Working:**
1. ✅ All 6 stat cards display correctly:
   - All Earning, Rewards, Team Income, Today ROI, Salary Income, Compounding
2. ✅ Refresh button works and triggers data refresh from all APIs
3. ✅ Salary Rank section displays correctly with all 6 ranks (Bronze → Crown)
4. ✅ All 7 tabs work (All, Daily ROI, Direct, Level, Compound, Salary, Bonus)
5. ✅ Progress bars and accordion for rank requirements

**APIs Tested:**
- GET /api/income/daily-roi ✅
- GET /api/referrals/stats ✅
- GET /api/referrals/direct-rewards ✅
- GET /api/referrals/level-income ✅
- GET /api/income/compounding ✅
- GET /api/income/salary ✅
- GET /api/salary/rank-info ✅
- GET /api/income/bonuses ✅

### 7. New Deposit Flow - Wallet First (Feb 26, 2026)

**User Request:** "Web3 wallet se deposit karne par pehle paise Income Wallet (balance) mein jaane chahiye, uske baad user manually slab mein invest kare"

**Changes Implemented:**

1. **Wallet.js - New "Deposit to Wallet" Feature:**
   - Added Web3 deposit form on Wallet page itself
   - User deposits USDT via MetaMask → Money goes to Wallet Balance
   - First deposit minimum $3 required
   - First deposit auto-creates $5 investment slab ($3 + $2 welcome bonus)
   - Uses tokenManager for bulletproof token handling during MetaMask popups

2. **Deposit.js (Trading Slab) - Guidance Banner:**
   - Added golden banner for new users: "First Time? Deposit via Wallet Page!"
   - Clicking banner navigates to Wallet page
   - Helps guide users through correct deposit flow

**New User Flow:**
```
1. User goes to Wallet page
2. Clicks "Deposit" button
3. Connects MetaMask wallet
4. Enters amount (min $3 for first deposit)
5. Confirms MetaMask transaction
6. Money goes to Wallet Balance
7. User goes to Trading Slab page
8. User invests from Balance into chosen slab
```

**Files Modified:**
- `/app/frontend/src/pages/Wallet.js` - Added handleDepositToWallet function and deposit form UI
- `/app/frontend/src/pages/Deposit.js` - Added golden banner for new users

**Testing Status:** ✅ All 8 test cases passed (Web3 actual transfer needs manual test with MetaMask)

### 8. Color-Coded Withdrawal Cards (March 15, 2026)

**User Request:** Admin Panel में withdrawal cards को color-code करना है based on user's fund history:
- 🔴 **RED (Alert):** Users who received admin fund adjustment only (potential fraud risk)
- 🟡 **Yellow (Mixed):** Users with both fund adjustment AND deposits
- 🟢 **Green (Fresh):** Users with only fresh deposits (no adjustments)

**Backend Changes (`/app/backend/server.py`):**
- Modified `/api/admin/withdrawals` endpoint
- Now fetches fund adjustments from `admin_actions` collection
- Now fetches deposits from `deposits` collection  
- Returns new flags: `has_fund_adjustment`, `has_deposit`, `card_type`

**Frontend Changes (`/app/frontend/src/pages/Admin.js`):**
- Added `getWithdrawalCardStyle()` function for dynamic card styling
- Added `getCardTypeLabel()` function for badge labels
- Cards now show colored borders based on user's fund history
- Badge at top-right shows: "⚠️ FUND ADJUSTED", "⚡ ADJUSTED + DEPOSIT", or "✅ FRESH DEPOSIT"

**Visual Result:**
- RED border + RED badge for fund-adjusted-only users (highest risk)
- Yellow border + Yellow badge for mixed users (medium attention needed)
- Green border + Green badge for fresh deposit users (lowest risk)

**Files Modified:**
- `/app/backend/server.py` - Enhanced admin/withdrawals API
- `/app/frontend/src/pages/Admin.js` - Color-coded card UI

## Pending Issues

### P0 - Production Deployment Network Error
- **Status:** User's production site (tradego.io) showing "Network Error" for 1+ month
- **Cause:** Deployment infrastructure issue on Emergent platform
- **Action Required:** User needs to contact support@emergent.sh or Discord
- **Preview Working:** https://crypto-slab-preview.preview.emergentagent.com works fine

## Completed: Global Theme System (October 1, 2026)

### Theme Implementation
**User Request:** एक Global Theme System जो पूरे app में consistent colors रखे और future में आसानी से change हो सके।

**Final Color Theme (Dark Navy + Electric Blue + Cyan):**
| Variable | Color | Usage |
|----------|-------|-------|
| --bg-main | #031A33 | Main Background |
| --bg-secondary | #062544 | Secondary Background |
| --bg-card | #082B4D | Card Background |
| --primary-blue | #087BFF | Primary Buttons, Links |
| --electric-blue | #00BFFF | Highlights |
| --cyan-highlight | #16E0FF | Active States, ROI, Important |
| --text-primary | #FFFFFF | Primary Text |
| --text-secondary | #B8C7DC | Secondary Text |
| --border-color | #174D75 | Borders, Dividers |

**Files Created/Modified:**
- `/app/frontend/src/config/themeConfig.js` (NEW) - Central theme configuration
- `/app/frontend/src/context/ThemeContext.js` - Updated with new color system
- `/app/frontend/src/index.css` - Updated CSS variables
- `/app/frontend/src/components/Header.js` - Uses theme colors
- `/app/frontend/src/pages/Home.js` - Uses theme colors

**Features:**
- Global CSS variables for consistent theming
- JavaScript theme config for programmatic access
- Day/Night mode toggle (light theme also available)
- Future-proof: Change theme file → entire app updates

## Upcoming Tasks (P2)
- [ ] Add "Unity" logo (waiting for user to provide)
- [ ] Tutorial Page content
- [ ] Complete remaining pages with new theme colors (Dashboard trading sections)
- [ ] Refactor large files (Admin.js 2200+ lines, server.py 3500+ lines)

## Future Tasks (P3)
- [ ] Two-Factor Authentication (2FA)
- [ ] Real Binance Trading Integration
- [ ] Mobile app version
- [ ] Admin Panel Maintenance Mode Toggle

## Last Updated
October 1, 2026
