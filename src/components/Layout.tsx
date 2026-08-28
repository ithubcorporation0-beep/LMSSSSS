import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Role, Route } from '../types';
import { useApp } from '../store';
import { cn } from '../lib';
import { Avatar, Badge, Button, Field, Icon, Modal, Select, TextArea, TextInput } from './ui';
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
    { label: 'Browse catalog', icon: 'search', to: { page: 'catalog' }, activeOn: ['catalog', 'course'] },
    { label: 'My learning', icon: 'book-open', to: { page: 's-courses' }, activeOn: ['s-courses', 's-learn'] },
    { label: 'Wishlist', icon: 'bookmark', to: { page: 's-wishlist' }, activeOn: ['s-wishlist'] },
    { label: 'Certificates', icon: 'award', to: { page: 's-certs' }, activeOn: ['s-certs', 'verify'] },
  ],
  teacher: [
    { label: 'Studio', icon: 'home', to: { page: 't-dash' }, activeOn: ['t-dash'] },
    { label: 'My courses', icon: 'layers', to: { page: 't-courses' }, activeOn: ['t-courses', 't-edit'] },
    { label: 'Students', icon: 'users', to: { page: 't-students' }, activeOn: ['t-students'] },
    { label: 'Analytics', icon: 'bar-chart', to: { page: 't-analytics' }, activeOn: ['t-analytics'] },
    { label: 'Catalog preview', icon: 'globe', to: { page: 'catalog' }, activeOn: ['catalog', 'course'] },
  ],
  admin: [
    { label: 'Overview', icon: 'home', to: { page: 'a-dash' }, activeOn: ['a-dash'] },
    { label: 'Users', icon: 'users', to: { page: 'a-users' }, activeOn: ['a-users'] },
    { label: 'Courses', icon: 'layers', to: { page: 'a-courses' }, activeOn: ['a-courses'] },
    { label: 'Categories', icon: 'tag', to: { page: 'a-cats' }, activeOn: ['a-cats'] },
  ],
};

const ROLE_META: Record<Role, { label: string; icon: IconName; dot: string; who: string }> = {
  student: { label: 'Student', icon: 'user', dot: 'bg-emerald-500', who: 'Active Learner' },
  teacher: { label: 'Instructor', icon: 'grad-cap', dot: 'bg-indigo-500', who: 'Course Creator' },
  admin: { label: 'Admin', icon: 'shield', dot: 'bg-violet-500', who: 'System Administrator' },
};

function UserMenu({
  onOpenProfile,
  onOpenAuth,
}: {
  onOpenProfile: () => void;
  onOpenAuth: () => void;
}) {
  const { data, currentUser, switchActiveUser, switchRole, resetDemo } = useApp();
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

  const meta = ROLE_META[currentUser.role];

  return (
    <div ref={ref} className="relative flex items-center gap-2" data-no-print>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-2.5 rounded-full bg-white py-1.5 pl-1.5 pr-3 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-900/10 transition hover:ring-slate-900/20',
          open && 'ring-2 ring-indigo-500',
        )}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="User account menu"
      >
        <Avatar name={currentUser.name} size="sm" />
        <span className="hidden text-left sm:block">
          <span className="block max-w-[110px] truncate text-xs font-bold leading-tight text-slate-900">{currentUser.name}</span>
          <span className="block text-[10px] font-medium text-slate-400">{meta.label}</span>
        </span>
        <Icon name="chevron-down" className={cn('h-3.5 w-3.5 text-slate-400 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 origin-top-right animate-scale-in overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10" role="menu">
          {/* User profile card */}
          <div className="border-b border-slate-100 p-4">
            <div className="flex items-center gap-3">
              <Avatar name={currentUser.name} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">{currentUser.name}</p>
                <p className="truncate text-xs text-slate-400">{currentUser.email}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 text-xs"
                icon="pencil"
                onClick={() => {
                  setOpen(false);
                  onOpenProfile();
                }}
              >
                Edit Profile
              </Button>
              <Button
                variant="subtle"
                size="sm"
                className="text-xs"
                icon="user-plus"
                onClick={() => {
                  setOpen(false);
                  onOpenAuth();
                }}
              >
                Switch
              </Button>
            </div>
          </div>

          {/* Role quick switch */}
          <div className="p-2">
            <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Switch workspace</p>
            {(['student', 'teacher', 'admin'] as Role[]).map((r) => {
              const m = ROLE_META[r];
              const active = r === currentUser.role;
              return (
                <button
                  key={r}
                  role="menuitem"
                  onClick={() => {
                    if (!active) switchRole(r);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-slate-50',
                    active && 'bg-indigo-50/70 text-indigo-900',
                  )}
                >
                  <span className={cn('flex h-7 w-7 items-center justify-center rounded-lg', active ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500')}>
                    <Icon name={m.icon} className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-bold">{m.label} Mode</span>
                    <span className="block text-[10px] text-slate-400">{m.who}</span>
                  </div>
                  {active && <Icon name="check" className="h-4 w-4 text-indigo-600" strokeWidth={2.4} />}
                </button>
              );
            })}
          </div>

          {/* Switch existing accounts */}
          <div className="border-t border-slate-100 p-2">
            <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Available Accounts</p>
            <div className="max-h-36 overflow-y-auto space-y-1">
              {data.users.map((u) => {
                const isSelected = u.id === currentUser.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchActiveUser(u.id);
                      setOpen(false);
                    }}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs transition hover:bg-slate-50',
                      isSelected && 'font-bold text-indigo-700 bg-indigo-50/50',
                    )}
                  >
                    <Avatar name={u.name} size="xs" />
                    <span className="truncate flex-1">{u.name}</span>
                    <Badge tone={u.role === 'admin' ? 'violet' : u.role === 'teacher' ? 'indigo' : 'emerald'} className="text-[9px] px-1.5 py-0">
                      {u.role}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reset platform */}
          <div className="border-t border-slate-100 p-2">
            <button
              role="menuitem"
              onClick={() => {
                if (window.confirm('Reset all platform courses and progress back to factory defaults?')) {
                  resetDemo();
                  setOpen(false);
                }
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              <Icon name="reset" className="h-3.5 w-3.5" />
              Reset Platform Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Header({
  onOpenProfile,
  onOpenAuth,
}: {
  onOpenProfile: () => void;
  onOpenAuth: () => void;
}) {
  const { role, route, navigate, data, currentUser } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const items = NAVS[role];

  useEffect(() => {
    setMobileOpen(false);
  }, [route]);

  const wishlistCount = data.wishlist.filter((w) => w.userId === currentUser.id).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate({ page: 'catalog', search: searchQuery.trim() });
    setSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-900/5 bg-white/90 backdrop-blur-md" data-no-print>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Brand Logo */}
        <button onClick={() => navigate({ page: 'home' })} className="flex shrink-0 items-center gap-2.5" aria-label="EduFlow Home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30">
            <Icon name="logo" className="h-5 w-5" strokeWidth={2} />
          </span>
          <span className="text-xl font-black tracking-tight text-slate-900">
            Edu<span className="text-indigo-600">Flow</span>
          </span>
        </button>

        {/* Primary Desktop Nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {items.map((item) => {
            const active = item.activeOn.includes(route.page);
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.to)}
                className={cn(
                  'flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition',
                  active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                )}
              >
                <Icon name={item.icon} className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2">
          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses..."
              className="w-44 rounded-full bg-slate-100/80 py-1.5 pl-9 pr-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:w-60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </form>

          {/* Wishlist quick link */}
          <button
            onClick={() => navigate({ page: 's-wishlist' })}
            aria-label="View saved courses"
            className="relative rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <Icon name="bookmark" className="h-5 w-5" />
            {wishlistCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white shadow-sm">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* User Account Menu */}
          <UserMenu onOpenProfile={onOpenProfile} onOpenAuth={onOpenAuth} />

          {/* Mobile menu hamburger */}
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

      {/* Mobile nav dropdown */}
      {mobileOpen && (
        <nav className="border-t border-slate-100 bg-white px-4 pb-4 pt-2 lg:hidden animate-fade-in" aria-label="Mobile">
          <form onSubmit={handleSearchSubmit} className="mb-3 mt-1">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses..."
                className="w-full rounded-xl bg-slate-100 py-2 pl-9 pr-3 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </form>
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
          <p className="flex-1 pt-0.5 text-sm font-semibold leading-snug text-slate-800">{t.message}</p>
          <button onClick={() => dismissToast(t.id)} className="rounded-lg p-1.5 text-slate-300 transition hover:bg-slate-100 hover:text-slate-500" aria-label="Dismiss">
            <Icon name="x" className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function ProfileModalWrapper({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { currentUser, updateUserProfile, toast } = useApp();
  const [name, setName] = useState(currentUser.name);
  const [headline, setHeadline] = useState(currentUser.headline);
  const [bio, setBio] = useState(currentUser.bio ?? '');

  useEffect(() => {
    if (open) {
      setName(currentUser.name);
      setHeadline(currentUser.headline);
      setBio(currentUser.bio ?? '');
    }
  }, [open, currentUser]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateUserProfile(currentUser.id, {
      name: name.trim(),
      headline: headline.trim(),
      bio: bio.trim(),
    });
    toast('Profile updated successfully');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Your Profile">
      <form onSubmit={handleSave} className="space-y-4 p-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
          <Avatar name={name || 'User'} size="lg" />
          <div>
            <p className="font-bold text-slate-900">{name || 'Your Name'}</p>
            <p className="text-xs text-slate-400 capitalize">{currentUser.role} Account · {currentUser.email}</p>
          </div>
        </div>
        <Field label="Full Name">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>
        <Field label="Headline" hint="Shown on your public instructor or student card">
          <TextInput value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. Senior Frontend Engineer" />
        </Field>
        <Field label="Bio" hint="Brief summary of your experience and interests">
          <TextArea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell learners or instructors a bit about yourself..." />
        </Field>
        <div className="flex gap-3 pt-2">
          <Button className="flex-1" icon="check" type="submit">Save Changes</Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
}

function AuthModalWrapper({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { login, register, data, switchActiveUser } = useApp();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [headline, setHeadline] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signin') {
      const ok = login(email);
      if (!ok) {
        setError('No account found with that email. Try one of the quick switch accounts below or register.');
        return;
      }
      onClose();
    } else {
      if (!name.trim()) {
        setError('Please provide your name');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please provide a valid email');
        return;
      }
      register({
        name,
        email,
        headline: headline.trim() || (role === 'teacher' ? 'Course Instructor' : 'Active Learner'),
        role,
      });
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={mode === 'signin' ? 'Sign in to EduFlow' : 'Create an EduFlow Account'}>
      <div className="p-6">
        <div className="mb-5 flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(''); }}
            className={cn('flex-1 rounded-lg py-1.5 text-xs font-bold transition', mode === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900')}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); }}
            className={cn('flex-1 rounded-lg py-1.5 text-xs font-bold transition', mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900')}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700">
            <Icon name="alert" className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <>
              <Field label="Full Name">
                <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jordan Miller" required />
              </Field>
              <Field label="Headline">
                <TextInput value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. Software Engineer / Product Designer" />
              </Field>
              <Field label="I want to">
                <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
                  <option value="student">Learn Courses (Student)</option>
                  <option value="teacher">Teach &amp; Create Courses (Instructor)</option>
                </Select>
              </Field>
            </>
          )}

          <Field label="Email Address">
            <TextInput value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@domain.com" required />
          </Field>

          <Button className="w-full mt-2" icon={mode === 'signin' ? 'log-in' : 'user-plus'} type="submit">
            {mode === 'signin' ? 'Sign In' : 'Create Free Account'}
          </Button>
        </form>

        {/* Quick persona login shortcuts */}
        <div className="mt-6 border-t border-slate-100 pt-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Quick Demo Accounts</p>
          <div className="mt-2 space-y-1.5">
            {data.users.slice(0, 3).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  switchActiveUser(u.id);
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-xl bg-slate-50 p-2 text-left text-xs transition hover:bg-indigo-50"
              >
                <div className="flex items-center gap-2">
                  <Avatar name={u.name} size="xs" />
                  <div>
                    <p className="font-bold text-slate-800">{u.name}</p>
                    <p className="text-[10px] text-slate-400">{u.email}</p>
                  </div>
                </div>
                <Badge tone={u.role === 'admin' ? 'violet' : u.role === 'teacher' ? 'indigo' : 'emerald'} className="text-[10px]">
                  {u.role}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Footer() {
  const { navigate, switchRole } = useApp();
  return (
    <footer className="mt-20 border-t border-slate-200/80 bg-white" data-no-print>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
              <Icon name="logo" className="h-5 w-5" strokeWidth={2} />
            </span>
            <span className="text-xl font-black tracking-tight text-slate-900">
              Edu<span className="text-indigo-600">Flow</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
            Next-generation Learning Management System. Build interactive courses, track live learner progress, and issue cryptographically verifiable certificates.
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Learning</p>
          <ul className="mt-4 space-y-2.5 text-sm font-semibold text-slate-600">
            <li><button className="transition hover:text-indigo-600" onClick={() => navigate({ page: 'catalog' })}>Course Catalog</button></li>
            <li><button className="transition hover:text-indigo-600" onClick={() => navigate({ page: 's-courses' })}>My Enrolled Courses</button></li>
            <li><button className="transition hover:text-indigo-600" onClick={() => navigate({ page: 's-wishlist' })}>Saved Wishlist</button></li>
            <li><button className="transition hover:text-indigo-600" onClick={() => navigate({ page: 's-certs' })}>Certificates</button></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Teaching</p>
          <ul className="mt-4 space-y-2.5 text-sm font-semibold text-slate-600">
            <li><button className="transition hover:text-indigo-600" onClick={() => switchRole('teacher')}>Instructor Studio</button></li>
            <li><button className="transition hover:text-indigo-600" onClick={() => navigate({ page: 't-courses', newCourse: true })}>Create New Course</button></li>
            <li><button className="transition hover:text-indigo-600" onClick={() => navigate({ page: 't-students' })}>Learner Roster</button></li>
            <li><button className="transition hover:text-indigo-600" onClick={() => navigate({ page: 't-analytics' })}>Course Analytics</button></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Verification &amp; Security</p>
          <ul className="mt-4 space-y-2.5 text-sm font-semibold text-slate-600">
            <li><button className="transition hover:text-indigo-600" onClick={() => navigate({ page: 'verify' })}>Certificate Verification</button></li>
            <li><span className="font-normal text-slate-500">Encrypted Local Storage Engine</span></li>
            <li><span className="font-normal text-slate-500">React 19 &amp; Vite Platform</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        EduFlow LMS &middot; Empowering lifelong learners and creators worldwide.
      </div>
    </footer>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/70 text-slate-900">
      <Header onOpenProfile={() => setProfileOpen(true)} onOpenAuth={() => setAuthOpen(true)} />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
      <Toasts />
      <ProfileModalWrapper open={profileOpen} onClose={() => setProfileOpen(false)} />
      <AuthModalWrapper open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
