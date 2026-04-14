import { Link } from "@tanstack/react-router";
import { Trophy, Home, BarChart3, Search } from "lucide-react";

export function Header() {
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
