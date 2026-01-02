
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_trade():
    trade = {
        "pair": "EUR/USD",
        "direction": "BUY",
        "entry_price": 1.1000,
        "stop_loss": 1.0950,
        "take_profit": 1.1100,
        "position_size": 1.0,
        "notes": "Test trade"
    }
    response = client.post("/api/v1/trades/", json=trade)
    assert response.status_code == 200
    data = response.json()
    assert data["pair"] == "EUR/USD"
    assert data["direction"] == "BUY"

def test_list_trades():
    response = client.get("/api/v1/trades/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
