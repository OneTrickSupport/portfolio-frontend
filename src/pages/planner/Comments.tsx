import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatDate, plannerApi, type Design, type PlannerComment } from "@/lib/planner";

type Props = {
  design: Design;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Signed-in user's id, or null. */
  userId: string | null;
  onSignIn: () => void;
};

export default function Comments({ design, open, onOpenChange, userId, onSignIn }: Props) {
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const key = ["planner", "comments", design.designId];
  const comments = useQuery({ queryKey: key, queryFn: () => plannerApi.comments(design.designId), enabled: open });

  // The count is shown on the editor bar and in the gallery, so both are refreshed.
  const refresh = () => {
    void qc.invalidateQueries({ queryKey: key });
    void qc.invalidateQueries({ queryKey: ["planner", "design", design.designId] });
    void qc.invalidateQueries({ queryKey: ["planner", "designs"] });
  };
  const add = useMutation({
    mutationFn: (t: string) => plannerApi.addComment(design.designId, t),
    onSuccess: () => {
      setText("");
      refresh();
    },
  });
  const remove = useMutation({
    mutationFn: (c: PlannerComment) => plannerApi.removeComment(design.designId, c.commentId),
    onSuccess: refresh,
  });

  const canDelete = (c: PlannerComment) => !!userId && (c.userId === userId || design.mine);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col gap-4 w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Kommentarer</SheetTitle>
          <SheetDescription>
            {design.title}, av {design.ownerName}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto -mx-2 px-2">
          {comments.isLoading ? (
            <p className="text-sm text-muted-foreground">Hämtar kommentarer…</p>
          ) : comments.error ? (
            <p className="text-sm text-destructive">Kommentarerna gick inte att hämta.</p>
          ) : (comments.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Ingen har kommenterat än.</p>
          ) : (
            <ul className="space-y-4">
              {comments.data!.map((c) => (
                <li key={c.commentId} className="border-b pb-3 last:border-b-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-medium">{c.userName}</p>
                    <p className="text-xs text-muted-foreground shrink-0">{formatDate(c.createdAt)}</p>
                  </div>
                  <p className="mt-1 text-sm whitespace-pre-wrap break-words">{c.text}</p>
                  {canDelete(c) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 -ml-3 h-8 text-muted-foreground"
                      disabled={remove.isPending}
                      onClick={() => remove.mutate(c)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Ta bort
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {userId ? (
          <form
            className="space-y-2 border-t pt-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (text.trim()) add.mutate(text.trim());
            }}
          >
            <label htmlFor="planner-comment" className="text-sm font-medium">
              Skriv en kommentar
            </label>
            <textarea
              id="planner-comment"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={500}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            {add.error && <p className="text-sm text-destructive">Kommentaren gick inte att spara. Försök igen.</p>}
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">{text.length}/500</span>
              <Button type="submit" size="sm" disabled={add.isPending || !text.trim()}>
                {add.isPending ? "Skickar…" : "Kommentera"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="border-t pt-4 space-y-2">
            <p className="text-sm text-muted-foreground">Logga in för att kommentera.</p>
            <Button size="sm" onClick={onSignIn}>
              Logga in
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
