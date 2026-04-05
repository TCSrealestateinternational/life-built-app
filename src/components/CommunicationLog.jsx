import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Bell } from 'lucide-react';

const ENTRY_TYPES = ['Decision', 'Communication', 'Agreement', 'Issue', 'Change Request', 'Other'];

const TYPE_STYLES = {
  Decision:         'bg-blue-100 text-blue-700 border-blue-200',
  Communication:    'bg-linen text-mist border-linen',
  Agreement:        'bg-green-100 text-green-700 border-green-200',
  Issue:            'bg-red-100 text-red-600 border-red-200',
  'Change Request': 'bg-amber-100 text-amber-700 border-amber-200',
  Other:            'bg-linen text-mist border-linen',
};

function formatDate(d) {
  if (!d) return '';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtTs(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Log Entry ─────────────────────────────────────────────────────────────────

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
          {entry.addedBy && (
            <p className="text-xs text-sage">Added by {entry.addedBy.name} · {fmtTs(entry.addedBy.at)}</p>
          )}
          {(entry.teamNotes ?? []).map((n) => (
            <div key={n.id} className="mt-1 pl-3 border-l-2 border-linen text-xs text-mist">
              <span className="font-medium text-ink">{n.by}:</span> {n.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── To-Do Item ────────────────────────────────────────────────────────────────

const TODAY = new Date().toISOString().split('T')[0];

function TodoItem({ todo, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  const overdue = !todo.done && todo.dueDate && todo.dueDate < TODAY;

  return (
    <div className={`rounded-xl border overflow-hidden transition-colors ${todo.done ? 'border-forest/20 bg-forest/5' : 'bg-white border-linen'}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <input
          type="checkbox"
          checked={!!todo.done}
          onChange={(e) => onUpdate({ done: e.target.checked })}
          className="accent-forest shrink-0"
        />
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={todo.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            placeholder="To-do item…"
            className={`w-full text-sm bg-transparent border-b border-transparent hover:border-linen focus:border-forest focus:outline-none py-0.5 ${
              todo.done ? 'line-through text-mist' : 'text-ink font-medium'
            }`}
          />
          <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs">
            {todo.critical && (
              <span className="flex items-center gap-0.5 text-red-500 font-semibold">
                <Bell size={10} fill="currentColor" /> Critical
              </span>
            )}
            {todo.assignedTo && <span className="text-mist">{todo.assignedTo}</span>}
            {todo.dueDate && (
              <span className={overdue ? 'text-red-500 font-medium' : 'text-mist'}>
                {overdue ? '⚠ ' : ''}Due {formatDate(todo.dueDate)}
              </span>
            )}
            {todo.completedBy && (
              <span className="text-sage ml-2">Completed by {todo.completedBy.name}</span>
            )}
            {todo.createdBy && !todo.done && (
              <span className="text-sage ml-2">Added by {todo.createdBy.name}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onUpdate({ critical: !todo.critical })}
            title={todo.critical ? 'Remove critical flag' : 'Mark as critical'}
            className={`p-1 transition-colors ${todo.critical ? 'text-red-500' : 'text-mist hover:text-red-400'}`}
          >
            <Bell size={15} fill={todo.critical ? 'currentColor' : 'none'} />
          </button>
          <button onClick={() => setExpanded(!expanded)} className="text-mist hover:text-ink transition-colors p-1">
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
          <button onClick={onRemove} className="text-red-300 hover:text-red-500 transition-colors p-1">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-linen pt-3 grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-mist mb-1 block">Due Date</label>
            <input
              type="date"
              value={todo.dueDate}
              onChange={(e) => onUpdate({ dueDate: e.target.value })}
              className="w-full text-sm border border-linen rounded-lg px-3 py-1.5 bg-cream focus:outline-none focus:ring-1 focus:ring-forest/40"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-mist mb-1 block">Assigned To</label>
            <input
              type="text"
              value={todo.assignedTo}
              onChange={(e) => onUpdate({ assignedTo: e.target.value })}
              placeholder="Name or role…"
              className="w-full text-sm border border-linen rounded-lg px-3 py-1.5 bg-cream focus:outline-none focus:ring-1 focus:ring-forest/40"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const LOG_FILTER_TABS = ['All', ...ENTRY_TYPES];

export default function CommunicationLog({ project, updateProject }) {
  const [view, setView] = useState('log');
  const [filter, setFilter] = useState('All');

  const entries = project?.communicationLog ?? [];
  const todos = project?.todos ?? [];

  // Log actions
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

  // Todo actions
  function addTodo() {
    updateProject({
      todos: [
        ...todos,
        {
          id: `todo_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          text: '',
          done: false,
          dueDate: '',
          assignedTo: '',
        },
      ],
    });
  }

  function updateTodo(id, patch) {
    updateProject({ todos: todos.map((t) => (t.id === id ? { ...t, ...patch } : t)) });
  }

  function removeTodo(id) {
    updateProject({ todos: todos.filter((t) => t.id !== id) });
  }

  // Log derived
  const presentFilters = LOG_FILTER_TABS.filter((f) => f === 'All' || entries.some((e) => e.type === f));
  const filtered = filter === 'All' ? entries : entries.filter((e) => e.type === filter);
  const sorted = [...filtered].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  // Todo derived
  const openTodos = todos.filter((t) => !t.done);
  const doneTodos = todos.filter((t) => t.done);
  const overdueTodos = openTodos.filter((t) => t.dueDate && t.dueDate < TODAY);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Communication Log
          </h1>
          <p className="text-sage text-sm mt-0.5">
            Track every decision and conversation — and the action items that come out of them.
          </p>
        </div>
        <button
          onClick={view === 'log' ? addEntry : addTodo}
          className="flex items-center gap-1.5 bg-forest text-white text-sm px-4 py-2 rounded-lg hover:bg-deep transition-colors shrink-0"
        >
          <Plus size={15} /> {view === 'log' ? 'Add Entry' : 'Add To-Do'}
        </button>
      </div>

      {/* Tab switcher */}
      <div className="flex bg-linen/50 p-1 rounded-xl mb-5 w-fit">
        <button
          onClick={() => setView('log')}
          className={`text-sm px-4 py-1.5 rounded-lg transition-colors ${view === 'log' ? 'bg-white text-ink shadow-sm font-medium' : 'text-mist hover:text-ink'}`}
        >
          💬 Log
          {entries.length > 0 && <span className="ml-1.5 text-xs text-mist">({entries.length})</span>}
        </button>
        <button
          onClick={() => setView('todos')}
          className={`text-sm px-4 py-1.5 rounded-lg transition-colors ${view === 'todos' ? 'bg-white text-ink shadow-sm font-medium' : 'text-mist hover:text-ink'}`}
        >
          ✅ To-Dos
          {openTodos.length > 0 && (
            <span className={`ml-1.5 text-xs font-semibold ${overdueTodos.length > 0 ? 'text-red-500' : 'text-forest'}`}>
              ({openTodos.length} open)
            </span>
          )}
        </button>
      </div>

      {/* ── Log view ── */}
      {view === 'log' && (
        <>
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
            <div data-tour="comms-log-entries" className="space-y-2">
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
        </>
      )}

      {/* ── To-Dos view ── */}
      {view === 'todos' && (
        <>
          {todos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <div className={`rounded-xl border p-4 text-center ${openTodos.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-linen'}`}>
                <div className="text-xs text-mist mb-1">Open</div>
                <div className={`text-xl font-bold ${openTodos.length > 0 ? 'text-amber-700' : 'text-ink'}`}>{openTodos.length}</div>
              </div>
              <div className={`rounded-xl border p-4 text-center ${overdueTodos.length > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-linen'}`}>
                <div className="text-xs text-mist mb-1">Overdue</div>
                <div className={`text-xl font-bold ${overdueTodos.length > 0 ? 'text-red-600' : 'text-ink'}`}>{overdueTodos.length}</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <div className="text-xs text-mist mb-1">Done</div>
                <div className="text-xl font-bold text-green-700">{doneTodos.length}</div>
              </div>
            </div>
          )}

          {todos.length === 0 ? (
            <div className="text-center py-16 text-mist">
              <div className="text-4xl mb-3">✅</div>
              <p className="font-medium">No to-dos yet</p>
              <p className="text-sm mt-1">Add action items that come out of your conversations and decisions.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Open items first */}
              {openTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onUpdate={(patch) => updateTodo(todo.id, patch)}
                  onRemove={() => removeTodo(todo.id)}
                />
              ))}
              {/* Completed items below, slightly muted */}
              {doneTodos.length > 0 && openTodos.length > 0 && (
                <div className="pt-2 pb-1 text-xs text-mist pl-1">Completed</div>
              )}
              {doneTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onUpdate={(patch) => updateTodo(todo.id, patch)}
                  onRemove={() => removeTodo(todo.id)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
