import { useState } from 'react';
import { Plus, Link2, Star, ChevronRight, BarChart3, Check, ArrowLeft, X } from 'lucide-react';
import { STATUS, normalizeProperty, parseListingUrl } from '../data/propertyData';
import PropertyDetail from './PropertyDetail';

function StatusBadge({ status, className = '' }) {
  const s = STATUS[status] ?? STATUS.considering;
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${s.color} ${className}`}>
      {s.label}
    </span>
  );
}

function CompareView({ properties, onBack }) {
  const avgRating = (p) => {
    const visits = p.visits ?? [];
    if (!visits.length) return null;
    const sum = visits.reduce((s, v) => s + (v.rating || 0), 0);
    return (sum / visits.length).toFixed(1);
  };

  const rows = [
    { label: 'Status',        render: (p) => <StatusBadge status={p.status} /> },
    { label: 'Price',         render: (p) => p.price ? `$${Number(p.price).toLocaleString()}` : '—' },
    { label: 'Acres',         render: (p) => p.acres ? `${p.acres} ac` : '—' },
    { label: 'School',        render: (p) => p.schoolDistrict ? `${p.schoolDistrict}${p.schoolRating ? ` · ${p.schoolRating}/10` : ''}` : '—' },
    { label: 'Flood Zone',    render: (p) => p.floodZone || '—' },
    { label: 'Zoning',        render: (p) => p.zoning || '—' },
    { label: 'Visits',        render: (p) => p.visits?.length || 0 },
    { label: 'Avg Rating',    render: (p) => { const r = avgRating(p); return r ? `${r} / 5` : '—'; } },
    { label: 'Pros',          render: (p) => p.pros?.length || 0 },
    { label: 'Cons',          render: (p) => p.cons?.length || 0 },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-mist hover:text-ink text-sm mb-5 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Properties
      </button>
      <h1 className="text-2xl font-bold text-ink mb-6" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
        Compare Properties
      </h1>
      <div className="overflow-x-auto pb-2">
        <table className="w-full text-sm" style={{ minWidth: `${160 + properties.length * 180}px` }}>
          <thead>
            <tr>
              <td className="pr-4 py-2 text-xs font-semibold text-mist w-28 align-bottom">Property</td>
              {properties.map((p) => (
                <td key={p.id} className="px-3 py-2 text-center align-bottom" style={{ minWidth: '180px' }}>
                  {p.coverPhoto ? (
                    <img src={p.coverPhoto} alt="" className="w-full h-28 object-cover rounded-xl mb-2" />
                  ) : (
                    <div className="w-full h-28 bg-linen/50 rounded-xl mb-2 flex items-center justify-center text-3xl">🌿</div>
                  )}
                  <div className="font-medium text-ink text-xs leading-snug">{p.address || 'Untitled'}</div>
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ label, render }) => (
              <tr key={label} className="border-t border-linen">
                <td className="pr-4 py-3 text-xs font-medium text-mist">{label}</td>
                {properties.map((p) => (
                  <td key={p.id} className="px-3 py-3 text-center text-ink">{render(p)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Properties({ project, updateProject, uid }) {
  const [selectedId, setSelectedId] = useState(null);
  const [view, setView] = useState('list'); // 'list' | 'compare'
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState([]);
  const [urlInput, setUrlInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const properties = (project?.properties ?? []).map(normalizeProperty);

  function updateProperty(id, patch) {
    updateProject({ properties: properties.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  }

  function removeProperty(id) {
    if (!confirm('Remove this property?')) return;
    updateProject({ properties: properties.filter((p) => p.id !== id) });
  }

  function addBlank() {
    const p = normalizeProperty({ id: `prop_${Date.now()}`, createdAt: new Date().toISOString() });
    updateProject({ properties: [...properties, p] });
    setSelectedId(p.id);
  }

  function quickAdd() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    const parsed = parseListingUrl(trimmed);
    const p = normalizeProperty({
      id: `prop_${Date.now()}`,
      address: parsed || '',
      link: trimmed,
      createdAt: new Date().toISOString(),
    });
    updateProject({ properties: [...properties, p] });
    setUrlInput('');
    setSelectedId(p.id);
  }

  function toggleCompare(id) {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  }

  // Render PropertyDetail when a property is selected
  if (selectedId) {
    const p = properties.find((p) => p.id === selectedId);
    if (p) {
      return (
        <PropertyDetail
          property={p}
          uid={uid}
          onChange={(patch) => updateProperty(p.id, patch)}
          onBack={() => setSelectedId(null)}
          onDelete={() => { removeProperty(p.id); setSelectedId(null); }}
        />
      );
    }
  }

  // Render compare view
  if (view === 'compare' && compareIds.length >= 2) {
    const selected = properties.filter((p) => compareIds.includes(p.id));
    return <CompareView properties={selected} onBack={() => setView('list')} />;
  }

  const filtered = statusFilter === 'all'
    ? properties
    : properties.filter((p) => p.status === statusFilter);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-5 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Properties
          </h1>
          <p className="text-sage text-sm mt-0.5">Track and compare land you're evaluating.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {compareMode && compareIds.length >= 2 && (
            <button
              onClick={() => setView('compare')}
              className="flex items-center gap-1.5 bg-forest text-white text-sm px-3 py-2 rounded-lg hover:bg-deep transition-colors"
            >
              <BarChart3 size={15} /> Compare ({compareIds.length})
            </button>
          )}
          <button
            onClick={() => { setCompareMode(!compareMode); setCompareIds([]); }}
            className={`text-sm px-3 py-2 rounded-lg border transition-colors ${
              compareMode
                ? 'border-forest text-forest bg-forest/5'
                : 'border-linen text-mist hover:text-ink bg-white'
            }`}
          >
            {compareMode ? 'Cancel' : 'Compare'}
          </button>
          <button
            onClick={addBlank}
            className="flex items-center gap-1.5 bg-forest text-white text-sm px-3 py-2 rounded-lg hover:bg-deep transition-colors"
          >
            <Plus size={15} /> Add
          </button>
        </div>
      </div>

      {/* Quick-add URL bar */}
      <div className="flex gap-2 mb-5">
        <div className="flex-1 flex items-center gap-2 bg-white border border-linen rounded-lg px-3 py-2.5">
          <Link2 size={14} className="text-mist shrink-0" />
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && quickAdd()}
            placeholder="Paste a Zillow or Realtor.com link to auto-fill address…"
            className="flex-1 text-sm bg-transparent focus:outline-none text-ink placeholder:text-mist"
          />
          {urlInput && (
            <button onClick={() => setUrlInput('')} className="text-mist hover:text-ink">
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={quickAdd}
          disabled={!urlInput.trim()}
          className="text-sm px-4 py-2 bg-forest text-white rounded-lg hover:bg-deep disabled:opacity-40 transition-colors"
        >
          Add
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
        <button
          onClick={() => setStatusFilter('all')}
          className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap border transition-colors ${
            statusFilter === 'all' ? 'bg-forest text-white border-forest' : 'border-linen text-mist hover:text-ink bg-white'
          }`}
        >
          All ({properties.length})
        </button>
        {Object.entries(STATUS).map(([key, s]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap border transition-colors ${
              statusFilter === key ? 'bg-forest text-white border-forest' : 'border-linen text-mist hover:text-ink bg-white'
            }`}
          >
            {s.label} ({properties.filter((p) => p.status === key).length})
          </button>
        ))}
      </div>

      {/* Empty state */}
      {properties.length === 0 && (
        <div className="text-center py-16 text-mist">
          <div className="text-4xl mb-3">🗺️</div>
          <p className="font-medium">No properties yet</p>
          <p className="text-sm mt-1">Paste a listing link above or click Add to get started.</p>
        </div>
      )}

      {filtered.length === 0 && properties.length > 0 && (
        <div className="text-center py-10 text-mist text-sm">
          No properties with that status.
        </div>
      )}

      {/* Property cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => {
          const visits = p.visits ?? [];
          const avgRating = visits.length
            ? (visits.reduce((s, v) => s + (v.rating || 0), 0) / visits.length).toFixed(1)
            : null;
          const inCompare = compareIds.includes(p.id);

          return (
            <div
              key={p.id}
              className={`bg-white rounded-xl border overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                inCompare ? 'border-forest ring-2 ring-forest/20' : 'border-linen'
              }`}
              onClick={() => {
                if (compareMode) { toggleCompare(p.id); return; }
                setSelectedId(p.id);
              }}
            >
              {/* Cover photo */}
              <div className="relative">
                {p.coverPhoto ? (
                  <img src={p.coverPhoto} alt="" className="w-full h-36 object-cover" />
                ) : (
                  <div className="w-full h-36 bg-linen/40 flex items-center justify-center text-4xl">🌿</div>
                )}
                {compareMode && (
                  <div className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    inCompare ? 'bg-forest border-forest text-white' : 'bg-white border-linen'
                  }`}>
                    {inCompare && <Check size={12} />}
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <StatusBadge status={p.status} />
                </div>
              </div>

              {/* Card body */}
              <div className="p-3">
                <div className="font-medium text-ink text-sm truncate">
                  {p.address || <span className="text-mist italic">Untitled Property</span>}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="text-xs text-mist">
                    {p.price ? `$${Number(p.price).toLocaleString()}` : 'Price TBD'}
                    {p.acres ? ` · ${p.acres} ac` : ''}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-mist">
                    {avgRating && (
                      <span className="flex items-center gap-0.5 text-amber-500">
                        <Star size={11} fill="currentColor" /> {avgRating}
                      </span>
                    )}
                    {visits.length > 0 && (
                      <span>{visits.length} visit{visits.length > 1 ? 's' : ''}</span>
                    )}
                    {!compareMode && <ChevronRight size={13} className="text-mist" />}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compare mode footer bar */}
      {compareMode && compareIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-ink text-white px-4 py-3 flex items-center justify-between z-50 shadow-lg">
          <span className="text-sm">
            {compareIds.length} of 3 selected
            {compareIds.length < 2 && ' — select at least 2'}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCompareIds([])}
              className="text-xs text-mist hover:text-white transition-colors"
            >
              Clear
            </button>
            {compareIds.length >= 2 && (
              <button
                onClick={() => setView('compare')}
                className="flex items-center gap-1.5 bg-forest text-white text-sm px-4 py-1.5 rounded-lg hover:bg-deep transition-colors"
              >
                <BarChart3 size={14} /> Compare
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
