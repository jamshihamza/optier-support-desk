import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// In dev, /api is proxied to the NestJS server. In production Caddy does the same (ops/Caddyfile).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173, host: true, proxy: { "/api": "http://localhost:3000" } },
});
