import { Inject, Injectable, type OnModuleDestroy } from "@nestjs/common";
import { sql } from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import type { Config } from "../config";
import * as schema from "./schema";

export const CONFIG = Symbol("CONFIG");
export type Db = NodePgDatabase<typeof schema>;

@Injectable()
export class DbService implements OnModuleDestroy {
  readonly pool: Pool;
  readonly db: Db;

  constructor(@Inject(CONFIG) config: Config) {
    this.pool = new Pool({ connectionString: config.DATABASE_URL, max: 10 });
    this.db = drizzle(this.pool, { schema });
  }

  /**
   * Run work in a transaction and tell the audit triggers who is acting.
   * `app.user_id` is read by audit_trigger() in migrations/.
   */
  async withActor<T>(actor: string, work: (tx: Db) => Promise<T>): Promise<T> {
    return this.db.transaction(async (tx) => {
      // set_config(..., true) is transaction-local, equivalent to SET LOCAL.
      await tx.execute(sql`select set_config('app.user_id', ${actor}, true)`);
      return work(tx as unknown as Db);
    });
  }

  async ping(): Promise<boolean> {
    try {
      await this.pool.query("select 1");
      return true;
    } catch {
      return false;
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
