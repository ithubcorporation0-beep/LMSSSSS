import { useEffect } from 'react';
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { avatarTone, cn, initials } from '../lib';

// ─────────────────────────────────────────────────────────────
// Icon — hand-written inline SVG set (no icon library)
// ─────────────────────────────────────────────────────────────
export type IconName =
  | 'logo' | 'menu' | 'x' | 'chevron-down' | 'chevron-left' | 'chevron-right' | 'chevron-up'
  | 'check' | 'check-circle' | 'lock' | 'play' | 'search' | 'users' | 'user' | 'book-open'
  | 'layers' | 'clock' | 'award' | 'bar-chart' | 'trending-up' | 'plus' | 'pencil' | 'trash'
  | 'eye' | 'eye-off' | 'star' | 'arrow-right' | 'arrow-left' | 'sparkles' | 'home' | 'tag'
  | 'reset' | 'grip' | 'printer' | 'grad-cap' | 'code' | 'shapes' | 'briefcase' | 'megaphone'
  | 'camera' | 'alert' | 'info' | 'image' | 'filter' | 'shield' | 'calendar' | 'mail' | 'globe'
  | 'zap' | 'sliders' | 'certificate';

const PATHS: Record<Exclude<IconName, 'logo'>, ReactNode> = {
  menu: <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>,
  x: <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></>,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  'chevron-up': <path d="m6 15 6-6 6 6" />,
  'chevron-left': <path d="m15 18-6-6 6-6" />,
  'chevron-right': <path d="m9 6 6 6-6 6" />,
  check: <path d="M5 13l4 4L19 7" />,
  'check-circle': <><circle cx="12" cy="12" r="9" /><path d="m8.5 12.2 2.4 2.4 4.6-5" /></>,
  lock: <><rect x="5.5" y="11" width="13" height="9" rx="2" /><path d="M8.5 11V7.5a3.5 3.5 0 0 1 7 0V11" /></>,
  play: <path d="M7 4.8v14.4L19 12 7 4.8z" fill="currentColor" stroke="none" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20.5 20.5-4.3-4.3" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.7a3.5 3.5 0 0 1 0 6.6" /><path d="M17.5 14.2a6.5 6.5 0 0 1 4 5.8" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" /></>,
  'book-open': <><path d="M12 6.5C10.2 5 7.2 4.5 3 5v13c4.2-.5 7.2 0 9 1.5 1.8-1.5 4.8-2 9-1.5V5c-4.2-.5-7.2 0-9 1.5z" /><path d="M12 6.5v13" /></>,
  layers: <><path d="m12 3 9 5-9 5-9-5 9-5z" /><path d="m3.5 13.5 8.5 4.7 8.5-4.7" /><path d="m3.5 17.5 8.5 4.7 8.5-4.7" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3 2" /></>,
  award: <><circle cx="12" cy="9.5" r="5.5" /><path d="M9.3 13.9 8 20.5l4-2.2 4 2.2-1.3-6.6" /></>,
  'bar-chart': <><path d="M4 20h16.5" /><path d="M8 20v-7" /><path d="M12.5 20V6" /><path d="M17 20v-10" /></>,
  'trending-up': <><path d="m3 17 6-6 4 4 8-8" /><path d="M15 7h6v6" /></>,
  plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  pencil: <><path d="M12 20h9" /><path d="M16.4 3.6a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4L16.4 3.6z" /></>,
  trash: <><path d="M4 7h16" /><path d="M9.5 7V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2" /><path d="M6.5 7 7.4 20a1 1 0 0 0 1 .9h7.2a1 1 0 0 0 1-.9L17.5 7" /><path d="M10 11v6" /><path d="M14 11v6" /></>,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></>,
  'eye-off': <><path d="m3 3 18 18" /><path d="M10.5 5.9A9.8 9.8 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17.6 17.6 0 0 1-2.9 3.9M6.6 6.6C4 8.4 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.5 0 2.9-.4 4.1-1" /><path d="M9.9 10.7a3 3 0 0 0 4.2 4.2" /></>,
  star: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z" />,
  'arrow-right': <><path d="M4.5 12h15" /><path d="m13.5 6 6 6-6 6" /></>,
  'arrow-left': <><path d="M19.5 12h-15" /><path d="m10.5 6-6 6 6 6" /></>,
  sparkles: <><path d="M12 3.5 13.7 8l4.8 1.6-4.8 1.7L12 16l-1.7-4.7L5.5 9.6 10.3 8 12 3.5z" /><path d="M18.5 14.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1z" /></>,
  home: <><path d="m3 11 9-7.5L21 11" /><path d="M5.5 9.5V20h4v-5.5h5V20h4V9.5" /></>,
  tag: <><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9z" /><circle cx="7.5" cy="7.5" r="1.4" /></>,
  reset: <><path d="M3 12a9 9 0 1 0 3.1-6.8L3 8" /><path d="M3 3v5h5" /></>,
  grip: <><circle cx="9.5" cy="6" r="1.15" fill="currentColor" stroke="none" /><circle cx="14.5" cy="6" r="1.15" fill="currentColor" stroke="none" /><circle cx="9.5" cy="12" r="1.15" fill="currentColor" stroke="none" /><circle cx="14.5" cy="12" r="1.15" fill="currentColor" stroke="none" /><circle cx="9.5" cy="18" r="1.15" fill="currentColor" stroke="none" /><circle cx="14.5" cy="18" r="1.15" fill="currentColor" stroke="none" /></>,
  printer: <><path d="M7 8V3.5h10V8" /><rect x="3.5" y="8" width="17" height="8.5" rx="2" /><path d="M7 13.5h10v7H7z" /></>,
  'grad-cap': <><path d="m2 9.8 10-5 10 5-10 5-10-5z" /><path d="M6.5 11.7V16c0 1.6 2.5 3 5.5 3s5.5-1.4 5.5-3v-4.3" /><path d="M22 9.8V15" /></>,
  code: <><path d="m8.5 6.5-6 5.5 6 5.5" /><path d="m15.5 6.5 6 5.5-6 5.5" /></>,
  shapes: <><circle cx="7" cy="7" r="3.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.4" /><path d="M7.5 13.3 3 20.5h9L7.5 13.3z" /><rect x="14.5" y="14.5" width="6.5" height="6.5" rx="3.25" /></>,
  briefcase: <><rect x="3" y="7.5" width="18" height="12.5" rx="2.5" /><path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5" /><path d="M3 12.8h18" /></>,
  megaphone: <><path d="M3 10.5v3L14 20V4L3 10.5z" /><path d="M14 8.5a5.5 5.5 0 0 1 0 7" /><path d="M6 14.5V18a1.5 1.5 0 0 0 3 0v-2.6" /></>,
  camera: <><rect x="2.5" y="7" width="19" height="13" rx="2.5" /><path d="M8 7l1.4-2.3a1 1 0 0 1 .84-.45h3.52a1 1 0 0 1 .84.45L16 7" /><circle cx="12" cy="13" r="3.6" /></>,
  alert: <><circle cx="12" cy="12" r="9" /><path d="M12 8v4.5" /><path d="M12 16h.01" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></>,
  image: <><rect x="3" y="4.5" width="18" height="15" rx="2.5" /><circle cx="9" cy="9.5" r="1.8" /><path d="m5 19 5.2-5.2a1.8 1.8 0 0 1 2.5 0L19 20" /></>,
  filter: <path d="M3 5h18l-7 8v5.5l-4 2V13L3 5z" />,
  shield: <path d="M12 3l8 3v6c0 4.6-3.2 7.6-8 9.2C7.2 19.6 4 16.6 4 12V6l8-3z" />,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M8 3v4" /><path d="M16 3v4" /><path d="M3 10h18" /></>,
  mail: <><rect x="2.5" y="5" width="19" height="14" rx="2.5" /><path d="m3.5 7.5 8.5 5.5 8.5-5.5" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c-2.6 2.6-4 5.7-4 9s1.4 6.4 4 9c2.6-2.6 4-5.7 4-9s-1.4-6.4-4-9z" /></>,
  zap: <path d="M13 2.5 4.5 13.5H11l-1 8L18.5 10.5H12l1-8z" />,
  sliders: <><path d="M3 8h8" /><path d="M15 8h6" /><circle cx="12.5" cy="8" r="2.2" /><path d="M3 16h4" /><path d="M11 16h10" /><circle cx="9.5" cy="16" r="2.2" /></>,
  certificate: <><rect x="3" y="4.5" width="18" height="15" rx="2" /><path d="M7 9h10" /><path d="M7 12h6" /><circle cx="16.8" cy="14.5" r="2.2" /><path d="m15.8 16.3-.9 3.2 1.9-1 1.9 1-.9-3.2" /></>,
};

export function Icon({ name, className, strokeWidth = 1.8 }: { name: IconName; className?: string; strokeWidth?: number }) {
  if (name === 'logo') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <path d="m2 9.8 10-5 10 5-10 5-10-5z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M6.5 11.7V16c0 1.6 2.5 3 5.5 3s5.5-1.4 5.5-3v-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M22 9.8V15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Buttons
// ─────────────────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconRight?: IconName;
}

const BTN_BASE =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 disabled:opacity-55 disabled:cursor-not-allowed disabled:pointer-events-none select-none whitespace-nowrap';

const BTN_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/30 active:scale-[0.98]',
  secondary: 'bg-white text-slate-700 ring-1 ring-inset ring-slate-200 shadow-sm hover:ring-slate-300 hover:text-slate-900 hover:shadow active:scale-[0.98]',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  danger: 'bg-white text-rose-600 ring-1 ring-inset ring-rose-200 hover:bg-rose-50 active:scale-[0.98]',
  subtle: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:scale-[0.98]',
};

const BTN_SIZES: Record<ButtonSize, string> = {
  sm: 'text-xs px-3 py-2',
  md: 'text-sm px-4 py-2.5',
  lg: 'text-base px-6 py-3.5',
};

export function Button({ variant = 'primary', size = 'md', icon, iconRight, className, children, ...rest }: ButtonProps) {
  const iconSize = size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
  return (
    <button className={cn(BTN_BASE, BTN_VARIANTS[variant], BTN_SIZES[size], className)} {...rest}>
      {icon && <Icon name={icon} className={iconSize} />}
      {children}
      {iconRight && <Icon name={iconRight} className={iconSize} />}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Badge
// ─────────────────────────────────────────────────────────────
type BadgeTone = 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate' | 'sky' | 'violet';

const BADGE_TONES: Record<BadgeTone, string> = {
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/25',
  rose: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  slate: 'bg-slate-100 text-slate-600 ring-slate-500/15',
  sky: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  violet: 'bg-violet-50 text-violet-700 ring-violet-600/20',
};

export function Badge({ tone = 'slate', icon, className, children }: { tone?: BadgeTone; icon?: IconName; className?: string; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset', BADGE_TONES[tone], className)}>
      {icon && <Icon name={icon} className="h-3 w-3" strokeWidth={2.2} />}
      {children}
    </span>
  );
}

export function LevelBadge({ level }: { level: 'Beginner' | 'Intermediate' | 'Advanced' }) {
  const tone: BadgeTone = level === 'Beginner' ? 'emerald' : level === 'Intermediate' ? 'amber' : 'rose';
  return <Badge tone={tone}>{level}</Badge>;
}

// ─────────────────────────────────────────────────────────────
// Avatar — coloured initials
// ─────────────────────────────────────────────────────────────
export function Avatar({ name, size = 'md', className }: { name: string; size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const sizes = {
    xs: 'h-6 w-6 text-[9px]',
    sm: 'h-8 w-8 text-[11px]',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-xl',
  };
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white shadow-sm',
        avatarTone(name),
        sizes[size],
        className,
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Progress bar
// ─────────────────────────────────────────────────────────────
export function ProgressBar({ value, tone = 'auto', className }: { value: number; tone?: 'auto' | 'indigo' | 'emerald'; className?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  const color = tone === 'emerald' || (tone === 'auto' && pct >= 100) ? 'bg-emerald-500' : 'bg-indigo-600';
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-slate-100', className)} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Stat card
// ─────────────────────────────────────────────────────────────
export function StatCard({ icon, label, value, sub, tint = 'indigo' }: { icon: IconName; label: string; value: string | number; sub?: string; tint?: 'indigo' | 'emerald' | 'amber' | 'sky' | 'violet' | 'rose' }) {
  const tints: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    sky: 'bg-sky-50 text-sky-600',
    violet: 'bg-violet-50 text-violet-600',
    rose: 'bg-rose-50 text-rose-600',
  };
  return (
    <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-900/5">
      <div className="flex items-center gap-3.5">
        <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', tints[tint])}>
          <Icon name={icon} className="h-5.5 w-5.5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-0.5 text-2xl font-extrabold tracking-tight text-slate-900">{value}</p>
        </div>
      </div>
      {sub && <p className="mt-3 text-xs leading-relaxed text-slate-500">{sub}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: { icon: IconName; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-14 text-center shadow-soft ring-1 ring-slate-900/5">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
        <Icon name={icon} className="h-8 w-8" />
      </span>
      <h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Modal
// ─────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <button aria-label="Close dialog" onClick={onClose} className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px] animate-fade-in" />
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl animate-modal-in sm:rounded-3xl',
          wide ? 'sm:max-w-2xl' : 'sm:max-w-lg',
        )}
      >
        {title ? (
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <button onClick={onClose} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Close">
              <Icon name="x" className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onClose}
            className="absolute right-3.5 top-3.5 z-10 rounded-full bg-slate-950/40 p-2 text-white backdrop-blur transition hover:bg-slate-950/60"
            aria-label="Close"
          >
            <Icon name="x" className="h-4.5 w-4.5" />
          </button>
        )}
        <div className="max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Form fields — with per-field error messages
// ─────────────────────────────────────────────────────────────
export function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
      {children}
      {error ? (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-600 animate-fade-in">
          <Icon name="alert" className="h-3.5 w-3.5" /> {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

const INPUT_BASE =
  'w-full rounded-xl bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset transition placeholder:text-slate-400 focus:outline-none focus:ring-2';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function TextInput({ invalid, className, ...rest }: TextInputProps) {
  return (
    <input
      className={cn(INPUT_BASE, invalid ? 'ring-rose-300 focus:ring-rose-400' : 'ring-slate-200 hover:ring-slate-300 focus:ring-indigo-500', className)}
      {...rest}
    />
  );
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function TextArea({ invalid, className, ...rest }: TextAreaProps) {
  return (
    <textarea
      className={cn(INPUT_BASE, 'min-h-[96px] resize-y', invalid ? 'ring-rose-300 focus:ring-rose-400' : 'ring-slate-200 hover:ring-slate-300 focus:ring-indigo-500', className)}
      {...rest}
    />
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export function Select({ invalid, className, children, ...rest }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(INPUT_BASE, 'appearance-none pr-10', invalid ? 'ring-rose-300 focus:ring-rose-400' : 'ring-slate-200 hover:ring-slate-300 focus:ring-indigo-500', className)}
        {...rest}
      >
        {children}
      </select>
      <Icon name="chevron-down" className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Page header used by dashboard pages
// ─────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}
