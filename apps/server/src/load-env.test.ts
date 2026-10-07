import { describe, expect, it } from "vitest";
import { decodeEnvFile, parseDotEnv } from "./load-env";

const text = "PORT=3000\r\nDATABASE_URL=postgres://u:p@localhost:5432/optier\r\n";

describe("env file decoding", () => {
  it("reads plain UTF-8 with Windows line endings", () => {
    expect(parseDotEnv(Buffer.from(text, "utf8"))).toMatchObject({
      PORT: "3000",
      DATABASE_URL: "postgres://u:p@localhost:5432/optier",
    });
  });
  it("reads UTF-8 with a BOM", () => {
    const buf = Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(text, "utf8")]);
    expect(parseDotEnv(buf).DATABASE_URL).toContain("postgres://");
  });
  it("reads UTF-16 LE (PowerShell redirect, some Notepad saves)", () => {
    const buf = Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(text, "utf16le")]);
    expect(decodeEnvFile(buf)).toContain("DATABASE_URL");
    expect(parseDotEnv(buf).PORT).toBe("3000");
  });
});
