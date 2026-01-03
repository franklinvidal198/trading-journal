from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.routes import auth, trades, stats
from app.api.v1 import journal_api, templates_api, goals_api, reports_api, twofa_api
from app.core.config import settings, DATA_MODE
from fastapi import Request
from fastapi.responses import JSONResponse
import os
from app.utils.seed import seed_trades

app = FastAPI(title="Trading Journal API", version="1.0.0")

# System mode endpoint
@app.get("/api/v1/system/mode")
async def get_mode():
    return {"mode": DATA_MODE}

@app.post("/api/v1/system/mode")
async def set_mode(request: Request):
    body = await request.json()
    mode = body.get("mode")
    if mode not in ["test", "real", "seed"]:
        return JSONResponse(status_code=400, content={"error": "Invalid mode"})
    os.environ["DATA_MODE"] = mode
    global DATA_MODE
    DATA_MODE = mode
    if mode == "seed":
        seed_trades()
    return {"mode": DATA_MODE}

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(trades.router, prefix="/api/v1/trades", tags=["trades"])
app.include_router(stats.router, prefix="/api/v1/stats", tags=["stats"])
app.include_router(journal_api.router)
app.include_router(templates_api.router)
app.include_router(goals_api.router)
app.include_router(reports_api.router)
app.include_router(twofa_api.router)
