import React, { useState, useEffect, useRef } from "react";
import {
  Plus, Pencil, Trash2, Copy, Star, ChevronUp, ChevronDown, ChevronRight, Check, ArrowLeft, X,
  Car, Stethoscope, GraduationCap, ShoppingCart, Building2, LayoutTemplate, Briefcase, Plane,
  Utensils, Dumbbell, Hotel, Wrench, User, Users, Box, Package, Receipt, FileText, Calendar,
  ClipboardList, Heart, Flag, Target, Truck, CreditCard, Map, Home,
} from "lucide-react";
import { T, cx } from "../theme.js";
import { useStore } from "../store/StoreContext.jsx";
import {
  PageHeader, Button, Kpi, Card, CardBody, Table, Td, Badge, Drawer, Modal, Tabs, Menu, Switch,
  Field, FilterPill, SearchInput, useClickOutside,
} from "../components/ui.jsx";
import {
  INDUSTRY_STATUSES, INDUSTRY_STATUS_TONE, COLOR_PRESETS, INDUSTRY_ICONS, ENTITY_ICONS,
  ENTITY_FIELD_TYPES, OPTIONS_FIELD_TYPES, BLANK_INDUSTRY, BLANK_ENTITY,
  countTenantsForIndustry, mostPopularIndustry, avgFieldsPerIndustry, avgEntitiesPerIndustry, totalEntities,
} from "../data/industries.js";

// Single icon map serving both the industry picker (INDUSTRY_ICONS) and the entity picker
// (ENTITY_ICONS) — the two lists overlap (Car, Stethoscope, etc.) so one map resolves both.
const ICON_MAP = {
  Car, Stethoscope, GraduationCap, ShoppingCart, Building2, LayoutTemplate, Briefcase, Plane, Utensils, Dumbbell, Hotel, Wrench,
  User, Users, Box, Package, Receipt, FileText, Calendar, ClipboardList, Heart, Star, Flag, Target, Truck, CreditCard, Map, Home,
};

/* ============================================================
   COLOR SWATCH PICKER — small inline preset picker, not a full color wheel.
   ============================================================ */
function ColorSwatch({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));
  return (
    <div className="relative shrink-0" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)} title="Change color"
        className="w-6 h-6 rounded-full border-2" style={{ background: value, borderColor: T.border }} />
      {open && (
        <div className="absolute left-0 top-8 z-30 rounded-lg border bg-[var(--t-surface)] shadow-lg p-2 flex flex-wrap gap-1.5" style={{ borderColor: T.border, width: 150 }}>
          {COLOR_PRESETS.map((c) => (
            <button type="button" key={c} onClick={() => { onChange(c); setOpen(false); }}
              className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: c, boxShadow: c === value ? `0 0 0 2px ${T.surface}, 0 0 0 3.5px ${T.text}` : "none" }}>
              {c === value && <Check size={12} color="#fff" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   TAB 1 — LEAD FIELDS (2-column grid, floating-style labels, red trash)
   ============================================================ */
function LeadFieldsTab({ fields, onChange }) {
  const [justAddedId, setJustAddedId] = useState(null);
  const setField = (id, name) => onChange(fields.map((f) => (f.id === id ? { ...f, name } : f)));
  const removeField = (id) => onChange(fields.filter((f) => f.id !== id));
  const addField = () => {
    const id = "f-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    onChange([...fields, { id, name: "", required: false, isSystem: false }]);
    setJustAddedId(id);
  };
  const isEven = fields.length % 2 === 0;
  return (
    <div>
      <div className="mb-3">
        <div className="text-[14px] font-semibold" style={{ color: T.text }}>Lead Fields</div>
        <div className="text-[12px] mt-0.5" style={{ color: T.text2 }}>Define the fields that will be used to capture lead information.</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {fields.map((f) => (
          <div key={f.id} className="rounded-lg border p-2.5 flex items-end gap-2" style={{ borderColor: T.border }}>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: T.text3 }}>Field Name</div>
              <input value={f.name} onChange={(e) => setField(f.id, e.target.value)} disabled={f.isSystem} autoFocus={f.id === justAddedId}
                placeholder="e.g. Vehicle Model" className="w-full px-2 py-1.5 rounded-md border text-[13px] outline-none disabled:opacity-70"
                style={{ borderColor: T.border, background: f.isSystem ? T.subtle : T.surface, color: T.text }} />
            </div>
            <button type="button" disabled={f.isSystem} onClick={() => removeField(f.id)} title={f.isSystem ? "System field — required, can't be removed" : "Remove field"}
              className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-95" style={{ background: T.dangerSoft, color: T.danger }}>
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        <button type="button" onClick={addField}
          className={cx("rounded-lg border border-dashed flex items-center justify-center gap-1.5 py-3 text-[13px] font-medium hover:bg-[var(--t-subtle)]", isEven && "col-span-2")}
          style={{ borderColor: T.borderStrong, color: T.text2 }}>
          <Plus size={14} /> Add Field
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   TAB 2 — LEAD SOURCES
   ============================================================ */
function LeadSourcesTab({ sources, onChange }) {
  const setSource = (id, patch) => onChange(sources.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const removeSource = (id) => onChange(sources.filter((s) => s.id !== id));
  const addSource = () => onChange([...sources, { id: "s-" + Date.now().toString(36), name: "", active: true }]);
  return (
    <div>
      <div className="mb-3">
        <div className="text-[14px] font-semibold" style={{ color: T.text }}>Lead Sources</div>
        <div className="text-[12px] mt-0.5" style={{ color: T.text2 }}>Define where leads originate from for this industry.</div>
      </div>
      <div className="space-y-2">
        {sources.map((s) => (
          <div key={s.id} className="flex items-center gap-2.5 rounded-lg border p-2.5" style={{ borderColor: T.border }}>
            <input value={s.name} onChange={(e) => setSource(s.id, { name: e.target.value })} placeholder="Source name"
              className="flex-1 px-2 py-1.5 rounded-md border text-[13px] outline-none" style={{ borderColor: T.border }} />
            <Switch on={s.active} onClick={() => setSource(s.id, { active: !s.active })} />
            <button type="button" onClick={() => removeSource(s.id)} className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 hover:brightness-95" style={{ background: T.dangerSoft, color: T.danger }}>
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        <button type="button" onClick={addSource} className="w-full rounded-lg border border-dashed flex items-center justify-center gap-1.5 py-2.5 text-[13px] font-medium hover:bg-[var(--t-subtle)]" style={{ borderColor: T.borderStrong, color: T.text2 }}>
          <Plus size={14} /> Add Source
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   TAB 3 — LEAD GROUPS
   ============================================================ */
function LeadGroupsTab({ groups, onChange }) {
  const setGroup = (id, patch) => onChange(groups.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  const removeGroup = (id) => onChange(groups.filter((g) => g.id !== id));
  const addGroup = () => onChange([...groups, { id: "g-" + Date.now().toString(36), name: "", color: COLOR_PRESETS[0], description: "" }]);
  return (
    <div>
      <div className="mb-3">
        <div className="text-[14px] font-semibold" style={{ color: T.text }}>Lead Groups</div>
        <div className="text-[12px] mt-0.5" style={{ color: T.text2 }}>Define segmentation buckets for lead categorization.</div>
      </div>
      <div className="space-y-2">
        {groups.map((g) => (
          <div key={g.id} className="flex items-start gap-2.5 rounded-lg border p-2.5" style={{ borderColor: T.border }}>
            <div className="pt-1"><ColorSwatch value={g.color} onChange={(c) => setGroup(g.id, { color: c })} /></div>
            <div className="flex-1 space-y-1.5 min-w-0">
              <input value={g.name} onChange={(e) => setGroup(g.id, { name: e.target.value })} placeholder="Group name"
                className="w-full px-2 py-1.5 rounded-md border text-[13px] outline-none" style={{ borderColor: T.border }} />
              <input value={g.description} onChange={(e) => setGroup(g.id, { description: e.target.value })} placeholder="Description (optional)"
                className="w-full px-2 py-1 rounded-md border text-[12px] outline-none" style={{ borderColor: T.border, color: T.text2 }} />
            </div>
            <button type="button" onClick={() => removeGroup(g.id)} className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 hover:brightness-95 mt-0.5" style={{ background: T.dangerSoft, color: T.danger }}>
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        <button type="button" onClick={addGroup} className="w-full rounded-lg border border-dashed flex items-center justify-center gap-1.5 py-2.5 text-[13px] font-medium hover:bg-[var(--t-subtle)]" style={{ borderColor: T.borderStrong, color: T.text2 }}>
          <Plus size={14} /> Add Group
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   SHARED — a single stage row (up/down, color, name, SLA, trash), used by
   both the per-pipeline editor and the per-entity pipeline editor below.
   ============================================================ */
function StageRow({ stage, index, count, onChange, onRemove, onMove }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border p-2.5" style={{ borderColor: T.border }}>
      <div className="flex flex-col gap-0.5 shrink-0">
        <button type="button" disabled={index === 0} onClick={() => onMove(-1)} className="w-5 h-5 rounded flex items-center justify-center disabled:opacity-25 hover:bg-[var(--t-hover)]" style={{ color: T.text2 }}><ChevronUp size={13} /></button>
        <button type="button" disabled={index === count - 1} onClick={() => onMove(1)} className="w-5 h-5 rounded flex items-center justify-center disabled:opacity-25 hover:bg-[var(--t-hover)]" style={{ color: T.text2 }}><ChevronDown size={13} /></button>
      </div>
      <ColorSwatch value={stage.color} onChange={(c) => onChange({ color: c })} />
      <input value={stage.name} onChange={(e) => onChange({ name: e.target.value })} placeholder="Stage name"
        className="flex-1 min-w-0 px-2 py-1.5 rounded-md border text-[13px] outline-none" style={{ borderColor: T.border }} />
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-[11px]" style={{ color: T.text3 }}>SLA</span>
        <input type="number" min="0" value={stage.slaHours ?? ""} onChange={(e) => onChange({ slaHours: e.target.value === "" ? null : Number(e.target.value) })}
          placeholder="—" className="w-16 px-2 py-1.5 rounded-md border text-[13px] outline-none" style={{ borderColor: T.border }} />
        <span className="text-[11px]" style={{ color: T.text3 }}>hrs</span>
      </div>
      <button type="button" disabled={count <= 1} onClick={onRemove} className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-95" style={{ background: T.dangerSoft, color: T.danger }}>
        <Trash2 size={13} />
      </button>
    </div>
  );
}
function PipelinePreview({ stages, size = "normal" }) {
  const pill = size === "small" ? "px-2 py-0.5 text-[10.5px]" : "px-2.5 py-1 text-[11px]";
  const chevron = size === "small" ? 11 : 13;
  return (
    <div className="flex items-center flex-wrap gap-1.5">
      {stages.map((s, i) => (
        <React.Fragment key={s.id}>
          <span className={cx("rounded-full font-medium text-white", pill)} style={{ background: s.color || T.text3 }}>{s.name || "Untitled"}</span>
          {i < stages.length - 1 && <ChevronRight size={chevron} style={{ color: T.text3 }} />}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ============================================================
   TAB 4 — PIPELINES & STAGES (multi-pipeline: pipeline selector + the
   stage editor for whichever pipeline is selected)
   ============================================================ */
function PipelinesTab({ pipelines, onChange }) {
  const [selectedId, setSelectedId] = useState(pipelines[0]?.id);
  const selected = pipelines.find((p) => p.id === selectedId) || pipelines[0];

  const setPipeline = (id, patch) => onChange(pipelines.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const removePipeline = (id) => {
    const remaining = pipelines.filter((p) => p.id !== id);
    onChange(remaining);
    if (selectedId === id) setSelectedId(remaining[0]?.id);
  };
  const addPipeline = () => {
    const id = "pl-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    onChange([...pipelines, {
      id, name: "New Pipeline", isDefault: false,
      stages: [
        { id: id + "-s1", name: "Enquiry", order: 1, color: COLOR_PRESETS[5], slaHours: null },
        { id: id + "-s2", name: "Won", order: 2, color: COLOR_PRESETS[2], slaHours: null },
        { id: id + "-s3", name: "Lost", order: 3, color: COLOR_PRESETS[0], slaHours: null },
      ],
    }]);
    setSelectedId(id);
  };
  const setDefault = (id) => onChange(pipelines.map((p) => ({ ...p, isDefault: p.id === id })));

  if (!selected) return null;
  const stages = selected.stages;
  const setStages = (next) => setPipeline(selected.id, { stages: next });
  const setStage = (sid, patch) => setStages(stages.map((s) => (s.id === sid ? { ...s, ...patch } : s)));
  const removeStage = (sid) => setStages(stages.filter((s) => s.id !== sid).map((s, i) => ({ ...s, order: i + 1 })));
  const addStage = () => setStages([...stages, { id: "st-" + Date.now().toString(36), name: "", order: stages.length + 1, color: COLOR_PRESETS[stages.length % COLOR_PRESETS.length], slaHours: null }]);
  const moveStage = (idx, dir) => {
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= stages.length) return;
    const next = [...stages];
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    setStages(next.map((s, i) => ({ ...s, order: i + 1 })));
  };
  const canDelete = pipelines.length > 1 && !selected.isDefault;

  return (
    <div>
      <div className="mb-3">
        <div className="text-[14px] font-semibold" style={{ color: T.text }}>Pipelines & Stages</div>
        <div className="text-[12px] mt-0.5" style={{ color: T.text2 }}>Tenants can run multiple pipelines (e.g. New Sales, Service) — each has its own stages.</div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        {pipelines.map((p) => (
          <button key={p.id} type="button" onClick={() => setSelectedId(p.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-medium border"
            style={p.id === selected.id ? { background: T.primary, borderColor: T.primary, color: "#fff" } : { background: T.surface, borderColor: T.border, color: T.text }}>
            {p.isDefault && <Star size={11} fill="currentColor" />}
            {p.name || "Untitled"}
          </button>
        ))}
        <button type="button" onClick={addPipeline} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12.5px] font-medium border border-dashed hover:bg-[var(--t-subtle)]" style={{ borderColor: T.borderStrong, color: T.text2 }}>
          <Plus size={13} /> Add Pipeline
        </button>
      </div>

      <div className="rounded-lg border p-3 mb-4" style={{ borderColor: T.border, background: T.subtle }}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-[180px]">
            <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: T.text3 }}>Pipeline Name</div>
            <input value={selected.name} onChange={(e) => setPipeline(selected.id, { name: e.target.value })} className="w-full px-2 py-1.5 rounded-md border text-[13px] outline-none" style={{ borderColor: T.border, background: T.surface }} />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={() => setDefault(selected.id)} disabled={selected.isDefault}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium border disabled:cursor-default"
              style={selected.isDefault ? { background: T.primarySoft, borderColor: T.primary, color: T.accentText } : { background: T.surface, borderColor: T.border, color: T.text }}>
              <Star size={12} fill={selected.isDefault ? "currentColor" : "none"} /> {selected.isDefault ? "Default" : "Set as Default"}
            </button>
            <button type="button" disabled={!canDelete} onClick={() => removePipeline(selected.id)} title={!canDelete ? "Can't delete the only pipeline, or the default one" : "Delete pipeline"}
              className="w-8 h-8 rounded-md flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-95" style={{ background: T.dangerSoft, color: T.danger }}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {stages.map((s, i) => (
          <StageRow key={s.id} stage={s} index={i} count={stages.length}
            onChange={(patch) => setStage(s.id, patch)} onRemove={() => removeStage(s.id)} onMove={(dir) => moveStage(i, dir)} />
        ))}
        <button type="button" onClick={addStage} className="w-full rounded-lg border border-dashed flex items-center justify-center gap-1.5 py-2.5 text-[13px] font-medium hover:bg-[var(--t-subtle)]" style={{ borderColor: T.borderStrong, color: T.text2 }}>
          <Plus size={14} /> Add Stage
        </button>
      </div>
      <div className="mt-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: T.text3 }}>Pipeline Preview</div>
        <PipelinePreview stages={stages} />
      </div>
    </div>
  );
}

/* ============================================================
   TAB 5 — ENTITIES (typed field editor + optional per-entity pipeline)
   ============================================================ */
function EntityFieldRow({ field, onChange, onRemove }) {
  const [newOption, setNewOption] = useState("");
  const isOptionsType = OPTIONS_FIELD_TYPES.includes(field.type);
  const addOption = () => {
    const v = newOption.trim();
    if (!v) { setNewOption(""); return; }
    onChange({ options: [...(field.options || []), v] });
    setNewOption("");
  };
  const removeOption = (opt) => onChange({ options: (field.options || []).filter((o) => o !== opt) });
  return (
    <div className="rounded-lg border p-2.5" style={{ borderColor: T.border }}>
      <div className="grid gap-2 items-center" style={{ gridTemplateColumns: "1fr 150px 64px 32px" }}>
        <input value={field.name} onChange={(e) => onChange({ name: e.target.value })} placeholder="Field name"
          className="px-2 py-1.5 rounded-md border text-[13px] outline-none min-w-0" style={{ borderColor: T.border }} />
        <select value={field.type} onChange={(e) => onChange({ type: e.target.value, options: OPTIONS_FIELD_TYPES.includes(e.target.value) ? (field.options || []) : undefined })}
          className="px-2 py-1.5 rounded-md border text-[12px] outline-none" style={{ borderColor: T.border, background: T.surface, color: T.text }}>
          {ENTITY_FIELD_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <label className="flex items-center justify-center gap-1 text-[10.5px]" style={{ color: T.text2 }} title="Required">
          <input type="checkbox" checked={!!field.required} onChange={(e) => onChange({ required: e.target.checked })} style={{ accentColor: T.primary }} /> Req
        </label>
        <button type="button" onClick={onRemove} className="w-7 h-7 rounded-md flex items-center justify-center hover:brightness-95" style={{ background: T.dangerSoft, color: T.danger }}><Trash2 size={13} /></button>
      </div>
      {isOptionsType && (
        <div className="mt-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: T.text3 }}>Options</div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(field.options || []).map((opt) => (
              <span key={opt} className="inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-full text-[11.5px]" style={{ background: T.subtle, color: T.text }}>
                {opt}
                <button type="button" onClick={() => removeOption(opt)} className="p-0.5 rounded-full hover:bg-[var(--t-hover)]"><X size={10} /></button>
              </span>
            ))}
            <input value={newOption} onChange={(e) => setNewOption(e.target.value)} onBlur={addOption}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addOption(); } }}
              placeholder="+ Add option" className="px-2.5 py-1 rounded-full border text-[11.5px] outline-none w-28" style={{ borderColor: T.borderStrong }} />
          </div>
        </div>
      )}
    </div>
  );
}

function EntityCard({ entity, expanded, onToggle, onChange, onRemove, autoFocusName }) {
  const Icon = ICON_MAP[entity.icon] || Box;
  const setField = (id, patch) => onChange({ ...entity, fields: entity.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)) });
  const removeField = (id) => onChange({ ...entity, fields: entity.fields.filter((f) => f.id !== id) });
  const addField = () => onChange({ ...entity, fields: [...entity.fields, { id: "ef-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), name: "", type: "Text", required: false }] });

  const stages = entity.pipeline?.stages || [];
  const setStages = (next) => onChange({ ...entity, pipeline: { ...entity.pipeline, stages: next } });
  const setStage = (sid, patch) => setStages(stages.map((s) => (s.id === sid ? { ...s, ...patch } : s)));
  const removeStage = (sid) => setStages(stages.filter((s) => s.id !== sid).map((s, i) => ({ ...s, order: i + 1 })));
  const addStage = () => setStages([...stages, { id: "es-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), name: "", order: stages.length + 1, color: COLOR_PRESETS[stages.length % COLOR_PRESETS.length], slaHours: null }]);
  const moveStage = (idx, dir) => {
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= stages.length) return;
    const next = [...stages];
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    setStages(next.map((s, i) => ({ ...s, order: i + 1 })));
  };
  const togglePipeline = () => onChange({
    ...entity,
    pipeline: {
      enabled: !entity.pipeline?.enabled,
      stages: stages.length ? stages : [
        { id: "es-" + Date.now().toString(36) + "1", name: "Open", order: 1, color: COLOR_PRESETS[5], slaHours: null },
        { id: "es-" + Date.now().toString(36) + "2", name: "Closed", order: 2, color: COLOR_PRESETS[2], slaHours: null },
      ],
    },
  });

  const summary = `${entity.fields.length} field${entity.fields.length === 1 ? "" : "s"} · ${entity.pipeline?.enabled ? `Pipeline: ${stages.map((s) => s.name || "Untitled").join(" → ")}` : "No pipeline"}`;

  return (
    <Card>
      <CardBody className="!py-3">
        <div className="flex items-start gap-2.5 cursor-pointer" onClick={onToggle}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: T.primarySoft }}><Icon size={16} style={{ color: T.primary }} /></div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-[13.5px]" style={{ color: T.text }}>{entity.name || "Untitled Entity"}</div>
            {entity.description && <div className="text-[12px] mt-0.5" style={{ color: T.text2 }}>{entity.description}</div>}
            <div className="text-[11px] mt-1" style={{ color: T.text3 }}>{summary}</div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(); }} className="w-7 h-7 rounded-md flex items-center justify-center hover:brightness-95" style={{ background: T.dangerSoft, color: T.danger }}><Trash2 size={13} /></button>
            {expanded ? <ChevronUp size={16} style={{ color: T.text3 }} /> : <ChevronDown size={16} style={{ color: T.text3 }} />}
          </div>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t space-y-4" style={{ borderColor: T.border }} onClick={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Entity Name">
                <input autoFocus={autoFocusName} value={entity.name} onChange={(e) => onChange({ ...entity, name: e.target.value })} placeholder="e.g. Patient"
                  className="w-full mt-1 px-2.5 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border }} />
              </Field>
              <Field label="Icon">
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: T.primarySoft }}><Icon size={16} style={{ color: T.primary }} /></div>
                  <select value={entity.icon} onChange={(e) => onChange({ ...entity, icon: e.target.value })} className="flex-1 px-2.5 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border, background: T.surface, color: T.text }}>
                    {ENTITY_ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              </Field>
              <div className="col-span-2">
                <Field label="Description">
                  <input value={entity.description} onChange={(e) => onChange({ ...entity, description: e.target.value })} placeholder="Short explanation"
                    className="w-full mt-1 px-2.5 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border }} />
                </Field>
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: T.text3 }}>Fields</div>
              <div className="space-y-2">
                {entity.fields.map((f) => <EntityFieldRow key={f.id} field={f} onChange={(patch) => setField(f.id, patch)} onRemove={() => removeField(f.id)} />)}
                <button type="button" onClick={addField} className="w-full rounded-lg border border-dashed flex items-center justify-center gap-1.5 py-2 text-[12.5px] font-medium hover:bg-[var(--t-subtle)]" style={{ borderColor: T.borderStrong, color: T.text2 }}>
                  <Plus size={13} /> Add Field
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Switch on={!!entity.pipeline?.enabled} onClick={togglePipeline} />
                <span className="text-[12.5px] font-medium" style={{ color: T.text }}>Enable pipeline for this entity</span>
              </div>
              {entity.pipeline?.enabled && (
                <div className="space-y-2">
                  {stages.map((s, i) => (
                    <StageRow key={s.id} stage={s} index={i} count={stages.length}
                      onChange={(patch) => setStage(s.id, patch)} onRemove={() => removeStage(s.id)} onMove={(dir) => moveStage(i, dir)} />
                  ))}
                  <button type="button" onClick={addStage} className="w-full rounded-lg border border-dashed flex items-center justify-center gap-1.5 py-2 text-[12.5px] font-medium hover:bg-[var(--t-subtle)]" style={{ borderColor: T.borderStrong, color: T.text2 }}>
                    <Plus size={13} /> Add Stage
                  </button>
                  {stages.length > 0 && (
                    <div className="pt-1"><PipelinePreview stages={stages} size="small" /></div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function EntitiesTab({ entities, onChange }) {
  const [expandedId, setExpandedId] = useState(null);
  const [justAddedId, setJustAddedId] = useState(null);

  const setEntity = (id, next) => onChange(entities.map((e) => (e.id === id ? next : e)));
  const removeEntity = (id) => { onChange(entities.filter((e) => e.id !== id)); if (expandedId === id) setExpandedId(null); };
  const addEntity = () => {
    const id = "ent-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const blank = JSON.parse(JSON.stringify(BLANK_ENTITY));
    const ne = { ...blank, id, fields: blank.fields.map((f, i) => ({ ...f, id: `${id}-f${i}` })) };
    onChange([...entities, ne]);
    setExpandedId(id);
    setJustAddedId(id);
  };

  return (
    <div>
      <div className="mb-3 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[14px] font-semibold" style={{ color: T.text }}>Custom Entities</div>
          <div className="text-[12px] mt-0.5" style={{ color: T.text2 }}>Define record types for post-lead workflows. Converted leads can become entity records.</div>
        </div>
        <Button size="sm" onClick={addEntity}><Plus size={13} /> Add Entity</Button>
      </div>
      {entities.length === 0 ? (
        <div className="rounded-lg border border-dashed py-8 text-center" style={{ borderColor: T.borderStrong }}>
          <div className="text-[13px]" style={{ color: T.text2 }}>No entities yet — this industry's tenants get leads only.</div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {entities.map((ent) => (
            <EntityCard key={ent.id} entity={ent} expanded={expandedId === ent.id} onToggle={() => setExpandedId(expandedId === ent.id ? null : ent.id)}
              onChange={(next) => setEntity(ent.id, next)} onRemove={() => removeEntity(ent.id)} autoFocusName={ent.id === justAddedId} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   INDUSTRY CONFIGURATION EDITOR (Drawer)
   ============================================================ */
const EDITOR_TABS = ["Lead Fields", "Lead Sources", "Lead Groups", "Pipelines & Stages", "Entities"];

function IndustryEditorDrawer({ open, industry, onClose, onSave }) {
  const [form, setForm] = useState(null);
  const [tab, setTab] = useState("Lead Fields");
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (open) {
      setForm(JSON.parse(JSON.stringify(industry || BLANK_INDUSTRY)));
      setTab("Lead Fields");
      setErrors([]);
    }
  }, [open, industry]);

  if (!open || !form) return null;
  const u = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const errs = [];
    if (!form.name.trim()) errs.push("Industry name is required.");
    if (form.leadFields.filter((f) => !f.isSystem).length === 0) errs.push("Add at least one custom lead field.");
    if (form.leadSources.length === 0) errs.push("Add at least one lead source.");
    if (form.leadGroups.length === 0) errs.push("Add at least one lead group.");
    if (form.pipelines.length === 0) errs.push("Add at least one pipeline.");
    if (form.pipelines.some((p) => p.stages.length < 2)) errs.push("Every pipeline needs at least two stages.");
    form.entities.forEach((e, i) => {
      const label = e.name.trim() || `Entity #${i + 1}`;
      if (!e.name.trim()) errs.push(`Entity #${i + 1} needs a name.`);
      if (e.fields.length === 0) errs.push(`"${label}" needs at least one field.`);
      if (e.pipeline?.enabled && e.pipeline.stages.length < 2) errs.push(`"${label}"'s pipeline needs at least two stages.`);
      e.fields.forEach((f) => {
        if (OPTIONS_FIELD_TYPES.includes(f.type) && (!f.options || f.options.length === 0)) errs.push(`"${label}" field "${f.name || "Untitled"}" needs at least one option.`);
      });
    });
    return errs;
  };
  const handleSave = () => {
    const errs = validate();
    setErrors(errs);
    if (errs.length) return;
    onSave(form);
  };

  const IconPreview = ICON_MAP[form.icon] || LayoutTemplate;

  return (
    <Drawer open={open} onClose={onClose} width={800}>
      <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: T.border }}>
        <button onClick={onClose} className="flex items-center gap-1.5 text-[13px] font-medium hover:underline" style={{ color: T.text2 }}><ArrowLeft size={15} /> Back</button>
        <h2 className="text-[15px] font-semibold" style={{ color: T.text }}>Industry Configuration</h2>
        <div style={{ width: 52 }} />
      </div>
      <div className="px-5 py-4">
        {errors.length > 0 && (
          <div className="rounded-lg p-3 mb-4 text-[12.5px]" style={{ background: T.dangerSoft, color: T.danger }}>
            <div className="font-semibold mb-1">Fix the following before saving:</div>
            <ul className="list-disc pl-4 space-y-0.5">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <Field label="Industry Name">
            <input value={form.name} onChange={(e) => u("name", e.target.value)} placeholder="e.g. Automotive"
              className="w-full mt-1 px-2.5 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border }} />
          </Field>
          <Field label="Icon">
            <div className="flex items-center gap-2 mt-1">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: T.primarySoft }}><IconPreview size={17} style={{ color: T.primary }} /></div>
              <select value={form.icon} onChange={(e) => u("icon", e.target.value)} className="flex-1 px-2.5 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border, background: T.surface, color: T.text }}>
                {INDUSTRY_ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={(e) => u("status", e.target.value)} className="w-full mt-1 px-2.5 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border, background: T.surface, color: T.text }}>
              {INDUSTRY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Default for new tenants">
            <div className="mt-1.5 flex items-center gap-2">
              <Switch on={form.isDefault} onClick={() => u("isDefault", !form.isDefault)} />
              <span className="text-[12px]" style={{ color: T.text2 }}>{form.isDefault ? "This is the default template" : "Not the default"}</span>
            </div>
          </Field>
          <div className="col-span-2">
            <Field label="Description">
              <textarea rows={2} value={form.description} onChange={(e) => u("description", e.target.value)} className="w-full mt-1 px-2.5 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border }} />
            </Field>
          </div>
        </div>

        <Tabs tabs={EDITOR_TABS} value={tab} onChange={setTab} />
        {tab === "Lead Fields" && <LeadFieldsTab fields={form.leadFields} onChange={(v) => u("leadFields", v)} />}
        {tab === "Lead Sources" && <LeadSourcesTab sources={form.leadSources} onChange={(v) => u("leadSources", v)} />}
        {tab === "Lead Groups" && <LeadGroupsTab groups={form.leadGroups} onChange={(v) => u("leadGroups", v)} />}
        {tab === "Pipelines & Stages" && <PipelinesTab pipelines={form.pipelines} onChange={(v) => u("pipelines", v)} />}
        {tab === "Entities" && <EntitiesTab entities={form.entities} onChange={(v) => u("entities", v)} />}

        <div className="mt-6 pt-4 border-t" style={{ borderColor: T.border }}>
          <Button variant="primary" className="w-full justify-center" onClick={handleSave}>Save Configuration</Button>
        </div>
      </div>
    </Drawer>
  );
}

/* ============================================================
   MAIN PAGE
   ============================================================ */
export function IndustriesPage() {
  const store = useStore();
  const { industries, clients } = store;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingIndustry, setEditingIndustry] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = industries.filter((i) =>
    (statusFilter === "All" || i.status === statusFilter) &&
    (!search || i.name.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase())));

  const activeCount = industries.filter((i) => i.status === "Active").length;
  const draftCount = industries.filter((i) => i.status === "Draft").length;
  const popular = mostPopularIndustry(industries, clients);
  const avgFields = avgFieldsPerIndustry(industries);
  const avgEntities = avgEntitiesPerIndustry(industries);

  const openCreate = () => { setEditingIndustry(null); setEditorOpen(true); };
  const openEdit = (ind) => { setEditingIndustry(ind); setEditorOpen(true); };
  const handleSave = (form) => {
    if (editingIndustry) store.updateIndustry(editingIndustry.id, form);
    else store.createIndustry(form);
    setEditorOpen(false);
  };
  const handleDuplicate = (ind) => {
    const dup = store.duplicateIndustry(ind.id);
    if (dup) { setEditingIndustry(dup); setEditorOpen(true); }
  };
  const deleteBlockedCount = deleteTarget ? countTenantsForIndustry(deleteTarget, clients) : 0;
  const confirmDelete = () => {
    if (!deleteTarget || deleteBlockedCount > 0) return;
    store.deleteIndustry(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <>
      <PageHeader title="Industries & Templates" desc="Industry vertical presets — lead fields, sources, groups, pipelines, and custom entities applied at tenant onboarding"
        actions={<Button variant="primary" onClick={openCreate}><Plus size={15} /> New Industry</Button>} />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        <Kpi label="Industries" value={String(industries.length)} sub={`${activeCount} active · ${draftCount} draft${draftCount === 1 ? "" : "s"}`} />
        <Kpi label="Total Tenants" value={String(clients.length)} sub="across all verticals" />
        <Kpi label="Most Popular" value={popular ? popular.name : "—"} sub={popular ? `${countTenantsForIndustry(popular, clients)} tenants` : ""} />
        <Kpi label="Avg Fields / Industry" value={String(avgFields)} sub="customization depth" />
        <Kpi label="Total Entities" value={String(totalEntities(industries))} sub={`${avgEntities} avg / industry`} />
      </div>

      <Card>
        <CardBody className="flex items-center gap-2 flex-wrap !pb-3">
          {["All", ...INDUSTRY_STATUSES].map((s) => <FilterPill key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>{s}</FilterPill>)}
          <SearchInput value={search} onChange={setSearch} placeholder="Search industries..." />
        </CardBody>
        {filtered.length === 0 ? (
          <CardBody className="text-center py-12">
            <div className="text-[13px] font-medium" style={{ color: T.text }}>No industry templates configured. Create one to get started.</div>
          </CardBody>
        ) : (
          <Table head={["Industry", "Status", "Tenants", "Fields", "Pipelines", "Entities", "Sources", "Last Modified", ""]}>
            {filtered.map((ind) => {
              const Icon = ICON_MAP[ind.icon] || LayoutTemplate;
              const tenantCount = countTenantsForIndustry(ind, clients);
              const activeSources = ind.leadSources.filter((s) => s.active).length;
              return (
                <tr key={ind.id} className="hover:bg-[var(--t-hover)] cursor-pointer" onClick={() => openEdit(ind)}>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: T.primarySoft }}><Icon size={16} style={{ color: T.primary }} /></div>
                      <div className="min-w-0">
                        <div className="font-semibold flex items-center gap-1.5" style={{ color: T.text }}>{ind.name}{ind.isDefault && <Badge tone="info">Default</Badge>}</div>
                        <div className="text-[11px] truncate max-w-[240px]" style={{ color: T.text2 }}>{ind.description}</div>
                      </div>
                    </div>
                  </Td>
                  <Td><Badge tone={INDUSTRY_STATUS_TONE[ind.status]}>{ind.status}</Badge></Td>
                  <Td>{tenantCount}</Td>
                  <Td>{ind.leadFields.length}</Td>
                  <Td className="whitespace-nowrap">{ind.pipelines.length} pipeline{ind.pipelines.length === 1 ? "" : "s"}</Td>
                  <Td className="whitespace-nowrap" style={{ color: ind.entities.length ? T.text : T.text3 }}>{ind.entities.length ? `${ind.entities.length} entit${ind.entities.length === 1 ? "y" : "ies"}` : "—"}</Td>
                  <Td>{activeSources}</Td>
                  <Td className="text-[12px] whitespace-nowrap" style={{ color: T.text2 }}>{ind.lastModified} <span style={{ color: T.text3 }}>by {ind.modifiedBy}</span></Td>
                  <Td>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => openEdit(ind)} className="p-1.5 rounded hover:bg-[var(--t-hover)]" title="Edit"><Pencil size={14} style={{ color: T.text3 }} /></button>
                      <Menu items={[
                        { label: "Duplicate", icon: Copy, onClick: () => handleDuplicate(ind) },
                        { label: ind.isDefault ? "Default template" : "Set as Default", icon: Star, onClick: () => !ind.isDefault && store.setDefaultIndustry(ind.id) },
                        { label: "Delete", icon: Trash2, danger: true, onClick: () => setDeleteTarget(ind) },
                      ]} />
                    </div>
                  </Td>
                </tr>
              );
            })}
          </Table>
        )}
      </Card>

      <IndustryEditorDrawer open={editorOpen} industry={editingIndustry} onClose={() => setEditorOpen(false)} onSave={handleSave} />

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Industry Template" footer={<>
        <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
        <Button variant="danger" disabled={deleteBlockedCount > 0} onClick={confirmDelete}>Delete</Button>
      </>}>
        {deleteTarget && (
          deleteBlockedCount > 0
            ? <div className="text-[13px]" style={{ color: T.danger }}>Can't delete "{deleteTarget.name}" — {deleteBlockedCount} tenant{deleteBlockedCount === 1 ? "" : "s"} use this template. Reassign them first.</div>
            : <div className="text-[13px]" style={{ color: T.text2 }}>Delete "<b style={{ color: T.text }}>{deleteTarget.name}</b>"? This can't be undone.</div>
        )}
      </Modal>
    </>
  );
}
