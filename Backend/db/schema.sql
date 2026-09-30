-- ============================================================
-- SPECTRA 4.1 — Supabase Schema
-- Section 36 (Folder Structure) + Section 20 (District Product)
-- + Section 27 (Verification) + Section 22 (Event Replay)
-- ============================================================
-- Run this in Supabase Dashboard > SQL Editor

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ── 1. WEATHER EVENTS ──────────────────────────────────────
-- Historical rainfall events used for replay & validation
create table if not exists events (
  id              uuid primary key default uuid_generate_v4(),
  event_id        text unique not null,           -- e.g. "MONSOON-DEP-07"
  event_date      date not null,
  region          text not null,                  -- e.g. "Maharashtra"
  district        text not null,                  -- e.g. "Raigad"
  forecast_cycle  text not null default '00 UTC', -- 00/06/12/18 UTC
  lead_time_hours integer not null default 24,
  model_source    text not null default 'GFS 0.25°',
  weather_pattern text,                           -- spec §8 regime classes
  peak_observed_rainfall_mm numeric(8,2),
  status          text default 'available'        -- available / selected
    check (status in ('available', 'selected')),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── 2. REGIME PREDICTIONS ──────────────────────────────────
-- Weather regime classifier outputs (spec §8)
create table if not exists regime_predictions (
  id                  uuid primary key default uuid_generate_v4(),
  event_id            text references events(event_id) on delete cascade,
  active_monsoon      numeric(5,4) check (active_monsoon between 0 and 1),
  break_monsoon       numeric(5,4) check (break_monsoon between 0 and 1),
  monsoon_low         numeric(5,4) check (monsoon_low between 0 and 1),
  coastal_rainfall    numeric(5,4) check (coastal_rainfall between 0 and 1),
  orographic          numeric(5,4) check (orographic between 0 and 1),
  western_disturbance numeric(5,4) check (western_disturbance between 0 and 1),
  dominant_regime     text,                        -- top-1 regime name
  model_version       text default 'lgbm-v1',
  created_at          timestamptz default now()
);

-- ── 3. FAILURE PREDICTIONS ─────────────────────────────────
-- Forecast failure mode predictor outputs (spec §9)
create table if not exists failure_predictions (
  id              uuid primary key default uuid_generate_v4(),
  event_id        text references events(event_id) on delete cascade,
  -- Failure dimensions (spec §9.1–9.5): LOW / MEDIUM / HIGH
  failure_occurrence  text check (failure_occurrence in ('LOW','MEDIUM','HIGH')),
  failure_amount      text check (failure_amount in ('LOW','MEDIUM','HIGH')),
  failure_location    text check (failure_location in ('LOW','MEDIUM','HIGH')),
  failure_structure   text check (failure_structure in ('LOW','MEDIUM','HIGH')),
  failure_tail        text check (failure_tail in ('LOW','MEDIUM','HIGH')),
  -- Numeric confidence scores 0–1
  confidence_occurrence  numeric(5,4),
  confidence_amount      numeric(5,4),
  confidence_location    numeric(5,4),
  confidence_structure   numeric(5,4),
  confidence_tail        numeric(5,4),
  model_version       text default 'lgbm-v1',
  created_at          timestamptz default now()
);

-- ── 4. CORRECTION OUTPUTS ──────────────────────────────────
-- Correction engine + decision layer results (spec §11, §15)
create table if not exists correction_outputs (
  id                    uuid primary key default uuid_generate_v4(),
  event_id              text references events(event_id) on delete cascade,
  district              text not null,
  -- Rainfall values (mm)
  original_nwp_mm       numeric(8,2),
  spectra_candidate_mm  numeric(8,2),
  final_forecast_mm     numeric(8,2),
  -- REPLACE / COMBINE / KEEP
  decision              text not null
    check (decision in ('REPLACE','COMBINE','KEEP_ORIGINAL')),
  blend_weight_spectra  numeric(5,4),             -- e.g. 0.62
  blend_weight_nwp      numeric(5,4),             -- e.g. 0.38
  -- Heavy-rain probabilities (spec §14)
  prob_heavy            numeric(5,4),             -- >64.5 mm
  prob_very_heavy       numeric(5,4),             -- >115.6 mm
  prob_extreme          numeric(5,4),             -- >=204.5 mm
  -- Safety checks (spec §17-19)
  correction_confidence text check (correction_confidence in ('HIGH','MEDIUM','LOW')),
  ood_status            text check (ood_status in ('NORMAL','WATCH','UNUSUAL')),
  correction_support    text check (correction_support in ('OK','MARGINAL','OUTSIDE')),
  -- Spatial correction
  spatial_shift_km      numeric(6,2),
  spatial_shift_direction text,
  intensity_change_pct  numeric(6,2),
  heavy_area_change_km2 numeric(8,2),
  model_version         text default 'lgbm-v1',
  created_at            timestamptz default now()
);

-- ── 5. DISTRICT PRODUCTS ───────────────────────────────────
-- Final district-level forecast product (spec §20)
create table if not exists district_products (
  id                uuid primary key default uuid_generate_v4(),
  event_id          text references events(event_id) on delete cascade,
  district          text not null,
  -- Rainfall stats from corrected grid
  mean_rainfall_mm  numeric(8,2),
  max_rainfall_mm   numeric(8,2),
  p90_rainfall_mm   numeric(8,2),
  -- Area fractions
  heavy_area_frac   numeric(5,4),
  very_heavy_area_frac numeric(5,4),
  extreme_area_frac numeric(5,4),
  -- Probabilities
  prob_heavy        numeric(5,4),
  prob_very_heavy   numeric(5,4),
  prob_extreme      numeric(5,4),
  -- Decision & metadata
  dominant_regime   text,
  decision          text check (decision in ('REPLACE','COMBINE','KEEP_ORIGINAL')),
  correction_confidence text,
  created_at        timestamptz default now(),
  unique(event_id, district)
);

-- ── 6. VERIFICATION METRICS ────────────────────────────────
-- All required SIH26080 metrics (spec §27)
create table if not exists verification_metrics (
  id              uuid primary key default uuid_generate_v4(),
  model_name      text not null,                  -- 'RAW_NWP','QM','GENERIC_ML','REGIME_ML','SPECTRA'
  threshold_name  text not null,                  -- 'HEAVY','VERY_HEAVY','EXTREME'
  threshold_mm    numeric(6,2),                   -- 64.5 / 115.6 / 204.5
  weather_pattern text,                           -- null = all regimes
  lead_time_hours integer,
  period_desc     text,                           -- e.g. '2024 Monsoon Season'
  n_cases         integer,
  -- Core metrics (spec §27.1)
  rmse            numeric(8,4),
  csi             numeric(8,4),
  ets             numeric(8,4),
  pod             numeric(8,4),
  far             numeric(8,4),
  fss_025deg      numeric(8,4),                  -- FSS at 0.25°
  fss_050deg      numeric(8,4),                  -- FSS at 0.50°
  fss_100deg      numeric(8,4),                  -- FSS at 1.00°
  -- Additional (spec §27.2)
  bias_me         numeric(8,4),
  mae             numeric(8,4),
  brier_score     numeric(8,4),
  -- Selective intervention (spec §27.2)
  beneficial_intervention_rate numeric(5,4),
  harmful_intervention_rate    numeric(5,4),
  correct_abstention_rate      numeric(5,4),
  intervention_coverage        numeric(5,4),
  -- Bootstrap uncertainty (spec §30)
  ci_lower_95     numeric(8,4),
  ci_upper_95     numeric(8,4),
  -- Meta
  data_label      text default 'SYNTHETIC_UI_DEMONSTRATION'
    check (data_label in (
      'VALIDATED_ON_HELD_OUT_REAL_DATA',
      'PROTOTYPE_INTERNAL_VALIDATION',
      'SYNTHETIC_UI_DEMONSTRATION'
    )),
  created_at      timestamptz default now()
);

-- ── 7. CONTINGENCY TABLE ───────────────────────────────────
-- Hits/misses/false alarms for model comparison (spec §27)
create table if not exists contingency_counts (
  id              uuid primary key default uuid_generate_v4(),
  model_name      text not null,
  threshold_name  text not null,
  weather_pattern text,
  hits            integer,      -- A: Obs Yes, Fcst Yes
  false_alarms    integer,      -- B: Obs No,  Fcst Yes
  misses          integer,      -- C: Obs Yes, Fcst No
  correct_rejections integer,   -- D: Obs No,  Fcst No
  total           integer,
  created_at      timestamptz default now()
);

-- ── 8. ABLATION RESULTS ────────────────────────────────────
-- Ablation study A–F (spec §25)
create table if not exists ablation_results (
  id              uuid primary key default uuid_generate_v4(),
  ablation_id     text not null,   -- 'A','B','C','D','E','F'
  description     text,
  model_variant   text,
  csi_heavy       numeric(8,4),
  fss_heavy       numeric(8,4),
  rmse            numeric(8,4),
  ets             numeric(8,4),
  beneficial_rate numeric(5,4),
  harmful_rate    numeric(5,4),
  notes           text,
  created_at      timestamptz default now()
);

-- ── 9. EXPERIMENT MANIFESTS ────────────────────────────────
-- Reproducibility lock (spec §47)
create table if not exists experiment_manifests (
  id              uuid primary key default uuid_generate_v4(),
  experiment_id   text unique not null,
  nwp_source      text default 'GFS 0.25°',
  observation_source text default 'CHIRPS v3 daily',
  geographic_domain  text default 'Maharashtra / Konkan + Western Ghats',
  lead_times      text[],                         -- array of lead times
  train_period    text,
  validation_period text,
  test_period     text,
  feature_config  jsonb,
  threshold_config jsonb,
  random_seed     integer,
  python_version  text,
  package_versions jsonb,
  created_at      timestamptz default now()
);

-- ── INDEXES ────────────────────────────────────────────────
create index if not exists idx_events_event_id       on events(event_id);
create index if not exists idx_events_event_date     on events(event_date);
create index if not exists idx_regime_event_id       on regime_predictions(event_id);
create index if not exists idx_failure_event_id      on failure_predictions(event_id);
create index if not exists idx_correction_event_id   on correction_outputs(event_id);
create index if not exists idx_district_event_id     on district_products(event_id);
create index if not exists idx_district_district     on district_products(district);
create index if not exists idx_metrics_model         on verification_metrics(model_name);
create index if not exists idx_metrics_threshold     on verification_metrics(threshold_name);
create index if not exists idx_metrics_pattern       on verification_metrics(weather_pattern);

-- ── ROW LEVEL SECURITY (RLS) ───────────────────────────────
-- Enable for all tables — start with open read access for demo
alter table events                  enable row level security;
alter table regime_predictions      enable row level security;
alter table failure_predictions     enable row level security;
alter table correction_outputs      enable row level security;
alter table district_products       enable row level security;
alter table verification_metrics    enable row level security;
alter table contingency_counts      enable row level security;
alter table ablation_results        enable row level security;
alter table experiment_manifests    enable row level security;

-- Public read-only policy for all tables (demo mode)
create policy "Public read access" on events                  for select using (true);
create policy "Public read access" on regime_predictions      for select using (true);
create policy "Public read access" on failure_predictions     for select using (true);
create policy "Public read access" on correction_outputs      for select using (true);
create policy "Public read access" on district_products       for select using (true);
create policy "Public read access" on verification_metrics    for select using (true);
create policy "Public read access" on contingency_counts      for select using (true);
create policy "Public read access" on ablation_results        for select using (true);
create policy "Public read access" on experiment_manifests    for select using (true);

-- ── SEED DEMO DATA ─────────────────────────────────────────
-- Insert the 6 prototype events shown in Screen 01

insert into events (event_id, event_date, region, district, forecast_cycle, lead_time_hours, model_source, weather_pattern, peak_observed_rainfall_mm, status)
values
  ('MONSOON-DEP-07',    '2024-07-26', 'Maharashtra', 'Raigad',        '00 UTC', 24, 'GFS 0.25°', 'ACTIVE MONSOON + MONSOON LOW',  242.4, 'selected'),
  ('MONSOON-DEP-05',    '2024-07-21', 'Maharashtra', 'Ratnagiri',     '00 UTC', 24, 'GFS 0.25°', 'OFFSHORE TROUGH',               198.0, 'available'),
  ('OROGRAPHIC-SURGE-02','2024-07-15','Maharashtra', 'Pune (Ghats)',  '00 UTC', 48, 'GFS 0.25°', 'OROGRAPHIC SURGE',              165.5, 'available'),
  ('OFFSHORE-TR-04',    '2024-08-03', 'Gujarat',     'Navsari',       '00 UTC', 24, 'GFS 0.25°', 'DEPRESSION REMNANT',            212.8, 'available'),
  ('MONSOON-LOW-09',    '2024-08-11', 'Maharashtra', 'Thane',         '00 UTC', 72, 'GFS 0.25°', 'ACTIVE MONSOON SURGE',          148.2, 'available'),
  ('TROUGH-EMB-01',     '2024-09-02', 'Maharashtra', 'Sindhudurg',    '00 UTC', 24, 'GFS 0.25°', 'COASTAL CONVERGENCE',           184.6, 'available')
on conflict (event_id) do nothing;

-- Regime predictions for MONSOON-DEP-07
insert into regime_predictions (event_id, active_monsoon, break_monsoon, monsoon_low, coastal_rainfall, orographic, western_disturbance, dominant_regime)
values ('MONSOON-DEP-07', 0.61, 0.01, 0.24, 0.04, 0.10, 0.00, 'Active Monsoon')
on conflict do nothing;

-- Failure predictions for MONSOON-DEP-07
insert into failure_predictions (event_id, failure_occurrence, failure_amount, failure_location, failure_structure, failure_tail, confidence_amount, confidence_location, confidence_tail)
values ('MONSOON-DEP-07', 'LOW', 'HIGH', 'HIGH', 'MEDIUM', 'HIGH', 0.84, 0.78, 0.91)
on conflict do nothing;

-- Correction output for MONSOON-DEP-07 / Raigad
insert into correction_outputs (event_id, district, original_nwp_mm, spectra_candidate_mm, final_forecast_mm, decision, blend_weight_spectra, blend_weight_nwp, prob_heavy, prob_very_heavy, prob_extreme, correction_confidence, ood_status, correction_support, spatial_shift_km, spatial_shift_direction, intensity_change_pct, heavy_area_change_km2)
values ('MONSOON-DEP-07', 'Raigad', 205.4, 231.8, 221.8, 'COMBINE', 0.62, 0.38, 0.94, 0.84, 0.42, 'HIGH', 'NORMAL', 'OK', 12.0, 'E/ESE', 18.0, 310.0)
on conflict do nothing;

-- District products for MONSOON-DEP-07
insert into district_products (event_id, district, mean_rainfall_mm, max_rainfall_mm, p90_rainfall_mm, heavy_area_frac, very_heavy_area_frac, extreme_area_frac, prob_heavy, prob_very_heavy, prob_extreme, dominant_regime, decision, correction_confidence)
values
  ('MONSOON-DEP-07', 'Raigad',         180.2, 221.8, 208.4, 0.94, 0.84, 0.42, 0.94, 0.84, 0.42, 'Active Monsoon', 'COMBINE',       'HIGH'),
  ('MONSOON-DEP-07', 'Ratnagiri',      162.5, 198.0, 188.1, 0.91, 0.62, 0.18, 0.91, 0.62, 0.18, 'Active Monsoon', 'COMBINE',       'HIGH'),
  ('MONSOON-DEP-07', 'Pune (Ghats)',   138.4, 165.5, 158.2, 0.88, 0.71, 0.24, 0.88, 0.71, 0.24, 'Orographic',     'COMBINE',       'MEDIUM'),
  ('MONSOON-DEP-07', 'Sindhudurg',     155.3, 184.6, 176.0, 0.82, 0.54, 0.12, 0.82, 0.54, 0.12, 'Coastal',        'COMBINE',       'MEDIUM'),
  ('MONSOON-DEP-07', 'Thane',          124.0, 148.2, 140.5, 0.76, 0.41, 0.08, 0.76, 0.41, 0.08, 'Active Monsoon', 'COMBINE',       'MEDIUM'),
  ('MONSOON-DEP-07', 'Satara (Ghats)', 110.5, 132.0, 126.3, 0.72, 0.38, 0.06, 0.72, 0.38, 0.06, 'Orographic',     'COMBINE',       'LOW'),
  ('MONSOON-DEP-07', 'Mumbai',          80.1,  92.4,  88.2, 0.64, 0.22, 0.02, 0.64, 0.22, 0.02, 'Active Monsoon', 'KEEP_ORIGINAL', 'LOW')
on conflict (event_id, district) do nothing;

-- Verification metrics (illustrative demo data — labelled as SYNTHETIC)
insert into verification_metrics (model_name, threshold_name, threshold_mm, weather_pattern, lead_time_hours, period_desc, n_cases, rmse, csi, ets, pod, far, fss_025deg, fss_050deg, fss_100deg, beneficial_intervention_rate, harmful_intervention_rate, correct_abstention_rate, data_label)
values
  ('RAW_NWP',    'HEAVY', 64.5, 'Active Monsoon', 24, '2024 Monsoon Season', 1420, 28.4, 0.31, 0.28, 0.64, 0.48, 0.38, 0.44, 0.52, null,  null,  null,  'SYNTHETIC_UI_DEMONSTRATION'),
  ('QM',         'HEAVY', 64.5, 'Active Monsoon', 24, '2024 Monsoon Season', 1420, 25.1, 0.36, 0.34, 0.69, 0.42, 0.45, 0.51, 0.59, null,  null,  null,  'SYNTHETIC_UI_DEMONSTRATION'),
  ('GENERIC_ML', 'HEAVY', 64.5, 'Active Monsoon', 24, '2024 Monsoon Season', 1420, 22.6, 0.41, 0.39, 0.74, 0.38, 0.52, 0.58, 0.66, null,  null,  null,  'SYNTHETIC_UI_DEMONSTRATION'),
  ('REGIME_ML',  'HEAVY', 64.5, 'Active Monsoon', 24, '2024 Monsoon Season', 1420, 19.8, 0.46, 0.44, 0.79, 0.32, 0.58, 0.64, 0.71, null,  null,  null,  'SYNTHETIC_UI_DEMONSTRATION'),
  ('SPECTRA',    'HEAVY', 64.5, 'Active Monsoon', 24, '2024 Monsoon Season', 1420, 16.2, 0.54, 0.52, 0.86, 0.24, 0.69, 0.74, 0.80, 0.684, 0.082, 0.234, 'SYNTHETIC_UI_DEMONSTRATION')
on conflict do nothing;

-- Contingency counts
insert into contingency_counts (model_name, threshold_name, weather_pattern, hits, false_alarms, misses, correct_rejections, total)
values ('SPECTRA', 'HEAVY', 'Active Monsoon', 342, 108, 56, 914, 1420)
on conflict do nothing;
