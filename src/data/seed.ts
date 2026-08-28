import type { AppData, Category, Course, CourseReview, DiscussionQuestion, Level, StudentNote, User, WishlistItem } from '../types';
import { daysAgoISO, makeCode, nowISO } from '../lib';

export const DEMO_ADMIN_ID = 'u_admin';
export const DEMO_TEACHER_ID = 'u_teacher';
export const DEMO_STUDENT_ID = 'u_student';

export const COVER_PRESETS = [
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&auto=format&fit=crop&q=80', // React / Code
  'https://images.unsplash.com/photo-1581291518655-9523c932edcf?w=1200&auto=format&fit=crop&q=80', // UI/UX
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80', // Python / AI
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80', // Business / Growth
  'https://images.unsplash.com/photo-1557838923-2985c318be48?w=1200&auto=format&fit=crop&q=80', // Marketing / Ads
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80', // TypeScript / Backend
];

export function buildCleanCategories(): Category[] {
  return [
    { id: 'cat_dev', name: 'Development', description: 'Web, mobile, frontend, and backend software engineering.', icon: 'code' },
    { id: 'cat_design', name: 'UI/UX & Design', description: 'User experience design, Figma systems, visual craft, and product design.', icon: 'shapes' },
    { id: 'cat_ai', name: 'AI & Data Science', description: 'Python, machine learning, deep learning, LLMs, and analytics.', icon: 'layers' },
    { id: 'cat_business', name: 'Business & Leadership', description: 'Product management, SaaS strategy, finance, and entrepreneurship.', icon: 'briefcase' },
    { id: 'cat_marketing', name: 'Growth Marketing', description: 'SEO, digital advertising, content strategy, and conversion optimization.', icon: 'megaphone' },
    { id: 'cat_photo', name: 'Media & Creative', description: 'Video editing, lighting, visual storytelling, and digital production.', icon: 'camera' },
  ];
}

export function buildCleanUsers(): User[] {
  return [
    {
      id: DEMO_ADMIN_ID,
      name: 'Alexander Wright',
      email: 'admin@eduflow.io',
      role: 'admin',
      headline: 'Platform Administrator & System Lead',
      bio: 'Oversees course quality, catalog standards, user moderation, and platform architecture at EduFlow.',
      joinedAt: daysAgoISO(60),
    },
    {
      id: DEMO_TEACHER_ID,
      name: 'Sarah Jenkins',
      email: 'instructor@eduflow.io',
      role: 'teacher',
      headline: 'Senior Full-Stack Architect & Tech Lead',
      bio: 'Ex-Stripe and Netflix engineer with 12+ years of experience building high-scale web platforms. Passionate about modern web architecture, TypeScript, and clean code.',
      joinedAt: daysAgoISO(45),
    },
    {
      id: 'u_teacher_2',
      name: 'Marcus Vance',
      email: 'marcus.vance@eduflow.io',
      role: 'teacher',
      headline: 'Principal Design Lead & Figma Partner',
      bio: 'Design systems consultant for Fortune 500 tech companies. Teaching intuitive UI/UX, typography, design tokens, and user research.',
      joinedAt: daysAgoISO(40),
    },
    {
      id: 'u_teacher_3',
      name: 'Dr. Elena Rostova',
      email: 'elena.rostova@eduflow.io',
      role: 'teacher',
      headline: 'AI Research Scientist & Data Engineer',
      bio: 'PhD in Computer Science with a focus on Applied Machine Learning and Neural Architectures. Author of practical Python guides.',
      joinedAt: daysAgoISO(35),
    },
    {
      id: DEMO_STUDENT_ID,
      name: 'Maya Chen',
      email: 'student@eduflow.io',
      role: 'student',
      headline: 'Aspiring Software Engineer & Active Learner',
      bio: 'Learning full-stack development, modern design workflows, and AI to build impactful web applications.',
      joinedAt: daysAgoISO(14),
    },
    {
      id: 'u_student_2',
      name: 'David Kim',
      email: 'david.kim@example.com',
      role: 'student',
      headline: 'Frontend Developer',
      joinedAt: daysAgoISO(10),
    },
    {
      id: 'u_student_3',
      name: 'Sofia Al-Mansoor',
      email: 'sofia.m@example.com',
      role: 'student',
      headline: 'Product Designer',
      joinedAt: daysAgoISO(7),
    },
  ];
}

export function buildSeedCourses(): Course[] {
  return [
    {
      id: 'course_react_next',
      title: 'Full-Stack Modern React & Next.js Architecture',
      description: 'Master React 19, Next.js App Router, TypeScript, server actions, and state management for production apps.',
      longDescription: `A comprehensive, production-grade masterclass designed to take you from foundational concepts to architecting scalable, high-performance web applications.

You'll explore modern React paradigms (Server Components, Suspense, streaming, hooks), the Next.js App Router, seamless client-server state transitions, and responsive Tailwind CSS layout techniques. Every chapter includes interactive video lessons, in-depth technical notes, code walkthroughs, and knowledge-check quizzes.`,
      categoryId: 'cat_dev',
      level: 'Intermediate',
      coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&auto=format&fit=crop&q=80',
      teacherId: DEMO_TEACHER_ID,
      status: 'published',
      featured: true,
      createdAt: daysAgoISO(30),
      updatedAt: daysAgoISO(2),
      price: 0,
      rating: 4.9,
      ratingCount: 48,
      whatYouLearn: [
        'Architect modern React 19 applications using Server and Client Components',
        'Implement dynamic routing, streaming, and nested layouts with Next.js App Router',
        'Leverage TypeScript for end-to-end type safety and clean interfaces',
        'Build and optimize server actions, mutations, and database connectors',
        'Deploy production-ready apps with zero-downtime CI/CD workflows',
      ],
      prerequisites: ['Basic HTML, CSS and modern JavaScript (ES6+)', 'Familiarity with terminal commands and npm'],
      targetAudience: ['Frontend developers looking to master Next.js', 'Engineers migrating from legacy React setups', 'Full-stack engineers building modern web apps'],
      chapters: [
        {
          id: 'ch_rn_1',
          title: '1. Modern React Foundations & React 19 Architecture',
          description: 'Explore the core principles of React 19, Compiler optimisations, and why Server Components change frontend mental models.',
          durationMin: 18,
          freePreview: true,
          videoUrl: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
          videoType: 'youtube',
          content: `## Modern React 19 Foundations

React has evolved significantly with a core focus on compiler-driven memoization, streaming server-side rendering, and simplified asynchronous state handling.

### Key Conceptual Shifts:
1. **React Compiler**: Automatic memoization replacing manual \`useMemo\` and \`useCallback\` boilerplate.
2. **Server Components (RSC)**: Code executed solely on the server, sending zero JavaScript bundle weight to the client.
3. **Actions & Optimistic UI**: Native handling for form mutations and background updates with \`useActionState\` and \`useOptimistic\`.

\`\`\`typescript
// Example: React 19 Server Action with Optimistic UI
async function updateProfile(formData: FormData) {
  'use server';
  const name = formData.get('name') as string;
  await db.user.update({ where: { id }, data: { name } });
}
\`\`\`

### Key Takeaway:
Modern React code is simpler, cleaner, and requires fewer manual hooks when structured around modern compiler paradigms.`,
          resources: [
            { id: 'res_rn_1', name: 'React 19 Architecture Cheat Sheet (PDF)', url: 'https://react.dev', type: 'pdf', fileSize: '1.2 MB' },
            { id: 'res_rn_2', name: 'Starter Template on GitHub', url: 'https://github.com', type: 'code' },
          ],
          quiz: {
            passingPercent: 70,
            questions: [
              {
                id: 'q1_1',
                question: 'What is the primary advantage of React Server Components (RSC)?',
                options: [
                  'They send zero JavaScript bundle overhead to the client browser',
                  'They replace CSS styling completely',
                  'They only run in Safari',
                  'They require jQuery to function',
                ],
                correctIndex: 0,
                explanation: 'React Server Components execute entirely on the server and stream lightweight HTML/JSON representations, reducing client-side bundle size.',
              },
              {
                id: 'q1_2',
                question: 'Which new hook simplifies form action submissions and error handling in React 19?',
                options: ['useActionState', 'useReducerAsync', 'useSubmitHandler', 'useFormRef'],
                correctIndex: 0,
                explanation: 'useActionState handles asynchronous action execution, pending states, and returned data cleanly.',
              },
            ],
          },
        },
        {
          id: 'ch_rn_2',
          title: '2. Next.js App Router, Layouts & Streaming',
          description: 'Build nested layouts, error boundaries, loading skeletons, and understand parallel route architecture.',
          durationMin: 24,
          freePreview: true,
          videoUrl: 'https://www.youtube.com/watch?v=wm5gMKuwSYk',
          videoType: 'youtube',
          content: `## Next.js App Router & Streaming

The Next.js App Router is built from the ground up on React Server Components and file-system based routing.

### File Conventions:
- \`layout.tsx\`: Persistent UI shared across sub-routes without re-rendering.
- \`page.tsx\`: The unique route content.
- \`loading.tsx\`: Instant loading state powered by React \`<Suspense>\`.
- \`error.tsx\`: Granular error boundary to catch runtime exceptions.

\`\`\`tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[240px_1fr] min-h-screen">
      <Sidebar />
      <main className="p-8">{children}</main>
    </div>
  );
}
\`\`\`

### Streaming with Suspense:
Streaming allows slow data fetches (like database queries or external APIs) to stream into the page progressively without blocking the initial page load.`,
          resources: [
            { id: 'res_rn_3', name: 'App Router File System Map', url: 'https://nextjs.org/docs', type: 'link' },
          ],
          quiz: {
            passingPercent: 70,
            questions: [
              {
                id: 'q2_1',
                question: 'Which file in the Next.js App Router automatically defines a Suspense boundary for page transitions?',
                options: ['loading.tsx', 'suspense.tsx', 'spinner.tsx', 'wait.tsx'],
                correctIndex: 0,
                explanation: 'loading.tsx wraps page content in a React Suspense boundary automatically.',
              },
            ],
          },
        },
        {
          id: 'ch_rn_3',
          title: '3. Data Fetching, Caching & Revalidation',
          description: 'Master server-side fetch caches, tags, on-demand revalidation, and database integration.',
          durationMin: 22,
          freePreview: false,
          videoUrl: 'https://www.youtube.com/watch?v=VBlSe8tvg4U',
          videoType: 'youtube',
          content: `## Data Fetching & Cache Control

Learn how Next.js unifies data caching, static site generation, and dynamic requests through declarative cache tags and time-based revalidation.

\`\`\`typescript
// Revalidate tag on mutation
import { revalidateTag } from 'next/cache';

export async function addCourse(data: CourseInput) {
  'use server';
  await db.course.create({ data });
  revalidateTag('courses-list');
}
\`\`\``,
          quiz: {
            passingPercent: 70,
            questions: [
              {
                id: 'q3_1',
                question: 'How do you trigger on-demand cache revalidation for tagged data in a Server Action?',
                options: ['revalidateTag("tag-name")', 'clearCache()', 'reload()', 'purgeData()'],
                correctIndex: 0,
                explanation: 'revalidateTag allows targeted cache invalidation without purging unaffected data.',
              },
            ],
          },
        },
        {
          id: 'ch_rn_4',
          title: '4. Authentication, Protected Routes & Security',
          description: 'Implement JWT session handling, role-based route protection, and CSRF defense in modern Next.js.',
          durationMin: 26,
          freePreview: false,
          videoUrl: 'https://www.youtube.com/watch?v=DJvM2lSPn6w',
          videoType: 'youtube',
          content: `## Security & Authentication

Protecting APIs and routes requires a defence-in-depth approach with middleware checks, HTTP-only session cookies, and database validation.`,
        },
        {
          id: 'ch_rn_5',
          title: '5. Production Deployment, Monitoring & SEO',
          description: 'Optimize Core Web Vitals, generate dynamic OpenGraph social cards, and deploy to modern hosting platforms.',
          durationMin: 20,
          freePreview: false,
          videoUrl: 'https://www.youtube.com/watch?v=d_k8OQpT_xU',
          videoType: 'youtube',
          content: `## Production Readiness Checklist

1. Dynamic metadata and OpenGraph images using \`generateMetadata\`
2. Structured JSON-LD schema for rich search results
3. Image optimization with \`next/image\` using modern WebP/AVIF formats.`,
        },
      ],
    },
    {
      id: 'course_ui_ux',
      title: 'UI/UX Design Systems & Figma Masterclass',
      description: 'Design world-class digital products, scalable Figma design systems, tokens, responsive layouts, and user research.',
      longDescription: `Learn how leading product designers create consistent, high-conversion, and accessible user interfaces.

From foundational visual hierarchy and typographic scales to multi-brand design tokens, variables, component variants, and interactive prototyping in Figma. Designed for both visual designers and frontend engineers wanting to bridge the gap between design and code.`,
      categoryId: 'cat_design',
      level: 'Beginner',
      coverImage: 'https://images.unsplash.com/photo-1581291518655-9523c932edcf?w=1200&auto=format&fit=crop&q=80',
      teacherId: 'u_teacher_2',
      status: 'published',
      featured: true,
      createdAt: daysAgoISO(25),
      updatedAt: daysAgoISO(3),
      price: 0,
      rating: 5.0,
      ratingCount: 32,
      whatYouLearn: [
        'Build scalable Design Systems in Figma with Auto Layout 5.0 and Component Variables',
        'Master typography, 8pt spacing grids, and intentional color palettes',
        'Create high-fidelity interactive prototypes for client presentations and testing',
        'Conduct rapid usability tests and synthesize user feedback into actionable iterations',
        'Hand off designs cleanly to engineering teams with token mapping',
      ],
      chapters: [
        {
          id: 'ch_ux_1',
          title: '1. Visual Hierarchy, Spacing & The 8pt Grid System',
          description: 'Understand the mathematical foundation behind clean, balanced, and aesthetic digital user interfaces.',
          durationMin: 16,
          freePreview: true,
          videoUrl: 'https://www.youtube.com/watch?v=FTFaQWZBqQ8',
          videoType: 'youtube',
          content: `## The 8-Point Grid System

The 8pt grid is the industry standard for creating spatial rhythm and proportional consistency across screen sizes.

### Why 8px?
- Multiplies cleanly across major screen resolutions (1x, 2x, 3x displays).
- Simplifies spacing decisions: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px.
- Eliminates half-pixel rendering artifacts.`,
          quiz: {
            passingPercent: 70,
            questions: [
              {
                id: 'q_ux_1',
                question: 'Why is the 8pt grid preferred in modern UI design systems?',
                options: [
                  'It scales proportionally across 1x, 2x, and 3x display pixel densities',
                  'It requires fewer fonts',
                  'It reduces battery consumption',
                  'It prevents users from zooming in',
                ],
                correctIndex: 0,
                explanation: 'Multiples of 8 render sharply across all major device screen scaling factors without fractional pixel blurs.',
              },
            ],
          },
        },
        {
          id: 'ch_ux_2',
          title: '2. Figma Variables, Design Tokens & Color Modes',
          description: 'Leverage Figma variables for dark mode, brand themes, and seamless developer handoff.',
          durationMin: 22,
          freePreview: true,
          videoUrl: 'https://www.youtube.com/watch?v=jwNm_8Lqf-s',
          videoType: 'youtube',
          content: `## Design Tokens in Practice

Design tokens represent atomic visual values (colors, spacing, radii) stored as reusable key-value pairs that translate directly into CSS variables.`,
        },
        {
          id: 'ch_ux_3',
          title: '3. Micro-Interactions & Interactive Prototyping',
          description: 'Bring static screens to life with smart animations, interactive components, and spring physics.',
          durationMin: 20,
          freePreview: false,
          videoUrl: 'https://www.youtube.com/watch?v=P4t_K_G9_4A',
          videoType: 'youtube',
          content: `## The Psychology of Motion

Subtle micro-interactions acknowledge user input, reinforce spatial context, and make applications feel responsive and alive.`,
        },
      ],
    },
    {
      id: 'course_python_ai',
      title: 'Python for Data Science, Machine Learning & AI',
      description: 'From Python data structures to NumPy, Pandas, Scikit-Learn, neural networks, and deploying LLM applications.',
      longDescription: `An intensive, hands-on journey through applied machine learning and data science using Python.

Covering NumPy for high-performance matrix math, Pandas for real-world data cleaning, Matplotlib/Seaborn for visual exploration, and machine learning models for classification, regression, and clustering. Concludes with practical generative AI integration and building custom agents.`,
      categoryId: 'cat_ai',
      level: 'Beginner',
      coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
      teacherId: 'u_teacher_3',
      status: 'published',
      featured: true,
      createdAt: daysAgoISO(20),
      updatedAt: daysAgoISO(4),
      price: 0,
      rating: 4.8,
      ratingCount: 39,
      whatYouLearn: [
        'Manipulate and analyze complex tabular datasets using Pandas and NumPy',
        'Build and evaluate predictive machine learning models with Scikit-Learn',
        'Visualize exploratory data distributions with Matplotlib and Seaborn',
        'Understand foundational Neural Network architectures and training workflows',
        'Integrate modern LLM APIs to build automated AI pipelines',
      ],
      chapters: [
        {
          id: 'ch_ai_1',
          title: '1. Python Data Science Tooling: NumPy & Pandas Foundations',
          description: 'Vectorized computing with NumPy and structuring dataframes with Pandas.',
          durationMin: 25,
          freePreview: true,
          videoUrl: 'https://www.youtube.com/watch?v=r-uOLxNrNk8',
          videoType: 'youtube',
          content: `## NumPy & Vectorized Computing

NumPy allows memory-efficient, contiguous array operations implemented in C for blazing fast numerical computation.

\`\`\`python
import numpy as np
import pandas as pd

# Creating a fast numerical tensor
data = np.random.randn(1000, 4)
df = pd.DataFrame(data, columns=['Metric_A', 'Metric_B', 'Metric_C', 'Target'])
print(df.describe())
\`\`\``,
          quiz: {
            passingPercent: 70,
            questions: [
              {
                id: 'q_ai_1',
                question: 'What makes NumPy operations significantly faster than standard Python lists?',
                options: [
                  'Homogeneous data types stored in contiguous memory blocks with C-level SIMD operations',
                  'NumPy uses cloud servers automatically',
                  'NumPy compiles to HTML',
                  'NumPy compresses memory with zip',
                ],
                correctIndex: 0,
                explanation: 'NumPy arrays store fixed-size homogeneous elements in continuous memory, allowing vectorized CPU instructions without Python interpreter overhead.',
              },
            ],
          },
        },
        {
          id: 'ch_ai_2',
          title: '2. Supervised Learning: Classification & Regression Models',
          description: 'Train Decision Trees, Random Forests, and evaluate metrics like F1-Score, ROC-AUC, and RMSE.',
          durationMin: 28,
          freePreview: true,
          videoUrl: 'https://www.youtube.com/watch?v=7eh4d6sabA0',
          videoType: 'youtube',
          content: `## Model Evaluation & Cross-Validation

Never evaluate machine learning models solely on training accuracy. Always use k-fold cross-validation and holdout test sets.`,
        },
        {
          id: 'ch_ai_3',
          title: '3. Neural Networks & Building AI Agent Workflows',
          description: 'Understand embeddings, semantic vector search, and chaining LLM tools for intelligent assistants.',
          durationMin: 30,
          freePreview: false,
          videoUrl: 'https://www.youtube.com/watch?v=aircAruvnKk',
          videoType: 'youtube',
          content: `## The Modern AI Stack

Embeddings convert textual documents into high-dimensional vectors. Vector similarity (cosine distance) powers semantic search and Retrieval-Augmented Generation (RAG).`,
        },
      ],
    },
    {
      id: 'course_product_growth',
      title: 'Product Strategy, Growth & Agile Execution',
      description: 'How to discover user problems, prioritize roadmaps, run high-velocity growth experiments, and lead cross-functional teams.',
      longDescription: `Learn the strategic frameworks used by world-class Product Managers and Growth Leaders at top tech companies.

Covers product discovery, user interview techniques, opportunity solution trees, ICE/RICE prioritization frameworks, North Star metrics, and running quantitative A/B testing loops.`,
      categoryId: 'cat_business',
      level: 'Intermediate',
      coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
      teacherId: DEMO_ADMIN_ID,
      status: 'published',
      featured: false,
      createdAt: daysAgoISO(15),
      price: 0,
      rating: 4.9,
      ratingCount: 19,
      whatYouLearn: [
        'Define actionable North Star and input metrics that align product and engineering',
        'Structure product roadmaps using the Opportunity Solution Tree framework',
        'Run hypothesis-driven user interviews without confirmation bias',
        'Design statistical A/B tests and calculate sample size power requirements',
      ],
      chapters: [
        {
          id: 'ch_pg_1',
          title: '1. Defining Your North Star Metric & Growth Loops',
          description: 'How to align product value, user retention, and sustainable revenue.',
          durationMin: 18,
          freePreview: true,
          videoUrl: 'https://www.youtube.com/watch?v=J3bX4y8Z9pE',
          videoType: 'youtube',
          content: `## North Star Framework

A true North Star Metric captures the moment when a customer receives core value from your product, driving downstream retention and word-of-mouth referral.`,
        },
        {
          id: 'ch_pg_2',
          title: '2. Customer Discovery & Unbiased User Interviews',
          description: 'The Mom Test framework: extracting honest insights and true customer willingness to pay.',
          durationMin: 20,
          freePreview: false,
          videoUrl: 'https://www.youtube.com/watch?v=GkM8Q9qG7_U',
          videoType: 'youtube',
          content: `## The Mom Test Principles

1. Talk about their life and past behaviors instead of your hypothetical idea.
2. Ask about specific past occurrences rather than generic opinions.
3. Listen more than you talk.`,
        },
      ],
    },
    {
      id: 'course_marketing_seo',
      title: 'Modern Digital Marketing & SEO Growth Engine',
      description: 'Master organic search rankings, content marketing funnels, email automation, and performance marketing in 2026.',
      longDescription: `A comprehensive blueprint to acquiring high-intent organic and paid users reliably.

Learn technical SEO audits, keyword intent mapping, semantic topic clusters, programmatic content production, and building high-converting landing pages.`,
      categoryId: 'cat_marketing',
      level: 'Beginner',
      coverImage: 'https://images.unsplash.com/photo-1557838923-2985c318be48?w=1200&auto=format&fit=crop&q=80',
      teacherId: 'u_teacher_2',
      status: 'published',
      featured: false,
      createdAt: daysAgoISO(12),
      price: 0,
      rating: 4.7,
      ratingCount: 15,
      whatYouLearn: [
        'Perform technical SEO audits and fix Core Web Vitals crawl errors',
        'Build high-ranking topic clusters around commercial intent keywords',
        'Craft high-converting copy for landing pages and automated email drips',
      ],
      chapters: [
        {
          id: 'ch_mk_1',
          title: '1. Technical SEO & Semantic Topic Clusters',
          description: 'Structure website taxonomy to establish topical authority in modern search engines.',
          durationMin: 21,
          freePreview: true,
          videoUrl: 'https://www.youtube.com/watch?v=DvwS7cV9GmQ',
          videoType: 'youtube',
          content: `## Topical Authority in Search

Search engines evaluate your website as a topical authority rather than evaluating individual disconnected keywords.`,
        },
      ],
    },
    {
      id: 'course_ts_backend',
      title: 'TypeScript & Scalable Backend API Development',
      description: 'Build enterprise-grade REST and GraphQL APIs, relational database schemas, and microservices with Node.js and TypeScript.',
      longDescription: `Learn how to architect robust, type-safe backends that power mission-critical web applications.

Covers advanced TypeScript types, Prisma ORM, PostgreSQL connection pooling, Redis caching layers, API rate limiting, and automated testing with Vitest.`,
      categoryId: 'cat_dev',
      level: 'Advanced',
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
      teacherId: DEMO_TEACHER_ID,
      status: 'published',
      featured: false,
      createdAt: daysAgoISO(8),
      price: 0,
      rating: 5.0,
      ratingCount: 22,
      whatYouLearn: [
        'Design resilient relational database schemas in PostgreSQL with Prisma ORM',
        'Build type-safe RESTful and tRPC endpoints with input validation',
        'Implement Redis caching and rate-limiting middleware',
        'Write automated integration test suites for high confidence releases',
      ],
      chapters: [
        {
          id: 'ch_ts_1',
          title: '1. Advanced TypeScript: Generics, Mapped Types & Invariance',
          description: 'Harness conditional types, template literals, and mapped object types for absolute type safety.',
          durationMin: 24,
          freePreview: true,
          videoUrl: 'https://www.youtube.com/watch?v=d56mG7DezGs',
          videoType: 'youtube',
          content: `## Advanced TypeScript Type Systems

TypeScript's type system is Turing-complete, enabling compile-time validation of API contracts and database query shapes.`,
        },
      ],
    },
  ];
}

export function buildSeedReviews(): CourseReview[] {
  return [
    {
      id: 'rev_1',
      courseId: 'course_react_next',
      studentId: DEMO_STUDENT_ID,
      studentName: 'Maya Chen',
      rating: 5,
      comment: 'The best React and Next.js resource I have experienced. The interactive quizzes and real video lessons helped me understand Server Components within an afternoon.',
      createdAt: daysAgoISO(5),
    },
    {
      id: 'rev_2',
      courseId: 'course_react_next',
      studentId: 'u_student_2',
      studentName: 'David Kim',
      rating: 5,
      comment: 'Super crisp explanations. The notes below each video are gold reference material for my daily job.',
      createdAt: daysAgoISO(8),
    },
    {
      id: 'rev_3',
      courseId: 'course_ui_ux',
      studentId: 'u_student_3',
      studentName: 'Sofia Al-Mansoor',
      rating: 5,
      comment: 'Marcus breaks down design tokens and Figma auto-layout so clearly. Finally feel confident handing specs to our engineering team.',
      createdAt: daysAgoISO(3),
    },
    {
      id: 'rev_4',
      courseId: 'course_python_ai',
      studentId: DEMO_STUDENT_ID,
      studentName: 'Maya Chen',
      rating: 5,
      comment: 'Great balance of theory and practical code. The quiz questions make sure you actually understand the vectorized concepts.',
      createdAt: daysAgoISO(2),
    },
  ];
}

export function buildSeedDiscussions(): DiscussionQuestion[] {
  return [
    {
      id: 'disc_1',
      courseId: 'course_react_next',
      chapterId: 'ch_rn_1',
      userId: DEMO_STUDENT_ID,
      userName: 'Maya Chen',
      userRole: 'student',
      text: 'When should we choose a Client Component over a Server Component in React 19?',
      createdAt: daysAgoISO(4),
      replies: [
        {
          id: 'rep_1',
          userId: DEMO_TEACHER_ID,
          userName: 'Sarah Jenkins',
          userRole: 'teacher',
          text: 'Great question, Maya! Use Client Components only when you need client interactivity (onClick, onChange, useState, useEffect, browser APIs like localStorage) or custom client hooks. Everything else defaults to Server Components for minimal bundle size.',
          createdAt: daysAgoISO(4),
        },
      ],
    },
    {
      id: 'disc_2',
      courseId: 'course_ui_ux',
      chapterId: 'ch_ux_1',
      userId: 'u_student_3',
      userName: 'Sofia Al-Mansoor',
      userRole: 'student',
      text: 'Are there any cases where a 4px increment is better than 8px?',
      createdAt: daysAgoISO(2),
      replies: [
        {
          id: 'rep_2',
          userId: 'u_teacher_2',
          userName: 'Marcus Vance',
          userRole: 'teacher',
          text: 'Yes! 4px (the half-step) is ideal for micro-spacing: icon padding, compact table cell heights, and subtle badge borders.',
          createdAt: daysAgoISO(1),
        },
      ],
    },
  ];
}

export function buildSeedNotes(): StudentNote[] {
  return [
    {
      id: 'note_1',
      studentId: DEMO_STUDENT_ID,
      courseId: 'course_react_next',
      chapterId: 'ch_rn_1',
      content: 'Remember: React 19 uses automatic compiler memoization. No need for useMemo unless doing heavy non-render compute calculations.',
      updatedAt: daysAgoISO(3),
    },
  ];
}

export function buildSeedWishlist(): WishlistItem[] {
  return [
    {
      userId: DEMO_STUDENT_ID,
      courseId: 'course_python_ai',
      addedAt: daysAgoISO(6),
    },
    {
      userId: DEMO_STUDENT_ID,
      courseId: 'course_ui_ux',
      addedAt: daysAgoISO(4),
    },
  ];
}

export function buildSeedData(): AppData {
  const courses = buildSeedCourses();
  const users = buildCleanUsers();
  const reviews = buildSeedReviews();
  const discussions = buildSeedDiscussions();
  const notes = buildSeedNotes();
  const wishlist = buildSeedWishlist();

  // Enrol the student in React & Next.js with chapter 1 completed
  const enrolments = [
    {
      id: 'enrol_maya_react',
      studentId: DEMO_STUDENT_ID,
      courseId: 'course_react_next',
      enrolledAt: daysAgoISO(12),
      lastAccessedAt: daysAgoISO(1),
      completedChapterIds: ['ch_rn_1'],
      quizScores: {
        ch_rn_1: { score: 2, total: 2, passed: true },
      },
    },
    {
      id: 'enrol_david_react',
      studentId: 'u_student_2',
      courseId: 'course_react_next',
      enrolledAt: daysAgoISO(10),
      lastAccessedAt: daysAgoISO(2),
      completedChapterIds: ['ch_rn_1', 'ch_rn_2'],
    },
    {
      id: 'enrol_sofia_ui',
      studentId: 'u_student_3',
      courseId: 'course_ui_ux',
      enrolledAt: daysAgoISO(8),
      lastAccessedAt: daysAgoISO(1),
      completedChapterIds: ['ch_ux_1', 'ch_ux_2', 'ch_ux_3'],
    },
  ];

  // Certificate for completed course
  const certificates = [
    {
      id: 'cert_sofia_ui',
      studentId: 'u_student_3',
      courseId: 'course_ui_ux',
      issuedAt: daysAgoISO(1),
      code: makeCode('u_student_3', 'course_ui_ux'),
    },
  ];

  return {
    categories: buildCleanCategories(),
    courses,
    users,
    enrolments,
    certificates,
    reviews,
    notes,
    discussions,
    wishlist,
  };
}

export const LEVELS: Level[] = ['Beginner', 'Intermediate', 'Advanced'];
