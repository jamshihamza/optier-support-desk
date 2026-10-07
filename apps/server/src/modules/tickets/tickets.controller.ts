import { Body, Controller, Get, Post } from "@nestjs/common";
import { type CreateTicketInput, createTicketInputSchema, type Ticket } from "@optier/shared";
import { ZodValidationPipe } from "../../common/zod.pipe";
import { TicketsService } from "./tickets.service";

@Controller("tickets")
export class TicketsController {
  constructor(private readonly tickets: TicketsService) {}

  @Get()
  list(): Promise<Ticket[]> {
    return this.tickets.list();
  }

  @Post()
  create(@Body(new ZodValidationPipe(createTicketInputSchema)) body: CreateTicketInput): Promise<Ticket> {
    return this.tickets.create(body);
  }
}
