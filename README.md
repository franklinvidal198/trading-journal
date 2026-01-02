# Trading Journal Application

A full-stack trading journal application with advanced analytics built with FastAPI (backend) and React (frontend).

## Project Structure

```
├── Backend (Python/FastAPI)
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── crud/         # Database operations
│   │   ├── db/           # Database connection
│   │   ├── models/       # SQLModel definitions
│   │   ├── schemas/      # Pydantic schemas
│   │   └── utils/        # Utilities (auth, security, trading)
│   ├── alembic/          # Database migrations
│   ├── requirements.txt  # Python dependencies
│   └── main.py           # Entry point
│
└── Frontend (React/TypeScript/Vite)
    ├── src/
    │   ├── components/    # Reusable components
    │   ├── pages/         # Page components
    │   ├── hooks/         # Custom React hooks
    │   ├── lib/           # API client and utilities
    │   └── App.tsx        # Main app component
    ├── package.json       # Node dependencies
    └── vite.config.ts     # Vite configuration
```

## Quick Start

### Backend

```bash
# Install dependencies
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start server (port 8001)
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

### Frontend

```bash
cd Frontend

# Use Node.js v20
nvm use 20

# Install dependencies
npm install

# Start dev server (port 8080)
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Register user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user

### Trades
- `GET /api/v1/trades/` - List trades
- `POST /api/v1/trades/` - Create trade
- `PUT /api/v1/trades/{id}` - Update trade
- `DELETE /api/v1/trades/{id}` - Delete trade
- `PATCH /api/v1/trades/{id}/close` - Close trade

### Statistics
- `GET /api/v1/stats/summary` - Trading summary
- `GET /api/v1/stats/equity_curve` - Equity progression
- `GET /api/v1/stats/pnl_by_pair` - P&L by trading pair
- `GET /api/v1/stats/win_loss_distribution` - Win/loss ratio
- `GET /api/v1/stats/daily_performance` - Daily P&L
- `GET /api/v1/stats/by_date_range` - Date-filtered stats

## Features

- ✅ User authentication with JWT tokens
- ✅ Trade logging with entry/exit prices, stop loss, take profit
- ✅ Real-time P&L calculation
- ✅ Advanced analytics dashboard with multiple charts
- ✅ Win rate, equity curve, and daily performance tracking
- ✅ Performance breakdown by trading pair
- ✅ Date range filtering
- ✅ Responsive UI with Tailwind CSS and shadcn/ui

## Technology Stack

**Backend:**
- FastAPI 0.104+
- SQLModel (SQLAlchemy + Pydantic)
- SQLite with Alembic migrations
- JWT authentication with argon2_cffi

**Frontend:**
- React 18 + TypeScript
- Vite build tool
- Tailwind CSS + shadcn/ui components
- Recharts for data visualization
- Axios with interceptors
- React Router v6

## Database

SQLite database with the following tables:
- `users` - User accounts
- `trades` - Trade records with OHLC data
- Automatic P&L calculation on trade closure

## Development

Both backend and frontend support hot-reload during development:
- Backend: `python -m uvicorn app.main:app --reload`
- Frontend: `npm run dev`

## Deployment

For production deployment:
- Build frontend: `npm run build`
- Use a production ASGI server like Gunicorn for FastAPI
- Configure environment variables for database and secrets

## License

MIT
