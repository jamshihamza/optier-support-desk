import { Global, Module } from "@nestjs/common";
import { loadConfig } from "../config";
import { CONFIG, DbService } from "./db.service";

@Global()
@Module({
  providers: [{ provide: CONFIG, useFactory: () => loadConfig() }, DbService],
  exports: [CONFIG, DbService],
})
export class DbModule {}
