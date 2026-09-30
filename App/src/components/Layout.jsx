import React from 'react';

const Icon = ({ name, className = '' }) => (
  <span className={`material-symbols-outlined select-none ${className}`}>{name}</span>
);

export default function Layout({ steps, activeStep, onNavigate, children }) {
  const currentStep = steps.find(s => s.id === activeStep);
  const currentIdx  = steps.findIndex(s => s.id === activeStep);

  return (
    <div className="flex min-h-screen bg-surface font-body-md text-body-md text-on-surface antialiased">
      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-low border-r border-outline-variant z-50 flex flex-col select-none">
        <div className="flex flex-col">
          {/* Logo */}
          <div className="h-12 border-b border-outline-variant px-space-lg flex flex-col justify-center bg-surface-container-lowest">
            <div className="flex items-center gap-space-xs">
              <Icon name="radar" className="text-primary text-[18px]" />
              <span className="font-headline-sm text-headline-sm uppercase tracking-wider text-primary font-bold">SPECTRA</span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant truncate">Rainfall Forecast Intelligence</span>
          </div>

          {/* Steps label */}
          <div className="px-space-md py-space-xs border-b border-outline-variant bg-surface-container-high/40 flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase text-outline">Operational Steps</span>
            <span className="font-label-sm text-label-sm text-secondary font-bold">CYCLE RUN</span>
          </div>

          {/* Nav */}
          <nav className="flex flex-col divide-y divide-outline-variant/30">
            {steps.map((step, i) => {
              const isActive   = step.id === activeStep;
              const isComplete = i < currentIdx;
              return (
                <button
                  key={step.id}
                  onClick={() => onNavigate(step.id)}
                  className={`flex items-center px-space-md py-space-sm transition-colors w-full text-left
                    ${isActive
                      ? 'bg-primary-container text-on-primary font-semibold border-l-2 border-primary'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                    }`}
                >
                  <span className={`font-label-md text-label-md w-7 ${isActive ? 'text-on-primary' : 'text-outline'}`}>
                    {step.num}
                  </span>
                  <span className="font-body-md text-body-md tracking-tight">{step.label}</span>
                  {isComplete && (
                    <Icon name="check_circle" className="ml-auto text-[15px] text-secondary" />
                  )}
                  {isActive && (
                    <Icon name="chevron_right" className="ml-auto text-[16px] text-primary" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────── */}
      <div className="pl-64 flex-1 flex flex-col">
        {/* Header — original forecast context bar */}
        <header className="fixed top-0 left-64 right-0 h-12 bg-surface-container-lowest border-b border-outline-variant z-40 flex items-center justify-between px-space-md">
          <div className="flex items-center gap-space-md overflow-x-auto divide-x divide-outline-variant/60">
            <div className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface">
              <span className="text-outline uppercase text-[10px] font-semibold tracking-wide">Event</span>
              <span className="font-bold text-primary font-mono text-[11px]">MONSOON-DEP-07</span>
            </div>
            <div className="pl-space-md flex items-center gap-space-xs font-label-md text-label-md">
              <span className="text-outline uppercase text-[10px] font-semibold tracking-wide">Date</span>
              <span className="font-mono text-[11px]">2024-07-26</span>
            </div>
            <div className="pl-space-md flex items-center gap-space-xs font-label-md text-label-md">
              <span className="text-outline uppercase text-[10px] font-semibold tracking-wide">Cycle</span>
              <span className="font-bold font-mono text-[11px]">00 UTC</span>
            </div>
            <div className="pl-space-md flex items-center gap-space-xs font-label-md text-label-md">
              <span className="text-outline uppercase text-[10px] font-semibold tracking-wide">Lead</span>
              <span className="text-primary font-bold font-mono text-[11px]">+24h</span>
            </div>
            <div className="pl-space-md flex items-center gap-space-xs font-label-md text-label-md hidden lg:flex">
              <span className="text-outline uppercase text-[10px] font-semibold tracking-wide">Region</span>
              <span className="font-mono text-[11px]">Maharashtra / Western India</span>
            </div>
            <div className="pl-space-md flex items-center gap-space-xs font-label-md text-label-md hidden xl:flex">
              <span className="text-outline uppercase text-[10px] font-semibold tracking-wide">Source</span>
              <span className="font-mono text-[11px]">GFS 0.25° / CHIRPS v3</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="mt-12 bg-surface min-h-[calc(100vh-3rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
