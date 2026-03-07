import { useState } from 'react';
import { Plus, Trash2, CheckCircle, Circle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

function newProperty() {
  return {
    id: Date.now(),
    address: '',
    price: '',
    acres: '',
    notes: '',
    evaluated: false,
    createdAt: new Date().toISOString(),
  };
}

export default function Properties({ project, updateProject }) {
  const [expanded, setExpanded] = useState(null);
  const properties = project?.properties ?? [];

  function add() {
    const p = newProperty();
    updateProject({ properties: [...properties, p] });
    setExpanded(p.id);
  }

  function remove(id) {
    if (!confirm('Remove this property?')) return;
    updateProject({ properties: properties.filter((p) => p.id !== id) });
    if (expanded === id) setExpanded(null);
  }

  function update(id, patch) {
    updateProject({ properties: properties.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Properties
          </h1>
          <p className="text-sage text-sm mt-0.5">Track land you're evaluating or have purchased.</p>
        </div>
        <button
          onClick={add}
          className="flex items-center gap-1.5 bg-forest text-white text-sm px-4 py-2 rounded-lg hover:bg-deep transition-colors"
        >
          <Plus size={16} /> Add Property
        </button>
      </div>

      {properties.length === 0 && (
        <div className="text-center py-16 text-mist">
          <div className="text-4xl mb-3">🗺️</div>
          <p className="font-medium">No properties yet</p>
          <p className="text-sm mt-1">Add your first land listing to start evaluating.</p>
        </div>
      )}

      <div className="space-y-3">
        {properties.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border border-linen overflow-hidden">
            {/* Header row */}
            <div
              className="flex items-center gap-3 p-4 cursor-pointer hover:bg-cream/50 transition-colors"
              onClick={() => setExpanded(expanded === p.id ? null : p.id)}
            >
              <button
                onClick={(e) => { e.stopPropagation(); update(p.id, { evaluated: !p.evaluated }); }}
                className="text-forest shrink-0"
                title={p.evaluated ? 'Mark as not evaluated' : 'Mark as evaluated'}
              >
                {p.evaluated ? <CheckCircle size={20} className="text-forest" /> : <Circle size={20} className="text-mist" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-ink truncate">
                  {p.address || <span className="text-mist italic">Untitled property</span>}
                </div>
                <div className="text-xs text-mist mt-0.5">
                  {p.price ? `$${Number(p.price).toLocaleString()}` : 'Price TBD'}
                  {p.acres ? ` · ${p.acres} acres` : ''}
                  {p.evaluated ? ' · ✓ Evaluated' : ''}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); remove(p.id); }}
                  className="text-red-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
                {expanded === p.id ? <ChevronUp size={16} className="text-mist" /> : <ChevronDown size={16} className="text-mist" />}
              </div>
            </div>

            {/* Expanded detail */}
            {expanded === p.id && (
              <div className="border-t border-linen p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-ink mb-1">Address / Description</label>
                    <input
                      type="text"
                      value={p.address}
                      onChange={(e) => update(p.id, { address: e.target.value })}
                      placeholder="123 Meadow Ln, Lancaster, KY"
                      className="w-full border border-linen rounded-lg px-3 py-2 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-forest/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink mb-1">Asking Price ($)</label>
                    <input
                      type="number"
                      value={p.price}
                      onChange={(e) => update(p.id, { price: e.target.value })}
                      placeholder="150000"
                      className="w-full border border-linen rounded-lg px-3 py-2 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-forest/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink mb-1">Acres</label>
                    <input
                      type="number"
                      value={p.acres}
                      onChange={(e) => update(p.id, { acres: e.target.value })}
                      placeholder="5.2"
                      step="0.1"
                      className="w-full border border-linen rounded-lg px-3 py-2 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-forest/40"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <button
                      onClick={() => update(p.id, { evaluated: !p.evaluated })}
                      className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border transition-colors ${
                        p.evaluated
                          ? 'border-forest bg-forest/10 text-forest'
                          : 'border-linen text-mist hover:border-forest hover:text-forest'
                      }`}
                    >
                      {p.evaluated ? <CheckCircle size={14} /> : <Circle size={14} />}
                      {p.evaluated ? 'Evaluated' : 'Mark Evaluated'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Notes</label>
                  <textarea
                    value={p.notes}
                    onChange={(e) => update(p.id, { notes: e.target.value })}
                    rows={3}
                    placeholder="Zoning, perc test result, pros/cons…"
                    className="w-full border border-linen rounded-lg px-3 py-2 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-forest/40 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Zillow / MLS Link</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={p.link ?? ''}
                      onChange={(e) => update(p.id, { link: e.target.value })}
                      placeholder="https://zillow.com/..."
                      className="flex-1 border border-linen rounded-lg px-3 py-2 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-forest/40"
                    />
                    {p.link && (
                      <a href={p.link} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-sm text-forest px-3 py-2 border border-linen rounded-lg hover:bg-cream transition-colors">
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
