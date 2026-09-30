# ── Correction Router ──────────────────────────────────────────────
# GET /api/correction/{event_id}  – Before/After comparison (Screen 03)
# Demo mode: returns seeded data without Supabase.

from fastapi import APIRouter, HTTPException
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from demo_seed import EVENTS_BY_ID, seed_districts

router = APIRouter(prefix="/api/correction", tags=["correction"])


@router.get("/{event_id}")
async def get_correction_summary(event_id: str):
    """
    Before / After comparison data for Screen 03 (Before/After/Observation).
    Spec §11: Correction Engine output, COMBINE/REPLACE/KEEP decision.
    """
    event = EVENTS_BY_ID.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail=f"Event '{event_id}' not found")

    # Build per-district correction summary
    districts = seed_districts(event_id)
    corrections = [
        {
            "district":               d["district"],
            "lat":                    d["lat"],
            "lng":                    d["lng"],
            "nwp_max_mm":             round(d["max_rainfall_mm"] * 0.72, 1),   # raw NWP (underestimated)
            "spectra_max_mm":         d["max_rainfall_mm"],                     # SPECTRA corrected
            "obs_max_mm":             round(d["max_rainfall_mm"] * 1.05, 1),    # CHIRPS observation
            "intensity_change_pct":   round((d["max_rainfall_mm"] - d["max_rainfall_mm"] * 0.72) / (d["max_rainfall_mm"] * 0.72) * 100, 1),
            "decision":               d["decision"],
            "blend_nwp":              0.38,
            "blend_spectra":          0.62,
        }
        for d in districts
    ]

    return {
        "event_id":     event_id,
        "corrections":  corrections,
        "summary": {
            "decision":                 "COMBINE",
            "blend_nwp":                0.38,
            "blend_spectra":            0.62,
            "budget_mm":                26.4,
            "spatial_shift_km":         35,
            "spatial_shift_direction":  "NE",
            "heavy_area_change_km2":    180,
            "max_intensity_change_pct": 28.2,
        },
        "data_label": "SYNTHETIC DEMO — NOT SCIENTIFIC PERFORMANCE",
    }
