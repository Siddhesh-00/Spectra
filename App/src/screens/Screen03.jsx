import React, { useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import SpectraTile from '../components/SpectraTile';
import { Icon, SectionHeader, StepBreadcrumb, Card, CardHeader, Badge, WorkflowDock } from '../components/Primitives';

const PANELS = [
  { id: 'nwp',   label: 'RAW NWP',        sub: 'GFS 0.25° / No Correction',  dots: [[18.5,73.4,12,'#757684',0.70],[17.8,73.8,10,'#757684',0.60],[18.1,73.0,8,'#757684',0.50]],  color: '#757684' },
  { id: 'spec',  label: 'SPECTRA',         sub: 'Corrected / COMBINE 62%',     dots: [[18.6,73.5,18,'#1e40af',0.85],[17.9,73.9,16,'#1e40af',0.75],[18.2,73.0,12,'#D97706',0.70],[18.5,73.4,8,'#1d6f42',0.60]], color: '#1e40af' },
  { id: 'obs',   label: 'OBSERVATION',     sub: 'CHIRPS v3 / Held-out',        dots: [[18.6,73.5,20,'#1d6f42',0.88],[17.9,73.9,15,'#D97706',0.80],[18.2,73.1,11,'#1e40af',0.65]], color: '#1d6f42' },
  { id: 'diff',  label: 'SPECTRA − NWP',  sub: 'Correction Difference',       dots: [[18.5,73.5, 8,'#D97706',0.75],[17.8,73.9,7,'#D97706',0.65],[18.2,73.0,5,'#ba1a1a',0.60]],  color: '#ba1a1a' },
];

const STATS = [
  { panel: 'RAW NWP',    max: '205.4 mm', rmse: '28.4', csi: '0.31' },
  { panel: 'SPECTRA',    max: '231.8 mm', rmse: '16.2', csi: '0.54' },
  { panel: 'OBSERVATION',max: '242.4 mm', rmse: '—',    csi: '—'    },
  { panel: 'DIFFERENCE', max: '+26.4 mm', rmse: '—',    csi: '—'    },
];

export default function Screen03({ onNavigate }) {
  const [crosshair, setCrosshair] = useState(null);

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCrosshair({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
    <div className="p-space-lg flex flex-col gap-space-md">
      <SectionHeader stage="03" total="05" title="Before / After / Observation"
        desc="Synchronized three-panel comparison: Raw NWP forecast, SPECTRA corrected output, and held-out observation."
      >
        <StepBreadcrumb steps={['Event / District','Forecast Diagnosis','Before / After','District Product','Verification']} currentStep={3} onNavigate={onNavigate} />
      </SectionHeader>

      {/* Warning banner */}
      <div className="flex items-center gap-space-sm bg-surface-container-low border border-outline-variant rounded-DEFAULT px-space-sm py-1.5">
        <Icon name="info" className="text-outline text-[18px]" />
        <span className="font-label-sm text-label-sm font-bold text-on-surface uppercase">DEMO COMPARISON — NOT SCIENTIFIC PERFORMANCE</span>
        <span className="text-outline-variant">•</span>
        <span className="font-body-sm text-body-sm text-on-surface-variant">Historical observation data shown for prototype event comparison.</span>
      </div>

      {/* 4-panel grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md" onMouseMove={handleMouseMove}>
        {PANELS.map((panel) => (
          <Card key={panel.id} className="overflow-hidden">
            <CardHeader title={panel.label} right={
              <span className="font-label-sm text-label-sm text-outline">{panel.sub}</span>
            } />
            {/* Map */}
            <div className="relative" style={{ height: 260 }}>
              <MapContainer center={[18.2, 73.7]} zoom={7} style={{ height: '100%' }} zoomControl={false} attributionControl={false}>
                <SpectraTile variant="terrain" />
                {panel.dots.map(([lat, lng, r, fill, opacity], i) => (
                  <CircleMarker key={i} center={[lat, lng]} radius={r}
                    pathOptions={{ color: 'rgba(255,255,255,0.4)', fillColor: fill, fillOpacity: opacity, weight: 1 }}
                  >
                    <Tooltip>{`${panel.label}: ~${Math.round(r * 11)} mm`}</Tooltip>
                  </CircleMarker>
                ))}
              </MapContainer>

              {/* Synchronized crosshair */}
              {crosshair && (
                <>
                  <div className="absolute pointer-events-none z-[999] border-dashed border-outline/50"
                    style={{ left: crosshair.x, top: 0, bottom: 0, width: 1, borderLeftWidth: 1 }} />
                  <div className="absolute pointer-events-none z-[999] border-dashed border-outline/50"
                    style={{ top: crosshair.y, left: 0, right: 0, height: 1, borderTopWidth: 1 }} />
                </>
              )}
            </div>

            {/* Stats bar */}
            <div className="px-space-sm py-1.5 bg-surface-container-low border-t border-outline-variant flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-outline uppercase">{panel.label} STATS</span>
              <span className="font-label-md text-label-md font-bold text-on-surface font-mono">
                {STATS.find(s => s.panel === panel.label || s.panel === 'DIFFERENCE' && panel.id === 'diff')?.max || '—'}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Metrics comparison row */}
      <Card>
        <CardHeader title="Panel Comparison — Key Metrics" right={
          <Badge label="HISTORICAL VERIFICATION" variant="secondary" />
        } />

        {/* Compact, clearly visible SPECTRA Suggestion strip */}
        <div className="mx-space-sm mt-space-sm p-space-sm bg-primary/10 border-2 border-primary/40 rounded-DEFAULT flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
            <div className="flex flex-col">
              <span className="font-label-sm text-[8px] text-outline uppercase font-semibold">Active SPECTRA Suggestion</span>
              <span className="font-headline-sm text-headline-sm font-bold text-primary">
                COMBINE · 38% NWP + 62% SPECTRA Blend
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-md text-[11px] font-mono text-on-surface">
            <span className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant">
              RMSE: <strong className="text-secondary font-bold">28.4 → 16.2 mm (-43%)</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant">
              CSI: <strong className="text-secondary font-bold">0.31 → 0.54 (+74%)</strong>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto p-space-sm pt-2">
          <table className="w-full border-collapse">
            <thead>
              <tr className="h-7 bg-surface-container-high/30 border-b border-outline-variant font-label-sm text-label-sm text-outline uppercase">
                <th className="px-3 text-left font-medium">Panel</th>
                <th className="px-3 text-right font-medium">Max Rain</th>
                <th className="px-3 text-right font-medium">RMSE ↓</th>
                <th className="px-3 text-right font-medium">CSI ↑</th>
                <th className="px-3 text-left font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40 font-label-md text-label-md">
              <tr className="h-8 hover:bg-surface-container-low">
                <td className="px-3 font-body-sm text-body-sm">Raw NWP</td>
                <td className="px-3 text-right font-mono">205.4 mm</td>
                <td className="px-3 text-right text-error font-mono">28.4</td>
                <td className="px-3 text-right text-error font-mono">0.31</td>
                <td className="px-3 font-body-sm text-body-sm text-on-surface-variant">Uncorrected GFS</td>
              </tr>
              <tr className="h-8 bg-primary-container text-on-primary font-bold">
                <td className="px-3 font-body-sm text-body-sm">SPECTRA</td>
                <td className="px-3 text-right font-mono">231.8 mm</td>
                <td className="px-3 text-right font-mono">16.2</td>
                <td className="px-3 text-right font-mono">0.54</td>
                <td className="px-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-DEFAULT border border-primary/60 bg-primary text-on-primary font-label-sm text-[9px] font-bold uppercase">
                    <span className="material-symbols-outlined text-[10px] leading-none">merge</span>
                    SPECTRA DECISION: COMBINE · 62%
                  </span>
                </td>
              </tr>
              <tr className="h-8 hover:bg-surface-container-low">
                <td className="px-3 font-body-sm text-body-sm">Observation</td>
                <td className="px-3 text-right font-mono text-secondary">242.4 mm</td>
                <td className="px-3 text-right text-outline font-mono">—</td>
                <td className="px-3 text-right text-outline font-mono">—</td>
                <td className="px-3 font-body-sm text-body-sm text-on-surface-variant">CHIRPS v3 held-out</td>
              </tr>
              <tr className="h-8 hover:bg-surface-container-low">
                <td className="px-3 font-body-sm text-body-sm">Difference (SPECTRA − NWP)</td>
                <td className="px-3 text-right font-mono text-primary">+26.4 mm</td>
                <td className="px-3 text-right text-outline font-mono">—</td>
                <td className="px-3 text-right text-outline font-mono">—</td>
                <td className="px-3 font-body-sm text-body-sm text-on-surface-variant">Net correction applied</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="px-space-sm py-1.5 bg-surface-container-low border-t border-outline-variant flex items-center justify-between text-[8.5px] text-outline/60 font-mono">
          <span>* Evaluation metrics based on demo test case · Real-time verification pipeline yet to be implemented</span>
          <span className="hidden md:inline">Sample: 2024-07-26 (00 UTC)</span>
        </div>
      </Card>

      <div className="flex justify-end -mt-2 -mb-1 pr-1">
        <span className="font-mono text-[9px] text-outline/60">
          * Demo verification archive · Real Doppler radar feed yet to be implemented
        </span>
      </div>

      <WorkflowDock
        label="COMPARISON COMPLETE"
        left="Original, SPECTRA candidate and historical verification compared."
        onContinue={() => onNavigate('district-product')}
        continueLabel="CONTINUE TO DISTRICT PRODUCT"
      />
    </div>
  );
}
