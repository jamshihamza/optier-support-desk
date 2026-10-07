import { Module } from "@nestjs/common";
import { DbModule } from "./db/db.module";
import { AuditModule } from "./modules/audit/audit.module";
import { HealthModule } from "./modules/health/health.module";
import { TicketsModule } from "./modules/tickets/tickets.module";

@Module({ imports: [DbModule, HealthModule, TicketsModule, AuditModule] })
export class AppModule {}
