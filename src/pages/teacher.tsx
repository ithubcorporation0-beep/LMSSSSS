import { useEffect, useMemo, useState } from 'react';
import type { Chapter, ChapterQuiz, ChapterResource, Course, Level, QuizQuestion, VideoType } from '../types';
import { useApp } from '../store';
import { COVER_PRESETS, LEVELS } from '../data/seed';
import { cn, courseMinutes, fmtDateShort, fmtDuration, humanJoin, progressOf, timeAgo } from '../lib';
import { Avatar, Badge, Button, EmptyState, Field, Icon, Modal, PageHeader, ProgressBar, Select, StatCard, TextArea, TextInput, VideoPlayer } from '../components/ui';

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
        title="Instructor Studio"
        subtitle={`Welcome back, ${currentUser.name.split(' ')[0]} — manage your curriculum and view student progress.`}
        actions={<Button icon="plus" onClick={() => navigate({ page: 't-courses', newCourse: true })}>Create New Course</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon="book-open" label="My Courses" value={my.courses.length} tint="indigo" sub="Created courses on platform." />
        <StatCard icon="eye" label="Published Live" value={publishedCount} tint="emerald" sub="Visible in catalog right now." />
        <StatCard icon="users" label="Total Learners" value={uniqueStudents} tint="sky" sub="Enrolled across your courses." />
        <StatCard icon="layers" label="Total Lessons" value={totalChapters} tint="violet" sub={`${fmtDuration(my.courses.reduce((s, c) => s + courseMinutes(c), 0))} of video & notes.`} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Recent Enrolments */}
        <section className="rounded-2xl bg-white shadow-soft ring-1 ring-slate-900/5">
          <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="font-bold text-slate-900">Recent Student Enrolments</h2>
            <Badge tone="indigo">{my.enrolments.length} total</Badge>
          </header>
          {recent.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-slate-400">No enrolments yet — publish a course to start teaching learners.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((e) => {
                const student = data.users.find((u) => u.id === e.studentId);
                const course = data.courses.find((c) => c.id === e.courseId);
                const { pct } = course ? progressOf(course, e) : { pct: 0 };
                return (
                  <li key={e.id} className="flex items-center gap-4 px-6 py-4">
                    <Avatar name={student?.name ?? 'Student'} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-900">{student?.name}</p>
                      <p className="truncate text-xs text-slate-400">
                        enrolled in <span className="font-semibold text-slate-600">{course?.title}</span>
                      </p>
                    </div>
                    <div className="hidden w-28 sm:block">
                      <ProgressBar value={pct} />
                      <p className="mt-1 text-right text-[10px] font-bold text-slate-400">{pct}% complete</p>
                    </div>
                    <span className="w-20 text-right text-xs font-medium text-slate-400">{timeAgo(e.enrolledAt)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Quick Insights & Drafts */}
        <aside className="space-y-5">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white shadow-lift">
            <h3 className="flex items-center gap-2 font-extrabold"><Icon name="sparkles" className="h-5 w-5" /> Course Design Tip</h3>
            <p className="mt-2.5 text-xs leading-relaxed text-indigo-100">
              Chapters with interactive quizzes and free preview videos achieve a 3.4x higher completion and satisfaction rating.
            </p>
            <Button className="mt-5 w-full bg-white text-indigo-700 hover:bg-indigo-50" size="sm" iconRight="arrow-right" onClick={() => navigate({ page: 't-analytics' })}>
              View Analytics
            </Button>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-900/5">
            <h3 className="font-extrabold text-slate-900">Your Drafts</h3>
            {my.courses.filter((c) => c.status === 'draft').length === 0 ? (
              <p className="mt-2 text-xs text-slate-400">All of your courses are currently published and live.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {my.courses.filter((c) => c.status === 'draft').map((c) => (
                  <li key={c.id}>
                    <button onClick={() => navigate({ page: 't-edit', id: c.id })} className="flex w-full items-center gap-2.5 rounded-xl bg-slate-50 p-3 text-left transition hover:bg-indigo-50">
                      <Icon name="pencil" className="h-4 w-4 shrink-0 text-amber-500" />
                      <span className="min-w-0 flex-1 truncate text-xs font-bold text-slate-800">{c.title}</span>
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
// TEACHER · MY COURSES (List & Management)
// ─────────────────────────────────────────────────────────────
export function TeacherCoursesPage({ initialOpenNew }: { initialOpenNew?: boolean }) {
  const { data, navigate, enrolledCount, addCourse, deleteCourse, currentUser, toast } = useApp();
  const my = useTeacherCourses();
  const [newOpen, setNewOpen] = useState(initialOpenNew ?? false);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader
        title="My Courses"
        subtitle="Create, edit, structure chapters, add video lectures, and publish masterclasses."
        actions={<Button icon="plus" onClick={() => setNewOpen(true)}>New Course</Button>}
      />

      {my.courses.length === 0 ? (
        <EmptyState
          icon="book-open"
          title="No courses created yet"
          description="Create your first course with video lectures, reading notes, and knowledge quizzes."
          action={<Button icon="plus" onClick={() => setNewOpen(true)}>Create Your First Course</Button>}
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
                  <th className="px-6 py-4">Rating</th>
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
                              <img src={course.coverImage} alt="" className="h-11 w-18 shrink-0 rounded-lg object-cover" />
                            ) : (
                              <span className="flex h-11 w-18 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-300">
                                <Icon name="image" className="h-5 w-5" />
                              </span>
                            )}
                            <div className="min-w-0">
                              <button onClick={() => navigate({ page: 't-edit', id: course.id })} className="block max-w-[260px] truncate text-left font-bold text-slate-900 transition hover:text-indigo-600">
                                {course.title || 'Untitled Course'}
                              </button>
                              <p className="mt-0.5 text-xs text-slate-400">{category?.name ?? 'No category'} &middot; {course.level}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {course.status === 'published' ? <Badge tone="emerald" icon="eye">Published</Badge> : <Badge tone="amber" icon="pencil">Draft</Badge>}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700">{enrolledCount(course.id)}</td>
                        <td className="px-6 py-4 font-semibold text-slate-700">{course.chapters.length}</td>
                        <td className="px-6 py-4 font-semibold text-amber-600">{course.rating ?? '5.0'} ★</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button variant="ghost" size="sm" icon="eye" onClick={() => navigate({ page: 'course', id: course.id })}>Preview</Button>
                            <Button variant="secondary" size="sm" icon="pencil" onClick={() => navigate({ page: 't-edit', id: course.id })}>Edit</Button>
                            <button
                              aria-label="Delete course"
                              onClick={() => setDeleteTarget(course)}
                              className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                            >
                              <Icon name="trash" className="h-4 w-4" />
                            </button>
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

      {/* New Course Modal */}
      <NewCourseModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreate={(input) => {
          const course = addCourse(input, currentUser.id);
          setNewOpen(false);
          toast('Course draft created — add chapters and video URLs to publish!');
          navigate({ page: 't-edit', id: course.id });
        }}
      />

      {/* Delete Course Confirmation */}
      <Modal open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        {deleteTarget && (
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-900">Delete &ldquo;{deleteTarget.title}&rdquo;?</h3>
            <p className="mt-2 text-sm text-slate-500">
              Are you sure you want to delete this course? All associated lessons, quizzes, and student progress records will be removed.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button
                className="bg-rose-600 hover:bg-rose-700 text-white"
                icon="trash"
                onClick={() => {
                  deleteCourse(deleteTarget.id);
                  setDeleteTarget(null);
                  toast('Course deleted', 'info');
                }}
              >
                Delete Course
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function NewCourseModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (input: { title: string; description: string; categoryId: string; level: Level; coverImage?: string }) => void;
}) {
  const { data } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [level, setLevel] = useState<Level>('Beginner');
  const [coverPreset, setCoverPreset] = useState(COVER_PRESETS[0]);

  useEffect(() => {
    if (open) {
      setTitle('');
      setDescription('');
      setCategoryId(data.categories[0]?.id ?? '');
      setLevel('Beginner');
      setCoverPreset(COVER_PRESETS[0]);
    }
  }, [open, data.categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    onCreate({
      title: title.trim(),
      description: description.trim(),
      categoryId: categoryId || data.categories[0]?.id || 'cat_dev',
      level,
      coverImage: coverPreset,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Create New Course Masterclass">
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <Field label="Course Title">
          <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Masterclass in TypeScript & Distributed Systems" required autoFocus />
        </Field>
        <Field label="Short Summary">
          <TextArea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A concise 1-2 sentence overview of what students will accomplish..." required />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category">
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              {data.categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Difficulty Level">
            <Select value={level} onChange={(e) => setLevel(e.target.value as Level)}>
              {LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </Select>
          </Field>
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Choose a Cover Art Preset</label>
          <div className="grid grid-cols-3 gap-2">
            {COVER_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setCoverPreset(preset)}
                className={cn('aspect-video overflow-hidden rounded-lg ring-2 transition', coverPreset === preset ? 'ring-indigo-600' : 'ring-transparent opacity-60 hover:opacity-100')}
              >
                <img src={preset} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-3">
          <Button className="flex-1" icon="plus" type="submit">Create Draft</Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// TEACHER · COURSE EDITOR (Comprehensive Authoring Hub)
// ─────────────────────────────────────────────────────────────
export function CourseEditorPage({ courseId }: { courseId: string }) {
  const app = useApp();
  const { data, navigate, toast, updateCourse, setCourseStatus } = app;
  const course = data.courses.find((c) => c.id === courseId);

  const [chapterModalOpen, setChapterModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | undefined>(undefined);
  const [coverOpen, setCoverOpen] = useState(false);

  if (!course) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <EmptyState icon="alert" title="Course not found" description="It may have been removed." action={<Button onClick={() => navigate({ page: 't-courses' })}>Back to Courses</Button>} />
      </div>
    );
  }

  const missing: string[] = [];
  if (!course.title.trim()) missing.push('title');
  if (!course.description.trim()) missing.push('description');
  if (course.chapters.length === 0) missing.push('at least one chapter');
  if (!course.coverImage) missing.push('cover image');

  const published = course.status === 'published';

  const handlePublish = () => {
    if (missing.length > 0) {
      toast(`Cannot publish yet: missing ${humanJoin(missing)}`, 'error');
      return;
    }
    setCourseStatus(course.id, 'published');
    toast(`“${course.title}” is now live in the catalog!`);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Top Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => navigate({ page: 't-courses' })} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-indigo-600">
          <Icon name="chevron-left" className="h-4 w-4" /> My Courses
        </button>
        <div className="flex items-center gap-2">
          {published ? <Badge tone="emerald" icon="eye">Published</Badge> : <Badge tone="amber" icon="pencil">Draft</Badge>}
          <Button variant="secondary" size="sm" icon="eye" onClick={() => navigate({ page: 'course', id: course.id })}>
            Student Preview
          </Button>
          {published ? (
            <Button
              variant="secondary"
              size="sm"
              icon="eye-off"
              onClick={() => {
                setCourseStatus(course.id, 'draft');
                toast('Course unpublished (hidden from catalog)', 'info');
              }}
            >
              Unpublish
            </Button>
          ) : (
            <Button size="sm" icon="zap" onClick={handlePublish}>
              Publish Course
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Core Metadata */}
        <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-900/5 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900">Course Information</h2>
          <div className="mt-5 space-y-4">
            <Field label="Course Title">
              <TextInput value={course.title} onChange={(e) => updateCourse(course.id, { title: e.target.value })} />
            </Field>
            <Field label="Short Summary">
              <TextInput value={course.description} onChange={(e) => updateCourse(course.id, { description: e.target.value })} />
            </Field>
            <Field label="Full Long Description / Syllabus Notes">
              <TextArea value={course.longDescription} onChange={(e) => updateCourse(course.id, { longDescription: e.target.value })} rows={4} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category">
                <Select value={course.categoryId} onChange={(e) => updateCourse(course.id, { categoryId: e.target.value })}>
                  {data.categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Level">
                <Select value={course.level} onChange={(e) => updateCourse(course.id, { level: e.target.value as Level })}>
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </Select>
              </Field>
            </div>
          </div>
        </section>

        {/* Cover Image */}
        <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-900/5 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Cover Artwork</h2>
              <p className="text-xs text-slate-400">Displayed in course cards and landing hero</p>
            </div>
            <Button variant="secondary" size="sm" icon="image" onClick={() => setCoverOpen(true)}>
              Change Artwork
            </Button>
          </div>
          <div className="mt-4 aspect-[16/7] w-full overflow-hidden rounded-xl bg-slate-900">
            <img src={course.coverImage} alt="" className="h-full w-full object-cover" />
          </div>
        </section>

        {/* Chapters Curriculum Manager */}
        <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-900/5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Curriculum &amp; Video Lessons</h2>
              <p className="text-xs text-slate-400">Add YouTube / Vimeo / MP4 videos, lecture markdown, and quizzes</p>
            </div>
            <Button
              size="sm"
              icon="plus"
              onClick={() => {
                setEditingChapter(undefined);
                setChapterModalOpen(true);
              }}
            >
              Add Lesson Chapter
            </Button>
          </div>

          {course.chapters.length === 0 ? (
            <div className="py-12 text-center">
              <Icon name="layers" className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-bold text-slate-700">No chapters yet</p>
              <p className="text-xs text-slate-400">Add video lessons and quizzes to build your course curriculum.</p>
              <Button
                className="mt-4"
                size="sm"
                icon="plus"
                onClick={() => {
                  setEditingChapter(undefined);
                  setChapterModalOpen(true);
                }}
              >
                Add First Chapter
              </Button>
            </div>
          ) : (
            <ol className="mt-4 space-y-2.5">
              {course.chapters.map((chap, idx) => (
                <li key={chap.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200/60">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-slate-600 shadow-sm">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-slate-900 text-sm">{chap.title}</p>
                      {chap.freePreview && <Badge tone="sky">Preview</Badge>}
                      {chap.videoUrl && <Badge tone="indigo" icon="video">Video</Badge>}
                      {chap.quiz && <Badge tone="violet" icon="check-square">Quiz ({chap.quiz.questions.length})</Badge>}
                    </div>
                    <p className="text-xs text-slate-400">{chap.durationMin} min &middot; {chap.description}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      aria-label="Move Up"
                      disabled={idx === 0}
                      onClick={() => app.moveChapter(course.id, idx, idx - 1)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700 disabled:opacity-30"
                    >
                      <Icon name="chevron-up" className="h-4 w-4" />
                    </button>
                    <button
                      aria-label="Move Down"
                      disabled={idx === course.chapters.length - 1}
                      onClick={() => app.moveChapter(course.id, idx, idx + 1)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700 disabled:opacity-30"
                    >
                      <Icon name="chevron-down" className="h-4 w-4" />
                    </button>
                    <button
                      aria-label="Edit Chapter"
                      onClick={() => {
                        setEditingChapter(chap);
                        setChapterModalOpen(true);
                      }}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-indigo-600 transition"
                    >
                      <Icon name="pencil" className="h-4 w-4" />
                    </button>
                    <button
                      aria-label="Delete Chapter"
                      onClick={() => {
                        app.deleteChapter(course.id, chap.id);
                        toast('Chapter removed');
                      }}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-rose-600 transition"
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

      {/* Chapter Authoring Modal */}
      <ChapterAuthorModal
        open={chapterModalOpen}
        onClose={() => setChapterModalOpen(false)}
        chapter={editingChapter}
        onSave={(data) => {
          if (editingChapter) {
            app.updateChapter(course.id, editingChapter.id, data);
            toast('Chapter updated');
          } else {
            app.addChapter(course.id, data);
            toast('Chapter added to course');
          }
          setChapterModalOpen(false);
        }}
      />

      {/* Cover Modal */}
      <Modal open={coverOpen} onClose={() => setCoverOpen(false)} title="Select Course Cover Artwork">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {COVER_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  updateCourse(course.id, { coverImage: preset });
                  setCoverOpen(false);
                  toast('Artwork updated');
                }}
                className={cn('aspect-video overflow-hidden rounded-xl ring-2 transition', course.coverImage === preset ? 'ring-indigo-600' : 'ring-transparent hover:ring-indigo-300')}
              >
                <img src={preset} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ChapterAuthorModal({
  open,
  onClose,
  chapter,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  chapter?: Chapter;
  onSave: (data: {
    title: string;
    description: string;
    durationMin: number;
    freePreview: boolean;
    videoUrl?: string;
    videoType?: VideoType;
    content?: string;
    resources?: ChapterResource[];
    quiz?: ChapterQuiz;
  }) => void;
}) {
  const [title, setTitle] = useState(chapter?.title ?? '');
  const [description, setDescription] = useState(chapter?.description ?? '');
  const [durationMin, setDurationMin] = useState(chapter?.durationMin ?? 15);
  const [freePreview, setFreePreview] = useState(chapter?.freePreview ?? false);
  const [videoUrl, setVideoUrl] = useState(chapter?.videoUrl ?? '');
  const [content, setContent] = useState(chapter?.content ?? '');

  // Quiz questions state
  const [questions, setQuestions] = useState<QuizQuestion[]>(chapter?.quiz?.questions ?? []);

  useEffect(() => {
    if (open) {
      setTitle(chapter?.title ?? '');
      setDescription(chapter?.description ?? '');
      setDurationMin(chapter?.durationMin ?? 15);
      setFreePreview(chapter?.freePreview ?? false);
      setVideoUrl(chapter?.videoUrl ?? '');
      setContent(chapter?.content ?? '');
      setQuestions(chapter?.quiz?.questions ?? []);
    }
  }, [open, chapter]);

  const handleAddQuestion = () => {
    const newQ: QuizQuestion = {
      id: `q_${Date.now()}`,
      question: 'Enter your question prompt here...',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctIndex: 0,
      explanation: 'Explanation for why this option is correct.',
    };
    setQuestions((prev) => [...prev, newQ]);
  };

  const handleUpdateQuestion = (idx: number, patch: Partial<QuizQuestion>) => {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  };

  const handleDeleteQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      durationMin: Number(durationMin) || 15,
      freePreview,
      videoUrl: videoUrl.trim() || undefined,
      videoType: 'youtube',
      content: content.trim() || undefined,
      quiz: questions.length > 0 ? { passingPercent: 70, questions } : undefined,
    });
  };

  return (
    <Modal open={open} onClose={onClose} wide title={chapter ? 'Edit Lesson Chapter' : 'Author New Lesson Chapter'}>
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <Field label="Lesson Title">
          <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 1. Introduction to Reactive Streams" required autoFocus />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Video URL (YouTube, Vimeo, Loom, or MP4)">
            <TextInput value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
          </Field>
          <Field label="Estimated Runtime (minutes)">
            <TextInput type="number" min={1} value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))} required />
          </Field>
        </div>

        <Field label="Short Lesson Summary">
          <TextInput value={description} onChange={(e) => setDescription(e.target.value)} placeholder="1-2 sentences outlining the lesson takeaways" />
        </Field>

        <Field label="Lecture Notes &amp; Reading Material (Markdown Supported)">
          <TextArea value={content} onChange={(e) => setContent(e.target.value)} rows={6} placeholder="Write lecture notes, code blocks, checklists, and references here..." />
        </Field>

        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
          <input type="checkbox" checked={freePreview} onChange={(e) => setFreePreview(e.target.checked)} className="h-4 w-4 rounded text-indigo-600" />
          Allow Free Preview Chapter (unregistered visitors can preview)
        </label>

        {/* Quiz Builder */}
        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Knowledge Check Questions ({questions.length})</h4>
            <Button size="sm" variant="secondary" icon="plus" type="button" onClick={handleAddQuestion}>
              Add Question
            </Button>
          </div>

          <div className="mt-3 space-y-4">
            {questions.map((q, qIdx) => (
              <div key={q.id} className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600">Question {qIdx + 1}</span>
                  <button type="button" onClick={() => handleDeleteQuestion(qIdx)} className="text-xs text-rose-500 hover:text-rose-700">
                    Remove
                  </button>
                </div>
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => handleUpdateQuestion(qIdx, { question: e.target.value })}
                  className="mt-2 w-full rounded-lg bg-white p-2 text-xs font-medium ring-1 ring-slate-200"
                  placeholder="Question prompt"
                  required
                />
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        name={`correct_${qIdx}`}
                        checked={q.correctIndex === optIdx}
                        onChange={() => handleUpdateQuestion(qIdx, { correctIndex: optIdx })}
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...q.options];
                          newOpts[optIdx] = e.target.value;
                          handleUpdateQuestion(qIdx, { options: newOpts });
                        }}
                        className="w-full rounded-md bg-white p-1 text-xs ring-1 ring-slate-200"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <Button className="flex-1" icon="check" type="submit">Save Chapter</Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </form>
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
  const [courseFilter, setCourseFilter] = useState<string | 'all'>('all');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return my.enrolments
      .map((e) => ({
        enrolment: e,
        student: data.users.find((u) => u.id === e.studentId),
        course: data.courses.find((c) => c.id === e.courseId),
      }))
      .filter((r) => r.student && r.course)
      .filter((r) => courseFilter === 'all' || r.course!.id === courseFilter)
      .filter((r) => !q || r.student!.name.toLowerCase().includes(q) || r.student!.email.toLowerCase().includes(q))
      .sort((a, b) => b.enrolment.enrolledAt.localeCompare(a.enrolment.enrolledAt));
  }, [my.enrolments, query, courseFilter, data.users, data.courses]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader title="Enrolled Students" subtitle={`${my.enrolments.length} total student course enrolments.`} />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[260px] flex-1 max-w-md">
          <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search learners by name or email..."
            className="w-full rounded-2xl bg-white py-3 pl-11 pr-4 text-sm font-medium shadow-soft ring-1 ring-slate-900/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <Select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="w-56 py-3 text-xs font-semibold">
          <option value="all">All Courses ({my.courses.length})</option>
          {my.courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-900/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4 w-56">Progress</th>
                <th className="px-6 py-4">Enrolled On</th>
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
                        <div>
                          <p className="font-bold text-slate-900">{student!.name}</p>
                          <p className="text-xs text-slate-400">{student!.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="max-w-[200px] truncate px-6 py-4 font-semibold text-slate-700">{course!.title}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <ProgressBar value={pct} className="w-32" />
                        <span className={cn('text-xs font-bold', pct >= 100 ? 'text-emerald-600' : 'text-indigo-600')}>{pct}% ({done}/{total})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{timeAgo(enrolment.enrolledAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TEACHER · ANALYTICS
// ─────────────────────────────────────────────────────────────
export function TeacherAnalyticsPage() {
  const my = useTeacherCourses();

  const days = useMemo(() => {
    const out: { key: string; label: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      out.push({
        key: d.toDateString(),
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader title="Course Analytics" subtitle="Student enrollment performance over the past 30 days." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon="trending-up" label="Enrollments (30 Days)" value={total30} tint="indigo" />
        <StatCard icon="users" label="Total Active Students" value={new Set(my.enrolments.map((e) => e.studentId)).size} tint="emerald" />
        <StatCard icon="award" label="Certificates Earned" value={my.enrolments.filter((e) => e.completedChapterIds.length > 0).length} tint="amber" />
      </div>

      <section className="mt-8 rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-900/5 sm:p-8">
        <h2 className="font-bold text-slate-900">30-Day Enrollment Velocity</h2>
        <div className="mt-6 flex h-44 items-end gap-1 sm:gap-2">
          {days.map((d) => (
            <div key={d.key} className="group relative flex h-full flex-1 flex-col justify-end">
              <div
                className={cn(
                  'w-full rounded-t-md transition-all duration-500',
                  d.count > 0 ? 'bg-indigo-600 group-hover:bg-indigo-500' : 'bg-slate-100',
                )}
                style={{ height: `${d.count === 0 ? 4 : Math.max(8, (d.count / max) * 100)}%` }}
                title={`${d.count} enrolments on ${d.label}`}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
