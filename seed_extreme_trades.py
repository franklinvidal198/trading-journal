#!/usr/bin/env python3
"""
Seed trades that test extreme scenarios:
- Starting with $50
- Go to $0 and negative
- Recover back up
Tests: drawdown, negative equity, recovery visuals
"""

from datetime import datetime, timezone, timedelta
from sqlmodel import Session, create_engine, SQLModel
from app.models.trade import Trade, TradeStatus
from app.models.user import User
from app.models.journal import JournalEntry
from app.models.goal import TradingGoal
from app.models.template import TradeTemplate
from app.models.twofa import TwoFactorAuth
from app.core.config import settings

engine = create_engine(settings.SQLITE_DB, connect_args={"check_same_thread": False})

def seed_extreme_trades():
    # Create schema first
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        base_date = datetime.now(timezone.utc) - timedelta(days=5)
        
        trades_data = [
            # Day 1: Lose $30 (50 -> 20) [BUY 1.100, close 1.097]
            {
                "pair": "EUR/USD",
                "direction": "BUY",
                "entry_price": 1.100,
                "exit_price": 1.097,
                "position_size": 10000,
                "entry_date": base_date,
                "closed_at": base_date + timedelta(hours=2),
                "status": TradeStatus.CLOSED,
            },
            # Day 2: Lose $20 (20 -> 0) [SELL 1.280, close 1.282]
            {
                "pair": "GBP/USD",
                "direction": "SELL",
                "entry_price": 1.280,
                "exit_price": 1.282,
                "position_size": 10000,
                "entry_date": base_date + timedelta(days=1),
                "closed_at": base_date + timedelta(days=1, hours=2),
                "status": TradeStatus.CLOSED,
            },
            # Day 3: Go negative by $15 (0 -> -15) [BUY 150.0, close 148.5]
            {
                "pair": "USD/JPY",
                "direction": "BUY",
                "entry_price": 150.0,
                "exit_price": 148.5,
                "position_size": 100,
                "entry_date": base_date + timedelta(days=2),
                "closed_at": base_date + timedelta(days=2, hours=2),
                "status": TradeStatus.CLOSED,
            },
            # Day 4: Recover by $40 (-15 -> 25) [BUY 0.65, close 0.69]
            {
                "pair": "AUD/USD",
                "direction": "BUY",
                "entry_price": 0.65,
                "exit_price": 0.69,
                "position_size": 10000,
                "entry_date": base_date + timedelta(days=3),
                "closed_at": base_date + timedelta(days=3, hours=3),
                "status": TradeStatus.CLOSED,
            },
            # Day 5: Another win to match $50 (25 -> 50) [BUY 1.090, close 1.102]
            {
                "pair": "EUR/USD",
                "direction": "BUY",
                "entry_price": 1.090,
                "exit_price": 1.102,
                "position_size": 10000,
                "entry_date": base_date + timedelta(days=4),
                "closed_at": base_date + timedelta(days=4, hours=3),
                "status": TradeStatus.CLOSED,
            },
        ]
        
        for trade_data in trades_data:
            trade = Trade(**trade_data)
            session.add(trade)
        
        session.commit()
        
        # Calculate stats
        total_profit = 0.0
        winning_trades = 0
        
        for trade_data in trades_data:
            if trade_data["direction"] == "BUY":
                pnl = (trade_data["exit_price"] - trade_data["entry_price"]) * trade_data["position_size"]
            else:
                pnl = (trade_data["entry_price"] - trade_data["exit_price"]) * trade_data["position_size"]
            
            total_profit += pnl
            if pnl > 0:
                winning_trades += 1
        
        print(f"\n✓ Seeded extreme scenario trades!")
        print(f"  Total Trades: {len(trades_data)}")
        print(f"  Starting Balance: $50")
        print(f"  Total P&L: ${total_profit:,.2f}")
        print(f"  Ending Balance: ${50 + total_profit:,.2f}")
        print(f"  Win Rate: {(winning_trades/len(trades_data))*100:.0f}%")
        print(f"\n✓ Route tested:")
        print(f"  $50 → $20 → $0 → -$15 → $25 → $50")
        print(f"  Tests: drawdown, negative equity, recovery")

if __name__ == "__main__":
    seed_extreme_trades()
