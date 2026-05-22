import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Callback() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      navigate(user ? "/demo" : "/", { replace: true });
    }
  }, [loading, user, navigate]);

  return <p className="text-muted-foreground">Finishing sign-in…</p>;
}
