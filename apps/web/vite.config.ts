import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// In dev, /api is proxied to the NestJS server. The server's PORT comes from the repo-root .env,
// so two git worktrees can run side by side on different ports. In production Caddy does the
// same job (ops/Caddyfile).
export default defineConfig(({ mode }) => {
  const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
  const apiPort = loadEnv(mode, repoRoot, "").PORT ?? "3000";
  return {
    plugins: [react(), tailwindcss()],
    server: { port: 5173, host: true, proxy: { "/api": `http://localhost:${apiPort}` } },
  };
});
