// ─────────────────────────────────────────────────────────────
// EduFlow · Domain Types
// ─────────────────────────────────────────────────────────────

export type Role = 'student' | 'teacher' | 'admin';
export type Level = 'Beginner' | 'Intermediate' | 'Advanced';
export type CourseStatus = 'published' | 'draft';
export type CategoryIcon = 'code' | 'shapes' | 'briefcase' | 'megaphone' | 'camera' | 'tag' | 'book-open' | 'award' | 'layers';
export type VideoType = 'youtube' | 'vimeo' | 'loom' | 'mp4' | 'article';

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: CategoryIcon;
}

export interface ChapterResource {
  id: string;
  name: string;
  url: string;
  type: 'link' | 'code' | 'pdf' | 'archive';
  fileSize?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface ChapterQuiz {
  passingPercent: number;
  questions: QuizQuestion[];
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  durationMin: number;
  freePreview: boolean;
  videoUrl?: string;
  videoType?: VideoType;
  content?: string; // Rich lecture notes / markdown
  resources?: ChapterResource[];
  quiz?: ChapterQuiz;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  categoryId: string;
  level: Level;
  coverImage: string;
  teacherId: string;
  status: CourseStatus;
  featured: boolean;
  createdAt: string; // ISO
  updatedAt?: string; // ISO
  chapters: Chapter[];
  whatYouLearn: string[];
  prerequisites?: string[];
  targetAudience?: string[];
  price?: number; // 0 = free
  rating?: number;
  ratingCount?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  headline: string;
  bio?: string;
  avatar?: string;
  password?: string;
  joinedAt: string; // ISO
}

export interface Enrolment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string; // ISO
  lastAccessedAt: string; // ISO
  completedChapterIds: string[];
  quizScores?: Record<string, { score: number; total: number; passed: boolean }>; // chapterId -> score
}

export interface Certificate {
  id: string;
  studentId: string;
  courseId: string;
  issuedAt: string; // ISO
  code: string;
}

export interface CourseReview {
  id: string;
  courseId: string;
  studentId: string;
  studentName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string; // ISO
}

export interface StudentNote {
  id: string;
  studentId: string;
  courseId: string;
  chapterId: string;
  content: string;
  updatedAt: string; // ISO
}

export interface DiscussionReply {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  text: string;
  createdAt: string; // ISO
}

export interface DiscussionQuestion {
  id: string;
  courseId: string;
  chapterId: string;
  userId: string;
  userName: string;
  userRole: Role;
  text: string;
  createdAt: string; // ISO
  replies: DiscussionReply[];
}

export interface WishlistItem {
  userId: string;
  courseId: string;
  addedAt: string; // ISO
}

export interface AppData {
  categories: Category[];
  courses: Course[];
  users: User[];
  enrolments: Enrolment[];
  certificates: Certificate[];
  reviews: CourseReview[];
  notes: StudentNote[];
  discussions: DiscussionQuestion[];
  wishlist: WishlistItem[];
}

// ── Routing ──────────────────────────────────────────────────
export type Route =
  | { page: 'home' }
  | { page: 'catalog'; categoryId?: string; search?: string }
  | { page: 'course'; id: string }
  | { page: 's-dash' }
  | { page: 's-courses' }
  | { page: 's-wishlist' }
  | { page: 's-notes' }
  | { page: 's-learn'; courseId: string; chapterId?: string }
  | { page: 's-certs' }
  | { page: 't-dash' }
  | { page: 't-courses'; newCourse?: boolean }
  | { page: 't-edit'; id: string }
  | { page: 't-students' }
  | { page: 't-analytics' }
  | { page: 'a-dash' }
  | { page: 'a-users' }
  | { page: 'a-courses' }
  | { page: 'a-cats' }
  | { page: 'verify'; code?: string }
  | { page: 'profile' };

export type ToastKind = 'success' | 'info' | 'error';

export interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}
