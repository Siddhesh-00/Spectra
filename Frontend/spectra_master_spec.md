# SPECTRA — MASTER DESIGN SPECIFICATION

> **REFERENCE DOCUMENT ONLY — DO NOT GENERATE A SCREEN FROM THIS DOCUMENT.**
>
> Use this specification as persistent product, UX, visual, terminology, and architecture context for every SPECTRA screen generated afterward.
>
> All generated screens must follow this specification.

---

## 1. PRODUCT IDENTITY

**Product name:** SPECTRA

**Technical expansion:** Synoptic Precipitation Error Correction & Temporal Rainfall Analysis

SPECTRA is a rainfall forecast post-processing and decision-support system.

Its purpose is to:
- identify the prevailing weather pattern / regime,
- identify likely rainfall forecast failure,
- propose a suitable correction,
- estimate heavy rainfall risk,
- produce district-level rainfall information,
- verify forecast performance.

The product must remain tightly focused on the rainfall post-processing problem.

### Visible product name

Display only:

**SPECTRA**

Do not display “SPECTRA 4.1” as the product name.

---

## 2. PRIMARY PRODUCT STRUCTURE

SPECTRA has exactly **five primary screens**:

1. Event / District Selection
2. Forecast Diagnosis
3. Before / After / Observation
4. District Product
5. Verification

Do not create additional primary dashboards or products.

The following are **supporting sections, states, or interactions inside these five screens**, not separate primary pages:

- Weather Pattern
- Likely Failure
- Correction
- Decision
- Safety / Support
- Rain Risk
- Smart Decision
- Public Forecast
- Citizen Dashboard
- Emergency Management
- Data Dashboard
- Model Dashboard

---

## 3. CORE USER WORKFLOW

**SELECT EVENT / DISTRICT**  
↓  
**SEE ORIGINAL NWP**  
↓  
**SEE WEATHER PATTERN**  
↓  
**SEE LIKELY FAILURE**  
↓  
**SEE CANDIDATE CORRECTION**  
↓  
**SEE SAFETY / SUPPORT**  
↓  
**SEE CHANGE / COMBINE / KEEP**  
↓  
**COMPARE WITH OBSERVATION**  
↓  
**SEE DISTRICT RAINFALL + RISK**  
↓  
**VERIFY**

The five screens must feel like one continuous analytical application rather than unrelated dashboards.

---

## 4. VISUAL CHARACTER

SPECTRA should feel like:
- professional meteorological operations software,
- scientific GIS software,
- institutional forecasting software,
- operational decision-support software.

It must **not** feel like:
- startup SaaS,
- futuristic AI product,
- hackathon interface,
- vibe-coded dashboard,
- gaming interface,
- marketing website,
- glassmorphism,
- neon interface,
- glowing AI interface,
- excessive gradients,
- generic dashboard template.

Desired qualities:
- Precise
- Scientific
- Institutional
- Calm
- Operational
- Credible
- Data-driven

---

## 5. VISUAL SYSTEM

Light mode.

Background: `#FFFFFF`  
Secondary background: `#F3F4F6`  
Borders: `#D1D5DB`  
Primary text: `#111827`  
Secondary text: `#4B5563`

Functional colors:
- Normal / Moderate: muted blue
- Warning: `#D97706`
- Severe: `#B91C1C`
- Pass / Supported: `#059669`

Use professional meteorological rainfall colors for rainfall maps.

Do not use neon colors, purple “AI” gradients, or glow effects.

---

## 6. TYPOGRAPHY

Use Inter, Roboto, or Helvetica.

Use normal proportional typography for headings, labels, navigation, explanations, and descriptions.

Use monospace **only** for:
- rainfall measurements,
- probabilities,
- coordinates,
- timestamps,
- model metrics,
- verification tables,
- numerical outputs.

Do not make the entire interface monospace.

---

## 7. LAYOUT

Primary target: **1440 × 900**

Also support: **1280 × 800**

Use:
- strict grid,
- high information density,
- clear hierarchy,
- 8px spacing system,
- 4–6px maximum corner radius,
- 1px borders,
- minimal shadows.

The interface should feel dense like professional scientific software without becoming cluttered.

---

## 8. CLUTTER CONTROL

This is a high-priority design rule.

Do not fill the interface with cards.

Prefer:
- analytical sections,
- aligned rows,
- compact metric blocks,
- tables,
- map panels,
- dividers,
- restrained status indicators.

Avoid:
- floating card walls,
- repeated information,
- duplicate metrics,
- decorative statistics,
- excessive labels,
- excessive badges,
- excessive icons,
- giant KPI tiles,
- multiple competing charts,
- decorative illustrations,
- unnecessary helper text.

Every visible element should directly help answer:
1. What is happening?
2. What may be wrong?
3. What did SPECTRA change?
4. Should the change be trusted?
5. What happened at district level?
6. Did the correction improve the forecast?

If an element does not help answer one of these questions, remove it.

---

## 9. APPLICATION SHELL

### Sidebar

Display:

**SPECTRA**

Rainfall Forecast Intelligence

Navigation:
- 01 Event / District
- 02 Forecast Diagnosis
- 03 Before / After
- 04 District Product
- 05 Verification

Do not add more primary navigation items.

### Top bar

Keep compact.

Show:
- Current Event
- Date
- Forecast Cycle
- Lead Time
- Region

Do not add unrelated information.

---

## 10. DATA INTEGRITY

For prototype or placeholder data, clearly display:

**DEMO DATA — NOT SCIENTIFIC PERFORMANCE**

When real held-out validation data is connected, use:

**VALIDATED ON HELD-OUT DATA**

Never imply that placeholder values represent real scientific performance.

Do not invent scientific claims.

---

## 11. DECISION STATES

SPECTRA supports three decision states:
- **CHANGE FORECAST**
- **COMBINE**
- **KEEP ORIGINAL**

These are application states, not pages.

Use the same decision component consistently throughout the product.

### KEEP ORIGINAL

Possible supporting information:
- Past Support — LIMITED
- Unusual Conditions — YES
- Confidence — LOW

Example explanation:

“SPECTRA kept the original forecast because the correction was not sufficiently supported.”

### COMBINE

Show:
- Original Forecast
- SPECTRA Candidate
- Final Forecast

### CHANGE

Show:
- Original Forecast
- SPECTRA Forecast

---

## 12. MAP RULES

Maps are analytical objects, not decoration.

All rainfall maps for the same event must use consistent:
- geographic extent,
- zoom,
- district boundaries,
- rainfall scale,
- legend structure.

On the Before / After / Observation screen, the three primary maps must be directly comparable.

Map controls should be minimal.

Do not use decorative weather illustrations.

---

## 13. DETAIL INTERACTIONS

Deeper information should use drawers rather than additional primary pages.

Examples:
- Click **Weather Pattern** → open evidence drawer.
- Click **Likely Failure** → open diagnosis drawer.
- Click **Correction** → open correction details.
- Click **District** → open district detail drawer.
- Click **Technical Details** → open technical information drawer.

Do not create new primary screens for these interactions.

---

## 14. SCREEN 01 — EVENT / DISTRICT SELECTION

### Purpose
Select the rainfall event to analyze.

### Title
**Event / District Selection**

### Controls
- Date
- Forecast Cycle
- Region
- District
- Lead Time

### Available Events
Use one compact table.

Columns:
- Date
- Region
- District
- Peak Rainfall
- Lead Time
- Status

Use realistic-looking DEMO DATA only.

### Selected Event
Show:
- Date
- Region
- District
- Forecast Cycle
- Lead Time

Include a small rainfall map preview with:
- district boundaries,
- rainfall field,
- selected district highlighted.

### Data Availability
Show only:
- Original NWP
- Observation
- District Data

### Primary action
**CONTINUE →**

Do not add weather charts, temperature, wind, humidity, large KPI cards, news, emergency management, unrelated analytics, or large methodology panels.

---

## 15. SCREEN 02 — FORECAST DIAGNOSIS

### Purpose
Communicate:
- What weather pattern is occurring?
- What is likely wrong with the raw NWP?
- What correction is proposed?
- What decision does SPECTRA make?

### Title
**Forecast Diagnosis**

### Diagnostic strip

Use four compact analytical sections:

**WEATHER PATTERN**  
Active Monsoon — 62%

**LIKELY FAILURE**  
Amount + Location

**CORRECTION**  
+18% Intensity  
Small Spatial Shift

**DECISION**  
COMBINE

These should not be giant dashboard cards.

### Main map

Large rainfall map titled:

**Original NWP**

Show:
- rainfall field,
- district boundaries,
- selected district,
- rainfall legend,
- minimal controls.

### Diagnostic panel

**Weather Pattern**
- Active Monsoon
- 62%

**Likely Failure**
- Amount — High
- Location — High
- Heavy Rainfall — High

**Correction**
- Increase Intensity
- Small Spatial Adjustment

**Safety / Support**
- Past Support — PASS
- Unusual Conditions — NO
- Confidence — HIGH

### Decision

Show:

**Decision — COMBINE**

Then:
- Original Forecast — XX mm
- SPECTRA Candidate — XX mm
- Final Forecast — XX mm

Use one short explanatory sentence only.

### Primary action
**CONTINUE TO COMPARISON →**

Do not add multiple maps, KPI walls, AI chatbot, unrelated weather widgets, temperature, wind, humidity, emergency controls, or unrelated analytics.

---

## 16. SCREEN 03 — BEFORE / AFTER / OBSERVATION

### Purpose

Provide the main visual comparison:

**Original NWP vs SPECTRA vs Observation**

### Title

**Before / After / Observation**

### Main map grid

Three synchronized maps:

**ORIGINAL NWP**  
Raw Forecast

**SPECTRA**  
Corrected Forecast

**OBSERVATION**  
Observed Rainfall

All three must have:
- identical geographic extent,
- identical zoom,
- identical district boundaries,
- identical rainfall scale,
- consistent legend structure.

### Difference map

One smaller analytical panel:

**SPECTRA − NWP**

Use a compact difference map.

### Comparison summary

- Original — XX mm
- SPECTRA — XX mm
- Observed — XX mm

Use monospace for numerical values.

### What Changed

- Intensity
- Location
- Heavy Rainfall Area

### Decision

Show:

**CHANGE / COMBINE / KEEP**

### District impact preview

Small row/table:
- District
- Rainfall
- Heavy Risk
- Decision

### Primary action

**CONTINUE TO DISTRICT PRODUCT →**

Do not add extra charts, KPI cards, unrelated weather variables, emergency information, large narratives, duplicated metrics, or decorative graphics.

The maps are the visual priority.

---

## 17. SCREEN 04 — DISTRICT PRODUCT

### Purpose

Convert the corrected rainfall grid into a district-level rainfall and risk product.

### Title

**District Product**

### Main map

Large Maharashtra district map.

Show:
- district boundaries,
- rainfall values,
- selected district,
- rainfall legend.

Layer selector:
- SPECTRA Rainfall
- Heavy Risk
- Very Heavy Risk
- Extreme Risk

Use one map. Do not create four separate maps.

### Selected District

Compact section:

**Selected District**

Raigad

Expected Rainfall — XX mm

Heavy — XX%

Very Heavy — XX%

Extreme — XX%

Decision — CHANGE

Confidence — HIGH

Use monospace for numerical values.

### District table

Title:

**District Priority**

Columns:
- District
- Rainfall
- Heavy
- Very Heavy
- Extreme
- Decision

Keep rows compact.

Highlight the selected district.

### District details

Use **View Details** to open a drawer containing:
- district rainfall,
- risk probabilities,
- decision,
- confidence,
- original vs SPECTRA value.

Do not create another full screen.

### Primary action

**CONTINUE TO VERIFICATION →**

Do not add emergency management, resource allocation, rescue coordination, public complaint systems, contact directories, warning communication systems, citizen dashboards, or unrelated government workflows.

---

## 18. SCREEN 05 — VERIFICATION

### Visible page title

**Forecast Accuracy**

### Purpose

Show whether SPECTRA improves rainfall forecast performance.

### Filter bar
- Threshold
- Weather Pattern
- Lead Time
- Region
- Period

### Model comparison

Compare:
- Raw NWP
- Quantile Mapping
- Generic ML
- Regime ML
- SPECTRA

### Metric selector
- RMSE
- ETS
- CSI
- POD
- FAR
- FSS

### Main chart

Show the selected metric across the five approaches.

Use a clean scientific chart.

### Heavy Rain Performance

Compact section for the selected heavy-rain threshold.

### Performance by Weather Pattern

Show:
- Active Monsoon
- Break Monsoon
- Monsoon Low / Depression
- Coastal
- Orographic
- Western Disturbance

Allow selection of a weather pattern and show the selected verification metric.

### Correction Impact

**DID THE CORRECTION HELP?**

- Helpful Changes — XX%
- Harmful Changes — XX%
- Correctly Kept Original — XX%

Values must come from real evaluation data when available.

### Data integrity

Prototype:

**DEMO DATA — NOT SCIENTIFIC PERFORMANCE**

Real held-out evaluation:

**VALIDATED ON HELD-OUT DATA**

Do not add model architecture diagrams, training dashboards, hyperparameter controls, data engineering metrics, unrelated weather variables, decorative AI visuals, giant KPI cards, fake accuracy percentages, or unsupported improvement claims.

---

## 19. GLOBAL APPLICATION STATE

All five screens must use the same selected event.

When the user selects:
- Date
- Forecast Cycle
- Region
- District
- Lead Time

that selection becomes global application state.

Every subsequent screen must reflect the same event.

Keep consistent:
- Event
- District
- Region
- Date
- Forecast Cycle
- Lead Time
- Weather Pattern
- Likely Failure
- Correction
- Decision

unless the selected event changes.

---

## 20. THRESHOLD BEHAVIOR

When a heavy-rainfall threshold changes, update:
- Heavy Risk
- Very Heavy Risk
- Extreme Risk

in the District Product.

Keep the same selected event.

---

## 21. FINAL INFORMATION HIERARCHY

The strongest concepts are:

1. WEATHER PATTERN
2. LIKELY FAILURE
3. CORRECTION
4. DECISION
5. OBSERVATION
6. DISTRICT RAINFALL + RISK
7. FORECAST ACCURACY

Everything else is secondary.

---

## 22. FINAL QUALITY BAR

The product must communicate one simple story:

**SELECT**  
→ **DIAGNOSE**  
→ **CORRECT**  
→ **COMPARE**  
→ **DISTRICT**  
→ **VERIFY**

The evaluator should understand what SPECTRA does within seconds.

SPECTRA should look like professional meteorological workstation software, not a generic AI dashboard.

Before adding any component, ask:

> Does this directly help explain rainfall forecast diagnosis, correction, district risk, or verification?

If not, remove it.

Do not add new primary screens or unrelated features after this specification.
