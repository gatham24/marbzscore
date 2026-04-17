import { useState } from "react";
import { Link, useLocation, useSearch } from "@tanstack/react-router";
import { Search, ChevronRight, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const FAVORITE_TEAMS = [
  { id: 57, name: "Arsenal", country: "England", logo: "https://crests.football-data.org/57.png" },
  { id: 65, name: "Manchester City", country: "England", logo: "https://crests.football-data.org/65.png" },
  { id: 64, name: "Liverpool", country: "England", logo: "https://crests.football-data.org/64.png" },
  { id: 66, name: "Manchester United", country: "England", logo: "https://crests.football-data.org/66.png" },
  { id: 86, name: "Real Madrid", country: "Spain", logo: "https://crests.football-data.org/86.png" },
];

const COMPETITIONS = [
  { id: 2021, name: "Premier League", country: "England", logo: "https://crests.football-data.org/PL.png" },
  { id: 2014, name: "La Liga", country: "Spain", logo: "https://crests.football-data.org/PD.png" },
  { id: 2019, name: "Serie A", country: "Italy", logo: "https://crests.football-data.org/SA.png" },
  { id: 2002, name: "Bundesliga", country: "Germany", logo: "https://crests.football-data.org/BL1.png" },
  { id: 2015, name: "Ligue 1", country: "France", logo: "https://crests.football-data.org/FL1.png" },
  { id: 2003, name: "Eredivisie", country: "Netherlands", logo: "https://crests.football-data.org/DED.png" },
  { id: 2017, name: "Primeira Liga", country: "Portugal", logo: "https://crests.football-data.org/PPL.png" },
  { id: 2016, name: "Championship", country: "England", logo: "https://crests.football-data.org/ELC.png" },
];

const UEFA_COMPETITIONS = [
  { id: 2001, name: "Champions League", country: "Europe", logo: "https://crests.football-data.org/CL.png" },
  { id: 2146, name: "Europa League", country: "Europe", logo: "https://crests.football-data.org/EL.png" },
  { id: 2152, name: "Conference League", country: "Europe", logo: "" },
];

const REGIONS = [
  { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { name: "Spain", flag: "🇪🇸" },
  { name: "Italy", flag: "🇮🇹" },
  { name: "Germany", flag: "🇩🇪" },
  { name: "France", flag: "🇫🇷" },
  { name: "Netherlands", flag: "🇳🇱" },
  { name: "Portugal", flag: "🇵🇹" },
  { name: "Turkey", flag: "🇹🇷" },
  { name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  { name: "Belgium", flag: "🇧🇪" },
  { name: "Brazil", flag: "🇧🇷" },
  { name: "Argentina", flag: "🇦🇷" },
  { name: "Japan", flag: "🇯🇵" },
  { name: "Saudi Arabia", flag: "🇸🇦" },
  { name: "USA", flag: "🇺🇸" },
  { name: "Mexico", flag: "🇲🇽" },
  { name: "Egypt", flag: "🇪🇬" },
  { name: "Morocco", flag: "🇲🇦" },
  { name: "Nigeria", flag: "🇳🇬" },
  { name: "South Africa", flag: "🇿🇦" },
  { name: "Rwanda", flag: "🇷🇼" },
];

export function AppSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [search, setSearch] = useState("");
  const [teamsOpen, setTeamsOpen] = useState(true);
  const [compsOpen, setCompsOpen] = useState(true);
  const [regionsOpen, setRegionsOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const onHome = location.pathname === "/";
  const homeSearch = useSearch({ strict: false }) as { league?: number; team?: number; country?: string };
  const activeLeague = onHome ? homeSearch.league : undefined;
  const activeTeam = onHome ? homeSearch.team : undefined;
  const activeCountry = onHome ? homeSearch.country : undefined;
  const activeCls = "bg-sidebar-accent ring-1 ring-primary/40";

  const q = search.toLowerCase().trim();

  const filteredTeams = q
    ? FAVORITE_TEAMS.filter(t => t.name.toLowerCase().includes(q) || t.country.toLowerCase().includes(q))
    : FAVORITE_TEAMS;

  const filteredComps = q
    ? [...COMPETITIONS, ...UEFA_COMPETITIONS].filter(c => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q))
    : null;

  const filteredRegions = q
    ? REGIONS.filter(r => r.name.toLowerCase().includes(q))
    : REGIONS;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 overflow-y-auto border-r border-sidebar-border bg-sidebar transition-transform duration-200 lg:sticky lg:top-0 lg:z-0 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile close */}
        <div className="flex items-center justify-between px-4 py-3 lg:hidden">
          <span className="text-sm font-semibold text-sidebar-foreground">Menu</span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full rounded-lg bg-sidebar-accent py-2 pl-9 pr-3 text-sm text-sidebar-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-sidebar-ring"
            />
          </div>
        </div>

        {/* Teams Section */}
        <SidebarSection title="TEAMS" isOpen={teamsOpen} onToggle={() => setTeamsOpen(!teamsOpen)}>
          {filteredTeams.map(team => (
            <Link
              key={team.id}
              to="/"
              search={{ team: team.id, teamName: team.name }}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors hover:bg-sidebar-accent ${activeTeam === team.id ? activeCls : ""}`}
              onClick={onClose}
            >
              <img src={team.logo} alt={team.name} className="h-5 w-5 object-contain" />
              <div>
                <p className="text-sm font-medium text-sidebar-foreground">{team.name}</p>
                <p className="text-xs text-muted-foreground">{team.country}</p>
              </div>
            </Link>
          ))}
        </SidebarSection>

        {/* Competitions Section */}
        <SidebarSection title="COMPETITIONS" isOpen={compsOpen} onToggle={() => setCompsOpen(!compsOpen)}>
          {(filteredComps || [...COMPETITIONS.slice(0, 5), ...UEFA_COMPETITIONS.slice(0, 1)]).map(comp => (
            <Link
              key={comp.id}
              to="/"
              search={{ league: comp.id, leagueName: comp.name }}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors hover:bg-sidebar-accent"
              onClick={onClose}
            >
              {comp.logo ? (
                <img src={comp.logo} alt={comp.name} className="h-5 w-5 object-contain" />
              ) : (
                <div className="flex h-5 w-5 items-center justify-center rounded bg-muted text-[10px]">🏆</div>
              )}
              <div>
                <p className="text-sm font-medium text-sidebar-foreground">{comp.name}</p>
                <p className="text-xs text-muted-foreground">{comp.country}</p>
              </div>
            </Link>
          ))}
        </SidebarSection>

        {/* Regions Section */}
        <SidebarSection title="REGION" isOpen={regionsOpen || !!q} onToggle={() => setRegionsOpen(!regionsOpen)}>
          {filteredRegions.map(region => (
            <Link
              key={region.name}
              to="/"
              search={{ country: region.name }}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors hover:bg-sidebar-accent"
              onClick={onClose}
            >
              <span className="text-base">{region.flag}</span>
              <span className="text-sm text-sidebar-foreground">{region.name}</span>
            </Link>
          ))}
        </SidebarSection>

        {/* Auth links at bottom */}
        {!user && (
          <div className="border-t border-sidebar-border px-3 py-4">
            <Link
              to="/login"
              className="block rounded-lg bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90"
              onClick={onClose}
            >
              Sign In
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}

function SidebarSection({ title, isOpen, onToggle, children }: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="px-1 py-1">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-sidebar-foreground"
      >
        {title}
        <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-90" : ""}`} />
      </button>
      {isOpen && <div className="space-y-0.5">{children}</div>}
    </div>
  );
}

function SidebarItem({ logo, name, subtitle }: { logo: string; name: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors hover:bg-sidebar-accent cursor-pointer">
      <img src={logo} alt={name} className="h-5 w-5 object-contain" />
      <div>
        <p className="text-sm font-medium text-sidebar-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

export function SidebarTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:hidden"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
