# SPECTRA 4.1 — Full Project Structure

This document maps the **actual file structure** to the spec (Section 36 + Section 60).

## What Exists (Frontend — Built ✅)

```
Frontend/
├── index.html                              ← Unified SPA (all 5 screens)
├── app.js                                  ← SPA controller, Leaflet maps, all interactivity
├── build.js                                ← Build tool (dev only)
├── event_district_selection/code.html      ← Screen 01 source
├── 02_forecast_diagnosis/code.html         ← Screen 02 source
├── before_after_observation_quad_workstation/code.html  ← Screen 03 source
├── district_product_split_workstation/code.html         ← Screen 04 source
├── forecast_accuracy_analytical_triptych/code.html      ← Screen 05 source
└── synoptic_precision/DESIGN.md            ← Design system reference
```

## Full Project Layout (Spec §36)

```
Spectra-69/
├── Frontend/                    ← (above)
├── Backend/                     ← FastAPI server (spec §3, §58.2)
│   ├── main.py                  ← FastAPI app entry point
│   ├── requirements.txt
│   ├── .env.example
│   ├── routers/
│   │   ├── events.py            ← GET /events, GET /events/{id}
│   │   ├── forecast.py          ← POST /forecast/diagnose
│   │   ├── correction.py        ← POST /correction/run
│   │   ├── district.py          ← GET /district/{name}
│   │   └── verification.py      ← GET /verification/metrics
│   ├── services/
│   │   ├── regime_classifier.py ← Weather regime ML model
│   │   ├── failure_model.py     ← Forecast failure predictor
│   │   ├── correction_engine.py ← REPLACE/COMBINE/KEEP logic
│   │   └── ood_checker.py       ← Out-of-distribution safety check
│   └── db/
│       ├── supabase_client.py   ← Supabase connection
│       └── schema.sql           ← Supabase table definitions
├── data/                        ← Spec §36
│   ├── raw/
│   ├── subset/
│   ├── observations/
│   ├── processed/
│   └── metadata/
├── configs/                     ← Spec §36
│   ├── features.yaml
│   ├── thresholds.yaml
│   ├── split.yaml
│   └── experiment.yaml
├── src/                         ← Spec §36 ML pipeline
│   ├── ingest/
│   ├── preprocessing/
│   ├── regime/
│   ├── failure/
│   ├── correction/
│   ├── challenger/
│   ├── probability/
│   ├── district/
│   └── verification/
├── models/                      ← Trained model artifacts
├── outputs/                     ← Maps, district tables, reports
├── notebooks/                   ← Exploration notebooks
└── README.md
```
