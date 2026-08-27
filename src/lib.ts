import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Course, Enrolment } from './types';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

let uidCounter = 0;
export function uid(prefix: string): string {
  uidCounter += 1;
  return `${prefix}_${Date.now().toString(36)}${uidCounter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function daysAgoISO(days: number, jitterHours = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(Math.max(0, Math.min(23, d.getHours() - jitterHours)), jitterHours * 7 % 60, 0, 0);
  return d.toISOString();
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function fmtDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs === 1 ? '1 hour ago' : `${hrs} hours ago`;
  const days = Math.floor(hrs / 24);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}

export function fmtDuration(totalMin: number): string {
  if (totalMin < 60) return `${totalMin}m`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function courseMinutes(course: Course): number {
  return course.chapters.reduce((s, c) => s + c.durationMin, 0);
}

// ── progress helpers ─────────────────────────────────────────
export function progressOf(course: Course, enrolment: Enrolment | undefined): { done: number; total: number; pct: number } {
  const total = course.chapters.length;
  if (!enrolment || total === 0) return { done: 0, total, pct: 0 };
  const chapterIds = new Set(course.chapters.map((c) => c.id));
  const done = enrolment.completedChapterIds.filter((id) => chapterIds.has(id)).length;
  return { done, total, pct: Math.round((done / total) * 100) };
}

export function nextChapter(course: Course, enrolment: Enrolment | undefined): string | undefined {
  const doneSet = new Set(enrolment?.completedChapterIds ?? []);
  return course.chapters.find((c) => !doneSet.has(c.id))?.id;
}

export function makeCode(studentId: string, courseId: string): string {
  let h = 0;
  const s = `${studentId}:${courseId}:eduflow`;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return `EF-${h.toString(36).toUpperCase().padStart(6, '0').slice(0, 4)}-${(h * 7 % 46656).toString(36).toUpperCase().padStart(3, '0')}`;
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
}

const AVATAR_TONES = [
  'from-indigo-500 to-violet-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-sky-500 to-cyan-500',
  'from-fuchsia-500 to-purple-500',
];

export function avatarTone(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 33 + name.charCodeAt(i)) >>> 0;
  return AVATAR_TONES[h % AVATAR_TONES.length];
}

export function firstName(name: string): string {
  return name.split(' ')[0] ?? name;
}

// human join: ["a","b","c"] -> "a, b and c"
export function humanJoin(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}
