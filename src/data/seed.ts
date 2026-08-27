import type { AppData, Chapter, Course, Enrolment, Level, User } from '../types';
import { daysAgoISO, makeCode, nowISO } from '../lib';

// Default clean identities
export const DEMO_STUDENT_ID = 'u_student';
export const DEMO_TEACHER_ID = 'u_teacher';
export const DEMO_ADMIN_ID = 'u_admin';

export const COVER_PRESETS = [
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80',
];

export function buildCleanCategories(): AppData['categories'] {
  return [
    { id: 'cat_dev', name: 'Development', description: 'Web, mobile and software engineering skills for real-world projects.', icon: 'code' },
    { id: 'cat_design', name: 'Design', description: 'UI/UX, visual craft and product thinking.', icon: 'shapes' },
    { id: 'cat_business', name: 'Business', description: 'Strategy, finance and entrepreneurship.', icon: 'briefcase' },
    { id: 'cat_marketing', name: 'Marketing', description: 'Growth, SEO and modern digital communication.', icon: 'megaphone' },
    { id: 'cat_photo', name: 'Photography', description: 'Visual storytelling, lighting and editing.', icon: 'camera' },
  ];
}

export function buildCleanUsers(): User[] {
  return [
    {
      id: DEMO_ADMIN_ID,
      name: 'System Admin',
      email: 'admin@eduflow.io',
      role: 'admin',
      headline: 'Platform Administrator',
      joinedAt: nowISO(),
    },
    {
      id: DEMO_TEACHER_ID,
      name: 'Instructor Account',
      email: 'teacher@eduflow.io',
      role: 'teacher',
      headline: 'Course Creator & Instructor',
      bio: 'Create, structure and publish interactive courses on EduFlow.',
      joinedAt: nowISO(),
    },
    {
      id: DEMO_STUDENT_ID,
      name: 'Student Account',
      email: 'student@eduflow.io',
      role: 'student',
      headline: 'Active Learner',
      joinedAt: nowISO(),
    },
  ];
}

/**
 * Clean State:
 * - 0 pre-enrolled courses (user starts fresh at 0%)
 * - 0 pre-watched chapters
 * - 0 pre-issued certificates
 * - 0 fake courses
 */
export function buildSeedData(): AppData {
  return {
    categories: buildCleanCategories(),
    courses: [],
    users: buildCleanUsers(),
    enrolments: [],
    certificates: [],
  };
}

export const LEVELS: Level[] = ['Beginner', 'Intermediate', 'Advanced'];
