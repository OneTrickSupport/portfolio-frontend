import { useEffect, useState } from "react";
import { fetchUserAttributes, getCurrentUser } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import { api } from "@/lib/api";

export type AuthUser = {
  userId: string;
  username: string;
  email?: string;
  name?: string;
};

async function syncUser(email?: string, name?: string) {
  if (!email) return;
  try {
    await api("/me", {
      method: "POST",
      body: JSON.stringify({ email, name }),
    });
  } catch {
    // best-effort — don't block auth on sync failure
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async (sync = false) => {
      try {
        const u = await getCurrentUser();
        const attrs = await fetchUserAttributes();
        if (!mounted) return;
        setUser({
          userId: u.userId,
          username: u.username,
          email: attrs.email,
          name: attrs.name,
        });
        if (sync) {
          void syncUser(attrs.email, attrs.name);
        }
      } catch {
        if (!mounted) return;
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    const sub = Hub.listen("auth", ({ payload }) => {
      if (
        payload.event === "signedIn" ||
        payload.event === "signInWithRedirect"
      ) {
        void load(true);
      } else if (payload.event === "signedOut") {
        setUser(null);
      }
    });
    return () => {
      mounted = false;
      sub();
    };
  }, []);

  return { user, loading };
}
