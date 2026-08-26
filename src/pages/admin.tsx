import { useState } from 'react';
import type { Role } from '../types';
import { useApp } from '../store';
import { cn, fmtDateShort, timeAgo } from '../lib';
import { Avatar, Badge, Button, EmptyState, Field, Icon, PageHeader, Select, StatCard, TextInput } from '../components/ui';

const DEMO_NOTES: Record<string, string> = {
  u_maya: 'Demo student',
  u_daniel: 'Demo teacher',
  u_ava: 'Demo admin',
};

// ─────────────────────────────────────────────────────────────
// ADMIN · OVERVIEW
// ─────────────────────────────────────────────────────────────
export function AdminOverviewPage() {
  const { data, navigate } = useApp();
  const students = data.users.filter((u) => u.role === 'student').length;
  const teachers = data.users.filter((u) => u.role === 'teacher').length;
  const admins = data.users.filter((u) => u.role === 'admin').length;
  const published = data.courses.filter((c) => c.status === 'published').length;
  const drafts = data.courses.length - published;

  const newest = [...data.users].sort((a, b) => b.joinedAt.localeCompare(a.joinedAt)).slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader title="Platform overview" subtitle="Everything happening on EduFlow, at a glance." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard icon="user" label="Students" value={students} tint="emerald" sub={`${teachers} teachers · ${admins} admin${admins === 1 ? '' : 's'} also on the platform.`} />
        <StatCard icon="grad-cap" label="Teachers" value={teachers} tint="indigo" sub="Every course is taught by a working professional." />
        <StatCard icon="book-open" label="Courses" value={data.courses.length} tint="sky" sub={`${published} published · ${drafts} in draft.`} />
        <StatCard icon="trending-up" label="Enrolments" value={data.enrolments.length} tint="violet" sub="Free enrolments across all courses." />
        <StatCard icon="award" label="Certificates" value={data.certificates.length} tint="amber" sub="Issued for 100% course completions." />
        <StatCard icon="tag" label="Categories" value={data.categories.length} tint="rose" sub="Organising the public catalog." />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* newest signups */}
        <section className="rounded-2xl bg-white shadow-soft ring-1 ring-slate-900/5">
          <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="font-bold text-slate-900">Newest sign-ups</h2>
            <Button variant="ghost" size="sm" iconRight="arrow-right" onClick={() => navigate({ page: 'a-users' })}>All users</Button>
          </header>
          <ul className="divide-y divide-slate-100">
            {newest.map((u) => (
              <li key={u.id} className="flex items-center gap-4 px-6 py-4">
                <Avatar name={u.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900">{u.name}</p>
                  <p className="truncate text-xs text-slate-400">{u.headline}</p>
                </div>
                <RoleBadge role={u.role} />
                <span className="w-20 text-right text-xs font-medium text-slate-400">{timeAgo(u.joinedAt)}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* platform health quick links */}
        <section className="grid content-start gap-5">
          <div className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-900/5">
            <h2 className="font-bold text-slate-900">Moderation shortcuts</h2>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
              <Button variant="secondary" icon="layers" onClick={() => navigate({ page: 'a-courses' })}>Review courses</Button>
              <Button variant="secondary" icon="users" onClick={() => navigate({ page: 'a-users' })}>Manage users</Button>
              <Button variant="secondary" icon="tag" onClick={() => navigate({ page: 'a-cats' })}>Categories</Button>
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 p-6 text-white shadow-lift">
            <h3 className="flex items-center gap-2 font-extrabold"><Icon name="shield" className="h-5 w-5 text-emerald-400" /> Platform health</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2"><Icon name="check-circle" className="h-4 w-4 text-emerald-400" /> All published courses have chapters</li>
              <li className="flex items-center gap-2"><Icon name="check-circle" className="h-4 w-4 text-emerald-400" /> Every student email verified</li>
              <li className="flex items-center gap-2"><Icon name="check-circle" className="h-4 w-4 text-emerald-400" /> No reported content in the queue</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: Role }) {
  const tone = role === 'admin' ? 'violet' : role === 'teacher' ? 'indigo' : 'emerald';
  const icon = role === 'admin' ? 'shield' : role === 'teacher' ? 'grad-cap' : 'user';
  return (
    <Badge tone={tone} icon={icon} className="capitalize">{role}</Badge>
  );
}

// ─────────────────────────────────────────────────────────────
// ADMIN · USERS
// ─────────────────────────────────────────────────────────────
export function AdminUsersPage() {
  const { data, setUserRole, toast } = useApp();
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const rows = [...data.users]
    .filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader title="Users" subtitle="Every account on the platform. Change roles — the demo state updates instantly." />

      <div className="relative mb-6 max-w-md">
        <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email…"
          aria-label="Search users"
          className="w-full rounded-2xl bg-white py-3 pl-11 pr-4 text-sm font-medium shadow-soft ring-1 ring-slate-900/5 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon="users"
          title="No users match that search"
          description="Try a different name or clear the search field."
          action={<Button variant="secondary" onClick={() => setQuery('')}>Clear search</Button>}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-900/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Headline</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 w-44">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((u) => (
                  <tr key={u.id} className="transition hover:bg-slate-50/60">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} size="md" />
                        <div className="min-w-0">
                          <p className="flex items-center gap-2 truncate font-bold text-slate-900">
                            {u.name}
                            {DEMO_NOTES[u.id] && <Badge tone="slate" className="shrink-0">{DEMO_NOTES[u.id]}</Badge>}
                          </p>
                          <p className="truncate text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="max-w-[220px] truncate px-6 py-4 text-slate-500">{u.headline}</td>
                    <td className="px-6 py-4 text-slate-500">{fmtDateShort(u.joinedAt)}</td>
                    <td className="px-6 py-4">
                      <Select
                        value={u.role}
                        aria-label={`Role for ${u.name}`}
                        className="w-36 py-2 text-xs font-bold"
                        onChange={(e) => {
                          const next = e.target.value as Role;
                          if (next === u.role) return;
                          setUserRole(u.id, next);
                          toast(`${u.name} is now ${next === 'admin' ? 'an' : 'a'} ${next}`);
                        }}
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ADMIN · COURSES
// ─────────────────────────────────────────────────────────────
export function AdminCoursesPage() {
  const { data, enrolledCount, setCourseStatus, toggleFeatured, toast, navigate } = useApp();

  const rows = [...data.courses].sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader title="Courses" subtitle="Every course on the platform — moderate status and homepage placement." />

      {rows.length === 0 ? (
        <EmptyState icon="book-open" title="No courses on the platform" description="When teachers publish courses, they will appear here for moderation." />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-900/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Teacher</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Students</th>
                  <th className="px-6 py-4">Featured</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((course) => {
                  const teacher = data.users.find((u) => u.id === course.teacherId);
                  const category = data.categories.find((c) => c.id === course.categoryId);
                  const published = course.status === 'published';
                  return (
                    <tr key={course.id} className="transition hover:bg-slate-50/60">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          {course.coverImage ? (
                            <img src={course.coverImage} alt="" loading="lazy" className="h-11 w-[72px] shrink-0 rounded-lg object-cover" />
                          ) : (
                            <span className="flex h-11 w-[72px] shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-300">
                              <Icon name="image" className="h-5 w-5" />
                            </span>
                          )}
                          <div className="min-w-0">
                            <button onClick={() => navigate({ page: 'course', id: course.id })} className="block max-w-[260px] truncate text-left font-bold text-slate-900 transition hover:text-indigo-700">
                              {course.title}
                            </button>
                            <p className="mt-0.5 text-xs text-slate-400">{category?.name ?? 'No category'} · {course.level} · {course.chapters.length} chapters</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 font-semibold text-slate-600">
                          <Avatar name={teacher?.name ?? '?'} size="xs" />
                          <span className="max-w-[140px] truncate">{teacher?.name}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">{published ? <Badge tone="emerald" icon="eye">Published</Badge> : <Badge tone="amber" icon="pencil">Draft</Badge>}</td>
                      <td className="px-6 py-4 font-semibold text-slate-600">{enrolledCount(course.id)}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            toggleFeatured(course.id);
                            toast(course.featured ? `Removed “${course.title}” from featured` : `“${course.title}” is now featured on the home page`, 'info');
                          }}
                          aria-pressed={course.featured}
                          aria-label={course.featured ? `Unfeature ${course.title}` : `Feature ${course.title}`}
                          className={cn(
                            'rounded-xl p-2.5 transition',
                            course.featured ? 'bg-amber-50 text-amber-500 ring-1 ring-amber-200' : 'text-slate-300 hover:bg-slate-100 hover:text-amber-500',
                          )}
                        >
                          <Icon name="star" className={cn('h-4.5 w-4.5', course.featured && 'fill-current')} />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          {published ? (
                            <Button
                              variant="danger"
                              size="sm"
                              icon="eye-off"
                              onClick={() => {
                                setCourseStatus(course.id, 'draft');
                                toast(`“${course.title}” force-unpublished — hidden from the catalog`, 'info');
                              }}
                            >
                              Force unpublish
                            </Button>
                          ) : (
                            <Button
                              variant="secondary"
                              size="sm"
                              icon="eye"
                              onClick={() => {
                                setCourseStatus(course.id, 'published');
                                toast(`“${course.title}” republished to the catalog`);
                              }}
                            >
                              Republish
                            </Button>
                          )}
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
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ADMIN · CATEGORIES
// ─────────────────────────────────────────────────────────────
export function AdminCategoriesPage() {
  const { data, addCategory, renameCategory, deleteCategory, toast } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [editError, setEditError] = useState('');

  const countFor = (id: string) => data.courses.filter((c) => c.categoryId === id).length;

  const submitAdd = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Categories need a name';
    else if (data.categories.some((c) => c.name.toLowerCase() === name.trim().toLowerCase())) next.name = 'A category with this name already exists';
    if (!description.trim()) next.description = 'Add a one-line description';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    addCategory(name, description);
    setName('');
    setDescription('');
    setErrors({});
    toast(`Category “${name.trim()}” created`);
  };

  const submitRename = (id: string) => {
    if (!editDraft.trim()) {
      setEditError('Name can’t be empty');
      return;
    }
    renameCategory(id, editDraft);
    setEditingId(null);
    setEditError('');
    toast('Category renamed');
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <PageHeader title="Categories" subtitle="Add, rename or delete catalog categories. Deletion is blocked while courses use a category." />

      {/* add form */}
      <div className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-900/5 sm:p-7">
        <h2 className="font-bold text-slate-900">Add a category</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1.4fr_auto] sm:items-start">
          <Field label="Name" error={errors.name}>
            <TextInput value={name} onChange={(e) => setName(e.target.value)} invalid={Boolean(errors.name)} placeholder="e.g. Data Science" onKeyDown={(e) => e.key === 'Enter' && submitAdd()} />
          </Field>
          <Field label="Description" error={errors.description}>
            <TextInput value={description} onChange={(e) => setDescription(e.target.value)} invalid={Boolean(errors.description)} placeholder="One friendly line about the topic" onKeyDown={(e) => e.key === 'Enter' && submitAdd()} />
          </Field>
          <div className="sm:pt-7">
            <Button icon="plus" className="w-full sm:w-auto" onClick={submitAdd}>Add</Button>
          </div>
        </div>
      </div>

      {/* list */}
      <div className="mt-6 space-y-3">
        {data.categories.length === 0 && (
          <EmptyState icon="tag" title="No categories yet" description="Add your first category above so teachers can file their courses." />
        )}
        {data.categories.map((cat) => {
          const count = countFor(cat.id);
          const editing = editingId === cat.id;
          return (
            <div key={cat.id} className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-900/5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Icon name={cat.icon} className="h-5.5 w-5.5" />
              </span>
              <div className="min-w-0 flex-1">
                {editing ? (
                  <div className="animate-fade-in">
                    <div className="flex flex-wrap items-center gap-2">
                      <TextInput
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        invalid={Boolean(editError)}
                        autoFocus
                        className="max-w-xs py-2"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') submitRename(cat.id);
                          if (e.key === 'Escape') { setEditingId(null); setEditError(''); }
                        }}
                      />
                      <Button size="sm" icon="check" onClick={() => submitRename(cat.id)}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingId(null); setEditError(''); }}>Cancel</Button>
                    </div>
                    {editError && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-600">
                        <Icon name="alert" className="h-3.5 w-3.5" /> {editError}
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <p className="flex flex-wrap items-center gap-2.5 font-bold text-slate-900">
                      {cat.name}
                      <Badge tone={count > 0 ? 'indigo' : 'slate'}>{count} course{count === 1 ? '' : 's'}</Badge>
                    </p>
                    <p className="mt-0.5 truncate text-sm text-slate-400">{cat.description}</p>
                  </>
                )}
              </div>
              {!editing && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="pencil"
                    onClick={() => {
                      setEditingId(cat.id);
                      setEditDraft(cat.name);
                      setEditError('');
                    }}
                  >
                    Rename
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon="trash"
                    onClick={() => {
                      const result = deleteCategory(cat.id);
                      if (!result.ok) {
                        toast(`Can’t delete “${cat.name}” — ${result.reason}. Move or delete those courses first.`, 'error');
                      } else {
                        toast(`Category “${cat.name}” deleted`, 'info');
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-slate-400">
        <Icon name="info" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Tip: categories that still contain courses can’t be deleted — create a new empty one to try the delete flow.
      </p>
    </div>
  );
}
