/* ============================================================
   INDUSTRIES & TEMPLATES — the CRM configuration factory.
   Each industry defines what a tenant's CRM is pre-loaded with at
   onboarding: lead fields/sources/groups, one or more lead **pipelines**
   (multi-pipeline — e.g. Automotive has separate New Car Sales / Used Car /
   Service pipelines, not one flat stage list), and **custom entities**
   (post-lead record types like Patient, Booking, Order — each with its own
   typed fields and an optional pipeline of its own).
   Consumed by IndustriesPage (editor) and by ClientsPage's Add Tenant modal
   (industry dropdown, derived from the Active ones — see store.industries
   in StoreContext.jsx).
   ============================================================ */

export const INDUSTRY_STATUSES = ["Active", "Draft"];
export const INDUSTRY_STATUS_TONE = { Active: "success", Draft: "gray" };

// System fields exist in every industry and can never be deleted.
export const SYSTEM_FIELDS = [
  { id: "sys-name", name: "Name", required: true, isSystem: true },
  { id: "sys-phone", name: "Phone", required: true, isSystem: true },
  { id: "sys-email", name: "Email", required: false, isSystem: true },
];

// Preset color palette for lead groups and pipeline stages (swatch picker, not a full color wheel).
export const COLOR_PRESETS = ["#DC2626", "#F59E0B", "#10B981", "#295FB2", "#8B5CF6", "#6B7280", "#059669", "#EC4899"];

// Icon options for the industry icon picker — resolved to lucide-react components in
// IndustriesPage.jsx's own per-file ICON_MAP, not imported here.
export const INDUSTRY_ICONS = ["Car", "Stethoscope", "GraduationCap", "ShoppingCart", "Building2", "LayoutTemplate", "Briefcase", "Plane", "Utensils", "Dumbbell", "Hotel", "Wrench"];

// Entity fields are typed (unlike lead fields, which are just names) — this drives which
// input the real CRM would render, and whether an options editor is needed.
export const ENTITY_FIELD_TYPES = [
  { id: "Text", label: "Text", description: "Single line text" },
  { id: "LongText", label: "Long Text", description: "Multi-line textarea" },
  { id: "Number", label: "Number", description: "Numeric value" },
  { id: "Phone", label: "Phone", description: "Phone number with validation" },
  { id: "Email", label: "Email", description: "Email address with validation" },
  { id: "Date", label: "Date", description: "Date picker" },
  { id: "DateTime", label: "Date & Time", description: "Date and time picker" },
  { id: "Dropdown", label: "Dropdown", description: "Single select from options" },
  { id: "MultiSelect", label: "Multi-Select", description: "Multiple selections from options" },
  { id: "Checkbox", label: "Checkbox", description: "Yes/No toggle" },
  { id: "Currency", label: "Currency (₹)", description: "Currency amount" },
  { id: "URL", label: "URL", description: "Web link" },
  { id: "File", label: "File Attachment", description: "File upload" },
];
// Field types that need an `options: string[]` array alongside them.
export const OPTIONS_FIELD_TYPES = ["Dropdown", "MultiSelect"];

// Icon options for the entity icon picker — broader than INDUSTRY_ICONS since entities are
// record types (people, documents, transactions), not verticals.
export const ENTITY_ICONS = [
  "User", "Users", "Box", "Package", "Receipt", "FileText", "Calendar",
  "Car", "Stethoscope", "GraduationCap", "ShoppingCart", "Building2",
  "ClipboardList", "Briefcase", "Heart", "Star", "Flag", "Target",
  "Truck", "CreditCard", "Map", "Home",
];

export const BLANK_ENTITY = {
  name: "", description: "", icon: "Box",
  fields: [
    { id: "ef-sys-1", name: "Name", type: "Text", required: true },
    { id: "ef-sys-2", name: "Phone", type: "Phone", required: false },
  ],
  pipeline: { enabled: false, stages: [] },
};

export const BLANK_INDUSTRY = {
  name: "", icon: "LayoutTemplate", description: "", status: "Draft", isDefault: false,
  leadFields: [...SYSTEM_FIELDS],
  leadSources: [{ id: "ns1", name: "Website", active: true }, { id: "ns2", name: "WhatsApp", active: true }],
  leadGroups: [
    { id: "ng1", name: "Hot", color: "#DC2626", description: "" },
    { id: "ng2", name: "Warm", color: "#F59E0B", description: "" },
    { id: "ng3", name: "Cold", color: "#6B7280", description: "" },
  ],
  pipelines: [
    {
      id: "npl-1", name: "Default", isDefault: true,
      stages: [
        { id: "nst1", name: "Enquiry", order: 1, color: "#6B7280", slaHours: 2 },
        { id: "nst2", name: "Contacted", order: 2, color: "#295FB2", slaHours: 24 },
        { id: "nst3", name: "Won", order: 3, color: "#10B981", slaHours: null },
        { id: "nst4", name: "Lost", order: 4, color: "#DC2626", slaHours: null },
      ],
    },
  ],
  entities: [],
};

/* ============================================================
   SEED INDUSTRIES (6)
   `name` intentionally matches the short industry vocabulary already used
   by SEED_CLIENTS (data/seed.js: "Automotive", "Clinic", "Ecommerce",
   "Education", "Other") rather than a longer display-style name, so tenant
   counts computed against store.clients are real, and the industry
   dropdown this page feeds into ClientsPage's Add Tenant modal doesn't
   fork into a second, incompatible vocabulary for newly-created tenants.
   The richer descriptive language lives in `description` instead.
   ============================================================ */
export const SEED_INDUSTRIES = [
  {
    id: "ind-automotive",
    name: "Automotive",
    icon: "Car",
    description: "Multi-brand showroom workflow — CarWale/CarDekho leads, test drives, deliveries",
    status: "Active",
    isDefault: false,
    lastModified: "10 Mar 2026",
    modifiedBy: "Saif Khan",
    leadFields: [
      { id: "af1", name: "Name", required: true, isSystem: true },
      { id: "af2", name: "Phone", required: true, isSystem: true },
      { id: "af3", name: "Email", required: false, isSystem: true },
      { id: "af4", name: "Vehicle Model", required: false, isSystem: false },
      { id: "af5", name: "Brand Preference", required: false, isSystem: false },
      { id: "af6", name: "Budget Range", required: false, isSystem: false },
      { id: "af7", name: "Exchange Vehicle", required: false, isSystem: false },
      { id: "af8", name: "Finance Required", required: false, isSystem: false },
      { id: "af9", name: "Test Drive Requested", required: false, isSystem: false },
      { id: "af10", name: "Keyword", required: false, isSystem: false },
      { id: "af11", name: "Ad Campaign Name", required: false, isSystem: false },
      { id: "af12", name: "Ad Set Name", required: false, isSystem: false },
    ],
    leadSources: [
      { id: "as1", name: "CarWale", active: true },
      { id: "as2", name: "CarDekho", active: true },
      { id: "as3", name: "Walk-in", active: true },
      { id: "as4", name: "OEM Website", active: true },
      { id: "as5", name: "Facebook Ads", active: true },
      { id: "as6", name: "Google Ads", active: true },
      { id: "as7", name: "WhatsApp", active: true },
      { id: "as8", name: "Referral", active: false },
    ],
    leadGroups: [
      { id: "ag1", name: "Hot", color: "#DC2626", description: "Ready to buy within 7 days" },
      { id: "ag2", name: "Warm", color: "#F59E0B", description: "Interested, needs nurturing" },
      { id: "ag3", name: "Cold", color: "#6B7280", description: "Long-term prospect" },
      { id: "ag4", name: "Test Drive Interested", color: "#8B5CF6", description: "Wants a test drive" },
      { id: "ag5", name: "Finance Required", color: "#295FB2", description: "Needs financing assistance" },
    ],
    pipelines: [
      {
        id: "apl-1", name: "New Car Sales", isDefault: true,
        stages: [
          { id: "ast1", name: "Enquiry", order: 1, color: "#6B7280", slaHours: 2 },
          { id: "ast2", name: "Contacted", order: 2, color: "#295FB2", slaHours: 24 },
          { id: "ast3", name: "Test Drive", order: 3, color: "#8B5CF6", slaHours: 72 },
          { id: "ast4", name: "Negotiation", order: 4, color: "#F59E0B", slaHours: null },
          { id: "ast5", name: "Booking", order: 5, color: "#10B981", slaHours: null },
          { id: "ast6", name: "Delivery", order: 6, color: "#059669", slaHours: null },
          { id: "ast7", name: "Lost", order: 7, color: "#DC2626", slaHours: null },
        ],
      },
      {
        id: "apl-2", name: "Used Car / Exchange", isDefault: false,
        stages: [
          { id: "aust1", name: "Enquiry", order: 1, color: "#6B7280", slaHours: 2 },
          { id: "aust2", name: "Vehicle Inspection", order: 2, color: "#295FB2", slaHours: 48 },
          { id: "aust3", name: "Valuation", order: 3, color: "#8B5CF6", slaHours: 24 },
          { id: "aust4", name: "Offer Made", order: 4, color: "#F59E0B", slaHours: null },
          { id: "aust5", name: "Deal Closed", order: 5, color: "#10B981", slaHours: null },
          { id: "aust6", name: "Lost", order: 6, color: "#DC2626", slaHours: null },
        ],
      },
      {
        id: "apl-3", name: "Service & After-Sales", isDefault: false,
        stages: [
          { id: "asst1", name: "Service Request", order: 1, color: "#6B7280", slaHours: 4 },
          { id: "asst2", name: "Scheduled", order: 2, color: "#295FB2", slaHours: 24 },
          { id: "asst3", name: "Vehicle In", order: 3, color: "#8B5CF6", slaHours: null },
          { id: "asst4", name: "In Progress", order: 4, color: "#F59E0B", slaHours: null },
          { id: "asst5", name: "Ready for Pickup", order: 5, color: "#10B981", slaHours: null },
          { id: "asst6", name: "Delivered", order: 6, color: "#059669", slaHours: null },
        ],
      },
    ],
    entities: [
      {
        id: "ent-testdrive", name: "Test Drive", description: "Scheduled and completed test drives",
        icon: "Car",
        fields: [
          { id: "td1", name: "Customer Name", type: "Text", required: true },
          { id: "td2", name: "Phone", type: "Phone", required: true },
          { id: "td3", name: "Vehicle Model", type: "Text", required: true },
          { id: "td4", name: "Preferred Date", type: "DateTime", required: true },
          { id: "td5", name: "Branch", type: "Dropdown", required: true, options: ["Delhi", "Hyderabad", "Prayagraj", "Moti Nagar"] },
          { id: "td6", name: "Sales Executive", type: "Text", required: false },
          { id: "td7", name: "Feedback", type: "LongText", required: false },
          { id: "td8", name: "Outcome", type: "Dropdown", required: false, options: ["Interested", "Not Interested", "Needs Follow-up", "Booked"] },
        ],
        pipeline: {
          enabled: true,
          stages: [
            { id: "tds1", name: "Requested", order: 1, color: "#6B7280" },
            { id: "tds2", name: "Confirmed", order: 2, color: "#295FB2" },
            { id: "tds3", name: "Completed", order: 3, color: "#10B981" },
            { id: "tds4", name: "No Show", order: 4, color: "#DC2626" },
          ],
        },
      },
      {
        id: "ent-booking", name: "Booking", description: "Vehicle bookings and delivery tracking",
        icon: "Receipt",
        fields: [
          { id: "bk1", name: "Customer Name", type: "Text", required: true },
          { id: "bk2", name: "Vehicle Model", type: "Text", required: true },
          { id: "bk3", name: "Variant", type: "Text", required: false },
          { id: "bk4", name: "Color", type: "Text", required: false },
          { id: "bk5", name: "Booking Amount", type: "Currency", required: true },
          { id: "bk6", name: "Finance Required", type: "Checkbox", required: false },
          { id: "bk7", name: "Expected Delivery", type: "Date", required: false },
          { id: "bk8", name: "Exchange Vehicle", type: "Text", required: false },
        ],
        pipeline: {
          enabled: true,
          stages: [
            { id: "bks1", name: "Booking Received", order: 1, color: "#295FB2" },
            { id: "bks2", name: "Allotted", order: 2, color: "#8B5CF6" },
            { id: "bks3", name: "In Transit", order: 3, color: "#F59E0B" },
            { id: "bks4", name: "PDI Done", order: 4, color: "#10B981" },
            { id: "bks5", name: "Delivered", order: 5, color: "#059669" },
            { id: "bks6", name: "Cancelled", order: 6, color: "#DC2626" },
          ],
        },
      },
    ],
  },
  {
    id: "ind-clinic",
    name: "Clinic",
    icon: "Stethoscope",
    description: "Patient lead management with EMR bridge, appointment scheduling, and treatment tracking",
    status: "Active",
    isDefault: false,
    lastModified: "15 Mar 2026",
    modifiedBy: "Luv",
    leadFields: [
      { id: "cf1", name: "Name", required: true, isSystem: true },
      { id: "cf2", name: "Phone", required: true, isSystem: true },
      { id: "cf3", name: "Email", required: false, isSystem: true },
      { id: "cf4", name: "Treatment Type", required: false, isSystem: false },
      { id: "cf5", name: "Doctor Preference", required: false, isSystem: false },
      { id: "cf6", name: "Existing Patient", required: false, isSystem: false },
      { id: "cf7", name: "Insurance", required: false, isSystem: false },
      { id: "cf8", name: "Medical History Flag", required: false, isSystem: false },
      { id: "cf9", name: "Referral Source", required: false, isSystem: false },
    ],
    leadSources: [
      { id: "cs1", name: "Website", active: true },
      { id: "cs2", name: "WhatsApp", active: true },
      { id: "cs3", name: "Walk-in", active: true },
      { id: "cs4", name: "Google Ads", active: true },
      { id: "cs5", name: "Practo", active: true },
      { id: "cs6", name: "Referral", active: true },
    ],
    leadGroups: [
      { id: "cg1", name: "New Patient", color: "#295FB2", description: "First-time enquiry" },
      { id: "cg2", name: "Returning Patient", color: "#10B981", description: "Has visited before" },
      { id: "cg3", name: "High Value", color: "#8B5CF6", description: "Premium treatment interest" },
      { id: "cg4", name: "Insurance Patient", color: "#F59E0B", description: "Using insurance coverage" },
    ],
    pipelines: [
      {
        id: "cpl-1", name: "New Patient", isDefault: true,
        stages: [
          { id: "cst1", name: "Enquiry", order: 1, color: "#6B7280", slaHours: 1 },
          { id: "cst2", name: "Consultation Booked", order: 2, color: "#295FB2", slaHours: 24 },
          { id: "cst3", name: "Consultation Done", order: 3, color: "#8B5CF6", slaHours: 48 },
          { id: "cst4", name: "Treatment", order: 4, color: "#F59E0B", slaHours: null },
          { id: "cst5", name: "Follow-up", order: 5, color: "#10B981", slaHours: 168 },
          { id: "cst6", name: "Closed", order: 6, color: "#059669", slaHours: null },
        ],
      },
      {
        id: "cpl-2", name: "Surgery / Procedure", isDefault: false,
        stages: [
          { id: "csp1", name: "Consultation", order: 1, color: "#6B7280", slaHours: 24 },
          { id: "csp2", name: "Pre-op Assessment", order: 2, color: "#295FB2", slaHours: 48 },
          { id: "csp3", name: "Surgery Scheduled", order: 3, color: "#8B5CF6", slaHours: null },
          { id: "csp4", name: "Surgery Done", order: 4, color: "#F59E0B", slaHours: null },
          { id: "csp5", name: "Recovery", order: 5, color: "#10B981", slaHours: null },
          { id: "csp6", name: "Post-op Follow-up", order: 6, color: "#059669", slaHours: 168 },
        ],
      },
      {
        id: "cpl-3", name: "Insurance Claims", isDefault: false,
        stages: [
          { id: "cic1", name: "Claim Filed", order: 1, color: "#6B7280", slaHours: 24 },
          { id: "cic2", name: "Documents Collected", order: 2, color: "#295FB2", slaHours: 48 },
          { id: "cic3", name: "Sent to Insurer", order: 3, color: "#8B5CF6", slaHours: null },
          { id: "cic4", name: "Under Review", order: 4, color: "#F59E0B", slaHours: null },
          { id: "cic5", name: "Approved", order: 5, color: "#10B981", slaHours: null },
          { id: "cic6", name: "Settled", order: 6, color: "#059669", slaHours: null },
          { id: "cic7", name: "Rejected", order: 7, color: "#DC2626", slaHours: null },
        ],
      },
    ],
    entities: [
      {
        id: "ent-patient", name: "Patient", description: "Converted leads who have completed consultation",
        icon: "User",
        fields: [
          { id: "pf1", name: "Patient Name", type: "Text", required: true },
          { id: "pf2", name: "Phone", type: "Phone", required: true },
          { id: "pf3", name: "Email", type: "Email", required: false },
          { id: "pf4", name: "Date of Birth", type: "Date", required: false },
          { id: "pf5", name: "Gender", type: "Dropdown", required: false, options: ["Male", "Female", "Other"] },
          { id: "pf6", name: "Blood Group", type: "Dropdown", required: false, options: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] },
          { id: "pf7", name: "Primary Doctor", type: "Text", required: false },
          { id: "pf8", name: "Insurance Provider", type: "Text", required: false },
          { id: "pf9", name: "Notes", type: "LongText", required: false },
        ],
        pipeline: {
          enabled: true,
          stages: [
            { id: "ps1", name: "Active", order: 1, color: "#10B981" },
            { id: "ps2", name: "Follow-up Due", order: 2, color: "#F59E0B" },
            { id: "ps3", name: "Inactive", order: 3, color: "#6B7280" },
          ],
        },
      },
      {
        id: "ent-appointment", name: "Appointment", description: "Scheduled and completed patient appointments",
        icon: "Calendar",
        fields: [
          { id: "ap1", name: "Patient Name", type: "Text", required: true },
          { id: "ap2", name: "Phone", type: "Phone", required: true },
          { id: "ap3", name: "Doctor", type: "Text", required: true },
          { id: "ap4", name: "Date & Time", type: "DateTime", required: true },
          { id: "ap5", name: "Type", type: "Dropdown", required: true, options: ["First Visit", "Follow-up", "Emergency"] },
          { id: "ap6", name: "Status", type: "Dropdown", required: false, options: ["Scheduled", "Confirmed", "Completed", "Cancelled", "No Show"] },
          { id: "ap7", name: "Notes", type: "LongText", required: false },
        ],
        pipeline: {
          enabled: true,
          stages: [
            { id: "aps1", name: "Scheduled", order: 1, color: "#6B7280" },
            { id: "aps2", name: "Confirmed", order: 2, color: "#295FB2" },
            { id: "aps3", name: "In Progress", order: 3, color: "#8B5CF6" },
            { id: "aps4", name: "Completed", order: 4, color: "#10B981" },
            { id: "aps5", name: "Cancelled", order: 5, color: "#DC2626" },
            { id: "aps6", name: "No Show", order: 6, color: "#F59E0B" },
          ],
        },
      },
      {
        id: "ent-treatment", name: "Treatment", description: "Treatment plans and procedures per patient",
        icon: "Heart",
        fields: [
          { id: "tr1", name: "Patient Name", type: "Text", required: true },
          { id: "tr2", name: "Treatment Type", type: "Text", required: true },
          { id: "tr3", name: "Doctor", type: "Text", required: true },
          { id: "tr4", name: "Date", type: "Date", required: false },
          { id: "tr5", name: "Cost", type: "Currency", required: false },
          { id: "tr6", name: "Insurance Claim", type: "Checkbox", required: false },
          { id: "tr7", name: "Status", type: "Dropdown", required: false, options: ["Planned", "In Progress", "Completed", "Follow-up Required"] },
          { id: "tr8", name: "Notes", type: "LongText", required: false },
        ],
        pipeline: {
          enabled: true,
          stages: [
            { id: "trs1", name: "Planned", order: 1, color: "#6B7280" },
            { id: "trs2", name: "In Progress", order: 2, color: "#295FB2" },
            { id: "trs3", name: "Completed", order: 3, color: "#10B981" },
            { id: "trs4", name: "Follow-up Required", order: 4, color: "#F59E0B" },
          ],
        },
      },
    ],
  },
  {
    id: "ind-education",
    name: "Education",
    icon: "GraduationCap",
    description: "Admissions funnel — enquiry to enrolment with counselling and application tracking",
    status: "Active",
    isDefault: false,
    lastModified: "01 Apr 2026",
    modifiedBy: "Vishal",
    leadFields: [
      { id: "eduf1", name: "Name", required: true, isSystem: true },
      { id: "eduf2", name: "Phone", required: true, isSystem: true },
      { id: "eduf3", name: "Email", required: false, isSystem: true },
      { id: "eduf4", name: "Course Interested", required: false, isSystem: false },
      { id: "eduf5", name: "Current Qualification", required: false, isSystem: false },
      { id: "eduf6", name: "Year of Passing", required: false, isSystem: false },
      { id: "eduf7", name: "City", required: false, isSystem: false },
      { id: "eduf8", name: "Budget", required: false, isSystem: false },
      { id: "eduf9", name: "Mode (Online/Offline)", required: false, isSystem: false },
    ],
    leadSources: [
      { id: "edus1", name: "Website", active: true },
      { id: "edus2", name: "IndiaMART", active: true },
      { id: "edus3", name: "Facebook Ads", active: true },
      { id: "edus4", name: "Google Ads", active: true },
      { id: "edus5", name: "Referral", active: true },
      { id: "edus6", name: "Walk-in", active: true },
      { id: "edus7", name: "Education Fairs", active: false },
    ],
    leadGroups: [
      { id: "edug1", name: "Hot", color: "#DC2626", description: "Ready to enrol this term" },
      { id: "edug2", name: "Warm", color: "#F59E0B", description: "Comparing programs" },
      { id: "edug3", name: "Cold", color: "#6B7280", description: "Long-term prospect" },
      { id: "edug4", name: "Scholarship Applicant", color: "#8B5CF6", description: "Applying for financial aid" },
    ],
    pipelines: [
      {
        id: "edpl-1", name: "Admissions", isDefault: true,
        stages: [
          { id: "edust1", name: "Enquiry", order: 1, color: "#6B7280", slaHours: 2 },
          { id: "edust2", name: "Counselling", order: 2, color: "#295FB2", slaHours: 24 },
          { id: "edust3", name: "Application", order: 3, color: "#8B5CF6", slaHours: 72 },
          { id: "edust4", name: "Admission", order: 4, color: "#F59E0B", slaHours: null },
          { id: "edust5", name: "Enrolled", order: 5, color: "#10B981", slaHours: null },
          { id: "edust6", name: "Dropped", order: 6, color: "#DC2626", slaHours: null },
        ],
      },
      {
        id: "edpl-2", name: "Scholarship", isDefault: false,
        stages: [
          { id: "edsc1", name: "Applied", order: 1, color: "#6B7280", slaHours: 24 },
          { id: "edsc2", name: "Shortlisted", order: 2, color: "#295FB2", slaHours: 48 },
          { id: "edsc3", name: "Interview", order: 3, color: "#8B5CF6", slaHours: null },
          { id: "edsc4", name: "Awarded", order: 4, color: "#10B981", slaHours: null },
          { id: "edsc5", name: "Rejected", order: 5, color: "#DC2626", slaHours: null },
        ],
      },
      {
        id: "edpl-3", name: "Placement", isDefault: false,
        stages: [
          { id: "edpl1", name: "Registered", order: 1, color: "#6B7280", slaHours: 24 },
          { id: "edpl2", name: "Profile Shared", order: 2, color: "#295FB2", slaHours: 48 },
          { id: "edpl3", name: "Interview", order: 3, color: "#8B5CF6", slaHours: null },
          { id: "edpl4", name: "Placed", order: 4, color: "#10B981", slaHours: null },
          { id: "edpl5", name: "Inactive", order: 5, color: "#6B7280", slaHours: null },
        ],
      },
    ],
    entities: [
      {
        id: "ent-student", name: "Student", description: "Enrolled students converted from admissions leads",
        icon: "GraduationCap",
        fields: [
          { id: "stu1", name: "Student Name", type: "Text", required: true },
          { id: "stu2", name: "Phone", type: "Phone", required: true },
          { id: "stu3", name: "Email", type: "Email", required: false },
          { id: "stu4", name: "Course", type: "Text", required: true },
          { id: "stu5", name: "Year", type: "Dropdown", required: false, options: ["1st Year", "2nd Year", "3rd Year", "4th Year"] },
          { id: "stu6", name: "Enrollment Date", type: "Date", required: false },
          { id: "stu7", name: "Fee Status", type: "Dropdown", required: false, options: ["Paid", "Partial", "Pending", "Overdue"] },
          { id: "stu8", name: "Guardian Name", type: "Text", required: false },
          { id: "stu9", name: "Guardian Phone", type: "Phone", required: false },
        ],
        pipeline: {
          enabled: true,
          stages: [
            { id: "stus1", name: "Active", order: 1, color: "#10B981" },
            { id: "stus2", name: "On Leave", order: 2, color: "#F59E0B" },
            { id: "stus3", name: "Alumni", order: 3, color: "#295FB2" },
            { id: "stus4", name: "Dropped", order: 4, color: "#DC2626" },
          ],
        },
      },
      {
        id: "ent-application", name: "Application", description: "Admission applications in progress",
        icon: "FileText",
        fields: [
          { id: "eap1", name: "Applicant Name", type: "Text", required: true },
          { id: "eap2", name: "Course Applied", type: "Text", required: true },
          { id: "eap3", name: "Qualification", type: "Text", required: false },
          { id: "eap4", name: "Score", type: "Number", required: false },
          { id: "eap5", name: "Documents", type: "File", required: false },
          { id: "eap6", name: "Status", type: "Dropdown", required: false, options: ["Received", "Under Review", "Shortlisted", "Accepted", "Rejected"] },
          { id: "eap7", name: "Counsellor", type: "Text", required: false },
        ],
        pipeline: {
          enabled: true,
          stages: [
            { id: "eaps1", name: "Received", order: 1, color: "#6B7280" },
            { id: "eaps2", name: "Under Review", order: 2, color: "#295FB2" },
            { id: "eaps3", name: "Shortlisted", order: 3, color: "#8B5CF6" },
            { id: "eaps4", name: "Accepted", order: 4, color: "#10B981" },
            { id: "eaps5", name: "Rejected", order: 5, color: "#DC2626" },
          ],
        },
      },
    ],
  },
  {
    id: "ind-ecommerce",
    name: "Ecommerce",
    icon: "ShoppingCart",
    description: "Product enquiries, cart recovery, and order tracking",
    status: "Active",
    isDefault: false,
    lastModified: "20 Mar 2026",
    modifiedBy: "Saif Khan",
    leadFields: [
      { id: "ecf1", name: "Name", required: true, isSystem: true },
      { id: "ecf2", name: "Phone", required: true, isSystem: true },
      { id: "ecf3", name: "Email", required: false, isSystem: true },
      { id: "ecf4", name: "Product Interested", required: false, isSystem: false },
      { id: "ecf5", name: "Order Value", required: false, isSystem: false },
      { id: "ecf6", name: "Payment Mode", required: false, isSystem: false },
      { id: "ecf7", name: "City", required: false, isSystem: false },
      { id: "ecf8", name: "Keyword", required: false, isSystem: false },
      { id: "ecf9", name: "Ad Page Name", required: false, isSystem: false },
      { id: "ecf10", name: "Ad Campaign Name", required: false, isSystem: false },
      { id: "ecf11", name: "Ad Set Name", required: false, isSystem: false },
      { id: "ecf12", name: "Ad Name", required: false, isSystem: false },
      { id: "ecf13", name: "Message", required: false, isSystem: false },
    ],
    leadSources: [
      { id: "ecs1", name: "Website", active: true },
      { id: "ecs2", name: "Facebook Ads", active: true },
      { id: "ecs3", name: "Google Ads", active: true },
      { id: "ecs4", name: "Instagram", active: true },
      { id: "ecs5", name: "WhatsApp", active: true },
    ],
    leadGroups: [
      { id: "ecg1", name: "High Value", color: "#8B5CF6", description: "Large basket size" },
      { id: "ecg2", name: "Cart Abandoner", color: "#F59E0B", description: "Started checkout, didn't finish" },
      { id: "ecg3", name: "Repeat Customer", color: "#10B981", description: "Has ordered before" },
      { id: "ecg4", name: "Discount Seeker", color: "#EC4899", description: "Only engages with offers" },
    ],
    pipelines: [
      {
        id: "ecpl-1", name: "Sales", isDefault: true,
        stages: [
          { id: "ecst1", name: "Enquiry", order: 1, color: "#6B7280", slaHours: 1 },
          { id: "ecst2", name: "Quote Sent", order: 2, color: "#295FB2", slaHours: 24 },
          { id: "ecst3", name: "Negotiation", order: 3, color: "#8B5CF6", slaHours: 48 },
          { id: "ecst4", name: "Order Placed", order: 4, color: "#F59E0B", slaHours: null },
          { id: "ecst5", name: "Delivered", order: 5, color: "#10B981", slaHours: null },
          { id: "ecst6", name: "Returned", order: 6, color: "#DC2626", slaHours: null },
        ],
      },
      {
        id: "ecpl-2", name: "Cart Recovery", isDefault: false,
        stages: [
          { id: "eccr1", name: "Abandoned", order: 1, color: "#6B7280", slaHours: null },
          { id: "eccr2", name: "Reminder Sent", order: 2, color: "#295FB2", slaHours: 4 },
          { id: "eccr3", name: "Re-engaged", order: 3, color: "#8B5CF6", slaHours: null },
          { id: "eccr4", name: "Converted", order: 4, color: "#10B981", slaHours: null },
          { id: "eccr5", name: "Lost", order: 5, color: "#DC2626", slaHours: null },
        ],
      },
    ],
    entities: [
      {
        id: "ent-order", name: "Order", description: "Placed orders and fulfillment tracking",
        icon: "Package",
        fields: [
          { id: "ord1", name: "Customer Name", type: "Text", required: true },
          { id: "ord2", name: "Phone", type: "Phone", required: true },
          { id: "ord3", name: "Order ID", type: "Text", required: true },
          { id: "ord4", name: "Product", type: "Text", required: true },
          { id: "ord5", name: "Quantity", type: "Number", required: false },
          { id: "ord6", name: "Amount", type: "Currency", required: true },
          { id: "ord7", name: "Payment Mode", type: "Dropdown", required: false, options: ["COD", "Card", "UPI", "Net Banking", "Wallet"] },
          { id: "ord8", name: "Tracking ID", type: "Text", required: false },
          { id: "ord9", name: "Delivery Address", type: "LongText", required: false },
        ],
        pipeline: {
          enabled: true,
          stages: [
            { id: "ords1", name: "Placed", order: 1, color: "#6B7280" },
            { id: "ords2", name: "Confirmed", order: 2, color: "#295FB2" },
            { id: "ords3", name: "Shipped", order: 3, color: "#8B5CF6" },
            { id: "ords4", name: "Out for Delivery", order: 4, color: "#F59E0B" },
            { id: "ords5", name: "Delivered", order: 5, color: "#10B981" },
            { id: "ords6", name: "Returned", order: 6, color: "#DC2626" },
          ],
        },
      },
      {
        id: "ent-customer", name: "Customer", description: "Repeat customer records — no workflow stages, just a record store",
        icon: "Users",
        fields: [
          { id: "cus1", name: "Name", type: "Text", required: true },
          { id: "cus2", name: "Phone", type: "Phone", required: true },
          { id: "cus3", name: "Email", type: "Email", required: false },
          { id: "cus4", name: "City", type: "Text", required: false },
          { id: "cus5", name: "Total Orders", type: "Number", required: false },
          { id: "cus6", name: "Lifetime Value", type: "Currency", required: false },
          { id: "cus7", name: "Last Order Date", type: "Date", required: false },
          { id: "cus8", name: "VIP", type: "Checkbox", required: false },
        ],
        pipeline: { enabled: false, stages: [] },
      },
    ],
  },
  {
    id: "ind-realestate",
    name: "Real Estate",
    icon: "Building2",
    description: "Property enquiries, site visits, and booking pipeline",
    status: "Active",
    isDefault: false,
    lastModified: "05 Apr 2026",
    modifiedBy: "Luv",
    leadFields: [
      { id: "ref1", name: "Name", required: true, isSystem: true },
      { id: "ref2", name: "Phone", required: true, isSystem: true },
      { id: "ref3", name: "Email", required: false, isSystem: true },
      { id: "ref4", name: "Property Type", required: false, isSystem: false },
      { id: "ref5", name: "BHK Requirement", required: false, isSystem: false },
      { id: "ref6", name: "Budget", required: false, isSystem: false },
      { id: "ref7", name: "Locality Preference", required: false, isSystem: false },
      { id: "ref8", name: "Ready to Move", required: false, isSystem: false },
      { id: "ref9", name: "Loan Required", required: false, isSystem: false },
    ],
    leadSources: [
      { id: "res1", name: "99acres", active: true },
      { id: "res2", name: "MagicBricks", active: true },
      { id: "res3", name: "Housing.com", active: true },
      { id: "res4", name: "Facebook Ads", active: true },
      { id: "res5", name: "Referral", active: true },
      { id: "res6", name: "Walk-in", active: false },
    ],
    leadGroups: [
      { id: "reg1", name: "Investor", color: "#295FB2", description: "Buying for returns, not to live in" },
      { id: "reg2", name: "End User", color: "#10B981", description: "Buying to move in" },
      { id: "reg3", name: "NRI", color: "#8B5CF6", description: "Non-resident buyer" },
      { id: "reg4", name: "High Budget", color: "#DC2626", description: "Premium/luxury segment" },
    ],
    pipelines: [
      {
        id: "repl-1", name: "Residential Sales", isDefault: true,
        stages: [
          { id: "rest1", name: "Enquiry", order: 1, color: "#6B7280", slaHours: 2 },
          { id: "rest2", name: "Site Visit", order: 2, color: "#295FB2", slaHours: 48 },
          { id: "rest3", name: "Negotiation", order: 3, color: "#8B5CF6", slaHours: 120 },
          { id: "rest4", name: "Booking", order: 4, color: "#F59E0B", slaHours: null },
          { id: "rest5", name: "Registration", order: 5, color: "#10B981", slaHours: null },
          { id: "rest6", name: "Possession", order: 6, color: "#059669", slaHours: null },
        ],
      },
      {
        id: "repl-2", name: "Rental / Lease", isDefault: false,
        stages: [
          { id: "rerl1", name: "Enquiry", order: 1, color: "#6B7280", slaHours: 2 },
          { id: "rerl2", name: "Property Viewing", order: 2, color: "#295FB2", slaHours: 48 },
          { id: "rerl3", name: "Negotiation", order: 3, color: "#8B5CF6", slaHours: null },
          { id: "rerl4", name: "Agreement", order: 4, color: "#F59E0B", slaHours: null },
          { id: "rerl5", name: "Move-in", order: 5, color: "#10B981", slaHours: null },
        ],
      },
      {
        id: "repl-3", name: "Commercial", isDefault: false,
        stages: [
          { id: "reco1", name: "Enquiry", order: 1, color: "#6B7280", slaHours: 2 },
          { id: "reco2", name: "Site Visit", order: 2, color: "#295FB2", slaHours: 48 },
          { id: "reco3", name: "Proposal", order: 3, color: "#8B5CF6", slaHours: null },
          { id: "reco4", name: "Negotiation", order: 4, color: "#F59E0B", slaHours: null },
          { id: "reco5", name: "Closed", order: 5, color: "#10B981", slaHours: null },
        ],
      },
    ],
    entities: [
      {
        id: "ent-sitevisit", name: "Site Visit", description: "Scheduled and completed property site visits",
        icon: "Map",
        fields: [
          { id: "sv1", name: "Visitor Name", type: "Text", required: true },
          { id: "sv2", name: "Phone", type: "Phone", required: true },
          { id: "sv3", name: "Property", type: "Text", required: true },
          { id: "sv4", name: "Visit Date & Time", type: "DateTime", required: true },
          { id: "sv5", name: "Agent", type: "Text", required: false },
          { id: "sv6", name: "Feedback", type: "LongText", required: false },
          { id: "sv7", name: "Interested", type: "Checkbox", required: false },
        ],
        pipeline: {
          enabled: true,
          stages: [
            { id: "svs1", name: "Scheduled", order: 1, color: "#6B7280" },
            { id: "svs2", name: "Completed", order: 2, color: "#295FB2" },
            { id: "svs3", name: "Interested", order: 3, color: "#10B981" },
            { id: "svs4", name: "Not Interested", order: 4, color: "#DC2626" },
          ],
        },
      },
      {
        id: "ent-re-booking", name: "Booking", description: "Property bookings through to possession",
        icon: "Receipt",
        fields: [
          { id: "reb1", name: "Buyer Name", type: "Text", required: true },
          { id: "reb2", name: "Phone", type: "Phone", required: true },
          { id: "reb3", name: "Property", type: "Text", required: true },
          { id: "reb4", name: "Unit", type: "Text", required: false },
          { id: "reb5", name: "Booking Amount", type: "Currency", required: true },
          { id: "reb6", name: "Payment Plan", type: "Dropdown", required: false, options: ["Full Payment", "Construction Linked", "Down Payment"] },
          { id: "reb7", name: "Loan Required", type: "Checkbox", required: false },
          { id: "reb8", name: "Agreement Date", type: "Date", required: false },
        ],
        pipeline: {
          enabled: true,
          stages: [
            { id: "rebs1", name: "Token Paid", order: 1, color: "#6B7280" },
            { id: "rebs2", name: "Agreement", order: 2, color: "#295FB2" },
            { id: "rebs3", name: "Registration", order: 3, color: "#8B5CF6" },
            { id: "rebs4", name: "Possession", order: 4, color: "#10B981" },
          ],
        },
      },
    ],
  },
  {
    id: "ind-other",
    name: "Other",
    icon: "LayoutTemplate",
    description: "Blank starter workflow — minimal defaults, fully customizable",
    status: "Active",
    isDefault: true,
    lastModified: "01 Jan 2026",
    modifiedBy: "System",
    leadFields: [
      { id: "of1", name: "Name", required: true, isSystem: true },
      { id: "of2", name: "Phone", required: true, isSystem: true },
      { id: "of3", name: "Email", required: false, isSystem: true },
      { id: "of4", name: "Message", required: false, isSystem: false },
      { id: "of5", name: "Keyword", required: false, isSystem: false },
      { id: "of6", name: "Ad Page Name", required: false, isSystem: false },
      { id: "of7", name: "Ad Campaign Name", required: false, isSystem: false },
      { id: "of8", name: "Ad Set Name", required: false, isSystem: false },
      { id: "of9", name: "Ad Name", required: false, isSystem: false },
    ],
    leadSources: [
      { id: "os1", name: "Website", active: true },
      { id: "os2", name: "WhatsApp", active: true },
      { id: "os3", name: "Referral", active: true },
      { id: "os4", name: "Walk-in", active: true },
    ],
    leadGroups: [
      { id: "og1", name: "Hot", color: "#DC2626", description: "" },
      { id: "og2", name: "Warm", color: "#F59E0B", description: "" },
      { id: "og3", name: "Cold", color: "#6B7280", description: "" },
    ],
    pipelines: [
      {
        id: "opl-1", name: "Default", isDefault: true,
        stages: [
          { id: "ost1", name: "Enquiry", order: 1, color: "#6B7280", slaHours: 4 },
          { id: "ost2", name: "Contacted", order: 2, color: "#295FB2", slaHours: 24 },
          { id: "ost3", name: "Qualified", order: 3, color: "#8B5CF6", slaHours: 72 },
          { id: "ost4", name: "Won", order: 4, color: "#10B981", slaHours: null },
          { id: "ost5", name: "Lost", order: 5, color: "#DC2626", slaHours: null },
        ],
      },
    ],
    entities: [],
  },
];

/* ============================================================
   HELPERS
   ============================================================ */
export function countTenantsForIndustry(industry, clients) {
  return clients.filter((c) => c.industry === industry.name).length;
}
export function mostPopularIndustry(industries, clients) {
  if (!industries.length) return null;
  return [...industries].sort((a, b) => countTenantsForIndustry(b, clients) - countTenantsForIndustry(a, clients))[0];
}
export function avgFieldsPerIndustry(industries) {
  if (!industries.length) return 0;
  return (industries.reduce((sum, i) => sum + i.leadFields.length, 0) / industries.length).toFixed(1);
}
// The pipeline flagged isDefault (falls back to the first pipeline if somehow none is flagged).
export function defaultPipeline(industry) {
  return industry.pipelines.find((p) => p.isDefault) || industry.pipelines[0] || null;
}
export function totalEntities(industries) {
  return industries.reduce((sum, i) => sum + (i.entities?.length || 0), 0);
}
export function avgEntitiesPerIndustry(industries) {
  if (!industries.length) return 0;
  return (totalEntities(industries) / industries.length).toFixed(1);
}
