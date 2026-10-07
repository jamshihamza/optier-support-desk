import { Injectable } from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";
import { DbService } from "../../db/db.service";
import { auditLog } from "../../db/schema";

/** Read-only access. Rows are written by the database trigger, never by application code. */
@Injectable()
export class AuditService {
  constructor(private readonly dbs: DbService) {}

  forRow(tableName: string, rowId: string, limit = 100) {
    return this.dbs.db
      .select()
      .from(auditLog)
      .where(and(eq(auditLog.tableName, tableName), eq(auditLog.rowId, rowId)))
      .orderBy(desc(auditLog.at))
      .limit(limit);
  }
}
