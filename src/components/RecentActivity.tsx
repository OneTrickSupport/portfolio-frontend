import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  ChevronDown,
  GitCommitHorizontal,
  GitPullRequest,
  Tag,
  FolderGit2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { api, type ActivityItem } from "@/lib/api";
import { CONTACT } from "@/lib/portfolio-data";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const mono: React.CSSProperties = { fontFamily: "var(--font-mono-accent)" };

const KIND_ICON: Record<ActivityItem["kind"], LucideIcon> = {
  commit: GitCommitHorizontal,
  pull_request: GitPullRequest,
  release: Tag,
  repo: FolderGit2,
};

const KIND_VERB: Record<ActivityItem["kind"], string> = {
  commit: "Committed",
  pull_request: "Opened PR",
  release: "Released",
  repo: "Created repo",
};

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const secs = Math.round((Date.now() - then) / 1000);
  const units: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.34524, "week"],
    [12, "month"],
    [Number.POSITIVE_INFINITY, "year"],
  ];
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  let value = -secs;
  for (const [amount, unit] of units) {
    if (Math.abs(value) < amount) return rtf.format(Math.round(value), unit);
    value /= amount;
  }
  return "";
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{ ...mono, fontSize: "0.68rem", letterSpacing: "0.14em" }}
      className="uppercase text-muted-foreground mb-3"
    >
      {children}
    </p>
  );
}

const COLLAPSED_COUNT = 4;

export default function RecentActivity() {
  const reveal = useScrollReveal<HTMLElement>();
  const [expanded, setExpanded] = useState(false);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["github-activity"],
    queryFn: () =>
      api<{ items: ActivityItem[] }>("/github/activity?limit=15").then(
        (r) => r.items,
      ),
    staleTime: 5 * 60_000,
  });

  // Keep the page clean: if the feed genuinely has nothing, don't render an
  // empty shell. Errors still show a graceful fallback below.
  if (!isLoading && !isError && (!data || data.length === 0)) return null;

  return (
    <section
      id="activity"
      ref={reveal.ref}
      className={`py-20 border-b transition-all duration-700 ${
        reveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      }`}
    >
      <div className="max-w-5xl">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <Label>Recent Activity</Label>
            <p className="text-muted-foreground text-sm">
              Commits, pull requests, and releases across my public repos.
            </p>
          </div>
          <a
            href={CONTACT.github}
            target="_blank"
            rel="noopener noreferrer"
            className="group hidden sm:flex items-center gap-1 text-sm font-medium hover:text-muted-foreground transition-colors shrink-0"
          >
            View on GitHub
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        {isError ? (
          <p className="text-sm text-muted-foreground">
            Couldn't load recent activity right now —{" "}
            <a
              href={CONTACT.github}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              see it on GitHub
            </a>
            .
          </p>
        ) : isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="py-3.5 flex items-center gap-4">
                <div className="h-3.5 w-16 rounded bg-muted animate-pulse" />
                <div className="h-3.5 flex-1 rounded bg-muted animate-pulse" />
                <div className="h-3.5 w-24 rounded bg-muted animate-pulse hidden sm:block" />
              </div>
            ))}
          </div>
        ) : (
          <>
          <div className="divide-y divide-border border-y">
            {(expanded ? data! : data!.slice(0, COLLAPSED_COUNT)).map((item) => {
              const Icon = KIND_ICON[item.kind];
              return (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_auto] items-baseline gap-x-4 gap-y-1 py-3.5 hover:pl-2 transition-all"
                >
                  <span
                    style={{ ...mono, fontSize: "0.72rem" }}
                    className="text-muted-foreground flex items-center gap-1.5 shrink-0"
                    title={KIND_VERB[item.kind]}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    {item.ref ?? KIND_VERB[item.kind]}
                  </span>

                  <span className="min-w-0 truncate text-sm font-medium">
                    {item.title}
                  </span>

                  <span
                    style={{ ...mono, fontSize: "0.68rem" }}
                    className="col-start-2 sm:col-start-3 flex items-center gap-3 text-muted-foreground shrink-0"
                  >
                    <span className="truncate max-w-[9rem]">{item.repoName}</span>
                    <span className="opacity-60">·</span>
                    <span className="whitespace-nowrap">
                      {relativeTime(item.date)}
                    </span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                </a>
              );
            })}
          </div>

          {data!.length > COLLAPSED_COUNT && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="group mt-5 flex items-center gap-1.5 text-sm font-medium hover:text-muted-foreground transition-colors"
            >
              {expanded ? "Show less" : `View ${data!.length - COLLAPSED_COUNT} more`}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
              />
            </button>
          )}
          </>
        )}
      </div>
    </section>
  );
}
