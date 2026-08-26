import { useEffect, useMemo, useState } from 'react';
import type { Chapter, Course, Level } from '../types';
import { useApp } from '../store';
import { LEVELS, COVER_PRESETS } from '../data/seed';
import { cn, courseMinutes, fmtDateShort, fmtDuration, humanJoin, progressOf, timeAgo } from '../lib';
import { Avatar, Badge, Button, EmptyState, Field, Icon, Modal, PageHeader, ProgressBar, Select, StatCard, TextArea, TextInput } from '../components/ui';

// ─────────────────────────────────────────────────────────────
// TEACHER DASHBOARD
// ─────────────────────────────────────────────────────────────
export function TeacherDashboard() {
  const { data, currentUser, navigate } = useApp();
  const my = useTeacherCourses();

  const uniqueStudents = new Set(my.enrolments.map((e) => e.studentId)).size;
  const publishedCount = my.courses.filter((c) => c.status === 'published').length;
  const totalChapters = my.courses.reduce((s, c) => s + c.chapters.length, 0);
  const recent = [...my.enrolments].sort((a, b) => b.enrolledAt.localeCompare(a.enrolledAt)).slice(0, 6);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader
        title={`Teacher studio`}
        subtitle={`Welcome back, ${currentUser.name.split(' ')[0]} — here's how your courses are doing.`}
        actions={<Button icon="plus" onClick={() => navigate({ page: 't-courses', })}>New course</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon="book-open" label="Total courses" value={my.courses.length} tint="indigo" sub="Everything you've created on EduFlow." />
        <StatCard icon="eye" label="Published" value={publishedCount} tint="emerald" sub="Live in the public catalog right now." />
        <StatCard icon="users" label="Total students" value={uniqueStudents} tint="sky" sub="Unique learners across all your courses." />
        <StatCard icon="layers" label="Total chapters" value={totalChapters} tint="violet" sub={`${fmtDuration(my.courses.reduce((s, c) => s + courseMinutes(c), 0))} of teaching content.`} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* recent enrolments */}
        <section className="rounded-2xl bg-white shadow-soft ring-1 ring-slate-900/5">
          <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="font-bold text-slate-900">Recent enrolments</h2>
            <Badge tone="indigo">{my.enrolments.length} total</Badge>
          </header>
          {recent.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-slate-400">No enrolments yet — publish a course and students will appear here.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((e) => {
                const student = data.users.find((u) => u.id === e.studentId);
                const course = data.courses.find((c) => c.id === e.courseId);
                const { pct } = course ? progressOf(course, e) : { pct: 0 };
                return (
                  <li key={e.id} className="flex items-center gap-4 px-6 py-4">
                    <Avatar name={student?.name ?? '?'} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-900">{student?.name}</p>
                      <p className="truncate text-xs text-slate-400">
                        enrolled in <span className="font-semibold text-slate-500">{course?.title}</span>
                      </p>
                    </div>
                    <div className="hidden w-28 sm:block">
                      <ProgressBar value={pct} />
                      <p className="mt-1 text-right text-[11px] font-bold text-slate-400">{pct}%</p>
                    </div>
                    <span className="w-20 text-right text-xs font-medium text-slate-400">{timeAgo(e.enrolledAt)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* quick links */}
        <aside className="space-y-5">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white shadow-lift">
            <h3 className="flex items-center gap-2 font-extrabold"><Icon name="sparkles" className="h-5 w-5" /> Teaching tip</h3>
            <p className="mt-2.5 text-sm leading-relaxed text-indigo-100">
              Courses with a free-preview first chapter get dramatically more enrolments. Make chapter one generous.
            </p>
            <Button className="mt-5 w-full bg-white text-indigo-700 hover:bg-indigo-50" size="sm" iconRight="arrow-right" onClick={() => navigate({ page: 't-analytics' })}>
              See what&apos;s working
            </Button>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-900/5">
            <h3 className="font-extrabold text-slate-900">Your drafts</h3>
            {my.courses.filter((c) => c.status === 'draft').length === 0 ? (
              <p className="mt-2 text-sm text-slate-400">Nothing in draft — everything is live.</p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {my.courses.filter((c) => c.status === 'draft').map((c) => (
                  <li key={c.id}>
                    <button onClick={() => navigate({ page: 't-edit', id: c.id })} className="flex w-full items-center gap-3 rounded-xl bg-slate-50 px-3.5 py-3 text-left transition hover:bg-indigo-50">
                      <Icon name="pencil" className="h-4 w-4 shrink-0 text-amber-500" />
                      <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-800">{c.title}</span>
                      <Icon name="chevron-right" className="h-4 w-4 text-slate-300" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function useTeacherCourses() {
  const { data, currentUser } = useApp();
  return useMemo(() => {
    const courses = data.courses.filter((c) => c.teacherId === currentUser.id);
    const ids = new Set(courses.map((c) => c.id));
    const enrolments = data.enrolments.filter((e) => ids.has(e.courseId));
    return { courses, enrolments };
  }, [data, currentUser.id]);
}

// ─────────────────────────────────────────────────────────────
// TEACHER · MY COURSES (table + new course form)
// ─────────────────────────────────────────────────────────────
export function TeacherCoursesPage() {
  const { data, navigate, enrolledCount, addCourse, currentUser, toast } = useApp();
  const my = useTeacherCourses();
  const [newOpen, setNewOpen] = useState(false);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader
        title="My courses"
        subtitle="Create, edit, reorder chapters and publish. Drafts are only visible to you."
        actions={<Button icon="plus" onClick={() => setNewOpen(true)}>New course</Button>}
      />

      {my.courses.length === 0 ? (
        <EmptyState
          icon="book-open"
          title="No courses yet"
          description="Create your first course — pick a title, add chapters, publish when ready."
          action={<Button icon="plus" onClick={() => setNewOpen(true)}>Create your first course</Button>}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-900/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Students</th>
                  <th className="px-6 py-4">Chapters</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {my.courses
                  .slice()
                  .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                  .map((course) => {
                    const category = data.categories.find((c) => c.id === course.categoryId);
                    return (
                      <tr key={course.id} className="transition hover:bg-slate-50/60">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3.5">
                            {course.coverImage ? (
                              <img src={course.coverImage} alt="" className="h-11 w-[72px] shrink-0 rounded-lg object-cover" loading="lazy" />
                            ) : (
                              <span className="flex h-11 w-[72px] shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-300">
                                <Icon name="image" className="h-5 w-5" />
                              </span>
                            )}
                            <div className="min-w-0">
                              <button onClick={() => navigate({ page: 't-edit', id: course.id })} className="block max-w-[260px] truncate text-left font-bold text-slate-900 transition hover:text-indigo-700">
                                {course.title || 'Untitled course'}
                              </button>
                              <p className="mt-0.5 text-xs text-slate-400">{category?.name ?? 'No category'} · {course.level}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {course.status === 'published' ? <Badge tone="emerald" icon="eye">Published</Badge> : <Badge tone="amber" icon="pencil">Draft</Badge>}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-600">{enrolledCount(course.id)}</td>
                        <td className="px-6 py-4 font-semibold text-slate-600">{course.chapters.length}</td>
                        <td className="px-6 py-4 text-slate-500">{fmtDateShort(course.createdAt)}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" icon="eye" onClick={() => navigate({ page: 'course', id: course.id })}>Preview</Button>
                            <Button variant="secondary" size="sm" icon="pencil" onClick={() => navigate({ page: 't-edit', id: course.id })}>Edit</Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <NewCourseModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreate={(input) => {
          const course = addCourse(input, currentUser.id);
          setNewOpen(false);
          toast('Course drafted — complete the checklist to publish it');
          navigate({ page: 't-edit', id: course.id });
        }}
      />
    </div>
  );
}

export function NewCourseModal({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (input: { title: string; description: string; categoryId: string; level: Level }) => void }) {
  const { data } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [level, setLevel] = useState<Level | ''>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setTitle('');
      setDescription('');
      setCategoryId('');
      setLevel('');
      setErrors({});
    }
  }, [open]);

  const submit = () => {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = 'Please give your course a title';
    if (!description.trim()) next.description = 'A short description helps students decide';
    if (!categoryId) next.categoryId = 'Pick the closest category';
    if (!level) next.level = 'Choose a difficulty level';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onCreate({ title, description, categoryId, level: level as Level });
  };

  return (
    <Modal open={open} onClose={onClose} title="Create a new course">
      <div className="space-y-4 p-6">
        <Field label="Course title" error={errors.title}>
          <TextInput invalid={Boolean(errors.title)} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Core Web Vitals in a Weekend" autoFocus />
        </Field>
        <Field label="Short description" error={errors.description} hint="One or two sentences shown on the course card.">
          <TextArea invalid={Boolean(errors.description)} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What will students walk away able to do?" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category" error={errors.categoryId}>
            <Select invalid={Boolean(errors.categoryId)} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Select…</option>
              {data.categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Level" error={errors.level}>
            <Select invalid={Boolean(errors.level)} value={level} onChange={(e) => setLevel(e.target.value as Level)}>
              <option value="">Select…</option>
              {LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="flex gap-3 pt-2">
          <Button className="flex-1" icon="plus" onClick={submit}>Create draft</Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// TEACHER · COURSE EDITOR
// ─────────────────────────────────────────────────────────────
function missingForPublish(course: Course): string[] {
  const missing: string[] = [];
  if (!course.title.trim()) missing.push('a course title');
  if (!course.description.trim()) missing.push('a description');
  if (!course.categoryId) missing.push('a category');
  if (!course.level) missing.push('a level');
  if (!course.coverImage) missing.push('a cover image');
  if (course.chapters.length === 0) missing.push('at least one chapter');
  return missing;
}

export function CourseEditorPage({ courseId }: { courseId: string }) {
  const app = useApp();
  const { data, navigate, toast, updateCourse, setCourseStatus } = app;
  const course = data.courses.find((c) => c.id === courseId);
  const [coverOpen, setCoverOpen] = useState(false);
  const [chapterModal, setChapterModal] = useState<{ open: boolean; chapter?: Chapter }>({ open: false });
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  if (!course) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <EmptyState icon="alert" title="Course not found" description="It may have been deleted or the demo data was reset." action={<Button onClick={() => navigate({ page: 't-courses' })}>Back to my courses</Button>} />
      </div>
    );
  }

  const missing = missingForPublish(course);
  const doneCount = 6 - missing.length;
  const published = course.status === 'published';
  const category = data.categories.find((c) => c.id === course.categoryId);

  const publish = () => {
    if (missing.length > 0) return;
    setCourseStatus(course.id, 'published');
    toast(`“${course.title}” is now live in the catalog`);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => navigate({ page: 't-courses' })} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-indigo-600">
          <Icon name="chevron-left" className="h-4 w-4" /> My courses
        </button>
        <div className="flex items-center gap-2.5">
          {published ? <Badge tone="emerald" icon="eye">Published</Badge> : <Badge tone="amber" icon="pencil">Draft</Badge>}
          <Button variant="secondary" size="sm" icon="eye" onClick={() => navigate({ page: 'course', id: course.id })}>Preview</Button>
          {published ? (
            <Button
              variant="secondary"
              size="sm"
              icon="eye-off"
              onClick={() => {
                setCourseStatus(course.id, 'draft');
                toast('Course unpublished — it’s hidden from the catalog', 'info');
              }}
            >
              Unpublish
            </Button>
          ) : (
            <div className="group relative">
              <Button size="sm" icon="zap" disabled={missing.length > 0} onClick={publish}>
                Publish course
              </Button>
              {missing.length > 0 && (
                <div className="pointer-events-none absolute right-0 top-full z-20 mt-2 hidden w-64 rounded-xl bg-slate-900 px-4 py-3 text-xs font-medium leading-relaxed text-white shadow-xl group-hover:block">
                  <p className="mb-1 font-bold">Still needed to publish:</p>
                  <ul className="list-inside list-disc space-y-0.5 text-slate-300">
                    {missing.map((m) => (
                      <li key={m}>{m.replace(/^./, (c) => c.toUpperCase())}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* completion banner */}
      <div className={cn('mb-8 rounded-2xl p-5 ring-1', missing.length === 0 ? 'bg-emerald-50 ring-emerald-200' : 'bg-white ring-slate-900/5 shadow-soft')}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className={cn('flex items-center gap-2.5 text-sm font-bold', missing.length === 0 ? 'text-emerald-800' : 'text-slate-800')}>
            <Icon name={missing.length === 0 ? 'check-circle' : 'alert'} className={cn('h-5 w-5', missing.length === 0 ? 'text-emerald-600' : 'text-amber-500')} />
            {missing.length === 0 ? (published ? 'All set — this course is live' : 'Ready to publish!') : `Complete all fields to publish (${doneCount}/6)`}
          </p>
          {missing.length > 0 && <span className="text-xs font-semibold text-slate-400">{humanJoin(missing.map((m) => m.replace(/^a |^an /, '')))} missing</span>}
        </div>
        {missing.length > 0 && (
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500" style={{ width: `${(doneCount / 6) * 100}%` }} />
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* basics */}
        <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-900/5 sm:p-7">
          <h2 className="text-lg font-bold text-slate-900">The basics</h2>
          <p className="mt-0.5 text-sm text-slate-400">Click any field to edit it inline.</p>
          <div className="mt-5 space-y-5">
            <InlineText
              label="Title"
              value={course.title}
              placeholder="Untitled course"
              onSave={(v) => { updateCourse(course.id, { title: v }); toast('Course title saved'); }}
            />
            <InlineText
              label="Description"
              value={course.description}
              placeholder="Add a description"
              multiline
              onSave={(v) => { updateCourse(course.id, { description: v, longDescription: v }); toast('Description saved'); }}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <InlineSelect
                label="Category"
                value={course.categoryId}
                displayValue={category?.name ?? 'No category'}
                options={data.categories.map((c) => ({ value: c.id, label: c.name }))}
                onSave={(v) => { updateCourse(course.id, { categoryId: v }); toast('Category updated'); }}
              />
              <InlineSelect
                label="Level"
                value={course.level}
                displayValue={course.level}
                options={LEVELS.map((l) => ({ value: l, label: l }))}
                onSave={(v) => { updateCourse(course.id, { level: v as Level }); toast('Level updated'); }}
              />
            </div>
          </div>
        </section>

        {/* cover */}
        <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-900/5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Cover image</h2>
              <p className="mt-0.5 text-sm text-slate-400">Shown in the catalog and course hero — 16:9 works best.</p>
            </div>
            <Button variant="secondary" size="sm" icon="image" onClick={() => setCoverOpen(true)}>
              {course.coverImage ? 'Change cover' : 'Add cover'}
            </Button>
          </div>
          <div className="mt-5">
            {course.coverImage ? (
              <button onClick={() => setCoverOpen(true)} className="group relative block w-full overflow-hidden rounded-2xl">
                <img src={course.coverImage} alt="Course cover" className="aspect-[16/7] w-full object-cover transition group-hover:opacity-80" />
                <span className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-950/0 text-sm font-bold text-white opacity-0 transition group-hover:bg-slate-950/35 group-hover:opacity-100">
                  <Icon name="image" className="h-5 w-5" /> Replace image
                </span>
              </button>
            ) : (
              <button onClick={() => setCoverOpen(true)} className="flex aspect-[16/7] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 transition hover:border-indigo-300 hover:bg-indigo-50/40 hover:text-indigo-500">
                <Icon name="image" className="h-8 w-8" />
                <span className="text-sm font-bold">Add a cover image</span>
              </button>
            )}
          </div>
        </section>

        {/* chapters */}
        <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-900/5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Chapters</h2>
              <p className="mt-0.5 text-sm text-slate-400">Drag to reorder — students see them in this exact order.</p>
            </div>
            <Button variant="secondary" size="sm" icon="plus" onClick={() => setChapterModal({ open: true })}>Add chapter</Button>
          </div>

          {course.chapters.length === 0 ? (
            <div className="mt-5 rounded-2xl border-2 border-dashed border-slate-200 px-6 py-10 text-center">
              <Icon name="layers" className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-bold text-slate-700">No chapters yet</p>
              <p className="mt-1 text-sm text-slate-400">Add your first chapter — you need at least one to publish.</p>
              <Button className="mt-5" size="sm" icon="plus" onClick={() => setChapterModal({ open: true })}>Add the first chapter</Button>
            </div>
          ) : (
            <ol className="mt-5 space-y-2.5">
              {course.chapters.map((chap, i) => (
                <li
                  key={chap.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'move';
                    setDragIdx(i);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    setDragOverIdx(i);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragIdx !== null && dragIdx !== i) {
                      app.moveChapter(course.id, dragIdx, i);
                      toast('Chapter order updated', 'info');
                    }
                    setDragIdx(null);
                    setDragOverIdx(null);
                  }}
                  onDragEnd={() => {
                    setDragIdx(null);
                    setDragOverIdx(null);
                  }}
                  className={cn(
                    'flex items-center gap-3 rounded-xl bg-slate-50 px-3.5 py-3 ring-2 ring-transparent transition',
                    dragIdx === i && 'opacity-40',
                    dragOverIdx === i && dragIdx !== null && dragIdx !== i && 'ring-indigo-300',
                  )}
                >
                  <span className="cursor-grab touch-none text-slate-300 transition hover:text-slate-500 active:cursor-grabbing" title="Drag to reorder">
                    <Icon name="grip" className="h-5 w-5" />
                  </span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-extrabold text-slate-500 shadow-sm">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-900">
                      <span className="truncate">{chap.title || 'Untitled chapter'}</span>
                      {chap.freePreview && <Badge tone="sky">Free preview</Badge>}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">{chap.durationMin} min</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      aria-label="Move chapter up"
                      disabled={i === 0}
                      onClick={() => { app.moveChapter(course.id, i, i - 1); toast('Chapter order updated', 'info'); }}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:opacity-30"
                    >
                      <Icon name="chevron-up" className="h-4 w-4" />
                    </button>
                    <button
                      aria-label="Move chapter down"
                      disabled={i === course.chapters.length - 1}
                      onClick={() => { app.moveChapter(course.id, i, i + 1); toast('Chapter order updated', 'info'); }}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:opacity-30"
                    >
                      <Icon name="chevron-down" className="h-4 w-4" />
                    </button>
                    <button aria-label="Edit chapter" onClick={() => setChapterModal({ open: true, chapter: chap })} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-indigo-600">
                      <Icon name="pencil" className="h-4 w-4" />
                    </button>
                    <button
                      aria-label="Delete chapter"
                      onClick={() => {
                        app.deleteChapter(course.id, chap.id);
                        toast(`“${chap.title}” deleted`, 'info');
                      }}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-rose-600"
                    >
                      <Icon name="trash" className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <CoverModal
        open={coverOpen}
        onClose={() => setCoverOpen(false)}
        current={course.coverImage}
        onSave={(url) => {
          updateCourse(course.id, { coverImage: url });
          setCoverOpen(false);
          toast('Cover image updated');
        }}
      />

      <ChapterModal
        key={chapterModal.chapter?.id ?? 'new'}
        open={chapterModal.open}
        onClose={() => setChapterModal({ open: false })}
        chapter={chapterModal.chapter}
        onSave={(input) => {
          if (chapterModal.chapter) {
            app.updateChapter(course.id, chapterModal.chapter.id, input);
            toast('Chapter updated');
          } else {
            app.addChapter(course.id, input);
            toast('Chapter added to the course');
          }
          setChapterModal({ open: false });
        }}
      />
    </div>
  );
}

// ── inline editable bits ─────────────────────────────────────
function InlineText({ label, value, placeholder, multiline, onSave }: { label: string; value: string; placeholder: string; multiline?: boolean; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState('');

  const save = () => {
    if (!draft.trim()) {
      setError(`${label} can't be empty`);
      return;
    }
    onSave(draft.trim());
    setEditing(false);
    setError('');
  };

  return (
    <div>
      <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
      {editing ? (
        <div className="animate-fade-in">
          {multiline ? (
            <TextArea value={draft} onChange={(e) => setDraft(e.target.value)} invalid={Boolean(error)} autoFocus />
          ) : (
            <TextInput value={draft} onChange={(e) => setDraft(e.target.value)} invalid={Boolean(error)} autoFocus onKeyDown={(e) => e.key === 'Enter' && save()} />
          )}
          {error && (
            <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-600">
              <Icon name="alert" className="h-3.5 w-3.5" /> {error}
            </p>
          )}
          <div className="mt-2.5 flex gap-2">
            <Button size="sm" icon="check" onClick={save}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setDraft(value); setError(''); }}>Cancel</Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => { setDraft(value); setEditing(true); }}
          className="group flex w-full items-start justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left ring-1 ring-inset ring-transparent transition hover:bg-indigo-50/50 hover:ring-indigo-100"
        >
          <span className={cn('text-sm leading-relaxed', value ? 'font-medium text-slate-800' : 'italic text-slate-400')}>{value || placeholder}</span>
          <Icon name="pencil" className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-indigo-500" />
        </button>
      )}
    </div>
  );
}

function InlineSelect({ label, value, displayValue, options, onSave }: { label: string; value: string; displayValue: string; options: { value: string; label: string }[]; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState('');

  return (
    <div>
      <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
      {editing ? (
        <div className="animate-fade-in">
          <Select
            value={draft}
            invalid={Boolean(error)}
            autoFocus
            onChange={(e) => {
              const v = e.target.value;
              if (!v) {
                setError(`Please choose a ${label.toLowerCase()}`);
                return;
              }
              setError('');
              onSave(v);
              setEditing(false);
            }}
          >
            <option value="">Select…</option>
            {options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
          {error && (
            <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-600">
              <Icon name="alert" className="h-3.5 w-3.5" /> {error}
            </p>
          )}
          <div className="mt-2.5">
            <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setDraft(value); setError(''); }}>Cancel</Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => { setDraft(value); setEditing(true); }}
          className="group flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left ring-1 ring-inset ring-transparent transition hover:bg-indigo-50/50 hover:ring-indigo-100"
        >
          <span className={cn('text-sm font-medium', value ? 'text-slate-800' : 'italic text-slate-400')}>{value ? displayValue : `Select a ${label.toLowerCase()}…`}</span>
          <Icon name="pencil" className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-indigo-500" />
        </button>
      )}
    </div>
  );
}

// ── cover image modal ────────────────────────────────────────
function CoverModal({ open, onClose, current, onSave }: { open: boolean; onClose: () => void; current: string; onSave: (url: string) => void }) {
  const [url, setUrl] = useState(current);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setUrl(current);
      setError('');
    }
  }, [open, current]);

  const save = () => {
    const v = url.trim();
    if (!v) {
      setError('Paste an image URL or pick one of the presets below');
      return;
    }
    if (!/^https?:\/\//i.test(v)) {
      setError('That doesn’t look like a URL — it should start with http');
      return;
    }
    onSave(v);
  };

  return (
    <Modal open={open} onClose={onClose} title="Course cover image" wide>
      <div className="space-y-5 p-6">
        <Field label="Image URL" error={error} hint="Any 16:9-ish image URL works — picsum photos are great for demos.">
          <TextInput value={url} onChange={(e) => setUrl(e.target.value)} invalid={Boolean(error)} placeholder="https://picsum.photos/seed/my-course/800/450" onKeyDown={(e) => e.key === 'Enter' && save()} />
        </Field>
        <div>
          <p className="mb-2.5 text-sm font-semibold text-slate-700">Or pick a preset</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {COVER_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => { setUrl(preset); setError(''); }}
                className={cn('overflow-hidden rounded-xl ring-2 transition', url === preset ? 'ring-indigo-500' : 'ring-transparent hover:ring-indigo-300')}
              >
                <img src={preset} alt="Cover preset" loading="lazy" className="aspect-video w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <Button icon="check" onClick={save}>Use this cover</Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </Modal>
  );
}

// ── chapter form modal ───────────────────────────────────────
function ChapterModal({ open, onClose, chapter, onSave }: { open: boolean; onClose: () => void; chapter?: Chapter; onSave: (input: Omit<Chapter, 'id'>) => void }) {
  const [title, setTitle] = useState(chapter?.title ?? '');
  const [description, setDescription] = useState(chapter?.description ?? '');
  const [duration, setDuration] = useState(chapter ? String(chapter.durationMin) : '12');
  const [freePreview, setFreePreview] = useState(chapter?.freePreview ?? false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = 'Chapters need a title';
    if (!description.trim()) next.description = 'Add a one-line description for the chapter';
    const dur = Number(duration);
    if (!duration.trim() || Number.isNaN(dur) || dur < 1) next.duration = 'Give a duration in minutes (1 or more)';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onSave({ title: title.trim(), description: description.trim(), durationMin: Math.round(dur), freePreview });
  };

  return (
    <Modal open={open} onClose={onClose} title={chapter ? 'Edit chapter' : 'Add a chapter'}>
      <div className="space-y-4 p-6">
        <Field label="Chapter title" error={errors.title}>
          <TextInput value={title} onChange={(e) => setTitle(e.target.value)} invalid={Boolean(errors.title)} placeholder="e.g. Routing without tears" autoFocus />
        </Field>
        <Field label="Description" error={errors.description}>
          <TextArea value={description} onChange={(e) => setDescription(e.target.value)} invalid={Boolean(errors.description)} placeholder="What does this chapter cover, in one or two sentences?" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Duration (minutes)" error={errors.duration}>
            <TextInput value={duration} onChange={(e) => setDuration(e.target.value)} invalid={Boolean(errors.duration)} inputMode="numeric" type="number" min={1} />
          </Field>
          <div className="flex items-end pb-1">
            <label className="flex cursor-pointer items-center gap-2.5 rounded-xl px-1 py-2 text-sm font-semibold text-slate-700">
              <input type="checkbox" checked={freePreview} onChange={(e) => setFreePreview(e.target.checked)} className="h-4.5 w-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              Free preview chapter
            </label>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button icon="check" onClick={submit}>{chapter ? 'Save changes' : 'Add chapter'}</Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// TEACHER · STUDENTS
// ─────────────────────────────────────────────────────────────
export function TeacherStudentsPage() {
  const { data } = useApp();
  const my = useTeacherCourses();
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return my.enrolments
      .map((e) => ({
        enrolment: e,
        student: data.users.find((u) => u.id === e.studentId),
        course: data.courses.find((c) => c.id === e.courseId),
      }))
      .filter((r) => r.student && r.course)
      .filter((r) => !q || r.student!.name.toLowerCase().includes(q) || r.student!.email.toLowerCase().includes(q))
      .sort((a, b) => b.enrolment.enrolledAt.localeCompare(a.enrolment.enrolledAt));
  }, [my.enrolments, query, data.users, data.courses]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader title="Students" subtitle={`${my.enrolments.length} enrolments across your courses — search by name or email.`} />

      <div className="relative mb-6 max-w-md">
        <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search students…"
          aria-label="Search students"
          className="w-full rounded-2xl bg-white py-3 pl-11 pr-4 text-sm font-medium shadow-soft ring-1 ring-slate-900/5 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon="users"
          title={query ? 'No students match that search' : 'No students yet'}
          description={query ? 'Try a different name or clear the search.' : 'Once learners enrol in your courses, they’ll show up here with their progress.'}
          action={query ? <Button variant="secondary" onClick={() => setQuery('')}>Clear search</Button> : undefined}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-900/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4 w-56">Progress</th>
                  <th className="px-6 py-4">Chapters</th>
                  <th className="px-6 py-4">Enrolled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map(({ enrolment, student, course }) => {
                  const { done, total, pct } = progressOf(course!, enrolment);
                  return (
                    <tr key={enrolment.id} className="transition hover:bg-slate-50/60">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={student!.name} size="md" />
                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-900">{student!.name}</p>
                            <p className="truncate text-xs text-slate-400">{student!.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-[200px] truncate px-6 py-4 font-semibold text-slate-600">{course!.title}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <ProgressBar value={pct} className="w-32" />
                          <span className={cn('text-xs font-extrabold', pct >= 100 ? 'text-emerald-600' : 'text-indigo-600')}>{pct}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-600">{done}/{total}</td>
                      <td className="px-6 py-4 text-slate-500">{timeAgo(enrolment.enrolledAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TEACHER · ANALYTICS
// ─────────────────────────────────────────────────────────────
export function TeacherAnalyticsPage() {
  const { data } = useApp();
  const my = useTeacherCourses();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 60);
    return () => window.clearTimeout(t);
  }, []);

  const days = useMemo(() => {
    const out: { key: string; label: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toDateString();
      out.push({
        key,
        label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        count: 0,
      });
    }
    for (const e of my.enrolments) {
      const key = new Date(e.enrolledAt).toDateString();
      const slot = out.find((d) => d.key === key);
      if (slot) slot.count += 1;
    }
    return out;
  }, [my.enrolments]);

  const max = Math.max(1, ...days.map((d) => d.count));
  const total30 = days.reduce((s, d) => s + d.count, 0);
  const best = days.reduce((a, b) => (b.count > a.count ? b : a), days[0]);
  const avg = (total30 / 30).toFixed(1);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader title="Analytics" subtitle="How your courses are growing, over the last 30 days." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon="trending-up" label="Enrolments · 30 days" value={total30} tint="indigo" />
        <StatCard icon="bar-chart" label="Daily average" value={avg} tint="sky" />
        <StatCard icon="zap" label="Best day" value={best.count} tint="amber" sub={best.count > 0 ? `${best.label}` : 'No enrolments yet'} />
      </div>

      {/* bar chart */}
      <section className="mt-8 rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-900/5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-900">Enrolments per day</h2>
            <p className="mt-0.5 text-sm text-slate-400">Last 30 days · hover a bar for the exact count</p>
          </div>
          <Badge tone="indigo" icon="calendar">Live from demo data</Badge>
        </div>
        <div className="mt-7">
          <div className="flex h-44 items-end gap-[3px] sm:gap-1.5">
            {days.map((d) => (
              <div key={d.key} className="group relative flex h-full flex-1 flex-col justify-end">
                <div className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] font-bold text-white opacity-0 shadow-lg transition group-hover:opacity-100">
                  {d.count} · {d.label}
                </div>
                <div
                  className={cn(
                    'w-full rounded-t-md transition-all duration-700 ease-out',
                    d.count > 0 ? 'bg-gradient-to-t from-indigo-600 to-violet-500 group-hover:from-indigo-500 group-hover:to-violet-400' : 'bg-slate-100',
                  )}
                  style={{ height: mounted ? `${d.count === 0 ? 3 : Math.max(7, (d.count / max) * 100)}%` : '3%' }}
                  title={`${d.count} enrolments on ${d.label}`}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-[3px] border-t border-slate-100 pt-2 sm:gap-1.5">
            {days.map((d, i) => (
              <div key={d.key} className="flex-1 text-center text-[9px] font-semibold text-slate-300 sm:text-[10px]">
                {i % 5 === 0 || i === 29 ? d.label.split(' ')[0] + ' ' + d.label.split(' ')[1].slice(0, 3) : ''}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* per-course breakdown */}
      <section className="mt-8">
        <h2 className="mb-4 font-bold text-slate-900">Per-course breakdown</h2>
        <div className="overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-900/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Students</th>
                  <th className="px-6 py-4">Avg. completion</th>
                  <th className="px-6 py-4">Certificates</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {my.courses.map((course) => {
                  const enrolments = data.enrolments.filter((e) => e.courseId === course.id);
                  const avgCompletion = enrolments.length === 0 ? 0 : Math.round(enrolments.reduce((s, e) => s + progressOf(course, e).pct, 0) / enrolments.length);
                  const certs = data.certificates.filter((c) => c.courseId === course.id).length;
                  return (
                    <tr key={course.id} className="transition hover:bg-slate-50/60">
                      <td className="max-w-[240px] truncate px-6 py-4 font-bold text-slate-900">{course.title}</td>
                      <td className="px-6 py-4">{course.status === 'published' ? <Badge tone="emerald">Published</Badge> : <Badge tone="amber">Draft</Badge>}</td>
                      <td className="px-6 py-4 font-semibold text-slate-600">{enrolments.length}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <ProgressBar value={avgCompletion} className="w-28" />
                          <span className="text-xs font-extrabold text-slate-500">{avgCompletion}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-slate-600">
                          <Icon name="award" className="h-4 w-4 text-amber-500" /> {certs}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
