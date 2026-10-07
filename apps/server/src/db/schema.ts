import { bigint, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/** Mirrors migrations/. SQL migrations are the source of truth; keep this in sync by hand. */
export const tickets = pgTable("tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  number: bigint("number", { mode: "number" }).generatedAlwaysAsIdentity().notNull(),
  subject: text("subject").notNull(),
  phone: text("phone"),
  channel: text("channel").notNull().default("call"),
  priority: text("priority").notNull().default("normal"),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auditLog = pgTable("audit_log", {
  id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
  at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
  actor: text("actor"),
  tableName: text("table_name").notNull(),
  rowId: text("row_id"),
  action: text("action").notNull(),
  oldData: jsonb("old_data"),
  newData: jsonb("new_data"),
});
