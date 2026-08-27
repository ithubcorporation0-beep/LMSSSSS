import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { AppData, Category, CategoryIcon, Certificate, Chapter, Course, CourseStatus, Level, Role, Route, Toast, ToastKind, User } from './types';
import { buildSeedData, DEMO_ADMIN_ID, DEMO_STUDENT_ID, DEMO_TEACHER_ID } from './data/seed';
import { makeCode, nowISO, uid } from './lib';

const STORAGE_KEY = 'eduflow-state-v2';

interface PersistedShape {
  v: number;
  role: Role;
  route: Route;
  data: AppData;
}

function loadPersisted(): PersistedShape {
  const fallback: PersistedShape = { v: 2, role: 'student', route: { page: 'home' }, data: buildSeedData() };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PersistedShape>;
    if (parsed.v !== 2 || !parsed.data) return fallback;
    const d = parsed.data;
    if (!Array.isArray(d.categories) || !Array.isArray(d.courses) || !Array.isArray(d.users) || !Array.isArray(d.enrolments) || !Array.isArray(d.certificates)) {
      return fallback;
    }
    return {
      v: 2,
      role: parsed.role === 'teacher' || parsed.role === 'admin' ? parsed.role : 'student',
      route: parsed.route ?? { page: 'home' },
      data: d,
    };
  } catch {
    return fallback;
  }
}

export interface CourseDraftInput {
  title: string;
  description: string;
  categoryId: string;
  level: Level;
  coverImage?: string;
  whatYouLearn?: string[];
}

export interface UserDraftInput {
  name: string;
  email: string;
  role: Role;
  headline: string;
  bio?: string;
}

interface AppContextValue {
  data: AppData;
  role: Role;
  route: Route;
  currentUser: User;
  toasts: Toast[];

  navigate: (route: Route) => void;
  switchRole: (role: Role) => void;
  toast: (message: string, kind?: ToastKind) => void;
  dismissToast: (id: number) => void;

  enrolmentFor: (courseId: string, studentId?: string) => AppData['enrolments'][number] | undefined;
  certificateFor: (courseId: string, studentId?: string) => Certificate | undefined;
  enrolledCount: (courseId: string) => number;

  enrol: (courseId: string, asStudentId?: string) => void;
  completeChapter: (courseId: string, chapterId: string) => void;
  touchCourse: (courseId: string) => void;
  issueCertificate: (courseId: string) => Certificate;

  addCourse: (input: CourseDraftInput, teacherId: string) => Course;
  updateCourse: (courseId: string, patch: Partial<Course>) => void;
  deleteCourse: (courseId: string) => void;
  setCourseStatus: (courseId: string, status: CourseStatus) => void;
  toggleFeatured: (courseId: string) => void;
  addChapter: (courseId: string, input: Omit<Chapter, 'id'>) => void;
  updateChapter: (courseId: string, chapterId: string, patch: Partial<Chapter>) => void;
  deleteChapter: (courseId: string, chapterId: string) => void;
  moveChapter: (courseId: string, from: number, to: number) => void;
  addWhatYouLearn: (courseId: string, item: string) => void;
  updateWhatYouLearn: (courseId: string, index: number, item: string) => void;
  deleteWhatYouLearn: (courseId: string, index: number) => void;

  addUser: (input: UserDraftInput) => User;
  deleteUser: (userId: string) => { ok: boolean; reason?: string };
  setUserRole: (userId: string, role: Role) => void;

  addCategory: (name: string, description: string, icon?: CategoryIcon) => Category;
  renameCategory: (categoryId: string, name: string) => void;
  updateCategory: (categoryId: string, patch: Partial<Category>) => void;
  deleteCategory: (categoryId: string) => { ok: boolean; reason?: string };

  resetDemo: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const ROLE_HOME: Record<Role, Route> = {
  student: { page: 's-dash' },
  teacher: { page: 't-dash' },
  admin: { page: 'a-dash' },
};

export function AppProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(loadPersisted, []);
  const [data, setData] = useState<AppData>(initial.data);
  const [role, setRole] = useState<Role>(initial.role);
  const [route, setRoute] = useState<Route>(initial.route);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  // persist everything; reset works with a plain state change — no reload needed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 2, role, route, data }));
    } catch {
      /* storage unavailable — demo still works in memory */
    }
  }, [data, role, route]);

  const toast = useCallback((message: string, kind: ToastKind = 'success') => {
    toastId.current += 1;
    const id = toastId.current;
    setToasts((t) => [...t.slice(-3), { id, kind, message }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const navigate = useCallback((next: Route) => {
    setRoute(next);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const switchRole = useCallback(
    (next: Role) => {
      setRole(next);
      setRoute(ROLE_HOME[next]);
      window.scrollTo({ top: 0 });
    },
    [],
  );

  const currentUser = useMemo<User>(() => {
    const id = role === 'student' ? DEMO_STUDENT_ID : role === 'teacher' ? DEMO_TEACHER_ID : DEMO_ADMIN_ID;
    return data.users.find((u) => u.id === id) ?? data.users[0];
  }, [data.users, role]);

  const enrolmentFor = useCallback(
    (courseId: string, studentId?: string) => {
      const sid = studentId ?? currentUser.id;
      return data.enrolments.find((e) => e.courseId === courseId && e.studentId === sid);
    },
    [data.enrolments, currentUser.id],
  );

  const certificateFor = useCallback(
    (courseId: string, studentId?: string) => {
      const sid = studentId ?? currentUser.id;
      return data.certificates.find((c) => c.courseId === courseId && c.studentId === sid);
    },
    [data.certificates, currentUser.id],
  );

  const enrolledCount = useCallback(
    (courseId: string) => data.enrolments.filter((e) => e.courseId === courseId).length,
    [data.enrolments],
  );

  // ── student actions ────────────────────────────────────────
  const enrol = useCallback(
    (courseId: string, asStudentId?: string) => {
      const sid = asStudentId ?? currentUser.id;
      setData((d) => {
        if (d.enrolments.some((e) => e.courseId === courseId && e.studentId === sid)) return d;
        const enrolment = {
          id: uid('e'),
          studentId: sid,
          courseId,
          enrolledAt: nowISO(),
          lastAccessedAt: nowISO(),
          completedChapterIds: [] as string[],
        };
        return { ...d, enrolments: [...d.enrolments, enrolment] };
      });
    },
    [currentUser.id],
  );

  const touchCourse = useCallback(
    (courseId: string) => {
      setData((d) => ({
        ...d,
        enrolments: d.enrolments.map((e) =>
          e.courseId === courseId && e.studentId === currentUser.id ? { ...e, lastAccessedAt: nowISO() } : e,
        ),
      }));
    },
    [currentUser.id],
  );

  const completeChapter = useCallback(
    (courseId: string, chapterId: string) => {
      setData((d) => ({
        ...d,
        enrolments: d.enrolments.map((e) => {
          if (e.courseId !== courseId || e.studentId !== currentUser.id) return e;
          if (e.completedChapterIds.includes(chapterId)) return { ...e, lastAccessedAt: nowISO() };
          return { ...e, completedChapterIds: [...e.completedChapterIds, chapterId], lastAccessedAt: nowISO() };
        }),
      }));
    },
    [currentUser.id],
  );

  const issueCertificate = useCallback(
    (courseId: string) => {
      let issued: Certificate | undefined;
      setData((d) => {
        const existing = d.certificates.find((c) => c.courseId === courseId && c.studentId === currentUser.id);
        if (existing) {
          issued = existing;
          return d;
        }
        issued = { id: uid('cert'), studentId: currentUser.id, courseId, issuedAt: nowISO(), code: makeCode(currentUser.id, courseId) };
        return { ...d, certificates: [...d.certificates, issued] };
      });
      return issued!;
    },
    [currentUser.id],
  );

  // ── teacher actions ────────────────────────────────────────
  const addCourse = useCallback((input: CourseDraftInput, teacherId: string) => {
    const course: Course = {
      id: uid('c'),
      title: input.title.trim(),
      description: input.description.trim(),
      longDescription: input.description.trim(),
      categoryId: input.categoryId,
      level: input.level,
      coverImage: input.coverImage ?? '',
      teacherId,
      status: 'draft',
      featured: false,
      createdAt: nowISO(),
      chapters: [],
      whatYouLearn: input.whatYouLearn ?? [],
    };
    setData((d) => ({ ...d, courses: [...d.courses, course] }));
    return course;
  }, []);

  const updateCourse = useCallback((courseId: string, patch: Partial<Course>) => {
    setData((d) => ({ ...d, courses: d.courses.map((c) => (c.id === courseId ? { ...c, ...patch } : c)) }));
  }, []);

  const deleteCourse = useCallback((courseId: string) => {
    setData((d) => ({
      ...d,
      courses: d.courses.filter((c) => c.id !== courseId),
      enrolments: d.enrolments.filter((e) => e.courseId !== courseId),
      certificates: d.certificates.filter((c) => c.courseId !== courseId),
    }));
  }, []);

  const setCourseStatus = useCallback((courseId: string, status: CourseStatus) => {
    setData((d) => ({ ...d, courses: d.courses.map((c) => (c.id === courseId ? { ...c, status } : c)) }));
  }, []);

  const toggleFeatured = useCallback((courseId: string) => {
    setData((d) => ({ ...d, courses: d.courses.map((c) => (c.id === courseId ? { ...c, featured: !c.featured } : c)) }));
  }, []);

  const addChapter = useCallback((courseId: string, input: Omit<Chapter, 'id'>) => {
    setData((d) => ({
      ...d,
      courses: d.courses.map((c) => (c.id === courseId ? { ...c, chapters: [...c.chapters, { ...input, id: uid('ch') }] } : c)),
    }));
  }, []);

  const updateChapter = useCallback((courseId: string, chapterId: string, patch: Partial<Chapter>) => {
    setData((d) => ({
      ...d,
      courses: d.courses.map((c) =>
        c.id === courseId ? { ...c, chapters: c.chapters.map((chap) => (chap.id === chapterId ? { ...chap, ...patch } : chap)) } : c,
      ),
    }));
  }, []);

  const deleteChapter = useCallback((courseId: string, chapterId: string) => {
    setData((d) => ({
      ...d,
      courses: d.courses.map((c) => (c.id === courseId ? { ...c, chapters: c.chapters.filter((chap) => chap.id !== chapterId) } : c)),
    }));
  }, []);

  const moveChapter = useCallback((courseId: string, from: number, to: number) => {
    setData((d) => ({
      ...d,
      courses: d.courses.map((c) => {
        if (c.id !== courseId || from === to || from < 0 || to < 0 || from >= c.chapters.length || to >= c.chapters.length) return c;
        const chapters = [...c.chapters];
        const [moved] = chapters.splice(from, 1);
        chapters.splice(to, 0, moved);
        return { ...c, chapters };
      }),
    }));
  }, []);

  const addWhatYouLearn = useCallback((courseId: string, item: string) => {
    const trimmed = item.trim();
    if (!trimmed) return;
    setData((d) => ({
      ...d,
      courses: d.courses.map((c) => (c.id === courseId ? { ...c, whatYouLearn: [...c.whatYouLearn, trimmed] } : c)),
    }));
  }, []);

  const updateWhatYouLearn = useCallback((courseId: string, index: number, item: string) => {
    const trimmed = item.trim();
    if (!trimmed) return;
    setData((d) => ({
      ...d,
      courses: d.courses.map((c) => {
        if (c.id !== courseId) return c;
        const copy = [...c.whatYouLearn];
        copy[index] = trimmed;
        return { ...c, whatYouLearn: copy };
      }),
    }));
  }, []);

  const deleteWhatYouLearn = useCallback((courseId: string, index: number) => {
    setData((d) => ({
      ...d,
      courses: d.courses.map((c) => {
        if (c.id !== courseId) return c;
        return { ...c, whatYouLearn: c.whatYouLearn.filter((_, i) => i !== index) };
      }),
    }));
  }, []);

  // ── admin actions ──────────────────────────────────────────
  const addUser = useCallback((input: UserDraftInput) => {
    const user: User = {
      id: uid('u'),
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      role: input.role,
      headline: input.headline.trim(),
      bio: input.bio?.trim(),
      joinedAt: nowISO(),
    };
    setData((d) => ({ ...d, users: [...d.users, user] }));
    return user;
  }, []);

  const deleteUser = useCallback(
    (userId: string) => {
      if (userId === DEMO_STUDENT_ID || userId === DEMO_TEACHER_ID || userId === DEMO_ADMIN_ID) {
        return { ok: false, reason: 'Core demo personas cannot be deleted' };
      }
      const teachingCourses = data.courses.filter((c) => c.teacherId === userId).length;
      if (teachingCourses > 0) {
        return { ok: false, reason: `This user is instructor of ${teachingCourses} course${teachingCourses === 1 ? '' : 's'}` };
      }
      setData((d) => ({
        ...d,
        users: d.users.filter((u) => u.id !== userId),
        enrolments: d.enrolments.filter((e) => e.studentId !== userId),
        certificates: d.certificates.filter((c) => c.studentId !== userId),
      }));
      return { ok: true };
    },
    [data.courses],
  );

  const setUserRole = useCallback((userId: string, nextRole: Role) => {
    setData((d) => ({ ...d, users: d.users.map((u) => (u.id === userId ? { ...u, role: nextRole } : u)) }));
  }, []);

  const addCategory = useCallback((name: string, description: string, icon: CategoryIcon = 'tag') => {
    const category: Category = { id: uid('cat'), name: name.trim(), description: description.trim(), icon };
    setData((d) => ({ ...d, categories: [...d.categories, category] }));
    return category;
  }, []);

  const renameCategory = useCallback((categoryId: string, name: string) => {
    setData((d) => ({ ...d, categories: d.categories.map((c) => (c.id === categoryId ? { ...c, name: name.trim() } : c)) }));
  }, []);

  const updateCategory = useCallback((categoryId: string, patch: Partial<Category>) => {
    setData((d) => ({
      ...d,
      categories: d.categories.map((c) => (c.id === categoryId ? { ...c, ...patch } : c)),
    }));
  }, []);

  const deleteCategory = useCallback(
    (categoryId: string) => {
      const used = data.courses.filter((c) => c.categoryId === categoryId).length;
      if (used > 0) {
        return { ok: false, reason: `${used} course${used === 1 ? ' is' : 's are'} still using this category` };
      }
      setData((d) => ({ ...d, categories: d.categories.filter((c) => c.id !== categoryId) }));
      return { ok: true };
    },
    [data.courses],
  );

  const resetDemo = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
    setData(buildSeedData());
    setRole('student');
    setRoute({ page: 'home' });
    window.scrollTo({ top: 0 });
    toast('Demo data has been reset to its original state', 'info');
  }, [toast]);

  const value: AppContextValue = {
    data,
    role,
    route,
    currentUser,
    toasts,
    navigate,
    switchRole,
    toast,
    dismissToast,
    enrolmentFor,
    certificateFor,
    enrolledCount,
    enrol,
    completeChapter,
    touchCourse,
    issueCertificate,
    addCourse,
    updateCourse,
    deleteCourse,
    setCourseStatus,
    toggleFeatured,
    addChapter,
    updateChapter,
    deleteChapter,
    moveChapter,
    addWhatYouLearn,
    updateWhatYouLearn,
    deleteWhatYouLearn,
    addUser,
    deleteUser,
    setUserRole,
    addCategory,
    renameCategory,
    updateCategory,
    deleteCategory,
    resetDemo,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
