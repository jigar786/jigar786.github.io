// All site content lives here. Edit this file to update the website.

export interface Link { label: string; href: string }
export interface Stat { value: string; label: string }
export interface Service { title: string; body: string }
export interface Job { company: string; role: string; start: string; end: string; highlights: string[] }
export interface Project { name: string; period: string; stack: string[]; summary: string }
export interface SkillGroup { group: string; items: string[] }
export interface Education { school: string; degree: string; period: string; score: string }
export interface Profile {
  name: string;
  title: string;
  location: string;
  email: string;
  availability: string;
  headline: { lead: string; accent: string; rotating: string[] };
  intro: string;
  resumeUrl: string;
  links: Link[];
  stats: Stat[];
  services: Service[];
  experience: Job[];
  projects: Project[];
  skills: SkillGroup[];
  achievements: string[];
  education: Education[];
  openToRoles: string;
  seo: { title: string; description: string };
}

// Years of experience, counted from the first full-time role (Aug 2019).
// Recomputed on every build, so the number stays current.
const CAREER_START = new Date(2019, 7, 1);
const NOW = new Date();
export const yearsOfExperience =
  NOW.getFullYear() - CAREER_START.getFullYear() - (NOW.getMonth() < CAREER_START.getMonth() ? 1 : 0);

export const profile: Profile = {
  name: 'Jigar Panchal',
  title: 'Senior Software Engineer',
  location: 'Mumbai, India',
  email: 'panchaljigar82@gmail.com',
  availability: 'Open to interesting work',
  headline: {
    lead: 'Backend engineer who makes',
    accent: 'slow systems fast',
    // The teal phrase types out, pauses, deletes and cycles through these. The first is the default.
    rotating: [
      'slow systems fast',
      'old code modern',
      'messy code clean',
      'flaky APIs solid',
    ],
  },
  intro:
    `${yearsOfExperience}+ years building fast, reliable backends for fintech and learning platforms, mostly in Ruby on Rails, also Node.js and Python. 7–\u20608x faster queries. 2 weeks of manual onboarding → fully automated.`,
  resumeUrl: '/jigar-panchal-resume.pdf',
  links: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/jigar-panchal-889610112' },
    { label: 'GitHub', href: 'https://github.com/jigar786' },
  ],
  stats: [
    { value: `${yearsOfExperience}+`, label: 'Years of experience' },
    { value: '50k+', label: 'Users served' },
    { value: '7–8x', label: 'Faster database queries' },
    { value: '~20%', label: 'Company revenue from a module I owned' },
  ],
  services: [
    {
      title: 'Backend & API development',
      body: 'Designing and shipping clean, well-tested services and APIs in Ruby on Rails, Node.js, Python, or whatever your stack runs on.',
    },
    {
      title: 'Performance rescue',
      body: 'Finding and fixing what makes a system slow: heavy queries, N+1s, missing indexes, background-job bottlenecks and caching.',
    },
    {
      title: 'Upgrades & modernization',
      body: 'Moving legacy codebases (Rails, Node.js and beyond) to current versions safely, improving stability, security and maintainability.',
    },
  ],
  experience: [
    {
      company: 'Handelnine Global',
      role: 'Senior Software Engineer',
      start: 'Oct 2026',
      end: 'Present',
      highlights: ['Building and scaling backend systems for a global e-commerce business.'],
    },
    {
      company: 'HowNow',
      role: 'Software Development Engineer',
      start: 'Jan 2023',
      end: 'Oct 2026',
      highlights: [
        'Owned the HowNow Plus module, which contributes about 20% of company revenue, on a learning platform serving 50k+ users across 50+ enterprise clients.',
        'Automated seeding of ~2,000 courses, turning about two weeks of manual onboarding work into a fully automated process.',
        'Built AI-driven job role–skill mapping to surface organizational skill gaps, and integrated EasyGenerator for third-party content.',
      ],
    },
    {
      company: 'Velotio Technologies',
      role: 'Software Development Engineer',
      start: 'Jan 2022',
      end: 'Jan 2023',
      highlights: [
        'Optimized queries over large datasets for 7–\u20608x faster performance and 2–\u20603x faster frontend page loads.',
        'Led the upgrade from Node.js 10 to the latest stable release, improving stability, security and maintainability.',
      ],
    },
    {
      company: 'Happy Loans',
      role: 'Software Development Engineer',
      start: 'May 2021',
      end: 'Dec 2021',
      highlights: [
        'Built backend services for a digital lending platform covering loan application, approval and disbursement.',
        'Designed Rails REST APIs and Pub/Sub-based microservices for decoupled, scalable loan processing.',
      ],
    },
    {
      company: 'Drip Capital',
      role: 'Software Development Engineer',
      start: 'Aug 2019',
      end: 'Apr 2021',
      highlights: [
        'Developed core features of a trade-finance platform for exporters, importers and invoice financing.',
        'Optimized complex queries and backend logic, and maintained the Rails APIs behind core financial products.',
      ],
    },
  ],
  projects: [
    {
      name: 'WedEasy',
      period: '2020',
      stack: ['Django', 'Firebase', 'JavaScript'],
      summary: 'Wedding-planning dashboard with vendor management, scheduling and task tracking.',
    },
    {
      name: 'Citizen Service Problems',
      period: '2018',
      stack: ['Django', 'OpenCV', 'Python'],
      summary: 'Civic-issue reporting app that uses computer vision (contour detection) to estimate pothole dimensions. Deep Blue semifinalist.',
    },
  ],
  skills: [
    { group: 'Languages', items: ['Ruby', 'Python', 'SQL', 'JavaScript'] },
    { group: 'Frameworks', items: ['Ruby on Rails', 'Django', 'Node.js'] },
    { group: 'Databases', items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis'] },
    { group: 'Tools', items: ['Sidekiq', 'Resque', 'RSpec', 'Git', 'REST APIs'] },
  ],
  achievements: [
    'Teammate of the Quarter at HowNow (Q2 2024)',
    'Gold Medal, first rank at Vidyalankar Polytechnic (2016)',
    'L&T Achievement Certificate for final-year diploma project (2016)',
    'Semifinalist, Deep Blue Project Competition (2018)',
  ],
  education: [
    {
      school: "SVKM's Dwarkadas J. Sanghvi College of Engineering",
      degree: 'B.Tech, Computer Engineering',
      period: '2016 – 2019',
      score: 'CGPA 9.21',
    },
    {
      school: 'Vidyalankar Polytechnic',
      degree: 'Diploma, Computer Engineering',
      period: '2013 – 2016',
      score: '90%',
    },
  ],
  openToRoles: 'Not actively looking, but always happy to hear about interesting freelance projects or roles.',
  seo: {
    title: 'Jigar Panchal · Senior Software Engineer',
    description:
      `Jigar Panchal is a senior software engineer with ${yearsOfExperience}+ years building fast, reliable systems in Ruby on Rails, Node.js and Python, and solving hard problems in any stack.`,
  },
};
