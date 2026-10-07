import { ticketStatuses } from "@optier/shared";
import { describe, expect, it } from "vitest";
import { isOpen, isWaiting, statusTone } from "./status";
import { isToday } from "./time";

describe("status helpers", () => {
  it("has a tone for every ticket status", () => {
    for (const s of ticketStatuses) expect(statusTone[s]).toBeDefined();
  });
  it("treats resolved and closed as not open", () => {
    expect(isOpen("resolved")).toBe(false);
    expect(isOpen("closed")).toBe(false);
    expect(isOpen("triage")).toBe(true);
  });
  it("marks waiting states", () => {
    expect(isWaiting("waiting_oem")).toBe(true);
    expect(isWaiting("new")).toBe(false);
  });
});

describe("isToday (IST)", () => {
  it("uses the Kolkata calendar day, not UTC", () => {
    // 20:00 UTC on 6 Oct is already 7 Oct 01:30 in IST.
    const now = new Date("2026-10-07T00:30:00+05:30");
    expect(isToday("2026-10-06T20:00:00Z", now)).toBe(true);
    expect(isToday("2026-10-06T10:00:00Z", now)).toBe(false);
  });
});
