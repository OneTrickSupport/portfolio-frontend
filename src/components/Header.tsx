import { Link, useNavigate } from "react-router-dom";
import { signOut } from "aws-amplify/auth";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b sticky top-0 z-50 bg-background shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontVariationSettings: '"opsz" 12, "wght" 700' }}
            className="text-lg leading-none select-none"
          >
            Karl Nilros
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {[
              { href: "#about", label: "About" },
              { href: "#skills", label: "Skills" },
              { href: "#projects", label: "Projects" },
              { href: "#experience", label: "Experience" },
              { href: "#contact", label: "Contact" },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                style={{ fontFamily: 'var(--font-mono-accent)', fontSize: '0.7rem', letterSpacing: '0.08em' }}
                className="uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                {label}
              </a>
            ))}
            <Link
              to="/demo"
              style={{ fontFamily: 'var(--font-mono-accent)', fontSize: '0.7rem', letterSpacing: '0.08em' }}
              className="uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              Demo
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {loading ? null : user ? (
            <>
              <span
                style={{ fontFamily: 'var(--font-mono-accent)', fontSize: '0.7rem' }}
                className="text-muted-foreground hidden sm:block"
              >
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
