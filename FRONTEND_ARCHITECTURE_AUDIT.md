# Frontend Architecture & API Integration Audit

**Date:** January 3, 2026  
**System:** Trading Journal Application - Frontend  
**Framework:** React 18 + TypeScript + Vite  
**State Management:** Context API + React Query  
**UI Framework:** shadcn/ui + Recharts + Framer Motion  
**Version:** 1.0.0

---

## Executive Summary

This document provides a complete enumeration of all frontend routes, pages, components, and their API consumption patterns. The frontend is organized into 12 main pages with supporting components that consume 41+ backend endpoints across 6 feature domains.

---

## Part 1: Frontend Routes & Page Structure

### 1.1 Route Hierarchy

```
/
├── / → /login (redirect)
├── /login                    (public)
├── /signup                   (public)
└── / (protected layout)
    ├── /dashboard
    ├── /trades
    ├── /stats
    ├── /profile
    ├── /settings
    ├── /journal
    ├── /templates
    ├── /goals
    ├── /reports
    └── /* (404 catch-all)
```

**Protected Routes Guard:** AuthProvider + token validation via `authAPI.getProfile()`

---

## Part 2: Complete Page Inventory

### 2.1 Login Page (`/login`)

**Path:** `src/pages/auth/Login.tsx`

**Purpose:** User authentication entry point

**Key Components:**
- Card (glass-morphism design)
- Input fields: email, password
- Eye/EyeOff toggle for password visibility
- Loading state button
- Link to signup page

**API Endpoints Called:**
| Endpoint | Method | Purpose | Timing |
|----------|--------|---------|--------|
| `/api/v1/auth/login` | POST | Authenticate user with credentials | On form submit |

**Data Flow:**
```
User Input (email, password)
    ↓
Form Validation (client-side)
    ↓
POST /api/v1/auth/login
    ↓
Response: { access_token, token_type }
    ↓
localStorage.setItem('token', access_token)
    ↓
GET /api/v1/auth/me (via authAPI.getProfile)
    ↓
setUser(user_data)
    ↓
Navigate to /dashboard
```

**Error Handling:** Toast notification with error.response?.data?.detail

**State Management:**
- `email`: string (controlled input)
- `password`: string (controlled input)
- `showPassword`: boolean (password visibility toggle)
- `loading`: boolean (API call in progress)

---

### 2.2 Signup Page (`/signup`)

**Path:** `src/pages/auth/Signup.tsx`

**Purpose:** New user account creation

**Key Components:**
- Card (glass-morphism design)
- Input fields: name, email, password, confirmPassword
- Icons for each field (User, Mail, Lock)
- Password match validation
- Link to login page

**API Endpoints Called:**
| Endpoint | Method | Purpose | Timing |
|----------|--------|---------|--------|
| `/api/v1/auth/signup` | POST | Create new user account | On form submit |

**Data Flow:**
```
User Input (name, email, password, confirmPassword)
    ↓
Client Validation:
  - Password match check
  - Email format (HTML5)
    ↓
POST /api/v1/auth/signup { name, email, password }
    ↓
Response: { access_token, token_type }
    ↓
localStorage.setItem('token', access_token)
    ↓
GET /api/v1/auth/me
    ↓
setUser(user_data)
    ↓
Navigate to /dashboard
```

**Validation:** 
- Client: Password confirmation match
- Server: Email uniqueness, password length validation

**State Management:**
- `formData`: { name, email, password, confirmPassword }
- `loading`: boolean
- `showPassword`: boolean

---

### 2.3 Dashboard (`/dashboard`)

**Path:** `src/pages/Dashboard.tsx`

**Purpose:** Main trading overview and quick-access hub

**Key Components:**
- Stats Cards (TradingStats display)
- Recent Trades Table (last 3 trades)
- Today's Summary card (TodaysSummary component)
- Trade Form Dialog (quick trade creation)
- Trade History Drawer
- Alert Cards (win rate < 50%, high drawdown warnings)
- Progress bar (daily profit goal tracking)
- Loading/Error states

**API Endpoints Called:**
| Endpoint | Method | Purpose | Timing |
|----------|--------|---------|--------|
| `/api/v1/stats/summary` | GET | Fetch trading statistics | On mount |
| `/api/v1/trades/` | GET | Fetch recent trades (limit: 3) | On mount |

**Data Flow:**
```
Component Mount
    ↓
fetchDashboardData()
    ↓
Promise.all([
    statsAPI.getSummary(),      // TradingStats
    tradesAPI.getTrades({limit: 3})  // Trade[]
])
    ↓
setStats(statsData)
setRecentTrades(tradesData)
    ↓
Render metrics and alerts
    ↓
Calculated values:
  - winRate = (winning_trades / total_trades) * 100
  - profitProgress = (daily_profit / 100) * 100
  - hasHighDrawdown = max_loss > 200
```

**Alerts & Notifications:**
1. Win rate < 50%: Display "Low Win Rate Alert"
2. High drawdown: Display "Drawdown Warning"
3. Daily profit goal achieved: Toast.success()

**State Management:**
- `stats`: TradingStats | null
- `recentTrades`: Trade[]
- `loading`: boolean
- `error`: string
- `openTradeDialog`: boolean (quick trade creation)
- `showTradeHistory`: boolean (drawer toggle)

---

### 2.4 Trades Page (`/trades`)

**Path:** `src/pages/Trades.tsx`

**Purpose:** Comprehensive trade management with CRUD operations

**Key Components:**
- Trade Table (sortable, expandable rows)
- Search bar (pair search)
- Filter controls (status: OPEN/CLOSED)
- Tabs (All, Open, Profitable, Loss trades)
- Trade detail row expansion
- Create Trade Dialog
- Edit Trade Dialog
- Delete Trade Confirmation
- Trade context menu
- Status badges and P&L color coding

**API Endpoints Called:**
| Endpoint | Method | Purpose | Timing |
|----------|--------|---------|--------|
| `/api/v1/trades/` | GET | Fetch all trades | On mount |
| `/api/v1/trades/` | POST | Create new trade | On form submit |
| `/api/v1/trades/{id}` | GET | Fetch single trade | On row expansion |
| `/api/v1/trades/{id}` | PUT | Update trade | On edit submit |
| `/api/v1/trades/{id}` | DELETE | Delete trade | On delete confirm |
| `/api/v1/trades/{id}/close` | PATCH | Close open trade | On close action |

**Data Flow (Read):**
```
Component Mount
    ↓
tradesAPI.getTrades()
    ↓
Response: Trade[]
    ↓
setTrades(data)
    ↓
Categorize by status/profit:
  - openTrades = filter(status === "OPEN")
  - closedTrades = filter(status === "CLOSED")
  - profitableTrades = filter(result_usd > 0)
  - lossTrades = filter(result_usd < 0)
    ↓
Apply search & tab filters
    ↓
Render table with color coding
```

**Data Flow (Create):**
```
User clicks "+ Create Trade"
    ↓
Dialog opens with TradeForm
    ↓
User fills: pair, direction, entry_price, position_size, SL, TP
    ↓
POST /api/v1/trades/ { pair, direction, entry_price, ... }
    ↓
Response: Trade (with id, calculated fields)
    ↓
setTrades([...trades, newTrade])
    ↓
Close dialog, show success toast
```

**Data Flow (Update):**
```
User clicks edit icon on row
    ↓
setSelectedTrade(trade)
setShowEditDialog(true)
    ↓
Dialog opens with form pre-filled
    ↓
User modifies fields
    ↓
PUT /api/v1/trades/{id} { updated_fields }
    ↓
Response: Updated Trade
    ↓
Update trades array
setShowEditDialog(false)
```

**Data Flow (Delete):**
```
User clicks trash icon
    ↓
AlertDialog confirmation
    ↓
User confirms
    ↓
DELETE /api/v1/trades/{id}
    ↓
Filter out deleted trade from array
setShowDeleteConfirm(false)
```

**Data Flow (Close Trade):**
```
User clicks "Close" on open trade
    ↓
Prompt for exit price
    ↓
PATCH /api/v1/trades/{id}/close?exit_price=1.1234
    ↓
Response: Trade with status=CLOSED, result_pips, result_usd
    ↓
Update trades array
    ↓
Re-categorize (moves from open to closed)
```

**Filtering & Search:**
- Search by pair (EUR/USD, BTC/USD, etc.)
- Filter by status (OPEN/CLOSED)
- Tab-based categorization (All, Open, Profitable, Loss)
- Row expansion for detailed view

**Color Coding:**
- Green badge for profitable trades (result_usd > 0)
- Red badge for loss trades (result_usd < 0)
- Gray badge for open trades (no result yet)

**State Management:**
- `trades`: Trade[]
- `loading`: boolean
- `error`: string
- `searchTerm`: string
- `filterStatus`: "ALL" | "OPEN" | "CLOSED"
- `activeTab`: "all" | "open" | "profitable" | "loss"
- `selectedTrade`: Trade | null
- `expandedRows`: Set<number>
- `showTradeDetails`: boolean
- `showEditDialog`: boolean
- `showDeleteConfirm`: boolean

---

### 2.5 Statistics Page (`/stats`)

**Path:** `src/pages/Stats.tsx`

**Purpose:** Detailed analytics and performance visualization

**Key Components:**
- Line Chart (Equity Curve progression)
- Bar Chart (Daily Performance - profit vs trades)
- Pie Chart (P&L by Pair breakdown)
- Win/Loss Distribution display
- Date Range Filter (custom date selection via Calendar)
- Days selector (30/60/90/365 days)
- Tabs for different views
- Loading state skeleton
- Error alert

**API Endpoints Called:**
| Endpoint | Method | Purpose | Timing |
|----------|--------|---------|--------|
| `/api/v1/stats/equity_curve` | GET | Cumulative balance progression | On mount + days change |
| `/api/v1/stats/daily_performance` | GET | Daily P&L (parameterized by days) | On mount + days change |
| `/api/v1/stats/pnl_by_pair` | GET | P&L breakdown per pair | On mount |
| `/api/v1/stats/win_loss_distribution` | GET | Win/Loss ratio | On mount |
| `/api/v1/stats/by_date_range` | GET | Custom date range stats | On date range submit |

**Data Flow:**
```
Component Mount (useEffect)
    ↓
Set selectedDays = 30 (default)
    ↓
Promise.all([
    statsAPI.getEquityCurve(),
    statsAPI.getDailyPerformance(selectedDays),
    statsAPI.getPnLByPair(),
    statsAPI.getWinLossDistribution()
])
    ↓
setEquityCurve(equity: EquityPoint[])
    // [{ date: "2025-01-01", balance: 10000 }, ...]
    ↓
setDailyPerformance(daily: DailyPerformance[])
    // [{ date: "2025-01-01", profit: 500, trades: 2 }, ...]
    ↓
setPnlByPair(pnl: PnLByPair[])
    // [{ pair: "EUR/USD", wins: 5, losses: 1, total_pnl: 1500 }, ...]
    ↓
setWinLoss(distribution: WinLossDistribution)
    // { wins: 8, win_percentage: 80, losses: 2, loss_percentage: 20 }
    ↓
Render charts with Recharts
```

**Date Range Filter:**
```
User selects start date + end date via Calendar
    ↓
Clicks "Filter" button
    ↓
handleDateRangeFilter()
    ↓
statsAPI.getStatsByDateRange(
    format(startDate, "yyyy-MM-dd"),
    format(endDate, "yyyy-MM-dd")
)
    ↓
Response: DateRangeStats {
    total_trades,
    winning_trades,
    losing_trades,
    win_rate,
    avg_risk_reward,
    total_profit,
    avg_profit
}
    ↓
Display in alert (or update state)
```

**Chart Types:**
1. **Line Chart** (Equity Curve): Balance over time
2. **Bar Chart** (Daily Performance): Daily profit bars
3. **Pie Chart** (P&L by Pair): Proportion of profit by pair
4. **Stat Cards** (Win/Loss Distribution): Text-based percentages

**State Management:**
- `equityCurve`: EquityPoint[]
- `dailyPerformance`: DailyPerformance[]
- `pnlByPair`: PnLByPair[]
- `winLoss`: WinLossDistribution | null
- `loading`: boolean
- `error`: string | null
- `selectedDays`: number (30, 60, 90, 365)
- `startDate`: Date | null
- `endDate`: Date | null

---

### 2.6 Journal Page (`/journal`)

**Path:** `src/pages/Journal.tsx`

**Purpose:** Trading journal entry creation and management

**Key Components:**
- Create Entry Dialog (form with all fields)
- Entry List (ScrollArea with all entries)
- Entry Type Radio Group (ANALYSIS, MISTAKE, SUCCESS, STRATEGY)
- Pair selector dropdown
- Rich text editor (Textarea)
- Tag input
- Trade association (optional trade_id)
- Entry cards with timestamps
- Delete confirmation

**API Endpoints Called:**
| Endpoint | Method | Purpose | Timing |
|----------|--------|---------|--------|
| `/api/v1/journal` | GET | Fetch all journal entries | On mount |
| `/api/v1/journal` | POST | Create new entry | On form submit |
| `/api/v1/journal/{id}` | GET | Fetch single entry | On entry click |
| `/api/v1/journal/{id}` | PUT | Update entry | On edit submit |
| `/api/v1/journal/{id}` | DELETE | Delete entry | On delete confirm |

**Data Flow (Create):**
```
User clicks "+ New Entry"
    ↓
Dialog opens with empty form
    ↓
User fills:
  - entry_type: ANALYSIS | MISTAKE | SUCCESS | STRATEGY (radio)
  - pair: EUR/USD (select)
  - title: string
  - content: string (textarea)
  - tags: string (comma-separated)
  - trade_id: number (optional, from recent trades)
    ↓
POST /api/v1/journal {
    entry_type,
    pair,
    title,
    content,
    tags,
    trade_id
}
    ↓
Response: JournalEntry {
    id,
    user_id,
    entry_type,
    pair,
    title,
    content,
    tags,
    trade_id,
    created_at,
    updated_at
}
    ↓
setEntries([newEntry, ...entries])
    ↓
Reset form, close dialog
    ↓
Toast: "Entry created successfully"
```

**Data Flow (List):**
```
Component Mount
    ↓
journalAPI.getEntries({ limit: 50 })
    ↓
Response: { data: JournalEntry[], total, skip, limit }
    ↓
setEntries(data.data)
    ↓
Display in reverse chronological order (newest first)
    ↓
Each entry shows:
  - Type badge (color-coded)
  - Title + content preview
  - Pair tag
  - created_at timestamp
  - Edit/Delete buttons
```

**Data Flow (Delete):**
```
User clicks trash icon
    ↓
AlertDialog confirmation
    ↓
DELETE /api/v1/journal/{id}
    ↓
setEntries(entries.filter(e => e.id !== id))
    ↓
Toast: "Entry deleted"
```

**Entry Type Colors:**
- ANALYSIS: Blue
- MISTAKE: Red
- SUCCESS: Green
- STRATEGY: Purple

**State Management:**
- `entries`: JournalEntry[]
- `loading`: boolean
- `saving`: boolean
- `dialogOpen`: boolean
- `newEntry`: { pair, entry_type, title, content, tags, trade_id }

---

### 2.7 Templates Page (`/templates`)

**Path:** `src/pages/Templates.tsx`

**Purpose:** Create and manage reusable trade setup templates

**Key Components:**
- Create Template Dialog
- Template List (card grid or table)
- Template cards showing:
  - Name, pair, trade_type (BUY/SELL)
  - Entry/Exit strategy preview
  - Risk:Reward ratio
  - Usage count
  - Edit/Delete/Use buttons
- Edit Template Dialog
- Copy-to-clipboard for strategies

**API Endpoints Called:**
| Endpoint | Method | Purpose | Timing |
|----------|--------|---------|--------|
| `/api/v1/templates` | GET | Fetch all templates (limit: 50) | On mount |
| `/api/v1/templates` | POST | Create new template | On form submit |
| `/api/v1/templates/{id}` | GET | Fetch single template | On edit click |
| `/api/v1/templates/{id}` | PUT | Update template | On edit save |
| `/api/v1/templates/{id}` | DELETE | Delete template | On delete confirm |
| `/api/v1/templates/{id}/use` | POST | Create trade from template | On "Use Template" click |

**Data Flow (Create):**
```
User clicks "+ New Template"
    ↓
Dialog opens with form:
  - name: string
  - pair: EUR/USD (select)
  - trade_type: BUY | SELL
  - entry_strategy: string (detailed criteria)
  - exit_strategy: string (detailed criteria)
  - risk_reward: 1:1.5 (ratio as string)
  - description: string (optional)
  - tags: string (optional, comma-separated)
    ↓
POST /api/v1/templates {
    name,
    pair,
    trade_type,
    entry_strategy,
    exit_strategy,
    risk_reward,
    description,
    tags
}
    ↓
Response: TradeTemplate { id, user_id, usage_count=0, created_at, ... }
    ↓
setTemplates([newTemplate, ...templates])
    ↓
Close dialog, reset form
```

**Data Flow (Use Template):**
```
User clicks "Use" button on template
    ↓
POST /api/v1/templates/{id}/use {
    pair?: string (override),
    entry_price?: number,
    position_size?: number
}
    ↓
Response: { status: string, trade: Trade }
    ↓
Backend increments template.usage_count
    ↓
Backend creates new Trade with template data
    ↓
Reupdate templates list (usage_count increased)
    ↓
Toast: "Trade created from template"
    ↓
Optional: Navigate to /trades or show created trade
```

**Data Flow (Edit):**
```
User clicks Edit button
    ↓
setEditingId(template.id)
setDialogOpen(true)
    ↓
Pre-fill form with current template data
    ↓
User modifies fields
    ↓
PUT /api/v1/templates/{id} { updated_fields }
    ↓
Response: Updated TradeTemplate
    ↓
Update templates array
    ↓
Close dialog
```

**State Management:**
- `templates`: TradeTemplate[]
- `loading`: boolean
- `saving`: boolean
- `dialogOpen`: boolean
- `editingId`: number | null
- `newTemplate`: { name, pair, trade_type, entry_strategy, exit_strategy, risk_reward, description, tags }

---

### 2.8 Goals Page (`/goals`)

**Path:** `src/pages/Goals.tsx`

**Purpose:** Track trading goals and winning streaks

**Key Components:**
- Create Goal Dialog
- Goals List (card view)
- Goal cards showing:
  - Goal type (WIN_RATE, PNL, TRADES)
  - Period (MONTHLY, QUARTERLY, YEARLY)
  - Target and current values
  - Progress bar (progress_percentage)
  - Status badge (ACTIVE, COMPLETED, FAILED)
  - is_on_track indicator
  - Edit/Delete buttons
- Streaks section:
  - Current streak count
  - Best streak count
  - Streak type display
  - Flame icon for visual emphasis

**API Endpoints Called:**
| Endpoint | Method | Purpose | Timing |
|----------|--------|---------|--------|
| `/api/v1/goals` | GET | Fetch all goals | On mount |
| `/api/v1/goals` | POST | Create new goal | On form submit |
| `/api/v1/goals/{id}` | GET | Fetch single goal | On edit click |
| `/api/v1/goals/{id}` | PUT | Update goal (progress/status) | On update |
| `/api/v1/goals/{id}` | DELETE | Delete goal | On delete confirm |
| `/api/v1/goals/streaks/list` | GET | Fetch all streaks | On mount |

**Data Flow (Create):**
```
User clicks "+ New Goal"
    ↓
Dialog opens with form:
  - goal_type: WIN_RATE | PNL | TRADES
  - period: MONTHLY | QUARTERLY | YEARLY
  - target_value: number
  - description: string (optional)
    ↓
POST /api/v1/goals {
    goal_type,
    period,
    target_value,
    description
}
    ↓
Response: TradingGoal {
    id,
    user_id,
    goal_type,
    period,
    target_value,
    current_value=0,
    status="ACTIVE",
    progress_percentage=0.0,
    is_on_track=true,
    created_at,
    started_at,
    target_date,
    ...
}
    ↓
setGoals([newGoal, ...goals])
```

**Data Flow (Fetch Streaks):**
```
Component Mount
    ↓
Promise.all([
    goalsAPI.getGoals({ limit: 50 }),
    goalsAPI.getStreaks({ limit: 50 })
])
    ↓
setGoals(goalsData.data)
setStreaks(streaksData.data)
    ↓
Display both goals and streaks sections
```

**Goal Progress Visualization:**
```
For each goal:
  Progress Bar: current_value / target_value * 100
  
  Example:
    WIN_RATE Goal: target=60%, current=48%
    Progress = 48/60*100 = 80% bar fill
    
    PNL Goal: target=$5000, current=$3500
    Progress = 3500/5000*100 = 70% bar fill
```

**State Management:**
- `goals`: TradingGoal[]
- `streaks`: TradeStreak[]
- `loading`: boolean
- `saving`: boolean
- `dialogOpen`: boolean
- `newGoal`: { goal_type, period, target_value, current_value }

---

### 2.9 Reports Page (`/reports`)

**Path:** `src/pages/Reports.tsx`

**Purpose:** Comprehensive trading analytics and insights

**Key Components:**
- Summary Cards (metrics display)
- Bar Chart (trade distribution)
- Pie Chart (pair performance)
- Detailed breakdown cards (per-pair stats)
- Tabs for different report views
- Download/Export button (UI present, backend may not support)
- Color-coded performance indicators

**API Endpoints Called:**
| Endpoint | Method | Purpose | Timing |
|----------|--------|---------|--------|
| `/api/v1/reports/summary` | GET | Overall trading metrics | On mount |
| `/api/v1/reports/by-pair` | GET | Per-pair statistics breakdown | On mount |

**Data Flow:**
```
Component Mount
    ↓
Promise.all([
    reportsAPI.getSummary(),
    reportsAPI.getPairStats()
])
    ↓
Response 1: {
    total_trades,
    closed_trades,
    open_trades,
    win_rate,
    total_profit,
    roi,
    average_profit
}
    ↓
setSummary(summaryData)
    ↓
Response 2: {
    [pair: string]: {
        total_trades,
        closed_trades,
        win_rate,
        total_profit
    }
}
    ↓
setPairStats(pairData)
    ↓
Extract pair names and create pie chart data
    ↓
Render summary cards + charts + detail cards
```

**Card Displays:**
- Total Trades: count
- Win Rate: percentage with badge
- Total P&L: dollar amount (green if positive, red if negative)
- ROI: percentage calculation
- Average Trade Profit: dollar amount

**Per-Pair Breakdown:**
For each pair in pairStats, display:
- Pair name (EUR/USD, etc.)
- Trade count (total, closed)
- Win rate percentage
- Total profit/loss
- Color-coded indicators

**State Management:**
- `loading`: boolean
- `summary`: ReportSummary | null
- `pairStats`: { [pair: string]: PairStats }

---

### 2.10 Settings Page (`/settings`)

**Path:** `src/pages/Settings.tsx`

**Purpose:** User account security and 2FA management

**Key Components:**
- 2FA Setup Section:
  - Status display (enabled/disabled)
  - Setup button → opens dialog
  - QR code display (base64 image)
  - Manual secret key entry
  - Copy buttons
- OTP Verification:
  - OTP input (6-digit)
  - Verify button
- Backup Codes:
  - List of codes
  - Copy button per code
  - Regenerate button
- Disable 2FA:
  - Requires OTP verification
  - Confirmation dialog

**API Endpoints Called:**
| Endpoint | Method | Purpose | Timing |
|----------|--------|---------|--------|
| `/api/v1/auth/2fa/status` | GET | Check if 2FA enabled | On mount |
| `/api/v1/auth/2fa/setup` | POST | Initiate 2FA setup | On "Enable 2FA" click |
| `/api/v1/auth/2fa/verify` | POST | Verify OTP and enable 2FA | On OTP submit |
| `/api/v1/auth/2fa/disable` | POST | Disable 2FA (requires OTP) | On disable confirm |
| `/api/v1/auth/2fa/regenerate-backups` | POST | Generate new backup codes | On regenerate click |

**Data Flow (Setup 2FA):**
```
Component Mount
    ↓
twoFAAPI.getStatus()
    ↓
Response: { is_enabled, backup_codes_remaining }
    ↓
setTwoFAStatus(status)
    ↓
If is_enabled: Show disable options
If not enabled: Show "Enable 2FA" button
```

**Data Flow (Enable 2FA):**
```
User clicks "Enable 2FA"
    ↓
setSetupDialogOpen(true)
    ↓
POST /api/v1/auth/2fa/setup { enable: true }
    ↓
Response: {
    secret: string (base32),
    qr_code: string (base64 PNG image),
    backup_codes: string[] (10 codes)
}
    ↓
setQrCode(qrCode)
setSecret(secret)
setBackupCodes(backupCodes)
    ↓
Display dialog with:
  - QR code image (<img src={`data:image/png;base64,${qrCode}`} />)
  - Manual secret entry field
  - Backup codes (with copy buttons)
  - OTP input field
    ↓
User scans QR code with authenticator app
    ↓
User enters 6-digit OTP from app
    ↓
POST /api/v1/auth/2fa/verify { otp_code: "123456" }
    ↓
Backend validates OTP against TOTP secret
    ↓
Response: { status: "2FA enabled successfully" }
    ↓
setTwoFAStatus({ is_enabled: true, ... })
    ↓
Close dialog, show toast
```

**Data Flow (Disable 2FA):**
```
User clicks "Disable 2FA"
    ↓
setDisableDialogOpen(true)
    ↓
User enters OTP to confirm
    ↓
POST /api/v1/auth/2fa/disable { otp_code: "123456" }
    ↓
Backend validates OTP
    ↓
Response: { status: "2FA disabled successfully" }
    ↓
setTwoFAStatus({ is_enabled: false, backup_codes_remaining: 0 })
    ↓
Close dialog, show toast
```

**Backup Code Copy:**
```
User clicks copy icon on backup code
    ↓
navigator.clipboard.writeText(code)
    ↓
setCopiedIndex(index)
    ↓
Show "Copied!" feedback (icon change)
    ↓
setTimeout(() => setCopiedIndex(null), 2000)
```

**State Management:**
- `twoFAStatus`: { is_enabled, backup_codes_remaining } | null
- `loading`: boolean
- `setupDialogOpen`: boolean
- `verifyDialogOpen`: boolean
- `disableDialogOpen`: boolean
- `qrCode`: string (base64)
- `secret`: string
- `backupCodes`: string[]
- `otp`: string (input for setup)
- `verifyOtp`: string (input for verification)
- `disableOtp`: string (input for disable)
- `copiedIndex`: number | null (for copy button feedback)
- `setupLoading`, `verifyLoading`, `disableLoading`: boolean

---

### 2.11 Profile Page (`/profile`)

**Path:** `src/pages/Profile.tsx`

**Purpose:** User profile information and preferences

**Key Components:**
- User Avatar (with upload button)
- Name input field
- Email display (read-only)
- Password change section (current, new, confirm)
- Notifications preferences (toggles)
- Preferred trading pairs (checkboxes)
- Account statistics display
- Save button

**API Endpoints Called:**
| Endpoint | Method | Purpose | Timing |
|----------|--------|---------|--------|
| `/api/v1/auth/me` | GET | Fetch user profile | On mount |
| `/api/v1/stats/summary` | GET | Fetch account statistics | On mount |

**Data Flow:**
```
Component Mount
    ↓
Promise.all([
    authAPI.getProfile(),
    statsAPI.getSummary()
])
    ↓
Response 1: {
    id,
    name,
    email,
    created_at,
    is_active,
    updated_at
}
    ↓
setProfileData({ name, email, ...rest })
    ↓
Response 2: TradingStats { total_trades, win_rate, ... }
    ↓
setAccountStats(stats)
    ↓
Display profile info + account metrics
```

**Preferences (Not saved - UI only):**
- Notifications:
  - Email notifications toggle
  - Trade alerts toggle
  - Weekly reports toggle
  - Market news toggle
- Preferred pairs:
  - EUR/USD, GBP/USD, USD/JPY, AUD/USD, NZD/USD, USD/CAD
  - Checkboxes for user preference

**Note:** Profile update (PUT /auth/me) endpoint not implemented in backend

**State Management:**
- `profileData`: { name, email, currentPassword, newPassword, confirmPassword }
- `accountStats`: TradingStats | null
- `loading`: boolean
- `error`: string
- `notifications`: { email, tradeAlerts, weeklyReport, marketNews }
- `preferredPairs`: { [pair]: boolean }
- `openAvatarDialog`: boolean

---

### 2.12 Not Found Page (`/*`)

**Path:** `src/pages/NotFound.tsx`

**Purpose:** 404 error handling for invalid routes

**Key Components:**
- Error message display
- "Go back" or "Go to dashboard" button
- Animated icon

**API Endpoints Called:** None

---

## Part 3: API Client Architecture

### 3.1 API Client Setup (`src/lib/api.ts`)

**Base Configuration:**
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})
```

**Request Interceptor (Auto Token Injection):**
```typescript
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)
```

**Response Interceptor (Auto 401 Redirect):**
```typescript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

---

### 3.2 API Client Methods Organization

**Logical grouping by feature domain:**

#### Auth API
```typescript
authAPI = {
  login(email, password),      // POST /auth/login
  signup(name, email, password), // POST /auth/signup
  getProfile(),                // GET /auth/me
}
```

#### Trades API
```typescript
tradesAPI = {
  getTrades(params?),          // GET /trades/ with filters
  getTrade(id),                // GET /trades/{id}
  createTrade(trade),          // POST /trades/
  updateTrade(id, trade),      // PUT /trades/{id}
  deleteTrade(id),             // DELETE /trades/{id}
  closeTrade(id, exitPrice),   // PATCH /trades/{id}/close
}
```

#### Stats API
```typescript
statsAPI = {
  getSummary(),                // GET /stats/summary
  getEquityCurve(),            // GET /stats/equity_curve
  getPnLByPair(),              // GET /stats/pnl_by_pair
  getWinLossDistribution(),    // GET /stats/win_loss_distribution
  getDailyPerformance(days),   // GET /stats/daily_performance?days=30
  getStatsByDateRange(start, end), // GET /stats/by_date_range
}
```

#### Journal API
```typescript
journalAPI = {
  getEntries(params?),         // GET /journal with pagination
  getEntry(id),                // GET /journal/{id}
  createEntry(entry),          // POST /journal
  updateEntry(id, entry),      // PUT /journal/{id}
  deleteEntry(id),             // DELETE /journal/{id}
  getEntriesByTrade(tradeId),  // GET /journal/trade/{id}
}
```

#### Templates API
```typescript
templatesAPI = {
  getTemplates(params?),       // GET /templates
  getTemplate(id),             // GET /templates/{id}
  createTemplate(template),    // POST /templates
  updateTemplate(id, template), // PUT /templates/{id}
  deleteTemplate(id),          // DELETE /templates/{id}
  useTemplate(id, data),       // POST /templates/{id}/use
}
```

#### Goals API
```typescript
goalsAPI = {
  getGoals(params?),           // GET /goals
  getGoal(id),                 // GET /goals/{id}
  createGoal(goal),            // POST /goals
  updateGoal(id, goal),        // PUT /goals/{id}
  deleteGoal(id),              // DELETE /goals/{id}
  getStreaks(params?),         // GET /goals/streaks/list
}
```

#### Reports API
```typescript
reportsAPI = {
  getSummary(),                // GET /reports/summary
  getPairStats(),              // GET /reports/by-pair
  getMonthlyReport(months?),   // GET /reports/monthly (not verified)
  getWeeklyReport(weeks?),     // GET /reports/weekly (not verified)
  getDrawdown(),               // GET /reports/drawdown (not verified)
}
```

#### 2FA API
```typescript
twoFAAPI = {
  setup(),                     // POST /auth/2fa/setup
  verify(otpCode),             // POST /auth/2fa/verify
  getStatus(),                 // GET /auth/2fa/status
  disable(otpCode),            // POST /auth/2fa/disable
  regenerateBackupCodes(otpCode), // POST /auth/2fa/regenerate-backups
}
```

---

### 3.3 TypeScript Interface Definitions

All API responses are type-hinted. Key types:

```typescript
User {
  id: number
  name: string
  email: string
  created_at: string
}

Trade {
  id: number
  pair: string
  direction: 'BUY' | 'SELL'
  entry_price: number
  exit_price?: number
  stop_loss?: number
  take_profit?: number
  position_size: number
  risk_reward?: number
  result_pips?: number
  result_usd?: number
  notes?: string
  screenshot?: string
  status: 'OPEN' | 'CLOSED'
  opened_at: string
  closed_at?: string
  created_at: string
  updated_at: string
}

TradingStats {
  total_profit: number
  win_rate: number
  avg_risk_reward: number
  total_trades: number
  winning_trades: number
  losing_trades: number
  daily_profit?: number
  max_loss?: number
}

JournalEntry {
  id: number
  user_id: number
  trade_id?: number
  entry_type: 'ANALYSIS' | 'MISTAKE' | 'SUCCESS' | 'STRATEGY'
  pair: string
  title: string
  content: string
  tags?: string
  created_at: string
  updated_at: string
}

TradeTemplate {
  id: number
  user_id: number
  name: string
  pair: string
  trade_type: string
  entry_strategy?: string
  exit_strategy?: string
  risk_reward?: number
  description?: string
  tags?: string
  usage_count: number
  created_at: string
  updated_at: string
}

TradingGoal {
  id: number
  user_id: number
  goal_type: string
  period: string
  target_value: number
  current_value: number
  status: string
  progress_percentage: number
  is_on_track: boolean
  created_at: string
  updated_at: string
}

TradeStreak {
  id: number
  user_id: number
  streak_type: string
  current_count: number
  best_count: number
  created_at: string
  updated_at: string
}

TwoFactorStatus {
  is_enabled: boolean
  backup_codes_remaining: number
}
```

---

## Part 4: Component Hierarchy

### Layout Structure

```
App.tsx
├── ErrorBoundary
├── QueryClientProvider
├── TooltipProvider
├── Toaster (shadcn)
├── Sonner (notifications)
└── AuthProvider
    └── BrowserRouter
        └── Routes
            ├── /login → Login.tsx
            ├── /signup → Signup.tsx
            └── Layout.tsx
                ├── Sidebar
                │   ├── Navigation menu
                │   ├── Active route highlight
                │   └── Logout button
                ├── TopNav
                │   ├── Breadcrumb
                │   ├── Search
                │   ├── Theme toggle
                │   └── User menu
                └── <Outlet> (page content)
                    ├── Dashboard.tsx
                    ├── Trades.tsx
                    ├── Stats.tsx
                    ├── Journal.tsx
                    ├── Templates.tsx
                    ├── Goals.tsx
                    ├── Reports.tsx
                    ├── Settings.tsx
                    └── Profile.tsx
```

### UI Component Library

**shadcn/ui Components Used:**
- Button, Input, Label, Textarea
- Card, CardContent, CardDescription, CardHeader, CardTitle
- Dialog, Drawer, AlertDialog, Sheet
- Table, TableBody, TableCell, TableHeader, TableRow
- Tabs, TabsContent, TabsList, TabsTrigger
- Badge, Progress, Separator
- Avatar, AvatarFallback, AvatarImage
- Accordion, Collapsible
- Popover, HoverCard
- RadioGroup, Checkbox, Switch
- Select, SelectContent, SelectItem, SelectTrigger, SelectValue
- Alert, AlertDescription, AlertTitle
- Calendar
- Command, CommandDialog, CommandInput
- Breadcrumb, BreadcrumbItem, BreadcrumbLink
- Pagination
- Tooltip, TooltipProvider
- Dropdown menu

**Third-party Components:**
- Recharts (charts: Line, Bar, Pie, Area)
- Framer Motion (animations)
- Sonner (toast notifications)
- date-fns (date formatting)

---

## Part 5: State Management Patterns

### 5.1 Authentication State

**Location:** `src/hooks/useAuth.ts`

**Context API Pattern:**
```typescript
AuthContext {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login(email, password): Promise<void>
  signup(name, email, password): Promise<void>
  logout(): void
}
```

**Token Storage:** localStorage (key: "token")

**Auto-restoration on mount:**
- Check localStorage for existing token
- Call getProfile() to validate
- Clear token if 401 response
- Set isLoading=false

---

### 5.2 Page-level State

**Pattern:** useState for local component state

Examples:
- Trades page: trades[], loading, error, searchTerm, filterStatus
- Stats page: equityCurve[], dailyPerformance[], loading
- Journal page: entries[], newEntry, dialogOpen

**No Redux/Zustand:** Using Context API + local useState

---

### 5.3 Data Fetching

**Pattern:** useEffect hooks with async/await

```typescript
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await apiCall()
      setState(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  fetchData()
}, [dependencies])
```

**React Query Setup:**
- QueryClient initialized in App.tsx
- Not heavily used (mostly manual fetch patterns)

---

## Part 6: Feature → UI → API → Backend Mapping

### 6.1 Authentication Flow (End-to-End)

```
User Input (Email + Password)
    ↓
Login.tsx → useAuth.login()
    ↓
authAPI.login() → POST /api/v1/auth/login
    ↓
Backend: Validate credentials, hash password check
    ↓
Response: { access_token, token_type }
    ↓
Frontend: localStorage.setItem('token', access_token)
    ↓
authAPI.getProfile() → GET /api/v1/auth/me
    ↓
Backend: Decode JWT, query User by email
    ↓
Response: User { id, name, email, created_at }
    ↓
Frontend: setUser(user), setIsAuthenticated(true)
    ↓
Navigate to /dashboard
    ↓
Dashboard mounts, calls statsAPI, tradesAPI
    ↓
Auto-injected Bearer token in all subsequent requests
```

---

### 6.2 Trade Creation Flow (End-to-End)

```
User clicks "Create Trade" button
    ↓
Dialog opens (Trades.tsx or Dashboard.tsx)
    ↓
User fills form:
  - pair (select)
  - direction (radio: BUY/SELL)
  - entry_price, position_size
  - stop_loss, take_profit (optional)
  - notes (optional)
    ↓
Form validation (client-side)
    ↓
tradesAPI.createTrade(tradeData) → POST /api/v1/trades/
    ↓
Axios interceptor injects Bearer token
    ↓
Backend: get_current_user() or test_mode
    ↓
Backend: Validate trade data via TradeCreate schema
    ↓
Backend: Calculate risk_reward, result_pips, result_usd (if closed)
    ↓
Backend: Insert Trade record into DB
    ↓
Response: Trade { id, pair, direction, ..., timestamps }
    ↓
Frontend: setTrades([...trades, newTrade])
    ↓
Close dialog, reset form
    ↓
Toast: "Trade created successfully"
```

---

### 6.3 Journal Entry Creation Flow (End-to-End)

```
User clicks "+ New Entry"
    ↓
Dialog opens (Journal.tsx)
    ↓
User selects:
  - entry_type: ANALYSIS | MISTAKE | SUCCESS | STRATEGY
  - pair: EUR/USD (select)
  - title, content
  - tags (optional)
  - associated trade (optional)
    ↓
journalAPI.createEntry(entryData) → POST /api/v1/journal
    ↓
Request headers include Authorization: Bearer <token>
    ↓
Backend: get_current_user() via token
    ↓
Backend: Extract user_id from token
    ↓
Backend: Validate JournalEntryCreate schema
    ↓
Backend: Set created_at, updated_at timestamps
    ↓
Backend: Insert into journal_entries table with user_id
    ↓
Response: JournalEntry { id, user_id, entry_type, pair, ... }
    ↓
Frontend: setEntries([newEntry, ...entries])
    ↓
Dialog closes
    ↓
Toast: "Journal entry created"
```

---

### 6.4 Goal Tracking Flow (End-to-End)

```
User clicks "+ New Goal"
    ↓
Dialog opens (Goals.tsx)
    ↓
User sets:
  - goal_type: WIN_RATE | PNL | TRADES
  - period: MONTHLY | QUARTERLY | YEARLY
  - target_value: number
    ↓
goalsAPI.createGoal(goalData) → POST /api/v1/goals
    ↓
Axios injects Bearer token
    ↓
Backend: get_current_user()
    ↓
Backend: Create TradingGoal with status=ACTIVE, progress=0
    ↓
Response: TradingGoal { id, user_id, goal_type, target_value, progress_percentage, is_on_track, ... }
    ↓
Frontend: setGoals([newGoal, ...goals])
    ↓
Goal displayed as card with:
  - Progress bar (progress_percentage)
  - Current vs target values
  - is_on_track badge
  - Status (ACTIVE/COMPLETED/FAILED)
    ↓
Monthly cron job (not implemented) would update progress
```

---

### 6.5 2FA Setup Flow (End-to-End)

```
User navigates to Settings page
    ↓
Component mounts, calls twoFAAPI.getStatus()
    ↓
Response: { is_enabled: false, backup_codes_remaining: 0 }
    ↓
Display "Enable 2FA" button
    ↓
User clicks button
    ↓
POST /api/v1/auth/2fa/setup { enable: true }
    ↓
Backend: Extract user_id from Bearer token
    ↓
Backend: Check if 2FA already enabled
    ↓
Backend: Generate random base32 secret (pyotp)
    ↓
Backend: Generate 10 backup codes
    ↓
Backend: Create QR code provisioning URI
    ↓
Backend: Encode QR code PNG to base64
    ↓
Response: { secret, qr_code, backup_codes }
    ↓
Frontend: Display QR code image (<img src="data:image/png;base64,..." />)
    ↓
User scans with authenticator app (Google Auth, Authy, etc.)
    ↓
Authenticator app generates 6-digit TOTP code
    ↓
User enters OTP in dialog
    ↓
POST /api/v1/auth/2fa/verify { otp_code: "123456" }
    ↓
Backend: Validate OTP against secret using pyotp.TOTP.verify()
    ↓
Backend: Set is_enabled=true on TwoFactorAuth record
    ↓
Response: { status: "2FA enabled successfully" }
    ↓
Frontend: Update twoFAStatus.is_enabled = true
    ↓
Show "2FA Enabled" badge
    ↓
Display backup codes list for user to save
```

---

### 6.6 Trade Template Usage Flow (End-to-End)

```
User navigates to Templates page
    ↓
templatesAPI.getTemplates() → GET /api/v1/templates
    ↓
Backend: Query templates WHERE user_id = authenticated_user
    ↓
Response: { data: TradeTemplate[], total, skip, limit }
    ↓
Frontend: Display template cards with usage_count
    ↓
User clicks "Use" on a template
    ↓
POST /api/v1/templates/{id}/use { pair?, entry_price?, position_size? }
    ↓
Backend: Query TradeTemplate by id
    ↓
Backend: Verify ownership (template.user_id == current_user)
    ↓
Backend: Increment template.usage_count
    ↓
Backend: Create new Trade record with template data
    ↓
Backend: Merge template strategies with overrides
    ↓
Response: { status: string, trade: Trade }
    ↓
Frontend: Update templates list (usage_count increased)
    ↓
Toast: "Trade created from template #1"
    ↓
Navigation to /trades or show created trade
```

---

### 6.7 Statistics Retrieval Flow (End-to-End)

```
User navigates to Stats page
    ↓
Component mounts, triggers fetchStats()
    ↓
Promise.all([
    statsAPI.getEquityCurve(),
    statsAPI.getDailyPerformance(30),
    statsAPI.getPnLByPair(),
    statsAPI.getWinLossDistribution()
])
    ↓
Backend for each endpoint:
  1. getEquityCurve:
     - Query all closed trades
     - Calculate cumulative balance after each
     - Return [{ date, balance }, ...]
    
  2. getDailyPerformance:
     - Query trades in last N days
     - Group by date
     - Sum profit, count trades per day
     - Return [{ date, profit, trades }, ...]
    
  3. getPnLByPair:
     - Query all trades
     - Group by pair
     - Count wins/losses, sum P&L
     - Return [{ pair, wins, losses, total_pnl }, ...]
    
  4. getWinLossDistribution:
     - Count total wins and losses
     - Calculate percentages
     - Return { wins, win_percentage, losses, loss_percentage }
    ↓
Frontend: setState for each response
    ↓
Render Recharts visualizations:
  - Line chart (equity over time)
  - Bar chart (daily performance)
  - Pie chart (P&L by pair)
  - Cards (win/loss stats)
    ↓
User can filter by date range
    ↓
statsAPI.getStatsByDateRange(start, end) → GET /api/v1/stats/by_date_range
    ↓
Backend: Filter trades by date range, calculate stats
    ↓
Response: DateRangeStats { total_trades, win_rate, total_profit, ... }
    ↓
Frontend: Display in alert dialog
```

---

## Part 7: Error Handling & Toast Notifications

### Error States
- Network errors: Caught by axios, shown in toast
- 401 Unauthorized: Auto-redirect to /login
- 4xx Client errors: Shown in error state or alert
- 5xx Server errors: Shown in generic error alert

### Toast Notifications (Sonner)
- Success: "Trade created successfully"
- Error: "Failed to load trades" + error details
- Info: "Copying to clipboard..."
- Custom: Daily profit goal achievement

---

## Part 8: Not Yet Implemented (Frontend)

Based on code review, the following are **missing or incomplete**:

| Feature | Status | Evidence |
|---------|--------|----------|
| Profile picture upload | Not implemented | UI button exists, no handler |
| Password change | Not implemented | Form exists, no submit handler |
| Email notifications | Not implemented | UI only, no API calls |
| Trade image uploads | Not implemented | Field in schema but no upload UI |
| Export to CSV/PDF | Not implemented | Button exists, no handler |
| Advanced search filters | Not implemented | Only basic pair search exists |
| Real-time notifications | Not implemented | No WebSocket integration |
| Dark mode toggle | UI only | Theme toggle UI present, no implementation |
| Infinite scroll | Not implemented | Pagination is limit/offset only |
| Trade edit form validation | Minimal | No field-level validation messages |
| Responsive mobile layout | Partial | Desktop-first, limited mobile testing |

---

## Summary Statistics

**Total Frontend Routes:** 12  
**Total Pages:** 10  
**API Endpoints Consumed:** 41  
**Protected Routes:** 9  
**Public Routes:** 2  
**API Domains:** 7 (Auth, Trades, Stats, Journal, Templates, Goals, Reports, 2FA)  
**UI Components:** 40+ (shadcn/ui + custom)  
**TypeScript Types:** 15+ (User, Trade, JournalEntry, TradeTemplate, TradingGoal, TradingStats, etc.)  

---

**Document Generated:** 2026-01-03  
**Frontend Version:** 1.0.0  
**Framework:** React 18 + TypeScript + Vite  
**UI Library:** shadcn/ui + Recharts + Framer Motion  
**State Management:** Context API + useState  
**HTTP Client:** Axios with JWT interceptors
