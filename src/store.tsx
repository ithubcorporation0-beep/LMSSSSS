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

const STORAGE_KEY = 'eduflow-prod-state-v4';

interface PersistedShape {
  v: number;
  activeUserId: string;
  route: Route;
  data: AppData;
}

function loadPersisted(): PersistedShape {
  const seed = buildSeedData();
  const fallback: PersistedShape = { v: 4, activeUserId: DEMO_STUDENT_ID, route: { page: 'home' }, data: seed };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PersistedShape>;
    if (parsed.v !== 4 || !parsed.data) return fallback;
    const d = parsed.data;
    if (!Array.isArray(d.categories) || !Array.isArray(d.courses) || !Array.isArray(d.users) || !Array.isArray(d.enrolments) || !Array.isArray(d.certificates)) {
      return fallback;
    }
    return {
      v: 4,
      activeUserId: parsed.activeUserId ?? DEMO_STUDENT_ID,
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

interface AppContextValue {
  data: AppData;
  role: Role;
  route: Route;
  currentUser: User;
  toasts: Toast[];

  navigate: (route: Route) => void;
  switchRole: (role: Role) => void;
  switchActiveUser: (userId: string) => void;
  login: (email: string) => boolean;
  register: (input: UserDraftInput) => User;
  updateUserProfile: (userId: string, patch: Partial<User>) => void;
  toast: (message: string, kind?: ToastKind) => void;
  dismissToast: (id: number) => void;

  enrolmentFor: (courseId: string, studentId?: string) => AppData['enrolments'][number] | undefined;
  certificateFor: (courseId: string, studentId?: string) => Certificate | undefined;
  enrolledCount: (courseId: string) => number;
  isWishlisted: (courseId: string) => boolean;
  toggleWishlist: (courseId: string) => void;

  enrol: (courseId: string, asStudentId?: string) => void;
  completeChapter: (courseId: string, chapterId: string) => void;
  touchCourse: (courseId: string) => void;
  issueCertificate: (courseId: string, studentId?: string) => Certificate;
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
  addCourseReview: (courseId: string, rating: number, comment: string) => void;

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
  const [activeUserId, setActiveUserId] = useState<string>(initial.activeUserId);
  const [route, setRoute] = useState<Route>(initial.route);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const currentUser = useMemo<User>(() => {
    return data.users.find((u) => u.id === activeUserId) ?? data.users[0];
  }, [data.users, activeUserId]);

  const role = currentUser.role;

  // Persist state across reloads
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 4, activeUserId, route, data }));
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

  const switchRole = useCallback(
    (next: Role) => {
      // Find a user with this role, or update current user's role
      const matched = data.users.find((u) => u.role === next);
      if (matched) {
        setActiveUserId(matched.id);
      } else {
        setData((d) => ({
          ...d,
          users: d.users.map((u) => (u.id === activeUserId ? { ...u, role: next } : u)),
        }));
      }
      setRoute(ROLE_HOME[next]);
      window.scrollTo({ top: 0 });
    },
    [data.users, activeUserId],
  );

  const switchActiveUser = useCallback((userId: string) => {
    setActiveUserId(userId);
    const user = data.users.find((u) => u.id === userId);
    if (user) {
      setRoute(ROLE_HOME[user.role]);
    }
  }, [data.users]);

  const login = useCallback(
    (email: string) => {
      const user = data.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (user) {
        setActiveUserId(user.id);
        setRoute(ROLE_HOME[user.role]);
        toast(`Signed in as ${user.name}`);
        return true;
      }
      return false;
    },
    [data.users, toast],
  );

  const register = useCallback(
    (input: UserDraftInput) => {
      const user: User = {
        id: uid('u'),
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        role: input.role,
        headline: input.headline.trim(),
        bio: input.bio?.trim(),
        avatar: input.avatar,
        joinedAt: nowISO(),
      };
      setData((d) => ({ ...d, users: [...d.users, user] }));
      setActiveUserId(user.id);
      setRoute(ROLE_HOME[user.role]);
      toast(`Welcome, ${user.name}! Account created.`);
      return user;
    },
    [toast],
  );

  const updateUserProfile = useCallback((userId: string, patch: Partial<User>) => {
    setData((d) => ({
      ...d,
      users: d.users.map((u) => (u.id === userId ? { ...u, ...patch } : u)),
    }));
  }, []);

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

  const isWishlisted = useCallback(
    (courseId: string) => data.wishlist.some((w) => w.userId === currentUser.id && w.courseId === courseId),
    [data.wishlist, currentUser.id],
  );

  const toggleWishlist = useCallback(
    (courseId: string) => {
      setData((d) => {
        const exists = d.wishlist.some((w) => w.userId === currentUser.id && w.courseId === courseId);
        if (exists) {
          return { ...d, wishlist: d.wishlist.filter((w) => !(w.userId === currentUser.id && w.courseId === courseId)) };
        }
        return { ...d, wishlist: [...d.wishlist, { userId: currentUser.id, courseId, addedAt: nowISO() }] };
      });
    },
    [currentUser.id],
  );

  // ── Student Actions ────────────────────────────────────────
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

  const saveQuizScore = useCallback(
    (courseId: string, chapterId: string, score: number, total: number) => {
      const passed = Math.round((score / total) * 100) >= 70;
      setData((d) => ({
        ...d,
        enrolments: d.enrolments.map((e) => {
          if (e.courseId !== courseId || e.studentId !== currentUser.id) return e;
          const scores = e.quizScores ?? {};
          return {
            ...e,
            quizScores: {
              ...scores,
              [chapterId]: { score, total, passed },
            },
          };
        }),
      }));
    },
    [currentUser.id],
  );

  const issueCertificate = useCallback(
    (courseId: string, studentId?: string) => {
      const sid = studentId ?? currentUser.id;
      let issued: Certificate | undefined;
      setData((d) => {
        const existing = d.certificates.find((c) => c.courseId === courseId && c.studentId === sid);
        if (existing) {
          issued = existing;
          return d;
        }
        issued = { id: uid('cert'), studentId: sid, courseId, issuedAt: nowISO(), code: makeCode(sid, courseId) };
        return { ...d, certificates: [...d.certificates, issued] };
      });
      return issued!;
    },
    [currentUser.id],
  );

  // ── Notes ──────────────────────────────────────────────────
  const noteFor = useCallback(
    (courseId: string, chapterId: string) => {
      return data.notes.find((n) => n.courseId === courseId && n.chapterId === chapterId && n.studentId === currentUser.id);
    },
    [data.notes, currentUser.id],
  );

  const saveStudentNote = useCallback(
    (courseId: string, chapterId: string, content: string) => {
      setData((d) => {
        const existing = d.notes.find((n) => n.courseId === courseId && n.chapterId === chapterId && n.studentId === currentUser.id);
        if (existing) {
          return {
            ...d,
            notes: d.notes.map((n) =>
              n.id === existing.id ? { ...n, content: content.trim(), updatedAt: nowISO() } : n,
            ),
          };
        }
        const newNote: StudentNote = {
          id: uid('note'),
          studentId: currentUser.id,
          courseId,
          chapterId,
          content: content.trim(),
          updatedAt: nowISO(),
        };
        return { ...d, notes: [...d.notes, newNote] };
      });
    },
    [currentUser.id],
  );

  // ── Discussions ────────────────────────────────────────────
  const discussionsFor = useCallback(
    (courseId: string, chapterId: string) => {
      return data.discussions.filter((disc) => disc.courseId === courseId && disc.chapterId === chapterId);
    },
    [data.discussions],
  );

  const addDiscussionQuestion = useCallback(
    (courseId: string, chapterId: string, text: string) => {
      if (!text.trim()) return;
      const question: DiscussionQuestion = {
        id: uid('disc'),
        courseId,
        chapterId,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        text: text.trim(),
        createdAt: nowISO(),
        replies: [],
      };
      setData((d) => ({ ...d, discussions: [question, ...d.discussions] }));
    },
    [currentUser],
  );

  const addDiscussionReply = useCallback(
    (questionId: string, text: string) => {
      if (!text.trim()) return;
      setData((d) => ({
        ...d,
        discussions: d.discussions.map((disc) => {
          if (disc.id !== questionId) return disc;
          const reply = {
            id: uid('rep'),
            userId: currentUser.id,
            userName: currentUser.name,
            userRole: currentUser.role,
            text: text.trim(),
            createdAt: nowISO(),
          };
          return { ...disc, replies: [...disc.replies, reply] };
        }),
      }));
    },
    [currentUser],
  );

  // ── Reviews ────────────────────────────────────────────────
  const reviewsFor = useCallback(
    (courseId: string) => data.reviews.filter((r) => r.courseId === courseId),
    [data.reviews],
  );

  const addCourseReview = useCallback(
    (courseId: string, rating: number, comment: string) => {
      if (!comment.trim()) return;
      const review: CourseReview = {
        id: uid('rev'),
        courseId,
        studentId: currentUser.id,
        studentName: currentUser.name,
        rating: Math.max(1, Math.min(5, rating)),
        comment: comment.trim(),
        createdAt: nowISO(),
      };
      setData((d) => {
        const nextReviews = [review, ...d.reviews];
        const courseReviews = nextReviews.filter((r) => r.courseId === courseId);
        const avg = +(courseReviews.reduce((s, r) => s + r.rating, 0) / courseReviews.length).toFixed(1);
        return {
          ...d,
          reviews: nextReviews,
          courses: d.courses.map((c) =>
            c.id === courseId ? { ...c, rating: avg, ratingCount: courseReviews.length } : c,
          ),
        };
      });
    },
    [currentUser],
  );

  // ── Teacher Actions ────────────────────────────────────────
  const addCourse = useCallback((input: CourseDraftInput, teacherId: string) => {
    const course: Course = {
      id: uid('c'),
      title: input.title.trim(),
      description: input.description.trim(),
      longDescription: input.longDescription?.trim() || input.description.trim(),
      categoryId: input.categoryId,
      level: input.level,
      coverImage: input.coverImage ?? '',
      teacherId,
      status: 'draft',
      featured: false,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      chapters: [],
      whatYouLearn: input.whatYouLearn ?? [],
      prerequisites: input.prerequisites ?? [],
      targetAudience: input.targetAudience ?? [],
      price: input.price ?? 0,
      rating: 5.0,
      ratingCount: 0,
    };
    setData((d) => ({ ...d, courses: [...d.courses, course] }));
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
      certificates: d.certificates.filter((c) => c.courseId !== courseId),
      reviews: d.reviews.filter((r) => r.courseId !== courseId),
      discussions: d.discussions.filter((disc) => disc.courseId !== courseId),
      notes: d.notes.filter((n) => n.courseId !== courseId),
      wishlist: d.wishlist.filter((w) => w.courseId !== courseId),
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
    setData((d) => ({
      ...d,
      courses: d.courses.map((c) =>
        c.id === courseId
          ? {
              ...c,
              updatedAt: nowISO(),
              chapters: [
                ...c.chapters,
                {
                  id: uid('ch'),
                  title: input.title.trim(),
                  description: input.description.trim(),
                  durationMin: input.durationMin,
                  freePreview: input.freePreview,
                  videoUrl: input.videoUrl?.trim(),
                  videoType: input.videoType,
                  content: input.content?.trim(),
                  resources: input.resources ?? [],
                  quiz: input.quiz,
                },
              ],
            }
          : c,
      ),
    }));
  }, []);

  const updateChapter = useCallback((courseId: string, chapterId: string, patch: Partial<Chapter>) => {
    setData((d) => ({
      ...d,
      courses: d.courses.map((c) =>
        c.id === courseId
          ? {
              ...c,
              updatedAt: nowISO(),
              chapters: c.chapters.map((chap) => (chap.id === chapterId ? { ...chap, ...patch } : chap)),
            }
          : c,
      ),
    }));
  }, []);

  const deleteChapter = useCallback((courseId: string, chapterId: string) => {
    setData((d) => ({
      ...d,
      courses: d.courses.map((c) =>
        c.id === courseId
          ? {
              ...c,
              updatedAt: nowISO(),
              chapters: c.chapters.filter((chap) => chap.id !== chapterId),
            }
          : c,
      ),
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
        return { ...c, chapters, updatedAt: nowISO() };
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

  // ── Admin Actions ──────────────────────────────────────────
  const addUser = useCallback((input: UserDraftInput) => {
    const user: User = {
      id: uid('u'),
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      role: input.role,
      headline: input.headline.trim(),
      bio: input.bio?.trim(),
      avatar: input.avatar,
      joinedAt: nowISO(),
    };
    setData((d) => ({ ...d, users: [...d.users, user] }));
    return user;
  }, []);

  const deleteUser = useCallback(
    (userId: string) => {
      if (userId === DEMO_STUDENT_ID || userId === DEMO_TEACHER_ID || userId === DEMO_ADMIN_ID) {
        return { ok: false, reason: 'Core platform personas cannot be deleted' };
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
        reviews: d.reviews.filter((r) => r.studentId !== userId),
        discussions: d.discussions.filter((disc) => disc.userId !== userId),
        notes: d.notes.filter((n) => n.studentId !== userId),
        wishlist: d.wishlist.filter((w) => w.userId !== userId),
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
    const clean = buildSeedData();
    setData(clean);
    setActiveUserId(DEMO_STUDENT_ID);
    setRoute({ page: 'home' });
    window.scrollTo({ top: 0 });
    toast('Platform data restored to fresh production seed state', 'info');
  }, [toast]);

  const value: AppContextValue = {
    data,
    role,
    route,
    currentUser,
    toasts,
    navigate,
    switchRole,
    switchActiveUser,
    login,
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
