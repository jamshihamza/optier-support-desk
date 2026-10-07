import { ticketStatuses } from "@optier/shared";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../components/Button";
import { StatusChip } from "../components/StatusChip";
import { WarrantyBadge } from "../components/WarrantyBadge";
import { pulse, staggerIn } from "../lib/motion";
import { statusTone } from "../lib/status";

const swatches = [
  ["bg", "Page"],
  ["surface", "Surface"],
  ["line", "Border"],
  ["accent", "Accent"],
  ["ok", "Good"],
  ["warn", "Waiting"],
  ["danger", "Critical"],
  ["info", "In progress"],
] as const;

/** Visual reference for every token and component. Both coding agents build against this page. */
export function DevUi() {
  const { t } = useTranslation();
  const demo = useRef<HTMLDivElement>(null);
  const chip = useRef<HTMLSpanElement>(null);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <h1 className="text-2xl font-semibold">Component reference</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Colour tokens</h2>
        <div className="grid grid-cols-4 gap-3">
          {swatches.map(([token, label]) => (
            <div key={token} className="rounded-card border border-line bg-surface p-3">
              <div
                className="h-10 rounded-control border border-line"
                style={{ background: `var(--color-${token})` }}
              />
              <p className="mt-2 font-medium">{label}</p>
              <p className="text-xs text-muted">--color-{token}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Buttons</h2>
        <div className="flex gap-3">
          <Button variant="primary">Create ticket</Button>
          <Button>Cancel</Button>
          <Button variant="ghost">Clear filters</Button>
          <Button variant="primary" disabled>
            Saving…
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Ticket status</h2>
        <div className="flex flex-wrap gap-2">
          {ticketStatuses.map((s) => (
            <StatusChip key={s} tone={statusTone[s]} label={t(`status.${s}`)} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Warranty (24 months from date of sale)</h2>
        <div className="flex flex-wrap items-center gap-3">
          <WarrantyBadge status="in_warranty" />
          <WarrantyBadge status="expiring" />
          <WarrantyBadge status="expired" />
          <WarrantyBadge status="unknown" />
          <WarrantyBadge status="in_warranty" unverified />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Motion</h2>
        <p className="text-muted">
          Replays the first-load list entrance and the status pulse. Respects reduced motion.
        </p>
        <div ref={demo} className="grid grid-cols-3 gap-3">
          {["First", "Second", "Third"].map((n) => (
            <div key={n} className="rounded-card border border-line bg-surface p-4">
              {n} card
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => demo.current && staggerIn(Array.from(demo.current.children))}>
            Replay entrance
          </Button>
          <Button onClick={() => chip.current && pulse(chip.current)}>Pulse badge</Button>
          <span ref={chip} className="inline-block">
            <StatusChip tone="ok" label={t("status.resolved")} />
          </span>
        </div>
      </section>
    </div>
  );
}
