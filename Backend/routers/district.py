# ── District Router ────────────────────────────────────────────────
# GET /api/district/{event_id}             – all 36 MH districts
# GET /api/district/{event_id}/{name}      – single district detail
# GET /api/district/search?q=             – district search for UI

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from demo_seed import seed_districts, MH_DISTRICTS

router = APIRouter(prefix="/api/district", tags=["district"])


@router.get("/search")
async def search_districts(q: str = Query(..., min_length=1)):
    """
    District autocomplete search for Screen 01 location search bar.
    Returns matching Maharashtra district names + coordinates.
    """
    q_lower = q.lower()
    matches = [
        d for d in MH_DISTRICTS
        if q_lower in d["name"].lower() or q_lower in d["division"].lower()
    ]
    return {"results": matches[:8], "count": len(matches)}


@router.get("/{event_id}")
async def get_district_products(event_id: str):
    """
    All 36 Maharashtra district products for the selected event.
    Screen 04 — District Product.
    Spec §20: mean/max/p90 rainfall, Heavy/Very Heavy/Extreme probs, decision.
    """
    districts = seed_districts(event_id)
    return {
        "event_id": event_id,
        "districts": districts,
        "count": len(districts),
        "data_label": "SYNTHETIC DEMO — NOT SCIENTIFIC PERFORMANCE",
    }


@router.get("/{event_id}/{district_name}")
async def get_single_district(event_id: str, district_name: str):
    """Single district detail for map click-through."""
    all_districts = seed_districts(event_id)
    match = next(
        (d for d in all_districts if d["district"].lower() == district_name.lower()),
        None
    )
    if not match:
        raise HTTPException(
            status_code=404,
            detail=f"District '{district_name}' not found for event '{event_id}'"
        )
    return match
