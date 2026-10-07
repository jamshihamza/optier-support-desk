import { Controller, Get } from "@nestjs/common";
import type { Health } from "@optier/shared";
import { DbService } from "../../db/db.service";

@Controller("health")
export class HealthController {
  constructor(private readonly db: DbService) {}

  @Get()
  async check(): Promise<Health> {
    return { status: "ok", db: await this.db.ping(), time: new Date().toISOString() };
  }
}
