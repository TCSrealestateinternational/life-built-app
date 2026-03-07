import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const CATEGORIES = [
  'Land', 'Site Prep', 'Foundation', 'Framing', 'Roofing',
  'Electrical', 'Plumbing', 'HVAC', 'Insulation', 'Drywall',
  'Flooring', 'Cabinets & Counters', 'Appliances', 'Exterior',
  'Landscaping', 'Permits & Fees', 'Contingency', 'Other',
];

function newItem() {
  return { id: Date.now(), category: 'Other', description: '', planned: '', actual: '' };
}

export default function Budget({ project, updateProject }) {
  const items = project?.budget?.items ?? [];
  const [filter, setFilter] = useState('All');

  function addItem() {
    updateProject({ budget: { ...project.budget, items: [...items, newItem()] } });
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

  const totalPlanned = items.reduce((s, i) => s + (parseFloat(i.planned) || 0), 0);
  const totalActual = items.reduce((s, i) => s + (parseFloat(i.actual) || 0), 0);
  const diff = totalActual - totalPlanned;

  const categories = ['All', ...CATEGORIES.filter((c) => items.some((i) => i.category === c)), 'Other'];
  const uniqueCategories = [...new Set(categories)];
  const filtered = filter === 'All' ? items : items.filter((i) => i.category === filter);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Budget Tracker
          </h1>
          <p className="text-sage text-sm mt-0.5">Plan vs. actual costs across your build.</p>
        </div>
        <button
          onClick={addItem}
          className="flex items-center gap-1.5 bg-forest text-white text-sm px-4 py-2 rounded-lg hover:bg-deep transition-colors"
        >
          <Plus size={16} /> Add Line
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-linen p-4 text-center">
          <div className="text-xs text-mist mb-1">Planned</div>
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

      {/* Category filter */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {uniqueCategories.map((c) => (
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
          <p className="text-sm mt-1">Add line items to track your land and build costs.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-linen overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-cream border-b border-linen text-xs font-semibold text-mist uppercase tracking-wide">
            <div className="col-span-3">Category</div>
            <div className="col-span-4">Description</div>
            <div className="col-span-2 text-right">Planned ($)</div>
            <div className="col-span-2 text-right">Actual ($)</div>
            <div className="col-span-1" />
          </div>

          {filtered.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-linen last:border-0 items-center hover:bg-cream/40">
              <div className="col-span-3">
                <select
                  value={item.category}
                  onChange={(e) => updateItem(item.id, { category: e.target.value })}
                  className="w-full text-xs border border-linen rounded px-1.5 py-1 bg-cream focus:outline-none focus:ring-1 focus:ring-forest/40"
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-span-4">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, { description: e.target.value })}
                  placeholder="Description…"
                  className="w-full text-sm bg-transparent border-b border-transparent hover:border-linen focus:border-forest focus:outline-none py-0.5"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  value={item.planned}
                  onChange={(e) => updateItem(item.id, { planned: e.target.value })}
                  placeholder="0"
                  className="w-full text-sm text-right bg-transparent border-b border-transparent hover:border-linen focus:border-forest focus:outline-none py-0.5"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  value={item.actual}
                  onChange={(e) => updateItem(item.id, { actual: e.target.value })}
                  placeholder="0"
                  className={`w-full text-sm text-right bg-transparent border-b border-transparent hover:border-linen focus:border-forest focus:outline-none py-0.5 ${
                    item.actual && parseFloat(item.actual) > parseFloat(item.planned || 0) ? 'text-red-500' : ''
                  }`}
                />
              </div>
              <div className="col-span-1 flex justify-end">
                <button onClick={() => removeItem(item.id)} className="text-red-300 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {/* Totals row */}
          <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-cream border-t border-linen font-semibold text-sm">
            <div className="col-span-7 text-mist uppercase text-xs tracking-wide">Total</div>
            <div className="col-span-2 text-right text-ink">${totalPlanned.toLocaleString()}</div>
            <div className={`col-span-2 text-right ${totalActual > totalPlanned ? 'text-red-600' : 'text-ink'}`}>
              ${totalActual.toLocaleString()}
            </div>
            <div className="col-span-1" />
          </div>
        </div>
      )}
    </div>
  );
}
