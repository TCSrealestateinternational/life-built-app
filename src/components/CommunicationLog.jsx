import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const ENTRY_TYPES = ['Decision', 'Communication', 'Agreement', 'Issue', 'Change Request', 'Other'];

const TYPE_STYLES = {
  Decision:       'bg-blue-100 text-blue-700 border-blue-200',
  Communication:  'bg-linen text-mist border-linen',
  Agreement:      'bg-green-100 text-green-700 border-green-200',
  Issue:          'bg-red-100 text-red-600 border-red-200',
  'Change Request': 'bg-amber-100 text-amber-700 border-amber-200',
  Other:          'bg-linen text-mist border-linen',
};

function formatDate(d) {
  if (!d) return '';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function LogEntry({ entry, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(!entry.title);
  const typeStyle = TYPE_STYLES[entry.type] ?? TYPE_STYLES.Other;

  return (
    <div className="bg-white border border-linen rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={entry.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Summary / subject…"
            className="w-full text-sm font-medium bg-transparent border-b border-transparent hover:border-linen focus:border-forest focus:outline-none py-0.5 text-ink"
          />
          <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-mist">
            <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${typeStyle}`}>{entry.type}</span>
            {entry.date && <span>{formatDate(entry.date)}</span>}
            {entry.parties && <span>· {entry.parties}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => setExpanded(!expanded)} className="text-mist hover:text-ink transition-colors p-1">
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
          <button onClick={onRemove} className="text-red-300 hover:text-red-500 transition-colors p-1">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-linen pt-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-mist mb-1 block">Date</label>
              <input
                type="date"
                value={entry.date}
                onChange={(e) => onUpdate({ date: e.target.value })}
                className="w-full text-sm border border-linen rounded-lg px-3 py-1.5 bg-cream focus:outline-none focus:ring-1 focus:ring-forest/40"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-mist mb-1 block">Type</label>
              <select
                value={entry.type}
                onChange={(e) => onUpdate({ type: e.target.value })}
                className="w-full text-sm border border-linen rounded-lg px-3 py-1.5 bg-cream focus:outline-none focus:ring-1 focus:ring-forest/40"
              >
                {ENTRY_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-mist mb-1 block">Parties Involved</label>
            <input
              type="text"
              value={entry.parties}
              onChange={(e) => onUpdate({ parties: e.target.value })}
              placeholder="e.g. Toni, Builder Bob, Lender…"
              className="w-full text-sm border border-linen rounded-lg px-3 py-1.5 bg-cream focus:outline-none focus:ring-1 focus:ring-forest/40"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-mist mb-1 block">Description</label>
            <textarea
              value={entry.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="What was discussed, decided, or agreed upon…"
              rows={3}
              className="w-full text-sm border border-linen rounded-lg px-3 py-1.5 bg-cream focus:outline-none focus:ring-1 focus:ring-forest/40 resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-mist mb-1 block">Outcome / Action Required</label>
            <input
              type="text"
              value={entry.outcome}
              onChange={(e) => onUpdate({ outcome: e.target.value })}
              placeholder="What happens next, who owes what…"
              className="w-full text-sm border border-linen rounded-lg px-3 py-1.5 bg-cream focus:outline-none focus:ring-1 focus:ring-forest/40"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-mist mb-1 block">Notes / Reference</label>
            <input
              type="text"
              value={entry.notes}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              placeholder="Email thread, text, doc link…"
              className="w-full text-sm border border-linen rounded-lg px-3 py-1.5 bg-cream focus:outline-none focus:ring-1 focus:ring-forest/40"
            />
          </div>
        </div>
      )}
    </div>
  );
}

const FILTER_TABS = ['All', ...ENTRY_TYPES];

export default function CommunicationLog({ project, updateProject }) {
  const [filter, setFilter] = useState('All');
  const entries = project?.communicationLog ?? [];

  function addEntry() {
    updateProject({
      communicationLog: [
        ...entries,
        {
          id: `log_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          title: '',
          date: new Date().toISOString().split('T')[0],
          type: 'Communication',
          parties: '',
          description: '',
          outcome: '',
          notes: '',
        },
      ],
    });
  }

  function updateEntry(id, patch) {
    updateProject({ communicationLog: entries.map((e) => (e.id === id ? { ...e, ...patch } : e)) });
  }

  function removeEntry(id) {
    updateProject({ communicationLog: entries.filter((e) => e.id !== id) });
  }

  const presentFilters = FILTER_TABS.filter((f) => f === 'All' || entries.some((e) => e.type === f));
  const filtered = filter === 'All' ? entries : entries.filter((e) => e.type === filter);
  // Sort newest first
  const sorted = [...filtered].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Communication Log
          </h1>
          <p className="text-sage text-sm mt-0.5">
            Every important decision, conversation, and agreement — with who was involved and what was decided.
          </p>
        </div>
        <button
          onClick={addEntry}
          className="flex items-center gap-1.5 bg-forest text-white text-sm px-4 py-2 rounded-lg hover:bg-deep transition-colors shrink-0"
        >
          <Plus size={15} /> Add Entry
        </button>
      </div>

      {entries.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {presentFilters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                filter === f ? 'bg-forest text-white border-forest' : 'border-linen text-sage hover:border-forest hover:text-forest'
              }`}
            >
              {f}
              <span className="ml-1 opacity-60">
                ({f === 'All' ? entries.length : entries.filter((e) => e.type === f).length})
              </span>
            </button>
          ))}
        </div>
      )}

      {entries.length === 0 ? (
        <div className="text-center py-16 text-mist">
          <div className="text-4xl mb-3">💬</div>
          <p className="font-medium">No log entries yet</p>
          <p className="text-sm mt-1">Log every key decision and conversation as it happens — it's your paper trail.</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-12 text-mist text-sm">No {filter.toLowerCase()} entries.</div>
      ) : (
        <div className="space-y-2">
          {sorted.map((entry) => (
            <LogEntry
              key={entry.id}
              entry={entry}
              onUpdate={(patch) => updateEntry(entry.id, patch)}
              onRemove={() => removeEntry(entry.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
