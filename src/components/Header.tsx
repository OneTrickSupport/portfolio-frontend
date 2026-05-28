import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "aws-amplify/auth";
import { Moon, Sun, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#projects", label: "Projects" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact" },
];

const monoStyle = { fontFamily: 'var(--font-mono-accent)', fontSize: '0.7rem', letterSpacing: '0.08em' } as const;

export default function Header() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved === "dark" || (!saved && prefersDark);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  function closeMobile() {
    setMobileOpen(false);
  }

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

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                style={monoStyle}
                className="uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                {label}
              </a>
            ))}
            <Link
              to="/demo"
              style={monoStyle}
              className="uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              Demo
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Dark mode toggle */}
          <Button variant="ghost" size="icon" onClick={toggleDark} aria-label="Toggle dark mode">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? null : user ? (
              <>
                <span style={monoStyle} className="text-muted-foreground hidden sm:block">
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

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col gap-0 pt-12">
              <nav className="flex flex-col divide-y divide-border">
                {NAV_LINKS.map(({ href, label }) => (
                  <a
                    key={href}
                    href={href}
                    onClick={closeMobile}
                    style={monoStyle}
                    className="py-4 uppercase text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {label}
                  </a>
                ))}
                <Link
                  to="/demo"
                  onClick={closeMobile}
                  style={monoStyle}
                  className="py-4 uppercase text-muted-foreground hover:text-foreground transition-colors"
                >
                  Demo
                </Link>
              </nav>

              <div className="mt-8">
                {loading ? null : user ? (
                  <div className="flex flex-col gap-3">
                    <span style={monoStyle} className="text-muted-foreground">
                      {user.email ?? user.username}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => { void signOut(); closeMobile(); }}>
                      Sign out
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => { navigate("/signin"); closeMobile(); }}
                  >
                    Sign in
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
