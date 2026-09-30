"""
SPECTRA 4.1 — Demo Data Seed
All 36 Maharashtra districts with synthetic but scientifically plausible data.
Used for the SIH evaluator demo — no database required.
Spec §3: zero-cost, CPU-first, no paid services.
"""

# ── All 36 Maharashtra Districts with geo-coordinates ──────────────────────
MH_DISTRICTS = [
    # Konkan Division (highest rainfall — Western Ghats leeward side)
    {"name": "Raigad",          "lat": 18.52, "lng": 73.18, "division": "Konkan"},
    {"name": "Ratnagiri",       "lat": 16.99, "lng": 73.30, "division": "Konkan"},
    {"name": "Sindhudurg",      "lat": 16.05, "lng": 73.55, "division": "Konkan"},
    {"name": "Thane",           "lat": 19.20, "lng": 73.00, "division": "Konkan"},
    {"name": "Palghar",         "lat": 19.70, "lng": 72.76, "division": "Konkan"},
    {"name": "Mumbai City",     "lat": 18.97, "lng": 72.82, "division": "Konkan"},
    {"name": "Mumbai Suburban", "lat": 19.10, "lng": 72.87, "division": "Konkan"},

    # Pune Division (Western Ghats — heavy orographic rainfall)
    {"name": "Pune",            "lat": 18.52, "lng": 73.85, "division": "Pune"},
    {"name": "Satara",          "lat": 17.69, "lng": 73.99, "division": "Pune"},
    {"name": "Sangli",          "lat": 16.86, "lng": 74.57, "division": "Pune"},
    {"name": "Solapur",         "lat": 17.68, "lng": 75.90, "division": "Pune"},
    {"name": "Kolhapur",        "lat": 16.71, "lng": 74.22, "division": "Pune"},

    # Nashik Division
    {"name": "Nashik",          "lat": 19.99, "lng": 73.79, "division": "Nashik"},
    {"name": "Dhule",           "lat": 20.90, "lng": 74.78, "division": "Nashik"},
    {"name": "Jalgaon",         "lat": 21.00, "lng": 75.56, "division": "Nashik"},
    {"name": "Nandurbar",       "lat": 21.37, "lng": 74.24, "division": "Nashik"},
    {"name": "Ahmednagar",      "lat": 19.09, "lng": 74.74, "division": "Nashik"},

    # Aurangabad Division (Marathwada — semi-arid, lower rainfall)
    {"name": "Aurangabad",      "lat": 19.87, "lng": 75.34, "division": "Aurangabad"},
    {"name": "Jalna",           "lat": 19.84, "lng": 75.89, "division": "Aurangabad"},
    {"name": "Beed",            "lat": 18.99, "lng": 75.76, "division": "Aurangabad"},
    {"name": "Osmanabad",       "lat": 18.17, "lng": 76.07, "division": "Aurangabad"},
    {"name": "Latur",           "lat": 18.40, "lng": 76.56, "division": "Aurangabad"},
    {"name": "Nanded",          "lat": 19.15, "lng": 77.31, "division": "Aurangabad"},
    {"name": "Hingoli",         "lat": 19.72, "lng": 77.15, "division": "Aurangabad"},
    {"name": "Parbhani",        "lat": 19.27, "lng": 76.78, "division": "Aurangabad"},

    # Amravati Division (Vidarbha)
    {"name": "Amravati",        "lat": 20.93, "lng": 77.78, "division": "Amravati"},
    {"name": "Yavatmal",        "lat": 20.40, "lng": 78.12, "division": "Amravati"},
    {"name": "Wardha",          "lat": 20.74, "lng": 78.60, "division": "Amravati"},
    {"name": "Akola",           "lat": 20.71, "lng": 77.00, "division": "Amravati"},
    {"name": "Washim",          "lat": 20.11, "lng": 77.14, "division": "Amravati"},
    {"name": "Buldhana",        "lat": 20.53, "lng": 76.18, "division": "Amravati"},

    # Nagpur Division (Vidarbha)
    {"name": "Nagpur",          "lat": 21.15, "lng": 79.09, "division": "Nagpur"},
    {"name": "Bhandara",        "lat": 21.17, "lng": 79.65, "division": "Nagpur"},
    {"name": "Gondia",          "lat": 21.46, "lng": 80.19, "division": "Nagpur"},
    {"name": "Chandrapur",      "lat": 19.96, "lng": 79.30, "division": "Nagpur"},
    {"name": "Gadchiroli",      "lat": 20.18, "lng": 80.00, "division": "Nagpur"},
]

# ── Rainfall intensity by division (monsoon context) ──────────────────────
DIVISION_RAINFALL = {
    "Konkan":     {"base_max": 220, "heavy_base": 0.88, "vheavy_base": 0.72, "extreme_base": 0.38},
    "Pune":       {"base_max": 160, "heavy_base": 0.78, "vheavy_base": 0.58, "extreme_base": 0.22},
    "Nashik":     {"base_max": 110, "heavy_base": 0.60, "vheavy_base": 0.32, "extreme_base": 0.08},
    "Aurangabad": {"base_max":  70, "heavy_base": 0.40, "vheavy_base": 0.18, "extreme_base": 0.03},
    "Amravati":   {"base_max":  90, "heavy_base": 0.52, "vheavy_base": 0.25, "extreme_base": 0.06},
    "Nagpur":     {"base_max": 100, "heavy_base": 0.55, "vheavy_base": 0.28, "extreme_base": 0.07},
}

import random

def _decision(heavy, conf):
    if conf == "HIGH" and heavy > 0.8:
        return "COMBINE"
    if conf == "LOW" or heavy < 0.5:
        return "KEEP_ORIGINAL"
    return "COMBINE"

def _conf(heavy):
    if heavy > 0.80: return "HIGH"
    if heavy > 0.55: return "MEDIUM"
    return "LOW"

def seed_districts(event_id: str, seed: int = 42):
    """
    Generate deterministic synthetic district products for a given event.
    Same event_id always returns identical values (seed-stable).
    """
    rng = random.Random(hash(event_id) ^ seed)
    results = []
    for d in MH_DISTRICTS:
        div = DIVISION_RAINFALL[d["division"]]
        jitter = rng.uniform(0.85, 1.15)
        max_rain  = round(div["base_max"] * jitter, 1)
        mean_rain = round(max_rain * rng.uniform(0.70, 0.82), 1)
        p90_rain  = round(max_rain * rng.uniform(0.88, 0.96), 1)
        heavy     = round(min(div["heavy_base"] * jitter, 0.99), 2)
        vheavy    = round(min(div["vheavy_base"] * jitter, 0.99), 2)
        extreme   = round(min(div["extreme_base"] * jitter, 0.99), 2)
        conf      = _conf(heavy)
        decision  = _decision(heavy, conf)

        results.append({
            "event_id":           event_id,
            "district":           d["name"],
            "division":           d["division"],
            "lat":                d["lat"],
            "lng":                d["lng"],
            "mean_rainfall_mm":   mean_rain,
            "max_rainfall_mm":    max_rain,
            "p90_rainfall_mm":    p90_rain,
            "heavy_prob":         heavy,
            "vheavy_prob":        vheavy,
            "extreme_prob":       extreme,
            "heavy_area_frac":    heavy,
            "heavy_area_km2":     round(heavy * 310, 0),
            "dominant_regime":    "Active Monsoon" if d["division"] in ("Konkan","Pune") else "Continental Monsoon",
            "decision":           decision,
            "confidence":         conf,
            "data_label":         "SYNTHETIC DEMO — NOT SCIENTIFIC PERFORMANCE",
        })

    results.sort(key=lambda x: x["max_rainfall_mm"], reverse=True)
    return results


# ── Pre-seeded events ─────────────────────────────────────────────────────
EVENTS = [
    {
        "event_id":       "MONSOON-DEP-07",
        "event_date":     "2024-07-26",
        "region":         "Maharashtra",
        "district":       "Raigad",
        "cycle":          "00 UTC",
        "lead_time":      "+24h",
        "source":         "GFS 0.25°",
        "weather_pattern":"ACTIVE MONSOON + MONSOON LOW",
        "peak_obs_mm":    242.4,
        "lat":            18.52,
        "lng":            73.18,
        "status":         "selected",
    },
    {
        "event_id":       "MONSOON-DEP-05",
        "event_date":     "2024-07-21",
        "region":         "Maharashtra",
        "district":       "Ratnagiri",
        "cycle":          "00 UTC",
        "lead_time":      "+24h",
        "source":         "GFS 0.25°",
        "weather_pattern":"OFFSHORE TROUGH",
        "peak_obs_mm":    198.0,
        "lat":            16.99,
        "lng":            73.30,
        "status":         "available",
    },
    {
        "event_id":       "OROGRAPHIC-SURGE-02",
        "event_date":     "2024-07-15",
        "region":         "Maharashtra",
        "district":       "Pune",
        "cycle":          "00 UTC",
        "lead_time":      "+48h",
        "source":         "GFS 0.25°",
        "weather_pattern":"OROGRAPHIC SURGE",
        "peak_obs_mm":    165.5,
        "lat":            18.52,
        "lng":            73.85,
        "status":         "available",
    },
    {
        "event_id":       "MONSOON-LOW-09",
        "event_date":     "2024-08-11",
        "region":         "Maharashtra",
        "district":       "Thane",
        "cycle":          "00 UTC",
        "lead_time":      "+72h",
        "source":         "GFS 0.25°",
        "weather_pattern":"ACTIVE MONSOON SURGE",
        "peak_obs_mm":    148.2,
        "lat":            19.20,
        "lng":            73.00,
        "status":         "available",
    },
    {
        "event_id":       "TROUGH-EMB-01",
        "event_date":     "2024-09-02",
        "region":         "Maharashtra",
        "district":       "Sindhudurg",
        "cycle":          "00 UTC",
        "lead_time":      "+24h",
        "source":         "GFS 0.25°",
        "weather_pattern":"COASTAL CONVERGENCE",
        "peak_obs_mm":    184.6,
        "lat":            16.05,
        "lng":            73.55,
        "status":         "available",
    },
    {
        "event_id":       "BREAK-MONSOON-03",
        "event_date":     "2024-08-25",
        "region":         "Maharashtra",
        "district":       "Nashik",
        "cycle":          "00 UTC",
        "lead_time":      "+48h",
        "source":         "GFS 0.25°",
        "weather_pattern":"BREAK MONSOON",
        "peak_obs_mm":    42.1,
        "lat":            19.99,
        "lng":            73.79,
        "status":         "available",
    },
]

EVENTS_BY_ID = {e["event_id"]: e for e in EVENTS}
