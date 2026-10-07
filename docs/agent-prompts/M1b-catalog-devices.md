# Task M1b: catalog, devices, warranty and CSV import (server only)

Branch: `feat/catalog-devices`. Read `AGENTS.md`, `docs/PLAN.md` (sections 5 and 8) and `docs/AXENTRO_IMPORT.md` first. Contract first: schemas in `packages/shared`.
Do **not** touch auth, RBAC or the web app (another agent owns auth; UI comes in a later task). Do not add permission checks yet: leave `// TODO(M1a): @RequirePermission('device.view')` style comments. After M1a is merged, a small follow-up adds the guards.

## Build
1. **Shared contracts**: models, devices, sale records, import preview/result schemas. Use the existing `modelCodeSchema`, `warrantyStatus()` and `warrantyEndDate()`. Series values: `pro`, `value`, `classic`, `poe`. Kind values: `ipc`, `nvr`, `switch`.
2. **Migration** (new timestamped file): `models` (model_code unique, series, kind, marketing_name, datasheet_url, active), `devices` (uid unique, case-insensitive, model_id, batch_no, manufactured_on, firmware_version), `device_sales` (device_id unique, invoice_no, sale_date, sold_to_name, sold_to_type, sold_to_city, sold_to_phone, source, verified). Source values: `axentro_record`, `invoice_proof`, `customer_stated`. Imported Axentro rows are `axentro_record` and verified. Audit these tables with the existing `audit_trigger()`. Grant the app role only what it needs. Do not store warranty status or end date: compute them when reading.
3. **catalog module**: list and get models; import `docs/samples/catalog-sample.csv` as a seed (`pnpm db:seed` should create the catalog if it is empty).
4. **devices module**: `GET /api/devices/:uid` returns the device, its model, batch, firmware, sale record (if any), warranty status and warranty end date. Unknown UID returns 404 with a plain message. UID matching is trimmed and case-insensitive.
5. **import module** following `docs/AXENTRO_IMPORT.md` exactly: `POST /api/imports/production` and `POST /api/imports/sales` (multipart CSV, UTF-8, header row; use `csv-parse`). Query `dryRun=true` returns the preview (counts of rows to create, update, reject, and conflicts) and saves nothing. Without dry run, valid rows are saved in one transaction, rejected rows are never partially saved, and the response includes a row-level error list (row number, column, plain reason). Re-importing identical data changes nothing. A different `sale_date` for a UID that already has a sale is reported as a **conflict** and not overwritten. Each import writes one audit entry (file name, row counts, actor `system` for now).
6. **Docs**: update `TASKS.md` (tick done items), `DECISIONS.md` (new entries only), `HANDOFF.md`.

## Acceptance (use the sample files in `docs/samples/`)
- Seed catalog, then import `production-sample.csv`: 35 devices created, 0 rejected. Re-import: 0 created, 0 updated.
- Import `axentro-sales-sample.csv`: 30 sales created, 5 devices remain unsold. Lookups show warranty state in warranty (22), expiring (2) and expired (6) as of 7 Oct 2026 (tests must pass a fixed "now", not the real clock).
- On a fresh database with only the production file imported, `axentro-sales-sample-with-errors.csv` gives: 1 row created, 6 rejected, with these reasons: duplicate UID in file, UID not in production list, missing invoice number, wrong date format, future date, and (last row) missing name, invalid type, invalid phone.
- Dry run on any file saves nothing.
- `pnpm check` passes with `TEST_DATABASE_URL` set.
