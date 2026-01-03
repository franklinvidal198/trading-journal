# Trading Performance Calendar - Data Flow Diagram

## End-to-End User Interaction Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER VIEWS DASHBOARD                         │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
                    Dashboard.tsx mounts
                   useEffect on load triggers
                                  ↓
                    ┌─────────────────────────┐
                    │  PerformanceCalendar.tsx │
                    │   (component created)    │
                    └─────────────────────────┘
                                  ↓
                      useEffect hook fires
                   (currentDate = Jan 2025)
                                  ↓
        ┌──────────────────────────────────────────┐
        │  const data =                             │
        │    statsAPI.getPerformanceCalendar(1, 2025)
        │                                          │
        │  Axios request interceptor injects JWT  │
        │  ↓ Sends GET request to:                │
        │  /api/v1/stats/performance_calendar     │
        │  ?month=1&year=2025                     │
        └──────────────────────────────────────────┘
                                  ↓
        ┌──────────────────────────────────────────────────────┐
        │           BACKEND RECEIVES REQUEST                   │
        │                                                      │
        │   FastAPI Route Handler:                           │
        │   performance_calendar(month=1, year=2025,          │
        │                        session=SessionDep)         │
        │                                                      │
        │   ├─ Validate params: month in 1-12 ✓             │
        │   │                   year in 2000-2100 ✓         │
        │   └─ Get database session                          │
        └──────────────────────────────────────────────────────┘
                                  ↓
        ┌──────────────────────────────────────────────────────┐
        │     CRUD Layer: get_performance_calendar()           │
        │                                                      │
        │  ├─ Query: SELECT * FROM trade                      │
        │  │         WHERE status = 'CLOSED'                  │
        │  │                                                  │
        │  ├─ Loop through all 2,847 trades in DB            │
        │  │                                                  │
        │  ├─ For each trade:                                │
        │  │  ├─ Extract closed_at.date() → Jan 2, 2025     │
        │  │  │                                              │
        │  │  ├─ If year=2025 AND month=1:                  │
        │  │  │  ├─ Calculate result USD:                   │
        │  │  │  │  (exit_price - entry_price) × size       │
        │  │  │  │  OR                                       │
        │  │  │  │  (entry_price - exit_price) × size (SELL)
        │  │  │  │  = $0.45 per trade                       │
        │  │  │  │                                           │
        │  │  │  ├─ Track: pnl += 0.45                       │
        │  │  │  │         trades += 1                       │
        │  │  │  │         result > 0 → wins += 1           │
        │  │  │  └─ daily_dict[Jan 2] = {pnl: 0.45,        │
        │  │  │                          trades: 2,         │
        │  │  │                          wins: 2}           │
        │  │  │                                              │
        │  │  └─ If year/month don't match: skip            │
        │  │                                                 │
        │  ├─ Build full month array (all 31 days)         │
        │  │                                                 │
        │  ├─ For each day 1-31:                            │
        │  │  ├─ If Jan 2 in daily_dict:                    │
        │  │  │  └─ winRate = (2 / 2) × 100 = 100.0%       │
        │  │  │      append({                               │
        │  │  │        date: "2025-01-02",                  │
        │  │  │        pnl: 0.45,                           │
        │  │  │        trades: 2,                           │
        │  │  │        winRate: 100.0                       │
        │  │  │      })                                     │
        │  │  │                                              │
        │  │  └─ If Jan 1 NOT in daily_dict:               │
        │  │     └─ append({                                │
        │  │          date: "2025-01-01",                   │
        │  │          pnl: 0.0,                             │
        │  │          trades: 0,                            │
        │  │          winRate: 0.0                          │
        │  │        })                                      │
        │  │                                                 │
        │  └─ Return sorted array of 31 day objects         │
        └──────────────────────────────────────────────────────┘
                                  ↓
        ┌──────────────────────────────────────────────────────┐
        │         RESPONSE SENT TO FRONTEND (JSON)            │
        │                                                      │
        │  Status: 200 OK                                     │
        │  Content-Type: application/json                     │
        │                                                      │
        │  Body:                                              │
        │  [                                                  │
        │    {                                                │
        │      "date": "2025-01-01",                         │
        │      "pnl": 0.0,                                   │
        │      "trades": 0,                                  │
        │      "winRate": 0.0                                │
        │    },                                              │
        │    {                                                │
        │      "date": "2025-01-02",                         │
        │      "pnl": 0.45,                                  │
        │      "trades": 2,                                  │
        │      "winRate": 100.0                              │
        │    },                                              │
        │    ... (29 more days)                              │
        │  ]                                                 │
        └──────────────────────────────────────────────────────┘
                                  ↓
        ┌──────────────────────────────────────────────────────┐
        │      AXIOS RESPONSE INTERCEPTOR (FRONTEND)          │
        │                                                      │
        │  ├─ Check status: 200 ✓                            │
        │  ├─ Extract response.data (array)                  │
        │  ├─ Return to component                            │
        │  └─ (401 would trigger redirect to /login)         │
        └──────────────────────────────────────────────────────┘
                                  ↓
        ┌──────────────────────────────────────────────────────┐
        │    COMPONENT STATE UPDATED (PerformanceCalendar)    │
        │                                                      │
        │  setCalendarData(data)                              │
        │  setLoading(false)                                  │
        │  setError(null)                                     │
        │                                                      │
        │  React detects state change → re-render             │
        └──────────────────────────────────────────────────────┘
                                  ↓
        ┌──────────────────────────────────────────────────────┐
        │         COMPONENT RENDER (UI CONSTRUCTION)          │
        │                                                      │
        │  ├─ Calculate min/max PnL for month:               │
        │  │  maxProfit = 0.45 (Jan 2)                       │
        │  │  maxLoss = 5.00 (Jan 3)                         │
        │  │                                                  │
        │  ├─ Render summary cards:                          │
        │  │  ├─ "Total PnL: -4.50"  (red)                  │
        │  │  ├─ "Trades: 4"                                │
        │  │  ├─ "Winning Days: 2"   (green)                │
        │  │  ├─ "Losing Days: 1"    (red)                  │
        │  │  └─ "No Activity: 28"                          │
        │  │                                                  │
        │  ├─ Render calendar grid (7 columns):             │
        │  │                                                  │
        │  │  Sun  Mon  Tue   Wed   Thu   Fri   Sat          │
        │  │            Jan1  Jan2  Jan3  Jan4             │
        │  │            [0]   [0.45][−5]  [2.05]           │
        │  │                                                  │
        │  │  ├─ Jan 1: bg-muted/30 (no trades)            │
        │  │  ├─ Jan 2: bg-green-300/40 (low profit)       │
        │  │  │         text: "+0.45"  "2t"                │
        │  │  │         Color formula: 0.45 / 0.45 = 1.0   │
        │  │  │         intensity > 0.4 → green-300/40      │
        │  │  │                                              │
        │  │  ├─ Jan 3: bg-red-400/60 (medium loss)        │
        │  │  │         text: "-5.00"  "1t"                │
        │  │  │         Color formula: 5 / 5 = 1.0         │
        │  │  │         intensity > 0.4 → red-400/60       │
        │  │  │                                              │
        │  │  ├─ Jan 4: bg-green-500/80 (high profit)      │
        │  │  │         text: "+2.05"  "3t"                │
        │  │  │         Color formula: 2.05 / 0.45 ≈ 1.0   │
        │  │  │         intensity > 0.7 → green-500/80      │
        │  │  │                                              │
        │  │  └─ Jan 5-31: bg-muted/30 (no trades)         │
        │  │                                                  │
        │  ├─ Attach hover listeners:                       │
        │  │  hover (Jan 2) → Tooltip:                      │
        │  │  ┌─────────────────────────┐                   │
        │  │  │ 2025-01-02              │                   │
        │  │  │ PnL: +0.45              │                   │
        │  │  │ Trades: 2               │                   │
        │  │  │ Win Rate: 100.0%        │                   │
        │  │  └─────────────────────────┘                   │
        │  │                                                  │
        │  ├─ Render legend:                                │
        │  │  [████] High Profit                            │
        │  │  [████] Low Profit                             │
        │  │  [████] Break Even                             │
        │  │  [████] Low Loss                               │
        │  │  [████] High Loss                              │
        │  │                                                  │
        │  └─ Render navigation buttons:                    │
        │     [◀]  January 2025  [▶]                        │
        └──────────────────────────────────────────────────────┘
                                  ↓
                        BROWSER DISPLAYS
                            CALENDAR
                       (fully rendered)
                                  ↓
        ┌──────────────────────────────────────────────────────┐
        │      USER CLICKS NEXT MONTH (▶ button)              │
        │                                                      │
        │  onClick handler:                                   │
        │  setCurrentDate(new Date(2025, 1))  // Feb 2025    │
        │                                                      │
        │  → currentDate state changes                        │
        │  → useEffect dependency array includes currentDate │
        │  → useEffect fires again                           │
        │  → statsAPI.getPerformanceCalendar(2, 2025)        │
        │  → (process repeats for Feb...)                    │
        └──────────────────────────────────────────────────────┘
```

---

## Data Transformation Pipeline

```
DATABASE TABLES (SQLite)
├── trade (2,847 rows)
│   ├── id: 1
│   ├── pair: "EUR/USD"
│   ├── entry_price: 1.100
│   ├── exit_price: 1.102
│   ├── position_size: 100
│   ├── status: "CLOSED"
│   ├── closed_at: 2025-01-02 14:30:45
│   └── ...
│
│   (Filter: status = 'CLOSED' only)
│
└─ CRUD AGGREGATION
    └── get_performance_calendar(session, month=1, year=2025)
        │
        ├─ Group by closed_at.date()
        │  └─ 2025-01-02: [Trade{}, Trade{}]      → 2 trades
        │  └─ 2025-01-03: [Trade{}]               → 1 trade
        │  └─ 2025-01-04: [Trade{}, Trade{}, ...] → 3 trades
        │
        ├─ Calculate PER TRADE:
        │  └─ result_USD = (exit - entry) × size
        │     2025-01-02, Trade 1: (1.102 - 1.100) × 100 = $0.20
        │     2025-01-02, Trade 2: (1.265 - 1.270) × 50 = $0.25
        │
        ├─ Aggregate PER DAY:
        │  └─ 2025-01-02: pnl = 0.20 + 0.25 = $0.45
        │                 trades = 2
        │                 wins = 2 (both > 0)
        │                 winRate = 2/2 × 100 = 100.0%
        │
        └─ RESULT ARRAY (31 items):
            [{date: "2025-01-01", pnl: 0.0, trades: 0, winRate: 0.0},
             {date: "2025-01-02", pnl: 0.45, trades: 2, winRate: 100.0},
             {date: "2025-01-03", pnl: -5.0, trades: 1, winRate: 0.0},
             ...
             {date: "2025-01-31", pnl: 0.0, trades: 0, winRate: 0.0}]
            └─ JSON serialized → HTTP response
```

---

## Component State Machine

```
INITIAL STATE
├─ currentDate: Date(2025, 0)  [Jan 2025]
├─ calendarData: []
├─ loading: false
└─ error: null
        ↓
   useEffect fires
        ↓
LOADING STATE
├─ calendarData: []           [unchanged]
├─ loading: true              [shows spinner]
└─ error: null
        ↓
   statsAPI.getPerformanceCalendar succeeds
        ↓
LOADED STATE
├─ calendarData: [31 objects] [from backend]
├─ loading: false             [hides spinner]
└─ error: null
        ↓
   (calendar visible)
        ↓
   User clicks prev/next month
        ↓
   setCurrentDate(newDate)
        ↓
   back to LOADING STATE
        ↓
   (cycle repeats)

ERROR STATE (if API fails)
├─ calendarData: [previous data or empty]
├─ loading: false
└─ error: "Failed to load performance calendar data"
   └─ Alert rendered with error message
```

---

## Color Assignment Algorithm

```
INPUT: dayData = {pnl: 0.45, trades: 2, winRate: 100.0}
       monthData = [... 31 days ...]

CALCULATE:
├─ profitDays = filter(d => d.pnl > 0)
│               = [day2, day4, ...]
├─ lossDays = filter(d => d.pnl < 0)
│             = [day3, ...]
├─ maxProfit = max(profitDays.map(d => d.pnl)) = 2.05
└─ maxLoss = abs(min(lossDays.map(d => d.pnl))) = 5.00

PROCESS (Jan 2):
├─ If trades === 0:
│  └─ color = "bg-muted/30"  ✗ (trades=2)
│
├─ Else if pnl > 0:
│  ├─ intensity = 0.45 / 2.05 = 0.22
│  ├─ Is 0.22 > 0.7? No
│  ├─ Is 0.22 > 0.4? No
│  └─ color = "bg-green-300/40"  ✓
│
├─ Else if pnl < 0:
│  └─ intensity = 5.0 / 5.0 = 1.0
│     Is 1.0 > 0.7? Yes
│     color = "bg-red-500/80"  (for Jan 3)
│
└─ Else:
   color = "bg-gray-200/30"

FINAL CSS CLASS: "bg-green-300/40"
             + "text-foreground font-medium"  [contrast check]
```

---

## State Diagram

```
                   ┌─────────────────────┐
                   │   Component Mount   │
                   └──────────┬──────────┘
                              │
                              ↓
                    ┌──────────────────┐
                    │  useEffect fires │
                    │  setLoading(true)│
                    └────────┬─────────┘
                             │
                             ↓
                    ┌────────────────────┐
                    │  API Request       │
                    │  /performance_     │
                    │   calendar?month=1 │
                    └────────┬──────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ↓ Success                     ↓ Error
     ┌──────────────────┐         ┌──────────────────┐
     │ setCalendarData  │         │  setError()      │
     │ setLoading(false)│         │  setLoading(false)
     │ setError(null)   │         └────────┬─────────┘
     └────────┬─────────┘                  │
              │                             │
              ↓                             ↓
     ┌──────────────────┐         ┌──────────────────┐
     │ Render Calendar  │         │  Render Alert    │
     │ with data        │         │  with error      │
     └────────┬─────────┘         └──────────────────┘
              │
              ↓ User navigates month
     ┌──────────────────┐
     │ setCurrentDate() │
     │ (state changes)  │
     └────────┬─────────┘
              │
              └─ back to "API Request"
```

---

This diagram shows the complete journey from database query through rendering, with all transformations and state changes.
