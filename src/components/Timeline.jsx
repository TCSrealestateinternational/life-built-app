import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';

function newMilestone() {
  return {
    id: Date.now(),
    title: '',
    targetDate: '',
    done: false,
    notes: '',
  };
}

const DEFAULT_MILESTONES = [
  { title: 'Find & evaluate land', targetDate: '' },
  { title: 'Make offer / go under contract', targetDate: '' },
  { title: 'Land survey & soil test', targetDate: '' },
  { title: 'Close on land', targetDate: '' },
  { title: 'Hire builder / GC', targetDate: '' },
  { title: 'Finalize floor plan', targetDate: '' },
  { title: 'Pull building permit', targetDate: '' },
  { title: 'Break ground', targetDate: '' },
  { title: 'Foundation complete', targetDate: '' },
  { title: 'Frame complete', targetDate: '' },
  { title: 'Rough-in inspections pass', targetDate: '' },
  { title: 'Drywall & finish work', targetDate: '' },
  { title: 'Final walkthrough & punch list', targetDate: '' },
  { title: 'Certificate of Occupancy', targetDate: '' },
  { title: 'Move in! 🎉', targetDate: '' },
];

export default function Timeline({ project, updateProject }) {
  const milestones = project?.timeline?.milestones ?? [];

  function addMilestone() {
    updateProject({ timeline: { milestones: [...milestones, newMilestone()] } });
  }

  function loadDefaults() {
    if (milestones.length > 0 && !confirm('This will add the default milestones to your list. Continue?')) return;
    const defaults = DEFAULT_MILESTONES.map((m) => ({ ...newMilestone(), ...m, id: Date.now() + Math.random() }));
    updateProject({ timeline: { milestones: [...milestones, ...defaults] } });
  }

  function updateMilestone(id, patch) {
    updateProject({
      timeline: { milestones: milestones.map((m) => (m.id === id ? { ...m, ...patch } : m)) },
    });
  }

  function removeMilestone(id) {
    updateProject({ timeline: { milestones: milestones.filter((m) => m.id !== id) } });
  }

  const done = milestones.filter((m) => m.done).length;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Timeline
          </h1>
          <p className="text-sage text-sm mt-0.5">Track milestones from land to move-in day.</p>
        </div>
        <div className="flex gap-2">
          {milestones.length === 0 && (
            <button
              onClick={loadDefaults}
              className="text-sm text-forest border border-forest/30 px-3 py-2 rounded-lg hover:bg-forest/5 transition-colors"
            >
              Load defaults
            </button>
          )}
          <button
            onClick={addMilestone}
            className="flex items-center gap-1.5 bg-forest text-white text-sm px-4 py-2 rounded-lg hover:bg-deep transition-colors"
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {milestones.length > 0 && (
        <div className="mb-4 flex items-center gap-3">
          <div className="flex-1 h-2 bg-linen rounded-full overflow-hidden">
            <div
              className="h-full bg-forest rounded-full transition-all"
              style={{ width: milestones.length > 0 ? `${(done / milestones.length) * 100}%` : '0%' }}
            />
          </div>
          <span className="text-xs text-mist shrink-0">{done}/{milestones.length}</span>
        </div>
      )}

      {milestones.length === 0 ? (
        <div className="text-center py-16 text-mist">
          <div className="text-4xl mb-3">📅</div>
          <p className="font-medium">No milestones yet</p>
          <p className="text-sm mt-1">
            <button onClick={loadDefaults} className="text-forest hover:underline">Load the default land-to-build timeline</button>
            {' '}or add your own.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {milestones.map((m, idx) => (
            <div
              key={m.id}
              className={`bg-white rounded-xl border p-4 transition-all ${m.done ? 'border-forest/30 bg-forest/5' : 'border-linen'}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex items-center gap-1 shrink-0 mt-0.5">
                  <span className="text-xs text-mist w-5 text-right">{idx + 1}</span>
                  <input
                    type="checkbox"
                    checked={m.done}
                    onChange={(e) => updateMilestone(m.id, { done: e.target.checked })}
                    className="accent-forest ml-1"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <input
                    type="text"
                    value={m.title}
                    onChange={(e) => updateMilestone(m.id, { title: e.target.value })}
                    placeholder="Milestone title…"
                    className={`w-full text-sm font-medium bg-transparent border-b border-transparent hover:border-linen focus:border-forest focus:outline-none py-0.5 ${m.done ? 'line-through text-mist' : 'text-ink'}`}
                  />
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs text-mist">Target:</label>
                      <input
                        type="date"
                        value={m.targetDate}
                        onChange={(e) => updateMilestone(m.id, { targetDate: e.target.value })}
                        className="text-xs border border-linen rounded px-2 py-0.5 bg-cream focus:outline-none focus:ring-1 focus:ring-forest/40"
                      />
                    </div>
                  </div>
                  {m.notes !== undefined && (
                    <input
                      type="text"
                      value={m.notes}
                      onChange={(e) => updateMilestone(m.id, { notes: e.target.value })}
                      placeholder="Notes (optional)…"
                      className="w-full text-xs text-mist bg-transparent border-b border-transparent hover:border-linen focus:border-forest focus:outline-none py-0.5"
                    />
                  )}
                </div>
                <button
                  onClick={() => removeMilestone(m.id)}
                  className="text-red-300 hover:text-red-500 transition-colors shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
