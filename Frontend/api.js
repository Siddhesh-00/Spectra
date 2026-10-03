/**
 * SPECTRA 4.1 — Frontend API Client
 * Talks to the FastAPI backend (http://localhost:8000/api/*)
 * Falls back gracefully to the baked-in synthetic UI data
 * if the backend is not running (spec §58.4: demo must work offline).
 */

const API_BASE = '/api';

async function apiFetch(path, opts = {}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opts,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn(`[SPECTRA API] ${path} failed (${e.message}) — using synthetic UI data`);
    return null;   // caller handles null → keeps existing DOM data
  }
}

// ── Events (Screen 01) ────────────────────────────────────────
export async function fetchEvents(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  return apiFetch(`/events${params ? '?' + params : ''}`);
}

export async function fetchEventDetail(eventId) {
  return apiFetch(`/events/${encodeURIComponent(eventId)}`);
}

// ── Forecast Diagnosis (Screen 02) ───────────────────────────
export async function fetchForecastDiagnosis(eventId) {
  return apiFetch(`/forecast/${encodeURIComponent(eventId)}`);
}

// ── Correction (Screen 03) ────────────────────────────────────
export async function fetchCorrectionSummary(eventId) {
  return apiFetch(`/correction/${encodeURIComponent(eventId)}`);
}

// ── District Product (Screen 04) ─────────────────────────────
export async function fetchDistrictProducts(eventId) {
  return apiFetch(`/district/${encodeURIComponent(eventId)}`);
}

export async function fetchDistrictDetail(eventId, district) {
  return apiFetch(`/district/${encodeURIComponent(eventId)}/${encodeURIComponent(district)}`);
}

// ── Verification (Screen 05) ──────────────────────────────────
export async function fetchVerificationMetrics(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  return apiFetch(`/verification/metrics${params ? '?' + params : ''}`);
}

export async function fetchContingency(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  return apiFetch(`/verification/contingency${params ? '?' + params : ''}`);
}

export async function fetchAblation() {
  return apiFetch('/verification/ablation');
}

// ── Health ────────────────────────────────────────────────────
export async function checkHealth() {
  return apiFetch('/health');
}
