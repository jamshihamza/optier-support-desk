import { animate, stagger } from "animejs";

/**
 * All Anime.js usage lives here (docs/UI.md section 5) so it can be swapped or tuned in one place.
 * Rules: nothing over 300ms except the one-time KPI/chart intro, no animation on live updates,
 * and everything is skipped when the user prefers reduced motion.
 */
export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function slideInFromRight(el: Element): void {
  if (prefersReducedMotion()) return;
  animate(el, { translateX: ["28px", "0px"], opacity: [0, 1], duration: 200, ease: "outQuad" });
}

export function fadeIn(el: Element): void {
  if (prefersReducedMotion()) return;
  animate(el, { opacity: [0, 1], duration: 160, ease: "outQuad" });
}

/** First-load entrance for a list of rows or cards. Call once, never on live updates. */
export function staggerIn(targets: Element[]): void {
  if (prefersReducedMotion() || targets.length === 0) return;
  animate(targets, {
    opacity: [0, 1],
    translateY: ["6px", "0px"],
    delay: stagger(25, { start: 0 }),
    duration: 220,
    ease: "outQuad",
  });
}

export function countUp(el: HTMLElement, to: number): void {
  if (prefersReducedMotion() || to === 0) {
    el.textContent = String(to);
    return;
  }
  const state = { value: 0 };
  animate(state, {
    value: to,
    duration: 600,
    ease: "outCubic",
    onUpdate: () => {
      el.textContent = String(Math.round(state.value));
    },
    onComplete: () => {
      el.textContent = String(to);
    },
  });
}

export function pulse(el: Element): void {
  if (prefersReducedMotion()) return;
  animate(el, { scale: [1, 1.08, 1], duration: 250, ease: "outQuad" });
}
