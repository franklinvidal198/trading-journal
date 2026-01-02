import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# ---------- STATS ENDPOINTS ----------
def test_stats_summary():
    response = client.get("/api/v1/stats/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_trades" in data
    assert "win_rate" in data
    assert "avg_risk_reward" in data
    assert "total_profit" in data

def test_stats_equity_curve():
    response = client.get("/api/v1/stats/equity_curve")
    assert response.status_code == 200
    curve = response.json()
    assert isinstance(curve, list)
    if curve:
        assert "date" in curve[0]
        assert "equity" in curve[0]
