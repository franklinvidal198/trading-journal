#!/usr/bin/env python3
"""Management script to seed realistic trading data"""
import sys
import os

# Add the project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime, timedelta
from sqlmodel import Session, select
from app.db.session import engine
from app.models.trade import Trade, TradeDirection, TradeStatus
from app.models.user import User
from app.crud.stats import get_summary_stats

def seed_realistic_trades():
    """Create realistic trades with historical data and today's trades"""
    
    with Session(engine) as session:
        # Get the first user (franklin)
        user = session.exec(select(User).where(User.email == "franklinvidal@gmail.com")).first()
        if not user:
            print("No user found with that email")
            return
        
        # Delete old trades for this user to start fresh
        old_trades = session.exec(select(Trade)).all()
        for trade in old_trades:
            session.delete(trade)
        session.commit()
        
        # Use today's date at midnight
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Historical trades from past 30 days with realistic results
        historical_trades = [
            # Week 1: Mixed results
            {
                "pair": "EUR/USD",
                "direction": TradeDirection.BUY,
                "entry_price": 1.0800,
                "exit_price": 1.0850,
                "stop_loss": 1.0750,
                "take_profit": 1.0900,
                "position_size": 1.0,
                "status": TradeStatus.CLOSED,
                "opened_at": today - timedelta(days=25),
                "closed_at": today - timedelta(days=25, hours=2),
                "result_usd": 500,
            },
            {
                "pair": "GBP/USD",
                "direction": TradeDirection.SELL,
                "entry_price": 1.2750,
                "exit_price": 1.2700,
                "stop_loss": 1.2800,
                "take_profit": 1.2600,
                "position_size": 1.0,
                "status": TradeStatus.CLOSED,
                "opened_at": today - timedelta(days=24),
                "closed_at": today - timedelta(days=24, hours=3),
                "result_usd": 500,
            },
            {
                "pair": "USD/JPY",
                "direction": TradeDirection.BUY,
                "entry_price": 145.50,
                "exit_price": 144.80,
                "stop_loss": 145.00,
                "take_profit": 146.50,
                "position_size": 0.5,
                "status": TradeStatus.CLOSED,
                "opened_at": today - timedelta(days=23),
                "closed_at": today - timedelta(days=23, hours=1),
                "result_usd": -350,  # Loss
            },
            
            # Week 2: Good week
            {
                "pair": "BTC/USD",
                "direction": TradeDirection.BUY,
                "entry_price": 42000,
                "exit_price": 43500,
                "stop_loss": 41000,
                "take_profit": 44000,
                "position_size": 0.1,
                "status": TradeStatus.CLOSED,
                "opened_at": today - timedelta(days=18),
                "closed_at": today - timedelta(days=18, hours=4),
                "result_usd": 1500,  # Good win
            },
            {
                "pair": "SPY",
                "direction": TradeDirection.BUY,
                "entry_price": 475.50,
                "exit_price": 478.20,
                "stop_loss": 473.00,
                "take_profit": 480.00,
                "position_size": 2.0,
                "status": TradeStatus.CLOSED,
                "opened_at": today - timedelta(days=17),
                "closed_at": today - timedelta(days=17, hours=2),
                "result_usd": 540,
            },
            
            # Week 3: Challenging week
            {
                "pair": "XAU/USD",
                "direction": TradeDirection.BUY,
                "entry_price": 2050.00,
                "exit_price": 2030.00,
                "stop_loss": 2040.00,
                "take_profit": 2080.00,
                "position_size": 0.5,
                "status": TradeStatus.CLOSED,
                "opened_at": today - timedelta(days=12),
                "closed_at": today - timedelta(days=12, hours=1),
                "result_usd": -1000,  # Loss
            },
            {
                "pair": "EURUSD",
                "direction": TradeDirection.SELL,
                "entry_price": 1.0750,
                "exit_price": 1.0780,
                "stop_loss": 1.0800,
                "take_profit": 1.0650,
                "position_size": 1.0,
                "status": TradeStatus.CLOSED,
                "opened_at": today - timedelta(days=11),
                "closed_at": today - timedelta(days=11, hours=5),
                "result_usd": -300,  # Loss
            },
            {
                "pair": "AAPL",
                "direction": TradeDirection.BUY,
                "entry_price": 189.50,
                "exit_price": 191.75,
                "stop_loss": 187.00,
                "take_profit": 195.00,
                "position_size": 5.0,
                "status": TradeStatus.CLOSED,
                "opened_at": today - timedelta(days=10),
                "closed_at": today - timedelta(days=10, hours=3),
                "result_usd": 1125,  # Win
            },
            
            # This week: Mixed results
            {
                "pair": "TSLA",
                "direction": TradeDirection.BUY,
                "entry_price": 248.00,
                "exit_price": 252.50,
                "stop_loss": 245.00,
                "take_profit": 255.00,
                "position_size": 2.0,
                "status": TradeStatus.CLOSED,
                "opened_at": today - timedelta(days=5),
                "closed_at": today - timedelta(days=5, hours=2),
                "result_usd": 900,  # Win
            },
            {
                "pair": "NQ100",
                "direction": TradeDirection.SELL,
                "entry_price": 17850.00,
                "exit_price": 17920.00,
                "stop_loss": 17950.00,
                "take_profit": 17700.00,
                "position_size": 0.5,
                "status": TradeStatus.CLOSED,
                "opened_at": today - timedelta(days=3),
                "closed_at": today - timedelta(days=3, hours=1),
                "result_usd": -350,  # Loss
            },
            
            # Today's trades
            {
                "pair": "EUR/USD",
                "direction": TradeDirection.BUY,
                "entry_price": 1.0820,
                "exit_price": 1.0875,
                "stop_loss": 1.0780,
                "take_profit": 1.0950,
                "position_size": 1.5,
                "status": TradeStatus.CLOSED,
                "opened_at": today + timedelta(hours=6),
                "closed_at": today + timedelta(hours=7),
                "result_usd": 825,  # Today's win
            },
            {
                "pair": "GBP/USD",
                "direction": TradeDirection.BUY,
                "entry_price": 1.2700,
                "exit_price": 1.2650,
                "stop_loss": 1.2750,
                "take_profit": 1.2800,
                "position_size": 1.0,
                "status": TradeStatus.CLOSED,
                "opened_at": today + timedelta(hours=8),
                "closed_at": today + timedelta(hours=9),
                "result_usd": -500,  # Today's loss
            },
            {
                "pair": "BTC/USD",
                "direction": TradeDirection.BUY,
                "entry_price": 42500,
                "exit_price": 43200,
                "stop_loss": 41500,
                "take_profit": 44000,
                "position_size": 0.1,
                "status": TradeStatus.CLOSED,
                "opened_at": today + timedelta(hours=10),
                "closed_at": today + timedelta(hours=11),
                "result_usd": 700,  # Today's good trade
            },
            {
                "pair": "USD/JPY",
                "direction": TradeDirection.SELL,
                "entry_price": 146.00,
                "exit_price": 146.50,
                "stop_loss": 147.00,
                "take_profit": 145.00,
                "position_size": 1.0,
                "status": TradeStatus.OPEN,
                "opened_at": today + timedelta(hours=12),
                "closed_at": None,
            },
        ]
        
        # Add all trades to session
        for trade_data in historical_trades:
            trade = Trade(**trade_data)
            session.add(trade)
        
        session.commit()
        print(f"✅ Seeded {len(historical_trades)} realistic trades")
        
        # Show stats
        stats = get_summary_stats(session)
        print("\n📊 New Stats:")
        print(f"  Total Trades: {stats['total_trades']}")
        print(f"  Winning: {stats['winning_trades']} | Losing: {stats['losing_trades']}")
        print(f"  Win Rate: {stats['win_rate']:.1f}%")
        print(f"  Total Profit: ${stats['total_profit']:.2f}")
        print(f"  Daily Profit: ${stats['daily_profit']:.2f}")
        print(f"  Max Loss: ${stats['max_loss']:.2f}")

if __name__ == "__main__":
    seed_realistic_trades()
