import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseEnv } from "node:util";

/** Windows editors and PowerShell sometimes save text as UTF-16 or with a BOM; accept all of them. */
export function decodeEnvFile(buf: Buffer): string {
  if (buf[0] === 0xff && buf[1] === 0xfe) return buf.subarray(2).toString("utf16le");
  if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) return buf.subarray(3).toString("utf8");
  return buf.toString("utf8");
}

export function parseDotEnv(buf: Buffer): Record<string, string> {
  return parseEnv(decodeEnvFile(buf).replace(/\r\n/g, "\n")) as Record<string, string>;
}

/**
 * Load a .env file for local development. Looks in the current folder and the repo root
 * (pnpm runs scripts from apps/server). Variables already set in the environment win,
 * so Docker and CI settings are never overridden.
 * Returns the file that was loaded, or null (with the places searched) if none was found.
 */
export function loadDotEnv(cwd: string = process.cwd()): { loaded: string | null; searched: string[] } {
  const searched = [join(cwd, ".env"), join(cwd, "..", "..", ".env")];
  for (const file of searched) {
    if (!existsSync(file)) continue;
    for (const [key, value] of Object.entries(parseDotEnv(readFileSync(file)))) {
      if (process.env[key] === undefined) process.env[key] = value;
    }
    return { loaded: file, searched };
  }
  return { loaded: null, searched };
}

/** Plain-language hint printed when configuration is missing. */
export function envHelp(searched: string[]): string {
  return [
    "No .env file was found, and DATABASE_URL is not set.",
    "Create a file named exactly .env in the repository root (copy .env.example to .env).",
    "On Windows, check the name is not .env.txt (turn on 'File name extensions' in File Explorer).",
    `Looked in: ${searched.join(" and ")}`,
  ].join("\n");
}
