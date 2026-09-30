# ── Verification Router ────────────────────────────────────────────
# GET /api/verification/{event_id}        – full verification metrics (Screen 05)
# GET /api/verification/metrics           – aggregate metrics (all events)
# Demo mode: seeded data, no Supabase.

from fastapi import APIRouter, Query
from typing import Optional
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

router = APIRouter(prefix="/api/verification", tags=["verification"])

# ── Seeded verification metrics (spec §27 required metrics) ──────────────
METRICS_BY_THRESHOLD = {
    "HEAVY": {
        "RAW_NWP":    {"csi": 0.31, "pod": 0.52, "far": 0.41, "ets": 0.22, "rmse": 28.4, "fss": 0.41, "bias": 0.78},
        "QM":         {"csi": 0.39, "pod": 0.60, "far": 0.38, "ets": 0.28, "rmse": 23.1, "fss": 0.50, "bias": 0.88},
        "GENERIC_ML": {"csi": 0.43, "pod": 0.64, "far": 0.35, "ets": 0.32, "rmse": 21.4, "fss": 0.53, "bias": 0.91},
        "REGIME_ML":  {"csi": 0.48, "pod": 0.68, "far": 0.31, "ets": 0.37, "rmse": 18.9, "fss": 0.58, "bias": 0.95},
        "SPECTRA":    {"csi": 0.54, "pod": 0.74, "far": 0.27, "ets": 0.43, "rmse": 16.2, "fss": 0.63, "bias": 0.98},
    },
    "VERY_HEAVY": {
        "RAW_NWP":    {"csi": 0.19, "pod": 0.38, "far": 0.51, "ets": 0.13, "rmse": 34.2, "fss": 0.30, "bias": 0.62},
        "QM":         {"csi": 0.27, "pod": 0.48, "far": 0.44, "ets": 0.19, "rmse": 28.8, "fss": 0.39, "bias": 0.74},
        "GENERIC_ML": {"csi": 0.31, "pod": 0.52, "far": 0.40, "ets": 0.23, "rmse": 26.1, "fss": 0.42, "bias": 0.79},
        "REGIME_ML":  {"csi": 0.37, "pod": 0.57, "far": 0.35, "ets": 0.28, "rmse": 22.4, "fss": 0.48, "bias": 0.85},
        "SPECTRA":    {"csi": 0.44, "pod": 0.65, "far": 0.29, "ets": 0.35, "rmse": 19.1, "fss": 0.56, "bias": 0.92},
    },
    "EXTREME": {
        "RAW_NWP":    {"csi": 0.09, "pod": 0.21, "far": 0.62, "ets": 0.06, "rmse": 48.1, "fss": 0.18, "bias": 0.41},
        "QM":         {"csi": 0.14, "pod": 0.30, "far": 0.54, "ets": 0.10, "rmse": 39.2, "fss": 0.25, "bias": 0.58},
        "GENERIC_ML": {"csi": 0.18, "pod": 0.37, "far": 0.48, "ets": 0.13, "rmse": 34.8, "fss": 0.30, "bias": 0.64},
        "REGIME_ML":  {"csi": 0.23, "pod": 0.43, "far": 0.42, "ets": 0.17, "rmse": 29.6, "fss": 0.36, "bias": 0.71},
        "SPECTRA":    {"csi": 0.31, "pod": 0.54, "far": 0.35, "ets": 0.24, "rmse": 23.4, "fss": 0.44, "bias": 0.84},
    },
}

ABLATION = [
    {"id": "A", "name": "Raw NWP",               "csi_heavy": 0.31, "desc": "No correction"},
    {"id": "B", "name": "Quantile Mapping",       "csi_heavy": 0.39, "desc": "Strong statistical baseline"},
    {"id": "C", "name": "Generic ML",             "csi_heavy": 0.43, "desc": "Non-regime-aware ML"},
    {"id": "D", "name": "Regime ML",              "csi_heavy": 0.48, "desc": "Regime-conditioned ML, no failure model"},
    {"id": "E", "name": "Regime ML + Failure",    "csi_heavy": 0.51, "desc": "Adds failure diagnosis"},
    {"id": "F", "name": "SPECTRA (Full)",         "csi_heavy": 0.54, "desc": "Full system incl. challenger gate"},
]


@router.get("/metrics")
async def get_metrics(
    threshold: Optional[str] = Query("HEAVY", description="HEAVY | VERY_HEAVY | EXTREME"),
):
    """All model metrics for Screen 05. Spec §27."""
    t = (threshold or "HEAVY").upper()
    data = METRICS_BY_THRESHOLD.get(t, METRICS_BY_THRESHOLD["HEAVY"])
    rows = [
        {"model": model, "threshold": t, **metrics}
        for model, metrics in data.items()
    ]
    return {
        "metrics":    rows,
        "by_model":   data,
        "threshold":  t,
        "data_label": "SYNTHETIC DEMO — NOT SCIENTIFIC PERFORMANCE",
    }


@router.get("/ablation")
async def get_ablation():
    """Ablation study A–F. Spec §25."""
    return {"ablation": ABLATION}


@router.get("/{event_id}")
async def get_event_verification(event_id: str):
    """Full verification for a specific event."""
    return {
        "event_id":   event_id,
        "metrics":    METRICS_BY_THRESHOLD,
        "ablation":   ABLATION,
        "data_label": "SYNTHETIC DEMO — NOT SCIENTIFIC PERFORMANCE",
    }
