import { useState, useRef } from 'react';
import { ref as storageRef, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';
import { useUpload } from '../hooks/useUpload';
import {
  Plus, Trash2, ExternalLink, FileText, Image, File,
  ChevronDown, ChevronUp, Upload,
} from 'lucide-react';

const CATEGORIES = ['Blueprints & Plans', 'Contracts & Agreements', 'Permits', 'Inspections', 'Photos', 'Other'];

const TYPE_ICONS = {
  pdf: FileText, dwg: File, dxf: File,
  png: Image, jpg: Image, jpeg: Image, webp: Image,
  doc: FileText, docx: FileText, xls: FileText, xlsx: FileText,
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

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
  const [expanded, setExpanded] = useState(!doc.url && doc.source !== 'upload');
  const isUpload = doc.source === 'upload';

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
            {isUpload && doc.size && (
              <span className="text-xs text-mist">{formatSize(doc.size)}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {doc.url && (
            <a
              href={doc.url}
              target="_blank"
              rel="noreferrer"
              className="text-mist hover:text-forest transition-colors p-1"
              title="Open"
            >
              <ExternalLink size={15} />
            </a>
          )}
          {!isUpload && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-mist hover:text-ink transition-colors p-1"
              title="Edit details"
            >
              {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          )}
          <button
            onClick={onRemove}
            className="text-red-300 hover:text-red-500 transition-colors p-1"
            title="Remove"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {!isUpload && expanded && (
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

// ─── Photos grid (images + videos from uploaded docs) ─────────────────────────

function PhotosGrid({ docs, onRemove }) {
  const photos = docs.filter((d) => d.source === 'upload' && d.type && (d.type.startsWith('image/') || d.type.startsWith('video/')));

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 text-mist">
        <div className="text-4xl mb-3">📷</div>
        <p className="font-medium">No photos yet</p>
        <p className="text-sm mt-1">Upload images or videos to see them here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {photos.map((doc) => (
        <div key={doc.id} className="relative group rounded-xl overflow-hidden bg-linen aspect-square">
          {doc.type.startsWith('image/') ? (
            <img
              src={doc.url}
              alt={doc.name}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              src={doc.url}
              muted
              className="w-full h-full object-cover"
            />
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <a
              href={doc.url}
              target="_blank"
              rel="noreferrer"
              className="text-white text-xs bg-white/20 hover:bg-white/30 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              Open
            </a>
            <button
              onClick={() => onRemove(doc.id)}
              className="text-white text-xs bg-red-500/70 hover:bg-red-600/80 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
          {/* Name label */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-white text-xs truncate">{doc.name}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function Documents({ project, updateProject, uid }) {
  const [filter, setFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('documents'); // 'documents' | 'photos'
  const [uploadError, setUploadError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const { upload, progress } = useUpload(uid);

  const docs = project?.documents ?? [];

  function addDoc() {
    updateProject({ documents: [...docs, newDoc()] });
  }

  function updateDoc(id, patch) {
    updateProject({ documents: docs.map((d) => (d.id === id ? { ...d, ...patch } : d)) });
  }

  async function removeDoc(id) {
    const doc = docs.find((d) => d.id === id);
    if (doc?.storagePath) {
      try {
        await deleteObject(storageRef(storage, doc.storagePath));
      } catch (e) {
        // Storage object may already be gone — continue with Firestore removal
        console.warn('Storage delete failed (may already be removed):', e);
      }
    }
    updateProject({ documents: docs.filter((d) => d.id !== id) });
  }

  async function handleFiles(files) {
    setUploadError('');
    const file = files[0];
    if (!file) return;
    try {
      const newDocObj = await upload(file, null);
      updateProject({ documents: [...docs, newDocObj] });
    } catch (e) {
      setUploadError(e.message ?? 'Upload failed.');
    }
  }

  function onFileInputChange(e) {
    handleFiles(e.target.files);
    e.target.value = '';
  }

  function onDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  function onDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function onDragLeave() {
    setIsDragging(false);
  }

  // Filter logic (only applies to Documents tab)
  const FILTER_TABS = ['All', ...CATEGORIES];
  const filtered = filter === 'All' ? docs : docs.filter((d) => d.category === filter);
  const presentFilters = FILTER_TABS.filter((f) => f === 'All' || docs.some((d) => d.category === f));

  return (
    <div
      className={`p-6 max-w-3xl mx-auto ${isDragging ? 'ring-2 ring-forest ring-inset rounded-2xl' : ''}`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,.heic,.heif"
        className="hidden"
        onChange={onFileInputChange}
      />

      <div className="flex items-start justify-between mb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Documents
          </h1>
          <p className="text-sage text-sm mt-0.5">
            Blueprints, permits, contracts, photos, and anything else for your build.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={progress !== null}
            className="flex items-center gap-1.5 border border-forest text-forest text-sm px-3 py-2 rounded-lg hover:bg-forest/5 transition-colors disabled:opacity-50"
          >
            <Upload size={14} /> Upload File
          </button>
          <button
            onClick={addDoc}
            disabled={progress !== null}
            className="flex items-center gap-1.5 bg-forest text-white text-sm px-4 py-2 rounded-lg hover:bg-deep transition-colors disabled:opacity-50"
          >
            <Plus size={15} /> Add Link
          </button>
        </div>
      </div>

      {/* Upload progress bar */}
      {progress !== null && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-mist mb-1">
            <span>Uploading…</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-linen rounded-full overflow-hidden">
            <div
              className="h-full bg-forest rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload error */}
      {uploadError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 flex items-center justify-between">
          <span>{uploadError}</span>
          <button onClick={() => setUploadError('')} className="text-red-400 hover:text-red-600 ml-2">✕</button>
        </div>
      )}

      {/* Drag hint */}
      {isDragging && (
        <div className="mb-4 bg-forest/10 border-2 border-dashed border-forest/40 rounded-xl px-4 py-6 text-center text-sm text-forest font-medium">
          Drop to upload
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 mb-4 bg-linen/50 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('documents')}
          className={`text-xs font-medium px-4 py-1.5 rounded-lg transition-colors ${
            activeTab === 'documents' ? 'bg-white text-ink shadow-sm' : 'text-mist hover:text-ink'
          }`}
        >
          Documents
        </button>
        <button
          onClick={() => setActiveTab('photos')}
          className={`text-xs font-medium px-4 py-1.5 rounded-lg transition-colors ${
            activeTab === 'photos' ? 'bg-white text-ink shadow-sm' : 'text-mist hover:text-ink'
          }`}
        >
          Photos
        </button>
      </div>

      {/* ── Documents tab ── */}
      {activeTab === 'documents' && (
        <>
          {/* How it works — shown only when empty and no uploads */}
          {docs.length === 0 && (
            <div className="bg-forest/5 border border-forest/20 rounded-xl p-4 mb-6 text-sm text-ink space-y-1">
              <p className="font-medium text-forest">Two ways to add files</p>
              <ul className="list-disc pl-4 space-y-1 text-mist">
                <li>Click <strong>Upload File</strong> to upload directly from your device</li>
                <li>Click <strong>Add Link</strong> to paste a Google Drive or Dropbox link</li>
              </ul>
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
              <p className="text-sm mt-1">Upload a file or add a link to get started.</p>
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
        </>
      )}

      {/* ── Photos tab ── */}
      {activeTab === 'photos' && (
        <PhotosGrid docs={docs} onRemove={removeDoc} />
      )}
    </div>
  );
}
