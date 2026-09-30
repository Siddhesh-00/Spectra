# ── Forecast Diagnosis Router ──────────────────────────────────────
# GET /api/forecast/{event_id}  – regime + failure prediction for Screen 02
# Demo mode: returns seeded data without Supabase.

from fastapi import APIRouter, HTTPException
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from demo_seed import EVENTS_BY_ID

router = APIRouter(prefix="/api/forecast", tags=["forecast"])


@router.get("/{event_id}")
async def get_forecast_diagnosis(event_id: str):
    """
    Weather regime probabilities and failure mode predictions for Screen 02.
    Spec §8 (regime classifier) + §9 (failure model).
    """
    event = EVENTS_BY_ID.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail=f"Event '{event_id}' not found")

    regime_vector = {
        "active_monsoon":      0.61,
        "monsoon_low":         0.24,
        "orographic":          0.10,
        "coastal":             0.04,
        "break_monsoon":       0.01,
        "western_disturbance": 0.00,
        "dominant":            "Active Monsoon",
    }

    failure_report = {
        "occurrence":  {"level": "LOW",    "conf": 0.12, "desc": "Rain/no-rain agreement is adequate"},
        "amount":      {"level": "HIGH",   "conf": 0.84, "desc": "Intensity substantially underestimated"},
        "location":    {"level": "HIGH",   "conf": 0.78, "desc": "Rainfall core displaced ~35 km NE"},
        "structure":   {"level": "MEDIUM", "conf": 0.54, "desc": "Spatial spread overestimated by 20%"},
        "heavy_tail":  {"level": "HIGH",   "conf": 0.91, "desc": "Extreme >115.6 mm heavily suppressed"},
    }

    return {
        "event":       event,
        "regime":      regime_vector,
        "failure":     failure_report,
        "data_label":  "SYNTHETIC DEMO — NOT SCIENTIFIC PERFORMANCE",
    }
