# Optier Support Desk: UI Specification (v1)

UI language: **English** (all strings through `react-i18next` so Malayalam can be added later).
Primary target: desktop browsers at 1280px and wider. This is a tool used all day, so **speed beats decoration**.

## 1. Principles

- Keyboard-first, few clicks, obvious status colours.
- Clean and simple, with motion that supports understanding and never delays work.
- Every screen defines empty, loading, error, and permission-denied states.
- Never rely on colour alone: pair it with an icon or text.

## 2. Design system

**Tokens** are CSS variables on `:root`, with a dark theme override; light and dark both ship in M0.

| Group | Spec |
|-------|------|
| Neutrals | slate scale (50 to 950) |
| Brand accent | OPTIER logo royal blue `#2b328c` (dark theme: lighter `#9aa6ee`); neutrals tinted with the logo navy `#0f1027`. Used for primary buttons, links, active nav. All text/background pairs checked to WCAG AA |
| Semantic | green = resolved / in warranty; amber = waiting / at risk; red = breach / critical / out of warranty; blue = in progress; grey = closed |
| Type | Inter, with Noto Sans Malayalam in the fallback stack; 14px base; scale 12/14/16/20/24/32 |
| Spacing | 4px grid |
| Radius | 8px controls, 12px cards |
| Elevation | soft shadows, 1px borders preferred in dense tables |
| Logo | `public/optier-logo.svg` (supplied by the business), always shown on a white plate so its dark parts stay legible in dark theme. Favicon is the lens mark only |
| Icons | Lucide, 16px in tables, 20px in nav |
| Components | shadcn/ui on Radix |

A `/dev/ui` page shows every component and state. It is the visual reference for both agents.

## 3. App shell

- **Left sidebar** (collapsible): Home, Tickets, Devices, RMA, Knowledge, Chat (M4), Reports, Admin. Items depend on permissions.
- **Top bar:** global search and command palette (`Ctrl/Cmd+K`) searching UID, ticket number, phone, customer; notifications bell; theme toggle; user menu.
- **Connection banner:** "Connection to server lost, retrying" appears whenever the API or socket drops (important because the server is a local PC).
- **Shortcuts:** `N` new ticket, `/` search, `G` then `T` tickets, `G` then `D` devices, `Esc` close drawer.

## 4. Screens

### 4.1 Login
Email and password, 2FA code step for Admin, clear error messages, lockout notice.

### 4.2 Home (My Workspace)
- Large UID/phone search box (the most common starting point).
- My open tickets, sorted by SLA risk.
- Unassigned queue with one-click "Take".
- SLA at-risk and breached list.
- Small summary tiles: open, waiting, due today.

### 4.3 Device Lookup (`/devices/:uid`)
- Header card: UID, model, series badge, batch, firmware, sold-to, sale date.
- **Warranty badge** (24 months from date of sale): in warranty (green, days left), expiring within 30 days (amber), expired (red), unknown (grey, with a **"Refer to management"** button that opens a management escalation and shows the decision once made). A **dashed outline with a "stated by customer" label** marks an unverified sale date; staff can mark it verified after checking the invoice.
- Timeline: manufactured, sold, every ticket, every RMA, firmware changes.
- Actions: "Open ticket for this device", "Start RMA".
- Not found state: offer "Create ticket with unregistered device".

### 4.4 Ticket List
- Table view and Kanban toggle.
- Filters: series, model, status, priority, channel, assignee, organization, date range. Saved views.
- Columns: number, subject, device/model, customer, channel, status, priority, SLA timer, assignee, updated.
- Bulk assign and bulk status change.
- Row click opens detail; hover shows a quick preview.

### 4.5 Quick-Create (right drawer, target under 30 seconds)
The phone number is always the first field and drives the rest of the form.

1. **Phone number** identifies the contact.
   - **Open case found:** the drawer defaults to "Add to existing case #123" (one click logs the call/WhatsApp as a timeline entry). Nothing else is asked.
   - **Technician recognised:** minimal mode. Only **one-line problem** remains; organization, channel (last used), and recent devices are prefilled. `Ctrl+Enter` saves. No purchase fields.
   - **Known end customer:** name and any stored purchase details appear prefilled with a "Purchase details on file" tick; staff only confirm.
   - **New end customer:** show the **Purchase details** block: purchase date, seller/dealer, product model, invoice number or photo (optional).
2. **UID** is an optional field. If entered, device and warranty badge auto-fill and purchase details come from the Axentro record when available. A "no UID" choice is one click, never an error.
3. Channel, category, priority (smart defaults, editable).
4. Description with template picker.
5. Duplicate warning if an open ticket exists for that phone or UID.
6. `Ctrl+Enter` saves. Draft auto-saves.

Rule: **never show a field whose answer is already stored** for this contact and product.

### 4.6 Ticket Detail
Three zones:
- **Header:** number, subject, status control, priority, SLA timer (pauses visibly in waiting states), assignee, remote session ID.
- **Centre timeline:** notes, calls, remote sessions, onsite visits, status changes, files. Toggle **Internal** or **Visible to customer** per entry. Composer with templates and attachments (drag and drop, paste screenshots).
- **Right panel:** device card with warranty, **purchase details card** (date, seller, proof; editable in place, shown once, never re-asked), a **"Log contact" button** (one click adds a call/WhatsApp/remote entry when the same person contacts again), customer/organization, previous tickets for this device and customer, suggested knowledge articles, actions: Escalate to OEM, Escalate to management, Start RMA, Link device.

### 4.7 RMA Board
- Kanban columns: Received, QC Inspection, Repair, Testing, Ready, Dispatched.
- Card: ticket, UID, model, location, age, courier.
- Detail drawer: condition photos, QC findings, parts used, courier details, warehouse location.
- Tablet-friendly for the QC bench.

### 4.8 Escalations
- OEM tab: case reference, sent date, days waiting, reply status.
- Management tab: ticket, reason, who was informed, outcome.
- Reminder for OEM cases with no reply after a set number of days.

### 4.9 Knowledge Base
- Search, filters by series, model, firmware.
- Article: symptoms, cause, fix steps, affected versions, embedded YouTube or uploaded screen recordings.
- "Create article from ticket" action.
- Helpful/not helpful feedback.

### 4.10 Chat (M4)
Ticket threads exist from M2. In M4 a dockable team chat panel on the right with channels and direct messages, unread badges, file sharing, ticket links.

### 4.11 Manager Dashboard
- KPI cards: first response time, resolution time, SLA breach %, open backlog, RMA rate, each with delta against the previous period.
- Charts: tickets over time, by series/model, by channel, by category; repeat-issue models; batch defect view; staff workload.
- Global filters: date range, series, team.
- Export CSV and PDF; click any chart segment to open the filtered ticket list.

### 4.12 Admin
Users and roles, permission matrix, organizations and contacts, catalog, UID/sales CSV import with preview and error report, SLA and holiday settings, warranty rules, templates, audit log viewer (filters, export), backup status.

## 5. Motion rules (Anime.js v4, version pinned)

| Where | Motion | Duration |
|-------|--------|----------|
| Drawers and modals | slide + fade | 180-220ms |
| Lists and cards | stagger on **first load only** | 30ms step, 250ms total per item |
| KPI numbers | count-up once | 600ms |
| Charts | draw-in once | 500ms |
| Status badge change | brief pulse | 250ms |
| Loading | skeletons, no spinners over content | n/a |

Rules: nothing over 300ms except KPI/chart intro; no animation on live updates; respect `prefers-reduced-motion`; wrap Anime.js in one `useAnimate` helper so it can be swapped.

## 6. Required states for every screen

Loading skeleton, empty (with a helpful action), error (with retry), no-permission, offline/connection-lost, form draft restore, unsaved-changes warning.

## 7. Accessibility and responsiveness

- WCAG AA contrast, visible focus rings, full keyboard operation, labelled form fields, ARIA live region for toasts.
- Breakpoints: desktop 1280px and up (primary), tablet 768px and up (QC bench), simple mobile view of ticket list/detail/update for field technicians (M5).

## 8. Build order

- M0: tokens, shell, `/dev/ui`, login stub, connection banner.
- M1: login, Admin, device lookup, CSV import.
- M2: ticket list, detail, quick-create, Home.
- M3: RMA board, escalations, knowledge base.
- M4: chat.
- M5: dashboards, animation, polish, mobile view.
