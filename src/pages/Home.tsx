import {
  Github,
  Linkedin,
  Mail,
  Code,
  Layers,
  Server,
  Cloud,
  Wrench,
  ExternalLink,
  Calendar,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HERO, SKILLS, PROJECTS, EXPERIENCE, CONTACT } from "@/lib/portfolio-data";

const SKILL_ICONS: Record<string, React.ReactNode> = {
  Languages: <Code className="h-4 w-4" />,
  Frontend: <Layers className="h-4 w-4" />,
  Backend: <Server className="h-4 w-4" />,
  "Cloud & Infrastructure": <Cloud className="h-4 w-4" />,
  "Tools & Practices": <Wrench className="h-4 w-4" />,
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-3xl font-bold">{children}</h2>
      <div className="mt-3 h-1 w-12 rounded-full bg-primary" />
    </div>
  );
}

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section
        id="hero"
        className="-mt-8 -mx-4 px-4 py-28 text-center border-b bg-muted/40"
      >
        <p className="text-sm font-semibold tracking-widest uppercase text-muted-foreground mb-4">
          Full-Stack Engineer
        </p>
        <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-6">
          Karl Nilros
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          {HERO.tagline}
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Button asChild size="lg">
            <a href={CONTACT.github} target="_blank" rel="noopener noreferrer">
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer">
              <Linkedin className="mr-2 h-4 w-4" />
              LinkedIn
            </a>
          </Button>
          <Button asChild size="lg" variant="ghost">
            <a href="#contact">
              <Mail className="mr-2 h-4 w-4" />
              Get in touch
            </a>
          </Button>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 border-b">
        <SectionHeading>About</SectionHeading>
        <div className="max-w-3xl space-y-4 text-muted-foreground leading-relaxed text-lg">
          {HERO.bio.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section id="skills" className="py-20 border-b bg-muted/20">
        <div className="-mx-4 px-4">
          <SectionHeading>Skills</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SKILLS.map((category) => (
              <Card key={category.label}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 font-semibold">
                    {SKILL_ICONS[category.label]}
                    {category.label}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="py-20 border-b">
        <SectionHeading>Featured Projects</SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PROJECTS.map((project, i) =>
            project.comingSoon ? (
              <Card
                key={i}
                className="flex flex-col border-dashed opacity-50"
              >
                <CardHeader>
                  <h3 className="font-semibold text-lg text-muted-foreground">
                    {project.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                </CardHeader>
              </Card>
            ) : (
              <Card key={project.title} className="flex flex-col">
                <CardHeader>
                  <h3 className="font-semibold text-lg leading-snug">{project.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                {(project.githubUrl ?? project.liveUrl) && (
                  <CardFooter className="gap-2">
                    {project.githubUrl && (
                      <Button asChild size="sm" variant="ghost">
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Github className="mr-1.5 h-3.5 w-3.5" />
                          Code
                        </a>
                      </Button>
                    )}
                    {project.liveUrl && (
                      <Button asChild size="sm" variant="ghost">
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                          Live
                        </a>
                      </Button>
                    )}
                  </CardFooter>
                )}
              </Card>
            )
          )}
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="py-20 border-b bg-muted/20">
        <div className="-mx-4 px-4">
          <SectionHeading>Experience</SectionHeading>
          <div className="space-y-12">
            {EXPERIENCE.map((exp) => (
              <div key={exp.company} className="relative pl-8 border-l-2 border-border">
                <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-primary bg-background" />
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
                  <h3 className="font-semibold text-xl">{exp.role}</h3>
                  <span className="text-muted-foreground text-lg">at {exp.company}</span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-5">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {exp.period}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {exp.location}
                  </span>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  {exp.bullets.map((bullet, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="text-primary font-bold mt-0.5 shrink-0">–</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20">
        <SectionHeading>Get In Touch</SectionHeading>
        <p className="text-muted-foreground text-lg max-w-xl mb-8">
          Open to senior engineering roles and interesting projects. The best way to reach me
          is email or LinkedIn.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <Button asChild size="lg">
            <a href={`mailto:${CONTACT.email}`}>
              <Mail className="mr-2 h-4 w-4" />
              {CONTACT.email}
            </a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer">
              <Linkedin className="mr-2 h-4 w-4" />
              LinkedIn
            </a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href={CONTACT.github} target="_blank" rel="noopener noreferrer">
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
