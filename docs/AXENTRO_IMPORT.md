# Data import contract: production list and Axentro sales list

**All data in `docs/samples/` is fake.** Model codes (`OPT-ZZ-...`, where `ZZ` marks a fake family), UIDs (`SMP...`), parties and phone numbers are invented. Replace them with real data later; the column layout is what matters.

## Why two files
Azoan and Axentro are separate entities, so each owns one half of the device record:

| File | Owner | Answers |
|------|-------|---------|
| Production list | Azoan (assembly/QC) | What is this unit? Model, series, batch, build date, firmware |
| Sales list | Axentro (billing) | Who bought it and when? Invoice, sale date, buyer |

They are joined on `uid`. Warranty needs only the sales list (24 months from `sale_date`). The production list adds batch tracking (to find a faulty batch) and lets the desk recognise a UID before it is sold.
The importer must work with **either file alone**: production first (units in stock), sales later.

## Catalog: `catalog-sample.csv`
The catalog is keyed on **model code**, not on the marketing name used on the website (for example `OPT-RY-2MB-3625C` is "2MP Pro Two Way Communication Full Colour Bullet Camera"). Columns: `model_code`, `series` (`pro`, `value`, `classic`, `poe`), `kind` (`ipc`, `nvr`, `switch`), `marketing_name`. The website lists IP cameras (Pro 19, Classic 12, Value 3), NVRs (Pro 7, Classic 2, Value 2) and switches. The two real rows in the sample were taken from the website; the rest are fake. Azoan's list of all model codes is needed for the real catalog.

## Production list: `production-sample.csv`
| Column | Required | Rule |
|--------|----------|------|
| `uid` | yes | Unique per unit. Trimmed, case-insensitive match. Real UID format to be confirmed |
| `model_code` | yes | Format `OPT-<two letters>-<spec>`, for example `OPT-RY-2MB-3625C` (confirmed by the business). Must exist in the catalog, or be created in the preview step |
| `series` | yes | `pro`, `value`, `classic`, `poe` |
| `batch_no` | no | Production batch/lot |
| `manufactured_on` | no | `YYYY-MM-DD`, not in the future |
| `firmware_version` | no | Text |

## Sales list: `axentro-sales-sample.csv`
| Column | Required | Rule |
|--------|----------|------|
| `uid` | yes | Should match a known unit; unknown UIDs are reported, not silently created |
| `invoice_no` | yes | Axentro invoice reference |
| `sale_date` | yes | `YYYY-MM-DD`, not in the future. This is the **warranty start date** |
| `sold_to_name` | yes | Dealer, distributor or direct client |
| `sold_to_type` | yes | `distributor`, `dealer`, `direct` |
| `sold_to_city` | no | Text |
| `sold_to_phone` | no | Digits, at least 8 |

File format: CSV, UTF-8, header row, comma separated. Excel files must be saved as CSV first.

## Import behaviour (to be built in M1)
1. **Preview first.** Nothing is saved until the user confirms. The preview shows counts of rows that will be created, updated, and rejected.
2. **Row-level error report**, downloadable as CSV, with the row number and a plain reason. `axentro-sales-sample-with-errors.csv` contains one example of each of these: duplicate UID in the file, UID not in the production list, missing invoice, wrong date format, future date, missing name with invalid type and phone.
3. **Valid rows are imported even if others fail** (after confirmation). Rejected rows are never partially saved.
4. **Re-importing is safe.** A row for an existing UID with the same data changes nothing. A different `sale_date` for a UID that already has one is **not overwritten automatically**; it appears in the preview as a conflict for a person to decide.
5. Sale dates from this file are marked **verified** (source: Axentro record), per PLAN.md section 5.
6. Every import is recorded in the audit log: who, when, file name, row counts.
7. Imports need a permission (`device.import`), planned for Admin and Manager only.

## What the samples contain
- `production-sample.csv`: 35 units across 5 batches, all four series.
- `axentro-sales-sample.csv`: 30 of those units sold; 5 deliberately left unsold (in stock). Sale dates are spread so the desk shows each warranty state: in warranty, expiring within 30 days, and out of warranty (as of 7 Oct 2026).
- `axentro-sales-sample-with-errors.csv`: 7 rows, each broken in a known way, for testing the preview.

## Questions for the business
1. What does a real UID look like (length, letters/digits)? Is it printed on the label and in the Axentro invoice?
2. Can Axentro export one row per unit with the UID, or only per invoice line with a UID list?
3. Does Azoan keep a production list in Excel today, and what columns does it have?
