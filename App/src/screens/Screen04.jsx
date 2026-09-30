import React, { useState } from 'react';
import { MapContainer, CircleMarker, Tooltip } from 'react-leaflet';
import SpectraTile from '../components/SpectraTile';
import { Icon, SectionHeader, StepBreadcrumb, Card, CardHeader, Badge, DecisionBadge, WorkflowDock } from '../components/Primitives';

const DISTRICTS = [
  { name: 'Raigad',         mean: 180.2, max: 221.8, p90: 208.4, heavy: 0.94, vheavy: 0.84, extreme: 0.42, regime: 'Active Monsoon', decision: 'COMBINE',       conf: 'HIGH',   lat: 18.5, lng: 73.4, nwp: 158.7 },
  { name: 'Ratnagiri',      mean: 162.5, max: 198.0, p90: 188.1, heavy: 0.91, vheavy: 0.62, extreme: 0.18, regime: 'Active Monsoon', decision: 'COMBINE',       conf: 'HIGH',   lat: 17.0, lng: 73.3, nwp: 142.6 },
  { name: 'Pune (Ghats)',   mean: 138.4, max: 165.5, p90: 158.2, heavy: 0.88, vheavy: 0.71, extreme: 0.24, regime: 'Orographic',     decision: 'COMBINE',       conf: 'MEDIUM', lat: 18.5, lng: 73.8, nwp: 119.2 },
  { name: 'Sindhudurg',     mean: 155.3, max: 184.6, p90: 176.0, heavy: 0.82, vheavy: 0.54, extreme: 0.12, regime: 'Coastal',        decision: 'COMBINE',       conf: 'MEDIUM', lat: 16.0, lng: 73.7, nwp: 132.9 },
  { name: 'Thane',          mean: 124.0, max: 148.2, p90: 140.5, heavy: 0.76, vheavy: 0.41, extreme: 0.08, regime: 'Active Monsoon', decision: 'COMBINE',       conf: 'MEDIUM', lat: 19.2, lng: 73.0, nwp: 106.7 },
  { name: 'Satara (Ghats)', mean: 110.5, max: 132.0, p90: 126.3, heavy: 0.72, vheavy: 0.38, extreme: 0.06, regime: 'Orographic',     decision: 'COMBINE',       conf: 'LOW',    lat: 17.7, lng: 73.9, nwp:  95.0 },
  { name: 'Mumbai',         mean:  80.1, max:  92.4, p90:  88.2, heavy: 0.64, vheavy: 0.22, extreme: 0.02, regime: 'Active Monsoon', decision: 'KEEP_ORIGINAL', conf: 'LOW',    lat: 19.1, lng: 72.9, nwp:  88.8 },
];

const ConfBadge = ({ level }) => {
  const cls = { HIGH: 'text-secondary', MEDIUM: 'text-[#D97706]', LOW: 'text-outline' };
  return <span className={`font-label-md text-label-md font-bold ${cls[level]}`}>{level}</span>;
};

const ProbBar = ({ label, value, color }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center justify-between font-label-sm text-label-sm">
      <span className="text-outline uppercase">{label}</span>
      <span className="font-bold text-on-surface font-mono">{(value * 100).toFixed(0)}%</span>
    </div>
    <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${value * 100}%` }} />
    </div>
  </div>
);

export default function Screen04({ onNavigate }) {
  const [selected, setSelected] = useState(DISTRICTS[0]);

  return (
    <div className="p-space-lg flex flex-col gap-space-md">
      <SectionHeader stage="04" total="05" title="District Product"
        desc="Final district-level rainfall product derived from the SPECTRA-corrected grid."
      >
        <StepBreadcrumb steps={['Event / District','Forecast Diagnosis','Before / After','District Product','Verification']} currentStep={4} onNavigate={onNavigate} />
      </SectionHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">

        {/* District table */}
        <div className="lg:col-span-7 flex flex-col gap-space-md">
          <Card>
            <CardHeader title="Maharashtra Districts — Rainfall Product" right={
              <span className="font-label-sm text-label-sm text-outline">{DISTRICTS.length} DISTRICTS</span>
            } />
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="h-7 bg-surface-container-high/30 border-b border-outline-variant font-label-sm text-label-sm text-outline uppercase">
                    <th className="px-2 text-left font-medium">District</th>
                    <th className="px-2 text-right font-medium">Max mm</th>
                    <th className="px-2 text-right font-medium">Heavy%</th>
                    <th className="px-2 text-right font-medium">V.Heavy%</th>
                    <th className="px-2 text-right font-medium">Extreme%</th>
                    <th className="px-2 text-right font-medium">Heavy Area</th>
                    <th className="px-2 text-left font-medium">Decision</th>
                    <th className="px-2 text-left font-medium">Conf.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40">
                  {DISTRICTS.map((d) => {
                    const isSel = d.name === selected.name;
                    return (
                      <tr
                        key={d.name}
                        onClick={() => setSelected(d)}
                        className={`h-9 cursor-pointer transition-colors font-label-md text-label-md
                          ${isSel ? 'bg-primary-container border-l-2 border-primary' : 'hover:bg-surface-container-low'}`}
                      >
                        <td className={`px-2 font-body-sm text-body-sm font-semibold ${isSel ? 'text-on-primary' : 'text-on-surface'}`}>{d.name}</td>
                        <td className={`px-2 text-right font-mono font-bold ${isSel ? 'text-on-primary' : 'text-on-surface'}`}>{d.max.toFixed(1)}</td>
                        <td className={`px-2 text-right font-mono ${isSel ? 'text-on-primary' : d.heavy > 0.85 ? 'text-error font-bold' : 'text-on-surface'}`}>{(d.heavy*100).toFixed(0)}%</td>
                        <td className={`px-2 text-right font-mono ${isSel ? 'text-on-primary' : d.vheavy > 0.7 ? 'text-[#D97706] font-bold' : 'text-on-surface'}`}>{(d.vheavy*100).toFixed(0)}%</td>
                        <td className={`px-2 text-right font-mono ${isSel ? 'text-on-primary' : 'text-on-surface'}`}>{(d.extreme*100).toFixed(0)}%</td>
                        <td className={`px-2 text-right font-mono text-[10px] ${isSel ? 'text-on-primary' : 'text-on-surface-variant'}`}>{(d.heavy * 310).toFixed(0)} km²</td>
                        <td className="px-2"><DecisionBadge decision={d.decision} /></td>
                        <td className="px-2"><ConfBadge level={d.conf} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Map */}
          <Card className="overflow-hidden">
            <CardHeader title="District Rainfall Map" right={
              <span className="font-label-sm text-label-sm text-outline">SPECTRA CORRECTED GRID</span>
            } />
            <div style={{ height: 280 }}>
              <MapContainer center={[18.0, 73.5]} zoom={7} style={{ height: '100%' }} zoomControl={false} attributionControl={false}>
                <SpectraTile variant="terrain" />
                {DISTRICTS.map((d) => {
                  const isSelected = d.name === selected.name;
                  // IMD-style colour by SPECTRA max
                  const fill = d.max >= 204.5 ? '#7e0023'
                             : d.max >= 115.6 ? '#ba1a1a'
                             : d.max >=  64.5 ? '#D97706'
                             : '#1d6f42';
                  const radius = Math.max(8, d.max / 11);
                  return (
                    <CircleMarker
                      key={d.name}
                      center={[d.lat, d.lng]}
                      radius={isSelected ? radius + 5 : radius}
                      pathOptions={{
                        color: isSelected ? '#fff' : 'rgba(255,255,255,0.3)',
                        fillColor: fill,
                        fillOpacity: isSelected ? 0.95 : 0.72,
                        weight: isSelected ? 2 : 1,
                      }}
                      eventHandlers={{ click: () => setSelected(d) }}
                    >
                      <Tooltip permanent={isSelected} direction="top">
                        <div style={{ fontFamily: 'monospace', fontSize: 11 }}>
                          <b>{d.name}</b><br />
                          SPECTRA: {d.max.toFixed(0)} mm<br />
                          Decision: <b>{d.decision.replace('_',' ')}</b>
                        </div>
                      </Tooltip>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            </div>
          </Card>
        </div>

        {/* Right: selected district detail */}
        <div className="lg:col-span-5 flex flex-col gap-space-md">
          <Card>
            <CardHeader title={selected.name} right={<DecisionBadge decision={selected.decision} />} />
            <div className="p-space-sm flex flex-col gap-space-md">
              {/* Rainfall stats */}
              <div className="grid grid-cols-3 gap-space-sm text-center">
                {[
                  { label: 'Mean', value: selected.mean.toFixed(1) + ' mm' },
                  { label: 'Max',  value: selected.max.toFixed(1) + ' mm'  },
                  { label: 'P90',  value: selected.p90.toFixed(1) + ' mm'  },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-surface-container-low border border-outline-variant rounded-DEFAULT p-space-sm flex flex-col">
                    <span className="font-label-sm text-label-sm text-outline uppercase">{label}</span>
                    <span className="font-headline-sm text-headline-sm font-bold text-on-surface font-mono mt-0.5">{value}</span>
                  </div>
                ))}
              </div>

              {/* Probability bars */}
              <div className="flex flex-col gap-space-sm">
                <ProbBar label="Heavy (≥64.5 mm)"         value={selected.heavy}   color="bg-primary" />
                <ProbBar label="Very Heavy (≥115.6 mm)"   value={selected.vheavy}  color="bg-[#D97706]" />
                <ProbBar label="Extreme (≥204.5 mm)"      value={selected.extreme} color="bg-error" />
              </div>

              {/* Heavy area fraction */}
              <div className="bg-surface-container-low border border-outline-variant rounded-DEFAULT p-space-sm">
                <div className="flex items-center justify-between font-label-sm text-label-sm">
                  <span className="text-outline uppercase">Heavy Area Fraction</span>
                  <span className="font-bold text-on-surface font-mono">{(selected.heavy * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between font-label-sm text-label-sm mt-1">
                  <span className="text-outline uppercase">Heavy Area Extent</span>
                  <span className="font-bold text-on-surface font-mono">{(selected.heavy * 310).toFixed(0)} km²</span>
                </div>
              </div>

              {/* Meta */}
              <div className="flex flex-col gap-1 border-t border-outline-variant pt-space-sm">
                {[
                  ['Dominant Regime', selected.regime],
                  ['Confidence',      selected.conf],
                  ['Pipeline Mode',   'OPERATIONAL GATING'],
                ].map(([k,v]) => (
                  <div key={k} className="flex items-center justify-between font-label-sm text-label-sm">
                    <span className="text-outline uppercase">{k}</span>
                    <span className="font-semibold text-on-surface">{v}</span>
                  </div>
                ))}
              </div>

              {/* Discreet Demo Warning Note */}
              <div className="mt-1 pt-1.5 border-t border-outline-variant/40 font-mono text-[8.5px] text-outline/60 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-amber-500/70 shrink-0" />
                <span>Demo values · Real district weather station feed yet to be implemented</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="flex justify-end -mt-2 -mb-1 pr-1">
        <span className="font-mono text-[9px] text-outline/60">
          * Demo risk estimation data · Real telemetry sensor feed yet to be implemented
        </span>
      </div>

      <WorkflowDock
        label="DISTRICT PRODUCT READY"
        left="7 districts processed — rainfall, probabilities and decisions available."
        onContinue={() => onNavigate('verification')}
        continueLabel="CONTINUE TO VERIFICATION"
      />
    </div>
  );
}
