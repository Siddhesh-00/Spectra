<div align="center">
    
# SPECTRA

### Regime-aware rainfall forecast correction with failure diagnosis and selective intervention

[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)](https://vite.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Showcase](https://img.shields.io/badge/repository-showcase--only-7c3aed)](#license)

**Diagnose. Repair. Verify. Decide.**

SPECTRA is a zero-cost, CPU-first prototype for post-processing rainfall forecasts. It predicts the weather regime and likely NWP failure mode, evaluates a constrained correction, estimates heavy-rain probabilities, and changes the baseline only when the intervention is supported.

[Explore the workflow](#outputs) · [Run locally](#environment-setup) · [Review the license](#license)

</div>

> [!IMPORTANT]
> This is a public showcase repository. The current interface contains prototype replay and demonstration values. It is not an operational weather service, a nationwide validation claim, or a production-ready system.

## Problem statement

Numerical weather prediction can miss rainfall intensity, spatial placement, structure, timing, or the heavy-rain tail. A correction system that changes every forecast can also introduce harmful changes when the baseline was already useful.

SPECTRA is designed around one testable claim:

> Improve heavy-rainfall forecast skill on unseen events while making fewer harmful changes than a system that corrects every forecast.

## Why SPECTRA

The system treats selective intervention as a first-class decision. REPLACE, COMBINE, and KEEP ORIGINAL are all valid outcomes. High uncertainty, unsupported corrections, or out-of-distribution conditions should reduce intervention rather than force a change.

The primary success criterion defined for the project is heavy-rainfall CSI at the operational Heavy threshold on unseen events, compared with Raw NWP and the strongest non-selective ML baseline. Secondary evidence includes FSS, ETS, POD, FAR, RMSE, probability calibration, beneficial intervention, harmful intervention, and correct abstention.

## Key innovation

- **Regime awareness:** condition the correction on physically meaningful rainfall regimes rather than using one global correction.
- **Failure diagnosis:** predict likely occurrence, amount, location, structure, heavy-tail, and—when justified—timing failure.
- **Selective intervention:** use a leakage-safe challenger and support checks before changing the baseline.
- **Evidence before features:** require fair baselines, event-held-out validation, ablations, and uncertainty reporting before expanding the system.

## Outputs

The prototype is organized around a five-stage operational experience:

1. **Event / District** — select a historical event, district, forecast cycle, and lead time.
2. **Forecast Diagnosis** — identify the dominant regime and likely forecast failure.
3. **Before / After / Observation** — compare Raw NWP, candidate SPECTRA correction, observation, and difference.
4. **District Product** — translate the corrected field into district rainfall and heavy-rain risk.
5. **Verification** — compare models, thresholds, regimes, and intervention behavior.

<details>
<summary><strong>Open the product tour</strong></summary>

### Event context

<img src="Frontend/event_district_selection/screen.png" alt="SPECTRA event and district selection" width="960" />

### Forecast diagnosis

<img src="Frontend/02_forecast_diagnosis/screen.png" alt="SPECTRA forecast diagnosis" width="960" />

### District product

<img src="Frontend/district_product_split_workstation/screen.png" alt="SPECTRA district product" width="960" />

</details>

## Architecture

~~~mermaid
flowchart LR
    A[Raw GFS NWP] --> B[Forecast-time features]
    T[Terrain and season] --> B
    B --> C[Weather regime classifier]
    B --> D[Generic ML baseline]
    C --> E[Forecast failure model]
    D --> F[Regime-conditioned correction]
    E --> F
    F --> G[Leakage-safe challenger]
    G --> H[REPLACE / COMBINE / KEEP]
    H --> I[Rainfall and probability products]
    I --> J[Grid and district output]
    O[CHIRPS verification rainfall] --> K[Event-held-out verification]
    J --> K
~~~

The repository contains the interactive React/FastAPI prototype and versioned experiment configuration. The broader scientific pipeline is intentionally evaluated against Raw NWP, Quantile Mapping, Generic ML, Regime ML, and SPECTRA baselines before any final claim is made.

## Data sources

The zero-cost MVP is scoped to Maharashtra, with emphasis on Konkan and the Western Ghats:

- **Forecast:** NCEP GFS at 0.25° through public NOAA access.
- **Primary verification:** CHIRPS v3 daily rainfall, regridded consistently to the verification grid.
- **Optional supplementary rainfall:** NASA GPM IMERG when access and storage are manageable.
- **Terrain:** openly accessible DEM-derived elevation, slope, aspect, relief, coastline distance, and land/sea features.
- **Boundaries:** openly licensed administrative district boundaries with source and version recorded per run.

CHIRPS is a zero-cost verification reference, not a substitute for an official IMD or NCMRWF operational analysis. The MVP must state that limitation clearly.

## Environment setup

### Prerequisites

- Node.js 20+
- Python 3.10+
- npm

### Start the interactive prototype

~~~bash
cd App
npm install
npm run dev
~~~

Open http://localhost:5173.

### Start the API

In a second terminal:

~~~bash
cd Backend
python -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
~~~

Interactive API documentation: http://localhost:8000/api/docs

### Verify the frontend

~~~bash
cd App
npm run lint
npm run build
~~~

## Training

The scientific training path is event-first rather than random-row-first:

- freeze the event list before inspecting final results;
- keep forecast-time features separate from future observations;
- fit transformations and models only on the training events;
- generate out-of-fold predictions for challenger training;
- keep the final test events untouched until the final scorecard.

The first model family is intentionally CPU-first: LightGBM or XGBoost for tabular ML, scikit-learn for preprocessing, calibration, and metrics, and xarray/netCDF4/cfgrib/eccodes for scientific data.

## Inference

At forecast issue time, SPECTRA uses only available forecast-time information. It produces:

1. regime probabilities;
2. forecast-failure probabilities;
3. candidate corrected rainfall;
4. heavy-rain probability outputs;
5. correction confidence and support checks;
6. a selective REPLACE, COMBINE, or KEEP ORIGINAL decision;
7. grid and district-level products.

Future observations are used to create historical labels and evaluate the system—not as inference-time inputs.

## Evaluation

Required deterministic metrics:

- RMSE
- CSI
- ETS
- POD
- FAR
- FSS at multiple neighborhood scales

Required probabilistic and selective metrics include calibration, Brier score, reliability, beneficial intervention rate, harmful intervention rate, and correct abstention rate. Results must be reported by threshold, regime, event, and geographic stress test where applicable.

## Results

This public showcase currently presents a working prototype interface and seeded demonstration workflows. It does not claim validated scientific performance. Any future result must be labelled as one of:

- VALIDATED_ON_HELD_OUT_REAL_DATA
- PROTOTYPE_INTERNAL_VALIDATION
- SYNTHETIC_UI_DEMONSTRATION

No invented accuracy, nationwide validation, operational readiness, or unsupported confidence interpretation should be reported.

## Reproducibility

A credible run should preserve:

- dataset versions and download timestamps;
- forecast and observation source metadata;
- random seeds;
- train/validation/test event manifests;
- frozen thresholds and feature lists;
- exact scorecard command;
- model version or checksum where practical;
- limitations and uncertainty notes.

The repository configuration files are the public reproducibility surface. Private planning material is intentionally excluded from version control.

## Demo

The preferred demonstration is a local event replay with a frozen package. A screen recording is the backup when connectivity is unavailable, and screenshots of the event replay, verification scorecard, district report, and README provide a stable fallback.

The intended evaluator journey is:

~~~text
Problem → Idea → Working prototype → Real event → Fair baselines
        → Heavy-rain evidence → Safe intervention → ₹0 feasibility
~~~

## Limitations

- The MVP begins with a focused Maharashtra testbed, not all of India.
- CHIRPS is a gridded satellite-plus-station estimate and can miss local extremes or complex-terrain effects.
- Prototype values are not scientific results.
- The system must not be called production-ready until deployment, monitoring, data freshness, and operational validation exist.
- A correction must not be described as a future-error oracle; it predicts likely failure from forecast-time information.

## Future scope

1. Expand from the Maharashtra testbed to additional Indian rainfall regimes.
2. Add and recalibrate geography-dependent features.
3. Repeat event-held-out testing for each expanded domain.
4. Add higher-priority official verification data when available.
5. Publish scorecards, ablations, intervention tables, and probability reliability plots before making stronger claims.

## Team

The work is organized around four responsibilities:

- **Data / Evaluation:** downloads, alignment, event extraction, splits, metrics, and scorecards.
- **Regime / Failure ML:** regime labels, classifier, failure-state labels, and predictor.
- **Correction / Decision:** Quantile Mapping, Generic ML, Regime ML, SPECTRA correction, challenger, and selective decision.
- **Product / Demo:** local app, maps, district table, event replay, reliability, and presentation assets.

## License

This repository is licensed under the [SPECTRA Showcase-Only License](LICENSE).

The code, documentation, visual designs, screenshots, models, data arrangements, and other project materials are provided solely for public showcase and evaluation. No permission is granted to copy, fork, clone, download, reproduce, modify, adapt, distribute, sublicense, sell, publish elsewhere, incorporate into another project, deploy, or use any part of SPECTRA in production or commercial work without prior written permission from the copyright holder.

GitHub hosting makes the repository visible for showcase purposes, but platform behavior cannot technically prevent viewing or forking. The license states the owner's restrictions; contact the owner for written permission.
