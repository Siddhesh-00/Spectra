/* Shared primitives used across all screens */

export const Icon = ({ name, className = '' }) => (
  <span className={`material-symbols-outlined select-none leading-none ${className}`}>{name}</span>
);

export const SectionHeader = ({ stage, total, title, desc, children }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm pb-space-sm border-b border-outline-variant">
    <div>
      <div className="flex items-center gap-space-xs font-label-sm text-label-sm uppercase tracking-wider text-outline mb-0.5">
        <span className="font-semibold text-primary">STAGE {stage} / {total}</span>
        <span className="text-outline-variant">—</span>
        <span>{title.toUpperCase()} ASSESSMENT</span>
      </div>
      <h1 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight font-bold">{title}</h1>
      {desc && <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">{desc}</p>}
    </div>
    {children}
  </div>
);

/**
 * StepBreadcrumb — now clickable for navigation.
 * Pass onNavigate to enable click-to-switch screens.
 */
const STEP_IDS = ['event-district', 'forecast-diagnosis', 'before-after', 'district-product', 'verification'];

export const StepBreadcrumb = ({ steps, currentStep, onNavigate }) => (
  <div className="inline-flex items-stretch border border-outline-variant rounded-DEFAULT bg-surface-container-low overflow-hidden text-label-sm font-label-sm shrink-0 select-none shadow-sm">
    {steps.map((s, i) => {
      const isDone    = i < currentStep - 1;
      const isActive  = i === currentStep - 1;
      const stepId    = STEP_IDS[i];
      return (
        <button
          key={i}
          onClick={() => onNavigate && stepId && onNavigate(stepId)}
          disabled={!onNavigate}
          className={`flex items-center gap-1 px-space-sm py-1 border-r border-outline-variant/60 last:border-r-0 transition-colors
            ${isActive
              ? 'bg-primary text-on-primary font-bold shadow-sm cursor-default'
              : isDone
                ? 'bg-surface-container-high/40 text-outline hover:bg-secondary/10 hover:text-secondary cursor-pointer'
                : 'bg-surface-container-high/40 text-on-surface-variant hover:bg-surface-container-high cursor-pointer'
            }`}
        >
          {isDone && <Icon name="check_circle" className="text-[14px] text-secondary" />}
          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed inline-block animate-pulse" />}
          <span className={`font-semibold ${isDone ? 'text-outline' : ''}`}>0{i + 1}</span>
          <span className="uppercase font-medium">{s}</span>
          {i < steps.length - 1 && <Icon name="chevron_right" className="text-[13px] text-outline ml-0.5" />}
        </button>
      );
    })}
  </div>
);

export const Card = ({ className = '', children, style }) => (
  <div className={`bg-surface-container-lowest border border-outline-variant rounded-DEFAULT ${className}`} style={style}>
    {children}
  </div>
);

export const CardHeader = ({ title, right, className = '' }) => (
  <div className={`h-8 px-space-sm bg-surface-container-high/50 border-b border-outline-variant flex items-center justify-between ${className}`}>
    <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-on-surface">{title}</span>
    {right}
  </div>
);

export const Badge = ({ label, variant = 'default' }) => {
  const styles = {
    default:  'bg-surface-container text-on-surface-variant border-outline-variant',
    primary:  'bg-primary text-on-primary border-primary',
    secondary:'bg-secondary/10 text-secondary border-secondary/20',
    error:    'bg-error-container text-error border-error/20',
    warning:  'bg-amber-100 text-amber-800 border-amber-300',
  };
  return (
    <span className={`px-2 py-0.5 rounded-DEFAULT text-[10px] font-label-sm font-bold border uppercase ${styles[variant] || styles.default}`}>
      {label}
    </span>
  );
};

export const DecisionBadge = ({ decision, size = 'sm' }) => {
  if (!decision) return null;
  const variants = {
    'REPLACE':      { cls: 'bg-error-container text-error border-error/30',                  icon: 'swap_horiz' },
    'COMBINE':      { cls: 'bg-primary-container text-on-primary border-primary/40',          icon: 'merge' },
    'KEEP_ORIGINAL':{ cls: 'bg-surface-container text-on-surface border-outline-variant',     icon: 'lock' },
  };
  const v = variants[decision] || variants['COMBINE'];
  if (size === 'lg') {
    return (
      <div className={`flex items-center gap-2 px-4 py-2 rounded-DEFAULT border-2 font-bold uppercase text-sm ${v.cls}`}>
        <Icon name={v.icon} className="text-[20px]" />
        <div className="flex flex-col leading-tight">
          <span className="text-[9px] opacity-70 font-medium">SPECTRA DECISION</span>
          <span>{decision.replace('_', ' ')}</span>
        </div>
      </div>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-DEFAULT text-[10px] font-label-sm font-bold border uppercase ${v.cls}`}>
      <Icon name={v.icon} className="text-[12px]" />
      {decision.replace('_', ' ')}
    </span>
  );
};

export const ConfidenceBadge = ({ level }) => {
  const colors = {
    HIGH:   'text-secondary font-bold',
    MEDIUM: 'text-[#D97706] font-bold',
    LOW:    'text-outline font-medium',
  };
  return <span className={`font-label-md text-label-md ${colors[level] || colors.LOW}`}>{level}</span>;
};

/**
 * SPECTRADecisionPanel — The prominent COMBINE/REPLACE/KEEP decision bar.
 * Used on Screens 02, 03, 04.
 */
export const SPECTRADecisionPanel = ({ decision = 'COMBINE', confidence = 'HIGH', blendNwp = 0.38, blendSpec = 0.62, reason }) => {
  const config = {
    'COMBINE':      { bg: 'bg-primary-container border-primary/30', label: 'COMBINE',       sub: `NWP ${(blendNwp*100).toFixed(0)}% + SPECTRA ${(blendSpec*100).toFixed(0)}%`, icon: 'merge',      textColor: 'text-on-primary' },
    'REPLACE':      { bg: 'bg-error-container border-error/30',     label: 'REPLACE',       sub: 'Full SPECTRA correction replaces NWP',                                       icon: 'swap_horiz', textColor: 'text-error' },
    'KEEP_ORIGINAL':{ bg: 'bg-surface-container border-outline-variant', label: 'KEEP ORIGINAL', sub: 'Raw NWP retained — correction not supported',                          icon: 'lock',       textColor: 'text-on-surface' },
  };
  const c = config[decision] || config['COMBINE'];
  return (
    <div className={`flex items-center gap-space-md rounded-DEFAULT border px-space-md py-space-sm ${c.bg}`}>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Icon name={c.icon} className={`text-[28px] ${c.textColor}`} />
        <div className="flex flex-col">
          <span className="font-label-sm text-[9px] text-outline uppercase font-semibold">SPECTRA Decision</span>
          <span className={`font-headline-sm text-headline-sm font-bold uppercase ${c.textColor}`}>{c.label}</span>
          <span className="font-label-sm text-[10px] text-outline">{c.sub}</span>
        </div>
      </div>
      <div className="w-px h-10 bg-outline-variant hidden md:block" />
      <div className="flex-1 hidden md:block">
        {reason && <p className="font-body-sm text-body-sm text-on-surface-variant">{reason}</p>}
        <div className="flex gap-space-sm mt-1">
          {['COMBINE','REPLACE','KEEP_ORIGINAL'].map(d => (
            <div key={d} className={`flex items-center gap-1 px-2 py-0.5 rounded-DEFAULT font-label-sm text-[9px] uppercase border
              ${d === decision ? 'bg-primary text-on-primary border-primary font-bold' : 'bg-surface-container text-outline border-outline-variant'}`}>
              <Icon name={d === 'COMBINE' ? 'merge' : d === 'REPLACE' ? 'swap_horiz' : 'lock'} className="text-[10px]" />
              {d.replace('_',' ')}
            </div>
          ))}
        </div>
      </div>
      <div className="ml-auto flex flex-col items-end flex-shrink-0">
        <span className="font-label-sm text-[9px] text-outline uppercase">Confidence</span>
        <span className={`font-label-md font-bold ${confidence === 'HIGH' ? 'text-secondary' : confidence === 'MEDIUM' ? 'text-[#D97706]' : 'text-outline'}`}>{confidence}</span>
      </div>
    </div>
  );
};

export const WorkflowDock = ({ left, right, label = 'STEP COMPLETE', onContinue, continueLabel }) => (
  <div className="mt-space-sm bg-surface-container-lowest border border-outline-variant rounded-DEFAULT p-space-sm flex flex-col md:flex-row items-center justify-between gap-space-sm shadow-sm select-none">
    <div className="flex items-center gap-space-sm">
      <div className="flex items-center gap-1.5 font-label-sm text-label-sm font-semibold text-secondary">
        <span className="w-2 h-2 rounded-full bg-secondary inline-block" />
        <span>{label}</span>
      </div>
      {left && <span className="font-mono text-[10px] text-outline">{left}</span>}
    </div>
    {onContinue && (
      <button onClick={onContinue}
        className="flex items-center gap-1.5 h-8 px-space-md bg-primary text-on-primary font-label-md text-label-md font-bold uppercase tracking-widest rounded-DEFAULT hover:opacity-90 transition-opacity shrink-0">
        {continueLabel || 'CONTINUE'}
        <Icon name="chevron_right" className="text-[16px]" />
      </button>
    )}
  </div>
);
