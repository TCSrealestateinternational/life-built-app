import { useState } from 'react';
import { Plus, Trash2, ExternalLink, FileText, Image, File, ChevronDown, ChevronUp } from 'lucide-react';

const CATEGORIES = ['Blueprints & Plans', 'Contracts & Agreements', 'Permits', 'Inspections', 'Photos', 'Other'];

const FILTER_TABS = ['All', ...CATEGORIES];

const TYPE_ICONS = {
  pdf: FileText,
  dwg: File,
  dxf: File,
  png: Image,
  jpg: Image,
  jpeg: Image,
  webp: Image,
  doc: FileText,
  docx: FileText,
  xls: FileText,
  xlsx: FileText,
};

function guessExt(url, name) {
  const src = name || url;
  const ext = src.split('.').pop().toLowerCase().split('?')[0];
  return ext.length <= 5 ? ext : '';
}

function LinkIcon({ url, name }) {
  const ext = guessExt(url, name);
  const Icon = TYPE_ICONS[ext] ?? File;
  return <Icon size={17} className="text-mist shrink-0" />;
}

function newDoc() {
  return {
    id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
    name: '',
    url: '',
    category: 'Other',
    notes: '',
    addedAt: new Date().toISOString(),
  };
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function DocRow({ doc, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(!doc.url);

  return (
    <div className="bg-white border border-linen rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <LinkIcon url={doc.url} name={doc.name} />
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={doc.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="Document name…"
            className="w-full text-sm font-medium bg-transparent border-b border-transparent hover:border-linen focus:border-forest focus:outline-none py-0.5 text-ink"
          />
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <select
              value={doc.category}
              onChange={(e) => onUpdate({ category: e.target.value })}
              className="text-xs border border-linen rounded px-1.5 py-0.5 bg-cream text-mist focus:outline-none focus:ring-1 focus:ring-forest/40"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            {doc.addedAt && <span className="text-xs text-mist">{formatDate(doc.addedAt)}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {doc.url && (
            <a
              href={doc.url}
              target="_blank"
              rel="noreferrer"
              className="text-mist hover:text-forest transition-colors p-1"
              title="Open link"
            >
              <ExternalLink size={15} />
            </a>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-mist hover:text-ink transition-colors p-1"
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

      {expanded && (
        <div className="px-4 pb-4 border-t border-linen space-y-2.5 pt-3">
          <div>
            <label className="text-xs font-medium text-mist mb-1 block">Link (Google Drive, Dropbox, etc.)</label>
            <input
              type="url"
              value={doc.url}
              onChange={(e) => onUpdate({ url: e.target.value })}
              placeholder="Paste a share link…"
              className="w-full text-sm border border-linen rounded-lg px-3 py-1.5 bg-cream focus:outline-none focus:ring-1 focus:ring-forest/40"
            />
            {!doc.url && (
              <p className="text-xs text-mist mt-1">
                Upload your file to Google Drive or Dropbox, set sharing to "Anyone with link can view," then paste the link here.
              </p>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-mist mb-1 block">Notes</label>
            <input
              type="text"
              value={doc.notes}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              placeholder="e.g. Revised 3/10, Sheet A2, approved by inspector…"
              className="w-full text-sm border border-linen rounded-lg px-3 py-1.5 bg-cream focus:outline-none focus:ring-1 focus:ring-forest/40"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Documents({ project, updateProject }) {
  const [filter, setFilter] = useState('All');
  const docs = project?.documents ?? [];

  function addDoc() {
    updateProject({ documents: [...docs, newDoc()] });
  }

  function updateDoc(id, patch) {
    updateProject({ documents: docs.map((d) => (d.id === id ? { ...d, ...patch } : d)) });
  }

  function removeDoc(id) {
    updateProject({ documents: docs.filter((d) => d.id !== id) });
  }

  const filtered = filter === 'All' ? docs : docs.filter((d) => d.category === filter);
  const presentFilters = FILTER_TABS.filter((f) => f === 'All' || docs.some((d) => d.category === f));

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Documents
          </h1>
          <p className="text-sage text-sm mt-0.5">
            Blueprints, permits, contracts, and anything else you want to keep with your build.
          </p>
        </div>
        <button
          onClick={addDoc}
          className="flex items-center gap-1.5 bg-forest text-white text-sm px-4 py-2 rounded-lg hover:bg-deep transition-colors shrink-0"
        >
          <Plus size={15} /> Add Document
        </button>
      </div>

      {/* How it works — shown only when empty */}
      {docs.length === 0 && (
        <div className="bg-forest/5 border border-forest/20 rounded-xl p-4 mb-6 text-sm text-ink space-y-1">
          <p className="font-medium text-forest">How to add documents</p>
          <ol className="list-decimal pl-4 space-y-1 text-mist">
            <li>Upload your file to Google Drive or Dropbox</li>
            <li>Right-click → Share → set to "Anyone with link can view"</li>
            <li>Copy the link and paste it here</li>
          </ol>
        </div>
      )}

      {/* Category filter */}
      {docs.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {presentFilters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                filter === f
                  ? 'bg-forest text-white border-forest'
                  : 'border-linen text-sage hover:border-forest hover:text-forest'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {/* Document list */}
      {docs.length === 0 ? (
        <div className="text-center py-12 text-mist">
          <div className="text-4xl mb-3">📁</div>
          <p className="font-medium">No documents yet</p>
          <p className="text-sm mt-1">Click "Add Document" to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((doc) => (
            <DocRow
              key={doc.id}
              doc={doc}
              onUpdate={(patch) => updateDoc(doc.id, patch)}
              onRemove={() => removeDoc(doc.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
