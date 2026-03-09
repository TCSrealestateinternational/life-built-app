import { useState, useRef } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';
import { Upload, FileText, Image, File, Trash2, Download, ExternalLink } from 'lucide-react';

const ACCEPT = '.pdf,.dwg,.dxf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx,.csv,.txt';

const FILE_ICONS = {
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
  csv: FileText,
  txt: FileText,
};

const CATEGORIES = ['All', 'Blueprints & Plans', 'Contracts & Agreements', 'Permits', 'Inspections', 'Photos', 'Other'];

function getExt(name) {
  return name.split('.').pop().toLowerCase();
}

function FileIcon({ name }) {
  const ext = getExt(name);
  const Icon = FILE_ICONS[ext] ?? File;
  return <Icon size={18} className="text-mist shrink-0" />;
}

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Documents({ project, updateProject, uid }) {
  const [uploading, setUploading] = useState([]);
  const [filter, setFilter] = useState('All');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const docs = project?.documents ?? [];

  function uploadFiles(files) {
    Array.from(files).forEach((file) => {
      const uploadId = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const path = `users/${uid}/documents/${uploadId}_${file.name}`;
      const storageRef = ref(storage, path);
      const task = uploadBytesResumable(storageRef, file);

      setUploading((prev) => [...prev, { id: uploadId, name: file.name, progress: 0 }]);

      task.on(
        'state_changed',
        (snap) => {
          const progress = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          setUploading((prev) => prev.map((u) => (u.id === uploadId ? { ...u, progress } : u)));
        },
        (err) => {
          console.error(err);
          setUploading((prev) => prev.filter((u) => u.id !== uploadId));
          alert(`Upload failed: ${file.name}`);
        },
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          const newDoc = {
            id: uploadId,
            name: file.name,
            url,
            path,
            size: file.size,
            category: 'Other',
            uploadedAt: new Date().toISOString(),
          };
          const current = project?.documents ?? [];
          updateProject({ documents: [...current, newDoc] });
          setUploading((prev) => prev.filter((u) => u.id !== uploadId));
        }
      );
    });
  }

  async function removeDoc(doc) {
    if (!confirm(`Delete "${doc.name}"? This cannot be undone.`)) return;
    try {
      await deleteObject(ref(storage, doc.path));
    } catch (e) {
      // If file was already deleted from storage, still remove from list
      console.warn('Storage delete error (may already be deleted):', e);
    }
    updateProject({ documents: docs.filter((d) => d.id !== doc.id) });
  }

  function updateCategory(id, category) {
    updateProject({ documents: docs.map((d) => (d.id === id ? { ...d, category } : d)) });
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(e.dataTransfer.files);
  }

  const filtered = filter === 'All' ? docs : docs.filter((d) => d.category === filter);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
          Documents
        </h1>
        <p className="text-sage text-sm mt-0.5">
          Blueprints, permits, contracts, and anything else you want to keep with your build.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors mb-6 ${
          dragOver ? 'border-forest bg-forest/5' : 'border-linen hover:border-forest/40 hover:bg-cream'
        }`}
      >
        <Upload size={28} className="mx-auto mb-2 text-mist" />
        <p className="text-sm font-medium text-ink">Drop files here or click to browse</p>
        <p className="text-xs text-mist mt-1">PDF, DWG, DXF, images, Word, Excel — up to 50 MB each</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => uploadFiles(e.target.files)}
        />
      </div>

      {/* Upload progress */}
      {uploading.length > 0 && (
        <div className="space-y-2 mb-4">
          {uploading.map((u) => (
            <div key={u.id} className="bg-white border border-linen rounded-lg px-4 py-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-ink truncate">{u.name}</span>
                <span className="text-xs text-mist ml-2 shrink-0">{u.progress}%</span>
              </div>
              <div className="h-1.5 bg-linen rounded-full overflow-hidden">
                <div
                  className="h-full bg-forest rounded-full transition-all"
                  style={{ width: `${u.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category filter */}
      {docs.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {CATEGORIES.filter((c) => c === 'All' || docs.some((d) => d.category === c)).map((c) => (
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

      {/* Document list */}
      {docs.length === 0 && uploading.length === 0 ? (
        <div className="text-center py-12 text-mist">
          <div className="text-4xl mb-3">📁</div>
          <p className="font-medium">No documents yet</p>
          <p className="text-sm mt-1">Upload your blueprints, permits, contracts, and plans above.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((doc) => (
            <div key={doc.id} className="bg-white border border-linen rounded-xl px-4 py-3 flex items-center gap-3">
              <FileIcon name={doc.name} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">{doc.name}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <select
                    value={doc.category}
                    onChange={(e) => updateCategory(doc.id, e.target.value)}
                    className="text-xs border border-linen rounded px-1.5 py-0.5 bg-cream text-mist focus:outline-none focus:ring-1 focus:ring-forest/40"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  {doc.size && <span className="text-xs text-mist">{formatBytes(doc.size)}</span>}
                  {doc.uploadedAt && <span className="text-xs text-mist">{formatDate(doc.uploadedAt)}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-mist hover:text-forest transition-colors p-1"
                  title="Open"
                >
                  <ExternalLink size={15} />
                </a>
                <a
                  href={doc.url}
                  download={doc.name}
                  className="text-mist hover:text-forest transition-colors p-1"
                  title="Download"
                >
                  <Download size={15} />
                </a>
                <button
                  onClick={() => removeDoc(doc)}
                  className="text-red-300 hover:text-red-500 transition-colors p-1"
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
