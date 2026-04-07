import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Check, X } from 'lucide-react';

const STATUS_STYLES = {
  pending:  { badge: 'bg-amber-100 text-amber-700 border-amber-200',  dot: 'bg-amber-400' },
  approved: { badge: 'bg-green-100 text-green-700 border-green-200',  dot: 'bg-green-500' },
  rejected: { badge: 'bg-red-100  text-red-500   border-red-200',     dot: 'bg-red-400'   },
};

function fmt(amount) {
  const n = parseFloat(amount);
  if (isNaN(n) || amount === '') return '—';
  const abs = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return `${n < 0 ? '−' : '+'}$${abs}`;
}

function fmtTotal(n) {
  const abs = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return `${n < 0 ? '−' : n > 0 ? '+' : ''}$${abs}`;
}

function ChangeOrderRow({ co, milestones, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(!co.title);
  const styles = STATUS_STYLES[co.status] ?? STATUS_STYLES.pending;

  return (
    <div className="bg-surface-container-lowest shadow-md border border-outline-variant/10 rounded-3xl overflow-hidden">
      {/* Collapsed row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <span className={`w-2 h-2 rounded-full shrink-0 ${styles.dot}`} />
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={co.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Change order title…"
            className="w-full text-sm font-medium bg-transparent border-b border-transparent hover:border-outline-variant focus:border-primary focus:outline-none py-0.5 text-on-surface"
          />
          <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-outline">
            <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${styles.badge}`}>
              {co.status.charAt(0).toUpperCase() + co.status.slice(1)}
            </span>
            {co.phase && <span>{co.phase}</span>}
            {co.date && <span>{co.date}</span>}
          </div>
        </div>
        <div className="shrink-0 text-sm font-semibold text-right min-w-[60px]">
          {co.amount !== '' && co.amount !== undefined
            ? <span className={parseFloat(co.amount) < 0 ? 'text-green-700' : 'text-red-600'}>{fmt(co.amount)}</span>
            : <span className="text-outline font-normal">—</span>}
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-1">
          {co.status !== 'approved' && (
            <button
              onClick={() => onUpdate({ status: 'approved' })}
              title="Approve"
              className="text-green-400 hover:text-green-600 transition-colors p-1"
            >
              <Check size={15} />
            </button>
          )}
          {co.status !== 'rejected' && (
            <button
              onClick={() => onUpdate({ status: 'rejected' })}
              title="Reject"
              className="text-red-300 hover:text-red-500 transition-colors p-1"
            >
              <X size={15} />
            </button>
          )}
          {(co.status === 'approved' || co.status === 'rejected') && (
            <button
              onClick={() => onUpdate({ status: 'pending' })}
              title="Reset to Pending"
              className="text-amber-300 hover:text-amber-500 transition-colors p-1 text-xs font-bold leading-none"
            >
              ↺
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-outline hover:text-on-surface transition-colors p-1"
            title="Edit details"
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
          <button
            onClick={onRemove}
            className="text-red-300 hover:text-red-500 transition-colors p-1"
            title="Remove"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-outline-variant pt-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-outline mb-1 block">Date Requested</label>
              <input
                type="date"
                value={co.date}
                onChange={(e) => onUpdate({ date: e.target.value })}
                className="w-full text-sm border border-outline-variant rounded-xl px-3 py-1.5 bg-surface focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-outline mb-1 block">Cost Impact ($)</label>
              <input
                type="number"
                value={co.amount}
                onChange={(e) => onUpdate({ amount: e.target.value })}
                placeholder="0 (negative = credit)"
                className="w-full text-sm border border-outline-variant rounded-xl px-3 py-1.5 bg-surface focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-outline mb-1 block">Phase / Milestone</label>
              {milestones.length > 0 ? (
                <select
                  value={co.phase}
                  onChange={(e) => onUpdate({ phase: e.target.value })}
                  className="w-full text-sm border border-outline-variant rounded-xl px-3 py-1.5 bg-surface focus:outline-none focus:ring-1 focus:ring-primary/40"
                >
                  <option value="">— select phase —</option>
                  {milestones.map((m) => (
                    <option key={m.title} value={m.title}>{m.title}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={co.phase}
                  onChange={(e) => onUpdate({ phase: e.target.value })}
                  placeholder="e.g. Framing, Electrical…"
                  className="w-full text-sm border border-outline-variant rounded-xl px-3 py-1.5 bg-surface focus:outline-none focus:ring-1 focus:ring-primary/40"
                />
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-outline mb-1 block">Requested By</label>
              <input
                type="text"
                value={co.requestedBy}
                onChange={(e) => onUpdate({ requestedBy: e.target.value })}
                placeholder="e.g. Client, Builder name…"
                className="w-full text-sm border border-outline-variant rounded-xl px-3 py-1.5 bg-surface focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-outline mb-1 block">Description</label>
            <textarea
              value={co.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="What changed and why…"
              rows={2}
              className="w-full text-sm border border-outline-variant rounded-xl px-3 py-1.5 bg-surface focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-outline mb-1 block">Notes</label>
            <input
              type="text"
              value={co.notes}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              placeholder="Additional context, references…"
              className="w-full text-sm border border-outline-variant rounded-xl px-3 py-1.5 bg-surface focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-outline mb-1 block">Status</label>
            <div className="flex gap-2">
              {['pending', 'approved', 'rejected'].map((s) => (
                <button
                  key={s}
                  onClick={() => onUpdate({ status: s })}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    co.status === s
                      ? STATUS_STYLES[s].badge + ' font-semibold'
                      : 'border-outline-variant text-outline hover:border-primary hover:text-primary'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const FILTER_TABS = ['All', 'Pending', 'Approved', 'Rejected'];

export default function ChangeOrders({ project, updateProject }) {
  const [filter, setFilter] = useState('All');
  const changeOrders = project?.changeOrders ?? [];
  const milestones = project?.timeline?.milestones ?? [];

  function addChangeOrder() {
    const co = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      title: '',
      description: '',
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      phase: '',
      requestedBy: '',
      amount: '',
      notes: '',
    };
    updateProject({ changeOrders: [...changeOrders, co] });
  }

  function updateChangeOrder(id, patch) {
    updateProject({
      changeOrders: changeOrders.map((co) => (co.id === id ? { ...co, ...patch } : co)),
    });
  }

  function removeChangeOrder(id) {
    updateProject({ changeOrders: changeOrders.filter((co) => co.id !== id) });
  }

  const approvedTotal = changeOrders
    .filter((co) => co.status === 'approved')
    .reduce((sum, co) => sum + (parseFloat(co.amount) || 0), 0);

  const pendingTotal = changeOrders
    .filter((co) => co.status === 'pending')
    .reduce((sum, co) => sum + (parseFloat(co.amount) || 0), 0);

  const filterLower = filter.toLowerCase();
  const filtered = filterLower === 'all' ? changeOrders : changeOrders.filter((co) => co.status === filterLower);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface font-heading">
            Change Orders
          </h1>
          <p className="text-on-surface-variant text-sm mt-0.5">
            Track every unplanned cost change — who requested it, what it costs, and whether it's approved.
          </p>
        </div>
        <button
          onClick={addChangeOrder}
          className="flex items-center gap-1.5 bg-primary text-on-primary text-sm px-4 py-2 rounded-xl hover:bg-primary-dim transition-colors shrink-0"
        >
          <Plus size={15} /> Add Change Order
        </button>
      </div>

      {/* Summary bar */}
      {changeOrders.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-surface-container-lowest shadow-md border border-green-200/10 rounded-3xl p-6 text-center">
            <div className="text-xs text-outline mb-1">Approved Impact</div>
            <div className={`text-xl font-bold ${approvedTotal < 0 ? 'text-green-700' : approvedTotal > 0 ? 'text-red-600' : 'text-on-surface'}`}>
              {approvedTotal !== 0 ? fmtTotal(approvedTotal) : '—'}
            </div>
            <div className="text-xs text-outline mt-0.5">
              {changeOrders.filter((co) => co.status === 'approved').length} approved
            </div>
          </div>
          <div className="bg-surface-container-lowest shadow-md border border-amber-200/10 rounded-3xl p-6 text-center">
            <div className="text-xs text-outline mb-1">Pending Impact</div>
            <div className={`text-xl font-bold ${pendingTotal < 0 ? 'text-green-700' : pendingTotal > 0 ? 'text-amber-600' : 'text-on-surface'}`}>
              {pendingTotal !== 0 ? fmtTotal(pendingTotal) : '—'}
            </div>
            <div className="text-xs text-outline mt-0.5">
              {changeOrders.filter((co) => co.status === 'pending').length} pending
            </div>
          </div>
          <div className="bg-surface-container-lowest shadow-md border border-outline-variant/10 rounded-3xl p-6 text-center">
            <div className="text-xs text-outline mb-1">Total Orders</div>
            <div className="text-xl font-bold text-on-surface">{changeOrders.length}</div>
            <div className="text-xs text-outline mt-0.5">
              {changeOrders.filter((co) => co.status === 'rejected').length} rejected
            </div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      {changeOrders.length > 0 && (
        <div className="flex gap-1.5 mb-4 flex-wrap">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                filter === tab
                  ? 'bg-primary text-on-primary border-primary'
                  : 'border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
              }`}
            >
              {tab}
              {tab !== 'All' && (
                <span className="ml-1 opacity-60">
                  ({changeOrders.filter((co) => co.status === tab.toLowerCase()).length})
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {changeOrders.length === 0 ? (
        <div className="text-center py-16 text-outline">
          <div className="text-4xl mb-3">📋</div>
          <p className="font-medium">No change orders yet</p>
          <p className="text-sm mt-1">Add one whenever a cost change comes up — before or after approval.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-outline text-sm">
          No {filter.toLowerCase()} change orders.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((co) => (
            <ChangeOrderRow
              key={co.id}
              co={co}
              milestones={milestones}
              onUpdate={(patch) => updateChangeOrder(co.id, patch)}
              onRemove={() => removeChangeOrder(co.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
