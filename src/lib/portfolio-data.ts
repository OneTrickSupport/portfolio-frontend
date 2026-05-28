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
    skills: ["React", "Vite", "Tailwind CSS", "shadcn/ui", "Radix UI", "TanStack Query"],
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
      "shadcn/ui",
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
    role: "Full-Stack Developer",
    period: "Sep 2024 – Present",
    location: "Stockholm, Sweden",
    bullets: [
      "Built and owned the full stock, ETF, and crypto trading flows inside the Klarna app — end-to-end features used by millions of users across Europe, from order placement to real-time portfolio tracking.",
      "Designed and scaled high-throughput fintech microservices handling billions of payment events per month, with strict reliability, latency, and compliance requirements across multiple markets.",
      "Owned critical data pipelines and large-scale DynamoDB and PostgreSQL systems storing hundreds of millions of financial records — with zero-downtime migrations, multi-region replication, and sub-10ms p99 query performance.",
    ],
  },
  {
    company: "AEB",
    role: "Development Lead",
    period: "Feb 2023 – Sep 2024",
    location: "Malmö, Sweden",
    bullets: [
      "Led a team of junior developers across multiple concurrent projects, owning delivery from planning to production while maintaining high standards for code quality and architectural consistency.",
      "Mentored developers through code reviews and pair programming, conducted technical interviews, and played a key role in growing the engineering team at the Swedish office.",
      "Sat on the planning board to align technical strategy with business goals — anticipating bottlenecks, streamlining workflows, and bridging the gap between product and engineering.",
    ],
  },
  {
    company: "AEB",
    role: "Front End Developer",
    period: "Feb 2021 – Feb 2023",
    location: "Malmö, Sweden",
    bullets: [
      "Early member of AEB Sweden — helped design and build Transport Management Systems (TMS) from the ground up using Angular, GraphQL, and Node.js, with a strong focus on performance and usability.",
      "Built shared Angular component libraries and generic typed application shells that unified UI design across the product suite and significantly accelerated delivery across teams.",
      "Implemented secure backend integrations in TypeScript and Express, including authentication flows and third-party API connections for logistics data handling.",
    ],
  },
];

export const CONTACT = {
  email: "kallenilros@gmail.com",
  github: "https://github.com/OneTrickSupport",
  linkedin: "https://linkedin.com/in/karlnilros",
};
