/* ============================================================
   CRM USERS — the cross-tenant end-user directory.
   Distinct from Security & Access's Admin Users (LEDSAK's own internal
   team, data/security.js) — these are the people *inside* each tenant
   organization who use the LEDSAK CRM product day to day, arranged in the
   product's 4-tier role hierarchy: CMO Super Admin → Brand CEO → Team Lead
   → Telecaller. Moved out of data/seed.js (which re-exports SEED_USERS for
   compatibility) and expanded from 6 thin rows to a full 28-user roster
   spanning 6 tenants, including a multi-brand hierarchy (Varun Group).
   ============================================================ */
import { MONTHS_SHORT } from "../lib/format.js";

export const CRM_ROLES = ["CMO Super Admin", "Brand CEO", "Team Lead", "Telecaller"];
export const CRM_ROLE_TIER = { "CMO Super Admin": 1, "Brand CEO": 2, "Team Lead": 3, "Telecaller": 4 };
export const CRM_ROLE_TONE = { "CMO Super Admin": "danger", "Brand CEO": "purple", "Team Lead": "brand", "Telecaller": "gray" };
export const CRM_ROLE_PERMISSION_SUMMARY = {
  "CMO Super Admin": "Full access — all brands, branches, leads, reports, and settings for this tenant.",
  "Brand CEO": "All leads, users, and reports within their assigned brand only.",
  "Team Lead": "Their assigned team's leads, plus each team member's individual leads.",
  "Telecaller": "Only the leads directly assigned to them.",
};

export const USER_STATUSES = ["Active", "Suspended", "Deactivated", "Invited"];
export const USER_STATUS_TONE = { Active: "success", Suspended: "danger", Deactivated: "gray", Invited: "warning" };

/* ============================================================
   SEED USERS (28) — 6 tenants
   `tenantId` links to data/seed.js's SEED_CLIENTS[].id. `reportsTo` links
   to another user's `id` within the same tenant (null for CMO Super Admins,
   the tier-1 root of every tenant's tree).
   ============================================================ */
export const SEED_USERS = [
  // ---- MedLinks (Clinic, tenantId 3) — 7 users, 2 teams ----
  { id: 1, name: "Dr. Anand Mehta", email: "anand@medlinks.in", phone: "+919810000001", tenant: "MedLinks", tenantId: 3, role: "CMO Super Admin", tier: 1, team: null, branch: "Safdarjung Enclave", brand: null, reportsTo: null, status: "Active", lastLogin: "2026-05-13 08:10", lastActive: "2 hr ago", loginCount30d: 27, leadsAssigned: 0, leadsConverted30d: 0, createdDate: "2025-09-15", createdBy: "Saif Sir", mfaEnabled: true, sessionsActive: 1 },
  { id: 2, name: "Rahul Mehta", email: "rahul@medlinks.in", phone: "+919810000002", tenant: "MedLinks", tenantId: 3, role: "Team Lead", tier: 3, team: "Delhi Derma Team", branch: "Delhi", brand: null, reportsTo: 1, status: "Active", lastLogin: "2026-05-13 09:42", lastActive: "2 min ago", loginCount30d: 24, leadsAssigned: 342, leadsConverted30d: 18, createdDate: "2025-09-20", createdBy: "Saif Sir", mfaEnabled: false, sessionsActive: 1 },
  { id: 3, name: "Priya Singh", email: "priya.singh@medlinks.in", phone: "+919810000003", tenant: "MedLinks", tenantId: 3, role: "Telecaller", tier: 4, team: "Delhi Derma Team", branch: "Delhi", brand: null, reportsTo: 2, status: "Active", lastLogin: "2026-05-13 09:30", lastActive: "12 min ago", loginCount30d: 22, leadsAssigned: 118, leadsConverted30d: 9, createdDate: "2025-10-01", createdBy: "Saif Sir", mfaEnabled: false, sessionsActive: 1 },
  { id: 4, name: "Deepika Rao", email: "deepika.rao@medlinks.in", phone: "+919810000004", tenant: "MedLinks", tenantId: 3, role: "Telecaller", tier: 4, team: "Delhi Derma Team", branch: "Delhi", brand: null, reportsTo: 2, status: "Active", lastLogin: "2026-05-13 08:55", lastActive: "45 min ago", loginCount30d: 19, leadsAssigned: 96, leadsConverted30d: 7, createdDate: "2025-10-01", createdBy: "Saif Sir", mfaEnabled: false, sessionsActive: 1 },
  { id: 5, name: "Sanjay Kumar", email: "sanjay@medlinks.in", phone: "+919810000005", tenant: "MedLinks", tenantId: 3, role: "Team Lead", tier: 3, team: "Safdarjung Team", branch: "Safdarjung Enclave", brand: null, reportsTo: 1, status: "Active", lastLogin: "2026-05-13 07:20", lastActive: "3 hr ago", loginCount30d: 21, leadsAssigned: 268, leadsConverted30d: 14, createdDate: "2025-09-22", createdBy: "Saif Sir", mfaEnabled: false, sessionsActive: 0 },
  { id: 6, name: "Neha Gupta", email: "neha.gupta@medlinks.in", phone: "+919810000006", tenant: "MedLinks", tenantId: 3, role: "Telecaller", tier: 4, team: "Safdarjung Team", branch: "Safdarjung Enclave", brand: null, reportsTo: 5, status: "Active", lastLogin: "2026-05-12 18:05", lastActive: "1 day ago", loginCount30d: 17, leadsAssigned: 84, leadsConverted30d: 5, createdDate: "2025-10-05", createdBy: "Saif Sir", mfaEnabled: false, sessionsActive: 0 },
  { id: 7, name: "Amit Joshi", email: "amit.joshi@medlinks.in", phone: "+919810000007", tenant: "MedLinks", tenantId: 3, role: "Telecaller", tier: 4, team: "Safdarjung Team", branch: "Safdarjung Enclave", brand: null, reportsTo: 5, status: "Suspended", lastLogin: "2026-05-08 11:15", lastActive: "5 days ago", loginCount30d: 6, leadsAssigned: 41, leadsConverted30d: 1, createdDate: "2025-10-05", createdBy: "Saif Sir", mfaEnabled: false, sessionsActive: 0 },

  // ---- Varun Group (Automotive, tenantId 6) — 10 users, multi-brand (Toyota / BYD) ----
  { id: 8, name: "Parth San", email: "parth@varungroup.in", phone: "+919820000008", tenant: "Varun Group", tenantId: 6, role: "CMO Super Admin", tier: 1, team: null, branch: "Hyderabad", brand: null, reportsTo: null, status: "Active", lastLogin: "2026-05-13 08:00", lastActive: "3 hr ago", loginCount30d: 25, leadsAssigned: 0, leadsConverted30d: 0, createdDate: "2025-06-10", createdBy: "Saif Sir", mfaEnabled: true, sessionsActive: 1 },
  { id: 9, name: "Vikram Rao", email: "vikram.rao@varungroup.in", phone: "+919820000009", tenant: "Varun Group", tenantId: 6, role: "Brand CEO", tier: 2, team: null, branch: "Delhi", brand: "Toyota", reportsTo: 8, status: "Active", lastLogin: "2026-05-13 09:10", lastActive: "35 min ago", loginCount30d: 23, leadsAssigned: 0, leadsConverted30d: 0, createdDate: "2025-06-12", createdBy: "Saif Sir", mfaEnabled: true, sessionsActive: 1 },
  { id: 10, name: "Ankit Sharma", email: "ankit.sharma@varungroup.in", phone: "+919820000010", tenant: "Varun Group", tenantId: 6, role: "Team Lead", tier: 3, team: "Delhi Toyota", branch: "Delhi", brand: "Toyota", reportsTo: 9, status: "Active", lastLogin: "2026-05-13 09:25", lastActive: "20 min ago", loginCount30d: 22, leadsAssigned: 305, leadsConverted30d: 16, createdDate: "2025-06-18", createdBy: "Saif Sir", mfaEnabled: false, sessionsActive: 1 },
  { id: 11, name: "Rahul Kumar", email: "rahul.kumar@varungroup.in", phone: "+919820000011", tenant: "Varun Group", tenantId: 6, role: "Telecaller", tier: 4, team: "Delhi Toyota", branch: "Delhi", brand: "Toyota", reportsTo: 10, status: "Active", lastLogin: "2026-05-13 09:15", lastActive: "30 min ago", loginCount30d: 20, leadsAssigned: 102, leadsConverted30d: 8, createdDate: "2025-07-01", createdBy: "Saif Sir", mfaEnabled: false, sessionsActive: 1 },
  { id: 12, name: "Neha Patel", email: "neha.patel@varungroup.in", phone: "+919820000012", tenant: "Varun Group", tenantId: 6, role: "Telecaller", tier: 4, team: "Delhi Toyota", branch: "Delhi", brand: "Toyota", reportsTo: 10, status: "Active", lastLogin: "2026-05-13 08:40", lastActive: "1 hr ago", loginCount30d: 18, leadsAssigned: 88, leadsConverted30d: 6, createdDate: "2025-07-01", createdBy: "Saif Sir", mfaEnabled: false, sessionsActive: 1 },
  { id: 13, name: "Suresh Iyer", email: "suresh.iyer@varungroup.in", phone: "+919820000013", tenant: "Varun Group", tenantId: 6, role: "Team Lead", tier: 3, team: "Hyderabad Toyota", branch: "Hyderabad", brand: "Toyota", reportsTo: 9, status: "Active", lastLogin: "2026-05-12 17:50", lastActive: "1 day ago", loginCount30d: 19, leadsAssigned: 214, leadsConverted30d: 11, createdDate: "2025-06-20", createdBy: "Saif Sir", mfaEnabled: false, sessionsActive: 0 },
  { id: 14, name: "Priya Nair", email: "priya.nair@varungroup.in", phone: "+919820000014", tenant: "Varun Group", tenantId: 6, role: "Telecaller", tier: 4, team: "Hyderabad Toyota", branch: "Hyderabad", brand: "Toyota", reportsTo: 13, status: "Active", lastLogin: "2026-05-12 17:30", lastActive: "1 day ago", loginCount30d: 16, leadsAssigned: 76, leadsConverted30d: 4, createdDate: "2025-07-05", createdBy: "Saif Sir", mfaEnabled: false, sessionsActive: 0 },
  { id: 15, name: "Ranjit Mody", email: "ranjit.mody@varungroup.in", phone: "+919820000015", tenant: "Varun Group", tenantId: 6, role: "Brand CEO", tier: 2, team: null, branch: "Delhi", brand: "BYD", reportsTo: 8, status: "Active", lastLogin: "2026-05-13 07:45", lastActive: "3 hr ago", loginCount30d: 20, leadsAssigned: 0, leadsConverted30d: 0, createdDate: "2025-08-01", createdBy: "Saif Sir", mfaEnabled: true, sessionsActive: 0 },
  { id: 16, name: "Deepak Joshi", email: "deepak.joshi@varungroup.in", phone: "+919820000016", tenant: "Varun Group", tenantId: 6, role: "Team Lead", tier: 3, team: "BYD Delhi", branch: "Delhi", brand: "BYD", reportsTo: 15, status: "Active", lastLogin: "2026-05-13 09:00", lastActive: "50 min ago", loginCount30d: 18, leadsAssigned: 156, leadsConverted30d: 9, createdDate: "2025-08-10", createdBy: "Saif Sir", mfaEnabled: false, sessionsActive: 1 },
  { id: 17, name: "Amit Verma", email: "amit.verma@varungroup.in", phone: "+919820000017", tenant: "Varun Group", tenantId: 6, role: "Telecaller", tier: 4, team: "BYD Delhi", branch: "Delhi", brand: "BYD", reportsTo: 16, status: "Active", lastLogin: "2026-05-12 16:20", lastActive: "1 day ago", loginCount30d: 15, leadsAssigned: 62, leadsConverted30d: 3, createdDate: "2025-08-15", createdBy: "Saif Sir", mfaEnabled: false, sessionsActive: 0 },

  // ---- Derma Purtitys (Clinic, tenantId 2) — 4 users ----
  { id: 18, name: "Dr. Sunita Shah", email: "sunita@dermapuritys.com", phone: "+919830000018", tenant: "Derma Purtitys", tenantId: 2, role: "CMO Super Admin", tier: 1, team: null, branch: "Delhi", brand: null, reportsTo: null, status: "Active", lastLogin: "2026-05-13 08:20", lastActive: "2 hr ago", loginCount30d: 26, leadsAssigned: 0, leadsConverted30d: 0, createdDate: "2025-05-01", createdBy: "Luv", mfaEnabled: true, sessionsActive: 1 },
  { id: 19, name: "Priya Sharma", email: "priya@dermapuritys.com", phone: "+919830000019", tenant: "Derma Purtitys", tenantId: 2, role: "Telecaller", tier: 4, team: "Delhi Clinic Team", branch: "Delhi", brand: null, reportsTo: 20, status: "Active", lastLogin: "2026-05-13 09:28", lastActive: "18 min ago", loginCount30d: 23, leadsAssigned: 91, leadsConverted30d: 7, createdDate: "2025-05-10", createdBy: "Luv", mfaEnabled: false, sessionsActive: 1 },
  { id: 20, name: "Ravi Malhotra", email: "ravi.malhotra@dermapuritys.com", phone: "+919830000020", tenant: "Derma Purtitys", tenantId: 2, role: "Team Lead", tier: 3, team: "Delhi Clinic Team", branch: "Delhi", brand: null, reportsTo: 18, status: "Active", lastLogin: "2026-05-13 08:50", lastActive: "1 hr ago", loginCount30d: 24, leadsAssigned: 187, leadsConverted30d: 12, createdDate: "2025-05-05", createdBy: "Luv", mfaEnabled: false, sessionsActive: 1 },
  { id: 21, name: "Kavita Desai", email: "kavita.desai@dermapuritys.com", phone: "+919830000021", tenant: "Derma Purtitys", tenantId: 2, role: "Telecaller", tier: 4, team: "Delhi Clinic Team", branch: "Delhi", brand: null, reportsTo: 20, status: "Invited", lastLogin: null, lastActive: "—", loginCount30d: 0, leadsAssigned: 0, leadsConverted30d: 0, createdDate: "2026-05-11", createdBy: "Luv", mfaEnabled: false, sessionsActive: 0 },

  // ---- Urban Autohub (Automotive, tenantId 11) — 3 users ----
  { id: 22, name: "Rajesh Khanna", email: "rajesh@urbanauto.in", phone: "+919840000022", tenant: "Urban Autohub", tenantId: 11, role: "CMO Super Admin", tier: 1, team: null, branch: "Moti Nagar", brand: null, reportsTo: null, status: "Active", lastLogin: "2026-05-13 07:55", lastActive: "3 hr ago", loginCount30d: 22, leadsAssigned: 0, leadsConverted30d: 0, createdDate: "2025-11-01", createdBy: "Luv", mfaEnabled: true, sessionsActive: 1 },
  { id: 23, name: "Vikram Singh", email: "vikram@urbanauto.in", phone: "+919840000023", tenant: "Urban Autohub", tenantId: 11, role: "Telecaller", tier: 4, team: "Moti Nagar Team", branch: "Moti Nagar", brand: null, reportsTo: 24, status: "Active", lastLogin: "2026-05-13 09:05", lastActive: "40 min ago", loginCount30d: 21, leadsAssigned: 73, leadsConverted30d: 6, createdDate: "2025-11-10", createdBy: "Luv", mfaEnabled: false, sessionsActive: 1 },
  { id: 24, name: "Meera Patel", email: "meera.patel@urbanauto.in", phone: "+919840000024", tenant: "Urban Autohub", tenantId: 11, role: "Team Lead", tier: 3, team: "Moti Nagar Team", branch: "Moti Nagar", brand: null, reportsTo: 22, status: "Active", lastLogin: "2026-05-13 08:30", lastActive: "1 hr ago", loginCount30d: 20, leadsAssigned: 159, leadsConverted30d: 10, createdDate: "2025-11-05", createdBy: "Luv", mfaEnabled: false, sessionsActive: 1 },

  // ---- Rezoni (Ecommerce, tenantId 1) — 2 users ----
  { id: 25, name: "Sneha Kapoor", email: "sneha@rezoni.com", phone: "+919850000025", tenant: "Rezoni", tenantId: 1, role: "CMO Super Admin", tier: 1, team: null, branch: "New Delhi", brand: null, reportsTo: null, status: "Suspended", lastLogin: "2026-05-08 10:00", lastActive: "5 days ago", loginCount30d: 4, leadsAssigned: 0, leadsConverted30d: 0, createdDate: "2025-04-01", createdBy: "Saif Sir", mfaEnabled: false, sessionsActive: 0 },
  { id: 26, name: "Rohit Agarwal", email: "rohit@rezoni.com", phone: "+919850000026", tenant: "Rezoni", tenantId: 1, role: "Telecaller", tier: 4, team: null, branch: "New Delhi", brand: null, reportsTo: 25, status: "Active", lastLogin: "2026-05-12 14:10", lastActive: "1 day ago", loginCount30d: 12, leadsAssigned: 54, leadsConverted30d: 2, createdDate: "2025-04-15", createdBy: "Saif Sir", mfaEnabled: false, sessionsActive: 0 },

  // ---- Inside Edge Learning (Education, tenantId 8) — 2 users ----
  { id: 27, name: "Prof. Anil Kapoor", email: "anil@insideedge.in", phone: "+919860000027", tenant: "Inside Edge Learning", tenantId: 8, role: "CMO Super Admin", tier: 1, team: null, branch: "Mumbai", brand: null, reportsTo: null, status: "Active", lastLogin: "2026-05-13 06:50", lastActive: "4 hr ago", loginCount30d: 19, leadsAssigned: 0, leadsConverted30d: 0, createdDate: "2025-03-01", createdBy: "Vishal", mfaEnabled: true, sessionsActive: 0 },
  { id: 28, name: "Sunita Nair", email: "sunita.nair@insideedge.in", phone: "+919860000028", tenant: "Inside Edge Learning", tenantId: 8, role: "Team Lead", tier: 3, team: "Mumbai Team", branch: "Mumbai", brand: null, reportsTo: 27, status: "Active", lastLogin: "2026-05-13 09:38", lastActive: "8 min ago", loginCount30d: 24, leadsAssigned: 128, leadsConverted30d: 9, createdDate: "2025-03-10", createdBy: "Vishal", mfaEnabled: false, sessionsActive: 1 },
];

/* ============================================================
   HELPERS
   ============================================================ */
export function getUsersByTenant(users, tenantName) {
  return users.filter((u) => u.tenant === tenantName);
}
export function getTeamsForTenant(users, tenantName) {
  return Array.from(new Set(users.filter((u) => u.tenant === tenantName && u.team).map((u) => u.team)));
}
export function getBranchesForTenant(users, tenantName) {
  return Array.from(new Set(users.filter((u) => u.tenant === tenantName && u.branch).map((u) => u.branch)));
}
// Recursive parent→children tree built off `reportsTo`, rooted at every user with no
// manager (normally just the one CMO Super Admin). Brand grouping (Varun Group's
// Toyota/BYD split) is NOT baked in here — it's a rendering concern the Hierarchy View
// applies when a node's children span more than one distinct `brand`, so this stays a
// plain, depth-agnostic tree usable for single- and multi-brand tenants alike.
export function getUserHierarchy(users, tenantName) {
  const tenantUsers = getUsersByTenant(users, tenantName);
  const childrenOf = (id) => tenantUsers.filter((u) => u.reportsTo === id).sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name));
  const build = (u) => ({ user: u, children: childrenOf(u.id).map(build) });
  return tenantUsers.filter((u) => u.reportsTo == null).map(build);
}
// Eligible "Reports To" candidates for a new/edited user: users in the same tenant one
// tier above the given role (e.g. a new Telecaller can report to any Team Lead there).
export function getEligibleManagers(users, tenantName, role) {
  const tier = CRM_ROLE_TIER[role];
  if (!tier || tier <= 1) return [];
  return getUsersByTenant(users, tenantName).filter((u) => u.tier === tier - 1);
}
export function fmtUserLastLogin(iso) {
  if (!iso) return "Never";
  const [datePart, timePart] = iso.split(" ");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = (timePart || "00:00").split(":").map(Number);
  const date = new Date(y, m - 1, d, hh, mm);
  const h12 = ((hh + 11) % 12) + 1, ap = hh >= 12 ? "PM" : "AM";
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}, ${h12}:${String(mm).padStart(2, "0")} ${ap}`;
}
