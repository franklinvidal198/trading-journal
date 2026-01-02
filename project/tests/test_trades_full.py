import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# ---------- TRADE ENDPOINTS ----------
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
    assert data["status"] == "OPEN"
    return data["id"]

def test_list_trades():
    response = client.get("/api/v1/trades/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_trade():
    trade = {
        "pair": "GBP/USD",
        "direction": "SELL",
        "entry_price": 1.2500,
        "stop_loss": 1.2550,
        "take_profit": 1.2400,
        "position_size": 2.0,
        "notes": "GBP test"
    }
    create_resp = client.post("/api/v1/trades/", json=trade)
    trade_id = create_resp.json()["id"]
    response = client.get(f"/api/v1/trades/{trade_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == trade_id
    assert data["pair"] == "GBP/USD"

def test_update_trade():
    trade = {
        "pair": "USD/JPY",
        "direction": "BUY",
        "entry_price": 110.00,
        "stop_loss": 109.50,
        "take_profit": 111.00,
        "position_size": 1.5,
        "notes": "USDJPY test"
    }
    create_resp = client.post("/api/v1/trades/", json=trade)
    trade_id = create_resp.json()["id"]
    update = {
        "entry_price": 110.50,
        "exit_price": 111.00,
        "notes": "Updated trade",
        "status": "OPEN"
    }
    response = client.put(f"/api/v1/trades/{trade_id}", json=update)
    assert response.status_code == 200
    data = response.json()
    assert data["entry_price"] == 110.50
    assert data["exit_price"] == 111.00
    assert data["notes"] == "Updated trade"

def test_close_trade():
    trade = {
        "pair": "BTC/USD",
        "direction": "SELL",
        "entry_price": 27000.0,
        "stop_loss": 27200.0,
        "take_profit": 26000.0,
        "position_size": 0.5,
        "notes": "BTC scalp"
    }
    create_resp = client.post("/api/v1/trades/", json=trade)
    trade_id = create_resp.json()["id"]
    response = client.patch(f"/api/v1/trades/{trade_id}/close?exit_price=26500.0")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "CLOSED"
    assert data["exit_price"] == 26500.0

def test_delete_trade():
    trade = {
        "pair": "XAU/USD",
        "direction": "BUY",
        "entry_price": 1900.0,
        "stop_loss": 1895.0,
        "take_profit": 1920.0,
        "position_size": 1.0,
        "notes": "Gold breakout"
    }
    create_resp = client.post("/api/v1/trades/", json=trade)
    trade_id = create_resp.json()["id"]
    response = client.delete(f"/api/v1/trades/{trade_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == trade_id
    assert data["pair"] == "XAU/USD"
