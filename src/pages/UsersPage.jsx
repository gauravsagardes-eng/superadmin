import React, { useState, useEffect, useMemo } from "react";
import {
  Download, UserPlus, LogIn, Key, Mail, Power, Ban, X, ChevronDown, Eye,
  Pencil, XCircle, Building2, Crown,
} from "lucide-react";
import { T, cx } from "../theme.js";
import { useStore } from "../store/StoreContext.jsx";
import {
  PageHeader, Button, Kpi, Card, CardHeader, CardBody, Table, Td, SelectAllHeader, RowCheckbox,
  Avatar, Badge, Menu, SearchInput, FilterPill, MultiSelectFilter, Pagination, usePagination,
  useRowSelection, BulkActionsMenu, Drawer, Tabs, Field, CopyButton,
} from "../components/ui.jsx";
import {
  CRM_ROLES, CRM_ROLE_TIER, CRM_ROLE_TONE, CRM_ROLE_PERMISSION_SUMMARY, USER_STATUSES,
  USER_STATUS_TONE, getUsersByTenant, getTeamsForTenant, getBranchesForTenant, getUserHierarchy,
  getEligibleManagers, fmtUserLastLogin,
} from "../data/users.js";

const AVATAR_TONE_BY_TIER = { 1: "purple", 2: "purple", 3: "brand", 4: "green" };

/* ---- Simulated Activity tab content — Activity is informational only (no real backend to
   pull from); deterministic per-user so it doesn't reshuffle on every render. ---- */
function parseUserTs(s) {
  if (!s) return null;
  const [datePart, timePart] = s.split(" ");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = (timePart || "00:00").split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm);
}
const DEVICES = ["Chrome · Windows", "Safari · iPhone", "Chrome · Android", "Edge · Windows"];
function simulatedLoginHistory(user) {
  if (!user.lastLogin) return [];
  const base = parseUserTs(user.lastLogin);
  return [0, 1, 2].map((i) => {
    const d = new Date(base);
    d.setDate(d.getDate() - i * 2);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    return { id: `lh-${user.id}-${i}`, when: fmtUserLastLogin(iso), device: DEVICES[(user.id + i) % DEVICES.length], ip: `103.21.244.${10 + ((user.id * 3 + i) % 240)}` };
  });
}
const ACTIVITY_TEMPLATES = [
  (u) => `Assigned ${1 + ((u.id * 7) % 9)} new leads`,
  () => "Marked a lead as Won",
  (u) => `Sent WhatsApp to ${2 + ((u.id * 3) % 10)} leads`,
  (u) => `Updated stage for ${1 + ((u.id * 5) % 6)} leads`,
  () => "Logged a call with a lead",
];
function simulatedActivity(user) {
  if (user.status === "Invited" || !user.lastLogin) return [];
  return ACTIVITY_TEMPLATES.map((fn, i) => ({ id: `act-${user.id}-${i}`, text: fn(user), when: i === 0 ? user.lastActive : `${(i + 1) * 4} hr ago` }));
}

/* ============================================================
   USER DETAIL DRAWER
   ============================================================ */
function UserDetailDrawer({ user, users, clients, store, onClose, onEdit, openTenant }) {
  const [tab, setTab] = useState("Profile");
  useEffect(() => { if (user) setTab("Profile"); }, [user?.id]); // eslint-disable-line
  if (!user) return null;

  const manager = user.reportsTo ? users.find((u) => u.id === user.reportsTo) : null;
  const client = clients.find((c) => c.name === user.tenant);
  const conversionRate = user.leadsAssigned ? ((user.leadsConverted30d / user.leadsAssigned) * 100).toFixed(1) : "0.0";
  const loginHistory = simulatedLoginHistory(user);
  const activity = simulatedActivity(user);

  return (
    <Drawer open={!!user} onClose={onClose} width={560}>
      <div className="px-6 pt-5 pb-4 border-b" style={{ borderColor: T.border }}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={user.name} tone={AVATAR_TONE_BY_TIER[user.tier]} size={48} />
            <div>
              <h2 className="text-lg font-semibold" style={{ color: T.text }}>{user.name}</h2>
              <div className="flex items-center gap-1.5 mt-1"><Badge tone={CRM_ROLE_TONE[user.role]}>{user.role}</Badge><Badge tone={USER_STATUS_TONE[user.status]}>{user.status}</Badge></div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--t-hover)]"><X size={18} style={{ color: T.text3 }} /></button>
        </div>
        <div className="mt-3 space-y-1 text-[13px]" style={{ color: T.text2 }}>
          <div className="flex items-center gap-1.5">{user.email}<CopyButton value={user.email} label="email" /></div>
          {user.phone && <div className="flex items-center gap-1.5">{user.phone}<CopyButton value={user.phone} label="phone" /></div>}
          <button onClick={() => client && openTenant && openTenant(client)} className="hover:underline font-medium" style={{ color: T.primary }}>{user.tenant} →</button>
        </div>
        <div className="flex gap-2 mt-4 flex-wrap">
          <Button size="sm" variant="primary" onClick={() => store.impersonate(user)}><LogIn size={13} /> Impersonate</Button>
          <Button size="sm" onClick={() => onEdit(user)}><Pencil size={13} /> Edit</Button>
          <Button size="sm" onClick={() => store.resetPassword(user.id)}><Key size={13} /> Reset Password</Button>
          {user.status === "Suspended"
            ? <Button size="sm" onClick={() => store.setUserStatus(user.id, "Active")}><Power size={13} /> Reactivate</Button>
            : <Button size="sm" variant="danger" onClick={() => store.setUserStatus(user.id, "Suspended")}><Ban size={13} /> Suspend</Button>}
        </div>
        <div className="mt-3"><Tabs tabs={["Profile", "Activity", "Permissions"]} value={tab} onChange={setTab} /></div>
      </div>

      <div className="px-6 py-5">
        {tab === "Profile" && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Kpi label="Assigned" value={String(user.leadsAssigned)} />
              <Kpi label="Converted (30d)" value={String(user.leadsConverted30d)} />
              <Kpi label="Conversion Rate" value={`${conversionRate}%`} />
            </div>
            <Card>
              <CardHeader title="Details" />
              <CardBody><div className="grid grid-cols-2 gap-4">
                <Field label="Tenant">{user.tenant}</Field>
                <Field label="Role">{user.role}</Field>
                <Field label="Tier">Tier {user.tier}</Field>
                <Field label="Team">{user.team || "—"}</Field>
                <Field label="Branch">{user.branch || "—"}</Field>
                <Field label="Brand">{user.brand || "—"}</Field>
                <Field label="Reports To">{manager ? manager.name : "—"}</Field>
                <Field label="Created">{user.createdDate} · {user.createdBy}</Field>
              </div></CardBody>
            </Card>
            <Card>
              <CardHeader title="Login & Security" />
              <CardBody><div className="grid grid-cols-2 gap-4">
                <Field label="Last Login">{fmtUserLastLogin(user.lastLogin)}</Field>
                <Field label="Login Count (30d)">{user.loginCount30d}</Field>
                <Field label="MFA">{user.mfaEnabled ? <Badge tone="success">Enabled</Badge> : <Badge tone="gray">Not enabled</Badge>}</Field>
                <Field label="Active Sessions">{user.sessionsActive}</Field>
              </div></CardBody>
            </Card>
          </div>
        )}
        {tab === "Activity" && (
          <div className="space-y-4">
            <Card>
              <CardHeader title="Recent Logins" />
              <CardBody className="space-y-2.5">
                {loginHistory.length === 0
                  ? <div className="text-[12.5px]" style={{ color: T.text3 }}>No login history yet.</div>
                  : loginHistory.map((lh) => (
                    <div key={lh.id} className="flex items-center justify-between text-[12.5px]">
                      <span style={{ color: T.text }}>{lh.when}</span>
                      <span style={{ color: T.text2 }}>{lh.device} · {lh.ip}</span>
                    </div>
                  ))}
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Recent Actions" />
              <CardBody className="space-y-3">
                {activity.length === 0
                  ? <div className="text-[12.5px]" style={{ color: T.text3 }}>No recent activity.</div>
                  : activity.map((a) => (
                    <div key={a.id} className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: T.primary }} />
                      <div><div className="text-[12.5px]" style={{ color: T.text }}>{a.text}</div><div className="text-[11px]" style={{ color: T.text3 }}>{a.when}</div></div>
                    </div>
                  ))}
              </CardBody>
            </Card>
          </div>
        )}
        {tab === "Permissions" && (
          <Card>
            <CardHeader title="Role Access Summary" sub="Read-only — derived from the tenant's 4-tier CRM role hierarchy, not editable here" />
            <CardBody>
              <div className="rounded-lg p-3.5" style={{ background: T.subtle }}>
                <div className="text-[13px] font-semibold mb-1" style={{ color: T.text }}>{user.role}</div>
                <div className="text-[12.5px]" style={{ color: T.text2 }}>{CRM_ROLE_PERMISSION_SUMMARY[user.role].replace("{brand}", user.brand || "their brand")}</div>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </Drawer>
  );
}

/* ============================================================
   INVITE / EDIT USER FORM DRAWER
   ============================================================ */
const EMPTY_USER_FORM = { name: "", email: "", phone: "", tenant: "", role: "", brand: "", team: "", branch: "", reportsTo: "" };

function UserFormDrawer({ open, mode, initialUser, users, clients, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_USER_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initialUser) {
      setForm({
        name: initialUser.name, email: initialUser.email, phone: initialUser.phone || "",
        tenant: initialUser.tenant, role: initialUser.role, brand: initialUser.brand || "",
        team: initialUser.team || "", branch: initialUser.branch || "",
        reportsTo: initialUser.reportsTo != null ? String(initialUser.reportsTo) : "",
      });
    } else {
      setForm(EMPTY_USER_FORM);
    }
    setErrors({});
  }, [open, mode, initialUser]);

  if (!open) return null;
  const u = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const activeTenants = clients.filter((c) => c.status === "Active" || c.status === "Trial").map((c) => c.name).sort();
  const tenantBrands = form.tenant ? Array.from(new Set(users.filter((x) => x.tenant === form.tenant && x.brand).map((x) => x.brand))) : [];
  const isMultiBrand = tenantBrands.length > 0;
  const teamOptions = form.tenant ? getTeamsForTenant(users, form.tenant) : [];
  const branchOptions = form.tenant ? getBranchesForTenant(users, form.tenant) : [];
  const managers = form.tenant && form.role
    ? getEligibleManagers(users, form.tenant, form.role).filter((m) => !(mode === "edit" && initialUser && m.id === initialUser.id))
    : [];

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = "Name is required (min 2 characters).";
    if (!form.email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = "Enter a valid email.";
    else if (users.some((x) => x.email.toLowerCase() === form.email.trim().toLowerCase() && !(mode === "edit" && initialUser && x.id === initialUser.id))) errs.email = "A user with this email already exists.";
    if (!form.tenant) errs.tenant = "Tenant is required.";
    if (!form.role) errs.role = "Role is required.";
    if (form.role === "Team Lead" && !form.team.trim()) errs.team = "Team is required for Team Leads.";
    if (form.role === "Brand CEO" && isMultiBrand && !form.brand) errs.brand = "Brand is required for this tenant.";
    return errs;
  };

  const handleSave = () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSave({
      name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(),
      tenant: form.tenant, tenantId: clients.find((c) => c.name === form.tenant)?.id ?? null,
      role: form.role, tier: CRM_ROLE_TIER[form.role],
      team: form.team.trim() || null, branch: form.branch.trim() || null, brand: form.brand || null,
      reportsTo: form.reportsTo ? Number(form.reportsTo) : null,
    });
  };

  const inputCls = "w-full mt-1 px-2.5 py-2 rounded-lg border text-[13px] outline-none";

  return (
    <Drawer open={open} onClose={onClose} width={520}>
      <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: T.border }}>
        <h2 className="text-[15px] font-semibold" style={{ color: T.text }}>{mode === "edit" ? "Edit User" : "Invite User"}</h2>
        <button onClick={onClose} className="p-1 rounded hover:bg-[var(--t-hover)]"><X size={16} style={{ color: T.text3 }} /></button>
      </div>
      <div className="px-5 py-4 space-y-3">
        <Field label="Name">
          <input value={form.name} onChange={(e) => u("name", e.target.value)} placeholder="e.g. Rahul Mehta" className={inputCls} style={{ borderColor: errors.name ? T.danger : T.border }} />
          {errors.name && <div className="text-xs mt-1" style={{ color: T.danger }}>{errors.name}</div>}
        </Field>
        <Field label="Email">
          <input value={form.email} onChange={(e) => u("email", e.target.value)} disabled={mode === "edit"} placeholder="name@tenant.com"
            className={cx(inputCls, "disabled:opacity-60")} style={{ borderColor: errors.email ? T.danger : T.border, background: mode === "edit" ? T.subtle : T.surface }} />
          {errors.email && <div className="text-xs mt-1" style={{ color: T.danger }}>{errors.email}</div>}
          {mode === "edit" && <div className="text-[11px] mt-1" style={{ color: T.text3 }}>Email can't be changed after creation.</div>}
        </Field>
        <Field label="Phone (optional)">
          <input value={form.phone} onChange={(e) => u("phone", e.target.value)} placeholder="+91…" className={inputCls} style={{ borderColor: T.border }} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tenant">
            <select value={form.tenant} disabled={mode === "edit"} onChange={(e) => u("tenant", e.target.value)}
              className={cx(inputCls, "disabled:opacity-60")} style={{ borderColor: errors.tenant ? T.danger : T.border, background: mode === "edit" ? T.subtle : T.surface, color: T.text }}>
              <option value="">Select tenant…</option>
              {activeTenants.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.tenant && <div className="text-xs mt-1" style={{ color: T.danger }}>{errors.tenant}</div>}
          </Field>
          <Field label="Role">
            <select value={form.role} onChange={(e) => u("role", e.target.value)} className={inputCls} style={{ borderColor: errors.role ? T.danger : T.border, background: T.surface, color: T.text }}>
              <option value="">Select role…</option>
              {CRM_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            {errors.role && <div className="text-xs mt-1" style={{ color: T.danger }}>{errors.role}</div>}
          </Field>
        </div>
        {isMultiBrand && (
          <Field label="Brand">
            <select value={form.brand} onChange={(e) => u("brand", e.target.value)} className={inputCls} style={{ borderColor: errors.brand ? T.danger : T.border, background: T.surface, color: T.text }}>
              <option value="">Select brand…</option>
              {tenantBrands.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            {errors.brand && <div className="text-xs mt-1" style={{ color: T.danger }}>{errors.brand}</div>}
          </Field>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Team">
            <input value={form.team} onChange={(e) => u("team", e.target.value)} list="crm-team-options" placeholder="e.g. Delhi Team" className={inputCls} style={{ borderColor: errors.team ? T.danger : T.border }} />
            <datalist id="crm-team-options">{teamOptions.map((t) => <option key={t} value={t} />)}</datalist>
            {errors.team && <div className="text-xs mt-1" style={{ color: T.danger }}>{errors.team}</div>}
          </Field>
          <Field label="Branch">
            <input value={form.branch} onChange={(e) => u("branch", e.target.value)} list="crm-branch-options" placeholder="e.g. Delhi" className={inputCls} style={{ borderColor: T.border }} />
            <datalist id="crm-branch-options">{branchOptions.map((b) => <option key={b} value={b} />)}</datalist>
          </Field>
        </div>
        {form.role && CRM_ROLE_TIER[form.role] > 1 && (
          <Field label="Reports To (optional)">
            <select value={form.reportsTo} onChange={(e) => u("reportsTo", e.target.value)} className={inputCls} style={{ borderColor: T.border, background: T.surface, color: T.text }}>
              <option value="">None</option>
              {managers.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
            </select>
          </Field>
        )}
      </div>
      <div className="px-5 py-4 border-t flex justify-end gap-2" style={{ borderColor: T.border }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleSave}>{mode === "edit" ? "Save Changes" : "Send Invite"}</Button>
      </div>
    </Drawer>
  );
}

/* ============================================================
   HIERARCHY VIEW
   ============================================================ */
function HierarchyNode({ node, depth, onOpenUser }) {
  const { user, children } = node;
  const brands = Array.from(new Set(children.map((c) => c.user.brand).filter(Boolean)));
  const grouped = brands.length > 1;
  return (
    <div>
      <div className="flex items-center gap-2 py-1.5 rounded-lg hover:bg-[var(--t-hover)] cursor-pointer flex-wrap" style={{ paddingLeft: depth * 24 }} onClick={() => onOpenUser(user)}>
        {user.tier === 1 ? <Crown size={15} style={{ color: T.warning }} /> : <Avatar name={user.name} tone={AVATAR_TONE_BY_TIER[user.tier]} size={22} />}
        <span className="font-medium text-[13px]" style={{ color: T.text }}>{user.name}</span>
        <Badge tone={CRM_ROLE_TONE[user.role]}>{user.role}</Badge>
        {(user.team || user.branch) && <span className="text-[11.5px]" style={{ color: T.text3 }}>({user.team || user.branch})</span>}
        {user.status !== "Active" && <Badge tone={USER_STATUS_TONE[user.status]}>{user.status}</Badge>}
        {user.tier === 4 && <span className="text-[11px]" style={{ color: T.text3 }}>{user.leadsAssigned} leads</span>}
      </div>
      {grouped ? (
        brands.map((brand) => (
          <div key={brand}>
            <div className="flex items-center gap-1.5 py-1 text-[12px] font-semibold" style={{ paddingLeft: (depth + 1) * 24, color: T.text2 }}>
              <Building2 size={13} /> {brand}
            </div>
            {children.filter((c) => c.user.brand === brand).map((c) => <HierarchyNode key={c.user.id} node={c} depth={depth + 2} onOpenUser={onOpenUser} />)}
          </div>
        ))
      ) : (
        children.map((c) => <HierarchyNode key={c.user.id} node={c} depth={depth + 1} onOpenUser={onOpenUser} />)
      )}
    </div>
  );
}

function HierarchyStats({ tenantName, users, clients }) {
  const tenantUsers = getUsersByTenant(users, tenantName);
  const byTier = { 1: 0, 2: 0, 3: 0, 4: 0 };
  tenantUsers.forEach((u) => { byTier[u.tier] = (byTier[u.tier] || 0) + 1; });
  const activeCount = tenantUsers.filter((u) => u.status === "Active").length;
  const telecallers = tenantUsers.filter((u) => u.tier === 4);
  const avgLeads = telecallers.length ? Math.round(telecallers.reduce((s, u) => s + u.leadsAssigned, 0) / telecallers.length) : 0;
  const client = clients.find((c) => c.name === tenantName);
  return (
    <Card>
      <CardHeader title="Tenant Stats" />
      <CardBody className="space-y-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: T.text3 }}>Users by Role</div>
          <div className="space-y-1 text-[12.5px]">
            {CRM_ROLES.map((r) => (
              <div key={r} className="flex justify-between"><span style={{ color: T.text2 }}>{r}</span><span className="font-medium" style={{ color: T.text }}>{byTier[CRM_ROLE_TIER[r]]}</span></div>
            ))}
          </div>
        </div>
        <div className="pt-3 border-t space-y-3" style={{ borderColor: T.border }}>
          <Field label="Active vs Inactive">{activeCount} / {tenantUsers.length - activeCount}</Field>
          <Field label="Avg Leads / Telecaller">{avgLeads}</Field>
          {client && <Field label="Seats Used / Licensed">{tenantUsers.length} / {client.seats}</Field>}
        </div>
      </CardBody>
    </Card>
  );
}

function HierarchyView({ users, clients, onOpenUser }) {
  const tenantNames = useMemo(() => Array.from(new Set(users.map((u) => u.tenant))), [users]);
  const defaultTenant = useMemo(() => {
    const counts = {};
    users.forEach((u) => { counts[u.tenant] = (counts[u.tenant] || 0) + 1; });
    return [...tenantNames].sort((a, b) => (counts[b] || 0) - (counts[a] || 0))[0];
  }, [users, tenantNames]);
  const [tenantName, setTenantName] = useState(defaultTenant);
  const tree = useMemo(() => getUserHierarchy(users, tenantName), [users, tenantName]);
  const client = clients.find((c) => c.name === tenantName);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
      <Card>
        <CardHeader title={`${tenantName}${client ? ` (${client.industry})` : ""} — ${getUsersByTenant(users, tenantName).length} users`}
          action={
            <div className="relative">
              <select value={tenantName} onChange={(e) => setTenantName(e.target.value)} className="appearance-none pl-2.5 pr-7 py-1.5 rounded-md text-xs border outline-none" style={{ borderColor: T.border, background: T.surface, color: T.text }}>
                {tenantNames.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} />
            </div>
          } />
        <CardBody>
          {tree.length === 0
            ? <div className="text-[13px] text-center py-8" style={{ color: T.text3 }}>No users for this tenant.</div>
            : tree.map((node) => <HierarchyNode key={node.user.id} node={node} depth={0} onOpenUser={onOpenUser} />)}
        </CardBody>
      </Card>
      <HierarchyStats tenantName={tenantName} users={users} clients={clients} />
    </div>
  );
}

/* ============================================================
   ALL USERS TAB (presentational — filter/pagination/selection state
   lives in the parent so PageHeader can swap to BulkActionsMenu)
   ============================================================ */
function AllUsersTab({
  filteredUsers, pageRows, page, setPage, perPage, setPerPage, totalPages, total, sel,
  search, setSearch, tenantFilter, setTenantFilter, roleFilter, setRoleFilter,
  statusFilter, setStatusFilter, branchFilter, setBranchFilter, teamFilter, setTeamFilter,
  tenantNames, branches, teams, store, onOpenUser, onEditUser, onOpenTenant,
}) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center gap-2 flex-wrap mb-3.5 shrink-0">
        <SearchInput value={search} onChange={setSearch} placeholder="Search name, email, phone…" />
        <div className="relative">
          <select value={tenantFilter} onChange={(e) => setTenantFilter(e.target.value)} className="appearance-none pl-2.5 pr-7 py-1.5 rounded-md text-xs border outline-none" style={{ borderColor: tenantFilter !== "All" ? T.primary : T.border, background: tenantFilter !== "All" ? T.primarySoft : T.surface, color: T.text }}>
            <option value="All">All Tenants</option>
            {tenantNames.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} />
        </div>
        <MultiSelectFilter label="Role" options={CRM_ROLES} selected={roleFilter} onChange={setRoleFilter} />
        <div className="relative">
          <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} className="appearance-none pl-2.5 pr-7 py-1.5 rounded-md text-xs border outline-none" style={{ borderColor: branchFilter !== "All" ? T.primary : T.border, background: branchFilter !== "All" ? T.primarySoft : T.surface, color: T.text }}>
            <option value="All">All Branches</option>
            {branches.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} />
        </div>
        <div className="relative">
          <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} className="appearance-none pl-2.5 pr-7 py-1.5 rounded-md text-xs border outline-none" style={{ borderColor: teamFilter !== "All" ? T.primary : T.border, background: teamFilter !== "All" ? T.primarySoft : T.surface, color: T.text }}>
            <option value="All">All Teams</option>
            {teams.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} />
        </div>
        {["All", ...USER_STATUSES].map((s) => <FilterPill key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>{s}</FilterPill>)}
      </div>
      <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <Pagination page={page} totalPages={totalPages} setPage={setPage} perPage={perPage} setPerPage={setPerPage} total={total} selectedCount={sel.selected.size} />
        <Table head={[<SelectAllHeader key="__all" sel={sel} />, "User", "Phone", "Tenant", "Role", "Team / Branch", "Status", "Last Login", "Leads", ""]}>
          {pageRows.map((u) => (
            <tr key={u.id} className={cx("cursor-pointer hover:bg-[var(--t-hover)]", sel.selected.has(u.id) && "bg-[var(--t-subtle)]")} onClick={() => onOpenUser(u)}>
              <Td onClick={(e) => e.stopPropagation()}><RowCheckbox checked={sel.selected.has(u.id)} onChange={(e, shiftKey) => sel.toggle(u.id, { shiftKey })} /></Td>
              <Td>
                <div className="flex items-center gap-2.5">
                  <Avatar name={u.name} tone={AVATAR_TONE_BY_TIER[u.tier]} size={30} />
                  <div className="min-w-0"><div className="font-medium truncate" style={{ color: T.text }}>{u.name}</div><div className="text-[11px] truncate" style={{ color: T.text2 }}>{u.email}</div></div>
                </div>
              </Td>
              <Td className="text-xs whitespace-nowrap" style={{ color: T.text2 }}>{u.phone || "—"}</Td>
              <Td onClick={(e) => e.stopPropagation()}><button onClick={() => onOpenTenant(u.tenant)} className="font-medium hover:underline text-left" style={{ color: T.primary }}>{u.tenant}</button></Td>
              <Td><Badge tone={CRM_ROLE_TONE[u.role]}>{u.role}</Badge></Td>
              <Td className="text-xs" style={{ color: T.text2 }}>{u.team || "—"}<div style={{ color: T.text3 }}>{u.branch}</div></Td>
              <Td><Badge tone={USER_STATUS_TONE[u.status]}>{u.status}</Badge></Td>
              <Td className="text-xs whitespace-nowrap" style={{ color: T.text2 }}>{fmtUserLastLogin(u.lastLogin)}</Td>
              <Td className="text-xs whitespace-nowrap" style={{ color: T.text2 }}>{u.leadsAssigned}<span style={{ color: T.text3 }}> / {u.leadsConverted30d}</span></Td>
              <Td onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1">
                  <button onClick={() => store.impersonate(u)} title="Impersonate" className="p-1 rounded hover:bg-[var(--t-hover)]"><LogIn size={15} style={{ color: T.primary }} /></button>
                  <Menu items={[
                    { label: "View Profile", icon: Eye, onClick: () => onOpenUser(u) },
                    { label: "Edit User", icon: Pencil, onClick: () => onEditUser(u) },
                    { label: "Reset Password", icon: Key, onClick: () => store.resetPassword(u.id) },
                    u.status === "Invited" ? { label: "Resend Invite", icon: Mail, onClick: () => store.resendInvite(u.id) } : null,
                    { divider: true },
                    u.status === "Suspended"
                      ? { label: "Reactivate", icon: Power, onClick: () => store.setUserStatus(u.id, "Active") }
                      : { label: "Suspend", icon: Ban, danger: true, onClick: () => store.setUserStatus(u.id, "Suspended") },
                    u.status !== "Deactivated" ? { label: "Deactivate", icon: XCircle, danger: true, onClick: () => store.setUserStatus(u.id, "Deactivated") } : null,
                  ].filter(Boolean)} />
                </div>
              </Td>
            </tr>
          ))}
          {!filteredUsers.length && <tr><Td colSpan={10} className="text-center py-10" style={{ color: T.text3 }}>No users match the current filters.</Td></tr>}
        </Table>
      </Card>
    </div>
  );
}

/* ============================================================
   MAIN PAGE
   ============================================================ */
const PAGE_TABS = ["All Users", "Hierarchy View"];

export function UsersPage({ go, filter, openTenant }) {
  const store = useStore();
  const { users, clients } = store;
  const [tab, setTab] = useState("All Users");
  const [detailUser, setDetailUser] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingUser, setEditingUser] = useState(null);

  const [search, setSearch] = useState("");
  const [tenantFilter, setTenantFilter] = useState(filter?.tenant || "All");
  const [roleFilter, setRoleFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [teamFilter, setTeamFilter] = useState("All");

  const tenantNames = useMemo(() => Array.from(new Set(users.map((u) => u.tenant))).sort(), [users]);
  const branches = useMemo(() => Array.from(new Set(users.map((u) => u.branch).filter(Boolean))).sort(), [users]);
  const teams = useMemo(() => Array.from(new Set(users.map((u) => u.team).filter(Boolean))).sort(), [users]);

  const filteredUsers = users.filter((u) => {
    if (tenantFilter !== "All" && u.tenant !== tenantFilter) return false;
    if (roleFilter.length && !roleFilter.includes(u.role)) return false;
    if (statusFilter !== "All" && u.status !== statusFilter) return false;
    if (branchFilter !== "All" && u.branch !== branchFilter) return false;
    if (teamFilter !== "All" && u.team !== teamFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q) && !(u.phone || "").toLowerCase().includes(q)) return false;
    }
    return true;
  });
  const { pageRows, page, setPage, perPage, setPerPage, totalPages, total } = usePagination(filteredUsers, 10);
  const sel = useRowSelection(pageRows, filteredUsers);

  const totalUsers = users.length;
  const distinctTenants = new Set(users.map((u) => u.tenant)).size;
  const active7d = users.filter((u) => u.loginCount30d > 0).length;
  const engagementPct = totalUsers ? Math.round((active7d / totalUsers) * 100) : 0;
  const suspendedCount = users.filter((u) => u.status === "Suspended").length;
  const invitedCount = users.filter((u) => u.status === "Invited").length;

  const openDetail = (u) => setDetailUser(u);
  const openEdit = (u) => { setEditingUser(u); setFormMode("edit"); setFormOpen(true); setDetailUser(null); };
  const openCreate = () => { setEditingUser(null); setFormMode("create"); setFormOpen(true); };
  const openTenantDrawer = (tenantName) => {
    const c = clients.find((cl) => cl.name === tenantName);
    if (c && openTenant) openTenant(c);
    else if (go) go("clients");
  };
  const handleSaveForm = (payload) => {
    if (formMode === "edit" && editingUser) store.updateUser(editingUser.id, payload, "User edited");
    else store.createUser(payload);
    setFormOpen(false);
  };
  const bulkAction = (kind) => {
    const ids = Array.from(sel.selected);
    if (kind === "suspend") store.bulkSuspend(ids);
    else if (kind === "reactivate") store.bulkReactivate(ids);
    else if (kind === "export") store.notify(`${ids.length} user(s) exported`);
    else store.notify(`${kind === "whatsapp" ? "WhatsApp" : "Email"} queued for ${ids.length} user(s)`);
    sel.clear();
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <PageHeader title="CRM Users" desc={`Cross-tenant user directory · ${totalUsers} users across ${distinctTenants} tenants`}
        actions={tab === "All Users" && sel.isSome
          ? <BulkActionsMenu count={sel.selected.size} onAction={bulkAction} extra={[
            { label: "Bulk Suspend", icon: Ban, action: "suspend", danger: true },
            { label: "Bulk Reactivate", icon: Power, action: "reactivate" },
            { label: "Export Selected", icon: Download, action: "export" },
          ]} />
          : <><Button onClick={() => store.notify("Users exported")}><Download size={15} /> Export</Button><Button variant="primary" onClick={openCreate}><UserPlus size={15} /> Invite User</Button></>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 shrink-0">
        <Kpi label="Total Users" value={String(totalUsers)} sub={`across ${distinctTenants} tenants`} />
        <Kpi label="Active (7d)" value={String(active7d)} sub={`${engagementPct}% engagement`} trend={engagementPct >= 70 ? "pos" : undefined} />
        <Kpi label="Suspended" value={String(suspendedCount)} sub="policy / non-payment" trend={suspendedCount > 0 ? "warn" : undefined} />
        <Kpi label="Pending Invites" value={String(invitedCount)} sub="not yet accepted" />
      </div>

      <div className="flex gap-0.5 border-b mb-4 shrink-0" style={{ borderColor: T.border }}>
        {PAGE_TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className="px-3.5 py-2.5 text-[13px] font-medium -mb-px border-b-2 transition-colors" style={tab === t ? { color: T.primary, borderColor: T.primary } : { color: T.text2, borderColor: "transparent" }}>{t}</button>
        ))}
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        {tab === "All Users" && (
          <AllUsersTab
            filteredUsers={filteredUsers} pageRows={pageRows} page={page} setPage={setPage} perPage={perPage} setPerPage={setPerPage} totalPages={totalPages} total={total} sel={sel}
            search={search} setSearch={setSearch} tenantFilter={tenantFilter} setTenantFilter={setTenantFilter}
            roleFilter={roleFilter} setRoleFilter={setRoleFilter} statusFilter={statusFilter} setStatusFilter={setStatusFilter}
            branchFilter={branchFilter} setBranchFilter={setBranchFilter} teamFilter={teamFilter} setTeamFilter={setTeamFilter}
            tenantNames={tenantNames} branches={branches} teams={teams} store={store}
            onOpenUser={openDetail} onEditUser={openEdit} onOpenTenant={openTenantDrawer}
          />
        )}
        {tab === "Hierarchy View" && (
          <div className="flex-1 min-h-0 overflow-y-auto pb-1">
            <HierarchyView users={users} clients={clients} onOpenUser={openDetail} />
          </div>
        )}
      </div>

      <UserDetailDrawer user={detailUser} users={users} clients={clients} store={store} onClose={() => setDetailUser(null)} onEdit={openEdit} openTenant={openTenant} />
      <UserFormDrawer open={formOpen} mode={formMode} initialUser={editingUser} users={users} clients={clients} onClose={() => setFormOpen(false)} onSave={handleSaveForm} />
    </div>
  );
}
