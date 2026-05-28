import { Link, useNavigate } from "react-router-dom";
import { signOut } from "aws-amplify/auth";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b sticky top-0 z-50 bg-background shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-bold text-lg">
            Karl Nilros
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <a href="#about" className="hover:underline text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
            <a href="#skills" className="hover:underline text-muted-foreground hover:text-foreground transition-colors">
              Skills
            </a>
            <a href="#projects" className="hover:underline text-muted-foreground hover:text-foreground transition-colors">
              Projects
            </a>
            <a href="#experience" className="hover:underline text-muted-foreground hover:text-foreground transition-colors">
              Experience
            </a>
            <a href="#contact" className="hover:underline text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
            <Link to="/demo" className="hover:underline text-muted-foreground hover:text-foreground transition-colors">
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
            <Button size="sm" onClick={() => navigate("/signin")}>
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
