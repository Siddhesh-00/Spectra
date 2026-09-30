---
name: Synoptic Precision
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daef'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e1e8fd'
  surface-container-highest: '#dce2f7'
  on-surface: '#141b2b'
  on-surface-variant: '#444653'
  inverse-surface: '#293040'
  inverse-on-surface: '#edf0ff'
  outline: '#757684'
  outline-variant: '#c4c5d5'
  surface-tint: '#3755c3'
  primary: '#00288e'
  on-primary: '#ffffff'
  primary-container: '#1e40af'
  on-primary-container: '#a8b8ff'
  inverse-primary: '#b8c4ff'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#273548'
  on-tertiary: '#ffffff'
  tertiary-container: '#3e4c60'
  on-tertiary-container: '#aebcd4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c4ff'
  on-primary-fixed: '#001453'
  on-primary-fixed-variant: '#173bab'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#d5e3fc'
  tertiary-fixed-dim: '#b9c7df'
  on-tertiary-fixed: '#0d1c2e'
  on-tertiary-fixed-variant: '#3a485b'
  background: '#f9f9ff'
  on-background: '#141b2b'
  surface-variant: '#dce2f7'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.5rem
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '600'
    lineHeight: 1.25rem
    letterSpacing: -0.005em
  headline-sm:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: 1.125rem
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.25rem
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: 1.125rem
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: 1rem
    letterSpacing: 0em
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 0.8125rem
    fontWeight: '500'
    lineHeight: 1rem
    letterSpacing: -0.02em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: 0.875rem
    letterSpacing: -0.01em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 0.6875rem
    fontWeight: '400'
    lineHeight: 0.75rem
    letterSpacing: 0em
  metric-display:
    fontFamily: JetBrains Mono
    fontSize: 1.5rem
    fontWeight: '700'
    lineHeight: 1.75rem
    letterSpacing: -0.03em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 0.5rem
  margin: 0.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style
The design system embodies an institutional, mission-critical meteorological workspace engineered for national hydrometeorological agencies, research laboratories, and operational flood decision-support centers. The operational environment demands sustained situational clarity over 12-hour shifts without ocular fatigue, cognitive overload, or visual ambiguity. 

The aesthetic is strictly **Instrumental Utilitarian**: 
- High information density with absolute visual stability.
- Zero decorative gradients, drop shadows, neon accents, or novelty micro-interactions.
- Crisp, physical panel structures referencing scientific measurement instrumentation and professional GIS cartography tools.
- Strict division between situational operational UI and raw, uninhibited multi-spectral radar/sensor visual data.

## Colors
The system relies on an institutional light mode foundation designed for high-lumen command center monitors, ensuring daylight readability and strict compliance with cartographic legibility standards.

### Core Canvas & Structure
- **Base Canvas (`#FFFFFF`)**: Primary application background for data grids, map viewports, and primary panels.
- **Secondary Surface (`#F3F4F6`)**: Workstation toolbars, sidebars, dock headers, and inspector frames.
- **Tertiary Surface (`#E5E7EB`)**: Inset telemetry trays, inactive tabs, and pressed control surfaces.
- **Structural Border (`#D1D5DB`)**: Uniform 1px boundaries dividing all panes and data cells.
- **Subtle Hairline (`#E5E7EB`)**: Internal list delimiters and sub-panel dividers.

### Typography Hierarchy
- **Text Primary (`#111827`)**: Highest legibility for titles, critical coordinates, and operational values.
- **Text Secondary (`#4B5563`)**: Labels, metadata, units of measure, and axis titles.
- **Text Disabled/Muted (`#9CA3AF`)**: Out-of-bounds metrics, offline sensor tags, and inactive states.

### Status & Verification Tokens
- **Operational Pass / Calibrated (`#059669`)**: Error-correction validated, telemetry nominal.
- **Advisory / Moderate Alert (`#2563EB`)**: Baseline precipitation accumulation, system actively synchronizing.
- **Warning / Divergent Telemetry (`#D97706`)**: Discrepancy detected between radar and ground rain gauges.
- **Severe / Critical Precipitation (`#B91C1C`)**: Exceedance thresholds, catastrophic flash flood risks, hardware failure.

### Meteorological Precipitation Isohyet Palette (Data Visualization Only)
Reserved exclusively for raster rain-rate overlays and precipitation accumulation vectors:
- `0.1 – 2.5 mm/h`: `#93C5FD` (Trace / Light Stratiform)
- `2.5 – 10.0 mm/h`: `#2563EB` (Moderate Rain)
- `10.0 – 25.0 mm/h`: `#059669` (Heavy Rain)
- `25.0 – 50.0 mm/h`: `#F59E0B` (Intense Convective)
- `50.0 – 100.0 mm/h`: `#DC2626` (Severe Torrential)
- `> 100.0 mm/h`: `#7C3AED` (Extreme Precipitation / Hail Core)

## Typography
The system employs a dual-engine typographic framework designed for cognitive ergonomics and precision scanning.

1. **System Interface Engine (`Inter`)**: Applied across structural UI elements, contextual menus, alert narratives, column headers, and administrative settings. It prioritizes unadorned structural clarity and open aperture legibility at small scale.
2. **Telemetry & Instrument Engine (`JetBrains Mono`)**: Strict, non-negotiable rule: **All numerical data, geographic coordinates, UTC timestamps, hex identifiers, sensor IDs, uncertainty metrics, and GIS layer scales must render in `JetBrains Mono`**. Monospaced alignment prevents tabular jitter when real-time feeds refresh at sub-second intervals.

All typography scales down to 11px (`0.6875rem`) for dense GIS attribute tables and timeline scrubbers without illegibility.

## Layout & Spacing
The layout operates on an uncompromising 8px baseline grid (with a strict 4px micro-subdivision for toolbars and compact indicators) tailored for dense workstation multi-monitor configurations (1080p, 1440p, 4K).

### Spatial Philosophy
- **Tiled Multi-Pane Architecture**: Avoid loose floating layouts or arbitrary whitespace. The interface operates as a locked, modular grid of dockable frames (Cartographic Viewport, Temporal Timeline, Hyetograph Inspector, Sensor Calibration Matrix).
- **Gutterless / Flush Docking**: Major operational panels sit flush against each other, bounded by exact 1px `#D1D5DB` borders to optimize screen real estate.
- **Component Density**: Inner component padding never exceeds `1rem` (`16px`). Table rows are locked to standard 24px and 28px heights for maximum vertical data throughput.
- **Viewport Adaptation**: 
  - *Large Multi-display Operations (≥ 1920px)*: Permanent 3-column configuration: Left Geospatial Layer Controller (280px), Central Primary GIS Map/Analysis Pane (Fluid), Right Synoptic Matrix & Error Curve Inspector (380px), Bottom Scrubbable Timeline (180px fixed).
  - *Field Workstation / Laptop (1024px – 1919px)*: Collapsible left and right docks into 40px vertical icon-rails. Central workspace maintains absolute operational primacy.

## Elevation & Depth
This design system rejects skeuomorphic shadows, ambient blurs, and pseudo-3D elevations. Operational software must maintain predictable edge definition under changing ambient room illumination.

### The Border-Plane Hierarchy
Depth is communicated strictly via **Tonal Layering** and **1px Boundary Dividers**:
- **Layer 0 (Base Data Surface)**: `#FFFFFF`. The underlying canvas for GIS tiles, spatial contours, and primary data charts.
- **Layer 1 (Structural Toolbars & Inset Trays)**: `#F3F4F6`. Bordered by a crisp `1px solid #D1D5DB`. Houses controls, layer switchers, and tabular headers.
- **Layer 2 (Transient Overlays & Precision Popovers)**: `#FFFFFF` bounded by `1px solid #9CA3AF` with an ultra-tight, non-diffused technical shadow: `0px 2px 4px rgba(0, 0, 0, 0.08)`. Never use large ambient blurs.
- **Layer 3 (Modal Emergency Warnings)**: Centered structural dialogs with a solid high-contrast border (`1px solid #111827`) overlaid on a 30% alpha neutral scrim (`rgba(17, 24, 39, 0.3)`).

## Shapes
The visual form factor is clinical, restrained, and angular.
- **Corner Radii**: Standard components (buttons, input fields, badges, panel tabs) utilize a strict 4px radius (`0.25rem`). 
- **Containers & Split Panels**: 0px radius. Outer frame edges join seamlessly at 90-degree right angles against screen perimeters and neighboring dock boundaries.
- **Data Points & Gauge Indicators**: Sharp geometric primitives (squares, diamonds, triangles, and circles) without border-radius distortion, ensuring precise alignment on GIS raster maps and error graphs.

## Components

### Buttons & Action Controls
- **Primary Operational Button**: Background `#1E40AF`, text `#FFFFFF`, border `1px solid #1E3A8A`. Hover: `#1D4ED8`. Active: `#172554`. Height: 28px (compact) or 32px (standard). Padding: 0 12px. Font: Inter 13px weight 500.
- **Secondary / Panel Button**: Background `#FFFFFF`, text `#111827`, border `1px solid #D1D5DB`. Hover: `#F3F4F6`, border `#9CA3AF`.
- **Destructive / Override**: Background `#B91C1C`, text `#FFFFFF`, border `1px solid #991B1B`. Hover: `#DC2626`.
- **Toggle Group (Segmented Rail)**: Integrated 28px high container with `#F3F4F6` fill and `#D1D5DB` border. Inactive items have no border and `#4B5563` text; active item has `#FFFFFF` fill, 1px `#D1D5DB` border, `#111827` text with weight 600.

### Data Tables & Synoptic Attribute Matrices
- **Header**: Height 24px, background `#F3F4F6`, border-bottom `1px solid #D1D5DB`. Text: JetBrains Mono 11px, uppercase, `#4B5563`.
- **Rows**: Fixed height 26px, border-bottom `1px solid #E5E7EB`. Alternating zebra tinting (`#FFFFFF` to `#F9FAFB`).
- **Cell Alignment**: Numerical data right-aligned; timestamps and coordinates centered; metadata left-aligned. Values must use JetBrains Mono.

### Status Badges & Telemetry Chips
- Non-pill structure: 4px border radius. Padding: 1px 6px.
- Height: 18px. Font: JetBrains Mono 11px, weight 500.
- **Nominal (Calibrated)**: Background `#ECFDF5`, text `#065F46`, border `1px solid #A7F3D0`.
- **Correction Applied**: Background `#EFF6FF`, text `#1E40AF`, border `1px solid #BFDBFE`.
- **Warning (Gauge Drift)**: Background `#FFFBEB`, text `#92400E`, border `1px solid #FDE68A`.
- **Critical (Sensor Failure)**: Background `#FEF2F2`, text `#991B1B`, border `1px solid #FECACA`.

### Form Fields & Coordinate Inputs
- Height: 28px. Background `#FFFFFF`. Border: `1px solid #D1D5DB`.
- Active/Focus: `1px solid #1E40AF` with zero glow ring (no focus-ring offset shadows).
- Font: JetBrains Mono 12px for numerical/coordinate inputs; Inter 12px for descriptive inputs.

### Temporal Scrubbing Timeline & Playback Controller
- Fixed docking at the workspace base.
- Scrub bar height: 32px with 1px tick marks every 10-minute UTC interval.
- Playhead: 1px solid vertical line in `#B91C1C` with an inverted triangle thumb (6px width).
- Keyframe Indicators: 4px x 4px square markers denoting physical satellite sweep vs. radar composite vs. automated rain-gauge calibration points.

### Scientific Legend Strip
- Linear continuous or discrete stepped color bar (height: 8px) with 1px border `#D1D5DB`.
- Numerical labels positioned directly below transition ticks in JetBrains Mono 10px `#4B5563`.