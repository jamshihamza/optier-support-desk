import type { TicketPriority, TicketStatus } from "@optier/shared";

export type Tone = "info" | "warn" | "ok" | "danger" | "neutral" | "accent";

export const statusTone: Record<TicketStatus, Tone> = {
  new: "info",
  triage: "info",
  troubleshooting: "info",
  waiting_customer: "warn",
  waiting_oem: "warn",
  resolved: "ok",
  rma: "accent",
  management_escalation: "danger",
  closed: "neutral",
};

export const priorityTone: Record<TicketPriority, Tone> = {
  low: "neutral",
  normal: "neutral",
  high: "warn",
  critical: "danger",
};

/** A ticket still needs work unless it is resolved or closed. */
export const isOpen = (s: TicketStatus): boolean => s !== "resolved" && s !== "closed";
export const isWaiting = (s: TicketStatus): boolean => s === "waiting_customer" || s === "waiting_oem";
