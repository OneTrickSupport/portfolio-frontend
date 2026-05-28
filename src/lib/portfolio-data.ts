export type SkillCategory = {
  label: string;
  skills: string[];
};

export type Project = {
  title: string;
  description: string;
  tags: string[];
  githubUrl?: string;
  liveUrl?: string;
  comingSoon?: boolean;
};

export type Experience = {
  company: string;
  role: string;
  period: string;
  location: string;
  bullets: string[];
};

export const HERO = {
  tagline: "Full-Stack Engineer building production-grade products at scale.",
  bio: [
    "I'm a full-stack engineer at Klarna working on the consumer investment product — the features that let millions of users buy, hold, and sell stocks, ETFs, and crypto directly in the Klarna app.",
    "I work across the entire stack: TypeScript React on the frontend, Node.js/Fastify microservices on the backend, and AWS infrastructure (Lambda, DynamoDB, Cognito, API Gateway) managed with Terraform.",
    "I care about production reliability, developer experience, and shipping things that scale. CI/CD and observability aren't afterthoughts — they're part of how I build.",
    "Outside of Klarna I build side projects to go deeper on infra and full-stack architecture — this site is one of them.",
  ],
};

export const SKILLS: SkillCategory[] = [
  {
    label: "Languages",
    skills: ["TypeScript", "JavaScript", "SQL"],
  },
  {
    label: "Frontend",
    skills: ["React", "Vite", "Tailwind CSS", "Radix UI", "TanStack Query"],
  },
  {
    label: "Backend",
    skills: ["Node.js", "Fastify", "REST APIs", "AWS Lambda"],
  },
  {
    label: "Cloud & Infrastructure",
    skills: ["AWS Lambda", "DynamoDB", "Cognito", "API Gateway", "Terraform", "GitHub Actions"],
  },
  {
    label: "Tools & Practices",
    skills: ["PostgreSQL", "Docker", "Git", "CI/CD", "Test-driven development"],
  },
];

export const PROJECTS: Project[] = [
  {
    title: "karlnilros.dev",
    description:
      "This site — a full-stack portfolio built on React + TypeScript, Fastify on AWS Lambda, DynamoDB, Cognito auth, Terraform-managed infra, and GitHub Actions CI/CD.",
    tags: [
      "React",
      "TypeScript",
      "AWS Lambda",
      "DynamoDB",
      "Cognito",
      "Terraform",
      "GitHub Actions",
    ],
    githubUrl: "https://github.com/OneTrickSupport/portfolio-frontend",
    liveUrl: "/",
  },
  {
    title: "Coming Soon",
    description: "Next project in progress — check back or follow on GitHub for updates.",
    tags: [],
    comingSoon: true,
  },
  {
    title: "Coming Soon",
    description: "Next project in progress — check back or follow on GitHub for updates.",
    tags: [],
    comingSoon: true,
  },
];

export const EXPERIENCE: Experience[] = [
  {
    company: "Klarna",
    role: "Full-Stack Engineer",
    period: "2021 – Present",
    location: "Stockholm, Sweden",
    bullets: [
      "TODO: Add your Klarna highlights here — e.g. 'Built and owned the stock/ETF/crypto trading flows used by millions of Klarna users'",
    ],
  },
];

export const CONTACT = {
  email: "kallenilros@gmail.com",
  github: "https://github.com/OneTrickSupport",
  linkedin: "https://linkedin.com/in/karlnilros",
};
