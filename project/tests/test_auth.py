import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# ---------- AUTH ENDPOINTS ----------
def test_signup_success():
    payload = {"email": "testuser@example.com", "password": "testpass123"}
    response = client.post("/api/v1/auth/signup", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_signup_duplicate():
    payload = {"email": "testuser@example.com", "password": "testpass123"}
    client.post("/api/v1/auth/signup", json=payload)  # First signup
    response = client.post("/api/v1/auth/signup", json=payload)  # Duplicate
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

def test_login_success():
    payload = {"email": "testuser2@example.com", "password": "testpass456"}
    client.post("/api/v1/auth/signup", json=payload)
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid():
    payload = {"email": "wrong@example.com", "password": "wrongpass"}
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"
