import { Client } from "pg";
import { envHelp, loadDotEnv } from "../load-env";

/** Seed a few demo tickets for local development. Safe to run repeatedly (skips if tickets exist). */
async function main() {
  const { loaded, searched } = loadDotEnv();
  if (!loaded && !process.env.DATABASE_URL && !process.env.MIGRATION_DATABASE_URL)
    console.error(envHelp(searched));
  const url = process.env.MIGRATION_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error("Set MIGRATION_DATABASE_URL (or DATABASE_URL)");
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    const { rows } = await client.query("select count(*)::int as n from tickets");
    if (rows[0].n > 0) return console.log("Tickets already present, skipping seed");
    await client.query("select set_config('app.user_id', 'seed', false)");
    const demo = [
      ["9847012345", "NVR not recording after power cut", "call", "high"],
      ["9946098765", "Mobile app shows camera offline", "whatsapp", "normal"],
      ["9895011122", "PoE switch port 4 not powering camera", "remote", "normal"],
    ];
    for (const [phone, subject, channel, priority] of demo) {
      await client.query("insert into tickets (phone, subject, channel, priority) values ($1,$2,$3,$4)", [
        phone,
        subject,
        channel,
        priority,
      ]);
    }
    console.log(`Seeded ${demo.length} demo tickets`);
  } finally {
    await client.end();
  }
}
main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
