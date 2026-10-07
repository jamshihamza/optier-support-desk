import { useQuery } from "@tanstack/react-query";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { StatusChip } from "../components/StatusChip";
import { api } from "../lib/api";
import { countUp } from "../lib/motion";
import { isOpen, isWaiting, statusTone } from "../lib/status";
import { isToday } from "../lib/time";

function Tile({ label, value }: { label: string; value: number }) {
  const num = useRef<HTMLSpanElement>(null);
  const played = useRef(false);
  // Count up once when real data first arrives, never on later refreshes.
  useEffect(() => {
    if (num.current && !played.current) {
      played.current = true;
      countUp(num.current, value);
    }
  }, [value]);
  return (
    <div className="rounded-card border border-line bg-surface p-4">
      <p className="text-muted">{label}</p>
      <p className="tnum mt-1 text-3xl font-semibold">
        <span ref={num}>0</span>
      </p>
    </div>
  );
}

export function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const { data, isSuccess } = useQuery({ queryKey: ["tickets"], queryFn: api.listTickets });

  const open = data?.filter((x) => isOpen(x.status)).length ?? 0;
  const waiting = data?.filter((x) => isWaiting(x.status)).length ?? 0;
  const today = data?.filter((x) => isToday(x.createdAt)).length ?? 0;

  const start = (e: FormEvent) => {
    e.preventDefault();
    const p = phone.trim();
    navigate(p ? `/tickets?new=1&phone=${encodeURIComponent(p)}` : "/tickets?new=1");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold">{t("home.title")}</h1>

      <form onSubmit={start} className="rounded-card border border-line bg-surface p-5 shadow-soft">
        <label htmlFor="start-phone" className="text-base font-semibold">
          {t("home.startTitle")}
        </label>
        <p className="mt-1 text-muted">{t("home.startHint")}</p>
        <div className="mt-3 flex gap-2">
          <input
            id="start-phone"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("home.startPlaceholder")}
            className="tnum h-11 flex-1 rounded-control border border-line bg-bg px-3 text-base placeholder:text-muted"
          />
          <Button variant="primary" type="submit" className="h-11 px-5">
            {t("home.startAction")}
          </Button>
        </div>
      </form>

      {isSuccess ? (
        <div className="grid grid-cols-3 gap-4">
          <Tile label={t("home.open")} value={open} />
          <Tile label={t("home.newToday")} value={today} />
          <Tile label={t("home.waiting")} value={waiting} />
        </div>
      ) : null}

      <section className="rounded-card border border-line bg-surface">
        <h2 className="border-b border-line px-4 py-3 font-semibold">{t("home.recent")}</h2>
        {data && data.length === 0 ? <p className="px-4 py-6 text-muted">{t("home.noTickets")}</p> : null}
        <ul className="divide-y divide-line">
          {data?.slice(0, 5).map((tk) => (
            <li key={tk.id} className="flex items-center gap-3 px-4 py-3">
              <span className="tnum w-20 shrink-0 text-muted">{tk.displayNumber}</span>
              <Link to={`/tickets?q=${tk.displayNumber}`} className="min-w-0 flex-1 truncate hover:underline">
                {tk.subject}
              </Link>
              <StatusChip tone={statusTone[tk.status]} label={t(`status.${tk.status}`)} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
