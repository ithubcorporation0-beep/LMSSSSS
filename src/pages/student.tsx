import { useEffect, useMemo, useState } from 'react';
import type { Certificate, Chapter, Course } from '../types';
import { useApp } from '../store';
import { cn, firstName, fmtDate, nextChapter, progressOf } from '../lib';
import { Avatar, Badge, Button, EmptyState, Icon, LevelBadge, Modal, PageHeader, ProgressBar, StatCard } from '../components/ui';
import { CourseCard } from './public';

// ─────────────────────────────────────────────────────────────
// STUDENT DASHBOARD
// ─────────────────────────────────────────────────────────────
export function StudentDashboard() {
  const { data, currentUser, navigate } = useApp();

  const myEnrolments = data.enrolments.filter((e) => e.studentId === currentUser.id);
  const courseById = (id: string) => data.courses.find((c) => c.id === id);

  const completedCourses = myEnrolments.filter((e) => {
    const c = courseById(e.courseId);
    return c && progressOf(c, e).pct >= 100;
  }).length;
  const chaptersDone = myEnrolments.reduce((s, e) => s + e.completedChapterIds.length, 0);

  const recent = [...myEnrolments]
    .filter((e) => courseById(e.courseId))
    .sort((a, b) => b.lastAccessedAt.localeCompare(a.lastAccessedAt))[0];
  const recentCourse = recent ? courseById(recent.courseId)! : undefined;
  const recentTeacher = recentCourse ? data.users.find((u) => u.id === recentCourse.teacherId) : undefined;
  const recentProgress = recentCourse ? progressOf(recentCourse, recent) : undefined;

  const recommended = data.courses
    .filter((c) => c.status === 'published' && !myEnrolments.some((e) => e.courseId === c.id))
    .slice(0, 3);

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-400">{today}</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Welcome back, {firstName(currentUser.name)}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">Small steps, every day — that&apos;s how courses get finished.</p>
        </div>
        <Button variant="secondary" icon="search" onClick={() => navigate({ page: 'catalog' })}>
          Find a new course
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard icon="book-open" label="Courses enrolled" value={myEnrolments.length} tint="indigo" sub="All free, all yours forever." />
        <StatCard icon="check-circle" label="Courses completed" value={completedCourses} tint="emerald" sub={completedCourses > 0 ? 'Certificates unlocked by finishing.' : 'Finish every chapter to complete a course.'} />
        <StatCard icon="layers" label="Chapters completed" value={chaptersDone} tint="violet" sub="Every tick counts towards a certificate." />
      </div>

      {/* continue learning */}
      {recentCourse && recentProgress && (
        <div className="mt-8 overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-slate-900/5">
          <div className="grid sm:grid-cols-[240px_1fr]">
            <div className="relative h-40 sm:h-full">
              <img src={recentCourse.coverImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
              {recentProgress.pct >= 100 && (
                <span className="absolute left-3 top-3"><Badge tone="emerald" icon="check-circle" className="bg-white/95 shadow">Completed</Badge></span>
              )}
            </div>
            <div className="p-6 sm:p-8">
              <Badge tone="indigo" icon="zap" className="mb-3">Continue learning</Badge>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">{recentCourse.title}</h2>
              <p className="mt-1.5 flex items-center gap-2 text-sm text-slate-500">
                <Avatar name={recentTeacher?.name ?? ''} size="xs" />
                {recentTeacher?.name} · {recentCourse.chapters.length} chapters
              </p>
              <div className="mt-5 flex items-center gap-4">
                <ProgressBar value={recentProgress.pct} className="flex-1" />
                <span className={cn('text-sm font-extrabold', recentProgress.pct >= 100 ? 'text-emerald-600' : 'text-indigo-600')}>{recentProgress.pct}%</span>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  icon={recentProgress.pct >= 100 ? 'eye' : 'play'}
                  onClick={() => navigate({ page: 's-learn', courseId: recentCourse.id, chapterId: nextChapter(recentCourse, recent) })}
                >
                  {recentProgress.pct >= 100 ? 'Review course' : 'Resume chapter'}
                </Button>
                <Button variant="ghost" onClick={() => navigate({ page: 's-courses' })}>
                  All my courses
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* recommended */}
      {recommended.length > 0 && (
        <section className="mt-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Recommended for you</h2>
              <p className="mt-1 text-sm text-slate-500">Fresh picks from the catalog you haven&apos;t started yet.</p>
            </div>
            <Button variant="ghost" iconRight="arrow-right" onClick={() => navigate({ page: 'catalog' })}>Browse catalog</Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MY COURSES
// ─────────────────────────────────────────────────────────────
export function StudentCoursesPage() {
  const { data, currentUser, navigate, issueCertificate, toast } = useApp();
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all');

  const rows = useMemo(() => {
    return data.enrolments
      .filter((e) => e.studentId === currentUser.id)
      .map((e) => ({ enrolment: e, course: data.courses.find((c) => c.id === e.courseId) }))
      .filter((r): r is { enrolment: (typeof data.enrolments)[number]; course: Course } => Boolean(r.course))
      .sort((a, b) => b.enrolment.lastAccessedAt.localeCompare(a.enrolment.lastAccessedAt));
  }, [data.enrolments, data.courses, currentUser.id]);

  const inProgress = rows.filter((r) => progressOf(r.course, r.enrolment).pct < 100);
  const completed = rows.filter((r) => progressOf(r.course, r.enrolment).pct >= 100);

  const displayed = filter === 'in_progress' ? inProgress : filter === 'completed' ? completed : rows;

  if (rows.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          icon="book-open"
          title="No courses yet"
          description="Once you enrol, your courses and progress will live here. The whole catalog is free — pick something that excites you."
          action={<Button iconRight="arrow-right" onClick={() => navigate({ page: 'catalog' })}>Browse the catalog</Button>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader title="My learning" subtitle={`${rows.length} course${rows.length === 1 ? '' : 's'} you're working through, ${firstName(currentUser.name)}.`} />

      {/* filter tabs */}
      <div className="mb-8 flex flex-wrap gap-2 border-b border-slate-200/80 pb-4">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'rounded-xl px-4 py-2 text-sm font-semibold transition',
            filter === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
          )}
        >
          All courses ({rows.length})
        </button>
        <button
          onClick={() => setFilter('in_progress')}
          className={cn(
            'rounded-xl px-4 py-2 text-sm font-semibold transition',
            filter === 'in_progress' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
          )}
        >
          In progress ({inProgress.length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={cn(
            'rounded-xl px-4 py-2 text-sm font-semibold transition',
            filter === 'completed' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
          )}
        >
          Completed ({completed.length})
        </button>
      </div>

      {displayed.length === 0 ? (
        <EmptyState
          icon="book-open"
          title={filter === 'completed' ? 'No completed courses yet' : 'No courses currently in progress'}
          description={filter === 'completed' ? 'Finish every chapter of a course to unlock its completion certificate.' : 'All of your courses are currently completed.'}
          action={<Button variant="secondary" onClick={() => setFilter('all')}>View all courses</Button>}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {displayed.map(({ enrolment, course }) => {
            const { done, total, pct } = progressOf(course, enrolment);
            const teacher = data.users.find((u) => u.id === course.teacherId);
            const category = data.categories.find((c) => c.id === course.categoryId);
            const finished = pct >= 100;
            return (
              <div key={enrolment.id} className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                <button onClick={() => navigate({ page: 's-learn', courseId: course.id })} className="relative block aspect-[16/9] overflow-hidden bg-slate-900">
                  {course.coverImage ? (
                    <img src={course.coverImage} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-700 via-indigo-900 to-slate-950">
                      <Icon name={category?.icon ?? 'book-open'} className="h-12 w-12 text-white/20" />
                    </div>
                  )}
                  <span className="absolute left-3 top-3"><LevelBadge level={course.level} /></span>
                  {finished && <span className="absolute right-3 top-3"><Badge tone="emerald" icon="check-circle" className="bg-white/95 shadow">Completed</Badge></span>}
                </button>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-base font-bold leading-snug text-slate-900">{course.title}</h3>
                  <p className="mt-1.5 flex items-center gap-2 text-sm text-slate-500">
                    <Avatar name={teacher?.name ?? ''} size="xs" /> {teacher?.name ?? 'Instructor'}
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <ProgressBar value={pct} className="flex-1" />
                    <span className={cn('text-xs font-extrabold', finished ? 'text-emerald-600' : 'text-indigo-600')}>
                      {done}/{total} · {pct}%
                    </span>
                  </div>
                  <div className="mt-5 flex gap-2.5">
                    <Button
                      className={cn('flex-1', finished && 'bg-emerald-600 shadow-emerald-600/25 hover:bg-emerald-700')}
                      icon={finished ? 'eye' : 'play'}
                      onClick={() => navigate({ page: 's-learn', courseId: course.id, chapterId: finished ? undefined : nextChapter(course, enrolment) })}
                    >
                      {finished ? 'Review course' : 'Continue'}
                    </Button>
                    {finished && (
                      <Button
                        variant="secondary"
                        icon="award"
                        onClick={() => {
                          const cert = issueCertificate(course.id);
                          if (cert) toast('Certificate ready — congratulations again!');
                          navigate({ page: 's-certs' });
                        }}
                      >
                        Certificate
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LEARNING PAGE — the heart of the app
// ─────────────────────────────────────────────────────────────
export function LearningPage({ courseId, chapterId }: { courseId: string; chapterId?: string }) {
  const app = useApp();
  const { data, navigate, currentUser, completeChapter, touchCourse, certificateFor, issueCertificate, toast, enrol } = app;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [congratsOpen, setCongratsOpen] = useState(false);

  const course = data.courses.find((c) => c.id === courseId);
  const enrolment = data.enrolments.find((e) => e.courseId === courseId && e.studentId === currentUser.id);

  const activeChapterId = useMemo(() => {
    if (!course) return undefined;
    if (chapterId && course.chapters.some((c) => c.id === chapterId)) return chapterId;
    return nextChapter(course, enrolment) ?? course.chapters[0]?.id;
  }, [course, chapterId, enrolment]);

  useEffect(() => {
    if (course && enrolment) touchCourse(course.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, activeChapterId]);

  if (!course) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <EmptyState icon="alert" title="Course not found" description="It may have been removed, or the demo data was reset." action={<Button onClick={() => navigate({ page: 's-courses' })}>Back to my courses</Button>} />
      </div>
    );
  }

  if (!enrolment) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <EmptyState
          icon="lock"
          title="You're not enrolled yet"
          description="Enrol for free to start this course — your chapter progress will be tracked here."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                iconRight="arrow-right"
                onClick={() => {
                  enrol(course.id);
                  toast(`Enrolled in “${course.title}” — welcome aboard!`);
                }}
              >
                Enrol for free
              </Button>
              <Button variant="secondary" onClick={() => navigate({ page: 'course', id: course.id })}>Course details</Button>
            </div>
          }
        />
      </div>
    );
  }

  const chapters = course.chapters;
  const activeIdx = Math.max(0, chapters.findIndex((c) => c.id === activeChapterId));
  const chapter: Chapter | undefined = chapters[activeIdx];
  const { done, total, pct } = progressOf(course, enrolment);
  const doneSet = new Set(enrolment.completedChapterIds);
  const prev = activeIdx > 0 ? chapters[activeIdx - 1] : undefined;
  const next = activeIdx < chapters.length - 1 ? chapters[activeIdx + 1] : undefined;
  const isDone = chapter ? doneSet.has(chapter.id) : false;

  const goTo = (id: string) => {
    navigate({ page: 's-learn', courseId: course.id, chapterId: id });
    setSidebarOpen(false);
  };

  const handleComplete = () => {
    if (!chapter || isDone) return;
    completeChapter(course.id, chapter.id);
    const willBeComplete = chapters.every((c) => c.id === chapter.id || doneSet.has(c.id));
    if (willBeComplete) {
      if (!certificateFor(course.id)) {
        setCongratsOpen(true);
      } else {
        toast('Course complete — nice work reviewing!');
      }
      return;
    }
    toast(`“${chapter.title}” marked complete`);
    if (next) goTo(next.id);
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-100 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Course progress</p>
        <p className="mt-2 text-sm font-bold text-slate-900">
          {done} of {total} complete <span className={cn('ml-1', pct >= 100 ? 'text-emerald-600' : 'text-indigo-600')}>({pct}%)</span>
        </p>
        <ProgressBar value={pct} className="mt-3" />
      </div>
      <ol className="flex-1 overflow-y-auto p-3">
        {chapters.map((c, i) => {
          const active = c.id === chapter?.id;
          const complete = doneSet.has(c.id);
          return (
            <li key={c.id}>
              <button
                onClick={() => goTo(c.id)}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'group flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition',
                  active ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'hover:bg-slate-50',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                    complete ? 'bg-emerald-500 text-white' : active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200',
                  )}
                >
                  {complete ? <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn('block truncate text-sm font-semibold', active ? 'text-indigo-900' : complete ? 'text-slate-500' : 'text-slate-800')}>
                    {c.title}
                  </span>
                  <span className="mt-0.5 flex items-center gap-2 text-[11px] font-medium text-slate-400">
                    <Icon name="clock" className="h-3 w-3" /> {c.durationMin} min
                    {c.freePreview && <span className="text-sky-500">preview</span>}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="border-t border-slate-100 p-4">
        <Button variant="secondary" size="sm" className="w-full" icon="arrow-left" onClick={() => navigate({ page: 's-courses' })}>
          My courses
        </Button>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
      {/* top bar */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <button onClick={() => navigate({ page: 'course', id: course.id })} className="inline-flex min-w-0 items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-indigo-600">
          <Icon name="chevron-left" className="h-4 w-4 shrink-0" />
          <span className="truncate">{course.title}</span>
        </button>
        <div className="flex items-center gap-2">
          <Badge tone={pct >= 100 ? 'emerald' : 'indigo'} icon={pct >= 100 ? 'check-circle' : 'layers'} className="hidden sm:inline-flex">
            {done}/{total} · {pct}%
          </Badge>
          <Button variant="secondary" size="sm" icon="menu" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            Chapters
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* desktop sidebar */}
        <aside className="hidden overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-900/5 lg:block lg:self-start" style={{ maxHeight: 'calc(100vh - 140px)', position: 'sticky', top: 96 }}>
          {sidebar}
        </aside>

        {/* mobile slide-out */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-label="Chapter list">
            <button aria-label="Close chapters" onClick={() => setSidebarOpen(false)} className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px] animate-fade-in" />
            <div className="absolute inset-y-0 left-0 w-[86vw] max-w-xs bg-white shadow-2xl animate-slide-in-left">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <p className="text-sm font-extrabold text-slate-900">Chapters</p>
                <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100" aria-label="Close">
                  <Icon name="x" className="h-5 w-5" />
                </button>
              </div>
              <div className="h-[calc(100%-57px)]">{sidebar}</div>
            </div>
          </div>
        )}

        {/* main content */}
        <div className="min-w-0">
          {chapter ? (
            <>
              {/* video placeholder */}
              <button
                onClick={() => toast('Video playback is mocked in this demo — imagine an inspiring lesson here', 'info')}
                className="group relative block aspect-video w-full overflow-hidden rounded-3xl bg-slate-900 text-left shadow-lift focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_25%,rgba(99,102,241,0.45),transparent_55%),radial-gradient(circle_at_75%_80%,rgba(139,92,246,0.35),transparent_50%)]" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-indigo-600 shadow-2xl transition-transform duration-300 group-hover:scale-110 sm:h-20 sm:w-20">
                    <Icon name="play" className="h-7 w-7 translate-x-0.5 sm:h-8 sm:w-8" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Lesson {activeIdx + 1} of {total}
                  </span>
                </div>
                {/* fake scrubber */}
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-slate-300">0:00</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
                      <div className="h-full w-[8%] rounded-full bg-indigo-400" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-300">{chapter.durationMin}:00</span>
                  </div>
                </div>
                <span className="absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                  {isDone ? 'Re-watching' : 'Now playing'}
                </span>
                {chapter.freePreview && <span className="absolute right-4 top-4"><Badge tone="sky" className="shadow">Free preview</Badge></span>}
              </button>

              {/* chapter header */}
              <div className="mt-7 flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-400">
                    Chapter {activeIdx + 1} · {chapter.durationMin} min
                  </p>
                  <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{chapter.title}</h1>
                </div>
                {isDone && <Badge tone="emerald" icon="check-circle" className="mt-1 shrink-0">Completed</Badge>}
              </div>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">{chapter.description}</p>

              {/* actions */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                {isDone ? (
                  <div className="inline-flex items-center gap-2.5 rounded-xl bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200">
                    <Icon name="check-circle" className="h-5 w-5" />
                    Chapter complete
                  </div>
                ) : (
                  <Button size="lg" icon="check" onClick={handleComplete}>
                    Mark as complete
                  </Button>
                )}
                <div className="flex gap-3 sm:ml-auto">
                  <Button variant="secondary" icon="arrow-left" disabled={!prev} onClick={() => prev && goTo(prev.id)}>
                    <span className="hidden sm:inline">Previous</span><span className="sm:hidden">Prev</span>
                  </Button>
                  {isDone && next ? (
                    <Button iconRight="arrow-right" onClick={() => goTo(next.id)}>Next chapter</Button>
                  ) : (
                    <Button variant="secondary" iconRight="arrow-right" disabled={!next} onClick={() => next && goTo(next.id)}>Next</Button>
                  )}
                </div>
              </div>

              {pct >= 100 && (
                <div className="mt-8 flex flex-col items-start gap-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="flex items-center gap-2 text-lg font-extrabold"><Icon name="award" className="h-5.5 w-5.5" /> Course complete!</p>
                    <p className="mt-1 text-sm text-emerald-50">You finished every chapter of “{course.title}”.</p>
                  </div>
                  <Button
                    className="bg-white text-emerald-700 shadow-lg hover:bg-emerald-50"
                    icon="certificate"
                    onClick={() => {
                      issueCertificate(course.id);
                      navigate({ page: 's-certs' });
                    }}
                  >
                    View my certificate
                  </Button>
                </div>
              )}
            </>
          ) : (
            <EmptyState icon="layers" title="No chapters yet" description="The teacher is still drafting this course — check back soon." />
          )}
        </div>
      </div>

      {/* congratulations dialog */}
      <Modal open={congratsOpen} onClose={() => setCongratsOpen(false)}>
        <div className="relative overflow-hidden p-8 text-center sm:p-10">
          <Confetti />
          <span className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-xl shadow-amber-500/30">
            <Icon name="award" className="h-10 w-10" />
          </span>
          <h2 className="relative mt-6 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Congratulations, {firstName(currentUser.name)}!</h2>
          <p className="relative mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
            You completed every chapter of <span className="font-bold text-slate-800">“{course.title}”</span>. Your certificate of completion is ready.
          </p>
          <div className="relative mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              icon="certificate"
              onClick={() => {
                issueCertificate(course.id);
                toast('Certificate issued — it’s saved on your Certificates page');
                setCongratsOpen(false);
                navigate({ page: 's-certs' });
              }}
            >
              Get my certificate
            </Button>
            <Button size="lg" variant="ghost" onClick={() => setCongratsOpen(false)}>
              Maybe later
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        left: (i * 37 + 13) % 100,
        delay: (i % 9) * 0.14,
        duration: 2.4 + (i % 5) * 0.35,
        color: ['bg-indigo-500', 'bg-violet-500', 'bg-amber-400', 'bg-emerald-500', 'bg-rose-400', 'bg-sky-400'][i % 6],
        rotate: (i * 53) % 360,
        size: 6 + (i % 3) * 3,
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          className={cn('absolute top-[-12px] rounded-[2px] animate-confetti', p.color)}
          style={{ left: `${p.left}%`, width: p.size, height: p.size * 0.6, animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s`, transform: `rotate(${p.rotate}deg)` }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CERTIFICATES
// ─────────────────────────────────────────────────────────────
export function CertificatesPage() {
  const { data, currentUser, navigate } = useApp();
  const mine = data.certificates
    .filter((c) => c.studentId === currentUser.id)
    .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <PageHeader
        title="My certificates"
        subtitle="Earned by completing every chapter of a course. Each carries a unique verification code."
      />
      {mine.length === 0 ? (
        <EmptyState
          icon="award"
          title="No certificates yet"
          description="Finish every chapter of a course and your certificate will appear here — elegant, shareable and verifiable."
          action={<Button iconRight="arrow-right" onClick={() => navigate({ page: 's-courses' })}>Continue learning</Button>}
        />
      ) : (
        <div className="space-y-10">
          {mine.map((cert) => (
            <CertificateView key={cert.id} cert={cert} course={data.courses.find((c) => c.id === cert.courseId)} studentName={currentUser.name} teacherName={data.users.find((u) => u.id === data.courses.find((c) => c.id === cert.courseId)?.teacherId)?.name ?? 'EduFlow Teacher'} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CertificateView({ cert, course, studentName, teacherName }: { cert: Certificate; course?: Course; studentName: string; teacherName: string }) {
  const { toast } = useApp();
  return (
    <div>
      <div className="relative mx-auto aspect-[1.414/1] w-full max-w-3xl overflow-hidden rounded-xl bg-[#FDFBF5] text-slate-900 shadow-lift ring-1 ring-amber-900/10 print:shadow-none">
        {/* decorative double border */}
        <div className="pointer-events-none absolute inset-2.5 rounded-lg border-2 border-[#C9A86A]" />
        <div className="pointer-events-none absolute inset-4 rounded-md border border-[#C9A86A]/50" />
        {/* corner flourishes */}
        {['left-2.5 top-2.5 border-l-[3px] border-t-[3px] rounded-tl-lg', 'right-2.5 top-2.5 border-r-[3px] border-t-[3px] rounded-tr-lg', 'bottom-2.5 left-2.5 border-b-[3px] border-l-[3px] rounded-bl-lg', 'bottom-2.5 right-2.5 border-b-[3px] border-r-[3px] rounded-br-lg'].map((pos) => (
          <span key={pos} className={cn('pointer-events-none absolute h-7 w-7 border-[#B08D4C]', pos)} />
        ))}

        <div className="relative flex h-full flex-col items-center justify-between px-[7%] py-[5.5%] text-center">
          <div>
            <div className="flex items-center justify-center gap-2">
              <span className="flex h-[7%] w-auto items-center justify-center text-[#B08D4C]">
                <Icon name="logo" className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2} />
              </span>
              <span className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
                Edu<span className="text-[#B08D4C]">Flow</span>
              </span>
            </div>
            <p className="mt-[3%] text-[0.55rem] font-bold uppercase tracking-[0.35em] text-[#B08D4C] sm:text-xs">Certificate of Completion</p>
            <div className="mx-auto mt-2 flex w-24 items-center gap-1.5 sm:w-32">
              <span className="h-px flex-1 bg-[#C9A86A]/60" />
              <span className="h-1.5 w-1.5 rotate-45 bg-[#C9A86A]" />
              <span className="h-px flex-1 bg-[#C9A86A]/60" />
            </div>
          </div>

          <div>
            <p className="text-[0.6rem] italic text-slate-500 sm:text-xs">This certifies that</p>
            <p className="mt-[1.5%] font-serif text-2xl font-bold leading-tight text-slate-900 sm:text-4xl lg:text-[2.6rem]">{studentName}</p>
            <p className="mx-auto mt-[1.5%] max-w-md text-[0.6rem] leading-relaxed text-slate-500 sm:text-xs">
              has successfully completed all {course?.chapters.length ?? ''} chapters of
            </p>
            <p className="mt-[1%] px-4 text-sm font-extrabold text-indigo-700 sm:text-lg">“{course?.title ?? 'an EduFlow course'}”</p>
          </div>

          <div className="flex w-full items-end justify-between text-left">
            <div>
              <p className="text-[0.5rem] font-bold uppercase tracking-widest text-slate-400 sm:text-[0.6rem]">Awarded on</p>
              <p className="mt-0.5 text-[0.6rem] font-bold text-slate-900 sm:text-xs">{fmtDate(cert.issuedAt)}</p>
            </div>
            <div className="text-center">
              <p className="font-serif text-sm italic text-slate-800 sm:text-lg">{teacherName}</p>
              <div className="mx-auto mt-0.5 h-px w-24 bg-slate-300 sm:w-32" />
              <p className="mt-0.5 text-[0.5rem] font-bold uppercase tracking-widest text-slate-400 sm:text-[0.6rem]">Instructor</p>
            </div>
            <div className="text-right">
              <p className="text-[0.5rem] font-bold uppercase tracking-widest text-slate-400 sm:text-[0.6rem]">Verify at</p>
              <p className="mt-0.5 text-[0.6rem] font-bold text-slate-900 sm:text-xs">eduflow.io/v/{cert.code}</p>
            </div>
          </div>

          {/* gold seal */}
          <div className="absolute bottom-[16%] right-[7%] hidden sm:block">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#E3C988] via-[#C9A86A] to-[#A9863F] shadow-lg ring-2 ring-[#E3C988]/60 lg:h-20 lg:w-20">
              <div className="absolute inset-1.5 rounded-full border border-dashed border-white/50" />
              <Icon name="award" className="h-7 w-7 text-white drop-shadow sm:h-8 sm:w-8" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-4 flex max-w-3xl flex-wrap items-center justify-between gap-3" data-no-print>
        <p className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Icon name="shield" className="h-4 w-4 text-emerald-500" /> Verification code <span className="font-mono text-slate-600">{cert.code}</span>
        </p>
        <div className="flex gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon="check"
            onClick={() => {
              navigator.clipboard?.writeText(`https://eduflow.io/verify/${cert.code}`).catch(() => undefined);
              toast('Verification link copied to clipboard');
            }}
          >
            Copy verify link
          </Button>
          <Button variant="secondary" size="sm" icon="printer" onClick={() => window.print()}>
            Print / save PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
