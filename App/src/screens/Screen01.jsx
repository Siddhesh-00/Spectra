import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import SpectraTile from '../components/SpectraTile';
import { Icon, SectionHeader, StepBreadcrumb, Card, CardHeader, Badge, DecisionBadge, WorkflowDock } from '../components/Primitives';
import { fetchEvents } from '../services/api';

// ── All 36 Maharashtra districts ──────────────────────────────────────────
const MH_DISTRICTS = [
  { name: 'Raigad',          lat: 18.52, lng: 73.18, division: 'Konkan',     rainfall_mean: 185, nwp_max: 158, spectra_max: 212, decision: 'COMBINE' },
  { name: 'Ratnagiri',       lat: 16.99, lng: 73.30, division: 'Konkan',     rainfall_mean: 165, nwp_max: 138, spectra_max: 192, decision: 'COMBINE' },
  { name: 'Sindhudurg',      lat: 16.05, lng: 73.55, division: 'Konkan',     rainfall_mean: 155, nwp_max: 128, spectra_max: 178, decision: 'COMBINE' },
  { name: 'Thane',           lat: 19.20, lng: 73.00, division: 'Konkan',     rainfall_mean: 124, nwp_max: 104, spectra_max: 138, decision: 'COMBINE' },
  { name: 'Palghar',         lat: 19.70, lng: 72.76, division: 'Konkan',     rainfall_mean: 118, nwp_max:  98, spectra_max: 132, decision: 'COMBINE' },
  { name: 'Mumbai City',     lat: 18.97, lng: 72.82, division: 'Konkan',     rainfall_mean:  88, nwp_max:  72, spectra_max:  90, decision: 'KEEP_ORIGINAL' },
  { name: 'Mumbai Suburban', lat: 19.10, lng: 72.87, division: 'Konkan',     rainfall_mean:  80, nwp_max:  66, spectra_max:  82, decision: 'KEEP_ORIGINAL' },
  { name: 'Pune',            lat: 18.52, lng: 73.85, division: 'Pune',       rainfall_mean: 138, nwp_max: 110, spectra_max: 162, decision: 'COMBINE' },
  { name: 'Satara',          lat: 17.69, lng: 73.99, division: 'Pune',       rainfall_mean: 112, nwp_max:  92, spectra_max: 130, decision: 'COMBINE' },
  { name: 'Sangli',          lat: 16.86, lng: 74.57, division: 'Pune',       rainfall_mean:  72, nwp_max:  64, spectra_max:  76, decision: 'KEEP_ORIGINAL' },
  { name: 'Solapur',         lat: 17.68, lng: 75.90, division: 'Pune',       rainfall_mean:  55, nwp_max:  48, spectra_max:  58, decision: 'KEEP_ORIGINAL' },
  { name: 'Kolhapur',        lat: 16.71, lng: 74.22, division: 'Pune',       rainfall_mean: 102, nwp_max:  84, spectra_max: 118, decision: 'COMBINE' },
  { name: 'Nashik',          lat: 19.99, lng: 73.79, division: 'Nashik',     rainfall_mean:  88, nwp_max:  74, spectra_max:  96, decision: 'COMBINE' },
  { name: 'Dhule',           lat: 20.90, lng: 74.78, division: 'Nashik',     rainfall_mean:  64, nwp_max:  56, spectra_max:  68, decision: 'KEEP_ORIGINAL' },
  { name: 'Jalgaon',         lat: 21.00, lng: 75.56, division: 'Nashik',     rainfall_mean:  58, nwp_max:  50, spectra_max:  62, decision: 'KEEP_ORIGINAL' },
  { name: 'Nandurbar',       lat: 21.37, lng: 74.24, division: 'Nashik',     rainfall_mean:  78, nwp_max:  66, spectra_max:  84, decision: 'COMBINE' },
  { name: 'Ahmednagar',      lat: 19.09, lng: 74.74, division: 'Nashik',     rainfall_mean:  68, nwp_max:  58, spectra_max:  72, decision: 'KEEP_ORIGINAL' },
  { name: 'Aurangabad',      lat: 19.87, lng: 75.34, division: 'Aurangabad', rainfall_mean:  52, nwp_max:  46, spectra_max:  54, decision: 'KEEP_ORIGINAL' },
  { name: 'Jalna',           lat: 19.84, lng: 75.89, division: 'Aurangabad', rainfall_mean:  48, nwp_max:  42, spectra_max:  50, decision: 'KEEP_ORIGINAL' },
  { name: 'Beed',            lat: 18.99, lng: 75.76, division: 'Aurangabad', rainfall_mean:  42, nwp_max:  38, spectra_max:  44, decision: 'KEEP_ORIGINAL' },
  { name: 'Osmanabad',       lat: 18.17, lng: 76.07, division: 'Aurangabad', rainfall_mean:  38, nwp_max:  34, spectra_max:  40, decision: 'KEEP_ORIGINAL' },
  { name: 'Latur',           lat: 18.40, lng: 76.56, division: 'Aurangabad', rainfall_mean:  36, nwp_max:  32, spectra_max:  38, decision: 'KEEP_ORIGINAL' },
  { name: 'Nanded',          lat: 19.15, lng: 77.31, division: 'Aurangabad', rainfall_mean:  55, nwp_max:  48, spectra_max:  60, decision: 'KEEP_ORIGINAL' },
  { name: 'Hingoli',         lat: 19.72, lng: 77.15, division: 'Aurangabad', rainfall_mean:  58, nwp_max:  50, spectra_max:  62, decision: 'KEEP_ORIGINAL' },
  { name: 'Parbhani',        lat: 19.27, lng: 76.78, division: 'Aurangabad', rainfall_mean:  50, nwp_max:  44, spectra_max:  52, decision: 'KEEP_ORIGINAL' },
  { name: 'Amravati',        lat: 20.93, lng: 77.78, division: 'Amravati',   rainfall_mean:  75, nwp_max:  64, spectra_max:  82, decision: 'COMBINE' },
  { name: 'Yavatmal',        lat: 20.40, lng: 78.12, division: 'Amravati',   rainfall_mean:  68, nwp_max:  58, spectra_max:  74, decision: 'COMBINE' },
  { name: 'Wardha',          lat: 20.74, lng: 78.60, division: 'Amravati',   rainfall_mean:  72, nwp_max:  62, spectra_max:  78, decision: 'COMBINE' },
  { name: 'Akola',           lat: 20.71, lng: 77.00, division: 'Amravati',   rainfall_mean:  60, nwp_max:  52, spectra_max:  64, decision: 'KEEP_ORIGINAL' },
  { name: 'Washim',          lat: 20.11, lng: 77.14, division: 'Amravati',   rainfall_mean:  55, nwp_max:  48, spectra_max:  58, decision: 'KEEP_ORIGINAL' },
  { name: 'Buldhana',        lat: 20.53, lng: 76.18, division: 'Amravati',   rainfall_mean:  58, nwp_max:  50, spectra_max:  62, decision: 'KEEP_ORIGINAL' },
  { name: 'Nagpur',          lat: 21.15, lng: 79.09, division: 'Nagpur',     rainfall_mean:  82, nwp_max:  70, spectra_max:  90, decision: 'COMBINE' },
  { name: 'Bhandara',        lat: 21.17, lng: 79.65, division: 'Nagpur',     rainfall_mean:  88, nwp_max:  74, spectra_max:  96, decision: 'COMBINE' },
  { name: 'Gondia',          lat: 21.46, lng: 80.19, division: 'Nagpur',     rainfall_mean:  92, nwp_max:  78, spectra_max: 102, decision: 'COMBINE' },
  { name: 'Chandrapur',      lat: 19.96, lng: 79.30, division: 'Nagpur',     rainfall_mean:  75, nwp_max:  64, spectra_max:  82, decision: 'COMBINE' },
  { name: 'Gadchiroli',      lat: 20.18, lng: 80.00, division: 'Nagpur',     rainfall_mean:  80, nwp_max:  68, spectra_max:  88, decision: 'COMBINE' },
];

const DIVISIONS = ['All Divisions', 'Konkan', 'Pune', 'Nashik', 'Aurangabad', 'Amravati', 'Nagpur'];
const DIVISION_COLORS = {
  Konkan: '#1e40af', Pune: '#0f766e', Nashik: '#7c3aed',
  Aurangabad: '#b45309', Amravati: '#dc2626', Nagpur: '#0369a1',
};

const LOCAL_EVENTS = [
  { id: 'MONSOON-DEP-07',     date: '2024-07-26', district: 'Raigad',     cycle: '00 UTC', lead: '+24h', source: 'GFS 0.25°', pattern: 'ACTIVE MONSOON + MONSOON LOW',  peak: 242.4, lat: 18.52, lng: 73.18 },
  { id: 'MONSOON-DEP-05',     date: '2024-07-21', district: 'Ratnagiri',  cycle: '00 UTC', lead: '+24h', source: 'GFS 0.25°', pattern: 'OFFSHORE TROUGH',               peak: 198.0, lat: 16.99, lng: 73.30 },
  { id: 'OROGRAPHIC-SURGE-02',date: '2024-07-15', district: 'Pune',       cycle: '00 UTC', lead: '+48h', source: 'GFS 0.25°', pattern: 'OROGRAPHIC SURGE',              peak: 165.5, lat: 18.52, lng: 73.85 },
  { id: 'MONSOON-LOW-09',     date: '2024-08-11', district: 'Thane',      cycle: '00 UTC', lead: '+72h', source: 'GFS 0.25°', pattern: 'ACTIVE MONSOON SURGE',          peak: 148.2, lat: 19.20, lng: 73.00 },
  { id: 'TROUGH-EMB-01',      date: '2024-09-02', district: 'Sindhudurg', cycle: '00 UTC', lead: '+24h', source: 'GFS 0.25°', pattern: 'COASTAL CONVERGENCE',           peak: 184.6, lat: 16.05, lng: 73.55 },
  { id: 'BREAK-MONSOON-03',   date: '2024-08-25', district: 'Nashik',     cycle: '00 UTC', lead: '+48h', source: 'GFS 0.25°', pattern: 'BREAK MONSOON',                 peak:  42.1, lat: 19.99, lng: 73.79 },
];

const MAP_TILES = ['terrain', 'osm'];
const MAP_TILE_LABELS = { terrain: '🗻 Terrain', osm: '🗺 OSM' };

// ── Rainfall intensity → color gradient (professional forecast palette) ──
function rainfallColor(mm) {
  if (mm >= 204.5) return { fill: '#7e0023', opacity: 0.92 }; // Extreme — deep crimson
  if (mm >= 115.6) return { fill: '#ba1a1a', opacity: 0.88 }; // Very Heavy — red
  if (mm >=  64.5) return { fill: '#D97706', opacity: 0.82 }; // Heavy — amber
  if (mm >=  35.5) return { fill: '#1d6f42', opacity: 0.75 }; // Moderate — green
  if (mm >=  15.5) return { fill: '#1e40af', opacity: 0.65 }; // Light — blue
  return                  { fill: '#64748b', opacity: 0.40 }; // Trace — grey
}

function rainfallRadius(mm) {
  if (mm >= 204.5) return 22;
  if (mm >= 115.6) return 18;
  if (mm >=  64.5) return 14;
  if (mm >=  35.5) return 10;
  if (mm >=  15.5) return 7;
  return 5;
}

// ── Leaflet map controller — flies to selected district ──────────────────
function MapController({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], 9, { duration: 1.2, easeLinearity: 0.4 });
    }
  }, [target, map]);
  return null;
}

export default function Screen01({ onNavigate }) {
  const [selected, setSelected]           = useState('MONSOON-DEP-07');
  const [division, setDivision]           = useState('All Divisions');
  const [lead, setLead]                   = useState('All');
  const [mapTile, setMapTile]             = useState('terrain');
  const [events, setEvents]               = useState(LOCAL_EVENTS);
  const [apiStatus, setApiStatus]         = useState('idle');
  const [mapTarget, setMapTarget]         = useState(null);
  const [hoveredDistrict, setHoveredDistrict] = useState(null);

  // Search
  const [searchQ, setSearchQ]             = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown]   = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  const selectedEvent = events.find(e => e.id === selected);
  const selectedDistrict = selectedEvent
    ? MH_DISTRICTS.find(d => d.name === selectedEvent.district)
    : null;

  // ── Backend fetch ──────────────────────────────────────────────
  useEffect(() => {
    setApiStatus('loading');
    fetchEvents().then(data => {
      if (data?.events?.length) {
        setEvents(data.events.map(e => ({
          id: e.event_id, date: e.event_date, district: e.district,
          cycle: e.cycle, lead: e.lead_time, source: e.source,
          pattern: e.weather_pattern, peak: e.peak_obs_mm,
          lat: e.lat, lng: e.lng,
        })));
        setApiStatus('ok');
      } else {
        setApiStatus('offline');
      }
    }).catch(() => setApiStatus('offline'));
  }, []);

  // ── When event selected, fly map to district ───────────────────
  const handleSelectEvent = useCallback((id) => {
    setSelected(id);
    const evt = events.find(e => e.id === id);
    const dist = evt ? MH_DISTRICTS.find(d => d.name === evt.district) : null;
    if (dist) setMapTarget({ ...dist });
  }, [events]);

  // ── District search ────────────────────────────────────────────
  const handleSearch = useCallback((q) => {
    setSearchQ(q);
    clearTimeout(debounceRef.current);
    if (!q.trim()) { setSearchResults([]); setShowDropdown(false); return; }
    debounceRef.current = setTimeout(() => {
      const lower = q.toLowerCase();
      const hits = MH_DISTRICTS.filter(d =>
        d.name.toLowerCase().includes(lower) || d.division.toLowerCase().includes(lower)
      ).slice(0, 8);
      setSearchResults(hits);
      setShowDropdown(hits.length > 0);
    }, 180);
  }, []);

  const handleSelectDistrict = (d) => {
    setSearchQ(d.name);
    setDivision(d.division);
    setMapTarget({ ...d });
    setShowDropdown(false);
  };

  useEffect(() => {
    const h = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowDropdown(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // ── Filtered events ────────────────────────────────────────────
  const filtered = events.filter(e => {
    if (division !== 'All Divisions') {
      const d = MH_DISTRICTS.find(m => m.name === e.district);
      if (!d || d.division !== division) return false;
    }
    if (lead !== 'All') return e.lead === lead;
    return true;
  });

  return (
    <div className="p-space-lg flex flex-col gap-space-md">
      <SectionHeader stage="01" total="05" title="Event / District Selection"
        desc="Select a historical heavy-rainfall event over Maharashtra to load into the SPECTRA correction pipeline."
      >
        <StepBreadcrumb steps={['Event / District','Forecast Diagnosis','Before / After','District Product','Verification']} currentStep={1} onNavigate={onNavigate} />
      </SectionHeader>

      {/* API Status */}
      <div className={`flex items-center gap-2 px-space-sm py-1.5 rounded-DEFAULT border font-label-sm text-label-sm
        ${apiStatus === 'ok' ? 'border-secondary/30 bg-secondary/5 text-secondary' : 'border-outline-variant bg-surface-container-low text-outline'}`}>
        <Icon name={apiStatus === 'ok' ? 'cloud_done' : apiStatus === 'offline' ? 'cloud_off' : 'sync'} className="text-[14px]" />
        <span>
          {apiStatus === 'ok'      ? 'Backend connected — SPECTRA API live at localhost:8000' :
           apiStatus === 'offline' ? 'Backend offline — showing local demo data · Run: cd Backend && python3 -m uvicorn main:app --reload' :
           'Connecting to SPECTRA API…'}
        </span>
        <a href="http://localhost:8000/api/docs" target="_blank" rel="noreferrer" className="ml-auto font-mono text-[9px] uppercase opacity-70 hover:opacity-100 underline">
          API DOCS ↗
        </a>
      </div>

      {/* Filter bar */}
      <Card>
        <div className="p-space-sm grid grid-cols-1 md:grid-cols-4 gap-space-sm items-end">
          {/* Search */}
          <div className="flex flex-col md:col-span-2 relative" ref={searchRef}>
            <label className="font-label-sm text-label-sm text-outline uppercase mb-1">
              District / Location Search <span className="text-primary ml-1">— All 36 Maharashtra Districts</span>
            </label>
            <div className="relative">
              <Icon name="search" className="absolute left-2 top-1.5 text-outline text-[16px] z-10" />
              <input type="text" value={searchQ} onChange={e => handleSearch(e.target.value)}
                onFocus={() => searchQ && setShowDropdown(searchResults.length > 0)}
                placeholder="e.g. Raigad, Konkan, Nashik Division…"
                className="w-full h-8 pl-8 pr-8 bg-surface-container border border-outline-variant rounded-DEFAULT font-label-md text-label-md text-on-surface focus:outline-none focus:border-primary" />
              {searchQ && <button onClick={() => { setSearchQ(''); setShowDropdown(false); setMapTarget({ lat: 18.8, lng: 76.2, name: 'reset' }); }}
                className="absolute right-2 top-1.5 text-outline hover:text-on-surface">
                <Icon name="close" className="text-[14px]" />
              </button>}
            </div>
            {showDropdown && (
              <div className="absolute top-[4.2rem] left-0 right-0 z-[9999] bg-surface-container border border-outline-variant rounded-DEFAULT shadow-xl overflow-hidden">
                {searchResults.map(d => {
                  const col = rainfallColor(d.rainfall_mean);
                  return (
                    <button key={d.name} onClick={() => handleSelectDistrict(d)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-surface-container-high text-left border-b border-outline-variant/40 last:border-0">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: col.fill }} />
                      <span className="font-label-md text-label-md text-on-surface font-semibold">{d.name}</span>
                      <span className="text-outline font-label-sm text-[10px]">{d.division} Division</span>
                      <span className="ml-auto font-mono text-[10px] text-on-surface-variant">~{d.rainfall_mean} mm</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {/* Division */}
          <div className="flex flex-col">
            <label className="font-label-sm text-label-sm text-outline uppercase mb-1">Division</label>
            <select value={division} onChange={e => setDivision(e.target.value)}
              className="h-8 px-2 bg-surface-container border border-outline-variant rounded-DEFAULT font-label-md text-label-md text-on-surface focus:outline-none focus:border-primary">
              {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          {/* Lead */}
          <div className="flex flex-col">
            <label className="font-label-sm text-label-sm text-outline uppercase mb-1">Forecast Lead</label>
            <select value={lead} onChange={e => setLead(e.target.value)}
              className="h-8 px-2 bg-surface-container border border-outline-variant rounded-DEFAULT font-label-md text-label-md text-on-surface focus:outline-none focus:border-primary">
              <option value="All">All Lead Times</option>
              <option value="+24h">+24h (Day 1)</option>
              <option value="+48h">+48h (Day 2)</option>
              <option value="+72h">+72h (Day 3)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main: Table + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">

        {/* Left: Event list */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader title="Historical Rainfall Events — Maharashtra" right={
              <Badge label={`${filtered.length} EVENTS`} variant="primary" />
            } />
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-outline-variant">
                    {['Event ID','Date','District','Pattern','Lead','Peak Obs.',''].map(h => (
                      <th key={h} className="px-3 py-2 font-label-sm text-label-sm text-outline uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(e => {
                    const isSel = e.id === selected;
                    const col = rainfallColor(e.peak);
                    return (
                      <tr key={e.id} onClick={() => handleSelectEvent(e.id)}
                        className={`border-b border-outline-variant cursor-pointer transition-colors
                          ${isSel ? 'bg-primary/8' : 'hover:bg-surface-container-low'}`}>
                        <td className="px-3 py-2">
                          <span className="font-mono text-[10px] font-bold text-on-surface">{e.id}</span>
                        </td>
                        <td className="px-3 py-2 font-mono text-[10px] text-on-surface-variant whitespace-nowrap">{e.date}</td>
                        <td className="px-3 py-2 font-label-md text-label-md text-on-surface font-semibold whitespace-nowrap">{e.district}</td>
                        <td className="px-3 py-2 font-label-sm text-[10px] text-on-surface-variant">{e.pattern}</td>
                        <td className="px-3 py-2 font-mono text-[10px] text-outline">{e.lead}</td>
                        <td className="px-3 py-2">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: col.fill }} />
                            <span className="font-mono text-[11px] font-bold" style={{ color: col.fill }}>{e.peak} mm</span>
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {isSel && <Icon name="my_location" className="text-primary text-[16px]" />}
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="px-3 py-4 text-center font-label-sm text-outline">No events match the filter.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Selected event metadata */}
            {selectedEvent && (
              <div className="border-t border-outline-variant">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm p-space-sm">
                  {[
                    ['Event ID', selectedEvent.id],
                    ['Date', selectedEvent.date],
                    ['District', selectedEvent.district],
                    ['Cycle', selectedEvent.cycle],
                    ['Lead Time', selectedEvent.lead],
                    ['Source', selectedEvent.source],
                    ['Peak Obs.', `${selectedEvent.peak} mm`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-outline uppercase">{k}</span>
                      <span className="font-label-md text-label-md font-semibold text-on-surface mt-0.5">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="px-space-sm pb-space-sm">
                  <div className="p-space-sm bg-surface-container-low border border-outline-variant rounded-DEFAULT flex items-center justify-between">
                    <div>
                      <span className="font-label-sm text-label-sm text-outline uppercase">Weather Pattern</span>
                      <div className="font-headline-sm text-headline-sm font-bold text-primary mt-0.5">{selectedEvent.pattern}</div>
                    </div>
                    {selectedDistrict && (
                      <div className="text-right">
                        <span className="font-label-sm text-label-sm text-outline uppercase">Forecast Lead</span>
                        <div className="mt-0.5 font-headline-sm text-headline-sm font-bold text-primary font-mono">+24h Valid</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right: GIS Map */}
        <div className="lg:col-span-5">
          <Card className="overflow-hidden">
            <CardHeader title="Maharashtra Rainfall Map — SPECTRA Corrected" right={
              <div className="flex gap-1">
                {MAP_TILES.map(t => (
                  <button key={t} onClick={() => setMapTile(t)}
                    className={`px-2 py-0.5 text-[9px] font-bold rounded border uppercase transition-all
                      ${mapTile === t ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant text-outline hover:bg-surface-container'}`}>
                    {MAP_TILE_LABELS[t]}
                  </button>
                ))}
              </div>
            } />

            <div className="relative" style={{ height: 490 }}>
              <MapContainer center={[18.8, 76.2]} zoom={6} style={{ height: '100%', width: '100%' }} zoomControl={false} attributionControl={false}>
                <SpectraTile variant={mapTile} />
                <MapController target={mapTarget} />

                {/* All 36 districts — SPECTRA corrected rainfall */}
                {MH_DISTRICTS.map(d => {
                  const isEvtDistrict = selectedEvent?.district === d.name;
                  const col = rainfallColor(d.spectra_max);
                  const r   = rainfallRadius(d.spectra_max);
                  return (
                    <CircleMarker key={d.name}
                      center={[d.lat, d.lng]}
                      radius={isEvtDistrict ? r + 6 : r}
                      fillOpacity={isEvtDistrict ? 0.92 : col.opacity}
                      pathOptions={{
                        color: isEvtDistrict ? '#fff' : 'transparent',
                        fillColor: col.fill,
                        weight: isEvtDistrict ? 2 : 0,
                      }}
                      eventHandlers={{
                        mouseover: () => setHoveredDistrict(d),
                        mouseout:  () => setHoveredDistrict(null),
                      }}
                    >
                      <Tooltip permanent={isEvtDistrict} direction="top" offset={[0, -4]}>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, lineHeight: 1.4 }}>
                          <strong>{d.name}</strong><br />
                          NWP: {d.nwp_max} mm &nbsp; SPECTRA: {d.spectra_max} mm<br />
                          Decision: <strong>{d.decision.replace('_',' ')}</strong>
                        </div>
                      </Tooltip>
                    </CircleMarker>
                  );
                })}

                {/* Event markers (star-like, larger) */}
                {events.map(evt => {
                  const isSel = evt.id === selected;
                  return (
                    <CircleMarker key={evt.id}
                      center={[evt.lat, evt.lng]}
                      radius={isSel ? 6 : 4}
                      fillOpacity={isSel ? 1 : 0.7}
                      pathOptions={{ color: isSel ? '#fff' : '#fff', fillColor: isSel ? '#ba1a1a' : '#94a3b8', weight: 1.5 }}
                      eventHandlers={{ click: () => handleSelectEvent(evt.id) }}>
                      <Tooltip>{evt.district}: {evt.peak} mm obs</Tooltip>
                    </CircleMarker>
                  );
                })}
              </MapContainer>

              {/* Hovered district info */}
              {hoveredDistrict && (
                <div className="absolute top-2 right-2 z-[999] bg-[rgba(0,0,0,0.80)] text-white rounded-DEFAULT px-3 py-2 font-mono text-[10px] leading-relaxed">
                  <div className="font-bold text-[12px] mb-1">{hoveredDistrict.name}</div>
                  <div>Division: {hoveredDistrict.division}</div>
                  <div>NWP Max: <span className="text-yellow-300">{hoveredDistrict.nwp_max} mm</span></div>
                  <div>Rainfall: <span className="text-cyan-300 font-bold">{hoveredDistrict.rainfall_mean} mm</span></div>
                </div>
              )}

              {/* Demo data notice in unutilized bottom-left corner of map */}
              <div className="absolute bottom-2 left-2 z-[999] bg-[rgba(0,0,0,0.60)] text-white/75 rounded px-2 py-0.5 font-mono text-[8.5px] flex items-center gap-1.5 select-none pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 shrink-0" />
                <span>Demo data · Real-time pipeline yet to be implemented</span>
              </div>

              {/* Tile label */}
              <div className="absolute bottom-2 right-2 z-[999] bg-[rgba(0,0,0,0.60)] text-white rounded px-2 py-0.5 font-mono text-[9px]">
                {mapTile === 'terrain' ? 'OpenTopoMap' : 'OpenStreetMap'}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="flex justify-end -mt-2 -mb-1 pr-1">
        <span className="font-mono text-[9px] text-outline/60">
          * Demo prototype data · Real observational feed yet to be implemented
        </span>
      </div>

      <WorkflowDock
        label="EVENT LOADED — READY FOR DIAGNOSIS"
        left={selectedEvent ? `${selectedEvent.id} / ${selectedEvent.district} / ${selectedEvent.date} / ${selectedEvent.lead}` : 'Select an event above'}
        onContinue={() => onNavigate('forecast-diagnosis')}
        continueLabel="CONTINUE TO FORECAST DIAGNOSIS"
      />
    </div>
  );
}
