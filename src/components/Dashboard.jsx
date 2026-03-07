import { MapPin, DollarSign, Calendar, CheckSquare, Palette, Users, TrendingUp } from 'lucide-react';

export default function Dashboard({ project, user, onSection }) {
  if (!project) return null;

  const completedChecks = Object.values(project.checklists)
    .flat()
    .filter((c) => c.done).length;
  const totalChecks = Object.values(project.checklists).flat().length;

  const budgetUsed = project.budget.items.reduce(
    (sum, item) => sum + (parseFloat(item.actual) || 0),
    0
  );
  const budgetPlanned = project.budget.items.reduce(
    (sum, item) => sum + (parseFloat(item.planned) || 0),
    0
  );

  const completedMilestones = project.timeline.milestones.filter((m) => m.done).length;

  const cards = [
    {
      id: 'properties',
      icon: MapPin,
      label: 'Properties',
      value: project.properties.length,
      sub: `${project.properties.filter((p) => p.evaluated).length} evaluated`,
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
      value: project.timeline.milestones.length,
      sub: `${completedMilestones} completed`,
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
        <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
          Your Planning Dashboard
        </h1>
        <p className="text-sage text-sm mt-1">Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}. Here's where your project stands.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

      {/* Progress bar */}
      {totalChecks > 0 && (
        <div className="mt-8 bg-white rounded-xl border border-linen p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-ink">Overall Progress</span>
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
