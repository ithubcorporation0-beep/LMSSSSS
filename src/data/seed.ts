import type { AppData, Chapter, Course, Enrolment, Level, User } from '../types';
import { daysAgoISO, makeCode } from '../lib';

// demo identities — the people you "view as" from the role switcher
export const DEMO_STUDENT_ID = 'u_maya';
export const DEMO_TEACHER_ID = 'u_daniel';
export const DEMO_ADMIN_ID = 'u_ava';

function ch(id: string, title: string, description: string, durationMin: number, freePreview = false): Chapter {
  return { id, title, description, durationMin, freePreview };
}

function cover(seed: string): string {
  return `https://picsum.photos/seed/${seed}/800/450`;
}

export const COVER_PRESETS = [
  cover('eduflow-preset-harbour'),
  cover('eduflow-preset-forest'),
  cover('eduflow-preset-studio'),
  cover('eduflow-preset-desert'),
  cover('eduflow-preset-night'),
  cover('eduflow-preset-bloom'),
];

export function buildSeedData(): AppData {
  const categories: AppData['categories'] = [
    { id: 'cat_dev', name: 'Development', description: 'Web, mobile and software engineering skills for real-world projects.', icon: 'code' },
    { id: 'cat_design', name: 'Design', description: 'UI/UX, visual craft and product thinking from working designers.', icon: 'shapes' },
    { id: 'cat_business', name: 'Business', description: 'Strategy, finance and entrepreneurship without the jargon.', icon: 'briefcase' },
    { id: 'cat_marketing', name: 'Marketing', description: 'Growth, SEO and storytelling that reach real audiences.', icon: 'megaphone' },
    { id: 'cat_photo', name: 'Photography', description: 'Camera craft, light and editing for compelling images.', icon: 'camera' },
  ];

  const users: User[] = [
    {
      id: DEMO_ADMIN_ID,
      name: 'Ava Lindqvist',
      email: 'ava@eduflow.io',
      role: 'admin',
      headline: 'Platform Administrator',
      joinedAt: daysAgoISO(140),
    },
    {
      id: DEMO_TEACHER_ID,
      name: 'Daniel Okafor',
      email: 'daniel@eduflow.io',
      role: 'teacher',
      headline: 'Senior Frontend Engineer',
      bio: 'Daniel has spent a decade building consumer web apps used by millions. On EduFlow he teaches the practical, project-first style he wishes he had learned with.',
      joinedAt: daysAgoISO(128),
    },
    {
      id: 'u_sofia',
      name: 'Sofia Marino',
      email: 'sofia@eduflow.io',
      role: 'teacher',
      headline: 'Product Designer & Educator',
      bio: 'Sofia leads product design at a Berlin fintech and has taught design workshops across Europe. Her courses focus on systems, critique and confidence.',
      joinedAt: daysAgoISO(115),
    },
    {
      id: 'u_james',
      name: 'James Whitfield',
      email: 'james@eduflow.io',
      role: 'teacher',
      headline: 'Growth Marketer & Photographer',
      bio: 'James grew three startups from zero to their first 100k users, then picked up a camera and never put it down. He teaches marketing, money and making images.',
      joinedAt: daysAgoISO(102),
    },
    // ── students ──
    { id: DEMO_STUDENT_ID, name: 'Maya Chen', email: 'maya.chen@mailbox.com', role: 'student', headline: 'Aspiring front-end developer', joinedAt: daysAgoISO(74) },
    { id: 'u_lucas', name: 'Lucas Meyer', email: 'lucas.meyer@webmail.de', role: 'student', headline: 'Career switcher, Hamburg', joinedAt: daysAgoISO(66) },
    { id: 'u_priya', name: 'Priya Sharma', email: 'priya.sharma@postmail.in', role: 'student', headline: 'CS student, Pune', joinedAt: daysAgoISO(61) },
    { id: 'u_tomas', name: 'Tomás Rivera', email: 'tomas.rivera@correo.mx', role: 'student', headline: 'Freelance designer, CDMX', joinedAt: daysAgoISO(55) },
    { id: 'u_aisha', name: 'Aisha Bello', email: 'aisha.bello@fastmail.ng', role: 'student', headline: 'Startup founder, Lagos', joinedAt: daysAgoISO(47) },
    { id: 'u_jonas', name: 'Jonas Bergström', email: 'jonas.bergstrom@bredband.se', role: 'student', headline: 'Hobbyist photographer, Malmö', joinedAt: daysAgoISO(41) },
    { id: 'u_hana', name: 'Hana Yoshida', email: 'hana.yoshida@ymail.jp', role: 'student', headline: 'Junior developer, Osaka', joinedAt: daysAgoISO(33) },
    { id: 'u_marcus', name: 'Marcus Reid', email: 'marcus.reid@inbox.co.uk', role: 'student', headline: 'Marketing executive, Leeds', joinedAt: daysAgoISO(27) },
    { id: 'u_elena', name: 'Elena Petrova', email: 'elena.petrova@abv.bg', role: 'student', headline: 'UX researcher, Sofia', joinedAt: daysAgoISO(21) },
    { id: 'u_david', name: 'David Kim', email: 'david.kim@hanmail.kr', role: 'student', headline: 'Engineering student, Daejeon', joinedAt: daysAgoISO(14) },
    { id: 'u_chloe', name: 'Chloé Dubois', email: 'chloe.dubois@laposte.fr', role: 'student', headline: 'Business graduate, Lyon', joinedAt: daysAgoISO(8) },
    { id: 'u_sam', name: 'Sam Adeyemi', email: 'sam.adeyemi@zoho.com', role: 'student', headline: 'Self-taught coder, Nairobi', joinedAt: daysAgoISO(3) },
  ];

  const courses: Course[] = [
    {
      id: 'c_react',
      title: 'Modern React from the Ground Up',
      description: 'Build fast, maintainable web apps with React 19 — from your first component to a production deploy.',
      longDescription:
        'This course takes you from zero to shipping real React applications. You will learn to think in components, manage state without fear, fetch data gracefully and finish by building a small design system you can reuse in every future project. Every chapter ends with something concrete you built yourself.',
      categoryId: 'cat_dev',
      level: 'Intermediate',
      coverImage: cover('eduflow-react-course'),
      teacherId: DEMO_TEACHER_ID,
      status: 'published',
      featured: true,
      createdAt: daysAgoISO(64),
      whatYouLearn: [
        'Break any interface into clean, reusable components',
        'Manage state and side effects with modern hooks',
        'Fetch and cache API data with loading and error states',
        'Compose a small, themeable design system of your own',
      ],
      chapters: [
        ch('c_react_ch1', 'Thinking in Components', 'Build your first component tree and learn to split any interface into small, reusable pieces.', 12, true),
        ch('c_react_ch2', 'Props, State & Data Flow', 'Pass data down, lift state up, and keep your UI predictable as the app grows.', 14),
        ch('c_react_ch3', 'Hooks in Depth', 'useState and useEffect demystified, plus the mental model behind writing custom hooks.', 16, true),
        ch('c_react_ch4', 'Fetching Data & Effects', 'Load real API data with loading and error states your users will thank you for.', 15),
        ch('c_react_ch5', 'Building a Mini Design System', 'Compose buttons, inputs and cards into a consistent, themeable little kit.', 18),
        ch('c_react_ch6', 'Ship It: Build, Test & Deploy', 'Optimise a production build and push your app live — with a checklist you can reuse.', 14),
      ],
    },
    {
      id: 'c_js',
      title: 'JavaScript Essentials for Complete Beginners',
      description: 'No experience needed. Learn JavaScript by writing real code in your browser from the very first minute.',
      longDescription:
        'A gentle, encouraging introduction to programming through JavaScript. You will write your first lines of code immediately, and every new idea is explained with everyday examples before you apply it in tiny exercises. By the end you will make a real webpage respond to clicks.',
      categoryId: 'cat_dev',
      level: 'Beginner',
      coverImage: cover('eduflow-js-course'),
      teacherId: DEMO_TEACHER_ID,
      status: 'published',
      featured: false,
      createdAt: daysAgoISO(58),
      whatYouLearn: [
        'Write and run your first JavaScript programs',
        'Use variables, conditionals and loops with confidence',
        'Package logic into reusable functions',
        'Make a static webpage interactive with the DOM',
      ],
      chapters: [
        ch('c_js_ch1', 'A Friendly First Program', 'Write your very first lines of JavaScript and see instant results right in the browser.', 10, true),
        ch('c_js_ch2', 'Variables, Types & Operators', 'The building blocks of every program, explained with examples from daily life.', 12),
        ch('c_js_ch3', 'Making Decisions & Loops', 'Teach your code to choose and repeat itself with if/else, for and while.', 12),
        ch('c_js_ch4', 'Functions that Do Real Work', 'Package logic into reusable functions and stop copying and pasting code.', 14),
        ch('c_js_ch5', 'Arrays, Objects & the DOM', 'Model real-world data and use it to make webpages respond to clicks.', 15),
      ],
    },
    {
      id: 'c_ts',
      title: 'TypeScript Patterns for Real Projects',
      description: 'Move beyond any[] — design types that model your domain and catch bugs before your users do.',
      longDescription:
        'For working JavaScript developers who want TypeScript to actually earn its keep. We skip the tourist syntax tour and go straight to the patterns you will use daily: domain modelling, generics that stay readable, and validating external data at the boundary.',
      categoryId: 'cat_dev',
      level: 'Advanced',
      coverImage: cover('eduflow-ts-course'),
      teacherId: DEMO_TEACHER_ID,
      status: 'draft',
      featured: false,
      createdAt: daysAgoISO(9),
      whatYouLearn: [
        'Model your domain with unions and discriminated types',
        'Write generics other people can actually read',
        'Validate API data at the edge with schemas',
      ],
      chapters: [
        ch('c_ts_ch1', 'Types that Model Your Domain', 'Use unions, narrowing and discriminated types to make illegal states unrepresentable.', 13, true),
        ch('c_ts_ch2', 'Generics without the Fog', 'Write generic functions and components that stay readable and genuinely reusable.', 15),
        ch('c_ts_ch3', 'Schema Validation at the Edge', 'Parse untrusted API responses once, and let the compiler trust them everywhere else.', 14),
      ],
    },
    {
      id: 'c_figma',
      title: 'UI Design Foundations with Figma',
      description: 'Design clean, confident interfaces in Figma — frames, auto layout, type, colour and prototyping.',
      longDescription:
        'A complete first design course for people who have taste but not yet technique. You will set up a file like a professional, build screens with auto layout, create a mini type and colour system, and finish by presenting a clickable prototype you can share with anyone.',
      categoryId: 'cat_design',
      level: 'Beginner',
      coverImage: cover('eduflow-figma-course'),
      teacherId: 'u_sofia',
      status: 'published',
      featured: true,
      createdAt: daysAgoISO(49),
      whatYouLearn: [
        'Navigate Figma like you have used it for years',
        'Build responsive screens with auto layout and grids',
        'Create a small type and colour system from scratch',
        'Present an interactive prototype that clicks through',
      ],
      chapters: [
        ch('c_figma_ch1', 'Your First Frame', 'Set up a file the professional way — pages, frames and a naming habit you will keep forever.', 11, true),
        ch('c_figma_ch2', 'Grids, Spacing & Auto Layout', 'Make layouts that resize gracefully and never nudge pixels again.', 13),
        ch('c_figma_ch3', 'Type & Colour Systems', 'Pick, pair and scale type and colour so your screens instantly feel intentional.', 14),
        ch('c_figma_ch4', 'Components & Variants', 'Build buttons and cards once, then remix them safely across every screen.', 15),
        ch('c_figma_ch5', 'Presenting Interactive Prototypes', 'Wire your screens into a clickable flow and present it like a story, not a slideshow.', 12),
      ],
    },
    {
      id: 'c_ds',
      title: 'Design Systems that Scale',
      description: 'Tokens, documentation and governance — the unglamorous skills that make design systems actually survive.',
      longDescription:
        'For designers and front-of-the-frontend engineers who are tired of rebuilding the same buttons. Learn how healthy design systems are born: tokens before components, documentation people actually read, and a governance model light enough that nobody works around it.',
      categoryId: 'cat_design',
      level: 'Advanced',
      coverImage: cover('eduflow-ds-course'),
      teacherId: 'u_sofia',
      status: 'published',
      featured: false,
      createdAt: daysAgoISO(36),
      whatYouLearn: [
        'Define design tokens that survive rebrands',
        'Write documentation engineers actually open',
        'Version and release changes without chaos',
        'Run a handoff process both sides respect',
      ],
      chapters: [
        ch('c_ds_ch1', 'Design Tokens from Scratch', 'Name and structure colour, spacing and type tokens so a rebrand becomes a config change.', 14, true),
        ch('c_ds_ch2', 'Documenting Components People Use', 'Usage rules, do-and-don’t examples, and API notes — written for humans.', 13),
        ch('c_ds_ch3', 'Versioning & Governance', 'Decide who can change what, and ship updates without breaking every team at once.', 12),
        ch('c_ds_ch4', 'Design–Dev Handoff that Works', 'A calm, repeatable process for specs, assets and edge cases.', 15),
      ],
    },
    {
      id: 'c_fin',
      title: 'Startup Finance for First-Time Founders',
      description: 'Read a P&L, price your product, manage runway and answer investor questions — without an MBA.',
      longDescription:
        'Finance is the language nobody teaches founders until it hurts. This course translates it. You will learn to read your own numbers, price with intent, know exactly how many months of runway you have, and walk into investor conversations already knowing which metrics they will ask about.',
      categoryId: 'cat_business',
      level: 'Intermediate',
      coverImage: cover('eduflow-finance-course'),
      teacherId: 'u_james',
      status: 'published',
      featured: true,
      createdAt: daysAgoISO(43),
      whatYouLearn: [
        'Read a P&L and balance sheet without flinching',
        'Choose a pricing model and defend it',
        'Calculate burn rate and runway in minutes',
        'Answer the five metrics questions every investor asks',
      ],
      chapters: [
        ch('c_fin_ch1', 'Money In, Money Out: Reading a P&L', 'Revenue, costs and margins — the three lines that tell you if the business works.', 12, true),
        ch('c_fin_ch2', 'Pricing that Actually Works', 'Cost-plus, value-based and freemium pricing — and how to pick without guessing.', 13),
        ch('c_fin_ch3', 'Runway & Burn Rate', 'Know exactly how long you have, and the three levers that buy you more time.', 14),
        ch('c_fin_ch4', 'Fundraising Basics', 'Bootstrapping, angels and venture rounds — choose the fuel that fits your engine.', 13),
        ch('c_fin_ch5', 'Metrics Investors Ask For', 'MRR, churn, CAC and LTV explained with a worked example you can copy.', 15),
      ],
    },
    {
      id: 'c_seo',
      title: 'The SEO & Content Marketing Playbook',
      description: 'Rank for what your customers actually search — keyword research, content that converts, and technical basics.',
      longDescription:
        'A practical playbook for getting found on the internet, built for small teams with no budget. Learn how search engines really decide rankings, do keyword research in an hour, write content that earns traffic for years, and fix the technical basics that quietly hold sites back.',
      categoryId: 'cat_marketing',
      level: 'Intermediate',
      coverImage: cover('eduflow-seo-course'),
      teacherId: 'u_james',
      status: 'published',
      featured: false,
      createdAt: daysAgoISO(31),
      whatYouLearn: [
        'Explain how Google actually ranks pages',
        'Do a full keyword research session in one hour',
        'Write content that ranks and converts',
        'Fix the technical issues silently hurting your site',
      ],
      chapters: [
        ch('c_seo_ch1', 'How Search Really Works', 'Crawlers, indexes and ranking signals — what matters and what is mythology.', 11, true),
        ch('c_seo_ch2', 'Keyword Research in an Hour', 'Find winnable keywords with free tools and a repeatable one-hour process.', 14),
        ch('c_seo_ch3', 'Content that Ranks and Converts', 'Structure articles so both search engines and impatient humans love them.', 15),
        ch('c_seo_ch4', 'Technical SEO Basics', 'Speed, mobile, sitemaps and the small fixes with outsized impact.', 13),
        ch('c_seo_ch5', 'Measuring What Matters', 'Set up analytics, pick the three numbers to watch, and ignore the rest.', 12),
      ],
    },
    {
      id: 'c_photo',
      title: 'Photography Masterclass: Light, Lens & Story',
      description: 'From auto mode panic to images with intent — master exposure, composition, natural light and editing.',
      longDescription:
        'A complete foundation for anyone who owns a camera and wants photographs that feel deliberate. We start with light — the only ingredient that really matters — then exposure, composition and natural-light portraits, and finish with editing a cohesive set and building a portfolio that books clients.',
      categoryId: 'cat_photo',
      level: 'Beginner',
      coverImage: cover('eduflow-photo-course'),
      teacherId: 'u_james',
      status: 'published',
      featured: true,
      createdAt: daysAgoISO(26),
      whatYouLearn: [
        'Shoot in manual mode with confidence',
        'Compose images that lead the eye on purpose',
        'Use natural window light for flattering portraits',
        'Edit a set of photos so they belong together',
      ],
      chapters: [
        ch('c_photo_ch1', 'Seeing the Light', 'Hard vs soft, direction and colour — learn to read light before you touch a setting.', 10, true),
        ch('c_photo_ch2', 'Aperture, Shutter & ISO', 'The exposure triangle explained so it finally clicks, with exercises on any camera.', 14),
        ch('c_photo_ch3', 'Composition Rules Worth Breaking', 'Rule of thirds, leading lines and negative space — and when breaking them is better.', 13),
        ch('c_photo_ch4', 'Portraits with Natural Light', 'Window light, reflectors and posing cues that make anyone look their best.', 15),
        ch('c_photo_ch5', 'Editing a Cohesive Set', 'Cull, correct and grade so a series of photos feels like one voice.', 12, true),
        ch('c_photo_ch6', 'A Portfolio that Books Clients', 'Sequence your best work into a portfolio that says exactly what you charge for.', 16),
      ],
    },
  ];

  // ── enrolments: [student, course, daysAgoEnrolled, completedChapterIds] ──
  type E = [string, string, number, string[], number];
  const spec: E[] = [
    // Maya — the demo student: one finished course, one in progress, one just started
    ['u_maya', 'c_react', 5, ['c_react_ch1', 'c_react_ch2', 'c_react_ch3'], 1],
    ['u_maya', 'c_js', 40, ['c_js_ch1', 'c_js_ch2', 'c_js_ch3', 'c_js_ch4', 'c_js_ch5'], 35],
    ['u_maya', 'c_photo', 12, ['c_photo_ch1'], 2],
    // the rest of the crowd
    ['u_lucas', 'c_react', 2, ['c_react_ch1', 'c_react_ch2', 'c_react_ch3', 'c_react_ch4'], 2],
    ['u_lucas', 'c_figma', 9, ['c_figma_ch1', 'c_figma_ch2'], 4],
    ['u_priya', 'c_js', 28, ['c_js_ch1', 'c_js_ch2', 'c_js_ch3', 'c_js_ch4'], 6],
    ['u_priya', 'c_seo', 6, ['c_seo_ch1'], 1],
    ['u_tomas', 'c_figma', 20, ['c_figma_ch1', 'c_figma_ch2', 'c_figma_ch3', 'c_figma_ch4', 'c_figma_ch5'], 16],
    ['u_tomas', 'c_ds', 4, ['c_ds_ch1', 'c_ds_ch2'], 3],
    ['u_aisha', 'c_fin', 25, ['c_fin_ch1', 'c_fin_ch2', 'c_fin_ch3'], 9],
    ['u_aisha', 'c_react', 1, ['c_react_ch1'], 1],
    ['u_jonas', 'c_photo', 16, ['c_photo_ch1', 'c_photo_ch2', 'c_photo_ch3', 'c_photo_ch4', 'c_photo_ch5'], 3],
    ['u_jonas', 'c_seo', 0, [], 0],
    ['u_hana', 'c_js', 11, ['c_js_ch1', 'c_js_ch2', 'c_js_ch3', 'c_js_ch4', 'c_js_ch5'], 7],
    ['u_hana', 'c_react', 7, ['c_react_ch1', 'c_react_ch2'], 5],
    ['u_marcus', 'c_fin', 18, ['c_fin_ch1', 'c_fin_ch2', 'c_fin_ch3', 'c_fin_ch4'], 12],
    ['u_marcus', 'c_seo', 3, ['c_seo_ch1', 'c_seo_ch2'], 2],
    ['u_elena', 'c_figma', 10, ['c_figma_ch1', 'c_figma_ch2', 'c_figma_ch3'], 8],
    ['u_elena', 'c_ds', 2, [], 2],
    ['u_david', 'c_react', 4, ['c_react_ch1', 'c_react_ch2'], 4],
    ['u_david', 'c_photo', 1, [], 1],
    ['u_chloe', 'c_js', 6, ['c_js_ch1'], 6],
    ['u_chloe', 'c_fin', 2, ['c_fin_ch1'], 2],
    ['u_sam', 'c_seo', 1, [], 1],
    ['u_sam', 'c_react', 0, [], 0],
  ];

  const enrolments: Enrolment[] = spec.map(([studentId, courseId, days, completed, accessed], i) => ({
    id: `e_${i + 1}`,
    studentId,
    courseId,
    enrolledAt: daysAgoISO(days, i % 6),
    lastAccessedAt: daysAgoISO(accessed, i % 4),
    completedChapterIds: completed,
  }));

  const certificates: AppData['certificates'] = [
    { id: 'cert_1', studentId: 'u_maya', courseId: 'c_js', issuedAt: daysAgoISO(35), code: makeCode('u_maya', 'c_js') },
    { id: 'cert_2', studentId: 'u_tomas', courseId: 'c_figma', issuedAt: daysAgoISO(15), code: makeCode('u_tomas', 'c_figma') },
    { id: 'cert_3', studentId: 'u_hana', courseId: 'c_js', issuedAt: daysAgoISO(6), code: makeCode('u_hana', 'c_js') },
  ];

  return { categories, courses, users, enrolments, certificates };
}

export const LEVELS: Level[] = ['Beginner', 'Intermediate', 'Advanced'];
