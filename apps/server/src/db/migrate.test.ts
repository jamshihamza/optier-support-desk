import { join } from "node:path";
import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { migrate } from "./migrate";

// Integration test: runs only when TEST_DATABASE_URL points at an empty, disposable database.
const url = process.env.TEST_DATABASE_URL;
const d = url ? describe : describe.skip;

d("migrations + audit log", () => {
  let client: Client;
  beforeAll(async () => {
    client = new Client({ connectionString: url });
    await client.connect();
    await client.query("drop schema public cascade; create schema public;");
    await migrate(url as string, join(__dirname, "..", "..", "migrations"));
  });
  afterAll(async () => {
    await client?.end();
  });

  it("is idempotent", async () => {
    const again = await migrate(url as string, join(__dirname, "..", "..", "migrations"));
    expect(again).toEqual([]);
  });

  it("audits ticket changes with the acting user", async () => {
    await client.query("begin");
    await client.query("select set_config('app.user_id', 'tester', true)");
    const { rows } = await client.query(
      "insert into tickets (subject) values ('Audit me') returning id, number",
    );
    await client.query("update tickets set status = 'triage' where id = $1", [rows[0].id]);
    await client.query("commit");
    const audit = await client.query("select actor, action from audit_log where row_id = $1 order by id", [
      rows[0].id,
    ]);
    expect(audit.rows).toEqual([
      { actor: "tester", action: "INSERT" },
      { actor: "tester", action: "UPDATE" },
    ]);
  });

  it("refuses to update, delete, or truncate the audit log", async () => {
    await expect(client.query("update audit_log set actor = 'x'")).rejects.toThrow(/append-only/);
    await expect(client.query("delete from audit_log")).rejects.toThrow(/append-only/);
    await expect(client.query("truncate audit_log")).rejects.toThrow(/append-only/);
  });

  it("rejects an invalid status", async () => {
    await expect(
      client.query("insert into tickets (subject, status) values ('x', 'bogus')"),
    ).rejects.toThrow();
  });
});
