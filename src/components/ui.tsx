import { useEffect, useState } from 'react';
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { avatarTone, cn, downloadTextFile, initials, parseVideoUrl } from '../lib';
import type { ChapterQuiz, ChapterResource } from '../types';

// ─────────────────────────────────────────────────────────────
// Icon — hand-written inline SVG set
// ─────────────────────────────────────────────────────────────
export type IconName =
  | 'logo' | 'menu' | 'x' | 'chevron-down' | 'chevron-left' | 'chevron-right' | 'chevron-up'
  | 'check' | 'check-circle' | 'lock' | 'play' | 'pause' | 'search' | 'users' | 'user' | 'book-open'
  | 'layers' | 'clock' | 'award' | 'bar-chart' | 'trending-up' | 'plus' | 'pencil' | 'trash'
  | 'eye' | 'eye-off' | 'star' | 'arrow-right' | 'arrow-left' | 'sparkles' | 'home' | 'tag'
  | 'reset' | 'grip' | 'printer' | 'grad-cap' | 'code' | 'shapes' | 'briefcase' | 'megaphone'
  | 'camera' | 'alert' | 'info' | 'image' | 'filter' | 'shield' | 'calendar' | 'mail' | 'globe'
  | 'zap' | 'sliders' | 'certificate' | 'bookmark' | 'bookmark-filled' | 'download' | 'share'
  | 'message-square' | 'thumbs-up' | 'help-circle' | 'external-link' | 'file-text' | 'copy'
  | 'check-square' | 'video' | 'log-in' | 'log-out' | 'user-plus' | 'refresh';

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
  pause: <><rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none" /><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none" /></>,
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
  refresh: <><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l6.73-6.19" /></>,
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
  bookmark: <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />,
  'bookmark-filled': <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" fill="currentColor" />,
  download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>,
  share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></>,
  'message-square': <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  'thumbs-up': <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />,
  'help-circle': <><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
  'external-link': <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></>,
  'file-text': <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></>,
  copy: <><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
  'check-square': <><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>,
  video: <><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></>,
  'log-in': <><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></>,
  'log-out': <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>,
  'user-plus': <><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></>,
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
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle' | 'dark';
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
  dark: 'bg-slate-900 text-white shadow-md hover:bg-slate-800 active:scale-[0.98]',
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
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset', BADGE_TONES[tone], className)}>
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
      <button aria-label="Close dialog" onClick={onClose} className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] animate-fade-in" />
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl animate-modal-in sm:rounded-3xl',
          wide ? 'sm:max-w-3xl' : 'sm:max-w-lg',
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
            className="absolute right-3.5 top-3.5 z-10 rounded-full bg-slate-950/50 p-2 text-white backdrop-blur transition hover:bg-slate-950/70"
            aria-label="Close"
          >
            <Icon name="x" className="h-4.5 w-4.5" />
          </button>
        )}
        <div className="max-h-[85vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Form fields
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

// ─────────────────────────────────────────────────────────────
// Real Multi-Media Video Player
// ─────────────────────────────────────────────────────────────
export function VideoPlayer({
  videoUrl,
  title,
  durationMin = 15,
  isComplete,
  onComplete,
}: {
  videoUrl?: string;
  title: string;
  durationMin?: number;
  isComplete?: boolean;
  onComplete?: () => void;
}) {
  const parsed = parseVideoUrl(videoUrl);
  const [isPlaying, setIsPlaying] = useState(false);

  if (parsed && !parsed.isDirect) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-slate-950 shadow-lift ring-1 ring-slate-900/10">
        <iframe
          src={parsed.embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }

  if (parsed && parsed.isDirect) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-slate-950 shadow-lift ring-1 ring-slate-900/10">
        <video
          controls
          src={parsed.embedUrl}
          className="h-full w-full object-contain"
          onEnded={() => onComplete?.()}
        >
          Your browser does not support HTML5 video playback.
        </video>
      </div>
    );
  }

  // Fallback rich interactive media canvas
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-slate-950 shadow-lift ring-1 ring-slate-900/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_25%,rgba(99,102,241,0.5),transparent_55%),radial-gradient(circle_at_75%_80%,rgba(139,92,246,0.4),transparent_50%)]" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center text-white">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? 'Pause lesson preview' : 'Play lesson preview'}
          className="flex h-18 w-18 items-center justify-center rounded-full bg-white/95 text-indigo-600 shadow-2xl transition hover:scale-110 sm:h-20 sm:w-20"
        >
          <Icon name={isPlaying ? 'pause' : 'play'} className="h-8 w-8 translate-x-0.5" />
        </button>
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-200">Interactive Lecture &amp; Reading Lesson</span>
        <p className="max-w-md text-sm font-semibold text-slate-200">{title}</p>
        <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-slate-300">{durationMin} min estimated reading &amp; practice</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Markdown & Lesson Notes Viewer
// ─────────────────────────────────────────────────────────────
export function MarkdownViewer({ content }: { content: string }) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (codeText: string) => {
    navigator.clipboard?.writeText(codeText).catch(() => undefined);
    setCopiedCode(codeText);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Simple clean parser for headings, code blocks, lists, and paragraphs
  const lines = content.split('\n');
  const elements: ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        const fullCode = codeBuffer.join('\n');
        elements.push(
          <div key={`code_${i}`} className="my-4 overflow-hidden rounded-2xl bg-slate-900 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-4 py-2 text-xs font-mono text-slate-400">
              <span>Code Snippet</span>
              <button
                onClick={() => copyCode(fullCode)}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                <Icon name={copiedCode === fullCode ? 'check' : 'copy'} className="h-3.5 w-3.5" />
                {copiedCode === fullCode ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="overflow-x-auto p-4 text-xs font-mono leading-relaxed text-indigo-100">
              <code>{fullCode}</code>
            </pre>
          </div>,
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="mb-3 mt-6 text-xl font-extrabold text-slate-900 first:mt-0">{line.replace('## ', '')}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="mb-2 mt-5 text-base font-bold text-slate-800">{line.replace('### ', '')}</h3>);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <li key={i} className="ml-4 list-disc text-sm leading-relaxed text-slate-600">
          {line.replace(/^[-*]\s+/, '')}
        </li>,
      );
    } else if (/^\d+\.\s/.test(line)) {
      elements.push(
        <li key={i} className="ml-4 list-decimal text-sm leading-relaxed text-slate-600">
          {line.replace(/^\d+\.\s+/, '')}
        </li>,
      );
    } else if (line.trim() !== '') {
      elements.push(<p key={i} className="my-2 text-sm leading-relaxed text-slate-600">{line}</p>);
    }
  }

  return <div className="space-y-1">{elements}</div>;
}

// ─────────────────────────────────────────────────────────────
// Interactive Quiz Widget
// ─────────────────────────────────────────────────────────────
export function QuizWidget({
  quiz,
  onPass,
  previousScore,
}: {
  quiz: ChapterQuiz;
  onPass: (score: number, total: number) => void;
  previousScore?: { score: number; total: number; passed: boolean };
}) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(Boolean(previousScore));
  const [score, setScore] = useState(previousScore?.score ?? 0);

  const total = quiz.questions.length;

  const handleSubmit = () => {
    let correct = 0;
    quiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correct += 1;
      }
    });

    const percent = Math.round((correct / total) * 100);
    const passed = percent >= quiz.passingPercent;
    setScore(correct);
    setSubmitted(true);

    if (passed) {
      onPass(correct, total);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setSubmitted(false);
  };

  const passed = Math.round((score / total) * 100) >= quiz.passingPercent;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Chapter Knowledge Check</h3>
          <p className="text-xs text-slate-400">Score {quiz.passingPercent}% or higher to verify comprehension</p>
        </div>
        {submitted && (
          <Badge tone={passed ? 'emerald' : 'amber'} icon={passed ? 'check-circle' : 'alert'}>
            {passed ? 'Passed' : 'Needs Practice'} · {score}/{total} ({Math.round((score / total) * 100)}%)
          </Badge>
        )}
      </div>

      <div className="mt-6 space-y-6">
        {quiz.questions.map((q, qIdx) => {
          const selected = selectedAnswers[qIdx];
          const isCorrect = selected === q.correctIndex;
          return (
            <div key={q.id} className="rounded-xl bg-slate-50/70 p-5 ring-1 ring-slate-200/60">
              <p className="text-sm font-bold text-slate-900">
                {qIdx + 1}. {q.question}
              </p>
              <div className="mt-3 space-y-2">
                {q.options.map((opt, optIdx) => {
                  let optStyle = 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300';
                  if (submitted) {
                    if (optIdx === q.correctIndex) {
                      optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-emerald-400';
                    } else if (selected === optIdx) {
                      optStyle = 'border-rose-400 bg-rose-50 text-rose-900 ring-1 ring-rose-300';
                    }
                  } else if (selected === optIdx) {
                    optStyle = 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold ring-1 ring-indigo-500';
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={submitted}
                      onClick={() => setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border p-3.5 text-left text-xs sm:text-sm transition-all',
                        optStyle,
                      )}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {submitted && optIdx === q.correctIndex && (
                        <Icon name="check" className="h-4 w-4 text-emerald-600" />
                      )}
                    </button>
                  );
                })}
              </div>
              {submitted && q.explanation && (
                <p className="mt-3 text-xs leading-relaxed text-slate-500">
                  <span className="font-bold text-slate-700">Explanation:</span> {q.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        {submitted ? (
          <Button variant="secondary" icon="refresh" onClick={handleRetake}>
            Retake Quiz
          </Button>
        ) : (
          <Button
            icon="check-square"
            disabled={Object.keys(selectedAnswers).length < total}
            onClick={handleSubmit}
          >
            Submit Quiz
          </Button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Student Personal Notes Pad
// ─────────────────────────────────────────────────────────────
export function NotesPad({
  chapterTitle,
  initialContent = '',
  onSave,
}: {
  chapterTitle: string;
  initialContent?: string;
  onSave: (text: string) => void;
}) {
  const [text, setText] = useState(initialContent);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setText(initialContent);
  }, [initialContent]);

  const handleSave = () => {
    onSave(text);
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  };

  const handleExport = () => {
    downloadTextFile(`Notes_${chapterTitle.replace(/[^a-zA-Z0-9]/g, '_')}.md`, `# Notes for ${chapterTitle}\n\n${text}`);
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Icon name="file-text" className="h-4.5 w-4.5 text-indigo-600" />
          <h4 className="text-sm font-bold text-slate-900">Personal Notes</h4>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs font-semibold text-emerald-600 animate-fade-in">Saved to storage</span>}
          <Button variant="ghost" size="sm" icon="download" onClick={handleExport} disabled={!text.trim()}>
            Export
          </Button>
          <Button size="sm" icon="check" onClick={handleSave}>
            Save Notes
          </Button>
        </div>
      </div>
      <div className="mt-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Jot down personal takeaways, code reminders, and ideas for this chapter..."
          className="min-h-[140px] w-full resize-y rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Star Rating Component
// ─────────────────────────────────────────────────────────────
export function StarRating({
  rating,
  max = 5,
  size = 'md',
  interactive = false,
  onChange,
}: {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (r: number) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);

  const starSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4.5 w-4.5',
    lg: 'h-6 w-6',
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => {
        const starIdx = i + 1;
        const active = (hover ?? rating) >= starIdx;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onMouseEnter={() => interactive && setHover(starIdx)}
            onMouseLeave={() => interactive && setHover(null)}
            onClick={() => interactive && onChange?.(starIdx)}
            className={cn(
              'transition-transform',
              interactive ? 'cursor-pointer hover:scale-115 text-amber-400' : 'cursor-default',
              active ? 'text-amber-400 fill-amber-400' : 'text-slate-200',
            )}
          >
            <svg viewBox="0 0 24 24" className={starSizes[size]} fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8}>
              <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
