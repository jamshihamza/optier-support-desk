/**
 * Interface size. Everything in the UI is sized in rem, so changing the root font size
 * scales buttons, text, spacing and icons together. Chosen per person and kept in the browser.
 */
export const scales = [100, 112.5, 125, 137.5] as const;
export type Scale = (typeof scales)[number];
export const DEFAULT_SCALE: Scale = 112.5;
const KEY = "optier-scale-v1";

export function initialScale(): Scale {
  try {
    const saved = Number(localStorage.getItem(KEY));
    const found = scales.find((s) => s === saved);
    if (found) return found;
  } catch {
    /* storage can be unavailable; use the default */
  }
  return DEFAULT_SCALE;
}

export function applyScale(scale: Scale): void {
  document.documentElement.style.fontSize = `${scale}%`;
}

export function saveScale(scale: Scale): void {
  try {
    localStorage.setItem(KEY, String(scale));
  } catch {
    /* ignore */
  }
}

export function stepScale(current: Scale, direction: 1 | -1): Scale {
  const i = scales.indexOf(current) + direction;
  return scales[Math.min(scales.length - 1, Math.max(0, i))] ?? current;
}
