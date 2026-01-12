# COMPREHENSIVE END-TO-END SYSTEM AUDIT
## Trading Journal Application - Phase 19

**Audit Date:** January 8, 2026  
**System Type:** Production-Grade Trading Journal  
**Scope:** Both Backend (FastAPI) and Frontend (React/TypeScript)

---

## 1. SYSTEM OVERVIEW

### What This Application Is
A **full-stack trading journal system** that allows forex/cryptocurrency traders to:
- Record and manage individual trades with detailed metadata
- Calculate cumulative profit/loss (equity curve)
- Visualize performance with institutional-grade charts
- Track statistics (win rate, R:R ratio, drawdown, etc.)
- Manage trading templates, goals, and journal entries
- Secure access with JWT authentication and 2FA

### Core Problem It Solves
Traders lack a **systematic way to record, analyze, and visualize their performance**. Without a trading journal:
- Trades are forgotten or lost
- Performance metrics are inaccurate
- Pattern recognition (which setups work?) is impossible
- Risk management discipline breaks down

This application **closes the gap** by providing:
1. **Trade Recording:** Entry/exit prices, risk, position size, direction
2. **Cumulative Analytics:** Running P&L, equity curve, drawdown
3. **Visual Feedback:** Charts showing profit/loss zones relative to starting balance
4. **Statistical Analysis:** Win rates, risk/reward ratios, daily/monthly performance

### User Type
- **Primary:** Retail/professional traders (Forex, Crypto, Stocks)
- **Usage Pattern:** Log trades during/after trading sessions, review analytics end-of-day/week
- **Risk Profile:** Must have high confidence in data accuracy (finances involved)

### Core Workflows

#### Workflow 1: Trade Entry to Close → Analytics
```
1. User logs in (JWT auth)
2. User creates trade (pair, direction, entry_price, stop_loss, take_profit, position_size)
3. Trade stored in DB with status=OPEN, opened_at timestamp
4. User updates trade (exit_price) or closes trade explicitly
5. Trade status changed to CLOSED, closed_at timestamp
6. Backend calculates: result_usd, risk_reward, return_percent
7. Frontend fetches updated equity curve
8. Chart redraws showing new running P&L
```

#### Workflow 2: Viewing Dashboard
```
1. User navigates to Stats page
2. Frontend calls GET /api/v1/stats/summary
3. Backend iterates closed trades, calculates: total_profit, win_rate, max_loss
4. Frontend calls GET /api/v1/stats/equity_curve/v2?starting_balance=50
5. Backend performs zero-crossing interpolation, returns EquityCurveResponse
6. Frontend renders RunningPLV2 component with gradient fills (GREEN=profit, RED=loss)
7. User sees institutional-grade P&L chart
```

#### Workflow 3: Authentication
```
1. User submits email + password to /api/v1/auth/signup or /api/v1/auth/login
2. Backend validates credentials, generates JWT token
3. Token stored in localStorage on frontend
4. All subsequent requests include Authorization header
5. Backend validates token via get_current_user() dependency
6. If invalid/expired, user redirected to /login
```

---

## 2. BACKEND AUDIT

### Technology Stack
| Component | Technology | Version | Notes |
|-----------|-----------|---------|-------|
| Framework | FastAPI | Latest | Async-first, auto-generated OpenAPI docs |
| ORM | SQLModel | Latest | Combines SQLAlchemy + Pydantic |
| Database | SQLite | Built-in | File: `trading_journal.db` |
| Auth | JWT + OAuth2 | python-jose | Token-based, 15-min expiry |
| Password Hashing | bcrypt | Latest | Via `passlib` |
| 2FA | TOTP | pyotp | QR code generation, backup codes |
| Server | Uvicorn | Latest | ASGI server on port 8001 |
| Migrations | Alembic | Latest | Version control for schema |
| Python | 3.8+ | 3.8.13 tested | Requires List[T] syntax (not list[T]) |

### Backend Folder Structure

```
app/
├── main.py                    # FastAPI app initialization, CORS, route registration
├── core/
│   └── config.py             # Settings: DATABASE_URL, SECRET_KEY, CORS_ORIGINS, DATA_MODE
├── api/v1/
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py           # JWT login, signup, get_current_user()
│   │   ├── trades.py         # CREATE/READ/UPDATE/DELETE trades, close_trade
│   │   └── stats.py          # Summary stats, equity curve, P&L by pair
│   ├── journal_api.py        # Journal entries (reflective notes on trades)
│   ├── templates_api.py      # Trade templates (reusable setups)
│   ├── goals_api.py          # Trading goals/targets
│   ├── reports_api.py        # Report generation
│   └── twofa_api.py          # 2FA setup/verify/status
├── crud/
│   ├── user.py               # get_user_by_email(), create_user()
│   ├── trade.py              # create_trade(), close_trade(), get_trades()
│   └── stats.py              # get_summary_stats(), get_equity_curve_v2()
├── models/
│   ├── user.py               # User table (id, email, name, hashed_password)
│   ├── trade.py              # Trade table (17 fields: pair, direction, entry_price, etc.)
│   ├── journal.py            # JournalEntry table
│   ├── template.py           # TradeTemplate table
│   ├── goal.py               # TradingGoal table
│   └── twofa.py              # TwoFactorAuth table
├── schemas/
│   ├── user.py               # UserCreate, UserRead, UserUpdate (Pydantic)
│   ├── trade.py              # TradeCreate, TradeRead, TradeUpdate
│   ├── auth.py               # LoginRequest, Token
│   └── equity_curve.py       # EquityCurvePoint, EquityCurveResponse
├── db/
│   └── session.py            # SQLModel engine, get_session() dependency
├── utils/
│   ├── security.py           # hash_password(), verify_password(), create_access_token()
│   ├── trading.py            # calculate_pips(), calculate_rr()
│   └── seed.py               # seed_trades() for test data
└── alembic/
    ├── env.py                # Migration environment
    └── versions/             # Migration files (init_user, add_journal, etc.)
```

### API Endpoints (Complete Reference)

#### Authentication Routes (`/api/v1/auth`)
| Method | Route | Purpose | Auth | Response |
|--------|-------|---------|------|----------|
| POST | `/signup` | Create new user | No | `{ access_token, token_type }` |
| POST | `/login` | User login | No | `{ access_token, token_type }` |
| GET | `/me` | Get current user | Yes | `UserRead { id, email, name, created_at }` |
| POST | `/logout` | Logout (client clears token) | Yes | `{ message: "Logged out" }` |

#### Trade Routes (`/api/v1/trades`)
| Method | Route | Purpose | Auth | Query Params | Response |
|--------|-------|---------|------|--------------|----------|
| POST | `/` | Create trade | Yes | — | `TradeRead` |
| GET | `/` | List trades | Yes | `pair`, `status`, `start_date`, `end_date`, `skip`, `limit` | `List[TradeRead]` |
| GET | `/{trade_id}` | Get single trade | Yes | — | `TradeRead` |
| PUT | `/{trade_id}` | Update trade | Yes | — | `TradeRead` |
| DELETE | `/{trade_id}` | Delete trade | Yes | — | `{ message: "Deleted" }` |
| POST | `/{trade_id}/close` | Close trade (set exit_price, status=CLOSED) | Yes | — | `TradeRead` |

#### Stats Routes (`/api/v1/stats`)
| Method | Route | Purpose | Response |
|--------|-------|---------|----------|
| GET | `/summary` | Total trades, win rate, R:R, profit, drawdown | `{ total_trades, winning_trades, losing_trades, win_rate, avg_risk_reward, total_profit, daily_profit, max_loss }` |
| GET | `/equity_curve` | Simple cumulative P&L | `List[{ date, balance }]` |
| GET | `/equity_curve/v2?starting_balance=X` | **Institutional** equity curve with zero-crossing | `EquityCurveResponse { starting_balance, curve[], summary, data_quality }` |
| GET | `/pnl_by_pair` | P&L breakdown per pair | `List[{ pair, trades, wins, win_rate, profit }]` |
| GET | `/win_loss_distribution` | Win/loss counts | `{ winning_trades, losing_trades, win_rate }` |

#### Journal Routes (`/api/v1/journal`)
| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| GET | `/` | List journal entries | Yes |
| POST | `/` | Create journal entry | Yes |
| GET | `/{entry_id}` | Get single entry | Yes |
| PUT | `/{entry_id}` | Update entry | Yes |
| DELETE | `/{entry_id}` | Delete entry | Yes |

#### Additional Routes
- **Templates** (`/api/v1/templates`): CRUD for trade templates
- **Goals** (`/api/v1/goals`): CRUD for trading goals
- **2FA** (`/api/v1/auth/2fa/setup`, `/verify`): Two-factor authentication
- **Reports** (`/api/v1/reports`): Summary and pair statistics

#### System Routes
- `GET /api/v1/system/mode` → Returns current DATA_MODE (test/seed/real)
- `POST /api/v1/system/mode` → Set DATA_MODE (for testing)

### Authentication & Authorization Flow

**JWT Implementation:**
1. User calls POST `/api/v1/auth/login` with email + password
2. Backend queries User table, verifies password via `verify_password(password, user.hashed_password)`
3. Backend creates JWT token via `create_access_token(user.id)` with 15-min expiry
4. Frontend stores token in `localStorage['token']`
5. All requests include `Authorization: Bearer <token>` header
6. Backend dependency `get_current_user(token)` validates:
   - Token signature (SECRET_KEY)
   - Token expiry
   - User exists in database
7. If invalid → 401 Unauthorized, frontend clears token, redirects to /login

**Authorization:**
- All trade/stats/journal routes require valid JWT
- User can only see their own trades (not enforced in current code — **SECURITY GAP**)
- No role-based access control (admin/user distinction)

**2FA (Optional):**
- User can enable TOTP (Time-based One-Time Password)
- Stores secret in TwoFactorAuth table
- Generates QR code for authenticator apps
- Backup codes for account recovery

### Database Schema

#### User Table
```sql
CREATE TABLE user (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  hashed_password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

#### Trade Table (17 fields)
```sql
CREATE TABLE trade (
  id INTEGER PRIMARY KEY,
  pair TEXT NOT NULL,                    -- "EUR/USD", "BTC/USDT"
  direction TEXT NOT NULL,               -- "BUY" or "SELL"
  entry_price REAL NOT NULL,
  exit_price REAL,                       -- NULL until closed
  stop_loss REAL,                        -- User's protective stop
  take_profit REAL,                      -- User's profit target
  position_size REAL NOT NULL,           -- Lots/contracts
  risk_reward REAL,                      -- Calculated reward/risk
  result_pips REAL,                      -- Pips gained/lost (calculated)
  result_usd REAL,                       -- USD P&L (calculated)
  notes TEXT,                            -- Trade analysis notes
  screenshot_url TEXT,                   -- Chart screenshot
  status TEXT DEFAULT 'OPEN',            -- "OPEN" or "CLOSED"
  opened_at TIMESTAMP DEFAULT NOW(),
  closed_at TIMESTAMP,                   -- Set when status → CLOSED
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

#### Supporting Tables
- **JournalEntry:** id, trade_id, content, created_at (reflective notes)
- **TradeTemplate:** id, name, pair, direction, risk_percent (reusable setups)
- **TradingGoal:** id, name, target_profit, deadline (goal tracking)
- **TwoFactorAuth:** id, user_id, secret, backup_codes (2FA data)

### Trade Lifecycle

**State Transitions:**
```
OPEN ──(user provides exit_price)──> CLOSED
```

**Trade Creation:**
```python
# POST /api/v1/trades/
trade = Trade(
    pair="EUR/USD",
    direction="BUY",
    entry_price=1.1000,
    stop_loss=1.0950,
    take_profit=1.1100,
    position_size=1.0,
    status=TradeStatus.OPEN,
    opened_at=datetime.utcnow()
)
session.add(trade)
session.commit()
```

**Trade Closure:**
```python
# POST /api/v1/trades/{trade_id}/close
trade.exit_price = 1.1050
trade.status = TradeStatus.CLOSED
trade.closed_at = datetime.utcnow()

# Calculate result
result_usd = (1.1050 - 1.1000) * 1.0 = $0.0050
risk = (1.1000 - 1.0950) = 0.0050
reward = (1.1100 - 1.1000) = 0.0100
risk_reward = 0.0100 / 0.0050 = 2.0

session.commit()
```

### P&L Computation Logic

**File:** `app/crud/stats.py`

#### calculate_trade_result(trade)
```python
def calculate_trade_result(trade: Trade) -> float:
    if trade.status != TradeStatus.CLOSED or not trade.exit_price:
        return 0
    if trade.direction == "BUY":
        return (trade.exit_price - trade.entry_price) * trade.position_size
    else:  # SELL
        return (trade.entry_price - trade.exit_price) * trade.position_size
```
**Logic:** 
- BUY: Profit if exit > entry
- SELL: Profit if entry > exit
- Multiply by position_size (e.g., 1.0 lot = $100 per pip for EUR/USD)

#### Equity Curve Calculation (get_equity_curve_v2)
**Purpose:** Create institutional-grade equity curve with:
1. Starting balance anchor point
2. Cumulative P&L after each closed trade
3. Zero-crossing synthetic interpolation (exact point where P&L crosses starting balance threshold)
4. Event audit trail (which trade caused each point)

**Algorithm:**
```
1. Sort trades by closed_at timestamp
2. Initialize balance = starting_balance
3. For each closed trade:
   - Calculate trade result
   - Add to balance
   - Create EquityCurvePoint with:
     * timestamp_iso, sequence_id
     * balance_total (cumulative)
     * balance_realized (sum of closed P&L)
     * return_percent ((balance - starting) / starting * 100)
     * event (which trade, type TRADE_CLOSE)
4. Return EquityCurveResponse with:
   - curve (list of points)
   - summary (ending_balance, max_balance, min_balance, max_drawdown)
   - data_quality (warnings, completeness)
```

#### Zero-Crossing Interpolation
**Problem:** Chart shows "gaps" at sign changes (visual artifacts)  
**Solution:** Inject synthetic points at exact threshold crossing
```
If balance[i] > starting_balance AND balance[i+1] < starting_balance:
  - Calculate exact timestamp where balance == starting_balance
  - Linear interpolation: t = (starting - balance[i]) / (balance[i+1] - balance[i])
  - Create synthetic point at interpolated timestamp
  - Frontend can now render clean gradient transition
```

### Statistics Calculation

**Win Rate:**
```python
wins = [r for r in results if r > 0]
win_rate = (len(wins) / total_trades) * 100
```

**Average Risk:Reward:**
```python
calculated_rr = [calculate_trade_risk_reward(t) for t in trades]
avg_rr = sum(calculated_rr) / len(trades)
```

**Max Drawdown (Approximate):**
```python
max_balance = max([balance for balance, _ in equity_curve])
min_balance = min([balance for balance, _ in equity_curve])
max_drawdown_percent = ((min_balance - max_balance) / max_balance) * 100
```

---

## 3. FRONTEND AUDIT

### Technology Stack
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | React | 18+ | UI library |
| Language | TypeScript | Latest | Type safety |
| Build Tool | Vite | 5.4.21 | Fast dev server, optimized bundling |
| Styling | Tailwind CSS | Latest | Utility-first CSS |
| UI Components | shadcn/ui | Latest | Pre-built accessible components |
| Charts | Recharts | Latest | React wrapper for D3/SVG charts |
| HTTP Client | Axios | Latest | API communication |
| Router | React Router | Latest | Client-side routing |
| Node Version | 20.19.5 | Locked in `.nvmrc` | Auto-select via nvm |

### Frontend Folder Structure

```
Frontend/src/
├── main.tsx              # React entry point, routes configuration
├── App.tsx               # Root component with router setup
├── lib/
│   ├── api.ts            # Axios instance, API types, statsAPI, tradesAPI
│   └── utils.ts          # Helper functions
├── theme/
│   └── colors.ts         # Design tokens (TRADING_COLORS, CHART_DEFAULTS)
├── pages/
│   ├── Index.tsx         # Landing/home page
│   ├── Dashboard.tsx     # Main dashboard with overview
│   ├── Trades.tsx        # Trade management (create, list, edit)
│   ├── Stats.tsx         # Analytics with RunningPLV2 chart
│   ├── Journal.tsx       # Journal entries
│   ├── Templates.tsx     # Trade templates
│   ├── Goals.tsx         # Trading goals
│   ├── Reports.tsx       # Report generation
│   ├── Settings.tsx      # User settings
│   ├── Profile.tsx       # User profile
│   ├── NotFound.tsx      # 404 page
│   └── auth/
│       ├── Login.tsx     # Login form
│       └── Signup.tsx    # Registration form
├── components/
│   ├── RunningPLV2.tsx   # [CRITICAL] Institutional equity curve chart (600 lines)
│   ├── PerformanceCalendar.tsx  # Calendar heatmap of daily performance
│   ├── Layout.tsx        # Main layout wrapper
│   ├── Sidebar.tsx       # Navigation sidebar
│   ├── UserMenu.tsx      # User dropdown menu
│   ├── ViewModeToggle.tsx # Test/Seed/Real mode switcher
│   └── ui/               # shadcn/ui components
│       ├── card.tsx, button.tsx, input.tsx, etc.
│       └── [30+ reusable components]
├── hooks/
│   ├── useAuth.ts        # Auth state hook
│   └── use-toast.ts      # Toast notifications
└── __tests__/
    ├── api.test.ts       # API integration tests
    └── [test files]
```

### Key Pages & Functionality

#### Stats.tsx (Line 552)
**Purpose:** Central analytics dashboard showing complete trading performance

**Key Features:**
- Fetches `GET /api/v1/stats/summary` → displays in metric cards (Total Profit, Win Rate, R:R, Total Trades)
- Fetches `GET /api/v1/stats/equity_curve/v2?starting_balance=50` → passes data to RunningPLV2
- Conditional rendering: Shows RunningPLV2 only when `curve.length > 0`
- Empty state: "No trades yet. Start trading..." when `curve.length === 0`
- Tabs for different views: Overview, Calendar, Monthly, By Pair, Strategy, Risk

**Data Flow:**
```
Stats.tsx (useEffect)
  ├─> statsAPI.getSummary() 
  │   └─> GET /api/v1/stats/summary
  │       └─> setStats(data)
  │
  └─> statsAPI.getEquityCurveV2(50)
      └─> GET /api/v1/stats/equity_curve/v2?starting_balance=50
          └─> setEquityCurveV2(data)
              └─> <RunningPLV2 data={equityCurveV2} />
```

#### Trades.tsx
**Purpose:** Trade management interface

**Features:**
- Create new trade (form with entry_price, stop_loss, take_profit, position_size)
- List all trades with status indicator (OPEN/CLOSED)
- Edit trade metadata
- Close trade (trigger status change to CLOSED)
- Filter by pair, status, date range

#### RunningPLV2.tsx (600 lines) [INSTITUTIONAL-GRADE]
**Purpose:** Premium equity curve visualization

**Features:**
1. **Gradient Fill Masking:**
   - `balance_positive`: Shows GREEN when `balance_total >= starting_balance` (profit zone)
   - `balance_negative`: Shows RED when `balance_total <= starting_balance` (loss/drawdown zone)

2. **Zero-Crossing Synthetic Interpolation:**
   - Detects when balance crosses starting_balance threshold
   - Creates synthetic point at exact crossing timestamp
   - Prevents visual artifacts (zig-zag) at sign changes

3. **Extrema-Preserving Decimation:**
   - If >200 points, bins data into segments
   - Preserves min/max values within each bin
   - Prevents "flattening" of visual data on zoom out

4. **Custom Tooltip:**
   - Shows actual `balance_total` value (not `balance_positive`/`balance_negative`)
   - Displays timestamp and return %
   - Marks synthetic points as "(interpolated)"

5. **Visual Elements:**
   - Line: Main P&L line (color changes based on profit/loss)
   - Area (profit): GREEN fill when above starting balance
   - Area (loss): RED fill when below starting balance
   - Reference Line: Horizontal line at starting_balance showing breakeven threshold
   - Terminal Dot: Large circle highlighting final data point

**Critical Code Section:**
```typescript
function enhanceEquityCurveData(points: EquityCurvePoint[], startingBalance: number): EnhancedPoint[] {
  // For each trade point:
  // - Skip FUNDING events (initial balance anchor)
  // - Create balance_positive = balance_total >= startingBalance ? balance_total : null
  // - Create balance_negative = balance_total <= startingBalance ? balance_total : null
  
  // If balance crosses threshold between points:
  // - Calculate exact timestamp via linear interpolation
  // - Insert synthetic point at crossing
  // - Ensures clean gradient transition
}
```

### State Management Strategy

**No Redux/Zustand:** Uses React hooks directly

**Per-Page State:**
```typescript
// Stats.tsx
const [stats, setStats] = useState(null);
const [equityCurveV2, setEquityCurveV2] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

// Trades.tsx
const [trades, setTrades] = useState([]);
const [selectedTrade, setSelectedTrade] = useState(null);
```

**Auth State:**
```typescript
// useAuth.ts
const [user, setUser] = useState(null);
const [isAuthenticated, setIsAuthenticated] = useState(false);
// Checks localStorage['token'] on mount
```

**API Communication:**
- No caching layer
- Each page fetches data on mount via useEffect
- No polling (static data, user refreshes page to update)

### API Consumption Flow

**statsAPI (in lib/api.ts):**
```typescript
export const statsAPI = {
  getSummary: async () => {
    const response = await api.get('/stats/summary');
    return response.data;  // TradingStats
  },
  
  getEquityCurveV2: async (startingBalance: number) => {
    const response = await api.get('/stats/equity_curve/v2', {
      params: { starting_balance: startingBalance }
    });
    return response.data;  // EquityCurveResponse
  },
};
```

**tradesAPI (in lib/api.ts):**
```typescript
export const tradesAPI = {
  create: async (trade: TradeCreate) => 
    api.post('/trades', trade),
  
  getAll: async (filters?: TradeFilters) =>
    api.get('/trades', { params: filters }),
  
  get: async (id: number) =>
    api.get(`/trades/${id}`),
  
  update: async (id: number, trade: TradeUpdate) =>
    api.put(`/trades/${id}`, trade),
  
  close: async (id: number) =>
    api.post(`/trades/${id}/close`),
  
  delete: async (id: number) =>
    api.delete(`/trades/${id}`),
};
```

### Validation & User Input Logic

**Trade Creation Form (Trades.tsx):**
- Entry price: `number > 0`
- Exit price: `number > 0` (only on close)
- Stop loss: `number > 0`, must be < entry (BUY) or > entry (SELL)
- Take profit: `number > 0`, must be > entry (BUY) or < entry (SELL)
- Position size: `number > 0`
- Pair: `string`, validated against list (EUR/USD, BTC/USDT, etc.)

**Frontend Validation:**
- Form-level: Basic type checking, null checks
- No Zod/Yup schema validation **(MISSING)**
- Backend returns validation errors if needed

**Backend Validation (Pydantic schemas):**
```python
class TradeCreate(SQLModel):
    pair: str
    direction: TradeDirection
    entry_price: float = Field(gt=0)
    position_size: float = Field(gt=0)
    stop_loss: Optional[float] = Field(gt=0)
    take_profit: Optional[float] = Field(gt=0)
    # Validator logic in schema or route handler
```

### Error Handling & Loading States

**Network Errors:**
```typescript
try {
  const data = await statsAPI.getSummary();
  setStats(data);
} catch (err) {
  setError("Failed to load stats data.");
  console.error(err);
}
```

**Loading State:**
```typescript
useEffect(() => {
  setLoading(true);
  fetchData()
    .finally(() => setLoading(false));
}, []);

// In JSX:
{loading && <div>Loading statistics...</div>}
{error && <div className="text-destructive">{error}</div>}
{stats && <YourComponent data={stats} />}
```

**401 Handling (Axios Interceptor):**
```typescript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';  // Force login
    }
    return Promise.reject(error);
  }
);
```

---

## 4. DATA FLOW MAP: Single Trade Example

**Scenario:** User opens "EUR/USD BUY" at 1.1000, closes at 1.1050

### Complete Flow with Files

```
┌─────────────────────────────────────────────────────────────┐
│ 1. FRONTEND - USER CREATES TRADE                            │
│    File: Frontend/src/pages/Trades.tsx (line ~150)          │
└─────────────────────────────────────────────────────────────┘
    User fills form:
    - pair: "EUR/USD"
    - direction: "BUY"
    - entry_price: 1.1000
    - stop_loss: 1.0950
    - take_profit: 1.1100
    - position_size: 1.0
    
    Click "Create Trade"
    ↓
    tradesAPI.create(tradeData)  [lib/api.ts line ~400]
    ↓
    POST /api/v1/trades/
    with body: { pair, direction, entry_price, ... }

┌─────────────────────────────────────────────────────────────┐
│ 2. BACKEND - VALIDATE & STORE TRADE                         │
│    File: app/api/v1/routes/trades.py line ~40               │
└─────────────────────────────────────────────────────────────┘
    @router.post("/", response_model=TradeRead)
    async def create_trade_endpoint(
        trade_in: TradeCreate,
        session: Session = Depends(get_session)
    ):
        # Pydantic validates: entry_price > 0, position_size > 0, etc.
        # Calls crud function:
        trade = create_trade(session, trade_in)
        return trade

┌─────────────────────────────────────────────────────────────┐
│ 3. BACKEND - CRUD LAYER SAVES TO DATABASE                   │
│    File: app/crud/trade.py line ~20                         │
└─────────────────────────────────────────────────────────────┘
    def create_trade(session: Session, trade_in: TradeCreate):
        db_trade = Trade(
            pair="EUR/USD",
            direction=TradeDirection.BUY,
            entry_price=1.1000,
            stop_loss=1.0950,
            take_profit=1.1100,
            position_size=1.0,
            status=TradeStatus.OPEN,
            opened_at=datetime.utcnow()
        )
        session.add(db_trade)
        session.commit()
        session.refresh(db_trade)
        return db_trade

┌─────────────────────────────────────────────────────────────┐
│ 4. DATABASE - PERSISTED TRADE                               │
│    File: trading_journal.db (SQLite)                        │
└─────────────────────────────────────────────────────────────┘
    INSERT INTO trade (
        pair, direction, entry_price, stop_loss, take_profit,
        position_size, status, opened_at, created_at, updated_at
    ) VALUES (
        'EUR/USD', 'BUY', 1.1000, 1.0950, 1.1100,
        1.0, 'OPEN', '2026-01-08 14:30:00', '2026-01-08 14:30:00', ...
    )
    → Returns: trade.id = 1

┌─────────────────────────────────────────────────────────────┐
│ 5. FRONTEND - RECEIVES TRADE & UPDATES UI                   │
│    File: Frontend/src/pages/Trades.tsx                      │
└─────────────────────────────────────────────────────────────┘
    Response: { id: 1, pair: "EUR/USD", status: "OPEN", ... }
    setTrades([...trades, newTrade])
    UI updates: Trade appears in list with "OPEN" badge

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[USER LATER CLOSES TRADE]

┌─────────────────────────────────────────────────────────────┐
│ 6. FRONTEND - USER CLOSES TRADE                             │
│    File: Frontend/src/pages/Trades.tsx (line ~200)          │
└─────────────────────────────────────────────────────────────┘
    User finds trade ID=1 in list
    Clicks "Close Trade"
    Opens dialog, enters exit_price: 1.1050
    Clicks "Confirm Close"
    
    tradesAPI.update(1, { exit_price: 1.1050 })
    OR
    tradesAPI.close(1, { exit_price: 1.1050 })

┌─────────────────────────────────────────────────────────────┐
│ 7. BACKEND - UPDATE TRADE & CALCULATE P&L                   │
│    File: app/api/v1/routes/trades.py line ~80               │
└─────────────────────────────────────────────────────────────┘
    @router.post("/{trade_id}/close")
    async def close_trade_endpoint(
        trade_id: int,
        close_request: TradeClose,
        session: Session = Depends(get_session)
    ):
        trade = close_trade(session, trade_id, close_request)
        return trade

┌─────────────────────────────────────────────────────────────┐
│ 8. BACKEND - CRUD UPDATES DATABASE & CALCULATES             │
│    File: app/crud/trade.py line ~60                         │
└─────────────────────────────────────────────────────────────┘
    def close_trade(session: Session, trade_id: int, close_request):
        trade = session.get(Trade, trade_id)
        trade.exit_price = 1.1050
        trade.status = TradeStatus.CLOSED
        trade.closed_at = datetime.utcnow()
        
        # Calculate result
        from app.crud.stats import calculate_trade_result
        trade.result_usd = calculate_trade_result(trade)
                         = (1.1050 - 1.1000) * 1.0
                         = 0.0050 USD
        
        session.commit()
        return trade

┌─────────────────────────────────────────────────────────────┐
│ 9. DATABASE - TRADE UPDATED                                 │
│    File: trading_journal.db                                 │
└─────────────────────────────────────────────────────────────┘
    UPDATE trade SET
        exit_price = 1.1050,
        status = 'CLOSED',
        closed_at = '2026-01-08 15:45:00',
        result_usd = 0.0050,
        updated_at = '2026-01-08 15:45:00'
    WHERE id = 1

┌─────────────────────────────────────────────────────────────┐
│ 10. FRONTEND - NAVIGATES TO STATS PAGE                      │
│     File: Frontend/src/pages/Stats.tsx (line ~50)           │
└─────────────────────────────────────────────────────────────┘
    useEffect(() => {
        (async () => {
            // Fetch summary stats
            const stats = await statsAPI.getSummary()
            setStats(stats)
            
            // Fetch institutional equity curve
            const curve = await statsAPI.getEquityCurveV2(50)
            setEquityCurveV2(curve)
        })()
    }, [])

┌─────────────────────────────────────────────────────────────┐
│ 11. BACKEND - CALCULATE SUMMARY STATS                       │
│     File: app/api/v1/routes/stats.py line ~10               │
└─────────────────────────────────────────────────────────────┘
    @router.get("/summary")
    async def summary_stats(session: Session = Depends(get_session)):
        return get_summary_stats(session)

┌─────────────────────────────────────────────────────────────┐
│ 12. BACKEND - CRUD COMPUTES METRICS                         │
│     File: app/crud/stats.py line ~30                        │
└─────────────────────────────────────────────────────────────┘
    def get_summary_stats(session: Session):
        trades = session.exec(
            select(Trade).where(Trade.status == TradeStatus.CLOSED)
        ).all()
        # Now: trades = [Trade(id=1, pair=EUR/USD, result_usd=0.0050, ...)]
        
        calculated_results = [0.0050]
        wins = [0.0050]
        total = 1
        
        win_rate = (1 / 1) * 100 = 100%
        total_profit = 0.0050
        
        Returns: {
            total_trades: 1,
            winning_trades: 1,
            losing_trades: 0,
            win_rate: 100.0,
            total_profit: 0.0050,
            ...
        }

┌─────────────────────────────────────────────────────────────┐
│ 13. BACKEND - BUILD EQUITY CURVE WITH INTERPOLATION         │
│     File: app/api/v1/routes/stats.py line ~15               │
└─────────────────────────────────────────────────────────────┘
    @router.get("/equity_curve/v2")
    async def equity_curve_v2(
        session: Session = Depends(get_session),
        starting_balance: float = Query(50)
    ):
        return get_equity_curve_v2(session, starting_balance)

┌─────────────────────────────────────────────────────────────┐
│ 14. BACKEND - CRUD BUILDS FULL CURVE RESPONSE               │
│     File: app/crud/stats.py line ~200                       │
└─────────────────────────────────────────────────────────────┘
    def get_equity_curve_v2(session: Session, starting_balance: float):
        trades = session.exec(select(Trade)).all()
        # trades = [Trade(id=1, closed_at=..., result_usd=0.0050, ...)]
        
        curve = []
        
        # Add FUNDING anchor point
        curve.append(EquityCurvePoint(
            timestamp_iso="2026-01-08T14:30:00",
            balance_total=50.0,
            event=EquityCurveEvent(type="FUNDING", description="Initial balance")
        ))
        
        # Process trade
        balance = 50.0
        balance += 0.0050  # = 50.0050
        
        curve.append(EquityCurvePoint(
            timestamp_iso="2026-01-08T15:45:00",
            balance_total=50.0050,
            return_percent=((50.0050 - 50.0) / 50.0) * 100 = 0.01%,
            event=EquityCurveEvent(type="TRADE_CLOSE", trade_id=1, ...)
        ))
        
        # Check for threshold crossing
        # 50.0 → 50.0050: No crossing (both >= 50.0)
        # Skip synthetic point creation
        
        Returns: EquityCurveResponse(
            starting_balance=50.0,
            curve=[FUNDING_point, TRADE_point],
            summary={
                ending_balance=50.0050,
                max_balance=50.0050,
                min_balance=50.0,
                max_drawdown_percent=0,
                total_return_percent=0.01
            }
        )

┌─────────────────────────────────────────────────────────────┐
│ 15. FRONTEND - RENDER INSTITUTIONAL CHART                   │
│     File: Frontend/src/components/RunningPLV2.tsx (line 1)  │
└─────────────────────────────────────────────────────────────┘
    <RunningPLV2 
        data={{
            starting_balance: 50.0,
            curve: [FUNDING_point, TRADE_point],
            summary: { ending_balance: 50.0050, ... }
        }}
    />
    
    Component enhances data:
    - Skip FUNDING event
    - Create balance_positive: 50.0050 >= 50.0 ? 50.0050 : null = 50.0050
    - Create balance_negative: 50.0050 <= 50.0 ? 50.0050 : null = null
    - No threshold crossing detected
    
    Renders:
    - GREEN area filled (balance_positive)
    - Line showing 50.0 → 50.0050 trajectory
    - Reference line at 50.0 (breakeven)
    - Tooltip showing "$50.01" (+0.01% return)

┌─────────────────────────────────────────────────────────────┐
│ 16. FRONTEND - USER SEES UPDATED DASHBOARD                  │
│     File: Frontend/src/pages/Stats.tsx                      │
└─────────────────────────────────────────────────────────────┘
    Metric Cards Updated:
    ┌─────────────────────┐
    │ Total Profit        │
    │ $0.01               │  ← Was $0.00
    └─────────────────────┘
    
    ┌─────────────────────┐
    │ Win Rate            │
    │ 100.0%              │  ← Was N/A
    └─────────────────────┘
    
    Running P&L Chart: Shows small GREEN area above $50.0 line
```

---

## 5. CURRENT SYSTEM CAPABILITIES

### Fully Implemented & Working ✅

1. **User Authentication**
   - Sign up with email + password
   - Login with email + password
   - JWT token generation (15-min expiry)
   - Token stored in localStorage
   - Logout (client-side token removal)

2. **Trade Management**
   - Create trade (BUY/SELL, any currency pair)
   - Store: entry price, exit price, stop loss, take profit, position size
   - List all trades with pagination, filtering by pair/status/date
   - Update trade metadata (notes, screenshots)
   - Close trade (mark as CLOSED, calculate P&L)
   - Delete trade (hard delete from database)

3. **P&L Calculation**
   - Trade result (USD): (exit - entry) × position_size
   - Win rate: % of closed trades with positive P&L
   - Average risk:reward ratio

4. **Equity Curve Visualization**
   - Calculate cumulative P&L after each trade
   - Display as line chart with area fill
   - Institutional-grade features:
     * Gradient masking (GREEN profit zone, RED loss zone)
     * Threshold crossing interpolation
     * Extrema-preserving decimation (200+ points)
     * Zero-crossing synthetic points

5. **Statistics Dashboard**
   - Total profit, win rate, R:R ratio, max loss
   - Metric cards with icons
   - Equity curve chart (v2)
   - Empty state handling

6. **Frontend UI/UX**
   - Responsive layout (desktop-first)
   - Navigation tabs
   - Form inputs with validation feedback
   - Loading/error state handling
   - Dark mode support (via Tailwind)

### Partially Implemented 🟡

1. **2FA (Two-Factor Authentication)**
   - Backend: Setup, verify, backup codes generation ✅
   - Frontend: No UI for 2FA setup ❌
   - Optional (not enforced)

2. **Journal Entries**
   - Backend CRUD endpoints exist
   - Frontend: Journal.tsx page exists but minimal functionality
   - Not integrated with trade lifecycle

3. **Trade Templates**
   - Backend CRUD exists
   - Frontend: Templates.tsx exists but not fully functional
   - Idea: Save/reuse common trade setups

4. **Trading Goals**
   - Backend CRUD exists
   - Frontend: Goals.tsx exists but minimal
   - Idea: Track progress toward profit targets

5. **Reports**
   - Backend: reports_api.py has summary + by-pair endpoints
   - Frontend: Reports.tsx exists but mostly empty
   - Missing: Report generation, PDF export, email

6. **Performance Calendar**
   - Component created: `PerformanceCalendar.tsx`
   - Feature: Heatmap of daily P&L
   - Status: Not integrated into Stats page yet

### Not Yet Implemented / Implied ❌

1. **Multi-User Support**
   - Database schema assumes single user (no user_id foreign key on trades)
   - Authentication works but user isolation not enforced
   - **SECURITY GAP:** User A can theoretically access User B's trades (no authorization check)

2. **Trade Pair Management**
   - UI hardcodes pairs (EUR/USD, BTC/USDT, etc.)
   - No admin panel to add custom pairs
   - Not dynamic

3. **Position Management**
   - Only supports closed trades
   - No support for partially closed positions (scale out)
   - No open position tracking beyond status=OPEN

4. **Notifications**
   - No email/push notifications
   - No reminders for open trades
   - No alerts on P&L changes

5. **Historical Data Import**
   - No CSV import for past trades
   - Must manually enter each trade

6. **Broker Integration**
   - No direct API connection to MT4/MT5/Bybit/etc.
   - No auto-population of trades
   - Fully manual entry

7. **Risk Management Warnings**
   - No alerts for: oversized positions, high leverage, consecutive losses
   - No suggested position sizing based on risk %

8. **Backtesting Integration**
   - No connection to backtesting platforms
   - No historical performance analysis

9. **Export / Reports**
   - No PDF generation
   - No CSV export (frontend only)
   - No email scheduling

10. **Compliance**
    - No audit logs (who changed what, when)
    - No data retention policies
    - No GDPR export/delete tools

---

## 6. TECHNICAL DEBT & RISKS

(Document continues... saving to file to avoid length limit)
