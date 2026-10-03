/**
 * SPECTRA — API Service Layer
 * Connects the React frontend to the FastAPI backend.
 */

const BASE = '';

async function get(path) {
  try {
    const res = await fetch(`${BASE}${path}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[SPECTRA API] ${path} failed — using local fallback`, err.message);
    return null;
  }
}

// ── Events (Screen 01) ────────────────────────────────────────────
export async function fetchEvents({ district = '', pattern = '' } = {}) {
  const params = new URLSearchParams();
  if (district) params.set('district', district);
  if (pattern)  params.set('weather_pattern', pattern);
  const qs = params.toString() ? `?${params}` : '';
  return get(`/api/events/${qs}`);
}

export async function fetchEventDetail(eventId) {
  return get(`/api/events/${eventId}`);
}

// ── Forecast Diagnosis (Screen 02) ───────────────────────────────
export async function fetchForecast(eventId) {
  return get(`/api/forecast/${eventId}`);
}

// ── Correction (Screen 03) ────────────────────────────────────────
export async function fetchCorrection(eventId) {
  return get(`/api/correction/${eventId}`);
}

// ── District Product (Screen 04) ─────────────────────────────────
export async function fetchDistricts(eventId) {
  return get(`/api/district/${eventId}`);
}

// ── Verification (Screen 05) ──────────────────────────────────────
export async function fetchVerification(eventId) {
  return get(`/api/verification/${eventId}`);
}

// ── Health ────────────────────────────────────────────────────────
export async function checkHealth() {
  return get('/api/health');
}
