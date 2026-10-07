import { type CreateTicketRequest, ticketChannels, ticketPriorities } from "@optier/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Drawer } from "../components/Drawer";
import { EmptyState } from "../components/EmptyState";
import { StatusChip } from "../components/StatusChip";
import { api } from "../lib/api";
import { staggerIn } from "../lib/motion";
import { isOpen, priorityTone, statusTone } from "../lib/status";
import { formatDateTime } from "../lib/time";

const field = "h-10 w-full rounded-control border border-line bg-bg px-3 text-base";

function NewTicketForm({ initialPhone, onDone }: { initialPhone: string; onDone: (number: string) => void }) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [phone, setPhone] = useState(initialPhone);
  const [subject, setSubject] = useState("");
  const [channel, setChannel] = useState<CreateTicketRequest["channel"]>("call");
  const [priority, setPriority] = useState<CreateTicketRequest["priority"]>("normal");
  const { data: existing } = useQuery({ queryKey: ["tickets"], queryFn: api.listTickets });

  // Ask once: if this number already has an open case, say so before anything else is typed.
  const openCase =
    phone.trim().length >= 5 ? existing?.find((x) => x.phone === phone.trim() && isOpen(x.status)) : null;

  const create = useMutation({
    mutationFn: (input: CreateTicketRequest) => api.createTicket(input),
    onSuccess: (ticket) => {
      qc.invalidateQueries({ queryKey: ["tickets"] });
      onDone(ticket.displayNumber);
    },
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    create.mutate({ phone: phone.trim() || undefined, subject, channel, priority });
  };

  return (
    <form
      onSubmit={submit}
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submit(e);
      }}
      className="space-y-4"
    >
      <div>
        <label htmlFor="f-phone" className="mb-1 block font-medium">
          {t("form.phone")}
        </label>
        <input
          id="f-phone"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={`${field} tnum`}
        />
        <p className="mt-1 text-xs text-muted">{t("form.phoneHint")}</p>
        {openCase ? (
          <p role="status" className="mt-2 rounded-control bg-warn-soft px-3 py-2 text-sm text-warn">
            {t("form.openCase", { number: openCase.displayNumber })}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="f-subject" className="mb-1 block font-medium">
          {t("form.subject")}
        </label>
        <input
          id="f-subject"
          required
          minLength={3}
          maxLength={200}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={field}
        />
        <p className="mt-1 text-xs text-muted">{t("form.subjectHint")}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="f-channel" className="mb-1 block font-medium">
            {t("form.channel")}
          </label>
          <select
            id="f-channel"
            value={channel}
            onChange={(e) => setChannel(e.target.value as typeof channel)}
            className={field}
          >
            {ticketChannels.map((c) => (
              <option key={c} value={c}>
                {t(`channel.${c}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-priority" className="mb-1 block font-medium">
            {t("form.priority")}
          </label>
          <select
            id="f-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as typeof priority)}
            className={field}
          >
            {ticketPriorities.map((p) => (
              <option key={p} value={p}>
                {t(`priority.${p}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {create.isError ? (
        <p role="alert" className="rounded-control bg-danger-soft px-3 py-2 text-sm text-danger">
          {t("tickets.loadError")}
        </p>
      ) : null}

      <div className="flex gap-2 pt-2">
        <Button variant="primary" type="submit" disabled={create.isPending}>
          {create.isPending ? t("form.saving") : t("form.save")}
        </Button>
      </div>
    </form>
  );
}

export function Tickets() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const [notice, setNotice] = useState<string | null>(null);
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ["tickets"], queryFn: api.listTickets });

  const q = (params.get("q") ?? "").trim().toLowerCase();
  const drawerOpen = params.get("new") === "1";
  const rows = (data ?? []).filter(
    (x) =>
      !q ||
      x.subject.toLowerCase().includes(q) ||
      x.displayNumber.toLowerCase().includes(q) ||
      (x.phone ?? "").includes(q),
  );

  // Entrance animation once, when the first batch of rows appears.
  const body = useRef<HTMLTableSectionElement>(null);
  const animated = useRef(false);
  useEffect(() => {
    if (data && data.length > 0 && !animated.current && body.current) {
      animated.current = true;
      staggerIn(Array.from(body.current.querySelectorAll("tr")));
    }
  }, [data]);

  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(id);
  }, [notice]);

  const closeDrawer = () => {
    const next = new URLSearchParams(params);
    next.delete("new");
    next.delete("phone");
    setParams(next, { replace: true });
  };
  const openDrawer = () => {
    const next = new URLSearchParams(params);
    next.set("new", "1");
    setParams(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("tickets.title")}</h1>
        <Button variant="primary" onClick={openDrawer}>
          <Plus size="1rem" aria-hidden="true" />
          {t("tickets.new")}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-card border border-line bg-surface">
        {isError ? (
          <EmptyState
            title={t("tickets.loadError")}
            action={
              <Button onClick={() => refetch()} variant="secondary">
                {t("tickets.retry")}
              </Button>
            }
          />
        ) : isLoading ? (
          <div className="space-y-2 p-4" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-9 animate-pulse rounded-control bg-surface-2" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState title={t("tickets.empty")} />
        ) : (
          <table className="w-full min-w-[760px] text-left">
            <thead className="border-b border-line text-muted">
              <tr>
                {["number", "subject", "phone", "channel", "status", "priority", "created"].map((c) => (
                  <th key={c} scope="col" className="px-4 py-2.5 font-medium">
                    {t(`tickets.${c}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody ref={body} className="divide-y divide-line">
              {rows.map((tk) => (
                <tr key={tk.id} className="hover:bg-surface-2">
                  <td className="tnum whitespace-nowrap px-4 py-2.5 text-muted">{tk.displayNumber}</td>
                  <td className="max-w-[320px] truncate px-4 py-2.5 font-medium">{tk.subject}</td>
                  <td className="tnum whitespace-nowrap px-4 py-2.5">{tk.phone ?? "-"}</td>
                  <td className="whitespace-nowrap px-4 py-2.5">{t(`channel.${tk.channel}`)}</td>
                  <td className="px-4 py-2.5">
                    <StatusChip tone={statusTone[tk.status]} label={t(`status.${tk.status}`)} />
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusChip tone={priorityTone[tk.priority]} label={t(`priority.${tk.priority}`)} />
                  </td>
                  <td className="tnum whitespace-nowrap px-4 py-2.5 text-muted">
                    {formatDateTime(tk.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {drawerOpen ? (
        <Drawer title={t("tickets.new")} onClose={closeDrawer}>
          <NewTicketForm
            initialPhone={params.get("phone") ?? ""}
            onDone={(number) => {
              setNotice(t("form.created", { number }));
              closeDrawer();
            }}
          />
        </Drawer>
      ) : null}

      <div aria-live="polite" className="pointer-events-none fixed bottom-5 right-5 z-50">
        {notice ? (
          <p className="rounded-control bg-ink px-4 py-2.5 font-medium text-bg shadow-soft">{notice}</p>
        ) : null}
      </div>
    </div>
  );
}
