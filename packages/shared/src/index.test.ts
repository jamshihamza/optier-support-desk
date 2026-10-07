import { describe, expect, it } from "vitest";
import {
  createTicketInputSchema,
  formatTicketNumber,
  modelCodeSchema,
  warrantyEndDate,
  warrantyStatus,
} from "./index";

describe("ticket input", () => {
  it("accepts phone + one-line problem and applies defaults", () => {
    const r = createTicketInputSchema.parse({ phone: "9847012345", subject: "NVR not recording" });
    expect(r.channel).toBe("call");
    expect(r.priority).toBe("normal");
  });
  it("accepts a ticket with no phone and no UID", () => {
    expect(createTicketInputSchema.safeParse({ subject: "Camera offline" }).success).toBe(true);
  });
  it("rejects a too-short subject", () => {
    expect(createTicketInputSchema.safeParse({ subject: "ab" }).success).toBe(false);
  });
});

describe("ticket number", () => {
  it("pads to six digits", () => expect(formatTicketNumber(42)).toBe("T-000042"));
});

describe("warranty (24 months from date of sale)", () => {
  it("ends 24 months after the sale date", () => {
    expect(warrantyEndDate(new Date("2024-03-15")).toISOString().slice(0, 10)).toBe("2026-03-15");
  });
  it("clamps leap-day sales to the last valid day", () => {
    expect(warrantyEndDate(new Date("2024-02-29")).toISOString().slice(0, 10)).toBe("2026-02-28");
  });
  it("reports status", () => {
    const now = new Date("2026-01-01");
    expect(warrantyStatus(new Date("2025-06-01"), now)).toBe("in_warranty");
    expect(warrantyStatus(new Date("2024-01-20"), now)).toBe("expiring");
    expect(warrantyStatus(new Date("2023-01-01"), now)).toBe("expired");
    expect(warrantyStatus(null, now)).toBe("unknown");
  });
});

describe("model code", () => {
  it("accepts real OPTIER model codes", () => {
    for (const c of ["OPT-RY-2MB-3625C", "OPT-RY-5MPTZ-33X", "OPT-SE-5MWD3625"]) {
      expect(modelCodeSchema.safeParse(c).success).toBe(true);
    }
  });
  it("normalises case and whitespace", () => {
    expect(modelCodeSchema.parse("  opt-ry-2mb-3625c ")).toBe("OPT-RY-2MB-3625C");
  });
  it("rejects other formats", () => {
    for (const c of ["RY-2MB", "OPT-R-2MB", "OPT-RY-", "2MP Pro Bullet Camera"]) {
      expect(modelCodeSchema.safeParse(c).success).toBe(false);
    }
  });
});
