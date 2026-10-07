import { describe, expect, it } from "vitest";
import { loadConfig } from "./config";

describe("loadConfig", () => {
  it("requires DATABASE_URL", () => {
    expect(() => loadConfig({})).toThrow(/DATABASE_URL/);
  });
  it("applies defaults", () => {
    const c = loadConfig({ DATABASE_URL: "postgres://x" });
    expect(c.PORT).toBe(3000);
    expect(c.UPLOAD_DIR).toBe("./uploads");
  });
});
