import { z } from "zod";

/** Ticket lifecycle (see docs/PLAN.md section 5). Waiting states pause the SLA clock. */
export const ticketStatuses = [
  "new",
  "triage",
  "troubleshooting",
  "waiting_customer",
  "waiting_oem",
  "resolved",
  "rma",
  "management_escalation",
  "closed",
] as const;
export const ticketStatusSchema = z.enum(ticketStatuses);
export type TicketStatus = z.infer<typeof ticketStatusSchema>;

export const ticketChannels = ["whatsapp", "call", "remote", "onsite", "email", "other"] as const;
export const ticketChannelSchema = z.enum(ticketChannels);
export type TicketChannel = z.infer<typeof ticketChannelSchema>;

export const ticketPriorities = ["low", "normal", "high", "critical"] as const;
export const ticketPrioritySchema = z.enum(ticketPriorities);
export type TicketPriority = z.infer<typeof ticketPrioritySchema>;

/** Minimal contact rule (D14): a phone number and a one-line problem are enough to log a ticket. */
export const createTicketInputSchema = z.object({
  phone: z.string().trim().min(5).max(20).optional(),
  subject: z.string().trim().min(3).max(200),
  channel: ticketChannelSchema.default("call"),
  priority: ticketPrioritySchema.default("normal"),
});
export type CreateTicketInput = z.infer<typeof createTicketInputSchema>;
/** What a client sends: defaults (channel, priority) may be omitted. */
export type CreateTicketRequest = z.input<typeof createTicketInputSchema>;

export const ticketSchema = z.object({
  id: z.string().uuid(),
  number: z.number().int().positive(),
  displayNumber: z.string(),
  subject: z.string(),
  phone: z.string().nullable(),
  channel: ticketChannelSchema,
  priority: ticketPrioritySchema,
  status: ticketStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Ticket = z.infer<typeof ticketSchema>;

export const healthSchema = z.object({
  status: z.literal("ok"),
  db: z.boolean(),
  time: z.string(),
});
export type Health = z.infer<typeof healthSchema>;

/** Ticket number as shown to humans, e.g. T-000123. */
export function formatTicketNumber(n: number): string {
  return `T-${String(n).padStart(6, "0")}`;
}

/** Warranty (D11): 24 months from date of sale. */
export const WARRANTY_MONTHS = 24;
export type WarrantyStatus = "in_warranty" | "expiring" | "expired" | "unknown";

export function warrantyEndDate(saleDate: Date, months = WARRANTY_MONTHS): Date {
  const d = new Date(Date.UTC(saleDate.getUTCFullYear(), saleDate.getUTCMonth(), saleDate.getUTCDate()));
  const day = d.getUTCDate();
  d.setUTCMonth(d.getUTCMonth() + months);
  // Month overflow (e.g. 31 Jan + 1 month) rolls into the next month: clamp to last day.
  if (d.getUTCDate() !== day) d.setUTCDate(0);
  return d;
}

export function warrantyStatus(saleDate: Date | null | undefined, now: Date = new Date()): WarrantyStatus {
  if (!saleDate) return "unknown";
  const end = warrantyEndDate(saleDate);
  const msLeft = end.getTime() - now.getTime();
  if (msLeft < 0) return "expired";
  return msLeft <= 30 * 24 * 3600 * 1000 ? "expiring" : "in_warranty";
}
