import { api } from "@/lib/api";

// Client for the apartment planner API (see portfolio-backend/src/planner).
// Reading is public; saving, liking and commenting need a signed-in user.

export type DesignSummary = {
  designId: string;
  title: string;
  ownerId: string;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  commentCount: number;
  thumb?: string;
  basedOn?: string;
};

export type Design = DesignSummary & {
  /** The plan itself. Opaque here; the planner validates it when it loads. */
  state: unknown;
  mine: boolean;
  likedByMe: boolean;
  /** The signed-in user is a site moderator and may delete this design and any comment on it. */
  canModerate?: boolean;
};

export type PlannerComment = {
  commentId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
};

const json = (body: unknown) => JSON.stringify(body);

export const plannerApi = {
  list: () => api<{ designs: DesignSummary[] }>("/planner/designs").then((r) => r.designs),
  get: (id: string) => api<{ design: Design }>(`/planner/designs/${id}`).then((r) => r.design),
  create: (body: { title: string; state: unknown; thumb?: string; basedOn?: string }) =>
    api<{ design: DesignSummary }>("/planner/designs", { method: "POST", body: json(body) }).then((r) => r.design),
  update: (id: string, body: { title?: string; state?: unknown; thumb?: string }) =>
    api<{ design: DesignSummary }>(`/planner/designs/${id}`, { method: "POST", body: json(body) }).then((r) => r.design),
  remove: (id: string) => api<void>(`/planner/designs/${id}`, { method: "DELETE" }),
  like: (id: string, on: boolean) =>
    api<{ liked: boolean; likeCount: number }>(`/planner/designs/${id}/like`, { method: on ? "POST" : "DELETE" }),
  comments: (id: string) =>
    api<{ comments: PlannerComment[] }>(`/planner/designs/${id}/comments`).then((r) => r.comments),
  addComment: (id: string, text: string) =>
    api<{ comment: PlannerComment }>(`/planner/designs/${id}/comments`, { method: "POST", body: json({ text }) }).then((r) => r.comment),
  removeComment: (id: string, commentId: string) =>
    api<void>(`/planner/designs/${id}/comments/${commentId}`, { method: "DELETE" }),
};

/** What the planner page (moblera/, shown in an iframe) exposes on its window. */
export type PlannerWindow = Window & {
  moblera?: {
    open(key: string, state: unknown): { dirty: boolean };
    getState(): unknown;
    thumbnail(): string | null;
    isDirty(): boolean;
    markSaved(key?: string): void;
    discardDraft(): void;
  };
};

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("sv-SE", { day: "numeric", month: "short", year: "numeric" });
