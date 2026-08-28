import { useMemo, useState } from 'react';
import type { Chapter, Course, Level } from '../types';
import { useApp } from '../store';
import { cn, courseMinutes, fmtDate, fmtDuration, progressOf } from '../lib';
import { Avatar, Badge, Button, EmptyState, Field, Icon, LevelBadge, Modal, ProgressBar, Select, StarRating, TextArea, VideoPlayer } from '../components/ui';

// ─────────────────────────────────────────────────────────────
// Shared Course Card
// ─────────────────────────────────────────────────────────────
export function CourseCard({ course }: { course: Course }) {
  const { data, navigate, enrolledCount, isWishlisted, toggleWishlist, toast } = useApp();
  const teacher = data.users.find((u) => u.id === course.teacherId);
  const category = data.categories.find((c) => c.id === course.categoryId);
  const students = enrolledCount(course.id);
  const [imgError, setImgError] = useState(false);
  const saved = isWishlisted(course.id);

  const reviews = data.reviews.filter((r) => r.courseId === course.id);
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '5.0';

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(course.id);
    toast(saved ? `Removed from wishlist` : `Saved to wishlist`, 'info');
  };

  return (
    <div
      onClick={() => navigate({ page: 'course', id: course.id })}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-white text-left shadow-soft ring-1 ring-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
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
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
        
        {category && (
          <span className="absolute left-3 top-3">
            <Badge tone="indigo" className="bg-white/95 shadow-sm">{category.name}</Badge>
          </span>
        )}

        <button
          onClick={handleWishlist}
          aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
          className={cn(
            'absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-110',
            saved ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800',
          )}
        >
          <Icon name={saved ? 'bookmark-filled' : 'bookmark'} className="h-4 w-4" />
        </button>

        <span className="absolute bottom-3 left-3">
          <LevelBadge level={course.level} />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
          <Icon name="star" className="h-3.5 w-3.5 fill-current" />
          <span>{avgRating}</span>
          <span className="font-normal text-slate-400">({reviews.length})</span>
        </div>

        <h3 className="mt-1.5 text-base font-bold leading-snug text-slate-900 transition-colors group-hover:text-indigo-600">
          {course.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">{course.description}</p>

        <div className="mt-4 flex items-center gap-2.5">
          <Avatar name={teacher?.name ?? 'Instructor'} size="xs" />
          <span className="truncate text-xs font-semibold text-slate-600">{teacher?.name ?? 'Instructor'}</span>
        </div>

        <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-400">
          <span className="inline-flex items-center gap-1"><Icon name="layers" className="h-3 w-3" /> {course.chapters.length} chapters</span>
          <span className="inline-flex items-center gap-1"><Icon name="clock" className="h-3 w-3" /> {fmtDuration(courseMinutes(course))}</span>
          <span className="ml-auto inline-flex items-center gap-1 font-bold text-slate-600"><Icon name="users" className="h-3 w-3" /> {students} enrolled</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HOME PAGE
// ─────────────────────────────────────────────────────────────
export function HomePage() {
  const { data, navigate, switchRole } = useApp();
  const [search, setSearch] = useState('');

  const published = useMemo(() => data.courses.filter((c) => c.status === 'published'), [data.courses]);
  const featured = published.filter((c) => c.featured);
  const totalChapters = published.reduce((s, c) => s + c.chapters.length, 0);
  const totalLearners = data.users.filter((u) => u.role === 'student').length;

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ page: 'catalog', search: search.trim() });
  };

  return (
    <div className="overflow-x-clip">
      {/* ── Hero Section ── */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />
          <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(99,102,241,0.1)_1px,transparent_0)] [background-size:28px_28px]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:pb-24 lg:pt-20">
          <div className="mx-auto max-w-3xl text-center animate-fade-up">
            <Badge tone="indigo" icon="sparkles" className="mb-4 shadow-sm">
              Interactive &amp; Verifiable Learning Platform
            </Badge>
            <h1 className="text-4xl font-extrabold leading-[1.12] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Learn in-demand skills,{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                chapter by chapter.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              Interactive video lessons, code-rich reading materials, chapter quizzes, live personal notes, and cryptographically verified completion certificates.
            </p>

            {/* Quick Hero Search */}
            <form onSubmit={handleHeroSearch} className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl bg-white p-2 shadow-lift ring-1 ring-slate-900/10">
              <Icon name="search" className="ml-3 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="What do you want to learn today? (e.g. React, UI/UX, Python)"
                className="flex-1 bg-transparent px-2 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <Button type="submit" size="md">
                Search
              </Button>
            </form>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" iconRight="arrow-right" onClick={() => navigate({ page: 'catalog' })}>
                Explore All Courses ({published.length})
              </Button>
              <Button size="lg" variant="secondary" icon="grad-cap" onClick={() => switchRole('teacher')}>
                Become an Instructor
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section className="border-y border-slate-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-slate-100 px-4 sm:px-6 md:grid-cols-4 md:divide-x">
          {[
            { icon: 'book-open' as const, value: String(published.length), label: 'Active Courses' },
            { icon: 'layers' as const, value: String(totalChapters), label: 'Interactive Chapters' },
            { icon: 'users' as const, value: String(totalLearners), label: 'Enrolled Learners' },
            { icon: 'award' as const, value: String(data.certificates.length), label: 'Certificates Awarded' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3.5 py-6 md:justify-center">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Icon name={s.icon} className="h-5.5 w-5.5" />
              </span>
              <div>
                <span className="block text-2xl font-extrabold tracking-tight text-slate-900">{s.value}</span>
                <span className="block text-xs font-semibold text-slate-400">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Masterclasses ── */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <Badge tone="amber" icon="star" className="mb-3">Hand-Picked Masterclasses</Badge>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Featured Courses</h2>
              <p className="mt-1 text-sm text-slate-500">Top-rated courses built by working senior practitioners.</p>
            </div>
            <Button variant="ghost" iconRight="arrow-right" onClick={() => navigate({ page: 'catalog' })}>
              View All ({published.length})
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </section>
      )}

      {/* ── Categories Grid ── */}
      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <Badge tone="violet" icon="tag" className="mb-3">Skill Tracks</Badge>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Explore by Category</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Select a skill domain to browse curated roadmaps and structured courses.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.categories.map((cat) => {
              const count = published.filter((c) => c.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => navigate({ page: 'catalog', categoryId: cat.id })}
                  className="group flex items-start gap-4 rounded-2xl bg-slate-50 p-6 text-left ring-1 ring-slate-900/5 transition hover:-translate-y-1 hover:bg-indigo-50/70 hover:shadow-lift"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm ring-1 ring-slate-900/5 transition group-hover:bg-indigo-600 group-hover:text-white">
                    <Icon name={cat.icon} className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-900">{cat.name}</h3>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">{cat.description}</p>
                    <span className="mt-3 inline-block text-xs font-semibold text-indigo-600">
                      {count} course{count === 1 ? '' : 's'} &rarr;
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="mb-12 text-center">
          <Badge tone="indigo" icon="zap" className="mb-3">Engineered for Completion</Badge>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">A Real, Interactive Learning Experience</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: 'video' as const,
              title: 'Multi-Media Lesson Studio',
              text: 'Seamless video streaming, rich formatted lecture notes, code snippets, and downloadable cheat sheets on every chapter.',
            },
            {
              icon: 'check-square' as const,
              title: 'Knowledge Check Quizzes',
              text: 'Reinforce what you learn with instant quiz feedback, comprehensive explanations, and mastery validation.',
            },
            {
              icon: 'certificate' as const,
              title: 'Verifiable Proof of Skill',
              text: 'Finish every chapter to receive a cryptographically signed certificate with a permanent public verification link.',
            },
          ].map((feat) => (
            <div key={feat.title} className="rounded-2xl bg-white p-7 shadow-soft ring-1 ring-slate-900/5">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25">
                <Icon name={feat.icon} className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-slate-900">{feat.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{feat.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Instructor Banner ── */}
      <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 px-6 py-12 sm:px-12 lg:px-16 text-white shadow-xl">
          <div className="relative z-10 flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <Badge className="mb-4 bg-white/20 text-white ring-white/30" icon="grad-cap">Creator Studio</Badge>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Share your knowledge with learners worldwide.</h2>
              <p className="mt-3 text-sm leading-relaxed text-indigo-100 sm:text-base">
                Create structured multi-chapter courses, add video lessons, author quizzes, track student progress, and award certificates.
              </p>
            </div>
            <Button
              size="lg"
              className="bg-white text-indigo-700 shadow-xl hover:bg-indigo-50"
              iconRight="arrow-right"
              onClick={() => switchRole('teacher')}
            >
              Open Instructor Studio
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CATALOG PAGE
// ─────────────────────────────────────────────────────────────
export function CatalogPage({ initialCategoryId, search }: { initialCategoryId?: string; search?: string }) {
  const { data } = useApp();
  const [query, setQuery] = useState(search ?? '');
  const [categoryId, setCategoryId] = useState<string | 'all'>(initialCategoryId ?? 'all');
  const [levelFilter, setLevelFilter] = useState<string | 'all'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest'>('popular');

  const published = useMemo(() => data.courses.filter((c) => c.status === 'published'), [data.courses]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = published.filter((c) => {
      if (categoryId !== 'all' && c.categoryId !== categoryId) return false;
      if (levelFilter !== 'all' && c.level !== levelFilter) return false;
      if (!q) return true;
      const teacher = data.users.find((u) => u.id === c.teacherId)?.name.toLowerCase() ?? '';
      return c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || teacher.includes(q);
    });

    if (sortBy === 'rating') {
      list = [...list].sort((a, b) => (b.rating ?? 5) - (a.rating ?? 5));
    } else if (sortBy === 'newest') {
      list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } else {
      // popular
      list = [...list].sort((a, b) => {
        const aCount = data.enrolments.filter((e) => e.courseId === a.id).length;
        const bCount = data.enrolments.filter((e) => e.courseId === b.id).length;
        return bCount - aCount;
      });
    }

    return list;
  }, [published, query, categoryId, levelFilter, sortBy, data.users, data.enrolments]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Course Catalog</h1>
        <p className="mt-2 text-base text-slate-500">
          Explore production-grade courses across engineering, design, AI, and business.
        </p>
      </div>

      {/* Search & Filters Toolbar */}
      <div className="mt-8 space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses by title, topic, or instructor..."
              className="w-full rounded-2xl bg-white py-3 pl-11 pr-10 text-sm font-medium text-slate-900 shadow-soft ring-1 ring-slate-900/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600">
                <Icon name="x" className="h-4 w-4" />
              </button>
            )}
          </div>

          <Select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="w-40 py-3 text-xs font-semibold">
            <option value="all">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </Select>

          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="w-44 py-3 text-xs font-semibold">
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest First</option>
          </Select>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            onClick={() => setCategoryId('all')}
            className={cn(
              'rounded-full px-4 py-2 text-xs font-bold transition-all ring-1',
              categoryId === 'all'
                ? 'bg-indigo-600 text-white ring-indigo-600 shadow-md shadow-indigo-600/25'
                : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50',
            )}
          >
            All Courses ({published.length})
          </button>
          {data.categories.map((cat) => {
            const count = published.filter((c) => c.categoryId === cat.id).length;
            const active = categoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryId(active ? 'all' : cat.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ring-1',
                  active
                    ? 'bg-indigo-600 text-white ring-indigo-600 shadow-md shadow-indigo-600/25'
                    : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50',
                )}
              >
                <Icon name={cat.icon} className="h-3.5 w-3.5" />
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-8 text-xs font-bold uppercase tracking-wider text-slate-400">
        Showing {results.length} course{results.length === 1 ? '' : 's'}
      </p>

      {results.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon="search"
            title="No courses match your filter"
            description="Try searching with a different term or clear your active category filters."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery('');
                  setCategoryId('all');
                  setLevelFilter('all');
                }}
              >
                Reset Filters
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {results.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COURSE DETAIL PAGE
// ─────────────────────────────────────────────────────────────
export function CourseDetailPage({ courseId }: { courseId: string }) {
  const app = useApp();
  const { data, navigate, currentUser, openAuthModal, requireAuth, enrolmentFor, enrolledCount, toast, enrol, isWishlisted, toggleWishlist, addCourseReview, reviewsFor } = app;
  const course = data.courses.find((c) => c.id === courseId);
  const [previewChapter, setPreviewChapter] = useState<Chapter | null>(null);

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  if (!course) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <EmptyState
          icon="alert"
          title="Course not found"
          description="This course may have been removed or you followed an invalid link."
          action={<Button onClick={() => navigate({ page: 'catalog' })}>Browse Catalog</Button>}
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
  const isWish = isWishlisted(course.id);
  const reviews = reviewsFor(course.id);

  const handleEnrol = () => {
    if (!currentUser) {
      openAuthModal(course.id);
      return;
    }
    enrol(course.id);
    toast(`Enrolled in “${course.title}”! Let's start chapter 1.`);
    navigate({ page: 's-learn', courseId: course.id });
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    const ok = addCourseReview(course.id, reviewRating, reviewComment.trim());
    if (ok) {
      setReviewComment('');
      setReviewSubmitted(true);
      toast('Thank you for submitting your course review!');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => navigate({ page: 'catalog' })} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-indigo-600">
          <Icon name="chevron-left" className="h-4 w-4" /> Back to Catalog
        </button>
        <button
          onClick={() => {
            toggleWishlist(course.id);
            if (currentUser) {
              toast(isWish ? 'Removed from wishlist' : 'Saved to wishlist', 'info');
            }
          }}
          className={cn(
            'flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-bold transition',
            isWish ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
          )}
        >
          <Icon name={isWish ? 'bookmark-filled' : 'bookmark'} className="h-4 w-4" />
          {isWish ? 'Saved to Wishlist' : 'Save to Wishlist'}
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-12">
        {/* Main Column */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {category && <Badge tone="indigo" icon={category.icon}>{category.name}</Badge>}
            <LevelBadge level={course.level} />
            {course.featured && <Badge tone="amber" icon="star">Featured Masterclass</Badge>}
          </div>

          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            {course.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg whitespace-pre-line">
            {course.longDescription}
          </p>

          {/* Quick Metrics */}
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: 'layers' as const, label: 'Chapters', value: String(course.chapters.length) },
              { icon: 'clock' as const, label: 'Duration', value: fmtDuration(totalMin) },
              { icon: 'users' as const, label: 'Students', value: String(students) },
              { icon: 'star' as const, label: 'Rating', value: `${course.rating ?? '5.0'} (${reviews.length})` },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white p-4 shadow-soft ring-1 ring-slate-900/5">
                <Icon name={s.icon} className="h-4.5 w-4.5 text-indigo-600" />
                <p className="mt-2 text-lg font-extrabold text-slate-900">{s.value}</p>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>

          {/* What You'll Learn */}
          {course.whatYouLearn.length > 0 && (
            <div className="mt-8 rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-900/5 sm:p-7">
              <h2 className="text-lg font-bold text-slate-900">What you&apos;ll master</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {course.whatYouLearn.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-700">
                    <Icon name="check-circle" className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Syllabus / Chapters Breakdown */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-slate-900">Curriculum &amp; Chapters</h2>
            <p className="mt-1 text-sm text-slate-500">
              {course.chapters.length} lessons &middot; {fmtDuration(totalMin)} total runtime &middot; includes quizzes and notes
            </p>

            <ol className="mt-4 overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-900/5">
              {course.chapters.map((chap, i) => {
                const isDone = enrolment?.completedChapterIds.includes(chap.id);
                return (
                  <li key={chap.id} className={cn(i > 0 && 'border-t border-slate-100')}>
                    <button
                      onClick={() => {
                        if (enrolled) {
                          navigate({ page: 's-learn', courseId: course.id, chapterId: chap.id });
                        } else if (chap.freePreview) {
                          setPreviewChapter(chap);
                        } else {
                          requireAuth(() => {
                            enrol(course.id);
                            navigate({ page: 's-learn', courseId: course.id, chapterId: chap.id });
                          }, course.id);
                        }
                      }}
                      className="group flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-indigo-50/40"
                    >
                      <span
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1',
                          isDone
                            ? 'bg-emerald-500 text-white ring-emerald-500'
                            : chap.freePreview
                              ? 'bg-indigo-50 text-indigo-600 ring-indigo-100'
                              : 'bg-slate-50 text-slate-400 ring-slate-100',
                        )}
                      >
                        {isDone ? <Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.4} /> : i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold text-slate-900">{chap.title}</p>
                          {chap.freePreview && <Badge tone="sky" icon="play">Free Preview</Badge>}
                          {chap.quiz && <Badge tone="violet" icon="check-square">Quiz</Badge>}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-slate-400">{chap.description}</p>
                      </div>
                      <span className="text-xs font-semibold text-slate-400">{chap.durationMin} min</span>
                      <Icon
                        name={enrolled || chap.freePreview ? 'chevron-right' : 'lock'}
                        className={cn('h-4 w-4', chap.freePreview ? 'text-indigo-600' : 'text-slate-300')}
                      />
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Student Reviews & Feedback */}
          <div className="mt-12">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Student Reviews &amp; Feedback</h2>
                <p className="text-xs text-slate-500">{reviews.length} ratings from enrolled learners</p>
              </div>
              <div className="flex items-center gap-2">
                <StarRating rating={Math.round(course.rating ?? 5)} />
                <span className="text-sm font-bold text-slate-900">{course.rating ?? '5.0'} / 5.0</span>
              </div>
            </div>

            {/* Submit a review if enrolled */}
            {enrolled && !reviewSubmitted && (
              <form onSubmit={handleReviewSubmit} className="mt-6 rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-900/5">
                <h3 className="text-sm font-bold text-slate-900">Share your experience</h3>
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-600">Your Rating:</span>
                  <StarRating rating={reviewRating} interactive onChange={setReviewRating} size="lg" />
                </div>
                <div className="mt-3">
                  <TextArea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="What did you think of the course content, lessons, and assignments?"
                    required
                  />
                </div>
                <div className="mt-3 flex justify-end">
                  <Button size="sm" type="submit" icon="check">
                    Post Review
                  </Button>
                </div>
              </form>
            )}

            {/* Reviews List */}
            <div className="mt-6 space-y-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-900/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={rev.studentName} size="xs" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{rev.studentName}</p>
                        <p className="text-[10px] text-slate-400">{fmtDate(rev.createdAt)}</p>
                      </div>
                    </div>
                    <StarRating rating={rev.rating} size="sm" />
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-slate-600">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start space-y-6">
          <div className="overflow-hidden rounded-3xl bg-slate-950 shadow-lift ring-1 ring-slate-900/10">
            <img src={course.coverImage} alt={course.title} className="aspect-video w-full object-cover opacity-80" />
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-900/5">
            {enrolled ? (
              <div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-500">Your Progress</span>
                  <span className={pct >= 100 ? 'text-emerald-600' : 'text-indigo-600'}>
                    {done}/{course.chapters.length} &middot; {pct}%
                  </span>
                </div>
                <ProgressBar value={pct} className="mt-2" />
                <Button size="lg" className="w-full mt-4" iconRight="arrow-right" onClick={() => navigate({ page: 's-learn', courseId: course.id })}>
                  {pct >= 100 ? 'Review Course' : 'Resume Learning'}
                </Button>
              </div>
            ) : (
              <div>
                <div className="mb-4 text-center">
                  <span className="text-3xl font-extrabold text-slate-900">Free</span>
                  <span className="ml-2 text-sm font-semibold text-slate-400 line-through">$99</span>
                </div>
                <Button size="lg" className="w-full" iconRight="arrow-right" onClick={handleEnrol}>
                  {currentUser ? 'Enrol Free & Start Learning' : 'Sign In to Enrol & Learn'}
                </Button>
                <p className="mt-2 text-center text-xs text-slate-400">Lifetime access &middot; Verifiable Certificate included</p>
              </div>
            )}

            <ul className="mt-6 space-y-2.5 border-t border-slate-100 pt-5 text-xs font-medium text-slate-600">
              <li className="flex items-center gap-2"><Icon name="video" className="h-4 w-4 text-indigo-600" /> Interactive video + text chapters</li>
              <li className="flex items-center gap-2"><Icon name="check-square" className="h-4 w-4 text-indigo-600" /> Quizzes &amp; knowledge validation</li>
              <li className="flex items-center gap-2"><Icon name="file-text" className="h-4 w-4 text-indigo-600" /> Personal notes pad with export</li>
              <li className="flex items-center gap-2"><Icon name="award" className="h-4 w-4 text-indigo-600" /> Cryptographic certificate upon completion</li>
            </ul>
          </div>

          {/* Instructor Bio Card */}
          {teacher && (
            <div className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-900/5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Instructor</p>
              <div className="mt-3 flex items-center gap-3">
                <Avatar name={teacher.name} size="md" />
                <div>
                  <p className="font-bold text-slate-900">{teacher.name}</p>
                  <p className="text-xs text-indigo-600">{teacher.headline}</p>
                </div>
              </div>
              {teacher.bio && <p className="mt-3 text-xs leading-relaxed text-slate-500">{teacher.bio}</p>}
            </div>
          )}
        </aside>
      </div>

      {/* Free Preview Video Modal */}
      <Modal open={Boolean(previewChapter)} onClose={() => setPreviewChapter(null)} wide title={`Preview: ${previewChapter?.title}`}>
        {previewChapter && (
          <div className="p-6 space-y-4">
            <VideoPlayer videoUrl={previewChapter.videoUrl} title={previewChapter.title} durationMin={previewChapter.durationMin} />
            <p className="text-sm text-slate-600">{previewChapter.description}</p>
            <div className="flex gap-3 pt-2">
              <Button
                className="flex-1"
                iconRight="arrow-right"
                onClick={() => {
                  setPreviewChapter(null);
                  handleEnrol();
                }}
              >
                {currentUser ? 'Enrol Free to Unlock All Lessons' : 'Sign In to Unlock All Lessons'}
              </Button>
              <Button variant="ghost" onClick={() => setPreviewChapter(null)}>Close Preview</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
