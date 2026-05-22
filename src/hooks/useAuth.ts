import { useEffect, useState } from "react";
import { fetchUserAttributes, getCurrentUser } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";

export type AuthUser = {
  userId: string;
  username: string;
  email?: string;
  name?: string;
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
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
        void load();
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
