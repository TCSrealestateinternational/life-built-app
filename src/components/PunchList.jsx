import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const TRADES = ['General', 'Framing', 'Electrical', 'Plumbing', 'HVAC', 'Insulation', 'Drywall', 'Flooring', 'Painting', 'Trim & Millwork', 'Cabinets', 'Tile', 'Roofing', 'Exterior', 'Landscaping', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const PRIORITY_STYLES = {
  High:   'bg-red-100 text-red-600 border-red-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Low:    'bg-outline-variant text-outline border-outline-variant',
};

function PunchItem({ item, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(!item.title);

  return (
    <div className={`rounded-3xl border overflow-hidden transition-colors ${item.done ? 'border-primary/20 bg-primary/5' : 'shadow-md border border-outline-variant/10'}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <input
          type="checkbox"
          checked={!!item.done}
          onChange={(e) => onUpdate({ done: e.target.checked })}
          className="accent-primary shrink-0"
        />
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={item.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Item description…"
            className={`w-full text-sm bg-transparent border-b border-transparent hover:border-outline-variant focus:border-primary focus:outline-none py-0.5 ${item.done ? 'line-through text-outline' : 'text-on-surface font-medium'}`}
          />
          <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-outline">
            <span className={`px-2 py-0.5 rounded-full border text-xs ${PRIORITY_STYLES[item.priority]}`}>
              {item.priority}
            </span>
            {item.trade && item.trade !== 'General' && <span>{item.trade}</span>}
            {item.room && <span>· {item.room}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => setExpanded(!expanded)} className="text-outline hover:text-on-surface transition-colors p-1">
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
          <button onClick={onRemove} className="text-red-300 hover:text-red-500 transition-colors p-1">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-outline-variant pt-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-outline mb-1 block">Room / Area</label>
              <input
                type="text"
                value={item.room}
                onChange={(e) => onUpdate({ room: e.target.value })}
                placeholder="e.g. Master Bath, Kitchen…"
                className="w-full text-sm border border-outline-variant rounded-xl px-3 py-1.5 bg-surface focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-outline mb-1 block">Trade</label>
              <select
                value={item.trade}
                onChange={(e) => onUpdate({ trade: e.target.value })}
                className="w-full text-sm border border-outline-variant rounded-xl px-3 py-1.5 bg-surface focus:outline-none focus:ring-1 focus:ring-primary/40"
              >
                {TRADES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-outline mb-1 block">Priority</label>
              <div className="flex gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    onClick={() => onUpdate({ priority: p })}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                      item.priority === p ? PRIORITY_STYLES[p] + ' font-semibold' : 'border-outline-variant text-outline hover:border-primary hover:text-primary'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-outline mb-1 block">Assigned To</label>
              <input
                type="text"
                value={item.assignedTo}
                onChange={(e) => onUpdate({ assignedTo: e.target.value })}
                placeholder="Contractor, builder…"
                className="w-full text-sm border border-outline-variant rounded-xl px-3 py-1.5 bg-surface focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-outline mb-1 block">Notes</label>
            <input
              type="text"
              value={item.notes}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              placeholder="Details, photo reference, deadline…"
              className="w-full text-sm border border-outline-variant rounded-xl px-3 py-1.5 bg-surface focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </div>
        </div>
      )}
    </div>
  );
}

const FILTER_TABS = ['All', 'Open', 'Done'];

export default function PunchList({ project, updateProject }) {
  const [filter, setFilter] = useState('Open');
  const [tradeFilter, setTradeFilter] = useState('All');
  const items = project?.punchList ?? [];

  function addItem() {
    updateProject({
      punchList: [
        ...items,
        {
          id: `punch_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          title: '',
          room: '',
          trade: 'General',
          priority: 'Medium',
          assignedTo: '',
          notes: '',
          done: false,
        },
      ],
    });
  }

  function updateItem(id, patch) {
    updateProject({ punchList: items.map((i) => (i.id === id ? { ...i, ...patch } : i)) });
  }

  function removeItem(id) {
    updateProject({ punchList: items.filter((i) => i.id !== id) });
  }

  const openCount = items.filter((i) => !i.done).length;
  const doneCount = items.filter((i) => i.done).length;

  const presentTrades = ['All', ...TRADES.filter((t) => items.some((i) => i.trade === t))];

  let filtered = filter === 'Open' ? items.filter((i) => !i.done)
    : filter === 'Done' ? items.filter((i) => i.done)
    : items;
  if (tradeFilter !== 'All') filtered = filtered.filter((i) => i.trade === tradeFilter);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface font-heading">
            Punch List
          </h1>
          <p className="text-on-surface-variant text-sm mt-0.5">
            Everything that needs to be fixed or finished before you close out the build.
          </p>
        </div>
        <button
          onClick={addItem}
          className="flex items-center gap-1.5 bg-primary text-on-primary text-sm px-4 py-2 rounded-xl hover:bg-primary-dim transition-colors shrink-0"
        >
          <Plus size={15} /> Add Item
        </button>
      </div>

      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="shadow-md border border-outline-variant/10 rounded-3xl p-4 text-center">
            <div className="text-xs text-outline mb-1">Total Items</div>
            <div className="text-xl font-bold text-on-surface">{items.length}</div>
          </div>
          <div className={`rounded-3xl border p-4 text-center ${openCount > 0 ? 'bg-amber-50 border-amber-200' : 'shadow-md border border-outline-variant/10'}`}>
            <div className="text-xs text-outline mb-1">Open</div>
            <div className={`text-xl font-bold ${openCount > 0 ? 'text-amber-700' : 'text-on-surface'}`}>{openCount}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-3xl p-4 text-center">
            <div className="text-xs text-outline mb-1">Complete</div>
            <div className="text-xl font-bold text-green-700">{doneCount}</div>
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                filter === tab ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
              }`}
            >
              {tab}
              <span className="ml-1 opacity-60">
                ({tab === 'All' ? items.length : tab === 'Open' ? openCount : doneCount})
              </span>
            </button>
          ))}
          {presentTrades.length > 2 && presentTrades.map((t) => t !== 'All' && (
            <button
              key={t}
              onClick={() => setTradeFilter(tradeFilter === t ? 'All' : t)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                tradeFilter === t ? 'bg-primary-dim text-on-primary border-primary-dim' : 'border-outline-variant text-outline hover:border-primary hover:text-primary'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16 text-outline">
          <div className="text-4xl mb-3">✅</div>
          <p className="font-medium">No punch list items yet</p>
          <p className="text-sm mt-1">Add items as you walk the site — everything that needs attention before closeout.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-outline text-sm">No {filter.toLowerCase()} items{tradeFilter !== 'All' ? ` for ${tradeFilter}` : ''}.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <PunchItem
              key={item.id}
              item={item}
              onUpdate={(patch) => updateItem(item.id, patch)}
              onRemove={() => removeItem(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
