import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";
import { loadDotEnv } from "../load-env";

/**
 * Minimal SQL migration runner. Applies migrations/*.sql in filename order,
 * each in its own transaction, recording them in schema_migrations.
 * Run with the OWNER connection (MIGRATION_DATABASE_URL), never the app role.
 */
export async function migrate(connectionString: string, dir: string): Promise<string[]> {
  const client = new Client({ connectionString });
  await client.connect();
  const applied: string[] = [];
  try {
    await client.query(
      "create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())",
    );
    const done = new Set(
      (await client.query("select name from schema_migrations")).rows.map((r) => r.name as string),
    );
    const files = readdirSync(dir)
      .filter((f) => f.endsWith(".sql"))
      .sort();
    for (const file of files) {
      if (done.has(file)) continue;
      await client.query("begin");
      try {
        await client.query(readFileSync(join(dir, file), "utf8"));
        await client.query("insert into schema_migrations (name) values ($1)", [file]);
        await client.query("commit");
        applied.push(file);
      } catch (err) {
        await client.query("rollback");
        throw new Error(`Migration ${file} failed: ${(err as Error).message}`);
      }
    }
  } finally {
    await client.end();
  }
  return applied;
}

if (require.main === module) {
  loadDotEnv();
  const url = process.env.MIGRATION_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!url) {
    console.error("Set MIGRATION_DATABASE_URL (or DATABASE_URL)");
    process.exit(1);
  }
  const dir = process.env.MIGRATIONS_DIR ?? join(__dirname, "..", "..", "migrations");
  migrate(url, dir)
    .then((applied) => {
      console.log(applied.length ? `Applied: ${applied.join(", ")}` : "Database is up to date");
    })
    .catch((e) => {
      console.error(e.message);
      process.exit(1);
    });
}
