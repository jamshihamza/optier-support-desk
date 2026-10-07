import { X } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";
import { fadeIn, slideInFromRight } from "../lib/motion";

/** Right-hand drawer used for quick-create (docs/UI.md 4.5). Esc closes, focus moves inside. */
export function Drawer({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (panel.current) slideInFromRight(panel.current);
    if (scrim.current) fadeIn(scrim.current);
    panel.current?.querySelector<HTMLElement>("input, textarea, select")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40">
      <div ref={scrim} className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-line bg-surface shadow-soft"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-control p-1.5 text-muted hover:bg-surface-2 hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
