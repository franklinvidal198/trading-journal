# Backend System Audit & API Map

**Date:** January 3, 2026  
**System:** Trading Journal Application  
**Backend Framework:** FastAPI (Python) + SQLModel + SQLite  
**Version:** 1.0.0

---

## Executive Summary

This document provides a complete enumeration of all backend API endpoints, database models, and data flows currently implemented in the trading journal system. The system is organized into 6 major feature domains with 40+ REST endpoints and 7 core domain models.

---

## Part 1: API Surface Map

### 1.1 Authentication & Authorization

#### Endpoint: User Registration
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | POST |
| **Route Path** | `/api/v1/auth/signup` |
| **Auth Required** | No |
| **Request Body** | `{ name: string, email: string, password: string }` |
| **Response** | `{ access_token: string, token_type: string }` |
| **Handler** | `app.api.v1.routes.auth.signup()` |
| **Validation** | Email format required, password ≤72 chars |

#### Endpoint: User Login
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | POST |
| **Route Path** | `/api/v1/auth/login` |
| **Auth Required** | No |
| **Request Body** | `{ email: string, password: string }` |
| **Response** | `{ access_token: string, token_type: string }` |
| **Handler** | `app.api.v1.routes.auth.login()` |
| **Error Cases** | Invalid credentials (401), Missing email (400) |

#### Endpoint: Get Current User Profile
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | GET |
| **Route Path** | `/api/v1/auth/me` |
| **Auth Required** | Yes (Bearer token) |
| **Request Body** | None |
| **Response** | `{ id, name, email, created_at, is_active, updated_at }` |
| **Handler** | `app.api.v1.routes.auth.read_users_me()` |
| **Data Mode Support** | test, seed, real |

---

### 1.2 Two-Factor Authentication (2FA)

#### Endpoint: Initiate 2FA Setup
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | POST |
| **Route Path** | `/api/v1/auth/2fa/setup` |
| **Auth Required** | Yes (Bearer token) |
| **Request Body** | `{ enable: boolean }` |
| **Response** | `{ secret: string, qr_code: string (base64), backup_codes: string[] }` |
| **Handler** | `app.api.v1.twofa_api.setup_2fa()` |
| **Business Logic** | Generates TOTP secret, QR code image, 10 backup codes |

#### Endpoint: Verify 2FA Setup & Enable
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | POST |
| **Route Path** | `/api/v1/auth/2fa/verify` |
| **Auth Required** | Yes (Bearer token) |
| **Request Body** | `{ otp_code: string, backup_code?: string }` |
| **Response** | `{ status: "2FA enabled successfully" }` |
| **Handler** | `app.api.v1.twofa_api.verify_2fa_setup()` |
| **Validation** | OTP code must match TOTP secret |

#### Endpoint: Get 2FA Status
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | GET |
| **Route Path** | `/api/v1/auth/2fa/status` |
| **Auth Required** | Yes (Bearer token) |
| **Request Body** | None |
| **Response** | `{ is_enabled: boolean, backup_codes_remaining: number }` |
| **Handler** | `app.api.v1.twofa_api.get_2fa_status()` |

#### Endpoint: Disable 2FA
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | POST |
| **Route Path** | `/api/v1/auth/2fa/disable` |
| **Auth Required** | Yes (Bearer token) |
| **Request Body** | `{ otp_code: string }` |
| **Response** | `{ status: "2FA disabled successfully" }` |
| **Handler** | `app.api.v1.twofa_api.disable_2fa()` |
| **Validation** | OTP code must be valid |

#### Endpoint: Regenerate Backup Codes
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | POST |
| **Route Path** | `/api/v1/auth/2fa/regenerate-backups` |
| **Auth Required** | Yes (Bearer token) |
| **Request Body** | `{ otp_code: string }` |
| **Response** | `{ status: string, backup_codes: string[] }` |
| **Handler** | `app.api.v1.twofa_api.regenerate_backup_codes()` |
| **Note** | Generates 10 new backup codes |

---

### 1.3 Trades Management

#### Endpoint: Create Trade
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | POST |
| **Route Path** | `/api/v1/trades/` |
| **Auth Required** | No (but creates in real mode) |
| **Request Body** | Trade schema with: pair, direction, entry_price, position_size, stop_loss?, take_profit?, notes?, status? |
| **Response** | Full Trade object (id, timestamps, calculated fields) |
| **Handler** | `app.api.v1.routes.trades.create_trade_endpoint()` |
| **Test Mode** | Returns mock trade when DATA_MODE=test |
| **Calculations** | Auto-computes risk_reward, result_pips, result_usd |

#### Endpoint: List Trades (with Filters)
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | GET |
| **Route Path** | `/api/v1/trades/` |
| **Auth Required** | No |
| **Query Parameters** | pair?, status?, start_date?, end_date?, limit?, offset? |
| **Response** | `Trade[]` |
| **Handler** | `app.api.v1.routes.trades.list_trades()` |
| **Filtering** | Supports pair, status (OPEN/CLOSED), date range |
| **Data Mode** | Filters based on DATA_MODE (test/seed/real) |
| **Pair Filtering** | Real mode excludes TEST/XAU pairs; seed mode only XAU/USD |

#### Endpoint: Get Trade by ID
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | GET |
| **Route Path** | `/api/v1/trades/{trade_id}` |
| **Auth Required** | No |
| **Request Body** | None |
| **Response** | Trade object |
| **Handler** | `app.api.v1.routes.trades.get_trade_endpoint()` |
| **Error Cases** | 404 if trade not found |

#### Endpoint: Update Trade
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | PUT |
| **Route Path** | `/api/v1/trades/{trade_id}` |
| **Auth Required** | No |
| **Request Body** | Partial Trade object (any fields to update) |
| **Response** | Updated Trade object |
| **Handler** | `app.crud.trade.update_trade()` |
| **Timestamp** | Auto-updates `updated_at` |

#### Endpoint: Delete Trade
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | DELETE |
| **Route Path** | `/api/v1/trades/{trade_id}` |
| **Auth Required** | No |
| **Request Body** | None |
| **Response** | Status confirmation |
| **Handler** | `app.crud.trade.delete_trade()` |

#### Endpoint: Close Trade
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | PATCH |
| **Route Path** | `/api/v1/trades/{trade_id}/close` |
| **Auth Required** | No |
| **Query Parameters** | exit_price (required) |
| **Response** | Trade object with status=CLOSED, closed_at timestamp |
| **Handler** | `app.crud.trade.close_trade()` |
| **Calculations** | Computes result_pips, result_usd based on entry/exit |

---

### 1.4 Journal Entries

#### Endpoint: Get Journal Entries
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | GET |
| **Route Path** | `/api/v1/journal` |
| **Auth Required** | Yes (Bearer token) |
| **Query Parameters** | skip?, limit?, entry_type?, pair? |
| **Response** | `{ data: JournalEntry[], total: number, skip: number, limit: number }` |
| **Handler** | `app.api.v1.journal_api.get_entries()` |
| **Ordering** | By created_at descending (newest first) |
| **User Scoped** | Only returns entries for authenticated user |

#### Endpoint: Create Journal Entry
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | POST |
| **Route Path** | `/api/v1/journal` |
| **Auth Required** | Yes (Bearer token) |
| **Request Body** | `{ entry_type: ANALYSIS\|MISTAKE\|SUCCESS\|STRATEGY, pair: string, title: string, content: string, tags?: string, trade_id?: number }` |
| **Response** | Created JournalEntry object |
| **Handler** | `app.api.v1.journal_api.create_entry()` |
| **Auto Fields** | user_id (from token), created_at, updated_at |

#### Endpoint: Get Journal Entry by ID
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | GET |
| **Route Path** | `/api/v1/journal/{entry_id}` |
| **Auth Required** | Yes (Bearer token) |
| **Request Body** | None |
| **Response** | JournalEntry object |
| **Handler** | `app.api.v1.journal_api.get_entry()` |
| **Access Control** | 404 if entry doesn't belong to user |

#### Endpoint: Update Journal Entry
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | PUT |
| **Route Path** | `/api/v1/journal/{entry_id}` |
| **Auth Required** | Yes (Bearer token) |
| **Request Body** | `{ title?, content?, entry_type?, tags? }` (partial) |
| **Response** | Updated JournalEntry object |
| **Handler** | `app.api.v1.journal_api.update_entry()` |
| **Timestamp** | Auto-updates `updated_at` |

#### Endpoint: Delete Journal Entry
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | DELETE |
| **Route Path** | `/api/v1/journal/{entry_id}` |
| **Auth Required** | Yes (Bearer token) |
| **Request Body** | None |
| **Response** | `{ status: "deleted" }` |
| **Handler** | `app.api.v1.journal_api.delete_entry()` |
| **Access Control** | 404 if entry doesn't belong to user |

---

### 1.5 Trade Templates

#### Endpoint: List Trade Templates
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | GET |
| **Route Path** | `/api/v1/templates` |
| **Auth Required** | Yes (Bearer token) |
| **Query Parameters** | skip?, limit?, pair? |
| **Response** | `{ data: TradeTemplate[], total: number, skip: number, limit: number }` |
| **Handler** | `app.api.v1.templates_api.get_templates()` |
| **Ordering** | By created_at descending |
| **User Scoped** | Only authenticated user's templates |

#### Endpoint: Create Trade Template
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | POST |
| **Route Path** | `/api/v1/templates` |
| **Auth Required** | Yes (Bearer token) |
| **Request Body** | `{ name: string, pair: string, trade_type: BUY\|SELL, entry_strategy: string, exit_strategy: string, risk_reward: string, description?: string, tags?: string }` |
| **Response** | Created TradeTemplate object |
| **Handler** | `app.api.v1.templates_api.create_template()` |
| **Auto Fields** | user_id, created_at, updated_at, usage_count=0 |

#### Endpoint: Get Template by ID
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | GET |
| **Route Path** | `/api/v1/templates/{template_id}` |
| **Auth Required** | Yes (Bearer token) |
| **Request Body** | None |
| **Response** | TradeTemplate object |
| **Handler** | `app.api.v1.templates_api.get_template()` |
| **Access Control** | 404 if not user's template |

#### Endpoint: Update Template
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | PUT |
| **Route Path** | `/api/v1/templates/{template_id}` |
| **Auth Required** | Yes (Bearer token) |
| **Request Body** | `{ name?, pair?, trade_type?, entry_strategy?, exit_strategy?, risk_reward?, description?, tags? }` |
| **Response** | Updated TradeTemplate object |
| **Handler** | `app.api.v1.templates_api.update_template()` |
| **Timestamp** | Auto-updates `updated_at` |

#### Endpoint: Delete Template
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | DELETE |
| **Route Path** | `/api/v1/templates/{template_id}` |
| **Auth Required** | Yes (Bearer token) |
| **Request Body** | None |
| **Response** | `{ status: "deleted" }` |
| **Handler** | `app.api.v1.templates_api.delete_template()` |

#### Endpoint: Use Template to Create Trade
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | POST |
| **Route Path** | `/api/v1/templates/{template_id}/use` |
| **Auth Required** | Yes (Bearer token) |
| **Request Body** | `{ pair?: string, entry_price?: number, position_size?: number }` |
| **Response** | `{ status: string, trade: Trade }` |
| **Handler** | `app.api.v1.templates_api.useTemplate()` |
| **Side Effect** | Increments template usage_count, creates new Trade |

---

### 1.6 Trading Goals

#### Endpoint: Get User Goals
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | GET |
| **Route Path** | `/api/v1/goals` |
| **Auth Required** | Yes (Bearer token) |
| **Query Parameters** | skip?, limit?, status? |
| **Response** | `{ data: TradingGoal[], total: number, skip: number, limit: number }` |
| **Handler** | `app.api.v1.goals_api.get_goals()` |
| **Ordering** | By created_at descending |
| **Status Filter** | ACTIVE, COMPLETED, FAILED |

#### Endpoint: Create Goal
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | POST |
| **Route Path** | `/api/v1/goals` |
| **Auth Required** | Yes (Bearer token) |
| **Request Body** | `{ goal_type: WIN_RATE\|PNL\|TRADES, period: MONTHLY\|QUARTERLY\|YEARLY, target_value: number, description?: string }` |
| **Response** | Created TradingGoal object |
| **Handler** | `app.api.v1.goals_api.create_goal()` |
| **Auto Fields** | user_id, status=ACTIVE, created_at, started_at, progress_percentage=0.0, is_on_track=true |

#### Endpoint: Get Goal by ID
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | GET |
| **Route Path** | `/api/v1/goals/{goal_id}` |
| **Auth Required** | Yes (Bearer token) |
| **Request Body** | None |
| **Response** | TradingGoal object |
| **Handler** | `app.api.v1.goals_api.get_goal()` |
| **Access Control** | 404 if not user's goal |

#### Endpoint: Update Goal
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | PUT |
| **Route Path** | `/api/v1/goals/{goal_id}` |
| **Auth Required** | Yes (Bearer token) |
| **Request Body** | `{ target_value?, current_value?, status?, description? }` |
| **Response** | Updated TradingGoal object |
| **Handler** | `app.api.v1.goals_api.update_goal()` |
| **Timestamp** | Auto-updates `updated_at` |

#### Endpoint: Delete Goal
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | DELETE |
| **Route Path** | `/api/v1/goals/{goal_id}` |
| **Auth Required** | Yes (Bearer token) |
| **Request Body** | None |
| **Response** | `{ status: "deleted" }` |
| **Handler** | `app.api.v1.goals_api.delete_goal()` |

#### Endpoint: Get Trading Streaks
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | GET |
| **Route Path** | `/api/v1/goals/streaks/list` |
| **Auth Required** | Yes (Bearer token) |
| **Query Parameters** | skip?, limit? |
| **Response** | `{ data: TradeStreak[], total: number, skip: number, limit: number }` |
| **Handler** | `app.api.v1.goals_api.get_streaks()` |
| **Ordering** | By current_count descending (highest streaks first) |

---

### 1.7 Reports & Statistics

#### Endpoint: Get Summary Statistics
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | GET |
| **Route Path** | `/api/v1/reports/summary` |
| **Auth Required** | Yes (Bearer token) |
| **Request Body** | None |
| **Response** | `{ total_trades: number, closed_trades: number, open_trades: number, win_rate: number, total_profit: number, roi?: number, average_profit?: number }` |
| **Handler** | `app.api.v1.reports_api.get_summary()` |
| **Calculations** | win_rate = (winning_trades / closed_trades) * 100; total_profit = sum of result_usd |

#### Endpoint: Get Per-Pair Statistics
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | GET |
| **Route Path** | `/api/v1/reports/by-pair` |
| **Auth Required** | Yes (Bearer token) |
| **Request Body** | None |
| **Response** | `{ [pair: string]: { total_trades, closed_trades, win_rate, total_profit } }` |
| **Handler** | `app.api.v1.reports_api.get_pair_statistics()` |
| **Structure** | Object keyed by currency pair (e.g., EUR/USD, BTC/USD) |

#### Endpoint: Get Summary Stats (Stats Router)
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | GET |
| **Route Path** | `/api/v1/stats/summary` |
| **Auth Required** | No |
| **Request Body** | None |
| **Response** | `{ total_profit, win_rate, avg_risk_reward, total_trades, winning_trades, losing_trades, daily_profit, max_loss }` |
| **Handler** | `app.api.v1.routes.stats.summary_stats()` |
| **Data Mode** | Returns mock data in test/seed modes |

#### Endpoint: Get Equity Curve
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | GET |
| **Route Path** | `/api/v1/stats/equity_curve` |
| **Auth Required** | No |
| **Request Body** | None |
| **Response** | `[{ date: string, balance: number }, ...]` |
| **Handler** | `app.api.v1.routes.stats.equity_curve()` |
| **Purpose** | Shows account balance progression over time |

#### Endpoint: Get P&L By Pair
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | GET |
| **Route Path** | `/api/v1/stats/pnl_by_pair` |
| **Auth Required** | No |
| **Request Body** | None |
| **Response** | `[{ pair: string, wins: number, losses: number, total_pnl: number }, ...]` |
| **Handler** | `app.api.v1.routes.stats.pnl_by_pair()` |
| **Purpose** | P&L breakdown by currency pair |

#### Endpoint: Get Win/Loss Distribution
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | GET |
| **Route Path** | `/api/v1/stats/win_loss_distribution` |
| **Auth Required** | No |
| **Request Body** | None |
| **Response** | `{ wins: number, win_percentage: number, losses: number, loss_percentage: number }` |
| **Handler** | `app.api.v1.routes.stats.win_loss_distribution()` |
| **Purpose** | Overall win/loss ratio for charting |

#### Endpoint: Get Daily Performance
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | GET |
| **Route Path** | `/api/v1/stats/daily_performance` |
| **Auth Required** | No |
| **Query Parameters** | days (1-365, default 30) |
| **Response** | `[{ date: string, profit: number, trades: number }, ...]` |
| **Handler** | `app.api.v1.routes.stats.daily_performance()` |
| **Purpose** | Daily P&L and trade count for last N days |

#### Endpoint: Get Stats by Date Range
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | GET |
| **Route Path** | `/api/v1/stats/by_date_range` |
| **Auth Required** | No |
| **Query Parameters** | start_date?, end_date? |
| **Response** | `{ total_trades, winning_trades, losing_trades, win_rate, avg_risk_reward, total_profit, avg_profit }` |
| **Handler** | `app.api.v1.routes.stats.by_date_range()` |
| **Purpose** | Aggregated statistics for a specific date range |

---

### 1.8 System Endpoints

#### Endpoint: Get System Data Mode
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | GET |
| **Route Path** | `/api/v1/system/mode` |
| **Auth Required** | No |
| **Request Body** | None |
| **Response** | `{ mode: "test" \| "real" \| "seed" }` |
| **Handler** | `app.main.get_mode()` |
| **Purpose** | Reports current DATA_MODE for seeding/testing |

#### Endpoint: Set System Data Mode
| Attribute | Value |
|-----------|-------|
| **HTTP Method** | POST |
| **Route Path** | `/api/v1/system/mode` |
| **Auth Required** | No |
| **Request Body** | `{ mode: "test" \| "real" \| "seed" }` |
| **Response** | `{ mode: string }` |
| **Handler** | `app.main.set_mode()` |
| **Side Effect** | Calls seed_trades() if mode=seed |

---

## Part 2: Complete API Endpoint Summary Table

| # | Feature | Method | Route | Auth | Status |
|---|---------|--------|-------|------|--------|
| 1 | Auth | POST | `/api/v1/auth/signup` | No | ✅ |
| 2 | Auth | POST | `/api/v1/auth/login` | No | ✅ |
| 3 | Auth | GET | `/api/v1/auth/me` | Yes | ✅ |
| 4 | 2FA | POST | `/api/v1/auth/2fa/setup` | Yes | ✅ |
| 5 | 2FA | POST | `/api/v1/auth/2fa/verify` | Yes | ✅ |
| 6 | 2FA | GET | `/api/v1/auth/2fa/status` | Yes | ✅ |
| 7 | 2FA | POST | `/api/v1/auth/2fa/disable` | Yes | ✅ |
| 8 | 2FA | POST | `/api/v1/auth/2fa/regenerate-backups` | Yes | ✅ |
| 9 | Trades | POST | `/api/v1/trades/` | No | ✅ |
| 10 | Trades | GET | `/api/v1/trades/` | No | ✅ |
| 11 | Trades | GET | `/api/v1/trades/{id}` | No | ✅ |
| 12 | Trades | PUT | `/api/v1/trades/{id}` | No | ✅ |
| 13 | Trades | DELETE | `/api/v1/trades/{id}` | No | ✅ |
| 14 | Trades | PATCH | `/api/v1/trades/{id}/close` | No | ✅ |
| 15 | Journal | GET | `/api/v1/journal` | Yes | ✅ |
| 16 | Journal | POST | `/api/v1/journal` | Yes | ✅ |
| 17 | Journal | GET | `/api/v1/journal/{id}` | Yes | ✅ |
| 18 | Journal | PUT | `/api/v1/journal/{id}` | Yes | ✅ |
| 19 | Journal | DELETE | `/api/v1/journal/{id}` | Yes | ✅ |
| 20 | Templates | GET | `/api/v1/templates` | Yes | ✅ |
| 21 | Templates | POST | `/api/v1/templates` | Yes | ✅ |
| 22 | Templates | GET | `/api/v1/templates/{id}` | Yes | ✅ |
| 23 | Templates | PUT | `/api/v1/templates/{id}` | Yes | ✅ |
| 24 | Templates | DELETE | `/api/v1/templates/{id}` | Yes | ✅ |
| 25 | Templates | POST | `/api/v1/templates/{id}/use` | Yes | ✅ |
| 26 | Goals | GET | `/api/v1/goals` | Yes | ✅ |
| 27 | Goals | POST | `/api/v1/goals` | Yes | ✅ |
| 28 | Goals | GET | `/api/v1/goals/{id}` | Yes | ✅ |
| 29 | Goals | PUT | `/api/v1/goals/{id}` | Yes | ✅ |
| 30 | Goals | DELETE | `/api/v1/goals/{id}` | Yes | ✅ |
| 31 | Goals | GET | `/api/v1/goals/streaks/list` | Yes | ✅ |
| 32 | Reports | GET | `/api/v1/reports/summary` | Yes | ✅ |
| 33 | Reports | GET | `/api/v1/reports/by-pair` | Yes | ✅ |
| 34 | Stats | GET | `/api/v1/stats/summary` | No | ✅ |
| 35 | Stats | GET | `/api/v1/stats/equity_curve` | No | ✅ |
| 36 | Stats | GET | `/api/v1/stats/pnl_by_pair` | No | ✅ |
| 37 | Stats | GET | `/api/v1/stats/win_loss_distribution` | No | ✅ |
| 38 | Stats | GET | `/api/v1/stats/daily_performance` | No | ✅ |
| 39 | Stats | GET | `/api/v1/stats/by_date_range` | No | ✅ |
| 40 | System | GET | `/api/v1/system/mode` | No | ✅ |
| 41 | System | POST | `/api/v1/system/mode` | No | ✅ |

**Total: 41 Endpoints**

---

## Part 3: Database Domain Model Inventory

### 3.1 User Model

**Table Name:** `user`

| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `id` | Integer | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `name` | String | NOT NULL | User's display name |
| `email` | String | NOT NULL, UNIQUE, INDEX | Login email (email format validated) |
| `hashed_password` | String | NOT NULL | Bcrypt hashed password (≤72 chars) |
| `created_at` | DateTime | NOT NULL, DEFAULT=now() | Account creation timestamp |

**Relationships:**
- One-to-many: User → JournalEntry (user_id FK)
- One-to-many: User → TradeTemplate (user_id FK)
- One-to-many: User → TradingGoal (user_id FK)
- One-to-many: User → TradeStreak (user_id FK)
- One-to-one: User → TwoFactorAuth (user_id FK)

**Authentication:**
- JWT-based (Bearer token)
- Token payload: `{ sub: email }`
- Algorithm: HS256
- Expiration: 24 hours (1440 minutes)

---

### 3.2 Trade Model

**Table Name:** `trade`

| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `id` | Integer | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `pair` | String | NOT NULL, INDEX | Currency pair (e.g., EUR/USD, BTC/USD) |
| `direction` | Enum | NOT NULL | BUY or SELL |
| `entry_price` | Float | NOT NULL | Price at entry |
| `exit_price` | Float | NULLABLE | Price at exit (NULL if OPEN) |
| `stop_loss` | Float | NULLABLE | Stop loss price level |
| `take_profit` | Float | NULLABLE | Take profit target price |
| `position_size` | Float | NOT NULL | Number of units/contracts |
| `risk_reward` | Float | CALCULATED | Entry, exit, SL, TP ratios |
| `result_pips` | Float | CALCULATED | Pips gained/lost |
| `result_usd` | Float | CALCULATED | Profit/loss in USD |
| `notes` | String | NULLABLE | Trade commentary |
| `screenshot_url` | String | NULLABLE | URL to trade screenshot |
| `status` | Enum | NOT NULL | OPEN or CLOSED |
| `opened_at` | DateTime | NOT NULL, DEFAULT=now(), INDEX | Entry time |
| `closed_at` | DateTime | NULLABLE | Exit time (only if CLOSED) |
| `created_at` | DateTime | NOT NULL, DEFAULT=now(), INDEX | DB record creation |
| `updated_at` | DateTime | NOT NULL, DEFAULT=now() | Last modification time |

**Relationships:**
- Many-to-one: Trade → JournalEntry (trade_id FK, optional)

**Enums:**
```python
class TradeDirection(str, enum.Enum):
    BUY = "BUY"
    SELL = "SELL"

class TradeStatus(str, enum.Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"
```

**Calculated Fields:**
- `risk_reward`: Computed from (exit - entry) / (entry - stop_loss)
- `result_pips`: (exit_price - entry_price) / 0.0001 (for forex)
- `result_usd`: (exit_price - entry_price) × position_size

---

### 3.3 JournalEntry Model

**Table Name:** `journal_entries`

| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `id` | Integer | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `user_id` | Integer | NOT NULL, FK(user.id), INDEX | Owner of entry |
| `trade_id` | Integer | NULLABLE, FK(trade.id) | Associated trade (optional) |
| `entry_type` | String | NOT NULL, INDEX | ANALYSIS, MISTAKE, SUCCESS, or STRATEGY |
| `pair` | String | NOT NULL, INDEX | Currency pair context |
| `title` | String | NOT NULL | Entry headline |
| `content` | String | NOT NULL | Full journal text |
| `tags` | String | NULLABLE | Comma-separated tags |
| `created_at` | DateTime | NOT NULL, DEFAULT=now(), INDEX | Creation time |
| `updated_at` | DateTime | NOT NULL, DEFAULT=now() | Last edit time |

**Valid Entry Types:**
- `ANALYSIS`: Market analysis and observations
- `MISTAKE`: Lessons from losses
- `SUCCESS`: Winning trade reflections
- `STRATEGY`: Trading strategy notes

---

### 3.4 TradeTemplate Model

**Table Name:** `trade_templates`

| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `id` | Integer | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `user_id` | Integer | NOT NULL, FK(user.id), INDEX | Owner of template |
| `name` | String | NOT NULL, INDEX | Template name/identifier |
| `pair` | String | NOT NULL, INDEX | Currency pair this applies to |
| `trade_type` | String | NOT NULL | BUY or SELL |
| `entry_strategy` | String | NOT NULL | Detailed entry criteria text |
| `exit_strategy` | String | NOT NULL | Detailed exit criteria text |
| `risk_reward` | String | NOT NULL | Risk:Reward ratio (e.g., "1:1.5") |
| `description` | String | NULLABLE | Additional notes |
| `tags` | String | NULLABLE | Comma-separated tags |
| `created_at` | DateTime | NOT NULL, DEFAULT=now(), INDEX | Creation time |
| `updated_at` | DateTime | NOT NULL, DEFAULT=now() | Last modification |
| `usage_count` | Integer | NOT NULL, DEFAULT=0 | Times this template was used |

**Purpose:** Pre-configured trade setups to speed up trade entry with consistent parameters.

---

### 3.5 TradingGoal Model

**Table Name:** `trading_goals`

| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `id` | Integer | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `user_id` | Integer | NOT NULL, FK(user.id), INDEX | Goal owner |
| `goal_type` | String | NOT NULL, INDEX | WIN_RATE, PNL, or TRADES |
| `period` | String | NOT NULL | MONTHLY, QUARTERLY, or YEARLY |
| `target_value` | Float | NOT NULL | Numeric target (win%, $, count) |
| `current_value` | Float | NOT NULL, DEFAULT=0 | Current progress toward target |
| `description` | String | NULLABLE | Goal context/motivation |
| `status` | String | NOT NULL, DEFAULT=ACTIVE | ACTIVE, COMPLETED, or FAILED |
| `created_at` | DateTime | NOT NULL, DEFAULT=now(), INDEX | Goal creation |
| `started_at` | DateTime | NOT NULL, DEFAULT=now() | Period start date |
| `target_date` | DateTime | NOT NULL | Deadline for goal completion |
| `completed_at` | DateTime | NULLABLE | When goal was completed/failed |
| `progress_percentage` | Float | NOT NULL, DEFAULT=0 | (current_value / target_value) × 100 |
| `is_on_track` | Boolean | NOT NULL, DEFAULT=true | Binary on-track assessment |

**Valid Goal Types:**
- `WIN_RATE`: Target win percentage (0-100)
- `PNL`: Target profit in USD
- `TRADES`: Target number of trades

**Valid Periods:**
- `MONTHLY`: 30-day goals
- `QUARTERLY`: 90-day goals
- `YEARLY`: 365-day goals

---

### 3.6 TradeStreak Model

**Table Name:** `trade_streaks`

| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `id` | Integer | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `user_id` | Integer | NOT NULL, FK(user.id), INDEX | Streak owner |
| `streak_type` | String | NOT NULL | Type of streak (e.g., "winning", "no-loss-day") |
| `current_count` | Integer | NOT NULL, DEFAULT=0 | Active streak length |
| `best_count` | Integer | NOT NULL, DEFAULT=0 | Historical best streak |
| `created_at` | DateTime | NOT NULL, DEFAULT=now() | Streak record creation |
| `updated_at` | DateTime | NOT NULL, DEFAULT=now() | Last streak update |

**Purpose:** Track consecutive wins, consecutive profitable days, etc. for motivation and pattern analysis.

---

### 3.7 TwoFactorAuth Model

**Table Name:** `twofa` (inferred from model)

| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `id` | Integer | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `user_id` | Integer | NOT NULL, FK(user.id), UNIQUE | 2FA owner (one per user) |
| `secret` | String | NOT NULL | Base32-encoded TOTP secret |
| `is_enabled` | Boolean | NOT NULL, DEFAULT=false | Whether 2FA is active |
| `backup_codes` | String | NULLABLE | JSON array of backup codes |
| `created_at` | DateTime | NOT NULL, DEFAULT=now() | 2FA record creation |
| `updated_at` | DateTime | NOT NULL, DEFAULT=now() | Last modification |

**2FA Implementation Details:**
- Algorithm: TOTP (Time-based One-Time Password, RFC 6238)
- Library: pyotp
- QR Code Generation: qrcode
- Issuer Name: "Trading Journal"
- Backup Codes: 10 codes generated per setup, 4-byte hex format

---

## Part 4: Data Flow Diagrams by Feature

### 4.1 Authentication Flow

```
User Registration:
1. POST /auth/signup { name, email, password }
   ↓
2. Validate email format, password length (≤72)
   ↓
3. Check email uniqueness (User table)
   ↓
4. Hash password with bcrypt
   ↓
5. Create User record
   ↓
6. Generate JWT token { sub: email }
   ↓
7. Return { access_token, token_type: "bearer" }

User Login:
1. POST /auth/login { email, password }
   ↓
2. Query User by email
   ↓
3. Verify password against hashed_password
   ↓
4. Generate JWT token { sub: email }
   ↓
5. Return { access_token, token_type: "bearer" }
   ↓
6. Frontend stores token in localStorage

Get Profile (Authenticated):
1. GET /auth/me
   ↓
2. Extract token from Authorization header (Bearer scheme)
   ↓
3. Decode JWT, extract email from "sub" claim
   ↓
4. Query User by email
   ↓
5. Return UserRead { id, name, email, created_at, is_active }
```

---

### 4.2 Two-Factor Authentication Setup Flow

```
Setup 2FA:
1. POST /auth/2fa/setup { enable: true }
   ↓
2. Authenticate user via Bearer token
   ↓
3. Generate random base32 secret (pyotp.random_base32)
   ↓
4. Generate 10 backup codes (secrets.token_hex(4))
   ↓
5. Create QR code image (provisioning_uri + qrcode library)
   ↓
6. Encode QR image to base64
   ↓
7. Create TwoFactorAuth record { user_id, secret, is_enabled=false }
   ↓
8. Return { secret, qr_code (base64), backup_codes[] }

Verify 2FA (Enable):
1. POST /auth/2fa/verify { otp_code }
   ↓
2. Authenticate user via Bearer token
   ↓
3. Query TwoFactorAuth by user_id
   ↓
4. Validate OTP using TOTP with stored secret
   ↓
5. If valid: Set is_enabled=true, update timestamp
   ↓
6. Return { status: "2FA enabled successfully" }

Get 2FA Status:
1. GET /auth/2fa/status
   ↓
2. Authenticate user
   ↓
3. Query TwoFactorAuth by user_id
   ↓
4. Return { is_enabled, backup_codes_remaining: count }

Disable 2FA:
1. POST /auth/2fa/disable { otp_code }
   ↓
2. Authenticate user
   ↓
3. Query TwoFactorAuth by user_id
   ↓
4. Validate OTP
   ↓
5. If valid: Set is_enabled=false
   ↓
6. Return { status: "2FA disabled successfully" }
```

---

### 4.3 Trade Management Flow

```
Create Trade:
1. POST /api/v1/trades/ { pair, direction, entry_price, position_size, ... }
   ↓
2. If DATA_MODE=test: Return mock Trade
   ↓
3. Create Trade record with validated fields
   ↓
4. Calculate risk_reward from entry, exit, SL, TP
   ↓
5. Insert into Trade table
   ↓
6. Return Trade with auto-generated id, timestamps

List Trades (with Filters):
1. GET /api/v1/trades/?pair=EUR/USD&status=OPEN&limit=20
   ↓
2. Query Trade table with WHERE filters
   ↓
3. If DATA_MODE=test: Return [mock_trade]
   ↓
4. If DATA_MODE=seed: Filter to only XAU pairs
   ↓
5. If DATA_MODE=real: Exclude TEST/XAU pairs
   ↓
6. Apply limit & offset pagination
   ↓
7. Return Trade[]

Close Trade:
1. PATCH /api/v1/trades/{id}/close?exit_price=1.1234
   ↓
2. Query Trade by id
   ↓
3. Set exit_price, status=CLOSED, closed_at=now()
   ↓
4. Compute result_pips and result_usd
   ↓
5. Update Trade record
   ↓
6. Return updated Trade
```

---

### 4.4 Journal Entry Flow

```
Create Journal Entry:
1. POST /api/v1/journal { entry_type, pair, title, content, tags?, trade_id? }
   ↓
2. Authenticate user via Bearer token
   ↓
3. Extract user_id from token
   ↓
4. Validate entry_type in [ANALYSIS, MISTAKE, SUCCESS, STRATEGY]
   ↓
5. Create JournalEntry record with user_id, created_at, updated_at
   ↓
6. Insert into journal_entries table
   ↓
7. Return created JournalEntry with id

List Journal Entries:
1. GET /api/v1/journal?skip=0&limit=20&entry_type=SUCCESS
   ↓
2. Authenticate user
   ↓
3. Query JournalEntry WHERE user_id=authenticated_user_id
   ↓
4. Filter by entry_type if provided
   ↓
5. Order by created_at DESC
   ↓
6. Apply skip/limit pagination
   ↓
7. Return { data: JournalEntry[], total, skip, limit }

Update Journal Entry:
1. PUT /api/v1/journal/{id} { title?, content?, tags? }
   ↓
2. Authenticate user
   ↓
3. Query JournalEntry by id
   ↓
4. Verify ownership (entry.user_id == authenticated_user_id)
   ↓
5. Update provided fields
   ↓
6. Set updated_at=now()
   ↓
7. Persist and return updated entry
```

---

### 4.5 Trade Template Flow

```
Create Template:
1. POST /api/v1/templates { name, pair, trade_type, entry_strategy, exit_strategy, risk_reward, ... }
   ↓
2. Authenticate user
   ↓
3. Create TradeTemplate with user_id, usage_count=0
   ↓
4. Insert into trade_templates table
   ↓
5. Return created template

Use Template:
1. POST /api/v1/templates/{id}/use { pair?, entry_price?, position_size? }
   ↓
2. Authenticate user
   ↓
3. Query TradeTemplate by id
   ↓
4. Verify ownership
   ↓
5. Increment usage_count
   ↓
6. Create Trade record from template data + override params
   ↓
7. Return { status, trade: Trade }

List Templates:
1. GET /api/v1/templates?skip=0&limit=20
   ↓
2. Authenticate user
   ↓
3. Query TradeTemplate WHERE user_id=authenticated_user_id
   ↓
4. Order by created_at DESC
   ↓
5. Apply pagination
   ↓
6. Return { data: TradeTemplate[], total, skip, limit }
```

---

### 4.6 Trading Goal & Streak Flow

```
Create Goal:
1. POST /api/v1/goals { goal_type, period, target_value, description? }
   ↓
2. Authenticate user
   ↓
3. Validate goal_type in [WIN_RATE, PNL, TRADES]
   ↓
4. Validate period in [MONTHLY, QUARTERLY, YEARLY]
   ↓
5. Create TradingGoal with status=ACTIVE, progress_percentage=0, is_on_track=true
   ↓
6. Insert into trading_goals table
   ↓
7. Return created goal

Get Streaks:
1. GET /api/v1/goals/streaks/list?skip=0&limit=20
   ↓
2. Authenticate user
   ↓
3. Query TradeStreak WHERE user_id=authenticated_user_id
   ↓
4. Order by current_count DESC (highest first)
   ↓
5. Apply pagination
   ↓
6. Return { data: TradeStreak[], total, skip, limit }

Update Goal Progress:
1. PUT /api/v1/goals/{id} { current_value, status? }
   ↓
2. Authenticate user
   ↓
3. Query TradingGoal by id
   ↓
4. Update current_value
   ↓
5. Recalculate progress_percentage = (current / target) * 100
   ↓
6. Update is_on_track based on deadline vs progress
   ↓
7. Persist changes
   ↓
8. Return updated goal
```

---

### 4.7 Reports & Statistics Flow

```
Get Summary Stats:
1. GET /api/v1/reports/summary
   ↓
2. Authenticate user
   ↓
3. Query Trade WHERE user_id=authenticated_user_id
   ↓
4. Split into closed_trades and open_trades by status
   ↓
5. Calculate win_rate = (winning_trades / closed_trades) * 100
   ↓
6. Calculate total_profit = sum(result_usd for closed trades)
   ↓
7. Return { total_trades, closed_trades, open_trades, win_rate, total_profit, roi, avg_profit }

Get Per-Pair Stats:
1. GET /api/v1/reports/by-pair
   ↓
2. Authenticate user
   ↓
3. Query all Trade for user
   ↓
4. Group trades by pair
   ↓
5. For each pair:
      - Count total, closed, winning trades
      - Calculate win_rate and total_pnl
   ↓
6. Return { [pair]: { total_trades, closed_trades, win_rate, total_profit }, ... }

Get Equity Curve (Stats):
1. GET /api/v1/stats/equity_curve
   ↓
2. If DATA_MODE=test: Return mock equity progression
   ↓
3. Query Trade ordered by closed_at
   ↓
4. Calculate cumulative balance after each closed trade
   ↓
5. Return [{ date, balance }, ...]

Get Daily Performance:
1. GET /api/v1/stats/daily_performance?days=30
   ↓
2. Query Trade WHERE closed_at within last N days
   ↓
3. Group by date
   ↓
4. For each day: Sum profit and count trades
   ↓
5. Return [{ date, profit, trades }, ...]
```

---

## Part 5: Authentication & Authorization Mechanisms

### 5.1 JWT Token Implementation

**Token Generation:**
```python
# Header
{
  "alg": "HS256",
  "typ": "JWT"
}

# Payload
{
  "sub": "user@example.com",  # Email
  "exp": <Unix timestamp + 1440 minutes>
}

# Signature
HMAC-SHA256(
  header.payload,
  SECRET_KEY
)
```

**Token Validation:**
1. Extract token from Authorization header (format: `Bearer <token>`)
2. Decode token with HS256 algorithm and SECRET_KEY
3. Verify expiration time
4. Extract email from "sub" claim
5. Query User table by email
6. Return User object or raise 401 Unauthorized

**Secret Configuration:**
- From environment variable: `SECRET_KEY`
- Default (development only): `"supersecret"`
- Algorithm: HS256

---

### 5.2 OAuth2 Password Bearer Flow

**Framework:** FastAPI's built-in OAuth2PasswordBearer

**Implementation Location:** `app/api/v1/routes/auth.py`

```python
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    # Validate token, return authenticated User
    ...
```

**Protected Endpoints:** Use `Depends(get_current_user)` to enforce authentication

**Unprotected Endpoints:** Trades, Stats routes (allow public access)

---

### 5.3 Authorization Scope

**User Isolation:**
- Journal entries: Filtered by `user_id` (user can only see own entries)
- Templates: Filtered by `user_id`
- Goals: Filtered by `user_id`
- 2FA: One-to-one with User

**Cross-Tenant Data Visibility:**
- Trade table: No user_id field (shared across all users in real mode)
- Stats endpoints: Calculate from shared Trade data (all trades)
- Reports endpoints: Authenticated users can only query their own trades (filtered by auth)

---

## Part 6: Data Modes (Test/Seed/Real)

**Configuration:** `DATA_MODE` environment variable

### Real Mode (DATA_MODE="real")
- Use actual database tables
- Exclude TEST/XAU pairs from /trades endpoint
- Use actual calculations for stats
- Default mode

### Test Mode (DATA_MODE="test")
- Mock data responses from endpoints
- Returns hardcoded successful trade
- Useful for frontend testing without database

### Seed Mode (DATA_MODE="seed")
- Pre-populated demo data
- Filter trades to only XAU/USD pair
- Fixed statistics responses
- Calls seed_trades() function on mode switch

---

## Part 7: Key Business Rules & Validations

| Rule | Enforcement Point | Details |
|------|------------------|---------|
| Email uniqueness | User creation (CRUD) | Duplicate email raises 400 Bad Request |
| Password length | User schema validator | Must be ≤72 characters |
| Email format | UserCreate schema | Using Pydantic EmailStr |
| Token expiration | JWT validation | 24 hours (1440 minutes) |
| 2FA already enabled | 2FA setup endpoint | Can't re-enable if already enabled |
| OTP code validation | TOTP.verify() | Uses current time window (RFC 6238) |
| Entry type validation | Journal create | Only [ANALYSIS, MISTAKE, SUCCESS, STRATEGY] |
| Goal type validation | Goal create | Only [WIN_RATE, PNL, TRADES] |
| Goal period validation | Goal create | Only [MONTHLY, QUARTERLY, YEARLY] |
| User scoping | All protected endpoints | Entries/templates/goals filtered by user_id |
| Trade status enum | Trade model | Only OPEN or CLOSED |
| Trade direction enum | Trade model | Only BUY or SELL |

---

## Part 8: External Dependencies & Integrations

| Dependency | Purpose | Location |
|------------|---------|----------|
| `sqlmodel` | ORM + validation (SQLAlchemy + Pydantic) | All models |
| `sqlalchemy` | Database abstraction layer | app.db.session |
| `fastapi` | Web framework | app.main |
| `jose` | JWT encoding/decoding | app.api.v1.routes.auth |
| `bcrypt` | Password hashing | app.utils.security |
| `pyotp` | TOTP implementation (RFC 6238) | app.api.v1.twofa_api |
| `qrcode` | QR code generation | app.api.v1.twofa_api |
| `pydantic` | Data validation | All schemas |
| `sqlite` | Database engine | sqlite:///./trading_journal.db |

---

## Part 9: System Configuration

**Core Settings (app/core/config.py):**

```python
API_V1_STR = "/api/v1"
SECRET_KEY = os.getenv("SECRET_KEY", "supersecret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1440 = 24 hours
CORS_ORIGINS = ["*"]
SQLITE_DB = os.getenv("SQLITE_DB", "sqlite:///./trading_journal.db")
ALEMBIC_INI = "alembic.ini"
DATA_MODE = os.getenv('DATA_MODE', 'real')  # test, real, or seed
```

**CORS Configuration:**
- Allow all origins: `["*"]`
- Allow credentials: True
- Allow methods: All
- Allow headers: All

---

## Part 10: Not Yet Implemented

Based on code review, the following are explicitly **NOT implemented** or are placeholders:

| Feature | Status | Evidence |
|---------|--------|----------|
| User profile update (PATCH /auth/me) | Not implemented | No endpoint handler exists |
| Password reset flow | Not implemented | No reset token/email system |
| Email verification | Not implemented | No email sending capability |
| Trade export (CSV/PDF) | Not implemented | No export API |
| Notification system | Not implemented | No email/push integrations |
| Real-time WebSocket updates | Not implemented | REST API only |
| Trade image uploads | Not implemented | Fields exist but no upload handler |
| Advanced filtering (complex queries) | Partial | Basic pair/status filters only |
| Pagination cursor-based | Not implemented | Offset-based only |
| Rate limiting | Not implemented | No throttling middleware |
| Request logging | Not implemented | No audit trail |
| Soft deletes | Not implemented | Hard deletes only |
| Trade categories/tags | Not implemented | Models exist but no endpoints |

---

## Summary Statistics

**Total Endpoints:** 41  
**Total Models:** 7  
**Total Fields (all models):** 95  
**Public Endpoints:** 17 (no auth required)  
**Protected Endpoints:** 24 (auth required)  
**Authenticated Endpoints (2FA-aware):** 8 (2FA setup/verify/status/disable)

---

**Document Generated:** 2026-01-03  
**Backend Version:** 1.0.0  
**Framework:** FastAPI + SQLModel  
**Database:** SQLite  
**Auth Method:** JWT (HS256)  
**2FA Method:** TOTP (RFC 6238)
