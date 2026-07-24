# CRM Users — [Implemented]
Route: `users` · Source: `superadmin/src/pages/UsersPage.jsx` → `UsersPage()`, `superadmin/src/data/users.js`

## Purpose
The cross-tenant directory of end-users who work inside each tenant's LEDSAK CRM — the telecallers, team leads, brand CEOs, and CMO super admins who manage leads day to day. Distinct from Security & Access's Admin Users (LEDSAK's own internal team, `data/security.js`). Super admins use this page to find users across every tenant, view their profile/activity/permissions, invite and edit them, and support/manage access (impersonate, suspend, reactivate, reset password).

## Flow

### Primary path
1. Page loads with 4 live KPI cards and two tabs: **All Users** (filterable table) and **Hierarchy View** (per-tenant 4-tier org tree).
2. All Users: search + Tenant/Role/Branch/Team filters + Status pills, all ANDed together. Row click (outside the Tenant link, checkbox, and Actions cell) opens the User Detail drawer.
3. Hierarchy View: a tenant selector (defaults to the tenant with the most users) renders a recursive tree of who reports to whom, with a stats sidebar.
4. "+ Invite User" opens a form drawer; on save the user is created with `status: "Invited"`.
5. Selecting rows swaps the page header's actions to a `BulkActionsMenu` (WhatsApp/Email/Suspend/Reactivate/Export).
6. Every mutation (`createUser`, `updateUser`, `setUserStatus`, `bulkSuspend`, `bulkReactivate`) calls `addHistory` + `notify`.

### Edge cases
- Invite/Edit validation: name (≥2 chars), valid+unique email, tenant, role required; Team required for Team Lead; Brand required for Brand CEO when the tenant has any existing brand-tagged user.
- Editing a user cannot change `email` or `tenant` (both inputs disabled, with an explanatory note under email) — re-invite under a new tenant/email instead.
- The "Brand" field only appears once a tenant has at least one existing user with a `brand` set (i.e. it's a detected multi-brand tenant, not a hardcoded list) — see Decisions.
- "Reports To" only appears for roles above tier 1 (a CMO Super Admin has no manager), and only lists users one tier above the selected role within the selected tenant (`getEligibleManagers`).
- Hierarchy View: when a node's children span more than one distinct `brand`, they're grouped under synthetic "🏢 {brand}" sub-headers (Varun Group's Toyota/BYD split); single-brand tenants render a plain nested tree with no grouping level.
- If a user has `reportsTo: null` but isn't a CMO (e.g. created via Invite with "Reports To" left blank), they render as their own separate root-level tree in the Hierarchy View rather than nesting under anyone — this is a direct, honest consequence of the data (no manager on record), not a special case in the renderer.

## KPI Cards (4, live-computed)
| Label | Formula |
|-------|---------|
| Total Users | `users.length`, sub `"across {N} tenants"` |
| Active (7d) | count where `loginCount30d > 0`, sub `"{pct}% engagement"`, `trend="pos"` at ≥70% |
| Suspended | count where `status === "Suspended"`, `trend="warn"` when >0 |
| Pending Invites | count where `status === "Invited"` |

## Tab 1 — All Users
Filters (all ANDed): Search (name/email/phone), Tenant dropdown, Role `MultiSelectFilter` (from `CRM_ROLES`), Branch dropdown, Team dropdown, Status pills (`USER_STATUSES`). Tenant/Branch/Team dropdown options are derived live from distinct values already present in `store.users` — not hardcoded lists.

Columns: checkbox, User (avatar tinted by role tier + name + email), Phone, Tenant (clickable → opens the *global* Tenant360 via the `openTenant` prop, same mechanism `CsPage`/`AutomationPage` use), Role (badge, `CRM_ROLE_TONE`), Team / Branch (stacked), Status (badge, `USER_STATUS_TONE`), Last Login (`fmtUserLastLogin`), Leads (Assigned / Converted 30d), Actions (Impersonate icon + ⋯ menu: View Profile, Edit User, Reset Password, Resend Invite *(Invited only)*, Suspend/Reactivate, Deactivate).

Filter/pagination/selection state lives in the parent `UsersPage`, not the tab component itself, so the page header can swap to `BulkActionsMenu` the moment any row is selected — `AllUsersTab` is purely presentational.

**Bulk actions** (via an extended `BulkActionsMenu` — see Decisions): Bulk WhatsApp, Bulk Email (both pre-existing, toast-only), Bulk Suspend (`store.bulkSuspend`), Bulk Reactivate (`store.bulkReactivate`), Export Selected (toast).

## Tab 2 — Hierarchy View
Tenant selector (all tenants that have ≥1 user) defaults to whichever has the most users. The tree is built by `getUserHierarchy(users, tenantName)` — a plain, depth-agnostic `reportsTo` recursion (no hardcoded tier count), rendered by a recursive `HierarchyNode` component. Each node shows an avatar (a crown icon instead, for tier-1 CMOs), name, role badge, team/branch in parentheses, a status badge when not Active, and a lead count for telecallers. Multi-brand grouping is a rendering decision (see Rules), not baked into the tree data.

A stats sidebar (`HierarchyStats`) shows: user count by role/tier, Active vs Inactive, average leads per telecaller, and Seats Used / Licensed (cross-referencing `store.clients`' `seats` field).

## User Detail Drawer
Header: avatar, name, role + status badges, copyable email/phone, a "{tenant} →" link into Tenant360, and quick actions (Impersonate, Edit, Reset Password, Suspend/Reactivate).

Three tabs:
- **Profile** — lead stats (Assigned / Converted 30d / Conversion Rate), a Details card (tenant, role, tier, team, branch, brand, resolved "Reports To" name, created date/by), and a Login & Security card (last login, 30d login count, MFA badge, active sessions).
- **Activity** — informational only, no edit actions. "Recent Logins" and "Recent Actions" are **simulated** (deterministic per-user, derived from `user.id`/`lastLogin`/`lastActive`, not a real backend or log source — see Decisions) since there's no real login/action log to join against for CRM end-users.
- **Permissions** — a read-only prose summary per role (`CRM_ROLE_PERMISSION_SUMMARY`), not the full checkbox matrix Security & Access uses for admin roles (that matrix models internal LEDSAK permissions; CRM roles are a fixed 4-tier scope, not independently configurable).

## Invite / Edit User Form
Shared drawer, `mode: "create" | "edit"`. Fields: Name, Email, Phone (optional), Tenant (Active/Trial tenants only; disabled on edit), Role, Brand (conditionally visible), Team / Branch (free-text inputs backed by an HTML `<datalist>` of that tenant's existing values — see Decisions), Reports To (optional, tier-filtered).

On create: `store.createUser(payload)` always forces `status: "Invited"` server-side (in the store method) regardless of what the form sends, plus zeroes out login/lead stats. On edit: `store.updateUser(id, payload, "User edited")`.

## Cross-Page Integration
- **`ClientsPage.jsx`'s Tenant360 "Users" tab**: enriched to show Role badge (`CRM_ROLE_TONE`), Team/Branch, and Last Login columns; its header action changed from a toast-only "Invite" button to a real "View all users →" link that calls `go("users", { tenant: c.name })`; each row also gets a "View in Users" icon-link doing the same. `store.resetPassword` calls there were updated from the old `(name)` signature to `(id)`.
- **`UsersPage`'s Tenant links**: open the *global* Tenant360 (the one Layout.jsx owns for cross-page navigation, via `openTenant={setTenantForCs}`) — distinct from the *local* Tenant360 instance `ClientsPage` renders for its own list. Both are the same `Tenant360` component, just mounted twice for two different trigger paths, matching the pattern already established by `CsPage`/`AutomationPage`.
- **Router-state prefill**: `Layout.jsx` passes `filter={location.state}` to `UsersPage` (same mechanism `AutomationPage`/`IntegrationsPage` use) — landing on `/users` via a "View all users" link pre-sets the Tenant filter to `filter.tenant`. No URL query string is used (see Decisions).

## Rules
- Exactly one manager tier above a role is eligible as "Reports To" (`getEligibleManagers`) — a Telecaller can only report to a Team Lead in the same tenant, never directly to a CEO/CMO, even though some seed data (e.g. Rezoni, which has no Team Lead) has a Telecaller reporting straight to the CMO. That seed exception is honored as existing data; the *form* only offers tier-appropriate managers going forward.
- A tenant is "multi-brand" purely by observation: if any existing user of that tenant has a non-null `brand`, the Brand field appears for new/edited users of that tenant. There's no separate tenant-level "is multi-brand" flag.
- `createUser` always sets `status: "Invited"` and zeroes login/lead stats, regardless of what's passed in — the form never lets an admin fabricate a user with fake activity history.
- Bulk actions clear the selection after firing.

## Permissions
No access control — all super admin users can view, invite, edit, impersonate, suspend, reactivate, and deactivate any CRM user across every tenant.

## Automations
None triggered from this page. All mutations only write to `history` (audit trail) via `addHistory`.

## Decisions
- **2026-07-24** — `SEED_USERS` moved out of `data/seed.js` into a new `data/users.js` (28 users, full profiles), with `seed.js` re-exporting it (`export { SEED_USERS } from "./users.js"`) so `AutomationPage.jsx`'s existing `import { SEED_USERS } from "../data/seed.js"` keeps working unchanged. Rejected: updating every import site to point at `data/users.js` directly — the re-export is one line and avoids touching a file (`AutomationPage.jsx`) that has nothing to do with this feature.
- **2026-07-24** — The 6 old seed users' roles/tenants were folded into the new 28-user roster where they overlapped (e.g. Rezoni's Sneha Kapoor, Urban Autohub's Vikram Singh), but **Aryaanya Group's user ("Anita Desai") and Varun Group's old placeholder CEO ("Arjun Nair") were dropped**, since the new spec's 6-tenant roster doesn't include Aryaanya Group and gives Varun Group a full real hierarchy instead. Side effect: `AutomationPage.jsx`'s `resolveOpsRecipient` (used to simulate ops-automation recipient resolution for tenants with a `recipientType: "tenant"` action) will now correctly report "No tenant contact on record" for Aryaanya Group instead of resolving to Anita Desai — a more accurate simulation, not a bug, since that tenant genuinely has no CRM user seeded.
- **2026-07-24** — `Team` and `Branch` in the Invite/Edit form are free-text `<input>`s backed by a native HTML `<datalist>` (populated from that tenant's existing values via `getTeamsForTenant`/`getBranchesForTenant`), rather than a strict `<select>`. Rejected: a strict dropdown — the spec allows "text input or dropdown," and a strict select would make it impossible to invite the *first* user of a brand-new team/branch within a tenant (the datalist has nothing to suggest yet, but the input still accepts free text).
- **2026-07-24** — `BulkActionsMenu` (`components/ui.jsx`) gained an optional `extra` prop (an array of `{label, icon, action, danger}` appended after a divider) instead of UsersPage building its own separate bulk-actions dropdown. Rejected: a page-local bulk menu — the two existing built-in actions (Bulk WhatsApp/Email) are exactly what this page also needs, and `ClientsPage.jsx`'s existing call site is unaffected since `extra` defaults to nothing.
- **2026-07-24** — Cross-page navigation to Tenant360 uses the existing `go(id, params)` + router-`state` mechanism (`filter` prop, matching `AutomationPage`/`IntegrationsPage`), not a literal `?tenant=X` URL query string as one option in the originating prompt suggested. Rejected: URL query params — every other cross-page filter link in this codebase already uses router state, and introducing a second, URL-based mechanism alongside it would fork navigation conventions for no functional benefit (both approaches survive a direct link equally well, since none of this app's routes are deep-linked/bookmarked in practice).
- **2026-07-24** — Activity tab content (recent logins, recent actions) is explicitly simulated and deterministic per user (seeded off `user.id`), not pulled from `SEED_LOGIN_HISTORY` in `data/security.js` — that table is Security & Access's *admin* login history (LEDSAK's internal team), and no CRM end-user email would ever match an entry there. Rejected: silently joining against it anyway (would always resolve to "no history" and look broken) or fabricating a fake shared data source — simulated-and-labeled-as-such is the honest middle ground, consistent with how System Health's incident "Monitoring" actor and other simulated content in this codebase is handled.
- **2026-07-24** — `resetPassword` and `resendInvite` store methods were changed from `(name)` / `(id)`-but-ignored signatures to both consistently take `(id)`, matching `resetAdminPassword`'s established pattern in `data/security.js`. Both call sites (`ClientsPage.jsx` Tenant360, `UsersPage.jsx`) were updated. `setUserStatus` also gained an `addHistory` call it was missing before — every mutation on this page (and the ones it touches) now has an audit trail.

## Open questions
- `CRM_ROLE_PERMISSION_SUMMARY` is prose, not an enforced permission model — nothing in this prototype actually restricts what a Telecaller-role impersonated session can see vs a CMO's. Is a real enforcement layer planned, or does Permissions stay documentation-only (mirroring how the rest of this app treats "permissions" as descriptive, not enforced)?
- The Hierarchy View's "Avg Leads / Telecaller" and Seats Used/Licensed stats are useful signals but have no drill-in — should clicking them jump to a filtered All Users view (e.g. "show only this tenant's telecallers")?
- No "convert lead to entity" / "assign lead to telecaller" action exists anywhere yet — `leadsAssigned`/`leadsConverted30d` are static seed numbers, not live-computed from `LeadsPage`'s own lead records. Should they be, once Lead & Record Management and CRM Users share a real linkage?
- Team/Branch as free-text-with-suggestions means two admins could accidentally create near-duplicate teams ("Delhi Toyota" vs "Delhi  Toyota" with a stray space) — worth normalizing/trimming more aggressively, or is this an acceptable prototype-level looseness?
