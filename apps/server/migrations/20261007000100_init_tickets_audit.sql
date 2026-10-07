-- M0 walking skeleton: tickets + append-only audit log.
-- Migration files are timestamp-named (YYYYMMDDHHMMSS_name.sql) so two agents never collide.

create extension if not exists pg_trgm;

create table tickets (
  id          uuid primary key default gen_random_uuid(),
  number      bigint generated always as identity,
  subject     text not null,
  phone       text,
  channel     text not null default 'call'
              check (channel in ('whatsapp','call','remote','onsite','email','other')),
  priority    text not null default 'normal'
              check (priority in ('low','normal','high','critical')),
  status      text not null default 'new'
              check (status in ('new','triage','troubleshooting','waiting_customer','waiting_oem',
                                'resolved','rma','management_escalation','closed')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create unique index tickets_number_key on tickets (number);
create index tickets_phone_idx on tickets (phone);
create index tickets_status_idx on tickets (status);
create index tickets_subject_trgm on tickets using gin (subject gin_trgm_ops);

create table audit_log (
  id         bigint generated always as identity primary key,
  at         timestamptz not null default now(),
  actor      text,
  table_name text not null,
  row_id     text,
  action     text not null check (action in ('INSERT','UPDATE','DELETE')),
  old_data   jsonb,
  new_data   jsonb
);
create index audit_log_table_row_idx on audit_log (table_name, row_id);
create index audit_log_at_idx on audit_log (at);

-- Generic trigger: records who (app.user_id), what, and before/after for any audited table.
create function audit_trigger() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_actor text := nullif(current_setting('app.user_id', true), '');
  v_row   jsonb;
begin
  v_row := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  insert into audit_log (actor, table_name, row_id, action, old_data, new_data)
  values (
    v_actor, tg_table_name, v_row ->> 'id', tg_op,
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end
  );
  return null;
end $$;

create trigger tickets_audit
after insert or update or delete on tickets
for each row execute function audit_trigger();

-- Keep updated_at honest.
create function touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;
create trigger tickets_touch before update on tickets
for each row execute function touch_updated_at();

-- Audit log cannot be altered, even by mistake, even by the owner role.
create function audit_log_immutable() returns trigger language plpgsql as $$
begin raise exception 'audit_log is append-only'; end $$;
create trigger audit_log_no_update before update or delete on audit_log
for each row execute function audit_log_immutable();
create trigger audit_log_no_truncate before truncate on audit_log
for each statement execute function audit_log_immutable();
