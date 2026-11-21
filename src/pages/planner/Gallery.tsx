import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Heart, MessageCircle, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { formatDate, plannerApi, type DesignSummary } from "@/lib/planner";

const mono: React.CSSProperties = { fontFamily: "var(--font-mono-accent)" };
const display: React.CSSProperties = { fontFamily: "var(--font-display)" };

function DesignCard({ design, mine }: { design: DesignSummary; mine: boolean }) {
  // Previews are image data drawn by the planner; anything else is not shown.
  const thumb = design.thumb?.startsWith("data:image/") ? design.thumb : undefined;
  return (
    <Link
      to={`/planner/d/${design.designId}`}
      className="group block rounded-lg border bg-card overflow-hidden transition-colors hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="aspect-[4/3] bg-muted border-b">
        {thumb ? (
          <img src={thumb} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="h-full w-full grid place-items-center text-sm text-muted-foreground">Ingen bild</div>
        )}
      </div>
      <div className="p-4 space-y-2">
        <h2 className="font-semibold leading-snug break-words group-hover:underline underline-offset-4">{design.title}</h2>
        <p className="text-sm text-muted-foreground">
          {mine ? "Din design" : `av ${design.ownerName}`}, {formatDate(design.updatedAt)}
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground" style={mono}>
          <span className="inline-flex items-center gap-1.5" title="Gillningar">
            <Heart className="h-3.5 w-3.5" aria-hidden /> {design.likeCount}
            <span className="sr-only">gillningar</span>
          </span>
          <span className="inline-flex items-center gap-1.5" title="Kommentarer">
            <MessageCircle className="h-3.5 w-3.5" aria-hidden /> {design.commentCount}
            <span className="sr-only">kommentarer</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function PlannerGallery() {
  const { user } = useAuth();
  const [onlyMine, setOnlyMine] = useState(false);
  const designs = useQuery({ queryKey: ["planner", "designs"], queryFn: plannerApi.list });

  const all = designs.data ?? [];
  const shown = onlyMine && user ? all.filter((d) => d.ownerId === user.userId) : all;
  const hasMine = !!user && all.some((d) => d.ownerId === user.userId);

  return (
    <div className="space-y-10">
      <section className="max-w-2xl space-y-5">
        <p style={{ ...mono, fontSize: "0.68rem", letterSpacing: "0.14em" }} className="uppercase text-muted-foreground">
          Möblera
        </p>
        <h1
          style={{ ...display, fontStyle: "italic", fontVariationSettings: '"opsz" 72, "wght" 800' }}
          className="text-5xl md:text-6xl leading-[0.95] tracking-tight"
        >
          Hur skulle du möblera lägenheten?
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Här är min nya lägenhet på 94 m², ritad i 2D och 3D. Den är omöblerad: ställ in soffor, sängar och lampor
          från katalogen, och bygg om väggar om du vill. Du behöver inte logga in för att prova. Vill du spara ditt
          förslag så att andra kan se det loggar du in först.
        </p>
        <Button asChild size="lg">
          <Link to="/planner/new">
            <Plus className="h-4 w-4 mr-2" aria-hidden /> Börja möblera
          </Link>
        </Button>
      </section>

      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b pb-3">
          <h2 className="text-xl font-semibold">Sparade förslag</h2>
          {hasMine && (
            <div className="inline-flex rounded-md border overflow-hidden text-sm" role="group" aria-label="Vilka förslag som visas">
              {[
                { on: false, label: "Alla" },
                { on: true, label: "Mina" },
              ].map(({ on, label }) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={onlyMine === on}
                  onClick={() => setOnlyMine(on)}
                  className={`px-3 py-1.5 transition-colors ${onlyMine === on ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {designs.isLoading ? (
          <p className="text-muted-foreground">Hämtar förslag…</p>
        ) : designs.error ? (
          <div className="space-y-3">
            <p className="text-destructive">Förslagen gick inte att hämta just nu.</p>
            <Button variant="outline" size="sm" onClick={() => void designs.refetch()}>
              Försök igen
            </Button>
          </div>
        ) : shown.length === 0 ? (
          <p className="text-muted-foreground max-w-prose">
            Inga förslag är sparade än. Börja möblera och spara ditt, så hamnar det här.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((d) => (
              <DesignCard key={d.designId} design={d} mine={!!user && d.ownerId === user.userId} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
