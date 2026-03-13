import { useState } from 'react';
import {
  MapPin, DollarSign, Calendar, CheckSquare, Palette, Users, TrendingUp,
  ArrowRight, Bell, X, Settings, Check,
  ClipboardList, CreditCard, Shield,
} from 'lucide-react';

const TODAY = new Date().toISOString().slice(0, 10);

function fmtDate(d) {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m,10)-1]} ${parseInt(day,10)}`;
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function normalizeMilestone(m) {
  const start = m.start || m.targetDate || '';
  return { ...m, start, end: m.end || start };
}

// ── Card catalogue ──────────────────────────────────────────────────────────

const CARD_LIMIT = 4;

const ALL_CARD_DEFS = [
  { id: 'properties',   sectionId: 'properties',   icon: MapPin,        label: 'Properties',    color: 'bg-forest'     },
  { id: 'budget',       sectionId: 'budget',        icon: DollarSign,    label: 'Budget',        color: 'bg-deep'       },
  { id: 'timeline',     sectionId: 'timeline',      icon: Calendar,      label: 'Timeline',      color: 'bg-sage'       },
  { id: 'checklists',   sectionId: 'checklists',    icon: CheckSquare,   label: 'Checklists',    color: 'bg-mist'       },
  { id: 'changeorders', sectionId: 'changeorders',  icon: ClipboardList, label: 'Change Orders', color: 'bg-amber-600'  },
  { id: 'payments',     sectionId: 'payments',      icon: CreditCard,    label: 'Payments',      color: 'bg-blue-600'   },
  { id: 'todos',        sectionId: 'commslog',      icon: Bell,          label: 'To-Dos',        color: 'bg-red-500'    },
  { id: 'lienwaiver',   sectionId: 'lienwaiver',    icon: Shield,        label: 'Lien Waivers',  color: 'bg-purple-600' },
  { id: 'team',         sectionId: 'team',          icon: Users,         label: 'Team',          color: 'bg-ink'        },
];

const WIDGET_DEFS = [
  { id: 'timelineWidget',    label: 'Timeline Widget',        desc: 'Current phase + upcoming milestones' },
  { id: 'quickNav',          label: 'Quick Nav Tiles',         desc: '"Jump To" section at the bottom'    },
  { id: 'checklistProgress', label: 'Checklist Progress Bar',  desc: 'Overall checklist completion'       },
];

const DEFAULT_PREFS = {
  statCards: ['properties', 'budget', 'timeline', 'checklists'],
  widgets: { timelineWidget: true, quickNav: true, checklistProgress: true },
};

// ── Per-card data ────────────────────────────────────────────────────────────

function getCardData(id, project) {
  switch (id) {
    case 'properties': {
      const props = project.properties ?? [];
      return { value: props.length, sub: `${props.filter((p) => p.evaluated).length} evaluated` };
    }
    case 'budget': {
      const items = project.budget?.items ?? [];
      const planned = items.reduce((s, i) => s + (parseFloat(i.planned) || 0) * (parseInt(i.qty) || 1), 0);
      const actual  = items.reduce((s, i) => s + (parseFloat(i.actual)  || 0), 0);
      return { value: planned > 0 ? `$${planned.toLocaleString()}` : '—', sub: actual > 0 ? `$${actual.toLocaleString()} spent` : 'Nothing logged yet' };
    }
    case 'timeline': {
      const ms = (project.timeline?.milestones ?? []).map(normalizeMilestone);
      const total = ms.length, done = ms.filter((m) => m.done).length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      return { value: total > 0 ? `${done}/${total}` : '—', sub: total > 0 ? `${pct}% complete` : 'No milestones yet' };
    }
    case 'checklists': {
      const entries = Object.entries(project.checklists ?? {}).filter(([k]) => k !== 'punchList' && k !== 'punchListCustom');
      const all = entries.flatMap(([, v]) => v);
      return { value: `${all.filter((c) => c.done).length}/${all.length}`, sub: 'tasks done' };
    }
    case 'changeorders': {
      const cos = project.changeOrders ?? [];
      const approved = cos.filter((c) => c.status === 'approved');
      const total = approved.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);
      return { value: approved.length, sub: total !== 0 ? `$${Math.abs(total).toLocaleString()} approved` : `${cos.length} total` };
    }
    case 'payments': {
      const pays = project.paymentSchedule ?? [];
      const paid = pays.filter((p) => p.paidDate);
      const paidAmt = paid.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
      return { value: `${paid.length}/${pays.length}`, sub: paidAmt > 0 ? `$${paidAmt.toLocaleString()} paid` : 'none paid yet' };
    }
    case 'todos': {
      const todos = project.todos ?? [];
      const open = todos.filter((t) => !t.done);
      return { value: open.length, sub: `${open.filter((t) => t.critical).length} critical` };
    }
    case 'lienwaiver': {
      const waivers = project.lienWaivers ?? [];
      return { value: waivers.length, sub: `${waivers.filter((w) => w.status === 'pending').length} pending` };
    }
    case 'team': {
      const team = project.team ?? [];
      return { value: team.length, sub: team.length === 1 ? 'member' : 'members' };
    }
    default:
      return { value: '—', sub: '' };
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export default function Dashboard({ project, user, onSection, updateProject }) {
  const [bellOpen, setBellOpen] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  if (!project) return null;

  // Derived data for widgets that remain in the component
  const checklistEntries = Object.entries(project.checklists ?? {}).filter(
    ([k]) => k !== 'punchList' && k !== 'punchListCustom'
  );
  const completedChecks = checklistEntries.flatMap(([, v]) => v).filter((c) => c.done).length;
  const totalChecks = checklistEntries.flatMap(([, v]) => v).length;

  const allMilestones = (project.timeline?.milestones ?? []).map(normalizeMilestone);
  const completedMilestones = allMilestones.filter((m) => m.done).length;
  const totalMilestones = allMilestones.length;
  const timelinePct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
  const sorted = [...allMilestones].sort((a, b) => (a.start || '').localeCompare(b.start || ''));
  const currentPhase = sorted.find((m) => !m.done && m.start && m.start <= TODAY);
  const upcoming = sorted.filter((m) => !m.done && m !== currentPhase).slice(0, currentPhase ? 2 : 3);

  const criticalTodos = (project.todos ?? []).filter((t) => t.critical && !t.done);

  // Prefs with fallback
  const prefs = {
    statCards: project.dashboardPrefs?.statCards ?? DEFAULT_PREFS.statCards,
    widgets: { ...DEFAULT_PREFS.widgets, ...(project.dashboardPrefs?.widgets ?? {}) },
  };

  const activeCards = ALL_CARD_DEFS
    .filter((def) => prefs.statCards.includes(def.id))
    .map((def) => ({ ...def, ...getCardData(def.id, project) }));

  function savePrefs(next) {
    updateProject({ dashboardPrefs: next });
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Header row */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Your Planning Dashboard
          </h1>
          <p className="text-sage text-sm mt-1">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}. Here's where your project stands.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 mt-1">
          {/* Customize button */}
          <button
            onClick={() => { setCustomizing(!customizing); setBellOpen(false); }}
            title="Customize Dashboard"
            className={`p-2 rounded-xl border transition-colors ${
              customizing ? 'bg-forest text-white border-forest' : 'border-linen text-mist hover:bg-linen/60 hover:text-ink'
            }`}
          >
            <Settings size={18} />
          </button>

          {/* Critical bell */}
          <button
            onClick={() => { setBellOpen(!bellOpen); setCustomizing(false); }}
            title="Critical To-Dos"
            className="relative p-2 rounded-xl border transition-colors hover:bg-red-50"
            style={{ borderColor: criticalTodos.length > 0 ? '#fca5a5' : '#d8d2c8' }}
          >
            <Bell
              size={18}
              fill={criticalTodos.length > 0 ? '#ef4444' : 'none'}
              className={criticalTodos.length > 0 ? 'text-red-500' : 'text-mist'}
            />
            {criticalTodos.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
                {criticalTodos.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Bell panel */}
      {bellOpen && (
        <div className="bg-white border border-red-200 rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell size={15} fill="#ef4444" className="text-red-500" />
              <span className="font-semibold text-sm text-ink">Critical To-Dos</span>
            </div>
            <button onClick={() => setBellOpen(false)} className="text-mist hover:text-ink transition-colors">
              <X size={15} />
            </button>
          </div>
          {criticalTodos.length === 0 ? (
            <p className="text-sm text-mist text-center py-3">No critical to-dos right now. 🎉</p>
          ) : (
            <div className="space-y-2">
              {criticalTodos.map((todo) => {
                const overdue = todo.dueDate && todo.dueDate < TODAY;
                return (
                  <div key={todo.id} className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                    <Bell size={13} fill="#ef4444" className="text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink">{todo.text || <em className="text-mist">Untitled</em>}</p>
                      <div className="flex flex-wrap gap-2 mt-0.5 text-xs">
                        {todo.assignedTo && <span className="text-mist">{todo.assignedTo}</span>}
                        {todo.dueDate && (
                          <span className={overdue ? 'text-red-600 font-semibold' : 'text-mist'}>
                            {overdue ? '⚠ Overdue · ' : 'Due '}{formatDate(todo.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <button
                onClick={() => { setBellOpen(false); onSection('commslog'); }}
                className="w-full text-xs text-center text-forest hover:underline pt-1"
              >
                Go to To-Dos →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Customize panel */}
      {customizing && (
        <div className="bg-white border border-linen rounded-xl p-5 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Settings size={15} className="text-forest" />
              <span className="font-semibold text-sm text-ink">Customize Dashboard</span>
            </div>
            <button onClick={() => setCustomizing(false)} className="text-mist hover:text-ink transition-colors">
              <X size={15} />
            </button>
          </div>

          {/* Stat card picker */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-mist uppercase tracking-wider">Top Stats — pick 4</p>
              <span className={`text-xs font-medium ${prefs.statCards.length === CARD_LIMIT ? 'text-forest' : 'text-amber-600'}`}>
                {prefs.statCards.length}/{CARD_LIMIT} selected
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALL_CARD_DEFS.map(({ id, icon: Icon, label, color }) => {
                const isSelected = prefs.statCards.includes(id);
                const isDisabled = !isSelected && prefs.statCards.length >= CARD_LIMIT;
                return (
                  <button
                    key={id}
                    disabled={isDisabled}
                    onClick={() => {
                      if (isDisabled) return;
                      const next = isSelected
                        ? prefs.statCards.filter((s) => s !== id)
                        : [...prefs.statCards, id];
                      savePrefs({ ...prefs, statCards: next });
                    }}
                    className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-all ${
                      isSelected
                        ? 'border-forest bg-forest/5 text-ink'
                        : isDisabled
                        ? 'border-linen bg-linen/40 text-mist/50 cursor-not-allowed'
                        : 'border-linen text-mist hover:border-forest/40 hover:text-ink'
                    }`}
                  >
                    <div className={`p-1 rounded-md ${isSelected ? color : 'bg-linen'} transition-colors shrink-0`}>
                      <Icon size={13} className={isSelected ? 'text-white' : 'text-mist'} />
                    </div>
                    <span className="text-xs font-medium flex-1">{label}</span>
                    {isSelected && <Check size={12} className="text-forest shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-linen mb-5" />

          {/* Widget toggles */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-mist uppercase tracking-wider mb-3">Sections</p>
            <div className="space-y-3">
              {WIDGET_DEFS.map(({ id, label, desc }) => {
                const isOn = prefs.widgets[id] ?? true;
                return (
                  <div key={id} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-ink font-medium">{label}</p>
                      <p className="text-xs text-mist">{desc}</p>
                    </div>
                    <button
                      onClick={() => savePrefs({ ...prefs, widgets: { ...prefs.widgets, [id]: !isOn } })}
                      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${isOn ? 'bg-forest' : 'bg-linen'}`}
                      role="switch"
                      aria-checked={isOn}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${isOn ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setCustomizing(false)}
            className="w-full bg-forest text-white text-sm py-2 rounded-lg hover:bg-deep transition-colors font-medium"
          >
            Done
          </button>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {activeCards.map(({ id, sectionId, icon: Icon, label, value, sub, color }) => (
          <button
            key={id}
            onClick={() => onSection(sectionId)}
            className="bg-white rounded-xl border border-linen p-4 text-left hover:shadow-md transition-shadow group"
          >
            <div className={`inline-flex p-2 rounded-lg ${color} text-white mb-3`}>
              <Icon size={18} />
            </div>
            <div className="text-xl font-bold text-ink group-hover:text-forest transition-colors">{value}</div>
            <div className="text-xs text-sage mt-0.5">{label} · {sub}</div>
          </button>
        ))}
      </div>

      {/* Timeline widget */}
      {prefs.widgets.timelineWidget && (
        <div className="bg-white rounded-xl border border-linen p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-ink">Timeline Progress</h2>
            <button onClick={() => onSection('timeline')} className="text-xs text-forest hover:underline flex items-center gap-1">
              View Timeline <ArrowRight size={11} />
            </button>
          </div>

          {totalMilestones === 0 ? (
            <div className="text-center py-4">
              <p className="text-xs text-mist mb-2">No milestones added yet.</p>
              <button onClick={() => onSection('timeline')} className="text-xs text-forest hover:underline">
                Set up your build timeline →
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-2 bg-linen rounded-full overflow-hidden">
                  <div className="h-full bg-forest rounded-full transition-all duration-500" style={{ width: `${timelinePct}%` }} />
                </div>
                <span className="text-xs text-mist shrink-0 w-16 text-right">{completedMilestones}/{totalMilestones} done</span>
              </div>

              {currentPhase && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-mist uppercase tracking-wider mb-1.5">Current Phase</p>
                  <div className="flex items-center gap-3 bg-forest/5 border border-forest/20 rounded-lg px-3 py-2.5">
                    <div className="w-2 h-2 rounded-full bg-forest shrink-0 animate-pulse" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{currentPhase.title}</p>
                      {(currentPhase.start || currentPhase.end) && (
                        <p className="text-xs text-mist">
                          {fmtDate(currentPhase.start)}
                          {currentPhase.end && currentPhase.end !== currentPhase.start ? ` → ${fmtDate(currentPhase.end)}` : ''}
                        </p>
                      )}
                    </div>
                    {typeof currentPhase.progress === 'number' && currentPhase.progress > 0 && (
                      <span className="text-xs text-forest font-medium shrink-0">{currentPhase.progress}%</span>
                    )}
                  </div>
                </div>
              )}

              {upcoming.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-mist uppercase tracking-wider mb-1.5">Up Next</p>
                  <div className="space-y-1.5">
                    {upcoming.map((m) => (
                      <div key={m.id} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-linen">
                        <div className="w-1.5 h-1.5 rounded-full bg-linen shrink-0" />
                        <p className="text-sm text-ink flex-1 truncate">{m.title}</p>
                        {m.start && <span className="text-xs text-mist shrink-0">{fmtDate(m.start)}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!currentPhase && upcoming.length === 0 && completedMilestones > 0 && (
                <div className="text-center py-2">
                  <p className="text-sm text-forest font-medium">🎉 All milestones complete!</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Quick nav */}
      {prefs.widgets.quickNav && (
        <>
          <h2 className="text-sm font-semibold text-mist uppercase tracking-wider mb-3">Jump To</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'design',     icon: Palette,    label: 'Home Design',  desc: 'Room-by-room wish list'      },
              { id: 'team',       icon: Users,      label: 'Team',         desc: 'Share with your builder'     },
              { id: 'checklists', icon: TrendingUp, label: 'Checklists',   desc: 'Land, permits, contractor'   },
            ].map(({ id, icon: Icon, label, desc }) => (
              <button
                key={id}
                onClick={() => onSection(id)}
                className="flex items-start gap-3 bg-white rounded-xl border border-linen p-4 text-left hover:shadow-md transition-shadow"
              >
                <Icon size={20} className="text-forest mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-ink">{label}</div>
                  <div className="text-xs text-mist">{desc}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Checklist progress */}
      {prefs.widgets.checklistProgress && totalChecks > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-linen p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-ink">Checklist Progress</span>
            <span className="text-sm text-sage">{Math.round((completedChecks / totalChecks) * 100)}%</span>
          </div>
          <div className="h-2 bg-linen rounded-full overflow-hidden">
            <div className="h-full bg-forest rounded-full transition-all duration-500" style={{ width: `${(completedChecks / totalChecks) * 100}%` }} />
          </div>
          <p className="text-xs text-mist mt-2">{completedChecks} of {totalChecks} checklist items complete</p>
        </div>
      )}
    </div>
  );
}
