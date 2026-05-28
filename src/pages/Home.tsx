import { ArrowUpRight, MapPin } from "lucide-react";
import { HERO, SKILLS, PROJECTS, EXPERIENCE, CONTACT } from "@/lib/portfolio-data";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const mono: React.CSSProperties = { fontFamily: 'var(--font-mono-accent)' };
const display: React.CSSProperties = { fontFamily: 'var(--font-display)' };

function revealClass(isVisible: boolean) {
  return `transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ ...mono, fontSize: '0.68rem', letterSpacing: '0.14em' }} className="uppercase text-muted-foreground mb-3">
      {children}
    </p>
  );
}

export default function Home() {
  const about = useScrollReveal<HTMLElement>();
  const skills = useScrollReveal<HTMLElement>();
  const projects = useScrollReveal<HTMLElement>();
  const experience = useScrollReveal<HTMLElement>();
  const contact = useScrollReveal<HTMLElement>();

  return (
    <div>
      {/* ── Hero ───────────────────────────────────────────── */}
      <section
        id="hero"
        className="-mt-8 -mx-4 px-6 md:px-10 pt-16 pb-20 border-b relative overflow-hidden"
      >
        {/* Dot-grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, hsl(var(--foreground) / 0.07) 1.5px, transparent 1.5px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative max-w-5xl flex flex-col md:flex-row md:items-center md:justify-between gap-12">
          {/* Left: text content */}
          <div className="flex-1 min-w-0">
            <p
              className="hero-label text-muted-foreground mb-5"
              style={{ ...mono, fontSize: '0.68rem', letterSpacing: '0.18em' }}
            >
              FULL-STACK ENGINEER · STOCKHOLM, SWEDEN
            </p>

            <h1
              className="hero-name leading-[0.88] tracking-tight mb-6"
              style={{
                ...display,
                fontStyle: 'italic',
                fontVariationSettings: '"opsz" 144, "wght" 900',
                fontSize: 'clamp(5.5rem, 14vw, 10.5rem)',
              }}
            >
              Karl<br />Nilros
            </h1>

            <div
              className="hero-line mb-7 bg-foreground"
              style={{ height: '2px', transformOrigin: 'left' }}
            />

            <p className="hero-tagline text-muted-foreground max-w-lg mb-10 text-lg leading-relaxed">
              {HERO.tagline}
            </p>

            <div className="hero-ctas flex flex-wrap gap-7 items-center">
              {[
                { href: CONTACT.github, label: 'GitHub', external: true },
                { href: CONTACT.linkedin, label: 'LinkedIn', external: true },
                { href: '#contact', label: 'Get in touch', external: false },
              ].map(({ href, label, external }) => (
                <a
                  key={label}
                  href={href}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="group flex items-center gap-1.5 font-medium text-sm hover:text-muted-foreground transition-colors"
                >
                  {label}
                  <ArrowUpRight
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Right: avatar */}
          <div className="hero-avatar flex-shrink-0 flex items-center justify-center md:justify-end">
            <Avatar
              className="w-32 h-32 md:w-56 md:h-56 ring-2 ring-border"
              style={{ boxShadow: '0 0 0 6px hsl(var(--background)), 0 0 0 8px hsl(var(--border))' }}
            >
              <AvatarImage src="/avatar.jpg" alt="Karl Nilros" className="object-cover object-top" />
              <AvatarFallback
                className="bg-foreground text-background select-none"
                style={{
                  ...display,
                  fontStyle: 'italic',
                  fontVariationSettings: '"opsz" 72, "wght" 800',
                  fontSize: 'clamp(1.75rem, 5vw, 3.5rem)',
                }}
              >
                KN
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </section>

      {/* ── About ──────────────────────────────────────────── */}
      <section
        id="about"
        ref={about.ref}
        className={`py-20 border-b ${revealClass(about.isVisible)}`}
      >
        <div className="max-w-5xl">
          <Label>About</Label>
          <div className="grid md:grid-cols-[1fr_2fr] gap-10 items-start">
            <h2
              className="text-3xl leading-tight"
              style={{ ...display, fontStyle: 'italic', fontVariationSettings: '"opsz" 40, "wght" 600' }}
            >
              Building at the intersection of product and infrastructure.
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              {HERO.bio.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Skills ─────────────────────────────────────────── */}
      <section
        id="skills"
        ref={skills.ref}
        className={`py-20 border-b ${revealClass(skills.isVisible)}`}
      >
        <div className="max-w-5xl">
          <Label>Skills</Label>
          <div className="divide-y divide-border">
            {SKILLS.map((category) => (
              <div key={category.label} className="py-5 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-3 items-baseline">
                <span
                  className="text-muted-foreground shrink-0"
                  style={{ ...mono, fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}
                >
                  {category.label}
                </span>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="transition-transform hover:scale-105 cursor-default"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Projects ───────────────────────────────────────── */}
      <section
        id="projects"
        ref={projects.ref}
        className={`py-20 border-b ${revealClass(projects.isVisible)}`}
      >
        <div className="max-w-5xl">
          <Label>Featured Projects</Label>

          <div className="space-y-4">
            {PROJECTS.map((project, i) =>
              project.comingSoon ? (
                <div
                  key={i}
                  className="py-6 px-6 border border-dashed rounded-lg opacity-40 flex items-center justify-between"
                >
                  <span style={{ ...mono, fontSize: '0.75rem', letterSpacing: '0.08em' }} className="uppercase text-muted-foreground">
                    Next project — in progress
                  </span>
                  <span style={{ ...mono, fontSize: '0.75rem' }} className="text-muted-foreground">↗</span>
                </div>
              ) : (
                <div
                  key={project.title}
                  className="group border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex">
                    <div className="w-1 shrink-0 bg-foreground" />
                    <div className="p-7 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                        <h3
                          className="text-2xl leading-tight"
                          style={{ ...display, fontStyle: 'italic', fontVariationSettings: '"opsz" 30, "wght" 700' }}
                        >
                          {project.title}
                        </h3>
                        <div className="flex gap-5 shrink-0">
                          {project.githubUrl && (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group/link flex items-center gap-1 text-sm font-medium hover:text-muted-foreground transition-colors"
                            >
                              Code
                              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                            </a>
                          )}
                          {project.liveUrl && (
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group/link flex items-center gap-1 text-sm font-medium hover:text-muted-foreground transition-colors"
                            >
                              Live
                              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-5 max-w-2xl leading-relaxed">
                        {project.description}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── Experience ─────────────────────────────────────── */}
      <section
        id="experience"
        ref={experience.ref}
        className={`py-20 border-b ${revealClass(experience.isVisible)}`}
      >
        <div className="max-w-5xl">
          <Label>Experience</Label>

          <div className="space-y-14">
            {EXPERIENCE.map((exp) => (
              <div key={exp.company} className="grid md:grid-cols-[180px_1fr] gap-6 items-start">
                <div className="shrink-0">
                  <p
                    className="text-muted-foreground leading-snug"
                    style={{ ...mono, fontSize: '0.72rem', letterSpacing: '0.04em' }}
                  >
                    {exp.period}
                  </p>
                  <p
                    className="text-muted-foreground mt-1 flex items-center gap-1"
                    style={{ ...mono, fontSize: '0.68rem' }}
                  >
                    <MapPin className="h-2.5 w-2.5 shrink-0" />
                    {exp.location}
                  </p>
                </div>

                <div>
                  <h3
                    className="text-2xl leading-tight mb-1"
                    style={{ ...display, fontStyle: 'italic', fontVariationSettings: '"opsz" 30, "wght" 700' }}
                  >
                    {exp.role}
                  </h3>
                  <p
                    className="text-muted-foreground mb-5"
                    style={{ ...mono, fontSize: '0.75rem', letterSpacing: '0.06em' }}
                  >
                    {exp.company.toUpperCase()}
                  </p>

                  <ul className="space-y-2">
                    {exp.bullets.map((bullet, i) => (
                      <li key={i} className="flex gap-3 text-muted-foreground text-sm leading-relaxed">
                        <span className="shrink-0 mt-0.5 font-bold">—</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ────────────────────────────────────────── */}
      <section
        id="contact"
        ref={contact.ref}
        className={`py-24 ${revealClass(contact.isVisible)}`}
      >
        <div className="max-w-5xl">
          <Label>Contact</Label>

          <h2
            className="leading-tight mb-10"
            style={{
              ...display,
              fontStyle: 'italic',
              fontVariationSettings: '"opsz" 72, "wght" 800',
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            }}
          >
            Let's work together.
          </h2>

          <Separator />

          <a
            href={`mailto:${CONTACT.email}`}
            className="group flex items-center justify-between py-5 hover:pl-2 transition-all"
          >
            <div>
              <p style={{ ...mono, fontSize: '0.65rem', letterSpacing: '0.14em' }} className="uppercase text-muted-foreground mb-1">
                Email
              </p>
              <p className="text-lg font-medium">{CONTACT.email}</p>
            </div>
            <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </a>

          <Separator />

          <a
            href={CONTACT.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between py-5 hover:pl-2 transition-all"
          >
            <div>
              <p style={{ ...mono, fontSize: '0.65rem', letterSpacing: '0.14em' }} className="uppercase text-muted-foreground mb-1">
                LinkedIn
              </p>
              <p className="text-lg font-medium">linkedin.com/in/karlnilros</p>
            </div>
            <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </a>

          <Separator />

          <a
            href={CONTACT.github}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between py-5 hover:pl-2 transition-all"
          >
            <div>
              <p style={{ ...mono, fontSize: '0.65rem', letterSpacing: '0.14em' }} className="uppercase text-muted-foreground mb-1">
                GitHub
              </p>
              <p className="text-lg font-medium">github.com/OneTrickSupport</p>
            </div>
            <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </a>

          <Separator />
        </div>
      </section>
    </div>
  );
}
