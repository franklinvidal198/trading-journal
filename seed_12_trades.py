#!/usr/bin/env python3
"""
Seed 12 realistic trades for testing the entire system end-to-end.
Tests all visual states: wins, losses, running P&L, calendar heatmap, etc.
"""

from datetime import datetime, timezone, timedelta
from sqlmodel import Session, create_engine
from app.models.trade import Trade, TradeStatus
from app.core.config import settings

engine = create_engine(settings.SQLITE_DB, connect_args={"check_same_thread": False})

def seed_12_trades():
    with Session(engine) as session:
        # Base date: start from 10 days ago
        base_date = datetime.now(timezone.utc) - timedelta(days=10)
        
        trades_data = [
            # Day 1: Two wins
            {
                "pair": "EUR/USD",
                "direction": "BUY",
                "entry_price": 1.085,
                "exit_price": 1.095,
                "position_size": 100000,
                "entry_date": base_date,
                "closed_at": base_date + timedelta(hours=2),
                "status": TradeStatus.CLOSED,
            },
            {
                "pair": "GBP/USD",
                "direction": "SELL",
                "entry_price": 1.27,
                "exit_price": 1.265,
                "position_size": 50000,
                "entry_date": base_date + timedelta(hours=3),
                "closed_at": base_date + timedelta(hours=5),
                "status": TradeStatus.CLOSED,
            },
            # Day 2: One loss, one win
            {
                "pair": "USD/JPY",
                "direction": "BUY",
                "entry_price": 150.5,
                "exit_price": 149.8,
                "position_size": 10000,
                "entry_date": base_date + timedelta(days=1),
                "closed_at": base_date + timedelta(days=1, hours=3),
                "status": TradeStatus.CLOSED,
            },
            {
                "pair": "AUD/USD",
                "direction": "BUY",
                "entry_price": 0.68,
                "exit_price": 0.69,
                "position_size": 150000,
                "entry_date": base_date + timedelta(days=1, hours=4),
                "closed_at": base_date + timedelta(days=1, hours=8),
                "status": TradeStatus.CLOSED,
            },
            # Day 3: Three trades (mixed)
            {
                "pair": "EUR/USD",
                "direction": "SELL",
                "entry_price": 1.095,
                "exit_price": 1.098,
                "position_size": 80000,
                "entry_date": base_date + timedelta(days=2),
                "closed_at": base_date + timedelta(days=2, hours=1),
                "status": TradeStatus.CLOSED,
            },
            {
                "pair": "GBP/USD",
                "direction": "BUY",
                "entry_price": 1.265,
                "exit_price": 1.275,
                "position_size": 60000,
                "entry_date": base_date + timedelta(days=2, hours=2),
                "closed_at": base_date + timedelta(days=2, hours=6),
                "status": TradeStatus.CLOSED,
            },
            {
                "pair": "NZD/USD",
                "direction": "SELL",
                "entry_price": 0.62,
                "exit_price": 0.618,
                "position_size": 100000,
                "entry_date": base_date + timedelta(days=2, hours=8),
                "closed_at": base_date + timedelta(days=2, hours=10),
                "status": TradeStatus.CLOSED,
            },
            # Day 4: Two trades
            {
                "pair": "USD/CAD",
                "direction": "BUY",
                "entry_price": 1.36,
                "exit_price": 1.365,
                "position_size": 100000,
                "entry_date": base_date + timedelta(days=3),
                "closed_at": base_date + timedelta(days=3, hours=3),
                "status": TradeStatus.CLOSED,
            },
            {
                "pair": "EUR/GBP",
                "direction": "BUY",
                "entry_price": 0.865,
                "exit_price": 0.860,
                "position_size": 50000,
                "entry_date": base_date + timedelta(days=3, hours=5),
                "closed_at": base_date + timedelta(days=3, hours=7),
                "status": TradeStatus.CLOSED,
            },
            # Day 5: Three trades (volatile day)
            {
                "pair": "GBP/USD",
                "direction": "SELL",
                "entry_price": 1.275,
                "exit_price": 1.270,
                "position_size": 70000,
                "entry_date": base_date + timedelta(days=4),
                "closed_at": base_date + timedelta(days=4, hours=2),
                "status": TradeStatus.CLOSED,
            },
            {
                "pair": "AUD/USD",
                "direction": "SELL",
                "entry_price": 0.69,
                "exit_price": 0.685,
                "position_size": 120000,
                "entry_date": base_date + timedelta(days=4, hours=3),
                "closed_at": base_date + timedelta(days=4, hours=5),
                "status": TradeStatus.CLOSED,
            },
            {
                "pair": "EUR/USD",
                "direction": "BUY",
                "entry_price": 1.098,
                "exit_price": 1.105,
                "position_size": 90000,
                "entry_date": base_date + timedelta(days=4, hours=6),
                "closed_at": base_date + timedelta(days=4, hours=9),
                "status": TradeStatus.CLOSED,
            },
        ]
        
        # Add all trades
        for trade_data in trades_data:
            trade = Trade(**trade_data)
            session.add(trade)
        
        session.commit()
        
        # Calculate stats
        total_trades = len(trades_data)
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
        
        print(f"\n✓ Successfully seeded 12 trades!")
        print(f"  Total Trades: {total_trades}")
        print(f"  Winning Trades: {winning_trades}")
        print(f"  Losing Trades: {total_trades - winning_trades}")
        print(f"  Win Rate: {(winning_trades/total_trades)*100:.1f}%")
        print(f"  Total P&L: ${total_profit:,.2f}")
        print(f"\n✓ Ready for end-to-end testing!")
        print(f"  - Running P&L chart should display")
        print(f"  - Trading calendar should show heatmap")
        print(f"  - All stats should populate")

if __name__ == "__main__":
    seed_12_trades()
