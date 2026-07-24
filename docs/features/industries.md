# Industries & Templates — [Implemented]
Route: `industries` · Source: `superadmin/src/pages/IndustriesPage.jsx` → `IndustriesPage()`, `superadmin/src/data/industries.js`

## Purpose
The CRM configuration factory — defines what a tenant's CRM is pre-loaded with at onboarding: lead fields, lead sources, lead groups, one or more lead **pipelines** (multi-pipeline — e.g. Automotive ships separate New Car Sales / Used Car / Service pipelines, not one flat stage list), and **custom entities** (post-lead record types like Patient, Booking, Order — each with its own typed fields and an optional pipeline of its own) — per industry vertical. Super admins manage these templates here; `ClientsPage`'s Add Tenant modal reads the Active ones for its Industry dropdown.

## Flow

### Primary path
1. Page loads with 5 live KPI cards and a table of industry templates (6 seeded verticals).
2. Row click or "Edit" (pencil) opens the Industry Configuration drawer, pre-populated.
3. "+ New Industry" opens the same drawer with a blank template (system fields + starter sources/groups + one default pipeline pre-filled; zero entities).
4. Inside the drawer: edit name/icon/status/description/default-flag, then edit each of the 5 tabs (Lead Fields, Lead Sources, Lead Groups, Pipelines & Stages, Entities).
5. "Save Configuration" validates, then calls `store.updateIndustry` (existing) or `store.createIndustry` (new) — both `addHistory` + `notify`.
6. Row menu (⋯): Duplicate (creates a "(Copy)" as Draft, reopens editor on the copy), Set as Default (unsets the previous default), Delete (blocked with an inline reason if any tenant currently uses this industry).

### Edge cases
- Deleting an industry with tenants: the confirm modal shows the blocking reason and disables the Delete button — the guard is enforced in `store.deleteIndustry` too, not just the UI.
- Save validation: industry name required, ≥1 non-system lead field, ≥1 lead source, ≥1 lead group, ≥1 pipeline with every pipeline having ≥2 stages, and per entity: a name, ≥1 field, ≥2 stages if its own pipeline is enabled, and ≥1 option on every Dropdown/MultiSelect field — all shown as one bulleted banner at the top of the drawer body.
- A stage's trash button (in either the Pipelines tab or an entity's own pipeline) disables at exactly 1 remaining stage, independent of the ≥2 rule enforced at Save.
- A pipeline's trash button disables when it's the only pipeline, or when it's the current default — the admin must set a different pipeline as default first, then delete.
- System lead fields (Name, Phone, Email) exist in every industry, are not editable and cannot be removed — their trash button is disabled with an explanatory tooltip.

## KPI Cards (5, live-computed)
| Label | Formula |
|-------|---------|
| Industries | `industries.length`, sub `"{active} active · {draft} draft(s)"` |
| Total Tenants | `store.clients.length` — all tenants, regardless of industry |
| Most Popular | `mostPopularIndustry()` — industry with the highest live tenant count |
| Avg Fields / Industry | `avgFieldsPerIndustry()` — mean `leadFields.length` across all industries |
| Total Entities | `totalEntities()` — sum of every industry's `entities.length`, sub shows `avgEntitiesPerIndustry()` |

## Industry List (table)
Columns: Industry (icon + name + "Default" badge if applicable + description), Status (badge), Tenants (live count), Fields (count), **Pipelines** ("{n} pipelines"), **Entities** ("{n} entities" or "—" if none), Sources (active-only count), Last Modified ("{date} by {who}"), Actions (Edit pencil + ⋯ menu).

Filters: Status pills (All/Active/Draft) + name/description search. Empty state: "No industry templates configured. Create one to get started."

**Tenant counts** are computed live via `countTenantsForIndustry(industry, clients)` — `client.industry === industry.name`. Row click anywhere (outside the Actions cell) opens the editor.

## Industry Configuration Editor (Drawer, 800px)
Header: "← Back" + title (no separate header Save button — see Decisions, carried over from the original build). Body: Industry Name, Icon (picker with a live preview swatch, options from `INDUSTRY_ICONS`), Status (Active/Draft), "Default for new tenants" toggle, Description — then the 5 tabs, then a full-width "Save Configuration" button.

### Tab 1 — Lead Fields
Unchanged from the original build. 2-column grid, each field a bordered card with a small uppercase "Field Name" label above an editable input, and a red circular trash button beside it. System fields render disabled/muted. "+ Add Field" is a dashed-border button that spans both columns when the field count is even, auto-focuses its new input.

### Tab 2 — Lead Sources
Unchanged. Single-column rows: editable name input, `Switch` (active/inactive), trash. "+ Add Source" dashed button.

### Tab 3 — Lead Groups
Unchanged. Rows: a `ColorSwatch` (8-color preset picker), name input, optional description input, trash. "+ Add Group" dashed button.

### Tab 4 — Pipelines & Stages (replaces the old flat "Lead Stages" tab)
A **pipeline selector** — a row of pills, one per pipeline, the selected one filled/blue and starred if it's the default, plus a dashed "+ Add Pipeline" pill. Below it, a header card for the selected pipeline: an editable name input, a "Set as Default" / "Default" toggle-button, and a delete button (disabled when it's the only pipeline or the current default). Below that, the same stage editor UI as before (`StageRow`: up/down reorder, color swatch, name, SLA-hours, trash disabled at 1 remaining stage) operating on the selected pipeline's `stages` array, then "+ Add Stage" and a live **Pipeline Preview** strip.

Switching pipelines swaps the entire stage editor and preview to that pipeline's own stages — each pipeline's stages are fully independent. "+ Add Pipeline" creates one named "New Pipeline" with 3 starter stages (Enquiry, Won, Lost) and selects it immediately.

### Tab 5 — Entities (new)
"Custom Entities" header + description + a page-level "+ Add Entity" button. Entities render as collapsed-by-default cards (icon, name, description, a one-line summary — `"{n} fields · Pipeline: {stage names}"` or `"{n} fields · No pipeline"`), each with its own delete button and an expand chevron.

**Expanded card** shows: Entity Name / Icon (`ENTITY_ICONS`, resolved through the same `ICON_MAP` as the industry icon picker since the two lists overlap) / Description, a **Fields** section, and a **pipeline toggle** section.

Each field row is Name input + Type `<select>` (from `ENTITY_FIELD_TYPES`, 13 types) + a "Req" checkbox + trash, in one 4-column row. When the type is `Dropdown` or `MultiSelect`, an **Options** editor appears directly below that row: existing options render as removable pills, and a trailing text input commits a new pill on Enter or blur. "+ Add Field" appends a blank `Text` field.

The pipeline section is a `Switch` ("Enable pipeline for this entity") — off by default (`BLANK_ENTITY`'s pipeline starts disabled). Turning it on seeds 2 starter stages (Open/Closed) if the entity has none yet; turning it off just hides the editor (stages aren't discarded, so re-enabling restores them). When enabled, the exact same `StageRow` component used by the Pipelines tab renders per-entity stages (including SLA), plus a small Pipeline Preview.

"+ Add Entity" clones `BLANK_ENTITY` (2 system-ish starter fields: Name required, Phone optional; pipeline disabled), expands it, and auto-focuses its name input.

## Cross-Page Integration
- **`ClientsPage.jsx`**: `TENANT_INDUSTRIES` (used by the Add Tenant modal's Industry `<select>`) is computed inside `AddTenantModal` as `store.industries.filter(i => i.status === "Active").map(i => i.name)` — unaffected by this fix, still working as before.
- **`OnboardingPage.jsx`**: still unchanged — see Open Questions.

## Rules
- Exactly one industry can have `isDefault: true`; exactly one *pipeline per industry* can have `isDefault: true` (`setPipeline`/`setDefault` inside `PipelinesTab` unsets every sibling pipeline's flag in the same update, mirroring the industry-level default logic).
- Delete (industry) is blocked whenever `countTenantsForIndustry > 0`, both in the UI and in the store method.
- A pipeline can't be deleted if it's the industry's only pipeline, or if it's currently the default pipeline (set a different one as default first).
- Duplicate always produces a `Draft`, non-default copy named "{name} (Copy)" — including a full deep-clone of its pipelines and entities — and reopens the editor on the copy.
- Entity field `type` determines whether an `options: string[]` array exists on that field (`OPTIONS_FIELD_TYPES = ["Dropdown", "MultiSelect"]`); switching a field's type away from one of those two clears its `options` array rather than leaving stale, inaccessible data on the object.
- Lead fields (Tab 1) remain untyped, name-only, exactly as in the original build — only *entity* fields (Tab 5) carry a type. This is a deliberate two-tier model: lead capture stays simple (matches the reference product screenshot), while entities — being the richer, post-conversion record types — get the full type system.

## Permissions
No access control — all super admin users can create, edit, duplicate, and delete industry templates, pipelines, and entities.

## Automations
None triggered from this page. All mutations only write to `history` (audit trail) via `addHistory`.

## Decisions
- **2026-07-24** — Kept `leadStages` → `pipelines` as a full replacement (no back-compat shim keeping both keys). Rejected: preserving a synthetic `leadStages` getter for compatibility — nothing outside this page reads `industry.leadStages` (grepped before changing), so a shim would be dead code carrying real drift risk (two sources of truth for the same concept) for zero consumers.
- **2026-07-24** — Combined "Date" + "Time" into a single `DateTime` field for the Clinic Appointment entity's `Date & Time` and the Real Estate Site Visit entity's `Visit Date & Time`, rather than adding a bare `Time` type. Rejected: introducing a `Time`-only field type — the spec's own `ENTITY_FIELD_TYPES` list only defines `Date` and `DateTime`, not `Time`, and a combined field is what a real scheduling UI would actually render as one control.
- **2026-07-24** — Entity stage rows include the same SLA-hours input as pipeline stage rows (via a single shared `StageRow` component), even though the seed data for entity pipelines doesn't set `slaHours` on any stage (defaults to blank/"—"). Rejected: a second, SLA-less stage-row component for entities — the spec explicitly says entity pipelines get "the same stage editor UI used in the Pipelines tab (color swatch, name, SLA, up/down, trash)," so one shared component is both correct and less code than forking it.
- **2026-07-24** — `EntitiesTab`'s and `PipelinesTab`'s local UI state (which pipeline/entity is selected/expanded) resets whenever the admin switches away from and back to that tab, because the tab content is conditionally rendered (`{tab === "X" && <Component/>}`), which unmounts it. Rejected: lifting that selection state up into the drawer's `form` object — it's pure UI state with no bearing on the saved config, and persisting it there would mean serializing "which pipeline was open" into `store.industries`, which is meaningless once saved.

## Open questions
- Entity fields now have a real type system (`ENTITY_FIELD_TYPES`), but lead fields (Tab 1) still don't — is that two-tier split (simple untyped lead capture vs. typed entity records) the right long-term model, or should lead fields eventually gain types too?
- No drag-and-drop reordering for stages, pipelines, or entities (buttons/menus only) — consistent with the rest of the app's no-DnD-library convention, but worth a shared drag primitive once enough ordered lists exist (this page now has three: lead stages within a pipeline, pipelines themselves are unordered pills, entity stages).
- "Apply to tenant" / pre-filling a new tenant's actual CRM configuration (fields, pipelines, entities) from its industry template at onboarding time is still explicitly out of scope — `OnboardingPage.jsx` remains untouched. When that's built: does a tenant's CRM get its own snapshot/copy of the template at onboarding time (so later edits to the shared template don't retroactively change already-onboarded tenants), and do converted leads literally become rows in an entity's own record store, or just get tagged with an entity type?
- Real Estate still has 0 tenants in seed data — unchanged open question from the original build.
- Entities have no "convert lead to entity" affordance anywhere in the app yet (by design — this page only defines the *template*, not the runtime conversion flow) — when Lead & Record Management or Automation Center eventually needs to model that conversion, should it read `industry.entities` directly, or does the entity template also get snapshotted per-tenant at onboarding like the open question above?
