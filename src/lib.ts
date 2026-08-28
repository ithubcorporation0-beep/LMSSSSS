import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Course, Enrolment, VideoType } from './types';

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
  d.setHours(Math.max(0, Math.min(23, d.getHours() - jitterHours)), (jitterHours * 7) % 60, 0, 0);
  return d.toISOString();
}

export function fmtDate(iso: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function fmtDateShort(iso: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function timeAgo(iso: string): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs === 1 ? '1h ago' : `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? '1mo ago' : `${months}mo ago`;
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

// ── Progress Helpers ─────────────────────────────────────────
export function progressOf(course: Course, enrolment: Enrolment | undefined): { done: number; total: number; pct: number } {
  const total = course.chapters.length;
  if (!enrolment || total === 0) return { done: 0, total, pct: 0 };
  const chapterIds = new Set(course.chapters.map((c) => c.id));
  const done = enrolment.completedChapterIds.filter((id) => chapterIds.has(id)).length;
  return { done, total, pct: Math.min(100, Math.round((done / total) * 100)) };
}

export function nextChapter(course: Course, enrolment: Enrolment | undefined): string | undefined {
  const doneSet = new Set(enrolment?.completedChapterIds ?? []);
  return course.chapters.find((c) => !doneSet.has(c.id))?.id;
}

export function makeCode(studentId: string, courseId: string): string {
  let h = 0;
  const s = `${studentId}:${courseId}:eduflow_cert_v1`;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const part1 = (h % 9000 + 1000).toString();
  const part2 = ((h * 13) % 9000 + 1000).toString();
  return `EDU-${part1}-${part2}`;
}

export function initials(name: string): string {
  if (!name) return 'U';
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
  if (!name) return '';
  return name.split(' ')[0] ?? name;
}

export function humanJoin(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

// ── Video URL Parser ─────────────────────────────────────────
export interface ParsedVideo {
  type: VideoType;
  embedUrl: string;
  isDirect: boolean;
}

export function parseVideoUrl(url?: string): ParsedVideo | null {
  if (!url || !url.trim()) return null;
  const trimmed = url.trim();

  // YouTube
  // https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID or https://www.youtube.com/embed/VIDEO_ID
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0&modestbranding=1`,
      isDirect: false,
    };
  }

  // Vimeo
  // https://vimeo.com/123456789 or https://player.vimeo.com/video/123456789
  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?title=0&byline=0&portrait=0`,
      isDirect: false,
    };
  }

  // Loom
  // https://www.loom.com/share/ID or https://www.loom.com/embed/ID
  const loomMatch = trimmed.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/i);
  if (loomMatch && loomMatch[1]) {
    return {
      type: 'loom',
      embedUrl: `https://www.loom.com/embed/${loomMatch[1]}`,
      isDirect: false,
    };
  }

  // Direct MP4 / WebM / Ogg video URL
  if (/\.(mp4|webm|ogg)($|\?)/i.test(trimmed)) {
    return {
      type: 'mp4',
      embedUrl: trimmed,
      isDirect: true,
    };
  }

  // If standard http/https link that's not embeddable, fallback to direct
  if (/^https?:\/\//i.test(trimmed)) {
    return {
      type: 'mp4',
      embedUrl: trimmed,
      isDirect: true,
    };
  }

  return null;
}

export function downloadTextFile(filename: string, text: string) {
  const element = document.createElement('a');
  const file = new Blob([text], { type: 'text/markdown;charset=utf-8' });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
