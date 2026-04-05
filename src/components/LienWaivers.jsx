import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

// Lien waiver types: conditional = waiver contingent on payment clearing; unconditional = payment confirmed
const WAIVER_TYPES = [
  'Conditional Partial',
  'Unconditional Partial',
  'Conditional Final',
  'Unconditional Final',
];

const TYPE_DESCRIPTIONS = {
  'Conditional Partial':   'Waives lien rights for payments received to date, once payment clears',
  'Unconditional Partial': 'Permanently waives lien rights for payments received to date',
  'Conditional Final':     'Waives all lien rights once final payment clears',
  'Unconditional Final':   'Permanently waives all lien rights — payment confirmed',
};

const STATUS_STYLES = {
  pending:  { badge: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-400',  label: 'Pending' },
  received: { badge: 'bg-blue-100 text-blue-700 border-blue-200',    dot: 'bg-blue-400',   label: 'Received' },
  signed:   { badge: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500',  label: 'Signed' },
};

function fmt(n) {
  if (n === '' || n === undefined || n === null) return '';
  const num = parseFloat(n);
  return isNaN(num) ? '' : '$' + num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function WaiverRow({ waiver, milestones, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(!waiver.contractor);
  const styles = STATUS_STYLES[waiver.status] ?? STATUS_STYLES.pending;
  const linkedMilestone = milestones.find((m) => m.id === waiver.milestoneId);

  return (
    <div className="bg-white border border-linen rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <span className={`w-2 h-2 rounded-full shrink-0 ${styles.dot}`} />
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={waiver.contractor}
            onChange={(e) => onUpdate({ contractor: e.target.value })}
            placeholder="Contractor / subcontractor name…"
            className="w-full text-sm font-medium bg-transparent border-b border-transparent hover:border-linen focus:border-forest focus:outline-none py-0.5 text-ink"
          />
          <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-mist">
            <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${styles.badge}`}>
              {styles.label}
            </span>
            <span className="text-mist">{waiver.type}</span>
            {waiver.amount && <span>· {fmt(waiver.amount)}</span>}
            {linkedMilestone && (
              <span className="flex items-center gap-0.5">
                {linkedMilestone.done || linkedMilestone.progress >= 100
                  ? <CheckCircle2 size={11} className="text-green-500" />
                  : null}
                {linkedMilestone.title}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {waiver.status === 'pending' && (
            <button
              onClick={() => onUpdate({ status: 'received' })}
              className="text-xs bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full hover:bg-blue-200 transition-colors whitespace-nowrap"
            >
              Mark Received
            </button>
          )}
          {waiver.status === 'received' && (
            <button
              onClick={() => onUpdate({ status: 'signed' })}
              className="text-xs bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full hover:bg-green-200 transition-colors whitespace-nowrap"
            >
              Mark Signed
            </button>
          )}
          {waiver.status !== 'pending' && (
            <button
              onClick={() => onUpdate({ status: 'pending' })}
              className="text-mist hover:text-ink transition-colors p-1 text-xs"
              title="Reset to Pending"
            >
              ↺
            </button>
          )}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-mist mb-1 block">Waiver Type</label>
              <select
                value={waiver.type}
                onChange={(e) => onUpdate({ type: e.target.value })}
                className="w-full text-sm border border-linen rounded-lg px-3 py-1.5 bg-cream focus:outline-none focus:ring-1 focus:ring-forest/40"
              >
                {WAIVER_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
              {waiver.type && (
                <p className="text-xs text-mist mt-1 italic">{TYPE_DESCRIPTIONS[waiver.type]}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-mist mb-1 block">Amount Covered ($)</label>
              <input
                type="number"
                value={waiver.amount}
                onChange={(e) => onUpdate({ amount: e.target.value })}
                placeholder="0"
                className="w-full text-sm border border-linen rounded-lg px-3 py-1.5 bg-cream focus:outline-none focus:ring-1 focus:ring-forest/40"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-mist mb-1 block">Through Date</label>
              <input
                type="date"
                value={waiver.throughDate}
                onChange={(e) => onUpdate({ throughDate: e.target.value })}
                className="w-full text-sm border border-linen rounded-lg px-3 py-1.5 bg-cream focus:outline-none focus:ring-1 focus:ring-forest/40"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-mist mb-1 block">Date Received</label>
              <input
                type="date"
                value={waiver.dateReceived}
                onChange={(e) => onUpdate({ dateReceived: e.target.value })}
                className="w-full text-sm border border-linen rounded-lg px-3 py-1.5 bg-cream focus:outline-none focus:ring-1 focus:ring-forest/40"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-mist mb-1 block">Linked Draw / Milestone</label>
              {milestones.length > 0 ? (
                <select
                  value={waiver.milestoneId}
                  onChange={(e) => onUpdate({ milestoneId: e.target.value })}
                  className="w-full text-sm border border-linen rounded-lg px-3 py-1.5 bg-cream focus:outline-none focus:ring-1 focus:ring-forest/40"
                >
                  <option value="">— none —</option>
                  {milestones.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}{m.done || m.progress >= 100 ? ' ✓' : ''}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={waiver.drawRef}
                  onChange={(e) => onUpdate({ drawRef: e.target.value })}
                  placeholder="Draw #, invoice ref…"
                  className="w-full text-sm border border-linen rounded-lg px-3 py-1.5 bg-cream focus:outline-none focus:ring-1 focus:ring-forest/40"
                />
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-mist mb-1 block">Status</label>
              <div className="flex gap-2 flex-wrap">
                {Object.keys(STATUS_STYLES).map((s) => (
                  <button
                    key={s}
                    onClick={() => onUpdate({ status: s })}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                      waiver.status === s
                        ? STATUS_STYLES[s].badge + ' font-semibold'
                        : 'border-linen text-mist hover:border-forest hover:text-forest'
                    }`}
                  >
                    {STATUS_STYLES[s].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-mist mb-1 block">Notes</label>
            <input
              type="text"
              value={waiver.notes}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              placeholder="Storage location, notary, exceptions…"
              className="w-full text-sm border border-linen rounded-lg px-3 py-1.5 bg-cream focus:outline-none focus:ring-1 focus:ring-forest/40"
            />
          </div>
        </div>
      )}
    </div>
  );
}

const FILTER_TABS = ['All', 'Pending', 'Received', 'Signed'];

export default function LienWaivers({ project, updateProject }) {
  const [filter, setFilter] = useState('All');
  const waivers = project?.lienWaivers ?? [];
  const milestones = project?.timeline?.milestones ?? [];

  function addWaiver() {
    updateProject({
      lienWaivers: [
        ...waivers,
        {
          id: `lien_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          contractor: '',
          type: 'Conditional Partial',
          amount: '',
          throughDate: '',
          dateReceived: '',
          milestoneId: '',
          drawRef: '',
          status: 'pending',
          notes: '',
        },
      ],
    });
  }

  function updateWaiver(id, patch) {
    updateProject({ lienWaivers: waivers.map((w) => (w.id === id ? { ...w, ...patch } : w)) });
  }

  function removeWaiver(id) {
    updateProject({ lienWaivers: waivers.filter((w) => w.id !== id) });
  }

  const pending = waivers.filter((w) => w.status === 'pending').length;
  const received = waivers.filter((w) => w.status === 'received').length;
  const signed = waivers.filter((w) => w.status === 'signed').length;

  const filterLower = filter.toLowerCase();
  const filtered = filterLower === 'all' ? waivers : waivers.filter((w) => w.status === filterLower);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Lien Waivers
          </h1>
          <p className="text-sage text-sm mt-0.5">
            Track conditional and unconditional lien waivers from every contractor and subcontractor.
          </p>
        </div>
        <button
          onClick={addWaiver}
          className="flex items-center gap-1.5 bg-forest text-white text-sm px-4 py-2 rounded-lg hover:bg-deep transition-colors shrink-0"
        >
          <Plus size={15} /> Add Waiver
        </button>
      </div>

      {waivers.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <div className={`rounded-xl border p-4 text-center ${pending > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-linen'}`}>
              <div className="text-xs text-mist mb-1">Pending</div>
              <div className={`text-xl font-bold ${pending > 0 ? 'text-amber-700' : 'text-ink'}`}>{pending}</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <div className="text-xs text-mist mb-1">Received</div>
              <div className="text-xl font-bold text-blue-700">{received}</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <div className="text-xs text-mist mb-1">Signed</div>
              <div className="text-xl font-bold text-green-700">{signed}</div>
            </div>
          </div>

          {pending > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-700">
              ⚠️ <strong>{pending} waiver{pending !== 1 ? 's' : ''} pending.</strong> Never release a draw payment without collecting the corresponding lien waiver.
            </div>
          )}

          <div className="flex gap-1.5 mb-4 flex-wrap">
            {FILTER_TABS.map((tab) => {
              const cnt = tab === 'All' ? waivers.length : tab === 'Pending' ? pending : tab === 'Received' ? received : signed;
              return (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    filter === tab ? 'bg-forest text-white border-forest' : 'border-linen text-sage hover:border-forest hover:text-forest'
                  }`}
                >
                  {tab} <span className="opacity-60">({cnt})</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {waivers.length === 0 ? (
        <div className="text-center py-16 text-mist">
          <div className="text-4xl mb-3">🛡️</div>
          <p className="font-medium">No lien waivers tracked yet</p>
          <p className="text-sm mt-1">Add a waiver for each contractor draw. Never pay without collecting the corresponding waiver.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-mist text-sm">No {filter.toLowerCase()} waivers.</div>
      ) : (
        <div data-tour="lien-waivers-list" className="space-y-2">
          {filtered.map((w) => (
            <WaiverRow
              key={w.id}
              waiver={w}
              milestones={milestones}
              onUpdate={(patch) => updateWaiver(w.id, patch)}
              onRemove={() => removeWaiver(w.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
