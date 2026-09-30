# ── Events Router ─────────────────────────────────────────────────
# GET /api/events          – list all events (Screen 01 table)
# GET /api/events/{id}     – single event detail
# Spec §5: Maharashtra focus, GFS 0.25° source

from fastapi import APIRouter, Query
from typing import Optional
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from demo_seed import EVENTS, EVENTS_BY_ID, seed_districts

router = APIRouter(prefix="/api/events", tags=["events"])


@router.get("/")
async def list_events(
    district: Optional[str] = Query(None),
    weather_pattern: Optional[str] = Query(None),
):
    """
    List all historical events for Screen 01 (Event / District Selection).
    Optional filters: district, weather_pattern.
    """
    events = EVENTS
    if district:
        events = [e for e in events if district.lower() in e["district"].lower()]
    if weather_pattern:
        events = [e for e in events if weather_pattern.lower() in e["weather_pattern"].lower()]
    return {"events": events, "count": len(events)}


@router.get("/{event_id}")
async def get_event_detail(event_id: str):
    """Full event detail + district products for Screens 02-04."""
    event = EVENTS_BY_ID.get(event_id)
    if not event:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"Event '{event_id}' not found")

    districts = seed_districts(event_id)

    return {
        "event": event,
        "regime": {
            "event_id": event_id,
            "active_monsoon":       0.61,
            "monsoon_low":          0.24,
            "orographic":           0.10,
            "coastal":              0.04,
            "break_monsoon":        0.01,
            "western_disturbance":  0.00,
            "dominant":             "Active Monsoon",
        },
        "failure": {
            "event_id":   event_id,
            "occurrence": {"level": "LOW",    "conf": 0.12},
            "amount":     {"level": "HIGH",   "conf": 0.84},
            "location":   {"level": "HIGH",   "conf": 0.78},
            "structure":  {"level": "MEDIUM", "conf": 0.54},
            "heavy_tail": {"level": "HIGH",   "conf": 0.91},
        },
        "correction": {
            "method":     "LightGBM + Quantile",
            "decision":   "COMBINE",
            "blend_nwp":  0.38,
            "blend_spec": 0.62,
            "budget_mm":  26.4,
            "conf":       "HIGH",
        },
        "district_products": districts[:8],  # top 8 for detail view
    }
