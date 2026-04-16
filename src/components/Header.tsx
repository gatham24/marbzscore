import { Link } from "@tanstack/react-router";
import { Trophy, Home, BarChart3, Search, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Trophy className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              MarbzScore
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            <NavItem to="/" icon={<Home className="h-4 w-4" />} label="Scores" />
            <NavItem to="/standings" icon={<BarChart3 className="h-4 w-4" />} label="Standings" />
            <NavItem to="/search" icon={<Search className="h-4 w-4" />} label="Search" />
            {user ? (
              <>
                <NavItem to="/favorites" icon={<User className="h-4 w-4" />} label="My" />
                <button
                  onClick={signOut}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Out</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Sign in</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      activeProps={{ className: "bg-primary/15 text-primary" }}
      inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-secondary" }}
      className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
