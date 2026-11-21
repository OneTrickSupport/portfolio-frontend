import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { takeReturnTo } from "@/lib/return-to";

export default function Callback() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      navigate(user ? takeReturnTo("/planner") : "/", { replace: true });
    }
  }, [loading, user, navigate]);

  return <p className="text-muted-foreground">Finishing sign-in…</p>;
}
