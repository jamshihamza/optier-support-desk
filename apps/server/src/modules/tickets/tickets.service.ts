import { Injectable } from "@nestjs/common";
import { type CreateTicketInput, formatTicketNumber, type Ticket, ticketSchema } from "@optier/shared";
import { desc } from "drizzle-orm";
import { DbService } from "../../db/db.service";
import { tickets } from "../../db/schema";

type Row = typeof tickets.$inferSelect;

function toTicket(r: Row): Ticket {
  return ticketSchema.parse({
    id: r.id,
    number: r.number,
    displayNumber: formatTicketNumber(r.number),
    subject: r.subject,
    phone: r.phone,
    channel: r.channel,
    priority: r.priority,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  });
}

/** Public interface of the tickets module. Other modules call this, never the table. */
@Injectable()
export class TicketsService {
  // M0: no auth yet. M1 replaces this with the logged-in user's id.
  private readonly actor = "system";

  constructor(private readonly dbs: DbService) {}

  async create(input: CreateTicketInput): Promise<Ticket> {
    const row = await this.dbs.withActor(this.actor, async (tx) => {
      const [created] = await tx
        .insert(tickets)
        .values({
          subject: input.subject,
          phone: input.phone ?? null,
          channel: input.channel,
          priority: input.priority,
        })
        .returning();
      if (!created) throw new Error("Ticket insert returned no row");
      return created;
    });
    return toTicket(row);
  }

  async list(limit = 100): Promise<Ticket[]> {
    const rows = await this.dbs.db.select().from(tickets).orderBy(desc(tickets.createdAt)).limit(limit);
    return rows.map(toTicket);
  }
}
