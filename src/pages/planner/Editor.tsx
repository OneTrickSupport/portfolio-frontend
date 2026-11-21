import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, Heart, Link2, MessageCircle, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { plannerApi, type Design, type PlannerWindow } from "@/lib/planner";
import { rememberReturnTo } from "@/lib/return-to";
import Comments from "./Comments";

// The planner itself (moblera/) runs in an iframe from the same site. This page loads a
// design into it, and saves what it shows. Anyone can edit; unsaved changes are kept as a
// draft in the browser, so they survive the trip to the sign-in page and back.

const PLANNER_URL = `${import.meta.env.BASE_URL}moblera/index.html?embed=1`;

export default function PlannerEditor() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();

  const frame = useRef<HTMLIFrameElement>(null);
  const opened = useRef<string | null>(null); // the design the planner is showing right now
  const [ready, setReady] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [top, setTop] = useState(57);
  const [title, setTitle] = useState("");
  const [naming, setNaming] = useState<string | null>(null); // title being typed for a new design
  const [error, setError] = useState<string | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);

  const queryKey = ["planner", "design", id ?? "", user?.userId ?? null];
  const design = useQuery({
    queryKey,
    queryFn: () => plannerApi.get(id!),
    enabled: !!id && !authLoading,
    retry: false,
  });
  const d = design.data;
  const planner = () => (frame.current?.contentWindow as PlannerWindow | null | undefined)?.moblera;

  // Fill the window below the site header, whatever height the header has.
  useLayoutEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;
    const measure = () => setTop(header.getBoundingClientRect().height);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);

  // The planner says when it has loaded and whenever "has unsaved changes" flips.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== frame.current?.contentWindow) return;
      const data = e.data as { type?: string; dirty?: boolean } | null;
      if (data?.type === "moblera-ready") setReady(true);
      else if (data?.type === "moblera-change") setDirty(!!data.dirty);
    };
    window.addEventListener("message", onMessage);
    if (planner()) setReady(true); // it loaded before we started listening
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Load the design into the planner once both are there. Later refetches (after a like,
  // say) must not reload it, or the visitor's edits would be thrown away.
  useEffect(() => {
    const p = planner();
    if (!ready || !p || (id && !d)) return;
    const key = id ?? "new";
    if (opened.current === key) return;
    opened.current = key;
    setDirty(p.open(key, d ? d.state : null).dirty);
    setTitle(d ? d.title : "");
    setNaming(null);
    setError(null);
    setConfirmDelete(false);
  }, [ready, id, d]);

  const signIn = () => {
    rememberReturnTo(location.pathname);
    navigate("/signin");
  };

  const save = useMutation({
    mutationFn: async (newTitle: string | null) => {
      const p = planner();
      if (!p) throw new Error("Planeraren har inte laddat klart");
      const state = p.getState();
      const thumb = p.thumbnail() ?? undefined;
      if (newTitle !== null) {
        return { created: true, saved: await plannerApi.create({ title: newTitle, state, thumb, ...(id ? { basedOn: id } : {}) }), state };
      }
      return { created: false, saved: await plannerApi.update(id!, { title: title.trim() || undefined, state, thumb }), state };
    },
    onSuccess: ({ created, saved, state }) => {
      const p = planner();
      setError(null);
      setDirty(false);
      if (created) {
        // The planner already shows this plan, so mark it as the saved version of the new design.
        p?.markSaved(saved.designId);
        opened.current = saved.designId;
        const full: Design = { ...saved, state, mine: true, likedByMe: false, canModerate: d?.canModerate ?? false };
        qc.setQueryData(["planner", "design", saved.designId, user?.userId ?? null], full);
        setTitle(saved.title);
        setNaming(null);
        navigate(`/planner/d/${saved.designId}`, { replace: true });
      } else {
        p?.markSaved();
        qc.setQueryData<Design>(queryKey, (old) => (old ? { ...old, ...saved, state } : old));
        setTitle(saved.title);
      }
      void qc.invalidateQueries({ queryKey: ["planner", "designs"] });
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : "";
      setError(
        msg.startsWith("401")
          ? "Du behöver logga in igen för att spara."
          : msg.startsWith("409")
            ? "Du har sparat så många förslag som går. Ta bort något först."
            : "Det gick inte att spara. Dina ändringar ligger kvar här, så du kan försöka igen.",
      );
    },
  });

  const like = useMutation({
    mutationFn: (on: boolean) => plannerApi.like(id!, on),
    onSuccess: (r) => {
      qc.setQueryData<Design>(queryKey, (old) => (old ? { ...old, likedByMe: r.liked, likeCount: r.likeCount } : old));
      void qc.invalidateQueries({ queryKey: ["planner", "designs"] });
    },
  });

  const remove = useMutation({
    mutationFn: () => plannerApi.remove(id!),
    onSuccess: () => {
      planner()?.markSaved(); // drop any draft for the deleted design
      void qc.invalidateQueries({ queryKey: ["planner", "designs"] });
      navigate("/planner", { replace: true });
    },
    onError: () => setError("Det gick inte att ta bort förslaget."),
  });

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Länken gick inte att kopiera. Kopiera adressen i adressfältet i stället.");
    }
  };

  if (id && design.error) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-lg space-y-4">
        <h1 className="text-2xl font-bold">Förslaget finns inte</h1>
        <p className="text-muted-foreground">Det kan ha tagits bort, eller så är länken fel.</p>
        <Button asChild>
          <Link to="/planner">Visa alla förslag</Link>
        </Button>
      </main>
    );
  }

  const mine = !!d?.mine;
  // Moderators can delete other people's designs (but not change them).
  const canDelete = mine || !!d?.canModerate;
  const titleChanged = mine && title.trim() !== "" && title.trim() !== d!.title;
  const busy = save.isPending || remove.isPending;

  return (
    <div className="fixed inset-x-0 bottom-0 flex flex-col bg-background" style={{ top }}>
      <div className="border-b px-3 py-2 flex flex-wrap items-center gap-x-3 gap-y-2">
        <Button asChild variant="ghost" size="sm" className="-ml-1">
          <Link to="/planner">
            <ArrowLeft className="h-4 w-4 mr-1.5" aria-hidden /> Alla förslag
          </Link>
        </Button>

        <div className="flex items-center gap-2 min-w-0">
          {mine ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              aria-label="Förslagets namn"
              className="h-9 w-56 font-medium"
            />
          ) : (
            <p className="font-medium truncate max-w-[16rem]">{d ? d.title : id ? "Hämtar…" : "Nytt förslag"}</p>
          )}
          {d && !mine && <p className="text-sm text-muted-foreground whitespace-nowrap">av {d.ownerName}</p>}
        </div>

        {dirty && (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            Osparade ändringar
            <button
              type="button"
              className="underline underline-offset-2 hover:text-foreground"
              onClick={() => planner()?.discardDraft()}
            >
              Ångra alla
            </button>
          </p>
        )}

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {d && (
            <>
              <Button
                variant="outline"
                size="sm"
                aria-pressed={d.likedByMe}
                disabled={like.isPending}
                onClick={() => (user ? like.mutate(!d.likedByMe) : signIn())}
                title={user ? (d.likedByMe ? "Sluta gilla" : "Gilla förslaget") : "Logga in för att gilla"}
              >
                <Heart className={`h-4 w-4 mr-1.5 ${d.likedByMe ? "fill-red-500 text-red-500" : ""}`} aria-hidden />
                {d.likeCount}
                <span className="sr-only">gillningar</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCommentsOpen(true)}>
                <MessageCircle className="h-4 w-4 mr-1.5" aria-hidden />
                {d.commentCount}
                <span className="sr-only">kommentarer</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => void copyLink()}>
                {copied ? <Check className="h-4 w-4 mr-1.5" aria-hidden /> : <Link2 className="h-4 w-4 mr-1.5" aria-hidden />}
                {copied ? "Länken är kopierad" : "Kopiera länk"}
              </Button>
            </>
          )}

          {naming !== null ? (
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (naming.trim()) save.mutate(naming.trim());
              }}
            >
              <Input
                autoFocus
                value={naming}
                onChange={(e) => setNaming(e.target.value)}
                maxLength={80}
                placeholder="Ge förslaget ett namn"
                aria-label="Namn på ditt förslag"
                className="h-9 w-56"
              />
              <Button type="submit" size="sm" disabled={busy || !naming.trim()}>
                {save.isPending ? "Sparar…" : "Spara"}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setNaming(null)}>
                Avbryt
              </Button>
            </form>
          ) : authLoading || !ready ? (
            <Button size="sm" disabled>
              Spara
            </Button>
          ) : !user ? (
            <Button size="sm" onClick={signIn}>
              Logga in för att spara
            </Button>
          ) : mine ? (
            <Button size="sm" disabled={busy || (!dirty && !titleChanged)} onClick={() => save.mutate(null)}>
              {save.isPending ? "Sparar…" : dirty || titleChanged ? "Spara" : "Sparat"}
            </Button>
          ) : (
            <Button size="sm" disabled={busy} onClick={() => setNaming(d ? `${d.title} (min version)`.slice(0, 80) : "")}>
              Spara som mitt förslag
            </Button>
          )}

          {canDelete &&
            (confirmDelete ? (
              <span className="flex items-center gap-2 text-sm">
                {mine ? "Ta bort förslaget?" : `Ta bort ${d!.ownerName}s förslag?`}
                <Button variant="destructive" size="sm" disabled={busy} onClick={() => remove.mutate()}>
                  Ja, ta bort
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                  Avbryt
                </Button>
              </span>
            ) : (
              <Button variant="ghost" size="icon" className="h-9 w-9" aria-label={mine ? "Ta bort förslaget" : "Ta bort förslaget (moderator)"} title={mine ? "Ta bort förslaget" : "Ta bort som moderator"} onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            ))}
        </div>

        {error && (
          <p role="alert" className="basis-full text-sm text-destructive">
            {error}
          </p>
        )}
        {!user && !authLoading && !error && (
          <p className="basis-full text-xs text-muted-foreground">
            Du kan ändra fritt utan att logga in. Ändringarna ligger kvar i den här webbläsaren tills du sparar.
          </p>
        )}
      </div>

      <iframe
        ref={frame}
        src={PLANNER_URL}
        title="Möblera, planeraren för lägenheten"
        className="flex-1 w-full border-0 bg-white"
      />

      {d && (
        <Comments design={d} open={commentsOpen} onOpenChange={setCommentsOpen} userId={user?.userId ?? null} onSignIn={signIn} />
      )}
    </div>
  );
}
