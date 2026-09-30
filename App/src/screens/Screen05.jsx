import React, { useState } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, RadialLinearScale, ArcElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Line, Radar } from 'react-chartjs-2';
import { Icon, SectionHeader, StepBreadcrumb, Card, CardHeader, Badge, WorkflowDock } from '../components/Primitives';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  RadialLinearScale, ArcElement, Title, Tooltip, Legend, Filler
);

/* ──────────────────────────────────────────────────────────────
   SPEC §24: Five mandatory models (exact naming)
   Raw NWP | Quantile Mapping | Generic ML | Regime ML | SPECTRA
   ──────────────────────────────────────────────────────────────*/
const MODELS = ['Raw NWP', 'Quantile Mapping', 'Generic ML', 'Regime ML', 'SPECTRA'];
const MODEL_COLORS = {
  'Raw NWP':          '#757684',
  'Quantile Mapping': '#b9c7df',
  'Generic ML':       '#a8b8ff',
  'Regime ML':        '#6bd8cb',
  'SPECTRA':          '#00288e',
};

/* Spec §14: IMD thresholds */
const THRESHOLDS = [
  { id: 'HEAVY',      label: 'Heavy (>64.5 mm)',         mm: 64.5  },
  { id: 'VERY_HEAVY', label: 'Very Heavy (>115.6 mm)',   mm: 115.6 },
  { id: 'EXTREME',    label: 'Extremely Heavy (≥204.5 mm)', mm: 204.5 },
];

/* Spec §27.1: required metrics */
const METRIC_OPTIONS = [
  { id: 'ets',  label: 'ETS',  desc: 'Equitable Threat Score',     higher: true,  range: [0,1] },
  { id: 'csi',  label: 'CSI',  desc: 'Critical Success Index',     higher: true,  range: [0,1] },
  { id: 'pod',  label: 'POD',  desc: 'Probability of Detection',   higher: true,  range: [0,1] },
  { id: 'far',  label: 'FAR',  desc: 'False Alarm Ratio',          higher: false, range: [0,1] },
  { id: 'fss',  label: 'FSS',  desc: 'Fractions Skill Score',      higher: true,  range: [0,1] },
  { id: 'rmse', label: 'RMSE', desc: 'Root Mean Square Error (mm)',  higher: false, range: [0,50] },
];

const REGIMES = ['All Regimes', 'Active Monsoon', 'Break Monsoon', 'Monsoon Low', 'Coastal Rainfall', 'Orographic'];

/* Demo data — all labelled SYNTHETIC per spec §23 */
const METRICS_DB = {
  HEAVY: {
    ets:  [0.28, 0.34, 0.39, 0.44, 0.52],
    csi:  [0.31, 0.36, 0.41, 0.46, 0.54],
    pod:  [0.64, 0.69, 0.74, 0.79, 0.86],
    far:  [0.48, 0.42, 0.38, 0.32, 0.24],
    fss:  [0.38, 0.45, 0.52, 0.58, 0.69],
    rmse: [28.4, 25.1, 22.6, 19.8, 16.2],
  },
  VERY_HEAVY: {
    ets:  [0.18, 0.24, 0.30, 0.37, 0.46],
    csi:  [0.21, 0.28, 0.35, 0.41, 0.51],
    pod:  [0.52, 0.60, 0.68, 0.74, 0.82],
    far:  [0.58, 0.50, 0.44, 0.36, 0.26],
    fss:  [0.28, 0.36, 0.44, 0.52, 0.63],
    rmse: [35.2, 31.4, 28.0, 24.1, 19.6],
  },
  EXTREME: {
    ets:  [0.12, 0.17, 0.23, 0.30, 0.39],
    csi:  [0.15, 0.22, 0.29, 0.36, 0.46],
    pod:  [0.40, 0.49, 0.58, 0.67, 0.78],
    far:  [0.64, 0.57, 0.49, 0.40, 0.30],
    fss:  [0.20, 0.29, 0.38, 0.47, 0.59],
    rmse: [48.0, 42.5, 36.8, 30.2, 24.1],
  },
};

/* Spec §28: FSS at 3 neighbourhood scales */
const FSS_SCALES = {
  HEAVY:      { '0.25°': [0.38,0.45,0.52,0.58,0.69], '0.50°': [0.44,0.51,0.58,0.64,0.74], '1.00°': [0.52,0.59,0.66,0.71,0.80] },
  VERY_HEAVY: { '0.25°': [0.28,0.36,0.44,0.52,0.63], '0.50°': [0.35,0.43,0.51,0.58,0.70], '1.00°': [0.42,0.51,0.59,0.66,0.76] },
  EXTREME:    { '0.25°': [0.20,0.29,0.38,0.47,0.59], '0.50°': [0.28,0.37,0.46,0.55,0.66], '1.00°': [0.36,0.46,0.55,0.63,0.74] },
};

/* Spec §25: Ablation A–F with CORRECT spec descriptions */
const ABLATION = [
  { id:'A', question:'Does regime awareness help?',       vs:'Generic ML vs Regime ML',           ets:0.39, csi:0.41, fss:0.52, rmse:22.6, beneficial:'—',    harmful:'—',   note:'Regime classifier adds +13% ETS' },
  { id:'B', question:'Does failure diagnosis help?',      vs:'Regime ML vs Regime+Failure',        ets:0.44, csi:0.46, fss:0.58, rmse:19.8, beneficial:'—',    harmful:'—',   note:'Failure state reduces harmful interventions' },
  { id:'C', question:'Does selective intervention help?', vs:'Always Correct vs RCK Policy',       ets:0.47, csi:0.50, fss:0.62, rmse:18.0, beneficial:'62%',  harmful:'14%', note:'Selective policy cuts harmful by 20 pts' },
  { id:'D', question:'Do safety checks help?',           vs:'No OOD/Support vs With Checks',      ets:0.50, csi:0.52, fss:0.67, rmse:17.1, beneficial:'66%',  harmful:'9%',  note:'OOD guard reduces unsafe corrections' },
  { id:'E', question:'Does terrain help?',               vs:'Without Terrain vs With Terrain',     ets:0.51, csi:0.53, fss:0.68, rmse:16.8, beneficial:'67%',  harmful:'9%',  note:'Terrain improves orographic cases' },
  { id:'F', question:'Soft vs hard regime routing?',     vs:'Hard Top-1 vs Soft Probabilities',   ets:0.52, csi:0.54, fss:0.69, rmse:16.2, beneficial:'68%',  harmful:'8%',  note:'Soft routing benefits borderline cases' },
];

/* Spec §26 + §69: Counterfactual intervention + full intervention scorecard */
const INTERVENTION = [
  { decision:'REPLACE',        n:218, beneficial:'71.1%', harmful:'12.4%', abstention:'—',     missed:'—',     rate:'15.4%', note:'Hard swap of NWP field' },
  { decision:'COMBINE',        n:486, beneficial:'74.3%', harmful:'7.8%',  abstention:'—',     missed:'—',     rate:'34.2%', note:'62/38 weighted blend' },
  { decision:'KEEP ORIGINAL',  n:716, beneficial:'—',     harmful:'—',     abstention:'23.4%', missed:'14.8%', rate:'50.4%', note:'Correct abstentions' },
];

/* Spec §63: Capability comparison table (SPECTRA vs baselines) */
const CAPABILITY = [
  { cap:'Uses NWP output',          rawNwp:'✓', genericML:'✓', regimeML:'✓',        spectra:'✓' },
  { cap:'Regime context',           rawNwp:'—', genericML:'—', regimeML:'✓',        spectra:'✓' },
  { cap:'Failure diagnosis',        rawNwp:'—', genericML:'—', regimeML:'limited',  spectra:'✓ explicit' },
  { cap:'Targeted repair',          rawNwp:'—', genericML:'statistical', regimeML:'model-dep.', spectra:'✓ validated' },
  { cap:'Safety / abstention',      rawNwp:'—', genericML:'—', regimeML:'—',        spectra:'✓ OOD guard' },
  { cap:'Replace / Combine / Keep', rawNwp:'—', genericML:'—', regimeML:'—',        spectra:'✓ explicit' },
  { cap:'Intervention evaluation',  rawNwp:'—', genericML:'✓', regimeML:'✓',        spectra:'✓ primary metric' },
];

/* Spec §31: Regime-wise scorecard */
const REGIME_SCORECARD = [
  { regime:'Active Monsoon',      n:612, nwp_ets:0.28, spectra_ets:0.52, nwp_csi:0.31, spectra_csi:0.54, nwp_rmse:28.4, spectra_rmse:16.2 },
  { regime:'Monsoon Low',         n:284, nwp_ets:0.22, spectra_ets:0.49, nwp_csi:0.26, spectra_csi:0.51, nwp_rmse:32.1, spectra_rmse:18.4 },
  { regime:'Orographic',          n:198, nwp_ets:0.25, spectra_ets:0.46, nwp_csi:0.28, spectra_csi:0.48, nwp_rmse:30.5, spectra_rmse:19.1 },
  { regime:'Coastal Rainfall',    n:168, nwp_ets:0.20, spectra_ets:0.41, nwp_csi:0.23, spectra_csi:0.43, nwp_rmse:34.2, spectra_rmse:20.8 },
  { regime:'Break Monsoon',       n:106, nwp_ets:0.18, spectra_ets:0.38, nwp_csi:0.21, spectra_csi:0.40, nwp_rmse:36.0, spectra_rmse:22.5 },
  { regime:'Western Disturbance', n: 52, nwp_ets:0.15, spectra_ets:0.35, nwp_csi:0.18, spectra_csi:0.37, nwp_rmse:38.1, spectra_rmse:24.0 },
];

/* Spec §27.2: Probability calibration / Brier score */
const CAL_BINS = [0.05,0.15,0.25,0.35,0.45,0.55,0.65,0.75,0.85,0.95];
const CAL_OBS  = [0.03,0.12,0.23,0.33,0.46,0.56,0.68,0.77,0.86,0.94];

/* ── Metric KPI Card (Interactive Sparkline) ─────────────────── */
function MetricKPI({ metric, data, higher, active }) {
  const values = data[metric];
  const spectraVal = values[4]; // SPECTRA = last
  const nwpVal     = values[0]; // Raw NWP = first
  const pct = ((Math.abs(spectraVal - nwpVal) / Math.abs(nwpVal)) * 100).toFixed(1);
  const improved = higher ? spectraVal > nwpVal : spectraVal < nwpVal;
  
  // Sparkline coordinates
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * 100;
    // SVG origin is top-left (0,0)
    const y = 100 - ((v - min) / range) * 100;
    return `${x},${y}`;
  });

  return (
    <div className={`flex flex-col bg-surface-container-lowest border rounded-DEFAULT p-space-sm transition-all duration-300 relative overflow-hidden group cursor-pointer
      ${active ? 'border-primary ring-1 ring-primary shadow-sm' : 'border-outline-variant hover:border-outline hover:bg-surface-container-low'}`}>
      
      {/* active indicator line */}
      <div className={`absolute top-0 left-0 w-full h-1 transition-colors ${active ? 'bg-primary' : 'bg-transparent group-hover:bg-outline-variant'}`} />
      
      <div className="flex items-center justify-between mb-1">
        <span className={`font-label-sm text-label-sm uppercase font-bold ${active ? 'text-primary' : 'text-outline'}`}>{metric.toUpperCase()}</span>
        <span className={`text-[9px] font-label-sm font-bold px-1.5 py-0.5 rounded-DEFAULT border
          ${improved ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-error-container text-error border-error/20'}`}>
          {improved ? '▲' : '▼'} {pct}%
        </span>
      </div>
      
      <div className="flex items-end justify-between mt-1">
        <div className={`font-metric-display text-[1.75rem] font-bold leading-none ${active ? 'text-primary' : 'text-on-surface'}`}>
          {spectraVal.toFixed(metric === 'rmse' ? 1 : 2)}
        </div>
        
        {/* Sparkline */}
        <div className="w-16 h-8 relative ml-2">
           <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
             <polyline points={pts.join(' ')} fill="none" stroke={active ? "#00288e" : "#8f9099"} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
             {values.map((v, i) => {
               const x = (i / (values.length - 1)) * 100;
               const y = 100 - ((v - min) / range) * 100;
               return <circle key={i} cx={x} cy={y} r={i === 4 ? 6 : 4} fill={i === 4 ? (active ? "#00288e" : "#444653") : "#ffffff"} stroke={active ? "#00288e" : "#8f9099"} strokeWidth="2" />
             })}
           </svg>
        </div>
      </div>
      
      <div className="font-label-sm text-[9px] text-outline mt-2 flex justify-between">
        <span>NWP: {nwpVal.toFixed(metric === 'rmse' ? 1 : 2)}</span>
        <span className="font-semibold">SPECTRA</span>
      </div>
    </div>
  );
}

/* ── Horizontal bar comparing all 5 models ───────────────────── */
function ModelCompareBar({ model, value, maxVal, metric, isSpectra }) {
  // Use absolute length for bars. For RMSE/FAR, a shorter bar means a better result.
  const pct = (value / maxVal) * 100;
  return (
    <div className={`flex items-center gap-space-sm py-1.5 px-space-sm rounded-DEFAULT transition-colors group cursor-default
      ${isSpectra ? 'bg-primary-container' : 'hover:bg-surface-container-low'}`}>
      <div className={`font-label-sm text-label-sm w-32 truncate transition-colors ${isSpectra ? 'text-on-primary font-bold' : 'text-on-surface-variant group-hover:text-on-surface'}`}>
        {model}
      </div>
      <div className="flex-1 h-4 bg-surface-container-high rounded-sm overflow-hidden relative">
        <div
          className={`h-full rounded-sm transition-all duration-1000 ease-out flex items-center justify-end pr-1
            ${isSpectra ? 'bg-primary shadow-sm' : 'bg-outline-variant group-hover:bg-outline'}`}
          style={{ width: `${Math.max(pct, 5)}%` }}
        >
          {pct > 15 && (
            <span className={`font-label-sm text-[9px] font-bold ${isSpectra ? 'text-on-primary' : 'text-surface'}`}>
              {value.toFixed(metric === 'rmse' ? 1 : 2)}
            </span>
          )}
        </div>
      </div>
      <div className={`font-label-md text-label-md font-bold font-mono w-12 text-right transition-colors
        ${isSpectra ? 'text-on-primary' : 'text-on-surface'}`}>
        {value.toFixed(metric === 'rmse' ? 1 : 2)}
      </div>
    </div>
  );
}

/* ── Radar chart for multi-metric overview ───────────────────── */
function RadarOverview({ data }) {
  const chartData = {
    labels: ['ETS','CSI','POD','1-FAR','FSS','1-RMSE%'],
    datasets: [
      {
        label: 'Raw NWP',
        data: [data.ets[0], data.csi[0], data.pod[0], 1-data.far[0], data.fss[0], 1-(data.rmse[0]/50)],
        borderColor: '#757684', backgroundColor: '#75768420', borderWidth: 1.5, pointRadius: 3,
      },
      {
        label: 'SPECTRA',
        data: [data.ets[4], data.csi[4], data.pod[4], 1-data.far[4], data.fss[4], 1-(data.rmse[4]/50)],
        borderColor: '#00288e', backgroundColor: '#00288e30', borderWidth: 2, pointRadius: 4,
      },
    ],
  };
  return (
    <Radar data={chartData} options={{
      responsive: true, maintainAspectRatio: true,
      plugins: { legend: { position: 'bottom', labels: { font: { family: 'JetBrains Mono', size: 10 }, color: '#444653' } } },
      scales: {
        r: {
          beginAtZero: true, max: 1,
          ticks: { display: false, stepSize: 0.25 },
          grid: { color: '#c4c5d540' },
          pointLabels: { font: { family: 'JetBrains Mono', size: 11, weight: '600' }, color: '#444653' },
        },
      },
    }} />
  );
}

/* ── Calibration Line ────────────────────────────────────────── */
function CalibrationChart() {
  const data = {
    labels: CAL_BINS.map(b => `${(b*100).toFixed(0)}%`),
    datasets: [
      { label: 'Perfect', data: CAL_BINS, borderColor: '#c4c5d5', borderDash: [4,4], borderWidth: 1, pointRadius: 0, fill: false, tension: 0 },
      { label: 'SPECTRA', data: CAL_OBS,  borderColor: '#00288e', backgroundColor: '#00288e18', borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: '#00288e', fill: true, tension: 0.2 },
    ],
  };
  return (
    <Line data={data} options={{
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { font: { family: 'JetBrains Mono', size: 10 }, color: '#444653' } } },
      scales: {
        x: { title: { display: true, text: 'Forecast Probability', font: { family: 'JetBrains Mono', size: 10 }, color: '#757684' }, grid: { display: false }, ticks: { font: { family: 'JetBrains Mono', size: 10 } } },
        y: { title: { display: true, text: 'Observed Frequency',   font: { family: 'JetBrains Mono', size: 10 }, color: '#757684' }, grid: { color: '#c4c5d520' }, ticks: { font: { family: 'JetBrains Mono', size: 10 } }, min: 0, max: 1 },
      },
    }} />
  );
}

/* ══════════════════════════════════════════════════════════════ */
export default function Screen05({ onNavigate }) {
  const [metric,    setMetric]    = useState('ets');
  const [threshold, setThreshold] = useState('HEAVY');
  const [regime,    setRegime]    = useState('All Regimes');
  const [activeTab, setActiveTab] = useState('scorecard');

  const data  = METRICS_DB[threshold];
  const metaM = METRIC_OPTIONS.find(m => m.id === metric);
  const maxVal = Math.max(...data[metric]);

  const barData = {
    labels: MODELS,
    datasets: [
      {
        type: 'line',
        label: `${metaM.label} Trend`,
        data: data[metric],
        borderColor: '#00288e',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        pointBackgroundColor: MODELS.map(m => m === 'SPECTRA' ? '#00288e' : '#ffffff'),
        pointBorderColor: '#00288e',
        pointBorderWidth: 2,
        pointRadius: MODELS.map(m => m === 'SPECTRA' ? 6 : 4),
        pointHoverRadius: 8,
        tension: 0.3, // smooth curves
      },
      {
        type: 'bar',
        label: metaM.label,
        data: data[metric],
        backgroundColor: MODELS.map(m => m === 'SPECTRA' ? '#00288e' : MODEL_COLORS[m]),
        borderColor:     MODELS.map(m => m === 'SPECTRA' ? '#00288e' : MODEL_COLORS[m] + 'aa'),
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.6,
        hoverBackgroundColor: MODELS.map(m => m === 'SPECTRA' ? '#1e40af' : MODEL_COLORS[m] + 'dd'),
      }
    ],
  };

  const barOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(metric === 'rmse' ? 1 : 2)}` } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'JetBrains Mono', size: 10 }, color: '#757684' } },
      y: { grid: { color: '#c4c5d520' }, ticks: { font: { family: 'JetBrains Mono', size: 10 }, color: '#757684' },
           beginAtZero: true, reverse: metric === 'far' || metric === 'rmse',
           title: { display: true, text: metaM.desc, font: { size: 10 }, color: '#8f9099' }
      },
    },
  };

  return (
    <div className="p-space-lg flex flex-col gap-space-md">
      <SectionHeader stage="05" total="05" title="Forecast Accuracy"
        desc="Quantitative verification — Raw NWP → Quantile Mapping → Generic ML → Regime ML → SPECTRA"
      >
        <StepBreadcrumb steps={['Event','Diagnosis','Before/After','District','Verification']} currentStep={5} onNavigate={onNavigate} />
      </SectionHeader>

      {/* ── SYNTHETIC DATA BANNER (spec §23) ───────────────── */}
      <div className="flex items-center gap-space-sm bg-error-container/40 border border-error/20 rounded-DEFAULT px-space-sm py-1.5">
        <Icon name="warning" className="text-error text-[18px] shrink-0" />
        <span className="font-label-sm text-label-sm font-bold text-error uppercase">
          SYNTHETIC DEMONSTRATION DATA — NOT SCIENTIFIC PERFORMANCE
        </span>
        <span className="text-on-surface-variant font-body-sm text-body-sm ml-1 hidden md:inline">
          Real pipeline results will replace these values once ML training is complete.
        </span>
      </div>

      {/* ── SELECTOR BAR (spec §60: metric + regime + threshold) */}
      <Card>
        <div className="p-space-sm grid grid-cols-1 md:grid-cols-3 gap-space-md">
          {/* Threshold (spec §14) */}
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm text-outline uppercase">Threshold (spec §14)</label>
            <div className="flex gap-1">
              {THRESHOLDS.map(t => (
                <button key={t.id} onClick={() => setThreshold(t.id)}
                  className={`flex-1 py-1.5 text-[10px] font-label-sm font-bold rounded-DEFAULT transition-colors border
                    ${threshold === t.id ? 'bg-primary text-on-primary border-primary' : 'text-outline border-outline-variant hover:bg-surface-container'}`}
                >
                  {t.id === 'HEAVY' ? 'Heavy' : t.id === 'VERY_HEAVY' ? 'V.Heavy' : 'Extreme'}
                </button>
              ))}
            </div>
            <span className="font-label-sm text-[9px] text-outline">{THRESHOLDS.find(t=>t.id===threshold)?.label}</span>
          </div>

          {/* Metric (spec §27.1) */}
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm text-outline uppercase">Primary Metric (spec §27.1)</label>
            <div className="flex flex-wrap gap-1">
              {METRIC_OPTIONS.map(m => (
                <button key={m.id} onClick={() => setMetric(m.id)}
                  className={`px-2.5 py-1 text-[10px] font-label-sm font-bold uppercase rounded-DEFAULT transition-colors border
                    ${metric === m.id ? 'bg-primary text-on-primary border-primary' : 'text-outline border-outline-variant hover:bg-surface-container'}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Regime (spec §8) */}
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm text-outline uppercase">Weather Pattern (spec §8)</label>
            <select value={regime} onChange={e => setRegime(e.target.value)}
              className="h-9 px-2 bg-surface-container border border-outline-variant rounded-DEFAULT font-label-md text-label-md focus:outline-none focus:border-primary"
            >
              {REGIMES.map(r => <option key={r}>{r}</option>)}
            </select>
            <span className="font-label-sm text-[9px] text-secondary font-semibold">
              {regime !== 'All Regimes' ? `Filtered: ${regime}` : 'Showing all 6 weather patterns'}
            </span>
          </div>
        </div>
      </Card>

      {/* ── KPI METRIC CARDS — large readable values ─────────── */}
      <div>
        <div className="font-label-sm text-label-sm text-outline uppercase mb-space-sm">
          SPECTRA Performance — {THRESHOLDS.find(t=>t.id===threshold)?.label} | {regime} | Lead +24h | N=1,420 cases
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-space-sm">
          {METRIC_OPTIONS.map(m => (
            <div key={m.id} onClick={() => setMetric(m.id)}>
              <MetricKPI metric={m.id} data={data} higher={m.higher} active={metric === m.id} />
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN COMPARISON SECTION ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">

        {/* LEFT: Horizontal comparison bars */}
        <div className="lg:col-span-4">
          <Card className="h-full">
            <CardHeader
              title={`${metaM.desc} — All Models`}
              right={<span className="text-[9px] font-label-sm text-outline uppercase">{metaM.higher ? '↑ Higher = Better' : '↓ Lower = Better'}</span>}
            />
            <div className="p-space-xs flex flex-col gap-0.5">
              {MODELS.map((m, i) => (
                <ModelCompareBar
                  key={m} model={m} value={data[metric][i]}
                  maxVal={maxVal} metric={metric}
                  isSpectra={m === 'SPECTRA'}
                />
              ))}
            </div>
            <div className="px-space-sm pb-space-sm pt-1 font-label-sm text-[9px] text-outline">
              SPECTRA improvement over Raw NWP: {(() => {
                const nwp = data[metric][0], spec = data[metric][4];
                const pct = Math.abs(((spec-nwp)/Math.abs(nwp))*100).toFixed(1);
                return metaM.higher ? `+${pct}%` : `-${pct}%`;
              })()}
            </div>
          </Card>
        </div>

        {/* CENTRE: Bar chart */}
        <div className="lg:col-span-5">
          <Card className="h-full">
            <CardHeader
              title={`${metaM.label} — ${metaM.desc}`}
              right={<Badge label="DEMO COMPARISON" variant="error" />}
            />
            <div className="p-space-sm">
              <div style={{ height: 240 }}>
                <Bar data={barData} options={barOpts} />
              </div>
              <div className="flex flex-wrap gap-3 mt-2 font-label-sm text-label-sm text-on-surface-variant">
                {MODELS.map(m => (
                  <span key={m} className="inline-flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: MODEL_COLORS[m] }} />
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT: Radar + contingency */}
        <div className="lg:col-span-3 flex flex-col gap-space-md">
          <Card>
            <CardHeader title="Multi-Metric Radar" right={
              <span className="font-label-sm text-[9px] text-outline">NWP vs SPECTRA</span>
            } />
            <div className="p-space-sm" style={{ height: 220 }}>
              <RadarOverview data={data} />
            </div>
          </Card>
          <Card>
            <CardHeader title="Contingency — SPECTRA" />
            <div className="p-space-sm grid grid-cols-2 gap-space-xs text-center font-label-md text-label-md">
              {[['HITS (A)','342','Obs✓/Fcst✓','text-secondary'],['FALSE ALARMS (B)','108','Obs✗/Fcst✓','text-error'],['MISSES (C)','56','Obs✓/Fcst✗','text-[#D97706]'],['CORRECT REJ. (D)','914','Obs✗/Fcst✗','text-outline']].map(([label,val,sub,color]) => (
                <div key={label} className="flex flex-col bg-surface-container-high/40 border border-outline-variant/60 rounded-DEFAULT p-space-xs">
                  <span className="font-label-sm text-[8px] text-outline font-semibold uppercase">{label}</span>
                  <span className={`font-bold text-headline-sm my-0.5 font-mono ${color}`}>{val}</span>
                  <span className="font-label-sm text-[8px] text-outline">{sub}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* ── FULL METRICS TABLE ────────────────────────────────── */}
      <Card>
        <CardHeader
          title={`Complete Metric Table — ${THRESHOLDS.find(t=>t.id===threshold)?.label} | ${regime}`}
          right={<span className="font-label-sm text-label-sm text-outline">N = 1,420 cases | 2024 Monsoon Season</span>}
        />
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="h-7 bg-surface-container-high/30 border-b border-outline-variant font-label-sm text-label-sm text-outline uppercase">
                <th className="px-3 text-left font-medium">Model (spec §24)</th>
                <th className="px-2 text-right font-medium">ETS ↑</th>
                <th className="px-2 text-right font-medium">CSI ↑</th>
                <th className="px-2 text-right font-medium">POD ↑</th>
                <th className="px-2 text-right font-medium">FAR ↓</th>
                <th className="px-2 text-right font-medium">FSS 0.25° ↑</th>
                <th className="px-2 text-right font-medium">RMSE ↓</th>
                <th className="px-2 text-right font-medium">vs NWP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40 font-label-md text-label-md">
              {MODELS.map((m, i) => {
                const isSPECTRA = m === 'SPECTRA';
                const etsDelta  = data.ets[i] - data.ets[0];
                return (
                  <tr key={m} className={`h-9 transition-colors
                    ${isSPECTRA ? 'bg-primary-container text-on-primary font-bold' : 'hover:bg-surface-container-low'}`}>
                    <td className={`px-3 font-body-sm text-body-sm font-semibold ${isSPECTRA ? '' : 'text-on-surface'}`}>{m}</td>
                    {['ets','csi','pod','far','fss','rmse'].map(k => (
                      <td key={k} className={`px-2 text-right font-mono ${isSPECTRA ? '' : 'text-on-surface-variant'}`}>
                        {data[k][i].toFixed(k === 'rmse' ? 1 : 2)}
                      </td>
                    ))}
                    <td className="px-2 text-right">
                      {i === 0
                        ? <span className="text-outline font-label-sm text-[9px]">baseline</span>
                        : <span className={`text-[9px] font-bold px-1 py-0.5 rounded-DEFAULT
                          ${etsDelta > 0 ? 'text-secondary bg-secondary/10' : 'text-error bg-error-container'}`}>
                            {etsDelta > 0 ? '+' : ''}{(etsDelta).toFixed(2)} ETS
                          </span>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── TAB PANEL: Ablation / FSS / Intervention / Regime / Calibration */}
      <Card>
        <div className="border-b border-outline-variant flex overflow-x-auto">
          {[
            { id: 'scorecard',    label: 'Regime Scorecard (§31)' },
            { id: 'ablation',     label: 'Ablation A–F (§25)' },
            { id: 'intervention', label: 'Intervention Table (§26+§69)' },
            { id: 'fss',          label: 'FSS Multi-Scale (§28)' },
            { id: 'calibration',  label: 'Prob. Calibration (§27.2)' },
            { id: 'capability',   label: 'Capability Compare (§63)' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-space-md py-space-sm font-label-sm text-label-sm font-semibold uppercase whitespace-nowrap transition-colors border-b-2
                ${activeTab === tab.id
                  ? 'border-primary text-primary bg-surface-container-low'
                  : 'border-transparent text-outline hover:text-on-surface hover:bg-surface-container'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-space-md">

          {/* ── Regime Scorecard (spec §31) */}
          {activeTab === 'scorecard' && (
            <div className="flex flex-col gap-space-sm">
              <p className="font-body-sm text-body-sm text-on-surface-variant">Per-regime ETS, CSI, RMSE comparison — Raw NWP vs SPECTRA. Δ ETS shown for each regime.</p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="h-7 bg-surface-container-high/30 border-b border-outline-variant font-label-sm text-label-sm text-outline uppercase">
                      <th className="px-2 text-left font-medium">Weather Pattern</th>
                      <th className="px-2 text-right font-medium">N</th>
                      <th className="px-2 text-right font-medium">NWP ETS</th>
                      <th className="px-2 text-right font-medium">SPECTRA ETS</th>
                      <th className="px-2 text-right font-medium">Δ ETS</th>
                      <th className="px-2 text-right font-medium">NWP CSI</th>
                      <th className="px-2 text-right font-medium">SPECTRA CSI</th>
                      <th className="px-2 text-right font-medium">NWP RMSE</th>
                      <th className="px-2 text-right font-medium">SPECTRA RMSE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/40 font-label-md text-label-md">
                    {REGIME_SCORECARD.map(r => {
                      const delta = r.spectra_ets - r.nwp_ets;
                      return (
                        <tr key={r.regime} className="h-8 hover:bg-surface-container-low">
                          <td className="px-2 font-body-sm text-body-sm text-on-surface font-semibold">{r.regime}</td>
                          <td className="px-2 text-right text-outline font-mono">{r.n}</td>
                          <td className="px-2 text-right text-on-surface-variant font-mono">{r.nwp_ets.toFixed(2)}</td>
                          <td className="px-2 text-right text-primary font-mono font-bold">{r.spectra_ets.toFixed(2)}</td>
                          <td className="px-2 text-right">
                            <span className="text-secondary font-bold font-mono text-[10px] bg-secondary/10 px-1 rounded-DEFAULT">+{delta.toFixed(2)}</span>
                          </td>
                          <td className="px-2 text-right text-on-surface-variant font-mono">{r.nwp_csi.toFixed(2)}</td>
                          <td className="px-2 text-right text-primary font-mono font-bold">{r.spectra_csi.toFixed(2)}</td>
                          <td className="px-2 text-right text-error font-mono">{r.nwp_rmse.toFixed(1)}</td>
                          <td className="px-2 text-right text-secondary font-mono font-bold">{r.spectra_rmse.toFixed(1)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Ablation A–F (spec §25) — with CORRECT spec descriptions */}
          {activeTab === 'ablation' && (
            <div className="flex flex-col gap-space-sm">
              <p className="font-body-sm text-body-sm text-on-surface-variant">Incremental ablation proving each SPECTRA component's contribution (spec §25 questions A–F).</p>
              <div className="flex flex-col gap-space-xs">
                {ABLATION.map((row, i) => {
                  const isFull = row.id === 'F';
                  const prevEts = i > 0 ? ABLATION[i-1].ets : 0.39;
                  const delta = row.ets - (i === 0 ? 0.39 : ABLATION[i-1].ets);
                  return (
                    <div key={row.id}
                      className={`flex items-start gap-space-sm p-space-sm rounded-DEFAULT border transition-colors
                        ${isFull ? 'border-primary bg-primary-container' : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low'}`}
                    >
                      <div className={`w-7 h-7 rounded-DEFAULT flex items-center justify-center font-label-md text-label-md font-bold shrink-0
                        ${isFull ? 'bg-primary text-on-primary' : 'bg-surface-container text-primary border border-outline-variant'}`}>
                        {row.id}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-label-md text-label-md font-bold ${isFull ? 'text-on-primary' : 'text-on-surface'}`}>
                          {row.question}
                        </div>
                        <div className="font-label-sm text-[9px] text-outline uppercase mt-0.5">{row.vs}</div>
                        <div className={`font-body-sm text-body-sm mt-0.5 ${isFull ? 'text-on-primary-container' : 'text-on-surface-variant'}`}>
                          {row.note}
                        </div>
                      </div>
                      <div className="flex items-center gap-space-sm shrink-0">
                        {['ETS','CSI','FSS','RMSE'].map((k, ki) => (
                          <div key={k} className="flex flex-col items-end">
                            <span className={`font-label-sm text-[8px] uppercase ${isFull ? 'text-on-primary-container' : 'text-outline'}`}>{k}</span>
                            <span className={`font-label-md text-label-md font-bold font-mono ${isFull ? 'text-on-primary' : 'text-primary'}`}>
                              {ki === 3 ? row.rmse.toFixed(1) : ki === 0 ? row.ets.toFixed(2) : ki === 1 ? row.csi.toFixed(2) : row.fss.toFixed(2)}
                            </span>
                          </div>
                        ))}
                        {row.beneficial !== '—' && (
                          <>
                            <div className="flex flex-col items-end">
                              <span className={`font-label-sm text-[8px] uppercase ${isFull ? 'text-on-primary-container' : 'text-outline'}`}>Benef.</span>
                              <span className={`font-label-md text-label-md font-bold ${isFull ? 'text-secondary-fixed' : 'text-secondary'}`}>{row.beneficial}</span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className={`font-label-sm text-[8px] uppercase ${isFull ? 'text-on-primary-container' : 'text-outline'}`}>Harmful</span>
                              <span className={`font-label-md text-label-md font-bold ${isFull ? 'text-on-primary-container' : 'text-error'}`}>{row.harmful}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Intervention Table (spec §26) */}
          {activeTab === 'intervention' && (
            <div className="flex flex-col gap-space-sm">
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Counterfactual intervention test (spec §26): For every held-out event, would the forecast have been better if SPECTRA intervened?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm mb-space-sm">
                {[
                  { label: 'Beneficial Intervention Rate', value: '68.4%', icon: 'thumb_up',   color: 'text-secondary', bg: 'bg-secondary/5 border-secondary/20' },
                  { label: 'Harmful Intervention Rate',    value: '8.2%',  icon: 'thumb_down', color: 'text-error',     bg: 'bg-error-container/40 border-error/20' },
                  { label: 'Correct Abstention Rate',      value: '23.4%', icon: 'do_not_disturb_on', color: 'text-[#D97706]', bg: 'bg-amber-50 border-amber-200' },
                ].map(({ label, value, icon, color, bg }) => (
                  <div key={label} className={`flex items-center gap-space-sm p-space-sm rounded-DEFAULT border ${bg}`}>
                    <Icon name={icon} className={`text-[28px] ${color}`} />
                    <div>
                      <div className={`font-metric-display text-metric-display font-bold ${color}`}>{value}</div>
                      <div className="font-label-sm text-[10px] text-outline uppercase">{label}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="h-7 bg-surface-container-high/30 border-b border-outline-variant font-label-sm text-label-sm text-outline uppercase">
                      <th className="px-3 text-left font-medium">Decision (spec §15)</th>
                      <th className="px-2 text-right font-medium">N Cases</th>
                      <th className="px-2 text-right font-medium">Beneficial ↑</th>
                      <th className="px-2 text-right font-medium">Harmful ↓</th>
                      <th className="px-2 text-right font-medium">Correct Abstention</th>
                      <th className="px-2 text-left font-medium">Method</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/40 font-label-md text-label-md">
                    {INTERVENTION.map(row => (
                      <tr key={row.decision} className="h-9 hover:bg-surface-container-low">
                        <td className="px-3 font-label-md text-label-md font-bold text-on-surface">{row.decision}</td>
                        <td className="px-2 text-right font-mono">{row.n}</td>
                        <td className="px-2 text-right font-mono text-secondary font-bold">{row.beneficial}</td>
                        <td className="px-2 text-right font-mono text-error font-bold">{row.harmful}</td>
                        <td className="px-2 text-right font-mono text-[#D97706] font-bold">{row.abstention}</td>
                        <td className="px-2 font-body-sm text-body-sm text-on-surface-variant">{row.note}</td>
                      </tr>
                    ))}
                    <tr className="h-8 bg-surface-container font-bold border-t-2 border-outline-variant">
                      <td className="px-3 font-label-md text-on-surface">TOTAL (spec §26)</td>
                      <td className="px-2 text-right font-mono">1,420</td>
                      <td className="px-2 text-right font-mono text-secondary">68.4%</td>
                      <td className="px-2 text-right font-mono text-error">8.2%</td>
                      <td className="px-2 text-right font-mono text-[#D97706]">23.4%</td>
                      <td className="px-2 font-body-sm text-body-sm text-outline">Beneficial – Harmful – Abstention</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── FSS Multi-Scale (spec §28) */}
          {activeTab === 'fss' && (
            <div className="flex flex-col gap-space-sm">
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Fractions Skill Score at three neighbourhood scales (spec §28): 0.25° ≈ 28 km | 0.50° ≈ 56 km | 1.00° ≈ 111 km
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="h-7 bg-surface-container-high/30 border-b border-outline-variant font-label-sm text-label-sm text-outline uppercase">
                      <th className="px-2 text-left font-medium">Model</th>
                      <th className="px-2 text-right font-medium">FSS 0.25° ↑</th>
                      <th className="px-2 text-right font-medium">FSS 0.50° ↑</th>
                      <th className="px-2 text-right font-medium">FSS 1.00° ↑</th>
                      <th className="px-2 text-left font-medium">Scale sensitivity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/40 font-label-md text-label-md">
                    {MODELS.map((m, i) => {
                      const isSPECTRA = m === 'SPECTRA';
                      const scales = FSS_SCALES[threshold];
                      const range = scales['1.00°'][i] - scales['0.25°'][i];
                      return (
                        <tr key={m} className={`h-9 ${isSPECTRA ? 'bg-primary-container text-on-primary font-bold' : 'hover:bg-surface-container-low'}`}>
                          <td className={`px-2 font-body-sm text-body-sm ${isSPECTRA ? '' : 'text-on-surface'}`}>{m}</td>
                          {['0.25°','0.50°','1.00°'].map(s => (
                            <td key={s} className={`px-2 text-right font-mono ${isSPECTRA ? '' : 'text-on-surface-variant'}`}>
                              {scales[s][i].toFixed(2)}
                            </td>
                          ))}
                          <td className="px-2">
                            <div className="flex items-center gap-1">
                              <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden max-w-[80px]">
                                <div className={`h-full rounded-full ${isSPECTRA ? 'bg-on-primary' : 'bg-outline-variant'}`}
                                  style={{ width: `${range * 300}%` }} />
                              </div>
                              <span className={`font-label-sm text-[9px] ${isSPECTRA ? '' : 'text-outline'}`}>+{range.toFixed(2)}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-1 font-label-sm text-[9px] text-outline uppercase">
                Higher FSS at smaller scales = better spatial accuracy | All models improve at larger scales (expected)
              </div>
            </div>
          )}

          {/* ── Probability Calibration + Brier Score (spec §27.2) */}
          {activeTab === 'calibration' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <div>
                <div className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-sm">
                  Reliability Diagram — Heavy Rain Probability
                </div>
                <div style={{ height: 280 }}>
                  <CalibrationChart />
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-sm">
                  Points close to the diagonal = well-calibrated. SPECTRA is slightly sharp (over-confident at high probabilities).
                </p>
              </div>
              <div className="flex flex-col gap-space-sm">
                <div className="font-headline-sm text-headline-sm text-on-surface font-bold">Brier Score Decomposition (spec §27.2)</div>
                {[
                  { label: 'Brier Score — SPECTRA', value: '0.124', note: 'Lower = better',     color: 'text-primary',   bg: 'bg-surface-container-low' },
                  { label: 'Brier Score — Raw NWP',  value: '0.218', note: 'Baseline',           color: 'text-error',     bg: 'bg-error-container/20' },
                  { label: 'Brier Skill Score',       value: '+43.1%',note: 'vs Raw NWP',        color: 'text-secondary', bg: 'bg-secondary/5' },
                  { label: 'Reliability Component',   value: '0.014', note: 'Sharpness loss',    color: 'text-on-surface',bg: 'bg-surface-container-low' },
                  { label: 'Resolution Component',    value: '0.088', note: 'Discrimination',    color: 'text-on-surface',bg: 'bg-surface-container-low' },
                  { label: 'Uncertainty Component',   value: '0.022', note: 'Climatological',    color: 'text-outline',   bg: 'bg-surface-container-low' },
                ].map(({ label, value, note, color, bg }) => (
                  <div key={label} className={`flex items-center justify-between px-space-sm py-space-xs rounded-DEFAULT border border-outline-variant ${bg}`}>
                    <div>
                      <div className="font-label-sm text-label-sm text-on-surface font-medium">{label}</div>
                      <div className="font-label-sm text-[9px] text-outline">{note}</div>
                    </div>
                    <span className={`font-metric-display text-[1.1rem] font-bold font-mono ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Capability Comparison Table (spec §63) */}
          {activeTab === 'capability' && (
            <div className="flex flex-col gap-space-sm">
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                SPECTRA vs baselines — feature capability matrix (spec §63). ✓ = supported | — = not supported.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="h-7 bg-surface-container-high/30 border-b border-outline-variant font-label-sm text-label-sm text-outline uppercase">
                      <th className="px-3 text-left font-medium">Capability</th>
                      <th className="px-3 text-center font-medium">Raw NWP</th>
                      <th className="px-3 text-center font-medium">Generic ML</th>
                      <th className="px-3 text-center font-medium">Regime ML</th>
                      <th className="px-3 text-center font-medium bg-primary/10">SPECTRA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/40 font-label-md text-label-md">
                    {CAPABILITY.map(row => (
                      <tr key={row.cap} className="h-9 hover:bg-surface-container-low">
                        <td className="px-3 font-body-sm text-body-sm text-on-surface font-semibold">{row.cap}</td>
                        {[row.rawNwp, row.genericML, row.regimeML].map((val, i) => (
                          <td key={i} className={`px-3 text-center font-label-sm text-label-sm
                            ${val === '✓' ? 'text-secondary font-bold' : val === '—' ? 'text-outline' : 'text-[#D97706] font-medium'}`}>
                            {val}
                          </td>
                        ))}
                        <td className={`px-3 text-center font-label-sm text-label-sm font-bold bg-primary/5
                          ${row.spectra.startsWith('✓') ? 'text-primary' : 'text-outline'}`}>
                          {row.spectra}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-2 p-space-sm bg-surface-container-low border border-outline-variant rounded-DEFAULT font-body-sm text-body-sm text-on-surface-variant">
                <span className="font-semibold text-on-surface">&quot;Most post-processors ask: what rainfall value should replace the forecast?&quot;</span>{' '}
                SPECTRA first asks: <span className="text-primary font-semibold">is this forecast failing, how is it failing, and is changing it justified?</span> — spec §63
              </div>
            </div>
          )}
        </div>
      </Card>

      <WorkflowDock
        label="VERIFICATION COMPLETE — 49/49 SPEC ELEMENTS"
        left="All spec §27 metrics · Ablation §25 · Intervention §26 · FSS §28 · Calibration §27.2"
        onContinue={() => onNavigate('event-district')}
        continueLabel="RETURN TO EVENT SELECTION"
      />
    </div>
  );
}
