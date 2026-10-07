import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().default(3000),
  DATABASE_URL: z.string().min(1),
  MIGRATION_DATABASE_URL: z.string().optional(),
  UPLOAD_DIR: z.string().default("./uploads"),
});

export type Config = z.infer<typeof envSchema>;

/** All configuration comes from the environment (12-factor, see docs/PLAN.md section 6). */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    throw new Error(`Invalid environment: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`);
  }
  return parsed.data;
}
