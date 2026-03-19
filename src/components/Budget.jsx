import { useState } from 'react';
import { Plus, Trash2, Download, BookOpen } from 'lucide-react';
import { BUDGET_CATEGORIES, BUDGET_DEFAULTS } from '../data/budgetDefaults';

function newItem() {
  return {
    id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
    category: 'Other',
    description: '',
    qty: 1,
    planned: '',
    actual: '',
  };
}

// qty × unit price for a single item
function itemTotal(item) {
  const qty = parseInt(item.qty) || 1;
  const unit = parseFloat(item.planned) || 0;
  return qty * unit;
}

function exportCSV(items) {
  const headers = ['Category', 'Description', 'Qty', 'Unit Price ($)', 'Planned Total ($)', 'Actual ($)', 'Variance ($)'];
  const rows = items.map((item) => {
    const qty = parseInt(item.qty) || 1;
    const unit = parseFloat(item.planned) || 0;
    const planned = qty * unit;
    const actual = parseFloat(item.actual) || 0;
    const variance = actual - planned;
    return [
      `"${item.category}"`,
      `"${item.description.replace(/"/g, '""')}"`,
      qty,
      unit || '',
      planned || '',
      actual || '',
      variance !== 0 ? variance : '',
    ];
  });
  const totalPlanned = items.reduce((s, i) => s + itemTotal(i), 0);
  const totalActual = items.reduce((s, i) => s + (parseFloat(i.actual) || 0), 0);
  rows.push(['', '"TOTAL"', '', '', totalPlanned, totalActual, totalActual - totalPlanned]);

  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `waymark-build-budget-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function resolvePaymentStatus(payment, milestones) {
  if (payment.paidDate) return 'paid';
  const linked = milestones.find((m) => m.id === payment.milestoneId);
  if (linked && (linked.done || linked.progress >= 100)) return 'due';
  return 'upcoming';
}

export default function Budget({ project, updateProject }) {
  const items = project?.budget?.items ?? [];
  const changeOrders = project?.changeOrders ?? [];
  const approvedCOs = changeOrders.filter((co) => co.status === 'approved');
  const coApprovedTotal = approvedCOs.reduce((sum, co) => sum + (parseFloat(co.amount) || 0), 0);
  const milestones = project?.timeline?.milestones ?? [];
  const payments = project?.paymentSchedule ?? [];
  const totalPaid = payments.filter((p) => p.paidDate).reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const totalDue = payments.filter((p) => resolvePaymentStatus(p, milestones) === 'due').reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const [filter, setFilter] = useState('All');

  function addItem() {
    updateProject({ budget: { ...project.budget, items: [...items, newItem()] } });
  }

  function loadStandardBudget() {
    if (
      items.length > 0 &&
      !confirm('Load the standard budget? Your existing items will be kept — standard items will be added alongside them.')
    ) return;
    const defaults = BUDGET_DEFAULTS.map((d) => ({
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`,
      category: d.category,
      description: d.description,
      qty: 1,
      planned: '',
      actual: '',
    }));
    updateProject({ budget: { ...project.budget, items: [...items, ...defaults] } });
  }

  function updateItem(id, patch) {
    updateProject({
      budget: {
        ...project.budget,
        items: items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      },
    });
  }

  function removeItem(id) {
    updateProject({ budget: { ...project.budget, items: items.filter((i) => i.id !== id) } });
  }

  const totalPlanned = items.reduce((s, i) => s + itemTotal(i), 0);
  const totalActual = items.reduce((s, i) => s + (parseFloat(i.actual) || 0), 0);
  const diff = totalActual - totalPlanned;

  const presentCategories = BUDGET_CATEGORIES.filter((c) => items.some((i) => i.category === c));
  const filterTabs = ['All', ...presentCategories];
  const filtered = filter === 'All' ? items : items.filter((i) => i.category === filter);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Budget Tracker
          </h1>
          <p className="text-sage text-sm mt-0.5">Plan vs. actual costs across your build.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {items.length > 0 && (
            <button
              onClick={() => exportCSV(items)}
              className="flex items-center gap-1.5 border border-linen text-sage text-sm px-3 py-2 rounded-lg hover:border-forest hover:text-forest transition-colors"
            >
              <Download size={15} /> Export CSV
            </button>
          )}
          <button
            onClick={loadStandardBudget}
            className="flex items-center gap-1.5 border border-forest text-forest text-sm px-3 py-2 rounded-lg hover:bg-forest hover:text-white transition-colors"
          >
            <BookOpen size={15} /> Load Standard Budget
          </button>
          <button
            onClick={addItem}
            className="flex items-center gap-1.5 bg-forest text-white text-sm px-4 py-2 rounded-lg hover:bg-deep transition-colors"
          >
            <Plus size={16} /> Add Line
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-xl border border-linen p-4 text-center">
          <div className="text-xs text-mist mb-1">Planned Total</div>
          <div className="text-xl font-bold text-ink">${totalPlanned.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl border border-linen p-4 text-center">
          <div className="text-xs text-mist mb-1">Actual Spent</div>
          <div className="text-xl font-bold text-ink">${totalActual.toLocaleString()}</div>
        </div>
        <div className={`rounded-xl border p-4 text-center ${diff > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <div className="text-xs text-mist mb-1">{diff > 0 ? 'Over Budget' : 'Under Budget'}</div>
          <div className={`text-xl font-bold ${diff > 0 ? 'text-red-600' : 'text-green-700'}`}>
            {diff !== 0 ? `${diff > 0 ? '+' : ''}$${Math.abs(diff).toLocaleString()}` : '—'}
          </div>
        </div>
      </div>

      {/* Change Orders summary card */}
      <div className="bg-white rounded-xl border border-amber-200 p-4 mb-6 flex items-center gap-4">
        <div className="flex-1">
          <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-0.5">Approved Change Orders</div>
          <div className={`text-xl font-bold ${coApprovedTotal < 0 ? 'text-green-700' : coApprovedTotal > 0 ? 'text-red-600' : 'text-ink'}`}>
            {coApprovedTotal !== 0
              ? `${coApprovedTotal < 0 ? '−' : '+'}$${Math.abs(coApprovedTotal).toLocaleString()}`
              : '—'}
          </div>
          <div className="text-xs text-mist mt-0.5">
            {approvedCOs.length} approved order{approvedCOs.length !== 1 ? 's' : ''}
            {changeOrders.filter((co) => co.status === 'pending').length > 0 && (
              <span className="ml-2 text-amber-600">
                · {changeOrders.filter((co) => co.status === 'pending').length} pending
              </span>
            )}
          </div>
        </div>
        <div className="text-xs text-mist text-right shrink-0">
          See Change Orders<br />for full detail
        </div>
      </div>

      {/* Payment Schedule summary card */}
      {payments.length > 0 && (
        <div className="bg-white rounded-xl border border-green-200 p-4 mb-6 flex items-center gap-4">
          <div className="flex-1">
            <div className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-0.5">Payment Schedule</div>
            <div className="text-xl font-bold text-green-700">{totalPaid > 0 ? `$${totalPaid.toLocaleString()}` : '—'} <span className="text-sm font-normal text-mist">paid</span></div>
            <div className="text-xs text-mist mt-0.5">
              {payments.filter((p) => p.paidDate).length} of {payments.length} draws paid
              {totalDue > 0 && (
                <span className="ml-2 text-red-600">· ${totalDue.toLocaleString()} due now</span>
              )}
            </div>
          </div>
          <div className="text-xs text-mist text-right shrink-0">
            See Payments<br />for full detail
          </div>
        </div>
      )}

      {/* Category filter */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {filterTabs.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                filter === c ? 'bg-forest text-white border-forest' : 'border-linen text-sage hover:border-forest hover:text-forest'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16 text-mist">
          <div className="text-4xl mb-3">💰</div>
          <p className="font-medium">No budget items yet</p>
          <p className="text-sm mt-1">Click <strong>Load Standard Budget</strong> to pre-fill 460+ line items, or add your own.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl">
          <div className="bg-white border border-linen overflow-hidden rounded-xl" style={{ minWidth: '780px' }}>

            {/* Header — Category | Description | Qty | Unit Price | Planned Total | Actual | ∅ */}
            <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-cream border-b border-linen text-xs font-semibold text-mist uppercase tracking-wide">
              <div className="col-span-2">Category</div>
              <div className="col-span-3">Description</div>
              <div className="col-span-1 text-center">Qty</div>
              <div className="col-span-2 text-right">Unit Price</div>
              <div className="col-span-2 text-right">Planned Total</div>
              <div className="col-span-1 text-right">Actual ($)</div>
              <div className="col-span-1" />
            </div>

            {filtered.map((item) => {
              const qty = parseInt(item.qty) || 1;
              const unit = parseFloat(item.planned) || 0;
              const lineTotal = qty * unit;
              const actual = parseFloat(item.actual) || 0;
              const overBudget = item.actual && actual > lineTotal;

              return (
                <div key={item.id} className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-linen last:border-0 items-center hover:bg-cream/40">
                  {/* Category */}
                  <div className="col-span-2">
                    <select
                      value={item.category}
                      onChange={(e) => updateItem(item.id, { category: e.target.value })}
                      className="w-full text-xs border border-linen rounded px-1.5 py-1 bg-cream focus:outline-none focus:ring-1 focus:ring-forest/40"
                    >
                      {BUDGET_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Description */}
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, { description: e.target.value })}
                      placeholder="Description…"
                      className="w-full text-sm bg-transparent border-b border-transparent hover:border-linen focus:border-forest focus:outline-none py-0.5"
                    />
                  </div>

                  {/* Qty */}
                  <div className="col-span-1">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={item.qty ?? 1}
                      onChange={(e) => updateItem(item.id, { qty: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="w-full text-sm text-center bg-transparent border-b border-transparent hover:border-linen focus:border-forest focus:outline-none py-0.5"
                    />
                  </div>

                  {/* Unit Price */}
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.planned}
                      onChange={(e) => updateItem(item.id, { planned: e.target.value })}
                      placeholder="0"
                      className="w-full text-sm text-right bg-transparent border-b border-transparent hover:border-linen focus:border-forest focus:outline-none py-0.5"
                    />
                  </div>

                  {/* Planned Total (qty × unit price, read-only) */}
                  <div className="col-span-2 text-sm text-right text-ink">
                    {lineTotal > 0 ? `$${lineTotal.toLocaleString()}` : <span className="text-mist">—</span>}
                  </div>

                  {/* Actual */}
                  <div className="col-span-1">
                    <input
                      type="number"
                      value={item.actual}
                      onChange={(e) => updateItem(item.id, { actual: e.target.value })}
                      placeholder="0"
                      className={`w-full text-sm text-right bg-transparent border-b border-transparent hover:border-linen focus:border-forest focus:outline-none py-0.5 ${
                        overBudget ? 'text-red-500' : ''
                      }`}
                    />
                  </div>

                  {/* Delete */}
                  <div className="col-span-1 flex justify-end">
                    <button onClick={() => removeItem(item.id)} className="text-red-300 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Totals row */}
            <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-cream border-t border-linen font-semibold text-sm">
              <div className="col-span-6 text-mist uppercase text-xs tracking-wide self-center">Total</div>
              <div className="col-span-2" />
              <div className="col-span-2 text-right text-ink">${totalPlanned.toLocaleString()}</div>
              <div className={`col-span-1 text-right ${totalActual > totalPlanned ? 'text-red-600' : 'text-ink'}`}>
                ${totalActual.toLocaleString()}
              </div>
              <div className="col-span-1" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
