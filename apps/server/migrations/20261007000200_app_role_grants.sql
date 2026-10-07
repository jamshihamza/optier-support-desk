-- The running app uses a restricted role (created by ops/postgres/init-app-role.sh).
-- It can read and write tickets, but can only read and append to audit_log.
-- Guarded so tests and fresh dev databases without the role still migrate cleanly.
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'optier_app') then
    grant usage on schema public to optier_app;
    grant select, insert, update on tickets to optier_app;
    grant select on audit_log to optier_app;
    revoke update, delete, truncate on audit_log from optier_app;
    grant usage, select on all sequences in schema public to optier_app;
  end if;
end $$;
