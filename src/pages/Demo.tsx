import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api, type Item } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Demo() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const qc = useQueryClient();

  const itemsQuery = useQuery({
    queryKey: ["items"],
    queryFn: () => api<{ items: Item[] }>("/items").then((r) => r.items),
    enabled: !!user,
  });

  const createItem = useMutation({
    mutationFn: (text: string) =>
      api<Item>("/items", {
        method: "POST",
        body: JSON.stringify({ content: text }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["items"] }),
  });

  const deleteItem = useMutation({
    mutationFn: (id: string) => api<void>(`/items/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["items"] }),
  });

  if (loading) {
    return <p className="text-muted-foreground">Loading…</p>;
  }

  if (!user) {
    return (
      <div className="max-w-lg space-y-4">
        <h1 className="text-3xl font-bold">DynamoDB demo</h1>
        <p className="text-muted-foreground">
          Yes, this is a real database. No, it's not just a fancy list stored in{" "}
          <code>localStorage</code>. 😄
        </p>
        <p className="text-sm text-muted-foreground">
          Sign in and type something — it goes through a Fastify API on AWS Lambda, gets written
          to DynamoDB, and comes back when you refresh. Purely here to prove the backend
          integration is real and not just vibes.
        </p>
        <Button onClick={() => navigate("/signin")}>Sign in to try it</Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">DynamoDB demo</h1>
        <p className="text-muted-foreground">
          Yes, this is a real database. No, it's not just a fancy list stored in{" "}
          <code>localStorage</code>. 😄
        </p>
        <p className="text-sm text-muted-foreground">
          Type something below — it goes through a Fastify API on AWS Lambda, gets written to
          DynamoDB, and comes back when you refresh. Purely here to prove the backend integration
          is real and not just vibes.
        </p>
      </div>

      <div className="rounded-md border border-dashed px-4 py-3 text-sm text-muted-foreground bg-muted/40">
        <span className="font-medium text-foreground">Stack:</span> React Query → Fastify (AWS Lambda) → DynamoDB.
        Auth via Cognito — your items are isolated to your account using your{" "}
        <code>sub</code> as the partition key.
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (content.trim().length === 0) return;
          createItem.mutate(content.trim(), {
            onSuccess: () => setContent(""),
          });
        }}
      >
        <Input
          placeholder="Write something to DynamoDB…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={500}
        />
        <Button type="submit" disabled={createItem.isPending}>
          Add
        </Button>
      </form>

      {itemsQuery.isLoading ? (
        <p className="text-muted-foreground">Loading items…</p>
      ) : itemsQuery.error ? (
        <p className="text-destructive">Error: {String(itemsQuery.error)}</p>
      ) : itemsQuery.data && itemsQuery.data.length === 0 ? (
        <p className="text-muted-foreground">No items yet. Add one above.</p>
      ) : (
        <ul className="space-y-2">
          {itemsQuery.data?.map((item) => (
            <li
              key={item.itemId}
              className="flex items-start justify-between gap-3 border rounded-md p-3"
            >
              <div className="space-y-1 min-w-0">
                <p className="break-words">{item.content}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteItem.mutate(item.itemId)}
                disabled={deleteItem.isPending}
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
