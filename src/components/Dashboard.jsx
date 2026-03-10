import { MapPin, DollarSign, Calendar, CheckSquare, Palette, Users, TrendingUp, ArrowRight } from 'lucide-react';

const TODAY = new Date().toISOString().slice(0, 10);

function fmtDate(d) {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m,10)-1]} ${parseInt(day,10)}`;
}

// Normalize old milestone format to ensure start/end fields exist
function normalizeMilestone(m) {
  const start = m.start || m.targetDate || '';
  return { ...m, start, end: m.end || start };
}

export default function Dashboard({ project, user, onSection }) {
  if (!project) return null;

  // ── Checklists (skip punch list entries which are arrays of IDs) ───────────
  const checklistEntries = Object.entries(project.checklists ?? {}).filter(
    ([k]) => k !== 'punchList' && k !== 'punchListCustom'
  );
  const completedChecks = checklistEntries.flatMap(([, v]) => v).filter((c) => c.done).length;
  const totalChecks = checklistEntries.flatMap(([, v]) => v).length;

  // ── Budget ─────────────────────────────────────────────────────────────────
  const budgetUsed = (project.budget?.items ?? []).reduce(
    (sum, item) => sum + (parseFloat(item.actual) || 0), 0
  );
  const budgetPlanned = (project.budget?.items ?? []).reduce(
    (sum, item) => sum + (parseFloat(item.planned) || 0), 0
  );

  // ── Timeline ───────────────────────────────────────────────────────────────
  const allMilestones = (project.timeline?.milestones ?? []).map(normalizeMilestone);
  const completedMilestones = allMilestones.filter((m) => m.done).length;
  const totalMilestones = allMilestones.length;

  // Sort by start date for upcoming widget
  const sorted = [...allMilestones].sort((a, b) => (a.start || '').localeCompare(b.start || ''));

  // Current: started (start <= today) and not done
  const currentPhase = sorted.find((m) => !m.done && m.start && m.start <= TODAY);

  // Upcoming: not done, start > today (or no date), excluding current
  const upcoming = sorted
    .filter((m) => !m.done && m !== currentPhase)
    .slice(0, currentPhase ? 2 : 3);

  const hasMilestones = totalMilestones > 0;
  const timelinePct = totalMilestones > 0
    ? Math.round((completedMilestones / totalMilestones) * 100)
    : 0;

  // ── Stat cards ─────────────────────────────────────────────────────────────
  const cards = [
    {
      id: 'properties',
      icon: MapPin,
      label: 'Properties',
      value: (project.properties ?? []).length,
      sub: `${(project.properties ?? []).filter((p) => p.evaluated).length} evaluated`,
      color: 'bg-forest',
    },
    {
      id: 'budget',
      icon: DollarSign,
      label: 'Budget',
      value: budgetPlanned > 0 ? `$${budgetPlanned.toLocaleString()}` : '—',
      sub: budgetUsed > 0 ? `$${budgetUsed.toLocaleString()} spent` : 'Nothing logged yet',
      color: 'bg-deep',
    },
    {
      id: 'timeline',
      icon: Calendar,
      label: 'Timeline',
      value: totalMilestones > 0 ? `${completedMilestones}/${totalMilestones}` : '—',
      sub: totalMilestones > 0 ? `${timelinePct}% complete` : 'No milestones yet',
      color: 'bg-sage',
    },
    {
      id: 'checklists',
      icon: CheckSquare,
      label: 'Checklists',
      value: `${completedChecks}/${totalChecks}`,
      sub: 'tasks done',
      color: 'bg-mist',
    },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1
          className="text-2xl font-bold text-ink"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
        >
          Your Planning Dashboard
        </h1>
        <p className="text-sage text-sm mt-1">
          Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}. Here's where your project stands.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map(({ id, icon: Icon, label, value, sub, color }) => (
          <button
            key={id}
            onClick={() => onSection(id)}
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
      <div className="bg-white rounded-xl border border-linen p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-ink">Timeline Progress</h2>
          <button
            onClick={() => onSection('timeline')}
            className="text-xs text-forest hover:underline flex items-center gap-1"
          >
            View Timeline <ArrowRight size={11} />
          </button>
        </div>

        {!hasMilestones ? (
          <div className="text-center py-4">
            <p className="text-xs text-mist mb-2">No milestones added yet.</p>
            <button
              onClick={() => onSection('timeline')}
              className="text-xs text-forest hover:underline"
            >
              Set up your build timeline →
            </button>
          </div>
        ) : (
          <>
            {/* Progress bar */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-2 bg-linen rounded-full overflow-hidden">
                <div
                  className="h-full bg-forest rounded-full transition-all duration-500"
                  style={{ width: `${timelinePct}%` }}
                />
              </div>
              <span className="text-xs text-mist shrink-0 w-16 text-right">
                {completedMilestones}/{totalMilestones} done
              </span>
            </div>

            {/* Current phase */}
            {currentPhase && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-mist uppercase tracking-wider mb-1.5">
                  Current Phase
                </p>
                <div className="flex items-center gap-3 bg-forest/5 border border-forest/20 rounded-lg px-3 py-2.5">
                  <div className="w-2 h-2 rounded-full bg-forest shrink-0 animate-pulse" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{currentPhase.title}</p>
                    {(currentPhase.start || currentPhase.end) && (
                      <p className="text-xs text-mist">
                        {fmtDate(currentPhase.start)}
                        {currentPhase.end && currentPhase.end !== currentPhase.start
                          ? ` → ${fmtDate(currentPhase.end)}`
                          : ''}
                      </p>
                    )}
                  </div>
                  {typeof currentPhase.progress === 'number' && currentPhase.progress > 0 && (
                    <span className="text-xs text-forest font-medium shrink-0">
                      {currentPhase.progress}%
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-mist uppercase tracking-wider mb-1.5">
                  Up Next
                </p>
                <div className="space-y-1.5">
                  {upcoming.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg border border-linen"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-linen shrink-0" />
                      <p className="text-sm text-ink flex-1 truncate">{m.title}</p>
                      {m.start && (
                        <span className="text-xs text-mist shrink-0">{fmtDate(m.start)}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All done state */}
            {!currentPhase && upcoming.length === 0 && completedMilestones > 0 && (
              <div className="text-center py-2">
                <p className="text-sm text-forest font-medium">🎉 All milestones complete!</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Quick nav tiles */}
      <h2 className="text-sm font-semibold text-mist uppercase tracking-wider mb-3">Jump To</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { id: 'design', icon: Palette, label: 'Home Design', desc: 'Room-by-room wish list' },
          { id: 'team', icon: Users, label: 'Team', desc: 'Share with your builder' },
          { id: 'checklists', icon: TrendingUp, label: 'Checklists', desc: 'Land, permits, contractor' },
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

      {/* Overall progress bar */}
      {totalChecks > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-linen p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-ink">Checklist Progress</span>
            <span className="text-sm text-sage">{Math.round((completedChecks / totalChecks) * 100)}%</span>
          </div>
          <div className="h-2 bg-linen rounded-full overflow-hidden">
            <div
              className="h-full bg-forest rounded-full transition-all duration-500"
              style={{ width: `${(completedChecks / totalChecks) * 100}%` }}
            />
          </div>
          <p className="text-xs text-mist mt-2">{completedChecks} of {totalChecks} checklist items complete</p>
        </div>
      )}
    </div>
  );
}
