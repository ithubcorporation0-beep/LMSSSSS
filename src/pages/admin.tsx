import { useState } from 'react';
import type { Role } from '../types';
import { useApp } from '../store';
import { cn, fmtDateShort, timeAgo } from '../lib';
import { Avatar, Badge, Button, EmptyState, Field, Icon, PageHeader, Select, StatCard, TextInput } from '../components/ui';

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
  const { data, setUserRole, addUser, deleteUser, toast } = useApp();
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<typeof data.users[number] | null>(null);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newHeadline, setNewHeadline] = useState('');
  const [newRole, setNewRole] = useState<Role>('student');
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});

  const q = query.trim().toLowerCase();
  const rows = [...data.users]
    .filter((u) => roleFilter === 'all' || u.role === roleFilter)
    .filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!newName.trim()) errors.name = 'Name is required';
    if (!newEmail.trim() || !newEmail.includes('@')) errors.email = 'Valid email is required';
    else if (data.users.some((u) => u.email.toLowerCase() === newEmail.trim().toLowerCase())) errors.email = 'Email already in use';
    if (!newHeadline.trim()) errors.headline = 'Headline is required';

    setAddErrors(errors);
    if (Object.keys(errors).length > 0) return;

    addUser({
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      headline: newHeadline.trim(),
      role: newRole,
    });
    toast(`User "${newName.trim()}" added successfully`, 'success');
    setAddModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewHeadline('');
    setNewRole('student');
    setAddErrors({});
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader
        title="Users"
        subtitle="Every account on the platform. Change roles or create new users — updates instantly."
        actions={
          <Button icon="plus" onClick={() => setAddModalOpen(true)}>
            Add user
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[260px] flex-1 max-w-md">
          <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email…"
            aria-label="Search users"
            className="w-full rounded-2xl bg-white py-3 pl-11 pr-4 text-sm font-medium shadow-soft ring-1 ring-slate-900/5 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'student', 'teacher', 'admin'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={cn(
                'rounded-xl px-3.5 py-2 text-xs font-bold capitalize transition',
                roleFilter === r ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
              )}
            >
              {r === 'all' ? `All (${data.users.length})` : `${r}s (${data.users.filter((u) => u.role === r).length})`}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon="users"
          title="No users match that search"
          description="Try a different name, clear filters, or add a new user."
          action={<Button variant="secondary" onClick={() => { setQuery(''); setRoleFilter('all'); }}>Clear filters</Button>}
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
                  <th className="px-6 py-4 text-right">Actions</th>
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
                    <td className="px-6 py-4 text-right">
                      {!DEMO_NOTES[u.id] && (
                        <button
                          onClick={() => setDeleteTarget(u)}
                          aria-label={`Delete ${u.name}`}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Icon name="trash" className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add user">
        <form onSubmit={handleAddSubmit} className="space-y-4 p-6">
          <Field label="Full name" error={addErrors.name}>
            <TextInput value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Jordan Lee" invalid={Boolean(addErrors.name)} autoFocus />
          </Field>
          <Field label="Email address" error={addErrors.email}>
            <TextInput value={newEmail} onChange={(e) => setNewEmail(e.target.value)} type="email" placeholder="jordan@example.com" invalid={Boolean(addErrors.email)} />
          </Field>
          <Field label="Headline" error={addErrors.headline}>
            <TextInput value={newHeadline} onChange={(e) => setNewHeadline(e.target.value)} placeholder="e.g. Cloud Architect · Dev Advocate" invalid={Boolean(addErrors.headline)} />
          </Field>
          <Field label="Role">
            <Select value={newRole} onChange={(e) => setNewRole(e.target.value as Role)}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </Select>
          </Field>
          <div className="flex gap-3 pt-2">
            <Button className="flex-1" icon="plus" type="submit">Create user</Button>
            <Button variant="ghost" onClick={() => setAddModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Delete User Confirmation */}
      <Modal open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        {deleteTarget && (
          <div className="p-6">
            <div className="flex items-center gap-3 text-rose-600">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <Icon name="alert" className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-bold text-slate-900">Delete user “{deleteTarget.name}”?</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Are you sure you want to remove this account? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button
                className="bg-rose-600 hover:bg-rose-700 shadow-rose-600/25 text-white"
                icon="trash"
                onClick={() => {
                  const res = deleteUser(deleteTarget.id);
                  if (!res.ok) {
                    toast(res.reason ?? 'Cannot delete user', 'error');
                  } else {
                    toast(`User deleted`, 'info');
                    setDeleteTarget(null);
                  }
                }}
              >
                Delete user
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ADMIN · COURSES
// ─────────────────────────────────────────────────────────────
export function AdminCoursesPage() {
  const { data, enrolledCount, setCourseStatus, toggleFeatured, deleteCourse, toast, navigate } = useApp();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [deleteCourseTarget, setDeleteCourseTarget] = useState<Course | null>(null);

  const q = query.trim().toLowerCase();
  const rows = [...data.courses]
    .filter((c) => statusFilter === 'all' || c.status === statusFilter)
    .filter((c) => !q || c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader title="Courses" subtitle="Every course on the platform — moderate status, homepage placement and deletion." />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[260px] flex-1 max-w-md">
          <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses…"
            aria-label="Search courses"
            className="w-full rounded-2xl bg-white py-3 pl-11 pr-4 text-sm font-medium shadow-soft ring-1 ring-slate-900/5 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'published', 'draft'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'rounded-xl px-3.5 py-2 text-xs font-bold capitalize transition',
                statusFilter === s ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
              )}
            >
              {s === 'all' ? `All (${data.courses.length})` : `${s} (${data.courses.filter((c) => c.status === s).length})`}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon="book-open" title="No courses match your filter" description="When teachers publish courses or draft them, they will appear here." />
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
                          <span className="max-w-[140px] truncate">{teacher?.name ?? 'Instructor'}</span>
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
                        <div className="flex justify-end items-center gap-1.5">
                          {published ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              icon="eye-off"
                              onClick={() => {
                                setCourseStatus(course.id, 'draft');
                                toast(`“${course.title}” force-unpublished — hidden from the catalog`, 'info');
                              }}
                            >
                              Unpublish
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
                              Publish
                            </Button>
                          )}
                          <button
                            onClick={() => setDeleteCourseTarget(course)}
                            aria-label={`Delete ${course.title}`}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
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

      {/* Delete Course Modal */}
      <Modal open={Boolean(deleteCourseTarget)} onClose={() => setDeleteCourseTarget(null)}>
        {deleteCourseTarget && (
          <div className="p-6">
            <div className="flex items-center gap-3 text-rose-600">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <Icon name="alert" className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-bold text-slate-900">Delete “{deleteCourseTarget.title}”?</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Admin action: This will permanently delete the course, all its chapters, and student completion records across the platform.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setDeleteCourseTarget(null)}>Cancel</Button>
              <Button
                className="bg-rose-600 hover:bg-rose-700 shadow-rose-600/25 text-white"
                icon="trash"
                onClick={() => {
                  deleteCourse(deleteCourseTarget.id);
                  setDeleteCourseTarget(null);
                  toast(`Course "${deleteCourseTarget.title}" deleted`, 'info');
                }}
              >
                Delete course
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ADMIN · CATEGORIES
// ─────────────────────────────────────────────────────────────
export function AdminCategoriesPage() {
  const { data, addCategory, renameCategory, updateCategory, deleteCategory, toast } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState<Parameters<typeof Icon>[0]['name']>('shapes');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [editIcon, setEditIcon] = useState<Parameters<typeof Icon>[0]['name']>('tag');
  const [editError, setEditError] = useState('');

  const countFor = (id: string) => data.courses.filter((c) => c.categoryId === id).length;

  const submitAdd = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Categories need a name';
    else if (data.categories.some((c) => c.name.toLowerCase() === name.trim().toLowerCase())) next.name = 'A category with this name already exists';
    if (!description.trim()) next.description = 'Add a one-line description';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    addCategory(name, description, icon);
    setName('');
    setDescription('');
    setIcon('shapes');
    setErrors({});
    toast(`Category “${name.trim()}” created`);
  };

  const submitRename = (id: string) => {
    if (!editDraft.trim()) {
      setEditError('Name can’t be empty');
      return;
    }
    updateCategory(id, { name: editDraft.trim(), icon: editIcon });
    setEditingId(null);
    setEditError('');
    toast('Category updated');
  };

  const availableIcons: Parameters<typeof Icon>[0]['name'][] = ['code', 'shapes', 'briefcase', 'megaphone', 'camera', 'tag', 'book-open', 'award', 'layers'];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <PageHeader title="Categories" subtitle="Add, rename or delete catalog categories with custom icons. Deletion is blocked while courses use a category." />

      {/* add form */}
      <div className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-900/5 sm:p-7">
        <h2 className="font-bold text-slate-900">Add a category</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_120px_auto] sm:items-start">
          <Field label="Name" error={errors.name}>
            <TextInput value={name} onChange={(e) => setName(e.target.value)} invalid={Boolean(errors.name)} placeholder="e.g. Data Science" onKeyDown={(e) => e.key === 'Enter' && submitAdd()} />
          </Field>
          <Field label="Description" error={errors.description}>
            <TextInput value={description} onChange={(e) => setDescription(e.target.value)} invalid={Boolean(errors.description)} placeholder="One friendly line about the topic" onKeyDown={(e) => e.key === 'Enter' && submitAdd()} />
          </Field>
          <Field label="Icon">
            <Select value={icon} onChange={(e) => setIcon(e.target.value as Parameters<typeof Icon>[0]['name'])}>
              {availableIcons.map((ic) => (
                <option key={ic} value={ic}>{ic}</option>
              ))}
            </Select>
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
                <Icon name={editing ? editIcon : cat.icon} className="h-5.5 w-5.5" />
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
                      <Select value={editIcon} onChange={(e) => setEditIcon(e.target.value as Parameters<typeof Icon>[0]['name'])} className="w-32 py-2 text-xs">
                        {availableIcons.map((ic) => (
                          <option key={ic} value={ic}>{ic}</option>
                        ))}
                      </Select>
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
                      setEditIcon(cat.icon);
                      setEditError('');
                    }}
                  >
                    Edit
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
