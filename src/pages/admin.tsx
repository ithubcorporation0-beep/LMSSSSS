import { useState } from 'react';
import type { Course, Role } from '../types';
import { useApp } from '../store';
import { cn, fmtDateShort, timeAgo } from '../lib';
import { Avatar, Badge, Button, EmptyState, Field, Icon, Modal, PageHeader, Select, StatCard, TextInput } from '../components/ui';
import { AuthRequiredGate } from './student';

// ─────────────────────────────────────────────────────────────
// ADMIN · OVERVIEW
// ─────────────────────────────────────────────────────────────
export function AdminOverviewPage() {
  const { data, currentUser, navigate } = useApp();

  if (!currentUser || currentUser.role !== 'admin') {
    return <AuthRequiredGate title="Admin Console Access Required" description="Sign in as an administrator (admin@eduflow.io / demo123) to view platform controls and moderation tools." />;
  }

  const students = data.users.filter((u) => u.role === 'student').length;
  const teachers = data.users.filter((u) => u.role === 'teacher').length;
  const admins = data.users.filter((u) => u.role === 'admin').length;
  const published = data.courses.filter((c) => c.status === 'published').length;
  const drafts = data.courses.length - published;

  const newest = [...data.users].sort((a, b) => b.joinedAt.localeCompare(a.joinedAt)).slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader title="Platform Overview &amp; Control Console" subtitle="System metrics, course moderation, user accounts, and catalog health." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard icon="user" label="Active Students" value={students} tint="emerald" sub="Registered learners taking courses." />
        <StatCard icon="grad-cap" label="Instructors" value={teachers} tint="indigo" sub="Course creators &amp; educators." />
        <StatCard icon="book-open" label="Courses" value={data.courses.length} tint="sky" sub={`${published} published live &middot; ${drafts} in drafting.`} />
        <StatCard icon="trending-up" label="Total Enrolments" value={data.enrolments.length} tint="violet" sub="Course access records." />
        <StatCard icon="award" label="Certificates Issued" value={data.certificates.length} tint="amber" sub="Verified course completions." />
        <StatCard icon="tag" label="Skill Categories" value={data.categories.length} tint="rose" sub="Catalog taxonomy tags." />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* Newest User Sign-ups */}
        <section className="rounded-2xl bg-white shadow-soft ring-1 ring-slate-900/5">
          <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="font-bold text-slate-900">Newest Platform Users</h2>
            <Button variant="ghost" size="sm" iconRight="arrow-right" onClick={() => navigate({ page: 'a-users' })}>Manage All</Button>
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

        {/* Moderation Shortcuts & Health */}
        <section className="grid content-start gap-5">
          <div className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-900/5">
            <h2 className="font-bold text-slate-900">Administration Tools</h2>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
              <Button variant="secondary" icon="layers" onClick={() => navigate({ page: 'a-courses' })}>Courses</Button>
              <Button variant="secondary" icon="users" onClick={() => navigate({ page: 'a-users' })}>Users</Button>
              <Button variant="secondary" icon="tag" onClick={() => navigate({ page: 'a-cats' })}>Categories</Button>
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-lift">
            <h3 className="flex items-center gap-2 font-extrabold text-sm"><Icon name="shield" className="h-5 w-5 text-emerald-400" /> Platform Security &amp; Data Integrity</h3>
            <ul className="mt-3 space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2"><Icon name="check-circle" className="h-4 w-4 text-emerald-400" /> All curriculum videos verified and active</li>
              <li className="flex items-center gap-2"><Icon name="check-circle" className="h-4 w-4 text-emerald-400" /> Local storage database engine operational</li>
              <li className="flex items-center gap-2"><Icon name="check-circle" className="h-4 w-4 text-emerald-400" /> Cryptographic certificates hash signing online</li>
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
  const { data, currentUser, setUserRole, addUser, deleteUser, toast } = useApp();
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<typeof data.users[number] | null>(null);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newHeadline, setNewHeadline] = useState('');
  const [newRole, setNewRole] = useState<Role>('student');
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});

  if (!currentUser || currentUser.role !== 'admin') {
    return <AuthRequiredGate title="Admin Access Required" description="Sign in as an administrator (admin@eduflow.io / demo123) to manage users." />;
  }

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
    toast(`User "${newName.trim()}" created successfully`);
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
        title="User Management"
        subtitle="Manage learner, instructor, and admin accounts across the platform."
        actions={
          <Button icon="plus" onClick={() => setAddModalOpen(true)}>
            Add User
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[260px] flex-1 max-w-md">
          <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
                          <p className="truncate font-bold text-slate-900">{u.name}</p>
                          <p className="truncate text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="max-w-[220px] truncate px-6 py-4 text-slate-500 text-xs">{u.headline}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{fmtDateShort(u.joinedAt)}</td>
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
                        <option value="teacher">Instructor</option>
                        <option value="admin">Admin</option>
                      </Select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setDeleteTarget(u)}
                        aria-label={`Delete ${u.name}`}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                      >
                        <Icon name="trash" className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Create User Account">
        <form onSubmit={handleAddSubmit} className="space-y-4 p-6">
          <Field label="Full Name" error={addErrors.name}>
            <TextInput value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Jordan Lee" invalid={Boolean(addErrors.name)} autoFocus />
          </Field>
          <Field label="Email Address" error={addErrors.email}>
            <TextInput value={newEmail} onChange={(e) => setNewEmail(e.target.value)} type="email" placeholder="jordan@example.com" invalid={Boolean(addErrors.email)} />
          </Field>
          <Field label="Headline" error={addErrors.headline}>
            <TextInput value={newHeadline} onChange={(e) => setNewHeadline(e.target.value)} placeholder="e.g. Cloud Architect · Dev Advocate" invalid={Boolean(addErrors.headline)} />
          </Field>
          <Field label="Role">
            <Select value={newRole} onChange={(e) => setNewRole(e.target.value as Role)}>
              <option value="student">Student</option>
              <option value="teacher">Instructor</option>
              <option value="admin">Admin</option>
            </Select>
          </Field>
          <div className="flex gap-3 pt-2">
            <Button className="flex-1" icon="plus" type="submit">Create User</Button>
            <Button variant="ghost" onClick={() => setAddModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Delete User Confirmation */}
      <Modal open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        {deleteTarget && (
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-900">Delete User “{deleteTarget.name}”?</h3>
            <p className="mt-2 text-sm text-slate-500">
              Are you sure you want to remove this account? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button
                className="bg-rose-600 hover:bg-rose-700 text-white"
                icon="trash"
                onClick={() => {
                  const res = deleteUser(deleteTarget.id);
                  if (!res.ok) {
                    toast(res.reason ?? 'Cannot delete user', 'error');
                  } else {
                    toast('User deleted', 'info');
                    setDeleteTarget(null);
                  }
                }}
              >
                Delete User
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
  const { data, currentUser, enrolledCount, setCourseStatus, toggleFeatured, deleteCourse, toast, navigate } = useApp();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [deleteCourseTarget, setDeleteCourseTarget] = useState<Course | null>(null);

  if (!currentUser || currentUser.role !== 'admin') {
    return <AuthRequiredGate title="Admin Access Required" description="Sign in as an administrator (admin@eduflow.io / demo123) to moderate courses." />;
  }

  const q = query.trim().toLowerCase();
  const rows = [...data.courses]
    .filter((c) => statusFilter === 'all' || c.status === statusFilter)
    .filter((c) => !q || c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader title="Course Moderation" subtitle="Review, feature, publish or moderate courses across all instructors." />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[260px] flex-1 max-w-md">
          <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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

      <div className="overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-900/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Instructor</th>
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
                          <img src={course.coverImage} alt="" className="h-11 w-18 shrink-0 rounded-lg object-cover" />
                        ) : (
                          <span className="flex h-11 w-18 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-300">
                            <Icon name="image" className="h-5 w-5" />
                          </span>
                        )}
                        <div className="min-w-0">
                          <button onClick={() => navigate({ page: 'course', id: course.id })} className="block max-w-[260px] truncate text-left font-bold text-slate-900 hover:text-indigo-600">
                            {course.title}
                          </button>
                          <p className="mt-0.5 text-xs text-slate-400">{category?.name ?? 'No category'} &middot; {course.level}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 font-semibold text-slate-700 text-xs">
                        <Avatar name={teacher?.name ?? 'Instructor'} size="xs" />
                        <span className="max-w-[140px] truncate">{teacher?.name ?? 'Instructor'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">{published ? <Badge tone="emerald" icon="eye">Published</Badge> : <Badge tone="amber" icon="pencil">Draft</Badge>}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{enrolledCount(course.id)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          toggleFeatured(course.id);
                          toast(course.featured ? `Unfeatured “${course.title}”` : `“${course.title}” featured on homepage`);
                        }}
                        className={cn(
                          'rounded-xl p-2 transition',
                          course.featured ? 'bg-amber-50 text-amber-500' : 'text-slate-300 hover:bg-slate-100 hover:text-amber-500',
                        )}
                      >
                        <Icon name="star" className={cn('h-4 w-4', course.featured && 'fill-current')} />
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
                              toast(`“${course.title}” unpublished`, 'info');
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
                              toast(`“${course.title}” published to catalog`);
                            }}
                          >
                            Publish
                          </Button>
                        )}
                        <button
                          onClick={() => setDeleteCourseTarget(course)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
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

      {/* Delete Course Modal */}
      <Modal open={Boolean(deleteCourseTarget)} onClose={() => setDeleteCourseTarget(null)}>
        {deleteCourseTarget && (
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-900">Delete “{deleteCourseTarget.title}”?</h3>
            <p className="mt-2 text-sm text-slate-500">
              Admin action: This will permanently delete the course, chapters, and student progress records.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setDeleteCourseTarget(null)}>Cancel</Button>
              <Button
                className="bg-rose-600 hover:bg-rose-700 text-white"
                icon="trash"
                onClick={() => {
                  deleteCourse(deleteCourseTarget.id);
                  setDeleteCourseTarget(null);
                  toast(`Course "${deleteCourseTarget.title}" deleted`, 'info');
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

// ─────────────────────────────────────────────────────────────
// ADMIN · CATEGORIES
// ─────────────────────────────────────────────────────────────
export function AdminCategoriesPage() {
  const { data, currentUser, addCategory, updateCategory, deleteCategory, toast } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState<Parameters<typeof Icon>[0]['name']>('shapes');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');

  if (!currentUser || currentUser.role !== 'admin') {
    return <AuthRequiredGate title="Admin Access Required" description="Sign in as an administrator (admin@eduflow.io / demo123) to manage categories." />;
  }

  const submitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addCategory(name.trim(), description.trim(), icon);
    setName('');
    setDescription('');
    setIcon('shapes');
    toast(`Category “${name.trim()}” created`);
  };

  const submitRename = (id: string) => {
    if (!editDraft.trim()) return;
    updateCategory(id, { name: editDraft.trim() });
    setEditingId(null);
    toast('Category updated');
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <PageHeader title="Course Categories" subtitle="Manage catalog taxonomy and skill track groupings." />

      {/* Add Form */}
      <form onSubmit={submitAdd} className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-900/5 space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Add New Category</h3>
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_140px_auto]">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Category Name" required />
          <TextInput value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short Description" />
          <Select value={icon} onChange={(e) => setIcon(e.target.value as any)}>
            {['code', 'shapes', 'briefcase', 'megaphone', 'camera', 'tag', 'book-open', 'award', 'layers'].map((ic) => (
              <option key={ic} value={ic}>{ic}</option>
            ))}
          </Select>
          <Button icon="plus" type="submit">Add Category</Button>
        </div>
      </form>

      {/* Categories List */}
      <div className="mt-6 space-y-3">
        {data.categories.map((cat) => {
          const count = data.courses.filter((c) => c.categoryId === cat.id).length;
          const editing = editingId === cat.id;
          return (
            <div key={cat.id} className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-900/5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Icon name={cat.icon} className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                {editing ? (
                  <div className="flex items-center gap-2">
                    <TextInput value={editDraft} onChange={(e) => setEditDraft(e.target.value)} className="py-1.5 text-xs max-w-xs" autoFocus />
                    <Button size="sm" icon="check" onClick={() => submitRename(cat.id)}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 text-sm">{cat.name}</p>
                      <Badge tone={count > 0 ? 'indigo' : 'slate'} className="text-[10px]">{count} course{count === 1 ? '' : 's'}</Badge>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{cat.description}</p>
                  </div>
                )}
              </div>
              {!editing && (
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" icon="pencil" onClick={() => { setEditingId(cat.id); setEditDraft(cat.name); }}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    icon="trash"
                    onClick={() => {
                      const res = deleteCategory(cat.id);
                      if (!res.ok) toast(res.reason ?? 'Cannot delete', 'error');
                      else toast('Category deleted', 'info');
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
    </div>
  );
}
