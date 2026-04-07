import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, CheckCircle2, Circle } from 'lucide-react';

// Derive status from data — don't store derived state
function resolveStatus(payment, milestones) {
  if (payment.paidDate) return 'paid';
  const linked = milestones.find((m) => m.id === payment.milestoneId);
  const milestoneDone = linked && (linked.done || linked.progress >= 100);
  if (milestoneDone) return 'due';
  return 'upcoming';
}

const STATUS_STYLES = {
  paid:     { badge: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500',  label: 'Paid' },
  due:      { badge: 'bg-red-100 text-red-600 border-red-200',       dot: 'bg-red-500',    label: 'Due' },
  upcoming: { badge: 'bg-outline-variant text-outline border-outline-variant', dot: 'bg-outline-variant', label: 'Upcoming' },
};

function fmt(n) {
  if (n === '' || n === undefined || n === null) return '—';
  const num = parseFloat(n);
  if (isNaN(num)) return '—';
  return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function PaymentRow({ payment, milestones, onUpdate, onRemove }) {
  const status = resolveStatus(payment, milestones);
  const styles = STATUS_STYLES[status];
  const [expanded, setExpanded] = useState(!payment.title);
  const linkedMilestone = milestones.find((m) => m.id === payment.milestoneId);

  return (
    <div className="bg-surface-container-lowest shadow-md border border-outline-variant/10 rounded-3xl overflow-hidden">
      {/* Collapsed row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <span className={`w-2 h-2 rounded-full shrink-0 ${styles.dot}`} />
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={payment.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Payment title…"
            className="w-full text-sm font-medium bg-transparent border-b border-transparent hover:border-outline-variant focus:border-primary focus:outline-none py-0.5 text-on-surface"
          />
          <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-outline">
            <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${styles.badge}`}>
              {styles.label}
            </span>
            {payment.payee && <span>{payment.payee}</span>}
            {linkedMilestone && (
              <span className="flex items-center gap-0.5">
                {linkedMilestone.done || linkedMilestone.progress >= 100
                  ? <CheckCircle2 size={11} className="text-green-500" />
                  : <Circle size={11} className="text-outline" />}
                {linkedMilestone.title}
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0 text-sm font-semibold text-right min-w-[64px]">
          {fmt(payment.amount)}
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-1">
          {status !== 'paid' && (
            <button
              onClick={() => onUpdate({ paidDate: new Date().toISOString().split('T')[0] })}
              title="Mark as Paid"
              className="text-xs bg-primary text-on-primary px-2 py-0.5 rounded-full hover:bg-primary-dim transition-colors whitespace-nowrap"
            >
              Mark Paid
            </button>
          )}
          {status === 'paid' && (
            <button
              onClick={() => onUpdate({ paidDate: '' })}
              title="Undo Paid"
              className="text-xs text-outline hover:text-on-surface transition-colors px-1"
            >
              ↺
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-outline hover:text-on-surface transition-colors p-1"
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
          <button
            onClick={onRemove}
            className="text-red-300 hover:text-red-500 transition-colors p-1"
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
              <label className="text-xs font-medium text-outline mb-1 block">Amount ($)</label>
              <input
                type="number"
                value={payment.amount}
                onChange={(e) => onUpdate({ amount: e.target.value })}
                placeholder="0"
                className="w-full text-sm border border-outline-variant rounded-xl px-3 py-1.5 bg-surface focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-outline mb-1 block">Payee</label>
              <input
                type="text"
                value={payment.payee}
                onChange={(e) => onUpdate({ payee: e.target.value })}
                placeholder="Builder, subcontractor…"
                className="w-full text-sm border border-outline-variant rounded-xl px-3 py-1.5 bg-surface focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-outline mb-1 block">
                Linked Milestone
                <span className="ml-1 text-outline/60 font-normal">(triggers "Due" status)</span>
              </label>
              {milestones.length > 0 ? (
                <select
                  value={payment.milestoneId}
                  onChange={(e) => onUpdate({ milestoneId: e.target.value })}
                  className="w-full text-sm border border-outline-variant rounded-xl px-3 py-1.5 bg-surface focus:outline-none focus:ring-1 focus:ring-primary/40"
                >
                  <option value="">— no milestone —</option>
                  {milestones.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}{m.done || m.progress >= 100 ? ' ✓' : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-outline italic">Add milestones in Timeline first.</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-outline mb-1 block">Expected Due Date</label>
              <input
                type="date"
                value={payment.dueDate}
                onChange={(e) => onUpdate({ dueDate: e.target.value })}
                className="w-full text-sm border border-outline-variant rounded-xl px-3 py-1.5 bg-surface focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-outline mb-1 block">Date Paid</label>
              <input
                type="date"
                value={payment.paidDate}
                onChange={(e) => onUpdate({ paidDate: e.target.value })}
                className="w-full text-sm border border-outline-variant rounded-xl px-3 py-1.5 bg-surface focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-outline mb-1 block">Draw / Invoice #</label>
              <input
                type="text"
                value={payment.invoiceRef}
                onChange={(e) => onUpdate({ invoiceRef: e.target.value })}
                placeholder="e.g. Draw #2, INV-0041"
                className="w-full text-sm border border-outline-variant rounded-xl px-3 py-1.5 bg-surface focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-outline mb-1 block">Notes</label>
            <input
              type="text"
              value={payment.notes}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              placeholder="Wire transfer, check #, lender draw, etc."
              className="w-full text-sm border border-outline-variant rounded-xl px-3 py-1.5 bg-surface focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </div>
        </div>
      )}
    </div>
  );
}

const FILTER_TABS = ['All', 'Due', 'Upcoming', 'Paid'];

export default function PaymentSchedule({ project, updateProject }) {
  const [filter, setFilter] = useState('All');
  const payments = project?.paymentSchedule ?? [];
  const milestones = project?.timeline?.milestones ?? [];

  function addPayment() {
    updateProject({
      paymentSchedule: [
        ...payments,
        {
          id: `pay_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          title: '',
          amount: '',
          payee: '',
          milestoneId: '',
          dueDate: '',
          paidDate: '',
          invoiceRef: '',
          notes: '',
        },
      ],
    });
  }

  function updatePayment(id, patch) {
    updateProject({
      paymentSchedule: payments.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
  }

  function removePayment(id) {
    updateProject({ paymentSchedule: payments.filter((p) => p.id !== id) });
  }

  // Totals
  const totalContract = payments.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const totalPaid = payments
    .filter((p) => p.paidDate)
    .reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const totalDue = payments
    .filter((p) => !p.paidDate && resolveStatus(p, milestones) === 'due')
    .reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const totalRemaining = totalContract - totalPaid;

  const filterLower = filter.toLowerCase();
  const filtered =
    filterLower === 'all'
      ? payments
      : payments.filter((p) => resolveStatus(p, milestones) === filterLower);

  const dueCnt = payments.filter((p) => resolveStatus(p, milestones) === 'due').length;
  const upcomingCnt = payments.filter((p) => resolveStatus(p, milestones) === 'upcoming').length;
  const paidCnt = payments.filter((p) => resolveStatus(p, milestones) === 'paid').length;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface font-heading">
            Payment Schedule
          </h1>
          <p className="text-on-surface-variant text-sm mt-0.5">
            Draw payments tied to milestones — automatically shows "Due" when the milestone is complete.
          </p>
        </div>
        <button
          onClick={addPayment}
          className="flex items-center gap-1.5 bg-primary text-on-primary text-sm px-4 py-2 rounded-xl hover:bg-primary-dim transition-colors shrink-0"
        >
          <Plus size={15} /> Add Payment
        </button>
      </div>

      {/* Summary cards */}
      {payments.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-surface-container-lowest shadow-md border border-outline-variant/10 rounded-3xl p-6 text-center">
            <div className="text-xs text-outline mb-1">Contract Total</div>
            <div className="text-lg font-bold text-on-surface">{fmt(totalContract)}</div>
          </div>
          <div className="bg-surface-container-lowest shadow-md border border-green-200/10 rounded-3xl p-6 text-center">
            <div className="text-xs text-outline mb-1">Total Paid</div>
            <div className="text-lg font-bold text-green-700">{totalPaid > 0 ? fmt(totalPaid) : '—'}</div>
          </div>
          <div className={`rounded-3xl border p-6 text-center ${totalDue > 0 ? 'bg-red-50 border-red-200' : 'bg-surface-container-lowest shadow-md border-outline-variant/10'}`}>
            <div className="text-xs text-outline mb-1">Due Now</div>
            <div className={`text-lg font-bold ${totalDue > 0 ? 'text-red-600' : 'text-on-surface'}`}>
              {totalDue > 0 ? fmt(totalDue) : '—'}
            </div>
          </div>
          <div className="bg-surface-container-lowest shadow-md border border-outline-variant/10 rounded-3xl p-6 text-center">
            <div className="text-xs text-outline mb-1">Remaining</div>
            <div className="text-lg font-bold text-on-surface">{totalRemaining > 0 ? fmt(totalRemaining) : '—'}</div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      {payments.length > 0 && (
        <div className="flex gap-1.5 mb-4 flex-wrap">
          {FILTER_TABS.map((tab) => {
            const cnt = tab === 'All' ? payments.length : tab === 'Due' ? dueCnt : tab === 'Upcoming' ? upcomingCnt : paidCnt;
            return (
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
                <span className="ml-1 opacity-60">({cnt})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* List */}
      {payments.length === 0 ? (
        <div className="text-center py-16 text-outline">
          <div className="text-4xl mb-3">💳</div>
          <p className="font-medium">No payments scheduled yet</p>
          <p className="text-sm mt-1">Add each draw payment and link it to a milestone. It'll show as "Due" the moment that milestone is complete.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-outline text-sm">
          No {filter.toLowerCase()} payments.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <PaymentRow
              key={p.id}
              payment={p}
              milestones={milestones}
              onUpdate={(patch) => updatePayment(p.id, patch)}
              onRemove={() => removePayment(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
