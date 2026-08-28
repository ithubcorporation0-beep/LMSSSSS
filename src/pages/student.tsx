import { useEffect, useMemo, useState } from 'react';
import type { Certificate, Chapter, Course, DiscussionQuestion } from '../types';
import { useApp } from '../store';
import { cn, firstName, fmtDate, makeCode, nextChapter, progressOf, timeAgo } from '../lib';
import { Avatar, Badge, Button, EmptyState, Icon, LevelBadge, MarkdownViewer, Modal, NotesPad, PageHeader, ProgressBar, QuizWidget, StatCard, StarRating, VideoPlayer } from '../components/ui';
import { CourseCard } from './public';

// ─────────────────────────────────────────────────────────────
// Auth Required Gate Helper
// ─────────────────────────────────────────────────────────────
export function AuthRequiredGate({
  title = 'Sign In to Access Learning Hub',
  description = 'Course lessons, video playback, knowledge quizzes, and personal notes require you to sign in with an active account.',
  intendedCourseId,
}: {
  title?: string;
  description?: string;
  intendedCourseId?: string;
}) {
  const { openAuthModal, navigate, login } = useApp();

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-100">
        <Icon name="lock" className="h-8 w-8" />
      </div>
      <h2 className="mt-5 text-2xl font-extrabold text-slate-900 sm:text-3xl">{title}</h2>
      <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-md mx-auto">{description}</p>

      {/* Demo Credentials Card */}
      <div className="mt-8 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 p-5 text-white shadow-lift text-left">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/20 text-white">
            <Icon name="sparkles" className="h-3.5 w-3.5" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">Demo Student Credentials</span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-indigo-100">
          Use the pre-configured demo student account or click the button below to sign in instantly.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-black/20 p-2.5 font-mono text-xs">
          <div>
            <span className="text-[10px] text-indigo-200 uppercase font-sans font-bold block">Email</span>
            <strong className="text-white">student@eduflow.io</strong>
          </div>
          <div>
            <span className="text-[10px] text-indigo-200 uppercase font-sans font-bold block">Password</span>
            <strong className="text-white">demo123</strong>
          </div>
        </div>
        <Button
          size="sm"
          className="mt-3 w-full bg-white text-indigo-700 font-bold hover:bg-indigo-50 shadow"
          icon="zap"
          onClick={() => login('student@eduflow.io', 'demo123')}
        >
          ⚡ Instant Sign In with Demo Account
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button size="lg" icon="log-in" onClick={() => openAuthModal(intendedCourseId)}>
          Sign In / Register
        </Button>
        <Button size="lg" variant="secondary" onClick={() => navigate({ page: 'catalog' })}>
          Browse Course Catalog
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STUDENT DASHBOARD
// ─────────────────────────────────────────────────────────────
export function StudentDashboard() {
  const { data, currentUser, navigate } = useApp();

  if (!currentUser) {
    return <AuthRequiredGate title="Sign In to View Your Dashboard" description="Access your enrolled courses, chapter progress, and certificates by signing in." />;
  }

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
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{today}</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Welcome back, {firstName(currentUser.name)}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">Pick up where you left off and keep building your skills.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon="bookmark" onClick={() => navigate({ page: 's-wishlist' })}>
            Saved Wishlist
          </Button>
          <Button icon="search" onClick={() => navigate({ page: 'catalog' })}>
            Find New Course
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard icon="book-open" label="Courses Enrolled" value={myEnrolments.length} tint="indigo" sub="Active learning roadmaps." />
        <StatCard icon="check-circle" label="Courses Completed" value={completedCourses} tint="emerald" sub="Unlocked verifiable certificates." />
        <StatCard icon="layers" label="Chapters Finished" value={chaptersDone} tint="violet" sub="Video lessons &amp; quizzes mastered." />
      </div>

      {/* Continue Learning Active Hero Card */}
      {recentCourse && recentProgress && (
        <div className="mt-8 overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-slate-900/5">
          <div className="grid sm:grid-cols-[280px_1fr]">
            <div className="relative h-44 sm:h-full">
              <img src={recentCourse.coverImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
              {recentProgress.pct >= 100 && (
                <span className="absolute left-3 top-3">
                  <Badge tone="emerald" icon="check-circle" className="bg-white/95 shadow">Completed</Badge>
                </span>
              )}
            </div>
            <div className="p-6 sm:p-8">
              <Badge tone="indigo" icon="zap" className="mb-3">Active Lesson</Badge>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">{recentCourse.title}</h2>
              <p className="mt-1.5 flex items-center gap-2 text-xs text-slate-500">
                <Avatar name={recentTeacher?.name ?? ''} size="xs" />
                {recentTeacher?.name} &middot; {recentCourse.chapters.length} chapters
              </p>
              <div className="mt-5 flex items-center gap-4">
                <ProgressBar value={recentProgress.pct} className="flex-1" />
                <span className={cn('text-sm font-extrabold', recentProgress.pct >= 100 ? 'text-emerald-600' : 'text-indigo-600')}>
                  {recentProgress.pct}%
                </span>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  icon={recentProgress.pct >= 100 ? 'eye' : 'play'}
                  onClick={() => navigate({ page: 's-learn', courseId: recentCourse.id, chapterId: nextChapter(recentCourse, recent) })}
                >
                  {recentProgress.pct >= 100 ? 'Review Course' : 'Continue Chapter'}
                </Button>
                <Button variant="ghost" onClick={() => navigate({ page: 's-courses' })}>
                  All Enrolled Courses
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Courses */}
      {recommended.length > 0 && (
        <section className="mt-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Recommended For You</h2>
              <p className="mt-1 text-sm text-slate-500">Fresh masterclasses ready to explore.</p>
            </div>
            <Button variant="ghost" iconRight="arrow-right" onClick={() => navigate({ page: 'catalog' })}>Browse Catalog</Button>
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

  if (!currentUser) {
    return <AuthRequiredGate title="Sign In to Access Your Courses" description="View your active course progress and completed curriculums." />;
  }

  const rows = data.enrolments
    .filter((e) => e.studentId === currentUser.id)
    .map((e) => ({ enrolment: e, course: data.courses.find((c) => c.id === e.courseId) }))
    .filter((r): r is { enrolment: (typeof data.enrolments)[number]; course: Course } => Boolean(r.course))
    .sort((a, b) => b.enrolment.lastAccessedAt.localeCompare(a.enrolment.lastAccessedAt));

  const inProgress = rows.filter((r) => progressOf(r.course, r.enrolment).pct < 100);
  const completed = rows.filter((r) => progressOf(r.course, r.enrolment).pct >= 100);

  const displayed = filter === 'in_progress' ? inProgress : filter === 'completed' ? completed : rows;

  if (rows.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          icon="book-open"
          title="No enrolled courses yet"
          description="Enrol in any course from the catalog to start learning with chapter tracking and certificate rewards."
          action={<Button iconRight="arrow-right" onClick={() => navigate({ page: 'catalog' })}>Browse Course Catalog</Button>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader title="My Learning" subtitle={`${rows.length} course${rows.length === 1 ? '' : 's'} in your personal study track.`} />

      {/* Filter Tabs */}
      <div className="mb-8 flex flex-wrap gap-2 border-b border-slate-200/80 pb-4">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'rounded-xl px-4 py-2 text-xs font-bold transition',
            filter === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100',
          )}
        >
          All Courses ({rows.length})
        </button>
        <button
          onClick={() => setFilter('in_progress')}
          className={cn(
            'rounded-xl px-4 py-2 text-xs font-bold transition',
            filter === 'in_progress' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100',
          )}
        >
          In Progress ({inProgress.length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={cn(
            'rounded-xl px-4 py-2 text-xs font-bold transition',
            filter === 'completed' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100',
          )}
        >
          Completed ({completed.length})
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {displayed.map(({ enrolment, course }) => {
          const { done, total, pct } = progressOf(course, enrolment);
          const teacher = data.users.find((u) => u.id === course.teacherId);
          const finished = pct >= 100;
          return (
            <div key={enrolment.id} className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-900/5 transition hover:-translate-y-1 hover:shadow-lift">
              <button onClick={() => navigate({ page: 's-learn', courseId: course.id })} className="relative block aspect-video overflow-hidden bg-slate-900">
                <img src={course.coverImage} alt="" className="h-full w-full object-cover" />
                <span className="absolute left-3 top-3"><LevelBadge level={course.level} /></span>
                {finished && <span className="absolute right-3 top-3"><Badge tone="emerald" icon="check-circle" className="bg-white/95 shadow">Completed</Badge></span>}
              </button>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-base font-bold text-slate-900 leading-snug">{course.title}</h3>
                <p className="mt-1.5 flex items-center gap-2 text-xs text-slate-500">
                  <Avatar name={teacher?.name ?? ''} size="xs" /> {teacher?.name ?? 'Instructor'}
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <ProgressBar value={pct} className="flex-1" />
                  <span className={cn('text-xs font-bold', finished ? 'text-emerald-600' : 'text-indigo-600')}>
                    {done}/{total} &middot; {pct}%
                  </span>
                </div>
                <div className="mt-5 flex gap-2">
                  <Button
                    className={cn('flex-1', finished && 'bg-emerald-600 hover:bg-emerald-700')}
                    icon={finished ? 'eye' : 'play'}
                    onClick={() => navigate({ page: 's-learn', courseId: course.id, chapterId: finished ? undefined : nextChapter(course, enrolment) })}
                  >
                    {finished ? 'Review' : 'Continue'}
                  </Button>
                  {finished && (
                    <Button
                      variant="secondary"
                      icon="award"
                      onClick={() => {
                        issueCertificate(course.id);
                        toast('Certificate ready!');
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
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// WISHLIST PAGE
// ─────────────────────────────────────────────────────────────
export function StudentWishlistPage() {
  const { data, currentUser, navigate } = useApp();

  if (!currentUser) {
    return <AuthRequiredGate title="Sign In to View Saved Wishlist" description="Keep track of courses you plan to study in your personal queue." />;
  }

  const wishItems = data.wishlist.filter((w) => w.userId === currentUser.id);
  const courses = wishItems
    .map((w) => data.courses.find((c) => c.id === w.courseId))
    .filter((c): c is Course => Boolean(c));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader title="Saved Wishlist" subtitle="Courses you've bookmarked to learn later." />
      {courses.length === 0 ? (
        <EmptyState
          icon="bookmark"
          title="Your wishlist is empty"
          description="Bookmark interesting courses while browsing the catalog to build your study queue."
          action={<Button onClick={() => navigate({ page: 'catalog' })}>Explore Courses</Button>}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LEARNING PAGE — Complete Interactive Learning Hub
// ─────────────────────────────────────────────────────────────
export function LearningPage({ courseId, chapterId }: { courseId: string; chapterId?: string }) {
  const app = useApp();
  const {
    data,
    navigate,
    currentUser,
    completeChapter,
    touchCourse,
    certificateFor,
    issueCertificate,
    saveQuizScore,
    saveStudentNote,
    noteFor,
    discussionsFor,
    addDiscussionQuestion,
    addDiscussionReply,
    toast,
    enrol,
  } = app;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [congratsOpen, setCongratsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'quiz' | 'resources' | 'discussion' | 'mynotes'>('notes');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  const course = data.courses.find((c) => c.id === courseId);

  // AUTH PROTECTION GATE: If not signed in, show Auth Gate
  if (!currentUser) {
    return (
      <AuthRequiredGate
        title="Sign In to Start Learning"
        description="Accessing full chapter videos, lecture notes, interactive quizzes, and discussions requires an account."
        intendedCourseId={courseId}
      />
    );
  }

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
        <EmptyState icon="alert" title="Course not found" description="It may have been removed." action={<Button onClick={() => navigate({ page: 's-courses' })}>Back to Courses</Button>} />
      </div>
    );
  }

  if (!enrolment) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <EmptyState
          icon="book-open"
          title="Ready to begin?"
          description="Click below to enrol in this course for free and unlock full video playback, quizzes, and personal notes."
          action={
            <Button
              iconRight="arrow-right"
              onClick={() => {
                enrol(course.id);
                toast(`Enrolled in “${course.title}”!`);
              }}
            >
              Enrol for Free
            </Button>
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

  const userNote = chapter ? noteFor(course.id, chapter.id) : undefined;
  const discussions = chapter ? discussionsFor(course.id, chapter.id) : [];

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
        issueCertificate(course.id);
        setCongratsOpen(true);
      } else {
        toast('Course 100% completed!');
      }
      return;
    }
    toast(`“${chapter.title}” completed!`);
    if (next) goTo(next.id);
  };

  const handlePostQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapter || !newQuestionText.trim()) return;
    addDiscussionQuestion(course.id, chapter.id, newQuestionText.trim());
    setNewQuestionText('');
    toast('Question posted to chapter forum');
  };

  const handlePostReply = (qId: string) => {
    const text = replyTextMap[qId];
    if (!text || !text.trim()) return;
    addDiscussionReply(qId, text.trim());
    setReplyTextMap((prev) => ({ ...prev, [qId]: '' }));
    toast('Reply posted');
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-100 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Course Progress</p>
        <p className="mt-2 text-sm font-bold text-slate-900">
          {done} of {total} completed <span className={cn('ml-1', pct >= 100 ? 'text-emerald-600' : 'text-indigo-600')}>({pct}%)</span>
        </p>
        <ProgressBar value={pct} className="mt-3" />
      </div>
      <ol className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {chapters.map((c, i) => {
          const active = c.id === chapter?.id;
          const complete = doneSet.has(c.id);
          return (
            <li key={c.id}>
              <button
                onClick={() => goTo(c.id)}
                className={cn(
                  'group flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition',
                  active ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'hover:bg-slate-50',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                    complete ? 'bg-emerald-500 text-white' : active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500',
                  )}
                >
                  {complete ? <Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.6} /> : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn('truncate text-xs font-bold', active ? 'text-indigo-900' : complete ? 'text-slate-500' : 'text-slate-800')}>
                    {c.title}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                    <span>{c.durationMin} min</span>
                    {c.quiz && <span className="text-violet-500">&middot; Quiz</span>}
                    {c.freePreview && <span className="text-sky-500">&middot; Preview</span>}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="border-t border-slate-100 p-4">
        <Button variant="secondary" size="sm" className="w-full" icon="arrow-left" onClick={() => navigate({ page: 's-courses' })}>
          Back to My Courses
        </Button>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
      {/* Top Breadcrumb */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <button onClick={() => navigate({ page: 'course', id: course.id })} className="inline-flex min-w-0 items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-indigo-600">
          <Icon name="chevron-left" className="h-4 w-4 shrink-0" />
          <span className="truncate">{course.title}</span>
        </button>
        <div className="flex items-center gap-2">
          <Badge tone={pct >= 100 ? 'emerald' : 'indigo'} icon={pct >= 100 ? 'check-circle' : 'layers'}>
            {done}/{total} Chapters ({pct}%)
          </Badge>
          <Button variant="secondary" size="sm" icon="menu" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            Chapters
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Desktop Sticky Sidebar */}
        <aside className="hidden overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-900/5 lg:block lg:self-start lg:sticky lg:top-24 max-h-[calc(100vh-120px)]">
          {sidebarContent}
        </aside>

        {/* Mobile Slide-Out Chapters */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-[70] lg:hidden" role="dialog">
            <button aria-label="Close" onClick={() => setSidebarOpen(false)} className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" />
            <div className="absolute inset-y-0 left-0 w-[86vw] max-w-xs bg-white shadow-2xl animate-slide-in-left">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <p className="text-sm font-extrabold text-slate-900">Curriculum</p>
                <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                  <Icon name="x" className="h-5 w-5" />
                </button>
              </div>
              <div className="h-[calc(100%-57px)]">{sidebarContent}</div>
            </div>
          </div>
        )}

        {/* Main Learning Hub */}
        <div className="min-w-0">
          {chapter ? (
            <>
              {/* Real Video Player Component */}
              <VideoPlayer
                videoUrl={chapter.videoUrl}
                title={chapter.title}
                durationMin={chapter.durationMin}
                isComplete={isDone}
                onComplete={handleComplete}
              />

              {/* Chapter Header */}
              <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Chapter {activeIdx + 1} of {total} &middot; {chapter.durationMin} min
                  </p>
                  <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                    {chapter.title}
                  </h1>
                </div>
                {isDone ? (
                  <Badge tone="emerald" icon="check-circle">Completed</Badge>
                ) : (
                  <Button icon="check" onClick={handleComplete}>
                    Mark as Complete
                  </Button>
                )}
              </div>

              {/* Interactive Tabs */}
              <div className="mt-8 border-b border-slate-200">
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'notes', label: 'Lecture Notes', icon: 'file-text' as const },
                    { key: 'quiz', label: `Quiz ${chapter.quiz ? `(${chapter.quiz.questions.length})` : ''}`, icon: 'check-square' as const },
                    { key: 'resources', label: `Resources ${chapter.resources?.length ? `(${chapter.resources.length})` : ''}`, icon: 'download' as const },
                    { key: 'mynotes', label: 'My Notes', icon: 'pencil' as const },
                    { key: 'discussion', label: `Q&A (${discussions.length})`, icon: 'message-square' as const },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={cn(
                        'flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-all',
                        activeTab === tab.key
                          ? 'border-indigo-600 text-indigo-700'
                          : 'border-transparent text-slate-500 hover:text-slate-900',
                      )}
                    >
                      <Icon name={tab.icon} className="h-4 w-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content Panel */}
              <div className="mt-6">
                {activeTab === 'notes' && (
                  <div className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-900/5">
                    <h3 className="text-base font-bold text-slate-900">Lecture Overview &amp; Material</h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">{chapter.description}</p>
                    <div className="mt-6 border-t border-slate-100 pt-6">
                      <MarkdownViewer
                        content={
                          chapter.content ||
                          `## Core Concepts & Key Takeaways\n\n- Master the fundamentals covered in **${chapter.title}**.\n- Apply the practical patterns to your own codebase.\n- Complete the chapter knowledge check quiz once finished with the lesson video.`
                        }
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'quiz' && (
                  <div>
                    {chapter.quiz ? (
                      <QuizWidget
                        quiz={chapter.quiz}
                        previousScore={enrolment.quizScores?.[chapter.id]}
                        onPass={(score, totalQ) => {
                          saveQuizScore(course.id, chapter.id, score, totalQ);
                          toast(`Quiz passed with ${score}/${totalQ} correct! Great job!`);
                          if (!isDone) handleComplete();
                        }}
                      />
                    ) : (
                      <EmptyState
                        icon="check-square"
                        title="No quiz for this chapter"
                        description="This chapter is a foundational lecture without a graded test. You can mark it complete directly."
                      />
                    )}
                  </div>
                )}

                {activeTab === 'resources' && (
                  <div className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-900/5">
                    <h3 className="text-base font-bold text-slate-900">Downloadable Lesson Materials</h3>
                    {chapter.resources && chapter.resources.length > 0 ? (
                      <ul className="mt-4 divide-y divide-slate-100">
                        {chapter.resources.map((res) => (
                          <li key={res.id} className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                <Icon name={res.type === 'pdf' ? 'file-text' : res.type === 'code' ? 'code' : 'external-link'} className="h-4.5 w-4.5" />
                              </span>
                              <div>
                                <p className="text-xs font-bold text-slate-900">{res.name}</p>
                                {res.fileSize && <p className="text-[10px] text-slate-400">{res.fileSize}</p>}
                              </div>
                            </div>
                            <a
                              href={res.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                            >
                              <Icon name="download" className="h-3.5 w-3.5" /> Open / Download
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-4 text-xs text-slate-400">All reference material is included directly in the lecture notes tab.</p>
                    )}
                  </div>
                )}

                {activeTab === 'mynotes' && (
                  <NotesPad
                    chapterTitle={chapter.title}
                    initialContent={userNote?.content ?? ''}
                    onSave={(text) => {
                      saveStudentNote(course.id, chapter.id, text);
                      toast('Personal notes saved!');
                    }}
                  />
                )}

                {activeTab === 'discussion' && (
                  <div className="space-y-6">
                    {/* Ask question form */}
                    <form onSubmit={handlePostQuestion} className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-900/5">
                      <h3 className="text-sm font-bold text-slate-900">Ask a question about this chapter</h3>
                      <div className="mt-3">
                        <textarea
                          value={newQuestionText}
                          onChange={(e) => setNewQuestionText(e.target.value)}
                          placeholder="Stuck on a concept or code snippet? Ask your fellow learners and instructor..."
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs sm:text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          rows={3}
                          required
                        />
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Button size="sm" icon="message-square" type="submit">Post Question</Button>
                      </div>
                    </form>

                    {/* Discussions List */}
                    <div className="space-y-4">
                      {discussions.length === 0 ? (
                        <EmptyState
                          icon="message-square"
                          title="No questions yet"
                          description="Be the first to ask a question or start a discussion on this lesson."
                        />
                      ) : (
                        discussions.map((disc) => (
                          <div key={disc.id} className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-900/5 space-y-4">
                            <div className="flex items-center gap-3">
                              <Avatar name={disc.userName} size="xs" />
                              <div>
                                <p className="text-xs font-bold text-slate-900">{disc.userName}</p>
                                <p className="text-[10px] text-slate-400">{timeAgo(disc.createdAt)}</p>
                              </div>
                              <Badge tone={disc.userRole === 'teacher' ? 'indigo' : 'slate'} className="ml-auto text-[9px]">
                                {disc.userRole}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed font-medium">{disc.text}</p>

                            {/* Replies */}
                            {disc.replies.length > 0 && (
                              <div className="border-l-2 border-indigo-200 pl-4 space-y-3">
                                {disc.replies.map((rep) => (
                                  <div key={rep.id} className="rounded-xl bg-slate-50 p-3 text-xs">
                                    <div className="flex items-center gap-2">
                                      <Avatar name={rep.userName} size="xs" />
                                      <span className="font-bold text-slate-800">{rep.userName}</span>
                                      <Badge tone={rep.userRole === 'teacher' ? 'indigo' : 'slate'} className="text-[9px]">
                                        {rep.userRole}
                                      </Badge>
                                      <span className="text-[10px] text-slate-400 ml-auto">{timeAgo(rep.createdAt)}</span>
                                    </div>
                                    <p className="mt-1.5 text-slate-600 leading-relaxed">{rep.text}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Reply Input */}
                            <div className="flex gap-2 pt-2">
                              <input
                                type="text"
                                value={replyTextMap[disc.id] ?? ''}
                                onChange={(e) => setReplyTextMap((prev) => ({ ...prev, [disc.id]: e.target.value }))}
                                placeholder="Reply to this question..."
                                className="flex-1 rounded-xl bg-slate-50 px-3 py-1.5 text-xs ring-1 ring-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                              <Button size="sm" variant="secondary" onClick={() => handlePostReply(disc.id)}>
                                Reply
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Nav Actions */}
              <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-6">
                <Button variant="secondary" icon="arrow-left" disabled={!prev} onClick={() => prev && goTo(prev.id)}>
                  Previous Chapter
                </Button>
                {next && (
                  <Button iconRight="arrow-right" onClick={() => goTo(next.id)}>
                    Next Chapter
                  </Button>
                )}
              </div>
            </>
          ) : (
            <EmptyState icon="layers" title="No chapter selected" description="Choose a chapter from the sidebar." />
          )}
        </div>
      </div>

      {/* Completion Celebration Modal */}
      <Modal open={congratsOpen} onClose={() => setCongratsOpen(false)}>
        <div className="p-8 text-center sm:p-10">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-xl shadow-amber-500/30">
            <Icon name="award" className="h-10 w-10" />
          </span>
          <h2 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Congratulations, {firstName(currentUser.name)}!
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
            You successfully completed all chapters of <span className="font-bold text-slate-800">“{course.title}”</span>. Your verifiable certificate is ready.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              icon="certificate"
              onClick={() => {
                setCongratsOpen(false);
                navigate({ page: 's-certs' });
              }}
            >
              View My Certificate
            </Button>
            <Button size="lg" variant="ghost" onClick={() => setCongratsOpen(false)}>
              Continue Reviewing
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CERTIFICATES PAGE
// ─────────────────────────────────────────────────────────────
export function CertificatesPage() {
  const { data, currentUser, navigate } = useApp();

  if (!currentUser) {
    return <AuthRequiredGate title="Sign In to View Certificates" description="View your earned course completion certificates." />;
  }

  const mine = data.certificates
    .filter((c) => c.studentId === currentUser.id)
    .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <PageHeader
        title="My Earned Certificates"
        subtitle="Cryptographically verified certificates of completion awarded for completing 100% of a course."
      />
      {mine.length === 0 ? (
        <EmptyState
          icon="award"
          title="No certificates earned yet"
          description="Finish every chapter and quiz in any enrolled course to unlock your shareable, verifiable certificate."
          action={<Button iconRight="arrow-right" onClick={() => navigate({ page: 's-courses' })}>Continue Learning</Button>}
        />
      ) : (
        <div className="space-y-12">
          {mine.map((cert) => (
            <CertificateView
              key={cert.id}
              cert={cert}
              course={data.courses.find((c) => c.id === cert.courseId)}
              studentName={currentUser.name}
              teacherName={data.users.find((u) => u.id === data.courses.find((c) => c.id === cert.courseId)?.teacherId)?.name ?? 'EduFlow Instructor'}
            />
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
        {/* Decorative Gold Borders */}
        <div className="pointer-events-none absolute inset-3 rounded-lg border-2 border-[#C9A86A]" />
        <div className="pointer-events-none absolute inset-5 rounded-md border border-[#C9A86A]/50" />

        <div className="relative flex h-full flex-col items-center justify-between px-[7%] py-[5.5%] text-center">
          <div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-[#B08D4C]">
                <Icon name="logo" className="h-7 w-7" strokeWidth={2} />
              </span>
              <span className="text-lg font-black tracking-tight text-slate-900">
                Edu<span className="text-[#B08D4C]">Flow</span>
              </span>
            </div>
            <p className="mt-[2%] text-[0.65rem] font-bold uppercase tracking-[0.35em] text-[#B08D4C]">Certificate of Mastery &amp; Completion</p>
          </div>

          <div>
            <p className="text-[0.65rem] italic text-slate-500">This official certificate is proudly presented to</p>
            <p className="mt-1 font-serif text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:text-[2.6rem]">{studentName}</p>
            <p className="mx-auto mt-2 max-w-md text-[0.65rem] leading-relaxed text-slate-500">
              for successfully completing all curriculum requirements, lessons, and quizzes of
            </p>
            <p className="mt-1 px-4 text-base font-extrabold text-indigo-800 sm:text-xl">“{course?.title ?? 'EduFlow Masterclass'}”</p>
          </div>

          <div className="flex w-full items-end justify-between text-left">
            <div>
              <p className="text-[0.55rem] font-bold uppercase tracking-widest text-slate-400">Issued On</p>
              <p className="mt-0.5 text-xs font-bold text-slate-900">{fmtDate(cert.issuedAt)}</p>
            </div>
            <div className="text-center">
              <p className="font-serif text-base italic text-slate-800">{teacherName}</p>
              <div className="mx-auto mt-0.5 h-px w-28 bg-slate-300" />
              <p className="mt-0.5 text-[0.55rem] font-bold uppercase tracking-widest text-slate-400">Authorized Instructor</p>
            </div>
            <div className="text-right">
              <p className="text-[0.55rem] font-bold uppercase tracking-widest text-slate-400">Verification Code</p>
              <p className="mt-0.5 font-mono text-xs font-bold text-indigo-700">{cert.code}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-4 flex max-w-3xl flex-wrap items-center justify-between gap-3" data-no-print>
        <p className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Icon name="shield" className="h-4 w-4 text-emerald-500" /> Verification Key: <span className="font-mono font-bold text-slate-800">{cert.code}</span>
        </p>
        <div className="flex gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon="copy"
            onClick={() => {
              navigator.clipboard?.writeText(cert.code).catch(() => undefined);
              toast(`Verification code ${cert.code} copied!`);
            }}
          >
            Copy Code
          </Button>
          <Button variant="secondary" size="sm" icon="printer" onClick={() => window.print()}>
            Print / Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CERTIFICATE VERIFICATION PORTAL
// ─────────────────────────────────────────────────────────────
export function CertificateVerifyPage({ initialCode }: { initialCode?: string }) {
  const { data } = useApp();
  const [code, setCode] = useState(initialCode ?? '');
  const [searched, setSearched] = useState(Boolean(initialCode));

  const cert = useMemo(() => {
    if (!code.trim()) return null;
    return data.certificates.find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
  }, [data.certificates, code]);

  const course = cert ? data.courses.find((c) => c.id === cert.courseId) : null;
  const student = cert ? data.users.find((u) => u.id === cert.studentId) : null;
  const teacher = course ? data.users.find((u) => u.id === course.teacherId) : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Icon name="shield" className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-3xl font-extrabold text-slate-900">Certificate Verification Portal</h1>
        <p className="mt-2 text-sm text-slate-500">Enter a unique verification code to validate authentic course completion.</p>
      </div>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-900/5">
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value); setSearched(false); }}
            placeholder="e.g. EDU-1234-5678"
            className="flex-1 rounded-xl bg-slate-50 px-4 py-3 font-mono text-sm uppercase ring-1 ring-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Button icon="search" onClick={() => setSearched(true)}>
            Verify
          </Button>
        </div>

        {searched && (
          <div className="mt-6 border-t border-slate-100 pt-6">
            {cert && course && student ? (
              <div className="rounded-xl bg-emerald-50 p-5 ring-1 ring-emerald-200 text-left">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                  <Icon name="check-circle" className="h-5 w-5 text-emerald-600" />
                  Authentic Verified Certificate
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs">
                  <div>
                    <span className="font-semibold text-slate-500">Recipient:</span>
                    <p className="font-bold text-slate-900 text-sm">{student.name}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">Course:</span>
                    <p className="font-bold text-slate-900 text-sm">{course.title}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">Instructor:</span>
                    <p className="font-bold text-slate-900">{teacher?.name ?? 'Instructor'}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">Date Awarded:</span>
                    <p className="font-bold text-slate-900">{fmtDate(cert.issuedAt)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-rose-50 p-5 ring-1 ring-rose-200 text-rose-800 text-sm font-medium">
                No certificate found matching code &ldquo;{code}&rdquo;. Please verify the characters and try again.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
