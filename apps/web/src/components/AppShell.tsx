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
import { applyScale, initialScale, type Scale, saveScale, scales, stepScale } from "../lib/scale";
import { applyTheme, initialTheme, saveTheme, type Theme } from "../lib/theme";
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
  const [scale, setScale] = useState<Scale>(initialScale);
  const [query, setQuery] = useState("");

  useEffect(() => applyTheme(theme), [theme]);
  useEffect(() => applyScale(scale), [scale]);

  const changeScale = (direction: 1 | -1) => {
    const next = stepScale(scale, direction);
    setScale(next);
    saveScale(next);
  };

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
        <div className="flex h-14 items-center gap-2.5 px-3">
          {/* The logo has dark parts, so it always sits on a white plate to stay legible in dark theme. */}
          <span className="flex h-9 items-center rounded-control bg-white px-2">
            <img src="/optier-logo.svg" alt="OPTIER" className="h-6 w-auto" />
          </span>
          <span className="font-semibold leading-tight">{t("app.product")}</span>
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
              <Icon size="1.25rem" aria-hidden="true" />
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
              size="1rem"
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
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => changeScale(-1)}
              disabled={scale === scales[0]}
              aria-label={t("topbar.smaller")}
              title={t("topbar.smaller")}
              className="rounded-control px-2 py-1.5 font-semibold text-muted hover:bg-surface-2 hover:text-ink disabled:opacity-40"
            >
              <span aria-hidden="true" className="text-xs">
                A
              </span>
            </button>
            <button
              type="button"
              onClick={() => changeScale(1)}
              disabled={scale === scales[scales.length - 1]}
              aria-label={t("topbar.larger")}
              title={t("topbar.larger")}
              className="rounded-control px-2 py-1.5 font-semibold text-muted hover:bg-surface-2 hover:text-ink disabled:opacity-40"
            >
              <span aria-hidden="true" className="text-lg">
                A
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                const next: Theme = theme === "dark" ? "light" : "dark";
                setTheme(next);
                saveTheme(next);
              }}
              aria-label={t("topbar.theme")}
              className="rounded-control p-2 text-muted hover:bg-surface-2 hover:text-ink"
            >
              {theme === "dark" ? <Sun size="1.25rem" /> : <Moon size="1.25rem" />}
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
