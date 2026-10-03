# SPECTRA
## Selective Precipitation Error Correction and Targeted Rainfall Analysis

> **Diagnose. Repair. Verify. Decide.**
> SPECTRA earns the right to disagree with the forecast.

---

## Quick Start

### 1 — React Frontend (Vite + React + Leaflet)
```bash
cd App
npm install
npm run dev
# Open http://localhost:5173
```

> **Note:** The frontend runs in demo mode with seeded data. No Supabase credentials required.

### 2 — Backend (FastAPI — no Supabase required for demo)
```bash
cd Backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

python -m uvicorn main:app --reload --port 8000
# API docs: http://localhost:8000/api/docs
# Health:   http://localhost:8000/api/health
```

> The backend runs entirely on **demo seed data** (`demo_seed.py`) — no Supabase account needed for the SIH demo evaluation. The `db/schema.sql` and Supabase integration are provided for the production pipeline path.

### 3 — (Optional) Supabase Setup for Real Data
1. Go to **https://supabase.com** → Create a free project
2. Dashboard → **SQL Editor** → paste `Backend/db/schema.sql` → Run
3. Dashboard → **Settings → API** → copy `Project URL` + `anon public key`
4. Copy `Backend/.env.example` → `Backend/.env` and fill in credentials

---

## Project Structure

```
Spectra-69/
├── App/                         ← React + Vite frontend (5-screen SPA)
│   ├── src/
│   │   ├── screens/             ← Screen01–Screen05 components
│   │   ├── components/          ← Layout, Primitives, SpectraTile
│   │   └── services/api.js      ← API service layer (calls Backend)
│   ├── .env.example             ← VITE_API_URL config
│   └── package.json
│
├── Backend/                     ← FastAPI REST API (demo-ready, no DB required)
│   ├── main.py                  ← App entry point (uvicorn main:app)
│   ├── demo_seed.py             ← All 36 Maharashtra districts, seeded data
│   ├── requirements.txt
│   ├── .env.example             ← Copy to .env, add Supabase keys (optional)
│   ├── routers/
│   │   ├── events.py            ← GET /api/events
│   │   ├── forecast.py          ← GET /api/forecast/{event_id}
│   │   ├── correction.py        ← GET /api/correction/{event_id}
│   │   ├── district.py          ← GET /api/district/{event_id}
│   │   └── verification.py      ← GET /api/verification/metrics
│   └── db/
│       ├── supabase_client.py   ← Supabase connection (production path)
│       └── schema.sql           ← All 9 tables + seed data
│
├── configs/                     ← Frozen experiment configs (spec §47)
│   ├── experiment.yaml          ← Domain, NWP source, splits, seeds
│   ├── thresholds.yaml          ← IMD Heavy/Very Heavy/Extreme thresholds
│   ├── features.yaml            ← Feature blocks 1–6
│   └── split.yaml               ← Train/val/test event lists
│
├── src/                         ← ML pipeline (spec §36)
│   ├── ingest/                  ← GFS + CHIRPS data download
│   ├── preprocessing/           ← Grid alignment, feature engineering
│   ├── regime/                  ← Weather regime classifier (LightGBM)
│   ├── failure/                 ← Forecast failure predictor
│   ├── correction/              ← Correction engine (QM + ML)
│   ├── challenger/              ← Leakage-safe challenger (spec §16)
│   ├── probability/             ← Heavy rain probabilities (spec §14)
│   ├── district/                ← District aggregation (spec §20)
│   └── verification/            ← Metrics: CSI/ETS/POD/FAR/FSS (spec §27)
│
├── data/                        ← Raw + processed data (gitignored)
├── models/                      ← Trained model artifacts (gitignored)
├── outputs/                     ← Maps, district tables, reports
└── notebooks/                   ← Exploration and analysis
```

---


## API Endpoints

| Method | Endpoint | Description | Frontend Screen |
|--------|----------|-------------|-----------------|
| GET | `/api/health` | Health check | — |
| GET | `/api/events` | List all historical events | Screen 01 |
| GET | `/api/events/{id}` | Full event detail | Screen 01 |
| GET | `/api/forecast/{id}` | Regime + failure diagnosis | Screen 02 |
| GET | `/api/correction/{id}` | Before/after comparison | Screen 03 |
| GET | `/api/correction/{id}/{district}` | Single district correction | Screen 03/04 |
| GET | `/api/district/{id}` | District product table | Screen 04 |
| GET | `/api/district/{id}/{district}` | Single district detail | Screen 04 |
| GET | `/api/verification/metrics` | Model comparison metrics | Screen 05 |
| GET | `/api/verification/contingency` | Contingency table | Screen 05 |
| GET | `/api/verification/ablation` | Ablation results | Screen 05 |

Interactive docs: **http://localhost:8000/api/docs**

---

## Supabase Tables

| Table | Purpose | Spec Section |
|-------|---------|-------------|
| `events` | Historical rainfall events | §22 Event Replay |
| `regime_predictions` | Regime probability vectors | §8 Classifier |
| `failure_predictions` | Failure mode confidence | §9 Failure Model |
| `correction_outputs` | REPLACE/COMBINE/KEEP + rainfall | §15 Decision |
| `district_products` | District-level rainfall + risk | §20 District |
| `verification_metrics` | CSI/ETS/POD/FAR/FSS by model | §27 Verification |
| `contingency_counts` | Hits/misses/false alarms | §27 Verification |
| `ablation_results` | Ablation study A–F | §25 Ablation |
| `experiment_manifests` | Reproducibility lock | §47 Checklist |

---

## Data Sources (Zero Cost — Spec §3)

| Data | Source | URL |
|------|--------|-----|
| NWP Forecasts | GFS 0.25° (NOAA) | https://nomads.ncep.noaa.gov/ |
| GFS Archive | NOAA READY | https://www.ready.noaa.gov/data/archives/gfs0p25/ |
| Verification | CHIRPS v3 daily | https://data.chc.ucsb.edu/products/CHIRPS/v3.0/ |
| Optional precip | NASA GPM IMERG | https://gpm.nasa.gov/data/imerg |
| Map tiles | CartoDB Light | Free, no API key |

---

## Weather Regime Classes (Spec §8)

| Regime | Description |
|--------|-------------|
| Active Monsoon | Strong low-level westerlies |
| Break Monsoon | Foothills trough shift |
| Monsoon Low / Depression | BoB cyclonic shear vortex |
| Coastal Rainfall | Offshore trough convergence |
| Orographic | Windward ridge uplift |
| Western Disturbance | Upper tropospheric westerly |

---

## Rainfall Thresholds (IMD — Spec §14)

| Category | Threshold |
|----------|-----------|
| Light / Moderate | < 35.5 mm |
| Heavy | 64.5 – 115.5 mm |
| Very Heavy | 115.6 – 204.4 mm |
| **Extremely Heavy** | **≥ 204.5 mm** |

> **Rule:** Thresholds frozen in `configs/thresholds.yaml` before final testing. Do not change after inspecting test results.

---

## Reproducibility Checklist (Spec §47)

- [ ] Dataset versions recorded in `experiment_manifests` table
- [ ] Threshold config frozen in `configs/thresholds.yaml`
- [ ] Feature list frozen in `configs/features.yaml`
- [ ] Train/val/test events frozen in `configs/split.yaml`
- [ ] Random seeds recorded in `configs/experiment.yaml`
- [ ] No future-observation features used at inference time
- [ ] Final test not used for tuning
- [ ] All demo numbers labelled: VALIDATED / PROTOTYPE / SYNTHETIC

---

## Data Label Policy (Spec §43 / §23)

| Label | Meaning |
|-------|---------|
| `VALIDATED_ON_HELD_OUT_REAL_DATA` | Green — real held-out result |
| `PROTOTYPE_INTERNAL_VALIDATION` | Yellow — internal only |
| `SYNTHETIC_UI_DEMONSTRATION` | Grey — prototype UI demo |

> The current seed data is labelled `SYNTHETIC_UI_DEMONSTRATION`. Replace with real pipeline outputs as ML stages are completed.

---

## Zero-Cost Constraint (Spec §3 / §58)

✅ No paid APIs  
✅ No paid map tiles (CartoDB free tier)  
✅ No paid cloud compute  
✅ No paid weather data (GFS + CHIRPS are public)  
✅ Supabase free tier (no credit card for demo path)  
✅ CPU-first ML (LightGBM, scikit-learn)  
✅ Runs offline with frozen local test case  
