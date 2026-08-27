import { useMemo, useState } from 'react';
import type { Chapter, Course } from '../types';
import { useApp } from '../store';
import { DEMO_STUDENT_ID } from '../data/seed';
import { cn, courseMinutes, fmtDuration, progressOf } from '../lib';
import { Avatar, Badge, Button, EmptyState, Icon, LevelBadge, Modal, ProgressBar } from '../components/ui';

// ─────────────────────────────────────────────────────────────
// Shared course card
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// Shared course card
// ─────────────────────────────────────────────────────────────
export function CourseCard({ course }: { course: Course }) {
  const { data, navigate, enrolledCount } = useApp();
  const teacher = data.users.find((u) => u.id === course.teacherId);
  const category = data.categories.find((c) => c.id === course.categoryId);
  const students = enrolledCount(course.id);
  const [imgError, setImgError] = useState(false);

  return (
    <button
      onClick={() => navigate({ page: 'course', id: course.id })}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white text-left shadow-soft ring-1 ring-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-900">
        {course.coverImage && !imgError ? (
          <img
            src={course.coverImage}
            alt={`${course.title} cover`}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-600 via-indigo-900 to-slate-900">
            <Icon name={category?.icon ?? 'book-open'} className="h-12 w-12 text-white/20" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
        {category && (
          <span className="absolute left-3 top-3">
            <Badge tone="indigo" className="bg-white/95 shadow-sm">{category.name}</Badge>
          </span>
        )}
        {course.featured && (
          <span className="absolute right-3 top-3">
            <Badge tone="amber" icon="star" className="bg-white/95 shadow-sm">Featured</Badge>
          </span>
        )}
        <span className="absolute bottom-3 left-3">
          <LevelBadge level={course.level} />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-bold leading-snug text-slate-900 transition-colors group-hover:text-indigo-700">{course.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-500">{course.description}</p>
        <div className="mt-4 flex items-center gap-2.5">
          <Avatar name={teacher?.name ?? 'Unknown'} size="xs" />
          <span className="truncate text-sm font-semibold text-slate-600">{teacher?.name ?? 'Instructor'}</span>
        </div>
        <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-400">
          <span className="inline-flex items-center gap-1.5"><Icon name="layers" className="h-3.5 w-3.5" /> {course.chapters.length} chapters</span>
          <span className="inline-flex items-center gap-1.5"><Icon name="clock" className="h-3.5 w-3.5" /> {fmtDuration(courseMinutes(course))}</span>
          <span className="ml-auto inline-flex items-center gap-1.5"><Icon name="users" className="h-3.5 w-3.5" /> {students} enrolled</span>
        </div>
      </div>
    </button>
  );
}

function useHelpers() {
  const { data, enrolledCount } = useApp();
  return useMemo(() => {
    const published = data.courses.filter((c) => c.status === 'published');
    return {
      published,
      categoryById: (id: string) => data.categories.find((c) => c.id === id),
      teacherById: (id: string) => data.users.find((u) => u.id === id),
      countFor: enrolledCount,
    };
  }, [data, enrolledCount]);
}

// ─────────────────────────────────────────────────────────────
// HOME
// ─────────────────────────────────────────────────────────────
export function HomePage() {
  const { data, navigate, switchRole } = useApp();
  const { published } = useHelpers();

  const featured = published.filter((c) => c.featured).slice(0, 4);
  const totalChapters = published.reduce((s, c) => s + c.chapters.length, 0);
  const totalStudents = data.users.filter((u) => u.role === 'student').length;

  const stats = [
    { icon: 'book-open' as const, value: String(published.length), label: 'Published courses' },
    { icon: 'layers' as const, value: `${totalChapters}`, label: 'Course chapters' },
    { icon: 'users' as const, value: String(totalStudents), label: 'Registered learners' },
    { icon: 'award' as const, value: String(data.certificates.length), label: 'Certificates awarded' },
  ];

  const steps = [
    {
      icon: 'search' as const,
      title: 'Find your course',
      text: 'Browse the catalog by category or level, watch a free preview chapter, and enrol in one click — every course is free.',
    },
    {
      icon: 'play' as const,
      title: 'Learn chapter by chapter',
      text: 'Short, focused lessons you can finish on a commute. Tick each chapter off and watch your progress bar climb.',
    },
    {
      icon: 'award' as const,
      title: 'Earn your certificate',
      text: 'Finish every chapter to unlock a verifiable certificate of completion you can share with employers.',
    },
  ];

  const features = [
    {
      icon: 'layers' as const,
      title: 'Bite-Sized Chapters',
      text: 'Focused, step-by-step video & text lessons designed for high completion rates and immediate retention.',
    },
    {
      icon: 'grad-cap' as const,
      title: 'Teacher Studio',
      text: 'Complete course authoring suite with drag-and-drop chapters, free preview toggles, and live learner tracking.',
    },
    {
      icon: 'award' as const,
      title: 'Verifiable Certificates',
      text: 'Unique, cryptographically coded certificates automatically generated once a student finishes 100% of a course.',
    },
  ];

  const heroCourse = published[0];

  return (
    <div className="overflow-x-clip">
      {/* ── Hero ── */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />
          <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(99,102,241,0.12)_1px,transparent_0)] [background-size:28px_28px]" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-2 lg:pb-24 lg:pt-20">
          <div className="animate-fade-up">
            <Badge tone="indigo" icon="sparkles" className="mb-5">Clean &amp; Modern Learning Management System</Badge>
            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem]">
              Learn anything,{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">one chapter</span>{' '}
              at a time.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-600">
              EduFlow gives you a clean slate for creating, teaching, and learning. Enrol in courses, track real progress from zero, and earn verifiable certificates.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" iconRight="arrow-right" onClick={() => navigate({ page: 'catalog' })}>
                Browse catalog
              </Button>
              <Button size="lg" variant="secondary" icon="grad-cap" onClick={() => switchRole('teacher')}>
                Create a course
              </Button>
            </div>
          </div>

          {/* hero preview player / clean card */}
          <div className="relative hidden lg:block animate-fade-up" style={{ animationDelay: '120ms' }}>
            <div className="relative mx-auto max-w-md">
              {heroCourse ? (
                <div className="overflow-hidden rounded-3xl bg-white shadow-2xl shadow-indigo-950/10 ring-1 ring-slate-900/10">
                  <div className="relative aspect-[16/10] bg-slate-900">
                    {heroCourse.coverImage ? (
                      <img src={heroCourse.coverImage} alt="" className="h-full w-full object-cover opacity-60" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-slate-950 opacity-90" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={() => navigate({ page: 'course', id: heroCourse.id })}
                        aria-label={`Preview ${heroCourse.title}`}
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-indigo-600 shadow-xl transition hover:scale-105"
                      >
                        <Icon name="play" className="h-6 w-6 translate-x-0.5" />
                      </button>
                    </div>
                    <span className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                      {heroCourse.chapters[0]?.title ? `Chapter 1 · ${heroCourse.chapters[0].title}` : heroCourse.title}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">{heroCourse.title}</p>
                        <p className="text-xs font-medium text-slate-400">
                          {data.users.find((u) => u.id === heroCourse.teacherId)?.name ?? 'Instructor'} · {heroCourse.chapters.length} chapters
                        </p>
                      </div>
                      <Badge tone="indigo">Published</Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden rounded-3xl bg-white p-7 shadow-2xl shadow-indigo-950/10 ring-1 ring-slate-900/10 text-left">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                      <Icon name="book-open" className="h-6 w-6" />
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900">Clean Slate Ready</h3>
                      <p className="text-xs text-slate-400">No mock enrolments or pre-watched courses</p>
                    </div>
                  </div>
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-700">
                      <span className="flex items-center gap-2">
                        <Icon name="check-circle" className="h-4 w-4 text-emerald-500" />
                        0 pre-watched chapters
                      </span>
                      <Badge tone="emerald">Fresh</Badge>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-700">
                      <span className="flex items-center gap-2">
                        <Icon name="check-circle" className="h-4 w-4 text-emerald-500" />
                        Interactive learning tracker
                      </span>
                      <Badge tone="indigo">Ready</Badge>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-700">
                      <span className="flex items-center gap-2">
                        <Icon name="check-circle" className="h-4 w-4 text-emerald-500" />
                        Automatic certificate issuance
                      </span>
                      <Badge tone="amber">Active</Badge>
                    </div>
                  </div>
                  <Button className="mt-6 w-full" icon="plus" onClick={() => switchRole('teacher')}>
                    Create your first course
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="border-y border-slate-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-slate-100 px-4 sm:px-6 md:grid-cols-4 md:divide-x">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-3.5 py-7 md:justify-center">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Icon name={s.icon} className="h-5.5 w-5.5" />
              </span>
              <span>
                <span className="block text-2xl font-extrabold tracking-tight text-slate-900">{s.value}</span>
                <span className="block text-xs font-semibold text-slate-400">{s.label}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured courses ── */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <Badge tone="amber" icon="star" className="mb-3">Hand-picked</Badge>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Featured courses</h2>
              <p className="mt-1.5 text-sm text-slate-500">The courses our learners finish — and recommend — the most.</p>
            </div>
            <Button variant="ghost" iconRight="arrow-right" onClick={() => navigate({ page: 'catalog' })}>
              View all {published.length} courses
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </section>
      )}

      {/* ── Categories ── */}
      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 text-center">
            <Badge tone="violet" icon="tag" className="mb-3">Browse by topic</Badge>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Course Categories</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">Pick a category to discover published courses or create a course under any topic.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {data.categories.map((cat) => {
              const count = published.filter((c) => c.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => navigate({ page: 'catalog', categoryId: cat.id })}
                  className="group rounded-2xl bg-slate-50 p-5 text-left ring-1 ring-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:bg-indigo-50/60 hover:shadow-lift"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm ring-1 ring-slate-900/5 transition group-hover:bg-indigo-600 group-hover:text-white">
                    <Icon name={cat.icon} className="h-5.5 w-5.5" />
                  </span>
                  <p className="mt-4 font-bold text-slate-900">{cat.name}</p>
                  <p className="mt-1 text-xs font-medium text-slate-400">
                    {count} course{count === 1 ? '' : 's'}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="mb-10 text-center">
          <Badge tone="indigo" icon="sparkles" className="mb-3">Built for focused learning</Badge>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">How EduFlow works</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((item) => (
            <div key={item.title} className="relative overflow-hidden rounded-2xl bg-white p-7 shadow-soft ring-1 ring-slate-900/5">
              <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25">
                <Icon name={item.icon} className="h-5.5 w-5.5" />
              </span>
              <h3 className="relative mt-5 text-lg font-bold text-slate-900">{item.title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-slate-500">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Teacher banner ── */}
      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 px-6 py-12 sm:px-12 lg:px-16">
          <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-violet-400/30 blur-3xl" />
          <div className="relative flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <Badge className="mb-4 bg-white/15 text-white ring-white/25" icon="grad-cap">Teacher Studio</Badge>
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Create your own course today.</h2>
              <p className="mt-3 text-sm leading-relaxed text-indigo-100 sm:text-base">
                Draft chapters, add what students will learn, publish to the catalog, and track real learner progress.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button
                size="lg"
                className="bg-white text-indigo-700 shadow-xl hover:bg-indigo-50"
                iconRight="arrow-right"
                onClick={() => switchRole('teacher')}
              >
                Open teacher studio
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CATALOG
// ─────────────────────────────────────────────────────────────
export function CatalogPage({ initialCategoryId }: { initialCategoryId?: string }) {
  const { data } = useApp();
  const { published, teacherById } = useHelpers();
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState<string | 'all'>(initialCategoryId ?? 'all');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return published.filter((c) => {
      if (categoryId !== 'all' && c.categoryId !== categoryId) return false;
      if (!q) return true;
      const teacher = teacherById(c.teacherId)?.name.toLowerCase() ?? '';
      return c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || teacher.includes(q);
    });
  }, [published, query, categoryId, teacherById]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Course catalog</h1>
        <p className="mt-2 text-base leading-relaxed text-slate-500">
          Every course is free, every course ends with a certificate. Search by topic or teacher, or filter by category.
        </p>
      </div>

      {/* search + filters */}
      <div className="mt-8 space-y-4">
        <div className="relative max-w-xl">
          <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, topics or teachers…"
            aria-label="Search courses"
            className="w-full rounded-2xl bg-white py-3.5 pl-11 pr-11 text-sm font-medium text-slate-900 shadow-soft ring-1 ring-slate-900/5 transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <Icon name="x" className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FilterPill active={categoryId === 'all'} onClick={() => setCategoryId('all')} label={`All (${published.length})`} />
          {data.categories.map((cat) => {
            const count = published.filter((c) => c.categoryId === cat.id).length;
            return (
              <FilterPill
                key={cat.id}
                active={categoryId === cat.id}
                onClick={() => setCategoryId(categoryId === cat.id ? 'all' : cat.id)}
                label={cat.name}
                count={count}
                icon={cat.icon}
              />
            );
          })}
        </div>
      </div>

      {/* results */}
      <p className="mt-8 text-sm font-semibold text-slate-400" role="status">
        {results.length === published.length ? `Showing all ${published.length} courses` : `${results.length} course${results.length === 1 ? '' : 's'} found`}
      </p>

      {results.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon="search"
            title="No courses match that search"
            description="Try a different keyword or clear your filters — new courses are added by teachers all the time."
            action={
              <Button
                variant="secondary"
                icon="reset"
                onClick={() => {
                  setQuery('');
                  setCategoryId('all');
                }}
              >
                Clear search &amp; filters
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({ active, onClick, label, count, icon }: { active: boolean; onClick: () => void; label: string; count?: number; icon?: Parameters<typeof Icon>[0]['name'] }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-inset transition-all',
        active
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-indigo-600'
          : 'bg-white text-slate-600 ring-slate-200 hover:ring-slate-300 hover:text-slate-900',
      )}
    >
      {icon && <Icon name={icon} className="h-3.5 w-3.5" />}
      {label}
      {typeof count === 'number' && <span className={cn('text-xs', active ? 'text-indigo-200' : 'text-slate-400')}>{count}</span>}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// COURSE DETAIL
// ─────────────────────────────────────────────────────────────
export function CourseDetailPage({ courseId }: { courseId: string }) {
  const app = useApp();
  const { data, navigate, enrolmentFor, enrolledCount, toast, enrol, role, switchRole } = app;
  const course = data.courses.find((c) => c.id === courseId);
  const [preview, setPreview] = useState<Chapter | null>(null);
  const [coverImgErr, setCoverImgErr] = useState(false);

  if (!course) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <EmptyState
          icon="alert"
          title="Course not found"
          description="This course may have been removed or the demo data was reset."
          action={<Button onClick={() => navigate({ page: 'catalog' })}>Back to catalog</Button>}
        />
      </div>
    );
  }

  const teacher = data.users.find((u) => u.id === course.teacherId);
  const category = data.categories.find((c) => c.id === course.categoryId);
  const totalMin = courseMinutes(course);
  const students = enrolledCount(course.id);
  const enrolment = enrolmentFor(course.id);
  const { done, pct } = progressOf(course, enrolment);
  const enrolled = Boolean(enrolment);
  const complete = enrolled && pct >= 100;
  const isOwnerTeacher = role === 'teacher' && course.teacherId === app.currentUser.id;
  const isAdmin = role === 'admin';

  const handleEnrol = () => {
    if (role !== 'student') {
      // enrol the demo student explicitly — the role switch hasn't applied yet
      enrol(course.id, DEMO_STUDENT_ID);
      switchRole('student');
      toast(`Switched to the Student view and enrolled Maya Chen — happy learning!`, 'info');
      navigate({ page: 's-learn', courseId: course.id });
      return;
    }
    enrol(course.id);
    toast(`Enrolled in “${course.title}” — it's in My learning now`, 'success');
    navigate({ page: 's-learn', courseId: course.id });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      {course.status === 'draft' && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-amber-50 px-5 py-3.5 text-sm font-semibold text-amber-800 ring-1 ring-amber-200">
          <Icon name="eye-off" className="h-4.5 w-4.5 shrink-0" />
          This course is an unpublished draft — only its teacher and admins can see this page.
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => navigate({ page: 'catalog' })} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-indigo-600">
          <Icon name="chevron-left" className="h-4 w-4" /> All courses
        </button>
        {(isOwnerTeacher || isAdmin) && (
          <Button variant="secondary" size="sm" icon="pencil" onClick={() => navigate({ page: 't-edit', id: course.id })}>
            Edit course
          </Button>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] xl:gap-12">
        {/* ── main column ── */}
        <div>
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-lift lg:hidden">
            {course.coverImage && !coverImgErr ? (
              <img
                src={course.coverImage}
                alt={`${course.title} cover`}
                onError={() => setCoverImgErr(true)}
                className="aspect-[16/9] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-indigo-700 via-indigo-900 to-slate-950 p-6 text-center">
                <Icon name={category?.icon ?? 'book-open'} className="h-16 w-16 text-white/30" />
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2 lg:mt-0">
            {category && <Badge tone="indigo" icon={category.icon}>{category.name}</Badge>}
            <LevelBadge level={course.level} />
            {course.featured && <Badge tone="amber" icon="star">Featured</Badge>}
          </div>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">{course.title}</h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg whitespace-pre-line">{course.longDescription}</p>

          {/* stats row */}
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: 'layers' as const, label: 'Chapters', value: String(course.chapters.length) },
              { icon: 'clock' as const, label: 'Total length', value: fmtDuration(totalMin) },
              { icon: 'users' as const, label: 'Students', value: String(students) },
              { icon: 'bar-chart' as const, label: 'Level', value: course.level },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white p-4 shadow-soft ring-1 ring-slate-900/5">
                <Icon name={s.icon} className="h-4.5 w-4.5 text-indigo-500" />
                <p className="mt-2.5 text-lg font-extrabold text-slate-900">{s.value}</p>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>

          {/* what you'll learn */}
          {course.whatYouLearn.length > 0 && (
            <div className="mt-8 rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-900/5 sm:p-7">
              <h2 className="text-lg font-bold text-slate-900">What you&apos;ll learn</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {course.whatYouLearn.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-600">
                    <Icon name="check-circle" className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* chapter list */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-slate-900">Course content</h2>
            <p className="mt-1 text-sm text-slate-500">
              {course.chapters.length} chapters · {fmtDuration(totalMin)} total · {course.chapters.filter((c) => c.freePreview).length} free preview{course.chapters.filter((c) => c.freePreview).length === 1 ? '' : 's'}
            </p>
            <ol className="mt-4 overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-900/5">
              {course.chapters.map((chap, i) => {
                const unlocked = enrolled || chap.freePreview;
                const doneChapter = enrolment?.completedChapterIds.includes(chap.id);
                return (
                  <li key={chap.id} className={cn(i > 0 && 'border-t border-slate-100')}>
                    <button
                      onClick={() => {
                        if (enrolled) {
                          navigate({ page: 's-learn', courseId: course.id, chapterId: chap.id });
                        } else if (chap.freePreview) {
                          setPreview(chap);
                        } else {
                          toast(`Enrol for free to unlock “${chap.title}”`, 'info');
                        }
                      }}
                      className="group flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-indigo-50/40"
                    >
                      <span
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-1 ring-inset',
                          doneChapter
                            ? 'bg-emerald-500 text-white ring-emerald-500'
                            : chap.freePreview
                              ? 'bg-indigo-50 text-indigo-600 ring-indigo-100'
                              : 'bg-slate-50 text-slate-400 ring-slate-100',
                        )}
                      >
                        {doneChapter ? <Icon name="check" className="h-4 w-4" strokeWidth={2.6} /> : String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                          <span className="text-sm font-bold text-slate-900">{chap.title}</span>
                          {chap.freePreview && <Badge tone="sky" icon="play">Free preview</Badge>}
                          {doneChapter && <Badge tone="emerald" icon="check">Done</Badge>}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-slate-400">{chap.description}</span>
                      </span>
                      <span className="hidden text-xs font-semibold text-slate-400 sm:block">{chap.durationMin} min</span>
                      <span className={cn(chap.freePreview ? 'text-indigo-500' : unlocked ? 'text-slate-300' : 'text-slate-300')}>
                        {unlocked ? (
                          <Icon name={chap.freePreview && !enrolled ? 'play' : 'chevron-right'} className="h-4.5 w-4.5" />
                        ) : (
                          <Icon name="lock" className="h-4.5 w-4.5" />
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        {/* ── sidebar ── */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="hidden overflow-hidden rounded-3xl bg-slate-900 shadow-lift lg:block">
            {course.coverImage && !coverImgErr ? (
              <img
                src={course.coverImage}
                alt={`${course.title} cover`}
                onError={() => setCoverImgErr(true)}
                className="aspect-[16/9] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-indigo-700 via-indigo-900 to-slate-950 p-6 text-center">
                <Icon name={category?.icon ?? 'book-open'} className="h-16 w-16 text-white/30" />
              </div>
            )}
          </div>

          <div className="mt-5 rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-900/5">
            {enrolled && (
              <div className="mb-5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-500">Your progress</span>
                  <span className={pct >= 100 ? 'text-emerald-600' : 'text-indigo-600'}>
                    {done} of {course.chapters.length} · {pct}%
                  </span>
                </div>
                <ProgressBar value={pct} className="mt-2" />
              </div>
            )}

            {complete ? (
              <Button size="lg" className="w-full bg-emerald-600 shadow-emerald-600/25 hover:bg-emerald-700" icon="check-circle" onClick={() => navigate({ page: 's-learn', courseId: course.id })}>
                Review course
              </Button>
            ) : enrolled ? (
              <Button size="lg" className="w-full" iconRight="arrow-right" onClick={() => navigate({ page: 's-learn', courseId: course.id })}>
                Continue learning
              </Button>
            ) : (
              <>
                <div className="mb-4 text-center">
                  <span className="text-3xl font-extrabold text-slate-900">Free</span>
                  <span className="ml-2 text-sm font-semibold text-slate-400 line-through">$89</span>
                </div>
                <Button size="lg" className="w-full" iconRight="arrow-right" onClick={handleEnrol}>
                  Enrol now — it&apos;s free
                </Button>
                <p className="mt-3 text-center text-xs leading-relaxed text-slate-400">
                  Instant access to all {course.chapters.length} chapters · certificate on completion
                </p>
              </>
            )}

            {(isOwnerTeacher || isAdmin) && (
              <Button variant="secondary" className="mt-3 w-full" icon="pencil" onClick={() => navigate({ page: 't-edit', id: course.id })}>
                Edit this course
              </Button>
            )}

            <ul className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm font-medium text-slate-600">
              {[
                { icon: 'zap' as const, text: 'Learn at your own pace, on any device' },
                { icon: 'check-circle' as const, text: 'Chapter-by-chapter progress tracking' },
                { icon: 'award' as const, text: 'Verifiable certificate when you finish' },
              ].map((f) => (
                <li key={f.text} className="flex items-center gap-2.5">
                  <Icon name={f.icon} className="h-4.5 w-4.5 text-indigo-500" />
                  {f.text}
                </li>
              ))}
            </ul>
          </div>

          {/* teacher card */}
          {teacher && (
            <div className="mt-5 rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-900/5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Your teacher</p>
              <div className="mt-4 flex items-center gap-3.5">
                <Avatar name={teacher.name} size="lg" />
                <div className="min-w-0">
                  <p className="font-bold text-slate-900">{teacher.name}</p>
                  <p className="text-xs font-medium text-indigo-600">{teacher.headline}</p>
                </div>
              </div>
              {teacher.bio && <p className="mt-4 text-sm leading-relaxed text-slate-500">{teacher.bio}</p>}
              <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="book-open" className="h-3.5 w-3.5" />
                  {data.courses.filter((c) => c.teacherId === teacher.id && c.status === 'published').length} courses
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="users" className="h-3.5 w-3.5" />
                  {data.enrolments.filter((e) => data.courses.find((c) => c.id === e.courseId)?.teacherId === teacher.id).length} students taught
                </span>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* preview modal */}
      <Modal open={Boolean(preview)} onClose={() => setPreview(null)} wide>
        {preview && (
          <div>
            <div className="relative aspect-video bg-slate-900">
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.5),transparent_55%),radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.4),transparent_50%)]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-indigo-600 shadow-xl">
                  <Icon name="play" className="h-6 w-6 translate-x-0.5" />
                </span>
                <p className="px-6 text-sm font-semibold text-slate-300">Preview · {preview.title}</p>
                <span className="rounded-full bg-black/50 px-3 py-1 text-xs font-bold text-white">{preview.durationMin} min</span>
              </div>
            </div>
            <div className="p-6">
              <Badge tone="sky" icon="play" className="mb-3">Free preview</Badge>
              <h3 className="text-xl font-bold text-slate-900">{preview.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{preview.description}</p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button className="flex-1" iconRight="arrow-right" onClick={() => { setPreview(null); handleEnrol(); }}>
                  Enrol to watch the full course
                </Button>
                <Button variant="secondary" onClick={() => setPreview(null)}>Keep browsing</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
