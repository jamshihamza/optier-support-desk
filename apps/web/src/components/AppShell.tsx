import {
  BookOpen,
  ChartColumn,
  House,
  Moon,
  ScanBarcode,
  Search,
  Settings,
  Sun,
  Ticket,
  Wrench,
} from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { applyTheme, initialTheme, type Theme } from "../lib/theme";
import { ConnectionBanner } from "./ConnectionBanner";

const nav = [
  { to: "/", key: "home", icon: House, end: true },
  { to: "/tickets", key: "tickets", icon: Ticket },
  { to: "/devices", key: "devices", icon: ScanBarcode },
  { to: "/rma", key: "rma", icon: Wrench },
  { to: "/knowledge", key: "knowledge", icon: BookOpen },
  { to: "/reports", key: "reports", icon: ChartColumn },
  { to: "/admin", key: "admin", icon: Settings },
] as const;

const isTyping = (el: EventTarget | null): boolean =>
  el instanceof HTMLElement && (["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName) || el.isContentEditable);

export function AppShell() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const search = useRef<HTMLInputElement>(null);
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [query, setQuery] = useState("");

  useEffect(() => applyTheme(theme), [theme]);

  // Shortcuts: N new ticket, / or Ctrl+K search, G then T tickets, G then H home.
  useEffect(() => {
    let g = false;
    let timer: number | undefined;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        search.current?.focus();
        return;
      }
      if (isTyping(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (g) {
        g = false;
        if (k === "t") navigate("/tickets");
        if (k === "h") navigate("/");
        return;
      }
      if (k === "/") {
        e.preventDefault();
        search.current?.focus();
      } else if (k === "n") {
        e.preventDefault();
        navigate("/tickets?new=1");
      } else if (k === "g") {
        g = true;
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          g = false;
        }, 1200);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/tickets?q=${encodeURIComponent(q)}` : "/tickets");
  };

  return (
    <div className="flex h-full">
      <aside className="flex w-56 shrink-0 flex-col border-r border-line bg-surface">
        <div className="flex h-14 items-center gap-2.5 px-4">
          <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="var(--accent)" />
            <circle cx="16" cy="16" r="7" fill="none" stroke="var(--accent-fg)" strokeWidth="2.5" />
            <circle cx="16" cy="16" r="2.5" fill="var(--accent-fg)" />
          </svg>
          <span className="font-semibold">{t("app.name")}</span>
        </div>
        <nav className="flex flex-col gap-0.5 p-2" aria-label="Main">
          {nav.map(({ to, key, icon: Icon, ...rest }) => (
            <NavLink
              key={to}
              to={to}
              end={"end" in rest}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-control px-3 py-2 font-medium transition-colors ${
                  isActive ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface-2 hover:text-ink"
                }`
              }
            >
              <Icon size={18} aria-hidden="true" />
              {t(`nav.${key}`)}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <ConnectionBanner />
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface px-5">
          <form onSubmit={onSearch} className="relative w-full max-w-md">
            <Search
              size={16}
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              ref={search}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("topbar.search")}
              aria-label={t("topbar.search")}
              className="h-9 w-full rounded-control border border-line bg-bg pl-9 pr-3 placeholder:text-muted"
            />
          </form>
          <div className="ml-auto">
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={t("topbar.theme")}
              className="rounded-control p-2 text-muted hover:bg-surface-2 hover:text-ink"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
