import React, { useState } from 'react';
import { MapContainer, CircleMarker, Tooltip } from 'react-leaflet';
import SpectraTile from '../components/SpectraTile';
import { Icon, SectionHeader, StepBreadcrumb, Card, CardHeader, Badge, DecisionBadge, WorkflowDock } from '../components/Primitives';

const REGIME = { active_monsoon: 0.61, monsoon_low: 0.24, orographic: 0.10, coastal: 0.04, break_monsoon: 0.01, western_disturbance: 0.00 };
const REGIME_LABELS = { active_monsoon: 'Active Monsoon', monsoon_low: 'Monsoon Low', orographic: 'Orographic', coastal: 'Coastal Rainfall', break_monsoon: 'Break Monsoon', western_disturbance: 'Western Disturbance' };
const FAILURE = [
  { dim: 'OCCURRENCE', level: 'LOW',    conf: 0.12 },
  { dim: 'AMOUNT',     level: 'HIGH',   conf: 0.84 },
  { dim: 'LOCATION',   level: 'HIGH',   conf: 0.78 },
  { dim: 'STRUCTURE',  level: 'MEDIUM', conf: 0.54 },
  { dim: 'HEAVY TAIL', level: 'HIGH',   conf: 0.91 },
];
const FAILURE_COLORS = { HIGH: 'text-error font-bold', MEDIUM: 'text-[#D97706] font-semibold', LOW: 'text-secondary font-medium' };
const FAILURE_BAR    = { HIGH: 'bg-error',              MEDIUM: 'bg-[#D97706]',                 LOW: 'bg-secondary' };

export default function Screen02({ onNavigate }) {
  const [activeDecision, setActiveDecision] = useState('COMBINE');

  const maxRegime = Object.entries(REGIME).reduce((a, b) => b[1] > a[1] ? b : a);

  return (
    <div className="p-space-lg flex flex-col gap-space-md">
      <SectionHeader stage="02" total="05" title="Forecast Diagnosis"
        desc="Identify the weather pattern, diagnose the likely NWP failure, and evaluate a candidate correction."
      >
        <StepBreadcrumb steps={['Event / District','Forecast Diagnosis','Before / After','District Product','Verification']} currentStep={2} onNavigate={onNavigate} />
      </SectionHeader>

      {/* Status strip */}
      <div className="flex items-center gap-space-md bg-surface-container-low border border-outline-variant rounded-DEFAULT px-space-sm py-1.5 flex-wrap">
        {['01 WEATHER PATTERN','02 WHAT MAY GO WRONG?','03 SUGGESTED CORRECTION','04 SAFETY & SUPPORT'].map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <Icon name="check_circle" className="text-secondary text-[14px]" />
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">{s}</span>
            {i < 3 && <Icon name="chevron_right" className="text-outline text-[14px] hidden md:inline" />}
          </div>
        ))}
      </div>

      {/* 4-card grid + map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">

        {/* Cards column */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-space-md">

          {/* Card 1: Weather Pattern */}
          <Card>
            <CardHeader title="01 Weather Pattern (Context)" right={
              <span className="font-label-sm text-label-sm text-outline uppercase">REGIME</span>
            } />
            <div className="p-space-sm flex flex-col gap-space-xs">
              <div className="font-headline-sm text-headline-sm font-bold text-primary uppercase">
                {REGIME_LABELS[maxRegime[0]]}
              </div>
              <div className="font-label-sm text-label-sm text-outline uppercase mb-2">
                Dominant Probability: {(maxRegime[1]*100).toFixed(0)}%
              </div>
              
              <div className="flex flex-col gap-1 border-t border-outline-variant pt-2">
                {Object.entries(REGIME).sort((a,b)=>b[1]-a[1]).map(([k,v]) => (
                  <div key={k} className="flex items-center gap-2">
                    <div className="w-24 truncate font-label-sm text-[10px] text-on-surface uppercase">{REGIME_LABELS[k]}</div>
                    <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${v*100}%` }} />
                    </div>
                    <div className="w-8 text-right font-mono text-[9px] text-outline">{(v*100).toFixed(0)}%</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Card 2: NWP Failure */}
          <Card>
            <CardHeader title="02 What May Go Wrong?" right={
              <Badge label="3 HIGH RISK" variant="error" />
            } />
            <div className="p-space-sm flex flex-col gap-space-xs">
              <div className="flex flex-col gap-2">
                {FAILURE.map(f => (
                  <div key={f.dim} className="flex flex-col gap-0.5">
                    <div className="flex justify-between items-center font-label-sm text-[10px]">
                      <span className="text-on-surface uppercase">{f.dim}</span>
                      <span className={FAILURE_COLORS[f.level]}>{f.level}</span>
                    </div>
                    <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${FAILURE_BAR[f.level]}`} style={{ width: `${f.conf*100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="font-label-sm text-[9px] text-outline border-t border-outline-variant pt-2 mt-1">
                Amount and Heavy Tail risks indicate significant intensity underestimation by raw NWP.
              </div>
            </div>
          </Card>

          {/* Card 3: Correction */}
          <Card>
            <CardHeader title="03 Suggested Correction" right={
              <span className="font-label-sm text-label-sm text-outline uppercase">ML OUTPUT</span>
            } />
            <div className="p-space-sm flex flex-col gap-space-xs">
              {[
                ['Correction Method', 'LightGBM + Quantile'],
                ['Regime Gate', 'Soft (Weighted)'],
                ['Terrain Adjustment', '✓ Active (Western Ghats)'],
                ['Correction Budget', '+26.4 mm (Max)'],
                ['Tail Repair', 'Extremes >115.6 mm enhanced'],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between items-center py-0.5 border-b border-outline-variant last:border-0">
                  <span className="font-label-sm text-[10px] text-outline uppercase">{k}</span>
                  <span className="font-label-sm text-[11px] font-bold text-on-surface">{v}</span>
                </div>
              ))}
              <div className="font-label-sm text-[9px] text-outline border-t border-outline-variant pt-2 mt-1">
                Elevation-aware quantile mapping repairs localized underprediction along Ghats crestline.
              </div>
            </div>
          </Card>

          {/* Card 4: Safety & Support */}
          <Card>
            <CardHeader title="04 Safety & Support" right={
              <Badge label="OOD CLEAR" variant="secondary" />
            } />
            <div className="p-space-sm flex flex-col gap-space-xs">
              {[
                ['OOD Detection', 'Within distribution', true],
                ['Support Coverage', '82% — ADEQUATE', true],
                ['Physical Sanity', 'Monotonicity ✓', true],
                ['No Future Obs.', 'Verified clean', true],
              ].map(([k,v,ok]) => (
                <div key={k} className="flex justify-between items-center py-0.5 border-b border-outline-variant last:border-0">
                  <div className="flex items-center gap-1 font-label-sm text-[10px] text-outline uppercase">
                    <Icon name={ok ? 'check_circle' : 'cancel'} className={`text-[12px] ${ok ? 'text-secondary' : 'text-error'}`} />
                    {k}
                  </div>
                  <span className="font-mono text-[10px] font-bold text-on-surface">{v}</span>
                </div>
              ))}
            </div>
          </Card>

        </div>

        {/* Map & Decision column */}
        <div className="lg:col-span-5 flex flex-col gap-space-md">
          <Card className="overflow-hidden">
            <CardHeader title="Forecast Context Map" right={
              <span className="font-label-sm text-label-sm text-outline uppercase">Terrain · Rainfall Displacement</span>
            } />
            <div style={{ height: 300 }}>
              <MapContainer center={[18.2, 73.5]} zoom={7} style={{ height: '100%', width: '100%' }} zoomControl={false} attributionControl={false}>
                <SpectraTile variant="terrain" />
                {[
                  { lat: 18.5, lng: 73.4, r: 22, fill: '#ba1a1a', opacity: 0.88, label: 'NWP Core (Displaced) — ~242 mm' },
                  { lat: 18.8, lng: 73.8, r: 18, fill: '#D97706', opacity: 0.82, label: 'Expected Obs Core — ~198 mm' },
                  { lat: 18.2, lng: 73.0, r: 14, fill: '#1e40af', opacity: 0.70, label: 'Underestimated Rain Band — ~154 mm' },
                  { lat: 17.2, lng: 74.0, r: 10, fill: '#1e40af', opacity: 0.55, label: 'Spurious Convection — ~110 mm' },
                  { lat: 18.9, lng: 72.8, r: 16, fill: '#1d6f42', opacity: 0.72, label: 'Underestimated Coastal — ~176 mm' },
                  { lat: 16.8, lng: 74.2, r:  8, fill: '#64748b', opacity: 0.45, label: 'NWP Light Rain — ~42 mm' },
                ].map((pt, i) => (
                  <CircleMarker key={i} center={[pt.lat, pt.lng]} radius={pt.r}
                    pathOptions={{ color: 'rgba(255,255,255,0.5)', fillColor: pt.fill, fillOpacity: pt.opacity, weight: 1 }}>
                    <Tooltip>{pt.label}</Tooltip>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
            {/* Legend */}
            <div className="flex items-center justify-between gap-space-sm px-space-sm py-1.5 bg-surface-container-low border-t border-outline-variant flex-wrap">
              <div className="flex items-center gap-space-md flex-wrap">
                {[
                  { color: '#ba1a1a', label: 'NWP Core (displaced)' },
                  { color: '#D97706', label: 'Observed core' },
                  { color: '#1e40af', label: 'Underestimated band' },
                  { color: '#64748b', label: 'Trace/spurious' },
                ].map(({ color, label }) => (
                  <span key={label} className="flex items-center gap-1 font-label-sm text-[9px] text-outline">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />{label}
                  </span>
                ))}
              </div>
              <span className="font-mono text-[8.5px] text-outline/60 italic">
                * Demonstration simulation · Live model pipeline yet to be implemented
              </span>
            </div>
          </Card>

          <Card>
            <CardHeader title="05 Decision Rule — Replace / Combine / Keep" right={
              <Badge label="CALIBRATED" variant="primary" />
            } />
            <div className="p-space-sm flex flex-col gap-space-sm">
              {/* Decision Toggle Buttons */}
              <div className="flex items-center gap-space-xs">
                {[
                  { id: 'COMBINE', label: 'COMBINE', sub: 'Recommended' },
                  { id: 'REPLACE', label: 'REPLACE', sub: 'Challenger' },
                  { id: 'KEEP_ORIGINAL', label: 'KEEP ORIGINAL', sub: 'Abstain' },
                ].map(({ id, label, sub }) => {
                  const isActive = activeDecision === id;
                  return (
                    <button key={id} onClick={() => setActiveDecision(id)}
                      className={`flex-1 py-2 px-1 flex flex-col items-center justify-center rounded-DEFAULT border transition-all text-center
                        ${isActive
                          ? 'bg-primary text-on-primary border-primary shadow-sm font-bold'
                          : 'bg-surface-container-low text-on-surface-variant border-outline-variant hover:bg-surface-container hover:text-on-surface'
                        }`}
                    >
                      <div className="flex items-center gap-1 font-label-md text-[11px] uppercase tracking-wide">
                        {isActive && <Icon name="check_circle" className="text-[13px] text-secondary" />}
                        {label}
                      </div>
                      <span className={`font-label-sm text-[9px] uppercase tracking-tight ${isActive ? 'text-on-primary/80 font-medium' : 'text-outline'}`}>
                        {sub}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* ── THE WHOLE SPECTRA SUGGESTION BOX ── */}
              <div className="border-2 border-primary rounded-DEFAULT overflow-hidden bg-surface-container-lowest shadow-sm">
                {/* Prominent Header Banner */}
                <div className="bg-primary text-on-primary px-space-sm py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="psychology" className="text-on-primary text-[22px]" />
                    <div className="flex flex-col">
                      <span className="font-label-sm text-[9px] text-on-primary/80 uppercase tracking-wider font-semibold">
                        SPECTRA System Recommendation
                      </span>
                      <span className="font-headline-sm text-headline-sm font-bold text-on-primary leading-tight">
                        {activeDecision === 'COMBINE' && 'COMBINE — Weighted Multi-Model Blend'}
                        {activeDecision === 'REPLACE' && 'REPLACE — Full ML Candidate Substitution'}
                        {activeDecision === 'KEEP_ORIGINAL' && 'KEEP ORIGINAL — Conservative NWP Retention'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/15 border border-white/25">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                    <span className="font-mono text-[10px] font-bold text-on-primary uppercase">
                      {activeDecision === 'COMBINE' ? 'Confidence: HIGH (87%)' :
                       activeDecision === 'REPLACE' ? 'Confidence: MOD (64%)' :
                       'Confidence: HIGH (92%)'}
                    </span>
                  </div>
                </div>

                {/* 3 Quantitative Metric Columns */}
                <div className="grid grid-cols-3 divide-x divide-outline-variant/60 bg-surface-container-low py-2 px-space-sm">
                  <div className="flex flex-col items-center text-center">
                    <span className="font-label-sm text-[9px] text-outline uppercase font-semibold">NWP Weight</span>
                    <span className="font-mono font-bold text-on-surface text-[15px]">
                      {activeDecision === 'COMBINE' ? '38%' : activeDecision === 'REPLACE' ? '0%' : '100%'}
                    </span>
                    <span className="font-label-sm text-[8px] text-on-surface-variant truncate">Synoptic Trough</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <span className="font-label-sm text-[9px] text-outline uppercase font-semibold">SPECTRA Weight</span>
                    <span className="font-mono font-bold text-primary text-[15px]">
                      {activeDecision === 'COMBINE' ? '62%' : activeDecision === 'REPLACE' ? '100%' : '0%'}
                    </span>
                    <span className="font-label-sm text-[8px] text-on-surface-variant truncate">Orog. Tail Repair</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <span className="font-label-sm text-[9px] text-outline uppercase font-semibold">Expected Error</span>
                    <span className="font-mono font-bold text-secondary text-[15px]">
                      {activeDecision === 'COMBINE' ? '▼ 43% RMSE' : activeDecision === 'REPLACE' ? '▼ 38% RMSE' : 'Baseline'}
                    </span>
                    <span className="font-label-sm text-[8px] text-on-surface-variant truncate">28.4 → 16.2 mm</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="flex justify-end -mt-2 -mb-1 pr-1">
        <span className="font-mono text-[9px] text-outline/60">
          * Demo diagnostic data · Real-time pipeline yet to be implemented
        </span>
      </div>

      <WorkflowDock
        label="DIAGNOSIS COMPLETE"
        left="Active Monsoon regime · Amount failure · COMBINE decision generated"
        onContinue={() => onNavigate('before-after')}
        continueLabel="CONTINUE TO BEFORE/AFTER"
      />
    </div>
  );
}
