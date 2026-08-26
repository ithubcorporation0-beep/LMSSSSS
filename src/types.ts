// ─────────────────────────────────────────────────────────────
// EduFlow · domain types
// ─────────────────────────────────────────────────────────────

export type Role = 'student' | 'teacher' | 'admin';
export type Level = 'Beginner' | 'Intermediate' | 'Advanced';
export type CourseStatus = 'published' | 'draft';
export type CategoryIcon = 'code' | 'shapes' | 'briefcase' | 'megaphone' | 'camera' | 'tag';

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: CategoryIcon;
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  durationMin: number;
  freePreview: boolean;
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
  chapters: Chapter[];
  whatYouLearn: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  headline: string;
  bio?: string;
  joinedAt: string; // ISO
}

export interface Enrolment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string; // ISO
  lastAccessedAt: string; // ISO
  completedChapterIds: string[];
}

export interface Certificate {
  id: string;
  studentId: string;
  courseId: string;
  issuedAt: string; // ISO
  code: string;
}

export interface AppData {
  categories: Category[];
  courses: Course[];
  users: User[];
  enrolments: Enrolment[];
  certificates: Certificate[];
}

// ── routing ──────────────────────────────────────────────────
export type Route =
  | { page: 'home' }
  | { page: 'catalog'; categoryId?: string }
  | { page: 'course'; id: string }
  | { page: 's-dash' }
  | { page: 's-courses' }
  | { page: 's-learn'; courseId: string; chapterId?: string }
  | { page: 's-certs' }
  | { page: 't-dash' }
  | { page: 't-courses' }
  | { page: 't-edit'; id: string }
  | { page: 't-students' }
  | { page: 't-analytics' }
  | { page: 'a-dash' }
  | { page: 'a-users' }
  | { page: 'a-courses' }
  | { page: 'a-cats' };

export type ToastKind = 'success' | 'info' | 'error';

export interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}
