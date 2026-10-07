export type Theme = "light" | "dark";
// The key carries a version so an older automatic choice is ignored after a theme change.
const KEY = "optier-theme-v2";

/** Light by default; dark only if the person chose it with the toggle. */
export function initialTheme(): Theme {
  try {
    if (localStorage.getItem(KEY) === "dark") return "dark";
  } catch {
    /* storage can be unavailable; use the default */
  }
  return "light";
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
}

/** Called only when the person flips the toggle, never automatically. */
export function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* ignore */
  }
}
