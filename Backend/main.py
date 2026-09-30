"""
SPECTRA 4.1 — FastAPI Backend
Entry point. Spec §3: "Streamlit or a simple FastAPI + frontend for the demo"

Run:
    uvicorn main:app --reload --port 8000

All endpoints are prefixed /api/* — the frontend (port 8080) calls these
via fetch('/api/...') after you configure a reverse proxy, or directly as
http://localhost:8000/api/... during local development.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import events, forecast, correction, district, verification
import os

app = FastAPI(
    title="SPECTRA 4.1 API",
    description=(
        "Synoptic Precipitation Error Correction & Temporal Rainfall Analysis. "
        "SIH26080 — Zero-Cost MVP backend."
    ),
    version="4.1.0",
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
        "system": "SPECTRA 4.1",
        "version": "4.1.0",
        "spec_section": "§3 Zero-Cost MVP",
    }


# ── Root ─────────────────────────────────────────────────────────
@app.get("/", tags=["system"])
async def root():
    return {
        "message": "SPECTRA 4.1 API — see /api/docs for interactive documentation",
        "frontend": "Open http://localhost:8080/index.html",
    }
