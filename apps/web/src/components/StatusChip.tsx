import type { Tone } from "../lib/status";

const tones: Record<Tone, string> = {
  info: "bg-info-soft text-info",
  warn: "bg-warn-soft text-warn",
  ok: "bg-ok-soft text-ok",
  danger: "bg-danger-soft text-danger",
  neutral: "bg-neutral-soft text-muted",
  accent: "bg-accent-soft text-accent",
};

/** A small status light plus text. The text always carries the meaning; colour only reinforces it. */
export function StatusChip({ tone, label }: { tone: Tone; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
