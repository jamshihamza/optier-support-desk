import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { loadConfig } from "./config";
import { loadDotEnv } from "./load-env";

async function bootstrap() {
  loadDotEnv();
  const config = loadConfig();
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  app.enableShutdownHooks();
  // Bind to all interfaces so other PCs on the LAN (via the proxy) can reach it.
  await app.listen(config.PORT, "0.0.0.0");
  console.log(`Optier server listening on :${config.PORT}`);
}
bootstrap();
