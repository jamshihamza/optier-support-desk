import { Controller, Get, Param } from "@nestjs/common";
import { AuditService } from "./audit.service";

@Controller("audit")
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  // M1: restrict with the `audit.view` permission once RBAC exists.
  @Get(":table/:id")
  forRow(@Param("table") table: string, @Param("id") id: string) {
    return this.audit.forRow(table, id);
  }
}
