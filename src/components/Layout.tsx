import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Role, Route } from '../types';
import { useApp } from '../store';
import { cn } from '../lib';
import { Avatar, Icon } from './ui';
import type { IconName } from './ui';

interface NavItem {
  label: string;
  icon: IconName;
  to: Route;
  activeOn: string[];
}

const NAVS: Record<Role, NavItem[]> = {
  student: [
    { label: 'Dashboard', icon: 'home', to: { page: 's-dash' }, activeOn: ['s-dash'] },
    { label: 'Browse courses', icon: 'search', to: { page: 'catalog' }, activeOn: ['catalog', 'course'] },
    { label: 'My learning', icon: 'book-open', to: { page: 's-courses' }, activeOn: ['s-courses', 's-learn'] },
    { label: 'Certificates', icon: 'award', to: { page: 's-certs' }, activeOn: ['s-certs'] },
  ],
  teacher: [
    { label: 'Dashboard', icon: 'home', to: { page: 't-dash' }, activeOn: ['t-dash'] },
    { label: 'My courses', icon: 'layers', to: { page: 't-courses' }, activeOn: ['t-courses', 't-edit'] },
    { label: 'Students', icon: 'users', to: { page: 't-students' }, activeOn: ['t-students'] },
    { label: 'Analytics', icon: 'bar-chart', to: { page: 't-analytics' }, activeOn: ['t-analytics'] },
    { label: 'Browse', icon: 'globe', to: { page: 'catalog' }, activeOn: ['catalog', 'course'] },
  ],
  admin: [
    { label: 'Overview', icon: 'home', to: { page: 'a-dash' }, activeOn: ['a-dash'] },
    { label: 'Users', icon: 'users', to: { page: 'a-users' }, activeOn: ['a-users'] },
    { label: 'Courses', icon: 'layers', to: { page: 'a-courses' }, activeOn: ['a-courses'] },
    { label: 'Categories', icon: 'tag', to: { page: 'a-cats' }, activeOn: ['a-cats'] },
  ],
};

const ROLE_META: Record<Role, { label: string; icon: IconName; dot: string; who: string }> = {
  student: { label: 'Student', icon: 'user', dot: 'bg-emerald-500', who: 'Maya Chen' },
  teacher: { label: 'Teacher', icon: 'grad-cap', dot: 'bg-indigo-500', who: 'Daniel Okafor' },
  admin: { label: 'Admin', icon: 'shield', dot: 'bg-violet-500', who: 'Ava Lindqvist' },
};

export function RoleSwitcher() {
  const { role, switchRole, resetDemo } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const meta = ROLE_META[role];

  return (
    <div ref={ref} className="relative flex items-center gap-2" data-no-print>
      <span className="hidden text-[11px] font-semibold uppercase tracking-wider text-slate-400 sm:inline">Demo: view as</span>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-2 rounded-full bg-white py-1.5 pl-3 pr-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-900/10 transition hover:ring-slate-900/20',
          open && 'ring-2 ring-indigo-500',
        )}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Demo: view as — switch role"
      >
        <span className={cn('h-2 w-2 rounded-full', meta.dot)} />
        <span>{meta.label}</span>
        <Icon name="chevron-down" className={cn('h-4 w-4 text-slate-400 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right animate-scale-in overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/10" role="menu">
          <p className="border-b border-slate-100 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Demo: view as</p>
          {(Object.keys(ROLE_META) as Role[]).map((r) => {
            const m = ROLE_META[r];
            const active = r === role;
            return (
              <button
                key={r}
                role="menuitem"
                onClick={() => {
                  if (!active) switchRole(r);
                  setOpen(false);
                }}
                className={cn('flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50', active && 'bg-indigo-50/60 hover:bg-indigo-50/60')}
              >
                <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', active ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500')}>
                  <Icon name={m.icon} className="h-4 w-4" />
                </span>
                <span className="flex-1">
                  <span className={cn('block text-sm font-semibold', active ? 'text-indigo-900' : 'text-slate-800')}>{m.label}</span>
                  <span className="block text-xs text-slate-400">{m.who}</span>
                </span>
                {active && <Icon name="check" className="h-4 w-4 text-indigo-600" strokeWidth={2.4} />}
              </button>
            );
          })}
          <div className="border-t border-slate-100 p-2">
            <button
              role="menuitem"
              onClick={() => {
                resetDemo();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              <Icon name="reset" className="h-4 w-4" />
              Reset demo data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Header() {
  const { role, route, navigate, currentUser } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = NAVS[role];

  useEffect(() => {
    setMobileOpen(false);
  }, [route]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-900/5 bg-white/85 backdrop-blur-lg" data-no-print>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <button onClick={() => navigate({ page: 'home' })} className="flex shrink-0 items-center gap-2.5" aria-label="EduFlow home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30">
            <Icon name="logo" className="h-5 w-5" strokeWidth={2} />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            Edu<span className="text-indigo-600">Flow</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {items.map((item) => {
            const active = item.activeOn.includes(route.page);
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.to)}
                className={cn(
                  'rounded-full px-3.5 py-2 text-sm font-semibold transition',
                  active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                )}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <span className="mr-1 hidden items-center gap-2.5 xl:flex" title={`Viewing as ${currentUser.name}`}>
            <Avatar name={currentUser.name} size="sm" />
          </span>
          <RoleSwitcher />
          <button
            className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            <Icon name={mobileOpen ? 'x' : 'menu'} className="h-5.5 w-5.5" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-slate-100 bg-white px-4 pb-4 pt-2 lg:hidden animate-fade-in" aria-label="Mobile">
          <p className="flex items-center gap-2.5 px-2 py-2.5">
            <Avatar name={currentUser.name} size="sm" />
            <span>
              <span className="block text-sm font-bold text-slate-900">{currentUser.name}</span>
              <span className="block text-xs text-slate-400 capitalize">{ROLE_META[role].label} view</span>
            </span>
          </p>
          {items.map((item) => {
            const active = item.activeOn.includes(route.page);
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.to)}
                className={cn(
                  'mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                  active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100',
                )}
              >
                <Icon name={item.icon} className="h-4.5 w-4.5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      )}
    </header>
  );
}

function Toasts() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[90] flex flex-col items-stretch gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-96" data-no-print>
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto flex items-start gap-3 rounded-2xl bg-white p-4 shadow-xl ring-1 animate-toast-in',
            t.kind === 'error' ? 'ring-rose-200' : t.kind === 'info' ? 'ring-indigo-200' : 'ring-emerald-200',
          )}
          role="status"
        >
          <span
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
              t.kind === 'error' ? 'bg-rose-50 text-rose-600' : t.kind === 'info' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600',
            )}
          >
            <Icon name={t.kind === 'error' ? 'alert' : t.kind === 'info' ? 'info' : 'check-circle'} className="h-4.5 w-4.5" />
          </span>
          <p className="flex-1 pt-1 text-sm font-semibold leading-snug text-slate-800">{t.message}</p>
          <button onClick={() => dismissToast(t.id)} className="rounded-lg p-1.5 text-slate-300 transition hover:bg-slate-100 hover:text-slate-500" aria-label="Dismiss">
            <Icon name="x" className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function Footer() {
  const { navigate, switchRole, resetDemo } = useApp();
  return (
    <footer className="mt-20 border-t border-slate-100 bg-white" data-no-print>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
              <Icon name="logo" className="h-5 w-5" strokeWidth={2} />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              Edu<span className="text-indigo-600">Flow</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
            Free, expert-led courses taught in bite-sized chapters. Learn at your own pace and earn a certificate when you finish.
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Explore</p>
          <ul className="mt-4 space-y-2.5 text-sm font-semibold text-slate-600">
            <li><button className="transition hover:text-indigo-600" onClick={() => navigate({ page: 'home' })}>Home</button></li>
            <li><button className="transition hover:text-indigo-600" onClick={() => navigate({ page: 'catalog' })}>Course catalog</button></li>
            <li>
              <button
                className="transition hover:text-indigo-600"
                onClick={() => {
                  switchRole('teacher');
                }}
              >
                Teach on EduFlow
              </button>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">This demo</p>
          <ul className="mt-4 space-y-2.5 text-sm font-semibold text-slate-600">
            <li><span className="font-normal text-slate-500">All content is mock data, stored locally in your browser.</span></li>
            <li>
              <button className="inline-flex items-center gap-1.5 text-rose-500 transition hover:text-rose-600" onClick={resetDemo}>
                <Icon name="reset" className="h-3.5 w-3.5" /> Reset demo data
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100 py-5 text-center text-xs text-slate-400">
        EduFlow — interactive product prototype for client presentation
      </div>
    </footer>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
      <Toasts />
    </div>
  );
}
