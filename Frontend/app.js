/* =========================================================
   SPECTRA 4.1 — Unified SPA Controller
   Fixes: navigation, breadcrumb consistency, Leaflet maps,
          all interactive components
   ========================================================= */

(function () {
  'use strict';

  /* ── 1. ROUTE / SCREEN DEFINITIONS ────────────────────── */
  const STEPS = [
    { id: 'event-district',    num: '01', label: 'Event / District' },
    { id: 'forecast-diagnosis', num: '02', label: 'Forecast Diagnosis' },
    { id: 'before-after',      num: '03', label: 'Before / After' },
    { id: 'district-product',  num: '04', label: 'District Product' },
    { id: 'verification',      num: '05', label: 'Verification' },
  ];

  let currentStep = 'event-district';
  const maps = {};   // Leaflet map instances keyed by container id

  /* ── 2. HEADER BREADCRUMB (unified, replaces per-screen ones) */
  function buildHeaderBreadcrumb() {
    // Remove any old breadcrumb injected previously
    const old = document.getElementById('spa-breadcrumb');
    if (old) old.remove();

    const header = document.querySelector('header');
    if (!header) return;

    const bc = document.createElement('div');
    bc.id = 'spa-breadcrumb';
    bc.className = 'hidden lg:flex items-center border border-outline-variant rounded overflow-hidden select-none ml-4 shrink-0';

    STEPS.forEach((step, idx) => {
      const isActive = step.id === currentStep;
      const isDone   = STEPS.findIndex(s => s.id === currentStep) > idx;

      const pill = document.createElement('div');
      pill.className = [
        'flex items-center gap-1 px-3 py-1.5 cursor-pointer transition-colors font-label-sm text-label-sm',
        isActive
          ? 'bg-primary text-on-primary font-bold'
          : isDone
          ? 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
          : 'bg-surface-container-lowest text-outline hover:bg-surface-container-low',
      ].join(' ');

      pill.innerHTML = `
        ${isDone ? '<span class="material-symbols-outlined text-[12px] text-secondary">check_circle</span>' : ''}
        <span class="font-label-md text-label-md ${isActive ? 'text-on-primary' : isDone ? 'text-secondary' : 'text-outline'}">${step.num}</span>
        <span class="uppercase tracking-tight hidden xl:inline">${step.label}</span>
      `;
      pill.addEventListener('click', () => navigateTo(step.id));
      bc.appendChild(pill);

      // Chevron separator (not after last)
      if (idx < STEPS.length - 1) {
        const chev = document.createElement('span');
        chev.className = 'material-symbols-outlined text-[14px] text-outline px-0.5 bg-surface-container-lowest';
        chev.textContent = 'chevron_right';
        bc.appendChild(chev);
      }
    });

    // Inject after the existing header info pills (before the right status badges)
    const headerRight = header.querySelector('.shrink-0');
    if (headerRight) {
      header.insertBefore(bc, headerRight);
    } else {
      header.appendChild(bc);
    }
  }

  /* ── 3. PER-SCREEN INLINE BREADCRUMB: Remove duplicates ── */
  function removeInlineBreadcrumbs() {
    // Each screen has an internal stage breadcrumb — remove them all
    // Screen 01: the flex items-center border border-outline-variant rounded overflow-hidden
    const s1 = document.querySelector('#event-district .flex.items-center.border.border-outline-variant.rounded.overflow-hidden');
    if (s1) s1.remove();

    // Screens 02/04/05: The pill breadcrumb strip (inline-flex items-stretch border…)
    document.querySelectorAll('.screen-section .inline-flex.items-stretch.border.border-outline-variant.rounded-DEFAULT.bg-surface-container-low.overflow-hidden').forEach(el => el.remove());

    // Screen 03 has none (just a section wrapper)
    // Screen 05: div.inline-flex ... items-center ... rounded-DEFAULT ... shrink-0
    document.querySelectorAll('.screen-section > div > div > .shrink-0.inline-flex').forEach(el => el.remove());
    // Also the generic "01 CONTEXT / 02 DIAGNOSIS /…" strip that has check_circle icons in s05
    document.querySelectorAll('.screen-section .inline-flex.items-stretch').forEach(el => el.remove());
  }

  /* ── 4. SIDEBAR NAV ACTIVE STATE ─────────────────────── */
  function updateSidebar(activeId) {
    document.querySelectorAll('aside nav a[data-path]').forEach(link => {
      const path = link.getAttribute('data-path');
      const isActive = path === activeId;

      // Remove ALL possible styling variants from other screens
      link.classList.remove(
        'bg-surface-container', 'bg-primary', 'bg-primary-container',
        'text-primary', 'text-on-primary', 'text-on-surface-variant',
        'font-semibold', 'border-l-2', 'border-primary',
        'font-bold', 'shadow-sm'
      );

      if (isActive) {
        // Screen 1 style: bg-surface-container text-primary border-l-2 border-primary font-semibold
        link.classList.add('bg-surface-container', 'text-primary', 'font-semibold', 'border-l-2', 'border-primary');
      } else {
        link.classList.add('text-on-surface-variant');
      }

      // Fix number color inside link
      const numEl = link.querySelector('span:first-child');
      if (numEl) {
        numEl.classList.toggle('text-primary', isActive);
        numEl.classList.toggle('text-outline', !isActive);
      }
    });
  }

  /* ── 5. NAVIGATE ─────────────────────────────────────── */
  function navigateTo(id) {
    const target = STEPS.find(s => s.id === id);
    if (!target) return;

    currentStep = id;
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Show/hide sections
    document.querySelectorAll('.screen-section').forEach(sec => {
      sec.classList.toggle('hidden', sec.id !== id);
    });

    updateSidebar(id);
    buildHeaderBreadcrumb();

    // Reinitialize any maps that are now visible
    setTimeout(() => {
      Object.entries(maps).forEach(([mid, m]) => {
        const el = document.getElementById(mid);
        if (el && el.offsetParent !== null) m.invalidateSize();
      });
    }, 120);
  }

  /* ── 6. LEAFLET MAPS (OSM — truly free, no API key) ──── */
  // Tile: OpenStreetMap standard — no key required at all
  const OSM_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  const OSM_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  // Light CartoDB style — also free, no key
  const CARTO_URL = 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png';
  const CARTO_ATTR = '&copy; OpenStreetMap contributors &copy; CARTO';

  function initMaps() {
    if (typeof L === 'undefined') return;

    // Maharashtra coast: 18.5, 73.2 zoom 7
    const CENTER = [18.5, 73.2];
    const ZOOM = 7;

    // Gather all leaflet-bg divs
    document.querySelectorAll('.leaflet-bg').forEach((div, idx) => {
      if (!div.id) div.id = 'lmap-' + idx;

      // Ensure container has position:relative
      const parent = div.parentElement;
      if (parent) {
        parent.style.position = 'relative';
        parent.style.overflow = 'hidden';
      }

      // Style the div to fill parent
      Object.assign(div.style, {
        position: 'absolute',
        inset: '0',
        zIndex: '0',
      });

      try {
        const map = L.map(div.id, {
          center: CENTER,
          zoom: ZOOM,
          zoomControl: false,
          attributionControl: false,
          dragging: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          touchZoom: false,
          keyboard: false,
        });

        // Use CartoDB light (clean, no labels) — works without API key
        L.tileLayer(CARTO_URL, {
          attribution: CARTO_ATTR,
          subdomains: 'abcd',
          maxZoom: 19,
        }).addTo(map);

        maps[div.id] = map;
      } catch (e) {
        console.warn('Leaflet map init failed for', div.id, e);
      }
    });
  }

  /* ── 7. EVENT ROW SELECTION (Screen 01) ──────────────── */
  function initEventTable() {
    const tbody = document.getElementById('events-table-body');
    if (!tbody) return;

    tbody.querySelectorAll('tr').forEach(row => {
      row.addEventListener('click', function () {
        // Clear all rows
        tbody.querySelectorAll('tr').forEach(r => {
          r.classList.remove('bg-primary-fixed/30', 'border-l-2', 'border-primary');
          const radio = r.querySelector('input[type="radio"]');
          if (radio) radio.checked = false;
          const last = r.querySelector('td:last-child');
          if (last) last.innerHTML = '<button type="button" class="font-label-sm text-label-sm text-on-surface-variant hover:text-primary">Select</button>';
        });

        // Activate clicked row
        this.classList.add('bg-primary-fixed/30', 'border-l-2', 'border-primary');
        const radio = this.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
        const last = this.querySelector('td:last-child');
        if (last) last.innerHTML = '<span class="font-label-sm text-label-sm font-semibold text-primary">SELECTED</span>';
      });
    });
  }

  /* ── 8. SYNCHRONIZED CROSSHAIRS (Screen 03) ─────────── */
  function initCrosshairs() {
    const vpIds = ['gis-viewport-1', 'gis-viewport-2', 'gis-viewport-3'];
    const chIds = ['crosshair-1', 'crosshair-2', 'crosshair-3'];

    const vps = vpIds.map(id => document.getElementById(id)).filter(Boolean);
    const chs = chIds.map(id => document.getElementById(id)).filter(Boolean);

    if (!vps.length) return;

    vps.forEach(vp => {
      vp.addEventListener('mousemove', e => {
        const rect = vp.getBoundingClientRect();
        const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
        chs.forEach(ch => {
          if (ch) { ch.style.left = x + '%'; ch.style.top = y + '%'; }
        });
      });
    });
  }

  /* ── 9. DISTRICT PRODUCT INTERACTIONS (Screen 04) ─────  */
  function initDistrictProduct() {
    // Layer tabs
    const layerTabs = document.querySelectorAll('.layer-tab');
    layerTabs.forEach(tab => {
      tab.addEventListener('click', function () {
        layerTabs.forEach(t => {
          t.classList.remove('bg-surface-container-lowest', 'text-on-surface', 'font-semibold', 'shadow-sm');
          t.classList.add('text-on-surface-variant');
        });
        this.classList.add('bg-surface-container-lowest', 'text-on-surface', 'font-semibold', 'shadow-sm');
        this.classList.remove('text-on-surface-variant');
      });
    });

    // District table rows
    const districtRows = document.querySelectorAll('.district-row');
    districtRows.forEach(row => {
      row.addEventListener('click', function () {
        // Clear active
        districtRows.forEach(r => {
          r.classList.remove('bg-primary-fixed/40');
          r.classList.add('bg-surface-container-lowest');
          const selBadge = r.querySelector('td:first-child .ml-0\\.5');
          if (selBadge) selBadge.remove();
        });

        this.classList.add('bg-primary-fixed/40');
        this.classList.remove('bg-surface-container-lowest');

        // Update summary panel
        const district = this.dataset.district;
        const rain = this.dataset.rain;
        const heavy = this.dataset.heavy;
        const vheavy = this.dataset.vheavy;
        const extreme = this.dataset.extreme;
        const decision = this.dataset.decision;
        const rawNwp = this.dataset.raw;
        const candidate = this.dataset.candidate;

        const nameEl = document.getElementById('summaryDistrictName');
        if (nameEl) nameEl.textContent = district;

        const rainfallEl = document.getElementById('summaryRainfallVal');
        if (rainfallEl) rainfallEl.textContent = rain;

        const heavyEl = document.getElementById('summaryHeavyProb');
        if (heavyEl) heavyEl.textContent = heavy;

        const vheavyEl = document.getElementById('summaryVHeavyProb');
        if (vheavyEl) vheavyEl.textContent = vheavy;

        const extremeEl = document.getElementById('summaryExtremeProb');
        if (extremeEl) extremeEl.textContent = extreme;

        const barH = document.getElementById('barHeavy');
        if (barH) barH.style.width = heavy;
        const barV = document.getElementById('barVHeavy');
        if (barV) barV.style.width = vheavy;
        const barE = document.getElementById('barExtreme');
        if (barE) barE.style.width = extreme;

        const decisionEl = document.getElementById('summaryDecisionBadge');
        if (decisionEl) decisionEl.textContent = decision;

        const rawEl = document.getElementById('valRawNwp');
        if (rawEl) rawEl.textContent = rawNwp + ' mm (GFS 0.25°)';

        const candEl = document.getElementById('valCandidate');
        if (candEl) candEl.textContent = candidate + ' mm';
      });
    });
  }

  /* ── 10. VERIFICATION METRIC TABS (Screen 05) ────────── */
  function initVerificationTabs() {
    const metricBtns = document.querySelectorAll('#verification .inline-flex.border.border-outline-variant button');
    metricBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        metricBtns.forEach(b => {
          b.classList.remove('bg-surface-container-lowest', 'text-primary', 'font-bold', 'border-l', 'border-r', 'border-outline-variant');
          b.classList.add('text-on-surface-variant');
        });
        this.classList.add('bg-surface-container-lowest', 'text-primary', 'font-bold');
        this.classList.remove('text-on-surface-variant');
      });
    });
  }

  /* ── 11. GLOBAL CONTINUE / NAVIGATE BUTTONS ──────────── */
  function initGlobalNavButtons() {
    document.body.addEventListener('click', e => {
      const btn = e.target.closest('button, a');
      if (!btn) return;

      // data-path attribute (verification screen's "return" button)
      const dp = btn.getAttribute('data-path');
      if (dp && STEPS.find(s => s.id === dp)) {
        e.preventDefault();
        navigateTo(dp);
        return;
      }

      const text = (btn.innerText || '').toLowerCase().trim();

      if (text.includes('continue to forecast diagnosis') || btn.id === 'btn-continue') {
        e.preventDefault();
        navigateTo('forecast-diagnosis');
      } else if (text.includes('continue to before') || text.includes('before / after') || text.includes('before/after')) {
        e.preventDefault();
        navigateTo('before-after');
      } else if (text.includes('continue to district')) {
        e.preventDefault();
        navigateTo('district-product');
      } else if (text.includes('continue to verification')) {
        e.preventDefault();
        navigateTo('verification');
      } else if (text.includes('return to event')) {
        e.preventDefault();
        navigateTo('event-district');
      }
    });
  }

  /* ── 12. FIX DUPLICATE TAILWIND CONFIG SCRIPTS ────────── */
  function deduplicateTailwindConfigs() {
    // Keep only the first tailwind-config script, remove rest
    const twScripts = document.querySelectorAll('script[id="tailwind-config"]');
    twScripts.forEach((s, i) => { if (i > 0) s.remove(); });
  }

  /* ── 13. NORMALIZE SIDEBAR ANCHOR STYLES ─────────────── */
  function normalizeSidebarLinks() {
    // Strip any hardcoded active classes that were baked-in from individual screens
    document.querySelectorAll('aside nav a[data-path]').forEach(link => {
      // Remove ALL baked-in active styles
      link.classList.remove(
        'bg-primary', 'bg-primary-container', 'text-on-primary',
        'font-bold', 'shadow-sm', 'aria-current'
      );
      link.removeAttribute('aria-current');

      // Ensure base hover classes are always present
      link.classList.add('hover:bg-surface-container-low', 'hover:text-on-surface');
    });
  }

  /* ── 14. BOOTSTRAP ────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    deduplicateTailwindConfigs();
    normalizeSidebarLinks();
    removeInlineBreadcrumbs();
    buildHeaderBreadcrumb();
    updateSidebar('event-district');

    // Sidebar nav click
    document.querySelectorAll('aside nav a[data-path]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        navigateTo(link.getAttribute('data-path'));
      });
    });

    initGlobalNavButtons();
    initEventTable();
    initCrosshairs();
    initDistrictProduct();
    initVerificationTabs();

    // Init maps (Leaflet) — no API key, fully free OSM/CartoDB
    if (typeof L !== 'undefined') {
      initMaps();
    } else {
      // Leaflet might not have loaded yet — wait for it
      const leafletCheck = setInterval(() => {
        if (typeof L !== 'undefined') {
          clearInterval(leafletCheck);
          initMaps();
        }
      }, 100);
    }
  });

})();
