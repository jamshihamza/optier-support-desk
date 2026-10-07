import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Load a .env file for local development. Looks in the current folder and the repo root
 * (pnpm runs scripts from apps/server). Variables already set in the environment win,
 * so Docker and CI settings are never overridden.
 */
export function loadDotEnv(): void {
  for (const candidate of [join(process.cwd(), ".env"), join(process.cwd(), "..", "..", ".env")]) {
    if (existsSync(candidate)) {
      process.loadEnvFile(candidate);
      return;
    }
  }
}
