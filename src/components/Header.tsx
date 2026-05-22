import { Link } from "react-router-dom";
import { signInWithRedirect, signOut } from "aws-amplify/auth";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-bold text-lg">
            OneTrickSupport
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <Link to="/demo" className="hover:underline">
              Demo
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {loading ? null : user ? (
            <>
              <span className="text-sm text-muted-foreground">
                {user.email ?? user.username}
              </span>
              <Button variant="outline" size="sm" onClick={() => void signOut()}>
                Sign out
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={() => void signInWithRedirect({ provider: "Google" })}
            >
              Sign in with Google
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
