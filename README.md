<div align="center">
    
# SPECTRA

### Rainfall forecast intelligence for diagnosing, correcting, and verifying heavy-rain events

[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)](https://vite.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Leaflet](https://img.shields.io/badge/Maps-Leaflet-199900?logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![Prototype](https://img.shields.io/badge/status-prototype-f59e0b)](#data-status)

**Diagnose. Repair. Verify. Decide.**

SPECTRA is an evaluator-ready prototype for regime-aware numerical weather prediction (NWP) error correction. It turns a rainfall event into a traceable five-stage workflow: establish context, diagnose forecast failure, compare candidate corrections, produce district guidance, and verify model skill.

[Explore the workflow](#how-it-works) · [Run locally](#quick-start) · [View the API](#api-surface)

</div>

> [!WARNING]
> The current UI is a prototype replay using seeded demonstration data. It is designed to make the workflow inspectable—not to provide operational weather guidance or claim scientific performance.

## Why SPECTRA?

Raw precipitation forecasts often fail in more than one way: the event may be displaced, the intensity may be under-called, or the heavy-rain tail may be too weak. SPECTRA makes those failure modes explicit before suggesting a correction.

| Capability | What it provides |
| --- | --- |
| **Event replay** | Select historical rainfall cases by date, district, lead time, and weather pattern. |
| **Failure diagnosis** | Surface likely amount, location, structure, and heavy-tail errors with confidence. |
| **Regime-aware correction** | Compare the original forecast with a candidate SPECTRA correction and held-out observation. |
| **District products** | Translate a corrected rainfall field into district-level totals, thresholds, and decisions. |
| **Verification** | Compare Raw NWP, statistical correction, generic ML, regime ML, and SPECTRA metrics. |
| **Reproducibility** | Keep thresholds, splits, features, seeds, and experiment settings in versioned config files. |

## Product tour

The interface is intentionally built as an operational workstation rather than a single dashboard. Each stage leaves an auditable hand-off for the next stage.

<details>
<summary><strong>01 — Establish event context</strong></summary>

Choose the historical event, forecast cycle, lead time, region, and district. The preview shows data availability and the observed rainfall context before any correction is considered.

<img src="Frontend/event_district_selection/screen.png" alt="SPECTRA event and district selection screen" width="960" />

</details>

<details>
<summary><strong>02 — Diagnose the forecast</strong></summary>

Classify the dominant weather regime, identify likely NWP failure modes, and review the proposed correction with safety and support checks.

<img src="Frontend/02_forecast_diagnosis/screen.png" alt="SPECTRA forecast diagnosis screen" width="960" />

</details>

<details>
<summary><strong>03 — Compare before and after</strong></summary>

Inspect synchronized raw NWP, corrected SPECTRA, observation, and difference views. The comparison is designed to make spatial shifts and intensity changes easy to interrogate.

</details>

<details>
<summary><strong>04 — Produce the district product</strong></summary>

Translate the corrected field into district-level rainfall and threshold probabilities, then sort the product by priority for decision support.

<img src="Frontend/district_product_split_workstation/screen.png" alt="SPECTRA district product screen" width="960" />

</details>

<details>
<summary><strong>05 — Verify model skill</strong></summary>

Compare ETS, CSI, POD, FAR, FSS, and RMSE across models and rainfall thresholds. The prototype labels its seeded metrics as synthetic so they cannot be mistaken for held-out scientific results.

</details>

## How it works

~~~mermaid
flowchart LR
    A[Historical event] --> B[Forecast context]
    B --> C[Regime classifier]
    C --> D[Failure diagnosis]
    D --> E[Candidate correction]
    E --> F[District aggregation]
    F --> G[Verification]
    G --> H[Auditable decision]

    N[NOAA GFS] --> B
    O[CHIRPS / observations] --> G
    CFG[Versioned YAML configs] --> C
    CFG --> D
    CFG --> E
    CFG --> G
~~~

## Architecture

~~~text
Spectra-69/
├── App/                 React + Vite SPA, Leaflet maps, Chart.js analytics
│   ├── src/screens/     Five workflow stages
│   ├── src/components/  Layout, cards, badges, workflow primitives
│   └── src/services/    Frontend → FastAPI service layer
├── Backend/             FastAPI service with demo-ready seed data
│   ├── routers/         Events, forecast, correction, district, verification
│   └── db/              Supabase schema and production integration path
├── configs/             Frozen experiment, threshold, feature, and split config
├── src/                 ML pipeline package scaffold
├── Frontend/            Design references and workflow screenshots
├── data/                Local raw/processed data (gitignored)
├── models/              Local model artifacts (gitignored)
└── outputs/             Generated maps, tables, and reports (gitignored)
~~~

## Quick start

### Prerequisites

- Node.js 20+
- Python 3.10+
- npm

### 1. Start the React application

~~~bash
cd App
npm install
npm run dev
~~~

Open [http://localhost:5173](http://localhost:5173). The UI includes local fallback data, so it can be explored without a database or API key.

### 2. Start the FastAPI backend

In a second terminal:

~~~bash
cd Backend
python -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
~~~

The interactive API documentation is available at [http://localhost:8000/api/docs](http://localhost:8000/api/docs), and the health endpoint is [http://localhost:8000/api/health](http://localhost:8000/api/health).

### 3. Build and lint the frontend

~~~bash
cd App
npm run lint
npm run build
~~~

## API surface

| Method | Endpoint | Purpose |
| --- | --- | --- |
| <code>GET</code> | <code>/api/health</code> | Service health check |
| <code>GET</code> | <code>/api/events/</code> | List replayable rainfall events |
| <code>GET</code> | <code>/api/events/{event_id}</code> | Retrieve event details |
| <code>GET</code> | <code>/api/forecast/{event_id}</code> | Get regime and failure diagnosis |
| <code>GET</code> | <code>/api/correction/{event_id}</code> | Get candidate correction summary |
| <code>GET</code> | <code>/api/district/{event_id}</code> | Get district rainfall products |
| <code>GET</code> | <code>/api/district/{event_id}/{district_name}</code> | Get one district product |
| <code>GET</code> | <code>/api/district/search?q=...</code> | Search districts |
| <code>GET</code> | <code>/api/verification/{event_id}</code> | Get event verification output |
| <code>GET</code> | <code>/api/verification/metrics</code> | Compare model metrics |
| <code>GET</code> | <code>/api/verification/ablation</code> | Get ablation results |

## Data status

The demo path is deliberately zero-cost and self-contained:

- **Forecast source:** NOAA GFS 0.25°
- **Verification source:** CHIRPS v3 daily observations
- **Maps:** OpenStreetMap, OpenTopoMap, and optional Esri imagery layers
- **Storage:** local seeded data by default; Supabase integration is available as the production path
- **Model status:** prototype pipeline scaffold with synthetic UI demonstration values

Every demo number should be treated as SYNTHETIC_UI_DEMONSTRATION until it is replaced with a held-out real-data run. The frozen threshold, feature, split, and experiment configuration lives in [configs/](configs/).

## Rainfall thresholds

The prototype uses the following IMD-style categories, frozen in [configs/thresholds.yaml](configs/thresholds.yaml):

| Category | 24-hour rainfall |
| --- | ---: |
| Light / Moderate | <code>&lt; 35.5 mm</code> |
| Heavy | <code>64.5–115.5 mm</code> |
| Very Heavy | <code>115.6–204.4 mm</code> |
| Extremely Heavy | <code>≥ 204.5 mm</code> |

## Optional Supabase integration

The API runs without Supabase. For the production data path:

1. Create a free Supabase project.
2. Apply [Backend/db/schema.sql](Backend/db/schema.sql) in the SQL editor.
3. Copy [Backend/.env.example](Backend/.env.example) to Backend/.env.
4. Add the project URL and anonymous key.

Never commit real credentials. Environment files are ignored by Git.

## Reproducibility checklist

- [ ] Dataset versions recorded in the experiment manifest
- [ ] Rainfall thresholds frozen before final testing
- [ ] Feature list and train/validation/test events frozen
- [ ] Random seeds recorded
- [ ] No future-observation features used at inference time
- [ ] Final test set kept separate from tuning
- [ ] Results labelled as validated, prototype, or synthetic

## Contributing

Small, focused pull requests are welcome. Before opening one:

~~~bash
cd App
npm run lint
npm run build
~~~

For changes to the scientific workflow, update the relevant config or spec alongside the implementation and clearly label whether the result is validated on held-out real data or remains a prototype demonstration.

## License

No license file is currently included. Add a LICENSE before distributing the repository outside its intended project or evaluation context.

<div align="center">

Made for transparent rainfall forecast correction — with every correction explained before it is trusted.

</div>
