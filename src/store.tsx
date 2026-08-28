import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type {
  AppData,
  Category,
  CategoryIcon,
  Certificate,
  Chapter,
  ChapterQuiz,
  ChapterResource,
  Course,
  CourseReview,
  CourseStatus,
  DiscussionQuestion,
  Level,
  Role,
  Route,
  StudentNote,
  Toast,
  ToastKind,
  User,
  VideoType,
} from './types';
import { buildSeedData, DEMO_ADMIN_ID, DEMO_STUDENT_ID, DEMO_TEACHER_ID } from './data/seed';
import { makeCode, nowISO, uid } from './lib';

const STORAGE_KEY = 'eduflow-prod-state-v5';

interface PersistedShape {
  v: number;
  activeUserId: string | null;
  route: Route;
  data: AppData;
}

function loadPersisted(): PersistedShape {
  const seed = buildSeedData();
  const fallback: PersistedShape = { v: 5, activeUserId: null, route: { page: 'home' }, data: seed };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PersistedShape>;
    if (parsed.v !== 5 || !parsed.data) return fallback;
    const d = parsed.data;
    if (!Array.isArray(d.categories) || !Array.isArray(d.courses) || !Array.isArray(d.users) || !Array.isArray(d.enrolments) || !Array.isArray(d.certificates)) {
      return fallback;
    }
    return {
      v: 5,
      activeUserId: parsed.activeUserId ?? null,
      route: parsed.route ?? { page: 'home' },
      data: {
        ...d,
        reviews: Array.isArray(d.reviews) ? d.reviews : seed.reviews,
        notes: Array.isArray(d.notes) ? d.notes : seed.notes,
        discussions: Array.isArray(d.discussions) ? d.discussions : seed.discussions,
        wishlist: Array.isArray(d.wishlist) ? d.wishlist : seed.wishlist,
      },
    };
  } catch {
    return fallback;
  }
}

export interface CourseDraftInput {
  title: string;
  description: string;
  longDescription?: string;
  categoryId: string;
  level: Level;
  coverImage?: string;
  whatYouLearn?: string[];
  prerequisites?: string[];
  targetAudience?: string[];
  price?: number;
}

export interface ChapterDraftInput {
  title: string;
  description: string;
  durationMin: number;
  freePreview: boolean;
  videoUrl?: string;
  videoType?: VideoType;
  content?: string;
  resources?: ChapterResource[];
  quiz?: ChapterQuiz;
}

export interface UserDraftInput {
  name: string;
  email: string;
  role: Role;
  headline: string;
  bio?: string;
  avatar?: string;
  password?: string;
}

export interface AppContextValue {
  data: AppData;
  role: Role;
  route: Route;
  currentUser: User | null;
  isAuthenticated: boolean;
  toasts: Toast[];

  authModalOpen: boolean;
  openAuthModal: (intendedCourseId?: string) => void;
  closeAuthModal: () => void;
  requireAuth: (callback?: () => void, intendedCourseId?: string) => boolean;

  navigate: (route: Route) => void;
  switchRole: (role: Role) => void;
  switchActiveUser: (userId: string | null) => void;
  login: (email: string, password?: string) => { ok: boolean; error?: string };
  logout: () => void;
  register: (input: UserDraftInput) => User;
  updateUserProfile: (userId: string, patch: Partial<User>) => void;
  toast: (message: string, kind?: ToastKind) => void;
  dismissToast: (id: number) => void;

  enrolmentFor: (courseId: string, studentId?: string) => AppData['enrolments'][number] | undefined;
  certificateFor: (courseId: string, studentId?: string) => Certificate | undefined;
  enrolledCount: (courseId: string) => number;
  isWishlisted: (courseId: string) => boolean;
  toggleWishlist: (courseId: string) => void;

  enrol: (courseId: string, asStudentId?: string) => boolean;
  completeChapter: (courseId: string, chapterId: string) => void;
  touchCourse: (courseId: string) => void;
  issueCertificate: (courseId: string, studentId?: string) => Certificate | undefined;
  saveQuizScore: (courseId: string, chapterId: string, score: number, total: number) => void;

  // Student Notes
  noteFor: (courseId: string, chapterId: string) => StudentNote | undefined;
  saveStudentNote: (courseId: string, chapterId: string, content: string) => void;

  // Discussions
  discussionsFor: (courseId: string, chapterId: string) => DiscussionQuestion[];
  addDiscussionQuestion: (courseId: string, chapterId: string, text: string) => void;
  addDiscussionReply: (questionId: string, text: string) => void;

  // Reviews
  reviewsFor: (courseId: string) => CourseReview[];
  addCourseReview: (courseId: string, rating: number, comment: string) => boolean;

  // Course Authoring
  addCourse: (input: CourseDraftInput, teacherId: string) => Course;
  updateCourse: (courseId: string, patch: Partial<Course>) => void;
  deleteCourse: (courseId: string) => void;
  setCourseStatus: (courseId: string, status: CourseStatus) => void;
  toggleFeatured: (courseId: string) => void;
  addChapter: (courseId: string, input: ChapterDraftInput) => void;
  updateChapter: (courseId: string, chapterId: string, patch: Partial<Chapter>) => void;
  deleteChapter: (courseId: string, chapterId: string) => void;
  moveChapter: (courseId: string, from: number, to: number) => void;
  addWhatYouLearn: (courseId: string, item: string) => void;
  updateWhatYouLearn: (courseId: string, index: number, item: string) => void;
  deleteWhatYouLearn: (courseId: string, index: number) => void;

  // Admin Actions
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
  const [activeUserId, setActiveUserId] = useState<string | null>(initial.activeUserId);
  const [route, setRoute] = useState<Route>(initial.route);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [intendedCourseId, setIntendedCourseId] = useState<string | undefined>(undefined);
  const toastId = useRef(0);

  const currentUser = useMemo<User | null>(() => {
    if (!activeUserId) return null;
    return data.users.find((u) => u.id === activeUserId) ?? null;
  }, [data.users, activeUserId]);

  const isAuthenticated = currentUser !== null;
  const role: Role = currentUser?.role ?? 'student';

  // Persist state across reloads
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 5, activeUserId, route, data }));
    } catch {
      /* storage unavailable */
    }
  }, [data, activeUserId, route]);

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

  const openAuthModal = useCallback((targetCourseId?: string) => {
    setIntendedCourseId(targetCourseId);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
    setIntendedCourseId(undefined);
  }, []);

  const requireAuth = useCallback(
    (callback?: () => void, targetCourseId?: string): boolean => {
      if (currentUser) {
        if (callback) callback();
        return true;
      }
      openAuthModal(targetCourseId);
      return false;
    },
    [currentUser, openAuthModal],
  );

  const switchRole = useCallback(
    (next: Role) => {
      const matched = data.users.find((u) => u.role === next);
      if (matched) {
        setActiveUserId(matched.id);
      } else if (currentUser) {
        setData((d) => ({
          ...d,
          users: d.users.map((u) => (u.id === currentUser.id ? { ...u, role: next } : u)),
        }));
      } else {
        openAuthModal();
        return;
      }
      setRoute(ROLE_HOME[next]);
      window.scrollTo({ top: 0 });
    },
    [data.users, currentUser, openAuthModal],
  );

  const switchActiveUser = useCallback((userId: string | null) => {
    setActiveUserId(userId);
    if (!userId) {
      setRoute({ page: 'home' });
      return;
    }
    const user = data.users.find((u) => u.id === userId);
    if (user) {
      setRoute(ROLE_HOME[user.role]);
    }
  }, [data.users]);

  const login = useCallback(
    (email: string, password?: string) => {
      const cleanEmail = email.trim().toLowerCase();
      const user = data.users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (!user) {
        return { ok: false, error: 'No account found with this email address.' };
      }
      if (password && user.password && user.password !== password.trim()) {
        return { ok: false, error: 'Incorrect password. Please check your credentials and try again.' };
      }

      setActiveUserId(user.id);
      setAuthModalOpen(false);
      toast(`Signed in as ${user.name}`);

      if (intendedCourseId) {
        setRoute({ page: 's-learn', courseId: intendedCourseId });
        setIntendedCourseId(undefined);
      } else if (route.page === 'home' || route.page === 'catalog') {
        // stay on current page or go to dashboard
      } else {
        setRoute(ROLE_HOME[user.role]);
      }

      return { ok: true };
    },
    [data.users, intendedCourseId, route.page, toast],
  );

  const logout = useCallback(() => {
    setActiveUserId(null);
    setRoute({ page: 'home' });
    toast('Signed out successfully', 'info');
  }, [toast]);

  const register = useCallback(
    (input: UserDraftInput) => {
      const user: User = {
        id: uid('u'),
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        password: input.password?.trim() || 'demo123',
        role: input.role,
        headline: input.headline.trim(),
        bio: input.bio?.trim(),
        avatar: input.avatar?.trim(),
        joinedAt: nowISO(),
      };
      setData((d) => ({ ...d, users: [...d.users, user] }));
      setActiveUserId(user.id);
      setAuthModalOpen(false);
      toast(`Account created! Welcome, ${user.name}.`);

      if (intendedCourseId) {
        setRoute({ page: 's-learn', courseId: intendedCourseId });
        setIntendedCourseId(undefined);
      } else {
        setRoute(ROLE_HOME[user.role]);
      }
      return user;
    },
    [intendedCourseId, toast],
  );

  const updateUserProfile = useCallback((userId: string, patch: Partial<User>) => {
    setData((d) => ({
      ...d,
      users: d.users.map((u) => (u.id === userId ? { ...u, ...patch } : u)),
    }));
  }, []);

  const enrolmentFor = useCallback(
    (courseId: string, studentId?: string) => {
      const sid = studentId ?? currentUser?.id;
      if (!sid) return undefined;
      return data.enrolments.find((e) => e.courseId === courseId && e.studentId === sid);
    },
    [data.enrolments, currentUser],
  );

  const certificateFor = useCallback(
    (courseId: string, studentId?: string) => {
      const sid = studentId ?? currentUser?.id;
      if (!sid) return undefined;
      return data.certificates.find((c) => c.courseId === courseId && c.studentId === sid);
    },
    [data.certificates, currentUser],
  );

  const enrolledCount = useCallback(
    (courseId: string) => data.enrolments.filter((e) => e.courseId === courseId).length,
    [data.enrolments],
  );

  const isWishlisted = useCallback(
    (courseId: string) => {
      if (!currentUser) return false;
      return data.wishlist.some((w) => w.userId === currentUser.id && w.courseId === courseId);
    },
    [data.wishlist, currentUser],
  );

  const toggleWishlist = useCallback(
    (courseId: string) => {
      if (!currentUser) {
        openAuthModal();
        return;
      }
      const existing = data.wishlist.find((w) => w.userId === currentUser.id && w.courseId === courseId);
      if (existing) {
        setData((d) => ({ ...d, wishlist: d.wishlist.filter((w) => w.id !== existing.id) }));
      } else {
        setData((d) => ({
          ...d,
          wishlist: [...d.wishlist, { id: uid('wish'), userId: currentUser.id, courseId, addedAt: nowISO() }],
        }));
      }
    },
    [currentUser, data.wishlist, openAuthModal],
  );

  const enrol = useCallback(
    (courseId: string, asStudentId?: string): boolean => {
      const sid = asStudentId ?? currentUser?.id;
      if (!sid) {
        openAuthModal(courseId);
        return false;
      }
      const existing = data.enrolments.find((e) => e.courseId === courseId && e.studentId === sid);
      if (existing) {
        touchCourse(courseId);
        return true;
      }
      const newEnrolment = {
        id: uid('enr'),
        studentId: sid,
        courseId,
        enrolledAt: nowISO(),
        lastAccessedAt: nowISO(),
        completedChapterIds: [],
        quizScores: {},
      };
      setData((d) => ({
        ...d,
        enrolments: [...d.enrolments, newEnrolment],
      }));
      return true;
    },
    [currentUser, data.enrolments, openAuthModal],
  );

  const touchCourse = useCallback(
    (courseId: string) => {
      if (!currentUser) return;
      const now = nowISO();
      setData((d) => ({
        ...d,
        enrolments: d.enrolments.map((e) =>
          e.courseId === courseId && e.studentId === currentUser.id ? { ...e, lastAccessedAt: now } : e,
        ),
      }));
    },
    [currentUser],
  );

  const completeChapter = useCallback(
    (courseId: string, chapterId: string) => {
      if (!currentUser) return;
      const now = nowISO();
      setData((d) => ({
        ...d,
        enrolments: d.enrolments.map((e) => {
          if (e.courseId !== courseId || e.studentId !== currentUser.id) return e;
          if (e.completedChapterIds.includes(chapterId)) return { ...e, lastAccessedAt: now };
          return {
            ...e,
            lastAccessedAt: now,
            completedChapterIds: [...e.completedChapterIds, chapterId],
          };
        }),
      }));
    },
    [currentUser],
  );

  const saveQuizScore = useCallback(
    (courseId: string, chapterId: string, score: number, total: number) => {
      if (!currentUser) return;
      const passed = total > 0 && score / total >= 0.7;
      setData((d) => ({
        ...d,
        enrolments: d.enrolments.map((e) => {
          if (e.courseId !== courseId || e.studentId !== currentUser.id) return e;
          return {
            ...e,
            quizScores: {
              ...e.quizScores,
              [chapterId]: { score, total, passed },
            },
          };
        }),
      }));
    },
    [currentUser],
  );

  const issueCertificate = useCallback(
    (courseId: string, studentId?: string): Certificate | undefined => {
      const sid = studentId ?? currentUser?.id;
      if (!sid) return undefined;
      const existing = data.certificates.find((c) => c.courseId === courseId && c.studentId === sid);
      if (existing) return existing;
      const cert: Certificate = {
        id: uid('cert'),
        studentId: sid,
        courseId,
        issuedAt: nowISO(),
        code: makeCode(),
      };
      setData((d) => ({ ...d, certificates: [...d.certificates, cert] }));
      return cert;
    },
    [data.certificates, currentUser],
  );

  // Student Notes
  const noteFor = useCallback(
    (courseId: string, chapterId: string) => {
      if (!currentUser) return undefined;
      return data.notes.find((n) => n.userId === currentUser.id && n.courseId === courseId && n.chapterId === chapterId);
    },
    [data.notes, currentUser],
  );

  const saveStudentNote = useCallback(
    (courseId: string, chapterId: string, content: string) => {
      if (!currentUser) return;
      const existing = data.notes.find((n) => n.userId === currentUser.id && n.courseId === courseId && n.chapterId === chapterId);
      if (existing) {
        setData((d) => ({
          ...d,
          notes: d.notes.map((n) => (n.id === existing.id ? { ...n, content, updatedAt: nowISO() } : n)),
        }));
      } else {
        setData((d) => ({
          ...d,
          notes: [
            ...d.notes,
            {
              id: uid('note'),
              userId: currentUser.id,
              courseId,
              chapterId,
              content,
              updatedAt: nowISO(),
            },
          ],
        }));
      }
    },
    [currentUser, data.notes],
  );

  // Discussions
  const discussionsFor = useCallback(
    (courseId: string, chapterId: string) => {
      return data.discussions.filter((d) => d.courseId === courseId && d.chapterId === chapterId);
    },
    [data.discussions],
  );

  const addDiscussionQuestion = useCallback(
    (courseId: string, chapterId: string, text: string) => {
      if (!currentUser) {
        openAuthModal();
        return;
      }
      const newQuestion: DiscussionQuestion = {
        id: uid('disc'),
        courseId,
        chapterId,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        text,
        createdAt: nowISO(),
        replies: [],
      };
      setData((d) => ({
        ...d,
        discussions: [newQuestion, ...d.discussions],
      }));
    },
    [currentUser, openAuthModal],
  );

  const addDiscussionReply = useCallback(
    (questionId: string, text: string) => {
      if (!currentUser) {
        openAuthModal();
        return;
      }
      const reply = {
        id: uid('rep'),
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        text,
        createdAt: nowISO(),
      };
      setData((d) => ({
        ...d,
        discussions: d.discussions.map((q) => (q.id === questionId ? { ...q, replies: [...q.replies, reply] } : q)),
      }));
    },
    [currentUser, openAuthModal],
  );

  // Reviews
  const reviewsFor = useCallback(
    (courseId: string) => data.reviews.filter((r) => r.courseId === courseId),
    [data.reviews],
  );

  const addCourseReview = useCallback(
    (courseId: string, rating: number, comment: string): boolean => {
      if (!currentUser) {
        openAuthModal();
        return false;
      }
      const review: CourseReview = {
        id: uid('rev'),
        courseId,
        studentId: currentUser.id,
        studentName: currentUser.name,
        rating,
        comment,
        createdAt: nowISO(),
      };
      setData((d) => ({
        ...d,
        reviews: [review, ...d.reviews],
      }));
      return true;
    },
    [currentUser, openAuthModal],
  );

  // Course Authoring
  const addCourse = useCallback((input: CourseDraftInput, teacherId: string): Course => {
    const course: Course = {
      id: uid('c'),
      title: input.title.trim(),
      description: input.description.trim(),
      longDescription: input.longDescription?.trim() || input.description.trim(),
      categoryId: input.categoryId,
      level: input.level,
      coverImage: input.coverImage || '',
      teacherId,
      status: 'draft',
      featured: false,
      createdAt: nowISO(),
      chapters: [],
      whatYouLearn: input.whatYouLearn ?? [],
      prerequisites: input.prerequisites ?? [],
      targetAudience: input.targetAudience ?? [],
      price: input.price ?? 0,
      rating: 5.0,
      ratingCount: 0,
    };
    setData((d) => ({ ...d, courses: [course, ...d.courses] }));
    return course;
  }, []);

  const updateCourse = useCallback((courseId: string, patch: Partial<Course>) => {
    setData((d) => ({
      ...d,
      courses: d.courses.map((c) => (c.id === courseId ? { ...c, ...patch, updatedAt: nowISO() } : c)),
    }));
  }, []);

  const deleteCourse = useCallback((courseId: string) => {
    setData((d) => ({
      ...d,
      courses: d.courses.filter((c) => c.id !== courseId),
      enrolments: d.enrolments.filter((e) => e.courseId !== courseId),
      certificates: d.certificates.filter((cert) => cert.courseId !== courseId),
      reviews: d.reviews.filter((r) => r.courseId !== courseId),
    }));
  }, []);

  const setCourseStatus = useCallback((courseId: string, status: CourseStatus) => {
    setData((d) => ({
      ...d,
      courses: d.courses.map((c) => (c.id === courseId ? { ...c, status, updatedAt: nowISO() } : c)),
    }));
  }, []);

  const toggleFeatured = useCallback((courseId: string) => {
    setData((d) => ({
      ...d,
      courses: d.courses.map((c) => (c.id === courseId ? { ...c, featured: !c.featured } : c)),
    }));
  }, []);

  const addChapter = useCallback((courseId: string, input: ChapterDraftInput) => {
    const chapter: Chapter = {
      id: uid('chap'),
      title: input.title.trim(),
      description: input.description.trim(),
      durationMin: input.durationMin,
      freePreview: input.freePreview,
      videoUrl: input.videoUrl?.trim() || undefined,
      videoType: input.videoType ?? 'youtube',
      content: input.content?.trim() || undefined,
      resources: input.resources ?? [],
      quiz: input.quiz,
    };
    setData((d) => ({
      ...d,
      courses: d.courses.map((c) => (c.id === courseId ? { ...c, chapters: [...c.chapters, chapter], updatedAt: nowISO() } : c)),
    }));
  }, []);

  const updateChapter = useCallback((courseId: string, chapterId: string, patch: Partial<Chapter>) => {
    setData((d) => ({
      ...d,
      courses: d.courses.map((c) => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          chapters: c.chapters.map((ch) => (ch.id === chapterId ? { ...ch, ...patch } : ch)),
          updatedAt: nowISO(),
        };
      }),
    }));
  }, []);

  const deleteChapter = useCallback((courseId: string, chapterId: string) => {
    setData((d) => ({
      ...d,
      courses: d.courses.map((c) => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          chapters: c.chapters.filter((ch) => ch.id !== chapterId),
          updatedAt: nowISO(),
        };
      }),
    }));
  }, []);

  const moveChapter = useCallback((courseId: string, from: number, to: number) => {
    setData((d) => ({
      ...d,
      courses: d.courses.map((c) => {
        if (c.id !== courseId) return c;
        if (from < 0 || from >= c.chapters.length || to < 0 || to >= c.chapters.length) return c;
        const next = [...c.chapters];
        const [target] = next.splice(from, 1);
        next.splice(to, 0, target);
        return { ...c, chapters: next, updatedAt: nowISO() };
      }),
    }));
  }, []);

  const addWhatYouLearn = useCallback((courseId: string, item: string) => {
    setData((d) => ({
      ...d,
      courses: d.courses.map((c) => (c.id === courseId ? { ...c, whatYouLearn: [...c.whatYouLearn, item] } : c)),
    }));
  }, []);

  const updateWhatYouLearn = useCallback((courseId: string, index: number, item: string) => {
    setData((d) => ({
      ...d,
      courses: d.courses.map((c) => {
        if (c.id !== courseId) return c;
        const next = [...c.whatYouLearn];
        next[index] = item;
        return { ...c, whatYouLearn: next };
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

  // Admin Actions
  const addUser = useCallback((input: UserDraftInput): User => {
    const user: User = {
      id: uid('u'),
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      password: input.password?.trim() || 'demo123',
      role: input.role,
      headline: input.headline.trim(),
      bio: input.bio?.trim(),
      avatar: input.avatar?.trim(),
      joinedAt: nowISO(),
    };
    setData((d) => ({ ...d, users: [...d.users, user] }));
    return user;
  }, []);

  const deleteUser = useCallback((userId: string) => {
    if (userId === DEMO_ADMIN_ID || userId === DEMO_TEACHER_ID || userId === DEMO_STUDENT_ID) {
      return { ok: false, reason: 'Protected demo system account cannot be deleted.' };
    }
    setData((d) => ({
      ...d,
      users: d.users.filter((u) => u.id !== userId),
      enrolments: d.enrolments.filter((e) => e.studentId !== userId),
      certificates: d.certificates.filter((c) => c.studentId !== userId),
    }));
    return { ok: true };
  }, []);

  const setUserRole = useCallback((userId: string, role: Role) => {
    setData((d) => ({
      ...d,
      users: d.users.map((u) => (u.id === userId ? { ...u, role } : u)),
    }));
  }, []);

  const addCategory = useCallback((name: string, description: string, icon: CategoryIcon = 'shapes'): Category => {
    const cat: Category = {
      id: uid('cat'),
      name: name.trim(),
      description: description.trim(),
      icon,
    };
    setData((d) => ({ ...d, categories: [...d.categories, cat] }));
    return cat;
  }, []);

  const renameCategory = useCallback((categoryId: string, name: string) => {
    setData((d) => ({
      ...d,
      categories: d.categories.map((c) => (c.id === categoryId ? { ...c, name: name.trim() } : c)),
    }));
  }, []);

  const updateCategory = useCallback((categoryId: string, patch: Partial<Category>) => {
    setData((d) => ({
      ...d,
      categories: d.categories.map((c) => (c.id === categoryId ? { ...c, ...patch } : c)),
    }));
  }, []);

  const deleteCategory = useCallback(
    (categoryId: string) => {
      const inUse = data.courses.some((c) => c.categoryId === categoryId);
      if (inUse) return { ok: false, reason: 'Category has courses assigned to it.' };
      setData((d) => ({ ...d, categories: d.categories.filter((c) => c.id !== categoryId) }));
      return { ok: true };
    },
    [data.courses],
  );

  const resetDemo = useCallback(() => {
    const fresh = buildSeedData();
    setData(fresh);
    setActiveUserId(DEMO_STUDENT_ID);
    setRoute({ page: 'home' });
    toast('Platform reset to default courses and progress');
  }, [toast]);

  const value = useMemo<AppContextValue>(
    () => ({
      data,
      role,
      route,
      currentUser,
      isAuthenticated,
      toasts,
      authModalOpen,
      openAuthModal,
      closeAuthModal,
      requireAuth,
      navigate,
      switchRole,
      switchActiveUser,
      login,
      logout,
      register,
      updateUserProfile,
      toast,
      dismissToast,
      enrolmentFor,
      certificateFor,
      enrolledCount,
      isWishlisted,
      toggleWishlist,
      enrol,
      completeChapter,
      touchCourse,
      issueCertificate,
      saveQuizScore,
      noteFor,
      saveStudentNote,
      discussionsFor,
      addDiscussionQuestion,
      addDiscussionReply,
      reviewsFor,
      addCourseReview,
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
    }),
    [
      data,
      role,
      route,
      currentUser,
      isAuthenticated,
      toasts,
      authModalOpen,
      openAuthModal,
      closeAuthModal,
      requireAuth,
      navigate,
      switchRole,
      switchActiveUser,
      login,
      logout,
      register,
      updateUserProfile,
      toast,
      dismissToast,
      enrolmentFor,
      certificateFor,
      enrolledCount,
      isWishlisted,
      toggleWishlist,
      enrol,
      completeChapter,
      touchCourse,
      issueCertificate,
      saveQuizScore,
      noteFor,
      saveStudentNote,
      discussionsFor,
      addDiscussionQuestion,
      addDiscussionReply,
      reviewsFor,
      addCourseReview,
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
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
