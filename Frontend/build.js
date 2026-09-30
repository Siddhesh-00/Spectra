const fs = require('fs');
const path = require('path');

const baseDir = '/Users/siddhesh/Downloads/Spectra-69/Frontend';

// ── Collect screen content ─────────────────────────────────────
const screens = [
  { id: 'event-district',     num: '01', label: 'Event / District',    file: 'event_district_selection/code.html' },
  { id: 'forecast-diagnosis', num: '02', label: 'Forecast Diagnosis',   file: '02_forecast_diagnosis/code.html' },
  { id: 'before-after',       num: '03', label: 'Before / After',       file: 'before_after_observation_quad_workstation/code.html' },
  { id: 'district-product',   num: '04', label: 'District Product',     file: 'district_product_split_workstation/code.html' },
  { id: 'verification',       num: '05', label: 'Verification',         file: 'forecast_accuracy_analytical_triptych/code.html' },
];

function extractMain(html) {
  // Extract content between <main ...> and </main>
  const match = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  return match ? match[1].trim() : '';
}

function extractInlineScripts(html) {
  // Pull out <script> blocks that are NOT the tailwind-config and NOT external (no src)
  const scripts = [];
  const re = /<script(?![^>]*src)(?![^>]*id="tailwind-config")[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const code = m[1].trim();
    if (code.length > 10) scripts.push(code);
  }
  return scripts;
}

function cleanMainContent(html) {
  // Remove internal <script> blocks from the main content string
  // (we'll relocate them to the bottom as named functions)
  return html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
}

function injectLeafletBg(html) {
  // Find map container divs (relative overflow-hidden h-X bg-surface) and inject Leaflet container
  // We look for: <div class="relative w-full h-XX ... overflow-hidden ...">
  // Then inject a div INSIDE before the first child SVG
  return html.replace(
    /(<div\s[^>]*class="[^"]*\brelative\b[^"]*\boverflow-hidden\b[^"]*"[^>]*>)\s*(<svg)/g,
    (match, divOpen, svgTag) => {
      // Only inject if there isn't already a leaflet-bg in this context
      return `${divOpen}\n<div class="leaflet-map-bg" style="position:absolute;inset:0;z-index:0;"></div>\n${svgTag}`;
    }
  );
}

// ── Build HTML ─────────────────────────────────────────────────
let screenSections = '';
const allExtraScripts = [];

screens.forEach((s, idx) => {
  const raw = fs.readFileSync(path.join(baseDir, s.file), 'utf8');
  let mainContent = extractMain(raw);
  const scripts = extractInlineScripts(raw);
  allExtraScripts.push(...scripts.map(sc => `// == ${s.id} screen scripts ==\n${sc}`));
  
  mainContent = cleanMainContent(mainContent);
  mainContent = injectLeafletBg(mainContent);
  
  const hidden = idx === 0 ? '' : ' hidden';
  screenSections += `\n<!-- ========== SCREEN ${s.num}: ${s.label.toUpperCase()} ========== -->\n<section id="${s.id}" class="screen-section${hidden}">\n${mainContent}\n</section>\n`;
});

// ── Tailwind config (from screen 1) ────────────────────────────
const screen1Raw = fs.readFileSync(path.join(baseDir, screens[0].file), 'utf8');
const twMatch = screen1Raw.match(/tailwind\.config\s*=\s*(\{[\s\S]*?\});/);
const twConfigStr = twMatch ? twMatch[0] : 'tailwind.config = {};';

// ── The complete index.html ─────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SPECTRA 4.1 — Rainfall Forecast Intelligence</title>

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">

  <!-- Leaflet CSS (free, no API key required) -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">

  <!-- Tailwind CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>${twConfigStr}</script>

  <style>
    @layer base {
      html, body { margin: 0; padding: 0; }
      body { overscroll-behavior: none; }
    }
    ::-webkit-scrollbar { display: none; }
    /* Leaflet map inside SVG overlay panels */
    .leaflet-map-bg { pointer-events: none; }
    .leaflet-map-bg .leaflet-interactive { pointer-events: none; }
    /* Ensure SVG overlays sit above map tiles */
    .map-panel svg { position: relative; z-index: 10; pointer-events: none; }
    /* Remove attribution logo */
    .leaflet-control-attribution { display: none !important; }
    /* Hidden screen sections */
    .screen-section.hidden { display: none !important; }
  </style>
</head>
<body class="bg-surface font-body-md text-body-md text-on-surface antialiased">

  <!-- ══ SIDEBAR ══════════════════════════════════════════════ -->
  <aside class="fixed left-0 top-0 h-screen w-64 bg-surface-container-lowest border-r border-outline-variant z-50 flex flex-col justify-between select-none">
    <div class="flex flex-col">
      <!-- Logo -->
      <div class="h-14 px-space-lg flex flex-col justify-center border-b border-outline-variant bg-surface-container-low">
        <div class="flex items-center gap-space-sm">
          <span class="material-symbols-outlined text-primary text-[18px]">radar</span>
          <span class="font-headline-md text-headline-md font-bold tracking-tight text-on-surface">SPECTRA</span>
        </div>
        <span class="font-body-sm text-body-sm text-on-surface-variant">Rainfall Forecast Intelligence</span>
      </div>
      <!-- Nav label -->
      <div class="px-space-md py-space-sm border-b border-outline-variant bg-surface-container-lowest">
        <span class="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Primary Workflow Steps</span>
      </div>
      <!-- Nav links — active state managed by app.js -->
      <nav class="flex flex-col py-space-xs" id="sidebar-nav">
        <a class="nav-link flex items-center px-space-lg py-space-sm font-label-md text-label-md transition-colors" data-path="event-district" href="#">
          <span class="font-label-md text-label-md text-outline mr-space-md w-5">01</span>Event / District
        </a>
        <a class="nav-link flex items-center px-space-lg py-space-sm font-label-md text-label-md transition-colors" data-path="forecast-diagnosis" href="#">
          <span class="font-label-md text-label-md text-outline mr-space-md w-5">02</span>Forecast Diagnosis
        </a>
        <a class="nav-link flex items-center px-space-lg py-space-sm font-label-md text-label-md transition-colors" data-path="before-after" href="#">
          <span class="font-label-md text-label-md text-outline mr-space-md w-5">03</span>Before / After
        </a>
        <a class="nav-link flex items-center px-space-lg py-space-sm font-label-md text-label-md transition-colors" data-path="district-product" href="#">
          <span class="font-label-md text-label-md text-outline mr-space-md w-5">04</span>District Product
        </a>
        <a class="nav-link flex items-center px-space-lg py-space-sm font-label-md text-label-md transition-colors" data-path="verification" href="#">
          <span class="font-label-md text-label-md text-outline mr-space-md w-5">05</span>Verification
        </a>
      </nav>
    </div>
    <div class="p-space-md border-t border-outline-variant bg-surface-container-lowest">
      <div class="font-label-sm text-label-sm text-outline uppercase font-semibold">SPECTRA • PROTOTYPE REPLAY</div>
      <div class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">NWP Error Correction System</div>
    </div>
  </aside>

  <!-- ══ CONTENT SHELL ═════════════════════════════════════════ -->
  <div class="pl-64">

    <!-- ── HEADER (fixed, consistent across all screens) ── -->
    <header id="app-header" class="fixed top-0 left-64 right-0 h-14 bg-surface-container-lowest border-b border-outline-variant z-40 flex items-center justify-between px-space-lg gap-space-md">
      <!-- Left: context info -->
      <div class="flex items-center divide-x divide-outline-variant overflow-x-auto shrink-0">
        <div class="flex items-center gap-space-xs pr-space-md">
          <span class="font-label-sm text-label-sm text-outline uppercase">Event:</span>
          <span class="font-label-md text-label-md text-on-surface font-medium">MONSOON-DEP-07</span>
        </div>
        <div class="flex items-center gap-space-xs px-space-md">
          <span class="font-label-sm text-label-sm text-outline uppercase">Date:</span>
          <span class="font-label-md text-label-md text-on-surface">2024-07-26</span>
        </div>
        <div class="flex items-center gap-space-xs px-space-md">
          <span class="font-label-sm text-label-sm text-outline uppercase">Cycle:</span>
          <span class="font-label-md text-label-md text-on-surface font-medium text-primary">00 UTC</span>
        </div>
        <div class="flex items-center gap-space-xs pl-space-md">
          <span class="font-label-sm text-label-sm text-outline uppercase">Region:</span>
          <span class="font-label-md text-label-md text-on-surface">W. India / Maharashtra</span>
        </div>
      </div>

      <!-- Center: Workflow Breadcrumb — built by app.js -->
      <div id="spa-breadcrumb" class="flex items-center border border-outline-variant rounded overflow-hidden select-none flex-1 max-w-lg mx-4">
        <!-- Populated by JS -->
      </div>

      <!-- Right: status badges -->
      <div class="flex items-center gap-space-sm shrink-0">
        <div class="flex items-center gap-space-xs px-space-sm py-1 rounded border border-outline-variant bg-surface-container-low text-on-surface-variant">
          <span class="w-1.5 h-1.5 rounded-full bg-secondary"></span>
          <span class="font-label-sm text-label-sm font-semibold tracking-wide uppercase text-secondary">HISTORICAL REPLAY</span>
        </div>
        <div class="flex items-center gap-space-xs px-space-sm py-1 rounded border border-error/20 bg-error-container/50 text-on-error-container">
          <span class="font-label-sm text-label-sm font-medium tracking-wide uppercase">DEMO DATA</span>
        </div>
      </div>
    </header>

    <!-- ── MAIN CONTENT ── -->
    <main class="w-full pt-14 bg-surface min-h-screen">
      ${screenSections}
    </main>

  </div><!-- /pl-64 -->

  <!-- Leaflet JS (free, no API key required) -->
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV/XN/WsQI=" crossorigin=""></script>

  <!-- App SPA controller -->
  <script src="app.js"></script>

</body>
</html>
`;

fs.writeFileSync(path.join(baseDir, 'index.html'), html);
console.log('✅ index.html built successfully!');
console.log(`   Total screens: ${screens.length}`);
