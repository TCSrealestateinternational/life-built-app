import { useState, useMemo } from 'react';
import {
  Plus, Trash2, BarChart2, List, RefreshCw,
  ChevronDown, ChevronUp, Printer, Image, Paperclip, X,
  Flag, Lightbulb, MessageSquare,
} from 'lucide-react';
import GanttChart from './GanttChart';
import { TEMPLATES, buildMilestonesFromTemplate } from '../data/timelineTemplates';
import { printTimeline } from '../utils/printTimeline';

const TODAY = new Date().toISOString().slice(0, 10);

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Migrate old milestone format ({ targetDate }) to new ({ start, end, progress, photos, linkedDocs })
function normalize(m) {
  const base = m.start && m.end ? m : {
    ...m,
    start: m.start || m.targetDate || TODAY,
    end: m.end || addDays(m.start || m.targetDate || TODAY, 13),
    progress: m.progress ?? (m.done ? 100 : 0),
    dependencies: m.dependencies || '',
  };
  return {
    ...base,
    photos: base.photos || [],
    linkedDocs: base.linkedDocs || [],
  };
}

// ─── Template Picker ──────────────────────────────────────────────────────────

function TemplatePicker({ startDate, onStartDateChange, onSelect, onSkip, hasExisting }) {
  const [selected, setSelected] = useState(null);

  function handleApply() {
    if (!selected) return;
    const tmpl = TEMPLATES.find((t) => t.id === selected);
    if (tmpl) onSelect(tmpl, startDate);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-2">Get Started</p>
        <h1 className="text-3xl font-extrabold text-on-surface font-heading">
          Timeline
        </h1>
        <p className="text-on-surface-variant text-base mt-1.5">
          Choose a template to auto-generate your milestones, or start from scratch.
        </p>
      </div>

      {hasExisting && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-3 mb-4 text-xs text-amber-700">
          ⚠️ Applying a template will replace your existing milestones. This cannot be undone.
        </div>
      )}

      {/* Start date */}
      <div className="shadow-md border border-outline-variant/10 rounded-3xl p-6 mb-4 flex flex-wrap items-center gap-3 bg-surface-container-lowest">
        <label className="text-sm font-medium text-on-surface whitespace-nowrap">Project Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="text-sm border border-outline-variant rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/40"
        />
        <p className="text-xs text-outline">All milestone dates will be calculated from this date.</p>
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelected(t.id === selected ? null : t.id)}
            className={`text-left rounded-3xl border p-6 transition-all ${
              selected === t.id
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-outline-variant bg-surface-container-lowest hover:border-primary/30'
            }`}
          >
            <div className="text-2xl mb-1">{t.icon}</div>
            <div className="font-medium text-on-surface text-sm">{t.name}</div>
            <div className="text-xs text-primary font-medium mb-1">{t.months}</div>
            <div className="text-xs text-outline leading-snug">{t.description}</div>
          </button>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleApply}
          disabled={!selected}
          className="px-4 py-2 text-sm bg-primary text-on-primary rounded-xl hover:bg-primary-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Apply Template
        </button>
        <button
          onClick={onSkip}
          className="px-4 py-2 text-sm text-outline hover:text-on-surface transition-colors"
        >
          Start from Scratch
        </button>
      </div>
    </div>
  );
}

// ─── Milestone row (List view) ────────────────────────────────────────────────

function MilestoneRow({ milestone: m, onUpdate, onDelete, projectDocs }) {
  const [expanded, setExpanded] = useState(false);
  const pct = typeof m.progress === 'number' ? m.progress : (m.done ? 100 : 0);

  // ── Photos helpers ────────────────────────────────────────────────────────
  function addPhoto() {
    onUpdate({
      photos: [
        ...(m.photos || []),
        { id: `ph_${Date.now()}`, url: '', caption: '' },
      ],
    });
  }
  function updatePhoto(id, patch) {
    onUpdate({ photos: (m.photos || []).map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  }
  function removePhoto(id) {
    onUpdate({ photos: (m.photos || []).filter((p) => p.id !== id) });
  }

  // ── Doc link helpers ──────────────────────────────────────────────────────
  function addDocFromDropdown(docId) {
    if (!docId) return;
    const doc = (projectDocs || []).find((d) => d.id === docId);
    if (!doc) return;
    if ((m.linkedDocs || []).some((d) => d.id === doc.id)) return; // no dupe
    onUpdate({ linkedDocs: [...(m.linkedDocs || []), { id: doc.id, name: doc.name, url: doc.url }] });
  }
  function addCustomDoc() {
    onUpdate({
      linkedDocs: [
        ...(m.linkedDocs || []),
        { id: `doc_${Date.now()}`, name: '', url: '' },
      ],
    });
  }
  function updateDoc(id, patch) {
    onUpdate({ linkedDocs: (m.linkedDocs || []).map((d) => (d.id === id ? { ...d, ...patch } : d)) });
  }
  function removeDoc(id) {
    onUpdate({ linkedDocs: (m.linkedDocs || []).filter((d) => d.id !== id) });
  }

  return (
    <div
      className={`rounded-3xl border overflow-hidden transition-colors ${
        m.done ? 'border-primary/20 bg-primary/5' : 'shadow-md border border-outline-variant/10 bg-surface-container-lowest'
      }`}
    >
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <input
          type="checkbox"
          checked={!!m.done}
          onChange={(e) =>
            onUpdate({ done: e.target.checked, progress: e.target.checked ? 100 : pct })
          }
          className="accent-primary shrink-0"
        />
        <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
          <Flag size={14} className="text-primary-dim" />
        </div>
        <input
          type="text"
          value={m.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Milestone title…"
          className={`flex-1 text-sm bg-transparent focus:outline-none border-b border-transparent hover:border-outline-variant focus:border-primary py-0.5 ${
            m.done ? 'line-through text-outline' : 'text-on-surface font-medium'
          }`}
        />
        {/* Dates (desktop) */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs shrink-0">
          <input
            type="date"
            value={m.start}
            onChange={(e) => {
              const s = e.target.value;
              onUpdate({ start: s, ...(m.end < s ? { end: addDays(s, 13) } : {}) });
            }}
            className="border border-outline-variant rounded px-2 py-1 text-on-surface focus:outline-none focus:border-primary"
          />
          <span className="text-outline">→</span>
          <input
            type="date"
            value={m.end}
            min={m.start}
            onChange={(e) => { if (e.target.value >= m.start) onUpdate({ end: e.target.value }); }}
            className="border border-outline-variant rounded px-2 py-1 text-on-surface focus:outline-none focus:border-primary"
          />
        </div>
        {/* Progress (desktop) */}
        <div className="hidden md:flex items-center gap-1.5 shrink-0">
          <div className="w-16 h-1.5 bg-outline-variant rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs text-outline w-8">{pct}%</span>
        </div>
        {/* Indicators */}
        {(m.photos || []).length > 0 && (
          <Image size={12} className="text-outline shrink-0" title={`${m.photos.length} photo(s)`} />
        )}
        {(m.linkedDocs || []).length > 0 && (
          <Paperclip size={12} className="text-outline shrink-0" title={`${m.linkedDocs.length} doc(s)`} />
        )}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-outline hover:text-on-surface transition-colors shrink-0"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <button
          onClick={onDelete}
          className="text-red-300 hover:text-red-500 transition-colors shrink-0"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 pt-3 border-t border-outline-variant bg-surface/20 space-y-4">
          {/* Mobile dates */}
          <div className="sm:hidden flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <label className="text-xs text-outline w-10 shrink-0">Start</label>
              <input type="date" value={m.start}
                onChange={(e) => {
                  const s = e.target.value;
                  onUpdate({ start: s, ...(m.end < s ? { end: addDays(s, 13) } : {}) });
                }}
                className="text-sm border border-outline-variant rounded px-2 py-1 focus:outline-none focus:border-primary text-on-surface" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-outline w-10 shrink-0">End</label>
              <input type="date" value={m.end} min={m.start}
                onChange={(e) => { if (e.target.value >= m.start) onUpdate({ end: e.target.value }); }}
                className="text-sm border border-outline-variant rounded px-2 py-1 focus:outline-none focus:border-primary text-on-surface" />
            </div>
          </div>

          {/* Progress slider */}
          <div className="flex items-center gap-3">
            <label className="text-xs text-outline w-16 shrink-0">Progress</label>
            <input
              type="range" min={0} max={100} step={5} value={pct}
              onChange={(e) => onUpdate({ progress: Number(e.target.value) })}
              className="flex-1 accent-primary"
            />
            <span className="text-xs text-outline w-8 text-right">{pct}%</span>
          </div>

          {/* Notes */}
          <div className="flex items-start gap-3">
            <label className="text-xs text-outline w-16 shrink-0 pt-2">Notes</label>
            <textarea
              value={m.notes || ''}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              placeholder="Add notes…"
              rows={2}
              className="flex-1 text-sm border border-outline-variant rounded-xl px-3 py-2 bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none"
            />
          </div>

          {/* Attribution */}
          {m.createdBy && (
            <p className="text-xs text-on-surface-variant mt-0.5">Added by {m.createdBy.name} · {fmtDate(m.createdBy.at)}</p>
          )}
          {m.editedBy && !m.createdBy && (
            <p className="text-xs text-on-surface-variant mt-0.5">Edited by {m.editedBy.name} · {fmtDate(m.editedBy.at)}</p>
          )}

          {/* Progress Photos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-outline flex items-center gap-1">
                <Image size={12} /> Progress Photos
              </label>
              <button
                onClick={addPhoto}
                className="text-xs text-primary hover:underline flex items-center gap-0.5"
              >
                <Plus size={11} /> Add URL
              </button>
            </div>
            {(m.photos || []).length === 0 && (
              <p className="text-xs text-outline/60 italic">No photos linked yet. Paste a Google Drive or other image URL.</p>
            )}
            <div className="space-y-2">
              {(m.photos || []).map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <input
                    type="url"
                    value={p.url}
                    onChange={(e) => updatePhoto(p.id, { url: e.target.value })}
                    placeholder="Photo URL…"
                    className="flex-1 text-xs border border-outline-variant rounded px-2 py-1.5 bg-surface-container-lowest focus:outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    value={p.caption}
                    onChange={(e) => updatePhoto(p.id, { caption: e.target.value })}
                    placeholder="Caption (optional)"
                    className="w-32 text-xs border border-outline-variant rounded px-2 py-1.5 bg-surface-container-lowest focus:outline-none focus:border-primary"
                  />
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noreferrer"
                      className="text-xs text-primary hover:underline whitespace-nowrap">
                      View
                    </a>
                  )}
                  <button onClick={() => removePhoto(p.id)} className="text-red-300 hover:text-red-500 shrink-0">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Linked Documents */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-outline flex items-center gap-1">
                <Paperclip size={12} /> Attached Documents
              </label>
              <div className="flex items-center gap-2">
                {(projectDocs || []).length > 0 && (
                  <select
                    defaultValue=""
                    onChange={(e) => { addDocFromDropdown(e.target.value); e.target.value = ''; }}
                    className="text-xs border border-outline-variant rounded px-2 py-1 bg-surface-container-lowest focus:outline-none focus:border-primary text-on-surface"
                  >
                    <option value="">Pick from your docs…</option>
                    {(projectDocs || []).map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                )}
                <button
                  onClick={addCustomDoc}
                  className="text-xs text-primary hover:underline flex items-center gap-0.5"
                >
                  <Plus size={11} /> Custom URL
                </button>
              </div>
            </div>
            {(m.linkedDocs || []).length === 0 && (
              <p className="text-xs text-outline/60 italic">No documents attached. Pick from your docs list or add a custom URL.</p>
            )}
            <div className="space-y-2">
              {(m.linkedDocs || []).map((d) => (
                <div key={d.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={d.name}
                    onChange={(e) => updateDoc(d.id, { name: e.target.value })}
                    placeholder="Document name…"
                    className="w-40 text-xs border border-outline-variant rounded px-2 py-1.5 bg-surface-container-lowest focus:outline-none focus:border-primary"
                  />
                  <input
                    type="url"
                    value={d.url}
                    onChange={(e) => updateDoc(d.id, { url: e.target.value })}
                    placeholder="URL…"
                    className="flex-1 text-xs border border-outline-variant rounded px-2 py-1.5 bg-surface-container-lowest focus:outline-none focus:border-primary"
                  />
                  {d.url && (
                    <a href={d.url} target="_blank" rel="noreferrer"
                      className="text-xs text-primary hover:underline whitespace-nowrap">
                      Open
                    </a>
                  )}
                  <button onClick={() => removeDoc(d.id)} className="text-red-300 hover:text-red-500 shrink-0">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Timeline ────────────────────────────────────────────────────────────

export default function Timeline({ project, updateProject }) {
  const raw = project?.timeline?.milestones ?? [];
  const milestones = useMemo(() => raw.map(normalize), [raw]);
  const projectDocs = project?.documents ?? [];

  const [view, setView] = useState('gantt');
  const [ganttMode, setGanttMode] = useState('Month');
  const [showPicker, setShowPicker] = useState(milestones.length === 0);
  const [startDate, setStartDate] = useState(TODAY);

  function save(newMilestones) {
    updateProject({
      timeline: { ...(project?.timeline ?? {}), milestones: newMilestones },
    });
  }

  function applyTemplate(template, sd) {
    save(buildMilestonesFromTemplate(template, sd));
    setShowPicker(false);
  }

  function addMilestone() {
    const last = milestones[milestones.length - 1];
    const start = last ? addDays(last.end, 1) : TODAY;
    const end = addDays(start, 13);
    save([
      ...milestones,
      {
        id: `m_${Date.now()}`,
        title: 'New Milestone',
        start,
        end,
        progress: 0,
        done: false,
        notes: '',
        dependencies: '',
        photos: [],
        linkedDocs: [],
      },
    ]);
  }

  function updateMilestone(id, patch) {
    save(milestones.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  function deleteMilestone(id) {
    save(milestones.filter((m) => m.id !== id));
  }

  if (showPicker) {
    return (
      <TemplatePicker
        startDate={startDate}
        onStartDateChange={setStartDate}
        onSelect={applyTemplate}
        onSkip={() => setShowPicker(false)}
        hasExisting={milestones.length > 0}
      />
    );
  }

  const done = milestones.filter((m) => m.done).length;
  const total = milestones.length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="flex flex-col justify-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-2">Construction Roadmap</p>
          <h1 className="text-4xl font-extrabold text-on-surface font-heading mb-3">
            Timeline
          </h1>
          <p className="text-lg text-on-surface-variant">
            {total > 0
              ? 'Track every phase of your build from breaking ground to move-in day.'
              : 'Track your build milestones and phases.'}
          </p>
        </div>
        {total > 0 && (
          <div className="rounded-3xl shadow-md bg-surface-container-low p-6 flex flex-col justify-center">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-on-surface">{done}</span>
              <span className="text-4xl font-extrabold text-outline/40">/{total}</span>
            </div>
            <p className="text-sm text-on-surface-variant mt-1">Milestones Complete</p>
            <div className="h-2 bg-outline-variant/30 rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(done / total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* View Controls */}
      {total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            {/* Gantt / List toggle */}
            <div className="rounded-full bg-surface-container-high p-1 shadow-inner flex text-xs">
              <button
                onClick={() => setView('gantt')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-colors ${
                  view === 'gantt' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <BarChart2 size={13} /> Gantt
              </button>
              <button
                onClick={() => setView('list')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-colors ${
                  view === 'list' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <List size={13} /> List
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Week/Month/Quarter zoom */}
            {view === 'gantt' && (
              <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-1.5 flex text-xs">
                {['Week', 'Month', 'Quarter'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setGanttMode(m)}
                    className={`px-3 py-1 rounded-xl transition-colors ${
                      ganttMode === m ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}

            {/* Print */}
            <button
              onClick={() => printTimeline({ milestones })}
              className="flex items-center gap-1.5 text-xs text-outline hover:text-primary transition-colors px-2 py-1"
              title="Print / Save as PDF"
            >
              <Printer size={12} /> Print
            </button>

            {/* Change template */}
            <button
              onClick={() => setShowPicker(true)}
              className="flex items-center gap-1.5 text-xs text-outline hover:text-primary transition-colors px-2 py-1"
            >
              <RefreshCw size={12} /> Change Template
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {total === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📅</div>
          <p className="text-xl font-bold text-on-surface">No milestones yet</p>
          <p className="text-base text-on-surface-variant mt-2">
            <button onClick={() => setShowPicker(true)} className="text-primary hover:underline font-medium">
              Choose a template
            </button>
            {' '}or add your own below.
          </p>
        </div>
      ) : view === 'gantt' ? (
        <GanttChart
          tasks={milestones}
          viewMode={ganttMode}
          onDateChange={(id, start, end) => updateMilestone(id, { start, end })}
          onProgressChange={(id, progress) => updateMilestone(id, { progress })}
          onTaskClick={() => setView('list')}
        />
      ) : (
        <div className="space-y-2">
          {milestones.map((m) => (
            <MilestoneRow
              key={m.id}
              milestone={m}
              onUpdate={(patch) => updateMilestone(m.id, patch)}
              onDelete={() => deleteMilestone(m.id)}
              projectDocs={projectDocs}
            />
          ))}
        </div>
      )}

      {/* Add milestone */}
      <button
        onClick={addMilestone}
        className="flex items-center gap-1.5 text-xs text-primary mt-4 hover:underline"
      >
        <Plus size={13} /> Add Milestone
      </button>

      {/* Build Tips */}
      {total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
          <div className="bg-primary-container/30 rounded-[32px] border border-primary-container/50 p-8">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={18} className="text-primary" />
              <h3 className="text-sm font-bold text-on-surface">Build Tip</h3>
            </div>
            <p className="text-sm text-on-surface-variant italic leading-relaxed">
              &ldquo;Always add a 2&ndash;3 week buffer between major milestones. Weather delays, material shortages, and inspection wait times are more common than you&rsquo;d expect.&rdquo;
            </p>
          </div>
          <div className="bg-primary-container/30 rounded-[32px] border border-primary-container/50 p-8">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare size={18} className="text-primary" />
              <h3 className="text-sm font-bold text-on-surface">Build Tip</h3>
            </div>
            <p className="text-sm text-on-surface-variant italic leading-relaxed">
              &ldquo;Schedule a weekly check-in with your builder&mdash;even a quick 10-minute call keeps everyone aligned and catches small issues before they become big ones.&rdquo;
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
