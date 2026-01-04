from app.db.session import engine
from sqlmodel import Session
from app.models.trade import Trade, TradeDirection, TradeStatus
from datetime import datetime, timedelta

def seed_trades():
    from app.models.trade import Trade
    
    # Base time for intraday trading (today)
    base_time = datetime.utcnow().replace(hour=9, minute=0, second=0, microsecond=0)
    
    # Intraday trades to match the Running P&L visualization
    # Pattern: Loss -> Deeper Loss -> Small Recovery -> Oscillation -> Recovery -> Strong Profit
    demo_trades = [
        # 09:14 - First trade: -$250 loss
        Trade(
            pair="EUR/USD",
            direction=TradeDirection.BUY,
            entry_price=1.0950,
            exit_price=1.0945,
            stop_loss=1.0960,
            take_profit=1.0970,
            position_size=5000,
            status=TradeStatus.CLOSED,
            opened_at=base_time,
            closed_at=base_time + timedelta(minutes=14),
            notes="Early morning scalp - loss",
        ),
        # 09:16 - Second trade: -$300 loss (cumulative: -$550)
        Trade(
            pair="GBP/USD",
            direction=TradeDirection.SELL,
            entry_price=1.2700,
            exit_price=1.2705,
            stop_loss=1.2695,
            take_profit=1.2680,
            position_size=6000,
            status=TradeStatus.CLOSED,
            opened_at=base_time + timedelta(minutes=2),
            closed_at=base_time + timedelta(minutes=16),
            notes="Short failed - loss",
        ),
        # 09:18 - Third trade: -$200 loss (cumulative: -$750)
        Trade(
            pair="USD/JPY",
            direction=TradeDirection.BUY,
            entry_price=149.50,
            exit_price=149.35,
            stop_loss=149.60,
            take_profit=149.80,
            position_size=50,
            status=TradeStatus.CLOSED,
            opened_at=base_time + timedelta(minutes=4),
            closed_at=base_time + timedelta(minutes=18),
            notes="Continuation fail",
        ),
        # 09:20 - Fourth trade: +$150 (cumulative: -$600)
        Trade(
            pair="AUD/USD",
            direction=TradeDirection.SELL,
            entry_price=0.6850,
            exit_price=0.6845,
            stop_loss=0.6860,
            take_profit=0.6820,
            position_size=3000,
            status=TradeStatus.CLOSED,
            opened_at=base_time + timedelta(minutes=6),
            closed_at=base_time + timedelta(minutes=20),
            notes="Small win",
        ),
        # 09:22 - Fifth trade: -$180 (cumulative: -$780)
        Trade(
            pair="EUR/USD",
            direction=TradeDirection.SELL,
            entry_price=1.0940,
            exit_price=1.0948,
            stop_loss=1.0950,
            take_profit=1.0920,
            position_size=2250,
            status=TradeStatus.CLOSED,
            opened_at=base_time + timedelta(minutes=8),
            closed_at=base_time + timedelta(minutes=22),
            notes="Reversal loss",
        ),
        # 09:24 - Sixth trade: +$200 (cumulative: -$580)
        Trade(
            pair="NZD/USD",
            direction=TradeDirection.BUY,
            entry_price=0.6100,
            exit_price=0.6110,
            stop_loss=0.6090,
            take_profit=0.6130,
            position_size=4000,
            status=TradeStatus.CLOSED,
            opened_at=base_time + timedelta(minutes=10),
            closed_at=base_time + timedelta(minutes=24),
            notes="Good bounce",
        ),
        # 09:26 - Seventh trade: +$120 (cumulative: -$460)
        Trade(
            pair="USD/CAD",
            direction=TradeDirection.SELL,
            entry_price=1.3650,
            exit_price=1.3640,
            stop_loss=1.3665,
            take_profit=1.3600,
            position_size=3000,
            status=TradeStatus.CLOSED,
            opened_at=base_time + timedelta(minutes=12),
            closed_at=base_time + timedelta(minutes=26),
            notes="Small profit",
        ),
        # 09:28 - Eighth trade: -$95 (cumulative: -$555)
        Trade(
            pair="CHF/JPY",
            direction=TradeDirection.BUY,
            entry_price=168.50,
            exit_price=168.40,
            stop_loss=168.60,
            take_profit=169.00,
            position_size=50,
            status=TradeStatus.CLOSED,
            opened_at=base_time + timedelta(minutes=14),
            closed_at=base_time + timedelta(minutes=28),
            notes="Small loss",
        ),
        # 09:30 - Ninth trade: +$310 (cumulative: -$245)
        Trade(
            pair="EUR/USD",
            direction=TradeDirection.BUY,
            entry_price=1.0945,
            exit_price=1.0965,
            stop_loss=1.0935,
            take_profit=1.0985,
            position_size=15500,
            status=TradeStatus.CLOSED,
            opened_at=base_time + timedelta(minutes=16),
            closed_at=base_time + timedelta(minutes=30),
            notes="Market trending up - good entry",
        ),
        # 09:32 - Tenth trade: +$180 (cumulative: -$65)
        Trade(
            pair="GBP/USD",
            direction=TradeDirection.BUY,
            entry_price=1.2705,
            exit_price=1.2720,
            stop_loss=1.2690,
            take_profit=1.2750,
            position_size=7200,
            status=TradeStatus.CLOSED,
            opened_at=base_time + timedelta(minutes=18),
            closed_at=base_time + timedelta(minutes=32),
            notes="Second entry success",
        ),
        # 09:34 - Eleventh trade: -$85 (cumulative: -$150)
        Trade(
            pair="AUD/USD",
            direction=TradeDirection.BUY,
            entry_price=0.6845,
            exit_price=0.6838,
            stop_loss=0.6855,
            take_profit=0.6870,
            position_size=10000,
            status=TradeStatus.CLOSED,
            opened_at=base_time + timedelta(minutes=20),
            closed_at=base_time + timedelta(minutes=34),
            notes="Pullback entry failed",
        ),
        # 09:36 - Twelfth trade: +$250 (cumulative: +$100)
        Trade(
            pair="USD/JPY",
            direction=TradeDirection.SELL,
            entry_price=149.35,
            exit_price=149.15,
            stop_loss=149.50,
            take_profit=149.00,
            position_size=100,
            status=TradeStatus.CLOSED,
            opened_at=base_time + timedelta(minutes=22),
            closed_at=base_time + timedelta(minutes=36),
            notes="Trend reversal short - strong win",
        ),
        # 09:38 - Thirteenth trade: +$420 (cumulative: +$520)
        Trade(
            pair="EUR/USD",
            direction=TradeDirection.BUY,
            entry_price=1.0960,
            exit_price=1.0995,
            stop_loss=1.0945,
            take_profit=1.1020,
            position_size=20000,
            status=TradeStatus.CLOSED,
            opened_at=base_time + timedelta(minutes=24),
            closed_at=base_time + timedelta(minutes=38),
            notes="Large winning trade - breakout",
        ),
        # 09:40 - Fourteenth trade: +$280 (cumulative: +$800)
        Trade(
            pair="GBP/USD",
            direction=TradeDirection.SELL,
            entry_price=1.2720,
            exit_price=1.2700,
            stop_loss=1.2735,
            take_profit=1.2670,
            position_size=14000,
            status=TradeStatus.CLOSED,
            opened_at=base_time + timedelta(minutes=26),
            closed_at=base_time + timedelta(minutes=40),
            notes="Momentum trade - strong profit",
        ),
        # 09:42 - Fifteenth trade: +$300 (cumulative: +$1,100)
        Trade(
            pair="AUD/USD",
            direction=TradeDirection.SELL,
            entry_price=0.6838,
            exit_price=0.6818,
            stop_loss=0.6855,
            take_profit=0.6800,
            position_size=15000,
            status=TradeStatus.CLOSED,
            opened_at=base_time + timedelta(minutes=28),
            closed_at=base_time + timedelta(minutes=42),
            notes="Final strong profit - closing session high",
        ),
    ]
    
    with Session(engine) as session:
        session.query(Trade).delete()  # Clear existing trades
        for trade in demo_trades:
            session.add(trade)
        session.commit()
        print(f"Seeded {len(demo_trades)} intraday trades for Running P&L visualization.")

if __name__ == "__main__":
    seed_trades()

