import {
  type CreateTicketRequest,
  type Health,
  healthSchema,
  type Ticket,
  ticketSchema,
} from "@optier/shared";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request(path: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.json();
}

export const api = {
  health: async (): Promise<Health> => healthSchema.parse(await request("/health")),
  listTickets: async (): Promise<Ticket[]> => ticketSchema.array().parse(await request("/tickets")),
  createTicket: async (input: CreateTicketRequest): Promise<Ticket> =>
    ticketSchema.parse(await request("/tickets", { method: "POST", body: JSON.stringify(input) })),
};
