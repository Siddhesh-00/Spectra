"""
SPECTRA — FastAPI Backend

Run:
    uvicorn main:app --reload --port 8000

All endpoints are prefixed /api/*.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import events, forecast, correction, district, verification
import os

app = FastAPI(
    title="SPECTRA",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ── CORS (allow frontend dev server + production) ───────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",    # Vite dev server
        "http://127.0.0.1:5173",
        "http://localhost:8080",    # Python http.server fallback
        "http://localhost:3000",    # Node dev server fallback
        "http://127.0.0.1:8080",
        "*",                        # Open for SIH demo evaluation
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# ── Register Routers ────────────────────────────────────────────
app.include_router(events.router)
app.include_router(forecast.router)
app.include_router(correction.router)
app.include_router(district.router)
app.include_router(verification.router)


# ── Health Check ────────────────────────────────────────────────
@app.get("/api/health", tags=["system"])
async def health():
    return {
        "status": "ok",
        "system": "SPECTRA",
    }


# ── Root ─────────────────────────────────────────────────────────
@app.get("/", tags=["system"])
async def root():
    return {"message": "SPECTRA API — see /api/docs for interactive documentation"}
