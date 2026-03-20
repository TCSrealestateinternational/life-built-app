import { useState, useEffect, useRef } from 'react';
import { doc, getDoc, updateDoc, setDoc, increment } from 'firebase/firestore';
import { ref as storageRef, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useUpload } from '../hooks/useUpload';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { MapPin, Calendar, DollarSign, FolderOpen, Image, Users, MessageSquare, Upload, Download, Share2, Smartphone, X } from 'lucide-react';

// ─── Portal Install Banner ─────────────────────────────────────────────────────

const PORTAL_DISMISS_KEY = 'pwa_portal_install_dismissed';

function PortalInstallBanner() {
  const installPrompt = useInstallPrompt();
  const [dismissed, setDismissed] = useState(() => !!localStorage.getItem(PORTAL_DISMISS_KEY));

  if (installPrompt.isInstalled) return null;
  if (!installPrompt.isInstallable) return null;
  if (dismissed) return null;

  function dismiss() {
    localStorage.setItem(PORTAL_DISMISS_KEY, '1');
    setDismissed(true);
  }

  async function handleInstall() {
    const outcome = await installPrompt.triggerPrompt();
    if (outcome === 'accepted') setDismissed(true);
  }

  return (
    <div className="mt-6 bg-white border border-linen rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-start gap-3 p-4">
        <div className="shrink-0 w-10 h-10 bg-forest rounded-xl flex items-center justify-center">
          <Smartphone size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink">Add Waymark Build to your home screen</p>
          {installPrompt.isIOS ? (
            <p className="text-xs text-mist mt-0.5 leading-snug">
              Tap <Share2 size={11} className="inline mx-0.5 text-blue-500" /> <strong>Share</strong> → <strong>"Add to Home Screen"</strong> for one-tap access
            </p>
          ) : (
            <p className="text-xs text-mist mt-0.5">Install for quick access — works offline too</p>
          )}
        </div>
        <button onClick={dismiss} className="shrink-0 p-1 text-mist hover:text-ink transition-colors">
          <X size={15} />
        </button>
      </div>
      {!installPrompt.isIOS && (
        <div className="px-4 pb-4 flex gap-2">
          <button
            onClick={handleInstall}
            className="flex items-center gap-1.5 bg-forest text-white text-sm px-4 py-2 rounded-xl hover:bg-deep transition-colors font-medium"
          >
            <Download size={14} /> Install App
          </button>
          <button onClick={dismiss} className="text-sm text-mist hover:text-ink px-3 transition-colors">
            Not now
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Section icons / labels used in tabs ─────────────────────────────────────

const PORTAL_SECTIONS = [
  { id: 'timeline',  label: 'Timeline',  icon: Calendar,       emoji: '📅' },
  { id: 'budget',    label: 'Budget',    icon: DollarSign,     emoji: '💰' },
  { id: 'documents', label: 'Documents', icon: FolderOpen,     emoji: '📁' },
  { id: 'photos',    label: 'Photos',    icon: Image,          emoji: '📷' },
  { id: 'messages',  label: 'Messages',  icon: MessageSquare,  emoji: '💬' },
  { id: 'contacts',  label: 'Team',      icon: Users,          emoji: '👥' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d) {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(day, 10)}, ${y}`;
}

function dollars(n) {
  const v = parseFloat(n) || 0;
  return v > 0 ? `$${v.toLocaleString()}` : '—';
}

// ─── Activity feed helper ─────────────────────────────────────────────────────

function appendActivity(feed, entry) {
  const next = [...(feed ?? []), { id: Date.now().toString(), ...entry }];
  return next.length > 50 ? next.slice(-50) : next;
}

// ─── Error / Loading screens ──────────────────────────────────────────────────

function StatusScreen({ title, body, cta }) {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">{cta ? '🔗' : '🔒'}</div>
        <h1 className="text-xl font-bold text-ink mb-2"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{title}</h1>
        <p className="text-sm text-mist mb-6">{body}</p>
        <a
          href="/"
          className="inline-block text-sm text-forest border border-forest/30 px-5 py-2.5 rounded-lg hover:bg-forest hover:text-white transition-colors"
        >
          Create Your Own Planning Account →
        </a>
      </div>
    </div>
  );
}

// ─── Section: Timeline ────────────────────────────────────────────────────────

function TimelineSection({ project, canEdit, member, onSave }) {
  const milestones = project?.timeline?.milestones ?? [];
  const done = milestones.filter((m) => m.done).length;
  const total = milestones.length;

  const [expandedNotes, setExpandedNotes] = useState(null);
  const [localNotes, setLocalNotes] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');

  function saveMilestones(newMilestones, detail) {
    onSave({
      timeline: { ...project.timeline, milestones: newMilestones },
      activityFeed: appendActivity(project.activityFeed, {
        type: 'timeline',
        by: member.name,
        at: new Date().toISOString(),
        detail,
      }),
    });
  }

  function updateMilestone(id, patch) {
    const m = milestones.find((ms) => ms.id === id);
    const newMilestones = milestones.map((ms) =>
      ms.id === id ? { ...ms, ...patch, editedBy: { name: member.name, at: new Date().toISOString() } } : ms
    );
    saveMilestones(newMilestones, `Updated milestone "${m?.title || 'milestone'}"`);
  }

  function addMilestone() {
    if (!newTitle.trim()) return;
    const today = new Date().toISOString().slice(0, 10);
    const m = {
      id: `m_${Date.now()}`,
      title: newTitle.trim(),
      start: newStart || today,
      end: newEnd || newStart || today,
      progress: 0,
      done: false,
      notes: '',
      photos: [],
      linkedDocs: [],
      createdBy: { name: member.name, at: new Date().toISOString() },
    };
    saveMilestones([...milestones, m], `Added milestone "${m.title}"`);
    setNewTitle('');
    setNewStart('');
    setNewEnd('');
    setShowAddForm(false);
  }

  if (total === 0 && !canEdit) return <p className="text-sm text-mist">No milestones added yet.</p>;

  return (
    <div>
      {/* Progress */}
      {total > 0 && (
        <div className="bg-white rounded-xl border border-linen p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-ink">{done}/{total} milestones complete</span>
            <span className="text-xs text-mist">{Math.round((done / total) * 100)}%</span>
          </div>
          <div className="h-2 bg-linen rounded-full overflow-hidden">
            <div className="h-full bg-forest rounded-full" style={{ width: `${(done / total) * 100}%` }} />
          </div>
        </div>
      )}
      {total === 0 && <p className="text-sm text-mist mb-4">No milestones added yet.</p>}
      {/* Milestone list */}
      <div className="space-y-2">
        {milestones.map((m, i) => {
          const start = m.start || m.targetDate;
          const pct = typeof m.progress === 'number' ? m.progress : (m.done ? 100 : 0);
          return (
            <div
              key={m.id ?? i}
              className={`bg-white rounded-xl border p-4 ${m.done ? 'border-forest/20 bg-forest/5' : 'border-linen'}`}
            >
              <div className="flex items-start gap-3">
                {canEdit ? (
                  <input
                    type="checkbox"
                    checked={!!m.done}
                    onChange={(e) => updateMilestone(m.id, { done: e.target.checked, progress: e.target.checked ? 100 : pct })}
                    className="accent-forest shrink-0 mt-0.5"
                  />
                ) : (
                  <span className="text-xs text-mist w-5 text-right mt-0.5 shrink-0">{i + 1}</span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm ${m.done ? 'line-through text-mist' : 'text-ink font-medium'}`}>
                      {m.title}
                    </span>
                    {m.done && <span className="text-xs text-forest font-medium">✓</span>}
                  </div>
                  {(start || m.end) && (
                    <p className="text-xs text-mist mt-0.5">
                      {fmtDate(start)}{m.end && m.end !== start ? ` → ${fmtDate(m.end)}` : ''}
                    </p>
                  )}
                  {m.notes && <p className="text-xs text-sage mt-1 italic">{m.notes}</p>}
                  {pct > 0 && !m.done && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1 bg-linen rounded-full overflow-hidden">
                        <div className="h-full bg-forest rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-mist">{pct}%</span>
                    </div>
                  )}
                  {canEdit && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-mist w-14 shrink-0">Progress</label>
                        <input
                          type="range" min={0} max={100} step={5} value={pct}
                          onChange={(e) => updateMilestone(m.id, { progress: Number(e.target.value) })}
                          className="flex-1 accent-forest"
                        />
                        <span className="text-xs text-mist w-8 text-right">{pct}%</span>
                      </div>
                      <button
                        onClick={() => setExpandedNotes(expandedNotes === m.id ? null : m.id)}
                        className="text-xs text-forest hover:underline flex items-center gap-1"
                      >
                        ✏️ {expandedNotes === m.id ? 'Hide notes' : 'Edit notes'}
                      </button>
                      {expandedNotes === m.id && (
                        <textarea
                          value={localNotes[m.id] ?? m.notes ?? ''}
                          onChange={(e) => setLocalNotes((prev) => ({ ...prev, [m.id]: e.target.value }))}
                          onBlur={(e) => updateMilestone(m.id, { notes: e.target.value })}
                          placeholder="Add notes…"
                          rows={2}
                          className="w-full text-sm border border-linen rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-forest/40 resize-none"
                        />
                      )}
                    </div>
                  )}
                  {m.editedBy && (
                    <p className="text-xs text-sage mt-1">Edited by {m.editedBy.name} · {fmtDate(m.editedBy.at)}</p>
                  )}
                  {m.createdBy && (
                    <p className="text-xs text-sage mt-0.5">Added by {m.createdBy.name} · {fmtDate(m.createdBy.at)}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Add Milestone */}
      {canEdit && (
        <div className="mt-4">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 text-xs text-forest hover:underline"
            >
              + Add Milestone
            </button>
          ) : (
            <div className="bg-white rounded-xl border border-linen p-4 space-y-3">
              <p className="text-xs font-semibold text-ink">New Milestone</p>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Title (required)…"
                className="w-full text-sm border border-linen rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-forest/40"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-mist mb-1 block">Start</label>
                  <input type="date" value={newStart} onChange={(e) => setNewStart(e.target.value)}
                    className="w-full text-sm border border-linen rounded-lg px-3 py-1.5 focus:outline-none focus:border-forest" />
                </div>
                <div>
                  <label className="text-xs text-mist mb-1 block">End</label>
                  <input type="date" value={newEnd} onChange={(e) => setNewEnd(e.target.value)}
                    className="w-full text-sm border border-linen rounded-lg px-3 py-1.5 focus:outline-none focus:border-forest" />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addMilestone}
                  disabled={!newTitle.trim()}
                  className="text-sm bg-forest text-white px-4 py-1.5 rounded-lg hover:bg-deep transition-colors disabled:opacity-40"
                >
                  Add
                </button>
                <button
                  onClick={() => { setShowAddForm(false); setNewTitle(''); setNewStart(''); setNewEnd(''); }}
                  className="text-sm text-mist hover:text-ink px-3"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Section: Budget ──────────────────────────────────────────────────────────

function BudgetSection({ project }) {
  const items = project?.budget?.items ?? [];
  if (items.length === 0) return <p className="text-sm text-mist">No budget items yet.</p>;

  const totalPlanned = items.reduce((s, i) => s + (parseFloat(i.planned) || 0), 0);
  const totalActual = items.reduce((s, i) => s + (parseFloat(i.actual) || 0), 0);

  // Group by category
  const byCategory = {};
  items.forEach((item) => {
    const cat = item.category || 'Uncategorized';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(item);
  });

  return (
    <div>
      {/* Totals */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-xl border border-linen p-4 text-center">
          <div className="text-lg font-bold text-ink">{dollars(totalPlanned)}</div>
          <div className="text-xs text-mist">Total Planned</div>
        </div>
        <div className="bg-white rounded-xl border border-linen p-4 text-center">
          <div className="text-lg font-bold text-forest">{dollars(totalActual)}</div>
          <div className="text-xs text-mist">Total Actual</div>
        </div>
      </div>
      {/* Table */}
      <div className="bg-white rounded-xl border border-linen overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream border-b border-linen">
            <tr>
              <th className="text-left px-4 py-2 text-xs font-semibold text-mist">Category</th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-mist hidden sm:table-cell">Description</th>
              <th className="text-right px-4 py-2 text-xs font-semibold text-mist">Planned</th>
              <th className="text-right px-4 py-2 text-xs font-semibold text-mist">Actual</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-linen last:border-0">
                <td className="px-4 py-2 text-xs text-mist">{item.category}</td>
                <td className="px-4 py-2 hidden sm:table-cell">{item.description}</td>
                <td className="px-4 py-2 text-right">{dollars(item.planned)}</td>
                <td className="px-4 py-2 text-right">{dollars(item.actual)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-cream border-t border-linen">
            <tr>
              <td colSpan={2} className="px-4 py-2 text-xs font-semibold text-mist hidden sm:table-cell">Total</td>
              <td className="px-4 py-2 text-xs font-semibold text-mist sm:hidden">Total</td>
              <td className="px-4 py-2 text-right font-semibold">{dollars(totalPlanned)}</td>
              <td className="px-4 py-2 text-right font-semibold">{dollars(totalActual)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ─── Section: Documents ───────────────────────────────────────────────────────

function DocumentsSection({ project, canEdit, member, onSave, uid }) {
  const docs = project?.documents ?? [];
  const fileInputRef = useRef(null);
  const { upload, progress } = useUpload(uid);
  const [uploadError, setUploadError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  async function handleFiles(files) {
    setUploadError('');
    const file = files[0];
    if (!file) return;
    try {
      const newDoc = await upload(file, null);
      newDoc.uploadedBy = { name: member.name, at: new Date().toISOString() };
      onSave({
        documents: [...docs, newDoc],
        activityFeed: appendActivity(project.activityFeed, {
          type: 'documents',
          by: member.name,
          at: new Date().toISOString(),
          detail: `Uploaded "${file.name}"`,
        }),
      });
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

  // Group non-media docs by category for display
  const displayDocs = docs.filter((d) => !d.type || (!d.type.startsWith('image/') && !d.type.startsWith('video/')));

  if (displayDocs.length === 0 && !canEdit) return <p className="text-sm text-mist">No documents shared yet.</p>;

  const byCategory = {};
  displayDocs.forEach((d) => {
    const cat = d.category || 'General';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(d);
  });

  return (
    <div
      className={isDragging ? 'ring-2 ring-forest ring-inset rounded-2xl' : ''}
      onDrop={canEdit ? onDrop : undefined}
      onDragOver={canEdit ? (e) => { e.preventDefault(); setIsDragging(true); } : undefined}
      onDragLeave={canEdit ? () => setIsDragging(false) : undefined}
    >
      {canEdit && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,.heic,.heif"
            className="hidden"
            onChange={onFileInputChange}
          />
          <div className="mb-4 flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={progress !== null}
              className="flex items-center gap-1.5 text-xs text-forest border border-forest/30 px-3 py-1.5 rounded-lg hover:bg-forest/5 transition-colors disabled:opacity-50"
            >
              <Upload size={13} /> Upload File
            </button>
            {progress !== null && (
              <div className="flex-1 max-w-40">
                <div className="h-1.5 bg-linen rounded-full overflow-hidden">
                  <div className="h-full bg-forest rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </div>
          {uploadError && (
            <div className="mb-3 text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {uploadError}
            </div>
          )}
        </>
      )}

      {displayDocs.length === 0 ? (
        <p className="text-sm text-mist">No documents shared yet.</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(byCategory).map(([cat, items]) => (
            <div key={cat}>
              <p className="text-xs font-semibold text-mist uppercase tracking-wider mb-2">{cat}</p>
              <div className="space-y-2">
                {items.map((d) => (
                  <div key={d.id} className="bg-white rounded-xl border border-linen p-4 flex items-center gap-3">
                    <FolderOpen size={16} className="text-forest shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{d.name}</p>
                      {d.notes && <p className="text-xs text-mist truncate">{d.notes}</p>}
                    </div>
                    {d.url && (
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-forest hover:underline shrink-0 border border-forest/30 px-2.5 py-1 rounded-lg hover:bg-forest/5 transition-colors"
                      >
                        Open
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Section: Progress Photos ─────────────────────────────────────────────────

function PhotosSection({ project, canEdit, member, onSave, uid }) {
  const [showForm, setShowForm] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const fileInputRef = useRef(null);
  const { upload, progress } = useUpload(uid);
  const [uploadError, setUploadError] = useState('');

  // Aggregate milestone photos + team-added URL photos + uploaded docs that are images/videos
  const allPhotos = [];
  (project?.timeline?.milestones ?? []).forEach((m) => {
    (m.photos ?? []).forEach((p) => {
      if (p.url) allPhotos.push({ ...p, milestoneName: m.title, source: 'milestone' });
    });
  });
  (project?.teamPhotos ?? []).forEach((p) => {
    if (p.url) allPhotos.push({ ...p, source: 'team' });
  });
  (project?.documents ?? []).forEach((d) => {
    if (d.source === 'upload' && d.type && (d.type.startsWith('image/') || d.type.startsWith('video/'))) {
      allPhotos.push({
        id: d.id,
        url: d.url,
        caption: d.name,
        addedBy: d.uploadedBy ?? null,
        source: 'uploaded-doc',
        storagePath: d.storagePath,
      });
    }
  });

  function addPhoto() {
    const url = newUrl.trim();
    if (!url) return;
    const photo = {
      id: `tp_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      url,
      caption: newCaption.trim(),
      addedBy: { name: member.name, at: new Date().toISOString() },
    };
    const updated = [...(project?.teamPhotos ?? []), photo];
    onSave({
      teamPhotos: updated,
      activityFeed: appendActivity(project.activityFeed, {
        type: 'photos',
        by: member.name,
        at: new Date().toISOString(),
        detail: `Added progress photo${photo.caption ? ` "${photo.caption}"` : ''}`,
      }),
    });
    setNewUrl('');
    setNewCaption('');
    setShowForm(false);
  }

  function removeTeamPhoto(id) {
    if (!confirm('Remove this photo?')) return;
    const updated = (project?.teamPhotos ?? []).filter((p) => p.id !== id);
    onSave({
      teamPhotos: updated,
      activityFeed: appendActivity(project.activityFeed, {
        type: 'photos',
        by: member.name,
        at: new Date().toISOString(),
        detail: 'Removed a progress photo',
      }),
    });
  }

  async function removeUploadedPhoto(id, storagePath) {
    if (!confirm('Delete this photo permanently?')) return;
    if (storagePath) {
      try { await deleteObject(storageRef(storage, storagePath)); } catch (e) { /* already gone */ }
    }
    const updatedDocs = (project?.documents ?? []).filter((d) => d.id !== id);
    onSave({
      documents: updatedDocs,
      activityFeed: appendActivity(project.activityFeed, {
        type: 'photos',
        by: member.name,
        at: new Date().toISOString(),
        detail: 'Deleted an uploaded photo',
      }),
    });
  }

  async function handleUploadFiles(files) {
    setUploadError('');
    const file = files[0];
    if (!file) return;
    try {
      const newDoc = await upload(file, 'Photos');
      newDoc.uploadedBy = { name: member.name, at: new Date().toISOString() };
      const updatedDocs = [...(project?.documents ?? []), newDoc];
      onSave({
        documents: updatedDocs,
        activityFeed: appendActivity(project.activityFeed, {
          type: 'photos',
          by: member.name,
          at: new Date().toISOString(),
          detail: `Uploaded photo "${file.name}"`,
        }),
      });
    } catch (e) {
      setUploadError(e.message ?? 'Upload failed.');
    }
  }

  return (
    <div>
      {canEdit && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,.heic,.heif"
            className="hidden"
            onChange={(e) => { handleUploadFiles(e.target.files); e.target.value = ''; }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={progress !== null}
            className="flex items-center gap-1.5 text-xs text-forest border border-forest/30 px-3 py-1.5 rounded-lg hover:bg-forest/5 transition-colors disabled:opacity-50"
          >
            <Upload size={13} /> Upload Photo
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 text-xs text-forest hover:underline"
          >
            + Add Link
          </button>
          {progress !== null && (
            <div className="flex-1 max-w-40">
              <div className="h-1.5 bg-linen rounded-full overflow-hidden">
                <div className="h-full bg-forest rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
          {uploadError && (
            <span className="text-xs text-red-500">{uploadError}</span>
          )}
        </div>
      )}

      {canEdit && showForm && (
        <div className="bg-white rounded-xl border border-linen p-4 space-y-3 mb-4">
          <p className="text-xs font-semibold text-ink">Add Progress Photo by URL</p>
          <div>
            <label className="text-xs text-mist mb-1 block">Photo URL (required)</label>
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://photos.google.com/… or any public image URL"
              className="w-full text-sm border border-linen rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-forest/40"
            />
          </div>
          <div>
            <label className="text-xs text-mist mb-1 block">Caption (optional)</label>
            <input
              type="text"
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
              placeholder="e.g. Framing complete, north wall"
              className="w-full text-sm border border-linen rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-forest/40"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={addPhoto}
              disabled={!newUrl.trim()}
              className="text-sm bg-forest text-white px-4 py-1.5 rounded-lg hover:bg-deep transition-colors disabled:opacity-40"
            >
              Add Photo
            </button>
            <button
              onClick={() => { setShowForm(false); setNewUrl(''); setNewCaption(''); }}
              className="text-sm text-mist hover:text-ink px-3"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {allPhotos.length === 0 ? (
        <p className="text-sm text-mist">No progress photos shared yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {allPhotos.map((p, i) => (
            <div
              key={p.id ?? i}
              className="bg-white rounded-xl border border-linen p-4 flex items-start gap-3 group"
            >
              <a href={p.url} target="_blank" rel="noreferrer" className="shrink-0 mt-0.5">
                <Image size={20} className="text-forest hover:text-deep transition-colors" />
              </a>
              <div className="flex-1 min-w-0">
                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-ink hover:text-forest transition-colors truncate block"
                >
                  {p.caption || `Photo ${i + 1}`}
                </a>
                {p.milestoneName && (
                  <p className="text-xs text-mist truncate">{p.milestoneName}</p>
                )}
                {p.addedBy && (
                  <p className="text-xs text-sage mt-0.5">
                    Added by {p.addedBy.name} · {fmtDate(p.addedBy.at)}
                  </p>
                )}
              </div>
              {canEdit && p.source === 'team' && (
                <button
                  onClick={() => removeTeamPhoto(p.id)}
                  className="shrink-0 text-mist hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 text-xs"
                  title="Remove photo"
                >
                  ✕
                </button>
              )}
              {canEdit && p.source === 'uploaded-doc' && (
                <button
                  onClick={() => removeUploadedPhoto(p.id, p.storagePath)}
                  className="shrink-0 text-mist hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 text-xs"
                  title="Delete photo"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Section: Messages ────────────────────────────────────────────────────────

const LOG_TYPES_PORTAL = ['Meeting', 'Call', 'Email', 'Site Visit', 'Other'];
const TYPE_STYLES_PORTAL = {
  Meeting:        'bg-blue-50 text-blue-600 border-blue-200',
  Call:           'bg-green-50 text-green-600 border-green-200',
  Email:          'bg-amber-50 text-amber-600 border-amber-200',
  'Site Visit':   'bg-purple-50 text-purple-600 border-purple-200',
  Other:          'bg-linen text-mist border-linen',
  // owner-created types
  Decision:       'bg-blue-100 text-blue-700 border-blue-200',
  Communication:  'bg-linen text-mist border-linen',
  Agreement:      'bg-green-100 text-green-700 border-green-200',
  Issue:          'bg-red-100 text-red-600 border-red-200',
  'Change Request': 'bg-amber-100 text-amber-700 border-amber-200',
};

function MessagesSection({ project, canEdit, member, onSave }) {
  const entries = project?.communicationLog ?? [];
  const todos = project?.todos ?? [];

  const [showLogForm, setShowLogForm] = useState(false);
  const [newLogTitle, setNewLogTitle] = useState('');
  const [newLogDate, setNewLogDate] = useState(new Date().toISOString().slice(0, 10));
  const [newLogType, setNewLogType] = useState('Meeting');
  const [newLogParties, setNewLogParties] = useState('');
  const [newLogDesc, setNewLogDesc] = useState('');
  const [addingNoteTo, setAddingNoteTo] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoDue, setNewTodoDue] = useState('');

  function saveLog(newEntries, detail) {
    onSave({
      communicationLog: newEntries,
      activityFeed: appendActivity(project.activityFeed, {
        type: 'messages',
        by: member.name,
        at: new Date().toISOString(),
        detail,
      }),
    });
  }

  function saveTodos(newTodos, detail) {
    onSave({
      todos: newTodos,
      activityFeed: appendActivity(project.activityFeed, {
        type: 'messages',
        by: member.name,
        at: new Date().toISOString(),
        detail,
      }),
    });
  }

  function addLogEntry() {
    if (!newLogTitle.trim()) return;
    const entry = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      title: newLogTitle.trim(),
      date: newLogDate,
      type: newLogType,
      parties: newLogParties,
      description: newLogDesc,
      outcome: '',
      notes: '',
      addedBy: { name: member.name, at: new Date().toISOString() },
      teamNotes: [],
    };
    saveLog([...entries, entry], `Added log entry "${entry.title}"`);
    setNewLogTitle('');
    setNewLogDate(new Date().toISOString().slice(0, 10));
    setNewLogType('Meeting');
    setNewLogParties('');
    setNewLogDesc('');
    setShowLogForm(false);
  }

  function addNote(entryId) {
    if (!noteText.trim()) return;
    const note = { id: `n_${Date.now()}`, text: noteText.trim(), by: member.name, at: new Date().toISOString() };
    const newEntries = entries.map((e) =>
      e.id === entryId ? { ...e, teamNotes: [...(e.teamNotes ?? []), note] } : e
    );
    const entry = entries.find((e) => e.id === entryId);
    saveLog(newEntries, `Added note to "${entry?.title || 'entry'}"`);
    setNoteText('');
    setAddingNoteTo(null);
  }

  function toggleTodo(id) {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    const updated = todo.done
      ? { ...todo, done: false, completedBy: null }
      : { ...todo, done: true, completedBy: { name: member.name, at: new Date().toISOString() } };
    saveTodos(
      todos.map((t) => (t.id === id ? updated : t)),
      todo.done ? `Reopened to-do "${todo.text}"` : `Completed to-do "${todo.text}"`
    );
  }

  function addTodo() {
    if (!newTodoText.trim()) return;
    const todo = {
      id: `todo_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      text: newTodoText.trim(),
      done: false,
      dueDate: newTodoDue,
      assignedTo: '',
      createdBy: { name: member.name, at: new Date().toISOString() },
    };
    saveTodos([...todos, todo], `Added to-do "${todo.text}"`);
    setNewTodoText('');
    setNewTodoDue('');
    setShowTodoForm(false);
  }

  const sortedEntries = [...entries].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  return (
    <div className="space-y-8">
      {/* Communication Log */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-ink">Communication Log</h2>
          {canEdit && (
            <button
              onClick={() => setShowLogForm(!showLogForm)}
              className="text-xs text-forest hover:underline"
            >
              + Add Entry
            </button>
          )}
        </div>
        {canEdit && showLogForm && (
          <div className="bg-white rounded-xl border border-linen p-4 mb-3 space-y-3">
            <input
              type="text"
              value={newLogTitle}
              onChange={(e) => setNewLogTitle(e.target.value)}
              placeholder="Title / subject…"
              className="w-full text-sm border border-linen rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-forest/40"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-mist mb-1 block">Date</label>
                <input type="date" value={newLogDate} onChange={(e) => setNewLogDate(e.target.value)}
                  className="w-full text-sm border border-linen rounded-lg px-3 py-1.5 focus:outline-none focus:border-forest" />
              </div>
              <div>
                <label className="text-xs text-mist mb-1 block">Type</label>
                <select value={newLogType} onChange={(e) => setNewLogType(e.target.value)}
                  className="w-full text-sm border border-linen rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:border-forest">
                  {LOG_TYPES_PORTAL.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <input
              type="text"
              value={newLogParties}
              onChange={(e) => setNewLogParties(e.target.value)}
              placeholder="Parties involved…"
              className="w-full text-sm border border-linen rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-forest/40"
            />
            <textarea
              value={newLogDesc}
              onChange={(e) => setNewLogDesc(e.target.value)}
              placeholder="Description…"
              rows={2}
              className="w-full text-sm border border-linen rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-forest/40 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={addLogEntry}
                disabled={!newLogTitle.trim()}
                className="text-sm bg-forest text-white px-4 py-1.5 rounded-lg hover:bg-deep transition-colors disabled:opacity-40"
              >
                Save Entry
              </button>
              <button onClick={() => setShowLogForm(false)} className="text-sm text-mist hover:text-ink px-3">
                Cancel
              </button>
            </div>
          </div>
        )}
        {sortedEntries.length === 0 ? (
          <p className="text-sm text-mist">No log entries yet.</p>
        ) : (
          <div className="space-y-2">
            {sortedEntries.map((entry) => {
              const typeStyle = TYPE_STYLES_PORTAL[entry.type] ?? 'bg-linen text-mist border-linen';
              return (
                <div key={entry.id} className="bg-white rounded-xl border border-linen p-4">
                  <div className="flex items-start gap-2 flex-wrap mb-1">
                    <span className="text-sm font-medium text-ink">{entry.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${typeStyle}`}>{entry.type}</span>
                  </div>
                  {(entry.date || entry.parties) && (
                    <p className="text-xs text-mist mt-0.5">
                      {fmtDate(entry.date)}{entry.parties ? ` · ${entry.parties}` : ''}
                    </p>
                  )}
                  {entry.description && <p className="text-xs text-sage mt-1">{entry.description}</p>}
                  {entry.addedBy && (
                    <p className="text-xs text-sage mt-1">Added by {entry.addedBy.name} · {fmtDate(entry.addedBy.at)}</p>
                  )}
                  {(entry.teamNotes ?? []).length > 0 && (
                    <div className="mt-2 space-y-1">
                      {(entry.teamNotes ?? []).map((n) => (
                        <div key={n.id} className="pl-3 border-l-2 border-linen text-xs text-mist">
                          <span className="font-medium text-ink">{n.by}:</span> {n.text}
                        </div>
                      ))}
                    </div>
                  )}
                  {canEdit && (
                    <div className="mt-2">
                      {addingNoteTo === entry.id ? (
                        <div className="flex gap-2 items-start">
                          <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Add a note…"
                            rows={2}
                            className="flex-1 text-sm border border-linen rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-forest/40 resize-none"
                          />
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => addNote(entry.id)}
                              disabled={!noteText.trim()}
                              className="text-xs bg-forest text-white px-3 py-1.5 rounded-lg hover:bg-deep disabled:opacity-40"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => { setAddingNoteTo(null); setNoteText(''); }}
                              className="text-xs text-mist hover:text-ink px-2"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setAddingNoteTo(entry.id); setNoteText(''); }}
                          className="text-xs text-forest hover:underline"
                        >
                          + Add note
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* To-Dos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-ink">To-Dos</h2>
          {canEdit && (
            <button
              onClick={() => setShowTodoForm(!showTodoForm)}
              className="text-xs text-forest hover:underline"
            >
              + Add To-Do
            </button>
          )}
        </div>
        {canEdit && showTodoForm && (
          <div className="bg-white rounded-xl border border-linen p-4 mb-3 space-y-3">
            <input
              type="text"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              placeholder="To-do item…"
              className="w-full text-sm border border-linen rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-forest/40"
            />
            <div>
              <label className="text-xs text-mist mb-1 block">Due Date (optional)</label>
              <input type="date" value={newTodoDue} onChange={(e) => setNewTodoDue(e.target.value)}
                className="text-sm border border-linen rounded-lg px-3 py-1.5 focus:outline-none focus:border-forest" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={addTodo}
                disabled={!newTodoText.trim()}
                className="text-sm bg-forest text-white px-4 py-1.5 rounded-lg hover:bg-deep transition-colors disabled:opacity-40"
              >
                Add
              </button>
              <button onClick={() => setShowTodoForm(false)} className="text-sm text-mist hover:text-ink px-3">
                Cancel
              </button>
            </div>
          </div>
        )}
        {todos.length === 0 ? (
          <p className="text-sm text-mist">No to-dos yet.</p>
        ) : (
          <div className="space-y-2">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className={`bg-white rounded-xl border p-4 flex items-start gap-3 ${todo.done ? 'border-forest/20 bg-forest/5' : 'border-linen'}`}
              >
                {canEdit ? (
                  <input
                    type="checkbox"
                    checked={!!todo.done}
                    onChange={() => toggleTodo(todo.id)}
                    className="accent-forest shrink-0 mt-0.5"
                  />
                ) : (
                  <span className={`text-xs shrink-0 mt-0.5 ${todo.done ? 'text-forest' : 'text-mist'}`}>
                    {todo.done ? '✓' : '○'}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${todo.done ? 'line-through text-mist' : 'text-ink font-medium'}`}>
                    {todo.text}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    {todo.dueDate && (
                      <span className="text-xs text-mist">Due {fmtDate(todo.dueDate)}</span>
                    )}
                    {todo.completedBy && (
                      <span className="text-xs text-sage">Completed by {todo.completedBy.name}</span>
                    )}
                    {todo.createdBy && !todo.done && (
                      <span className="text-xs text-sage">Added by {todo.createdBy.name}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Section: Team Contacts ───────────────────────────────────────────────────

function ContactsSection({ project }) {
  const team = (project?.team ?? []).filter((m) => m.name);
  if (team.length === 0) return <p className="text-sm text-mist">No team contacts listed.</p>;

  return (
    <div className="space-y-2">
      {team.map((m) => (
        <div key={m.id} className="bg-white rounded-xl border border-linen p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-forest/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-forest">
                {(m.name || '?')[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-ink">{m.name}</p>
              <p className="text-xs text-mist">{m.role}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main SharedPortal ────────────────────────────────────────────────────────

export default function SharedPortal({ token }) {
  const [status, setStatus] = useState('loading');
  const [project, setProject] = useState(null);
  const [member, setMember] = useState(null);
  const [tab, setTab] = useState(null);
  const [uid, setUid] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        // 1. Load and validate token
        const tokenRef = doc(db, 'shareTokens', token);
        const tokenSnap = await getDoc(tokenRef);

        if (!tokenSnap.exists()) { setStatus('notfound'); return; }

        const tokenData = tokenSnap.data();

        if (!tokenData.active) { setStatus('revoked'); return; }
        if (tokenData.expiresAt && tokenData.expiresAt < new Date().toISOString().slice(0, 10)) {
          setStatus('expired');
          return;
        }

        const { uid, memberId } = tokenData;
        setUid(uid);

        // 2. Load project
        const projectRef = doc(db, 'users', uid, 'project', 'data');
        const projectSnap = await getDoc(projectRef);
        if (!projectSnap.exists()) { setStatus('notfound'); return; }
        const projectData = projectSnap.data();

        // 3. Find member + permissions
        const teamMember = (projectData.team ?? []).find((m) => m.id === memberId);
        if (!teamMember) { setStatus('notfound'); return; }

        setProject(projectData);
        setMember(teamMember);

        // Set first visible tab
        const firstVisible = PORTAL_SECTIONS.find(
          (s) => teamMember.permissions?.[s.id]?.view
        );
        setTab(firstVisible?.id ?? null);

        setStatus('active');

        // 4. Record view activity
        try {
          await updateDoc(tokenRef, {
            lastViewed: new Date().toISOString(),
            viewCount: increment(1),
          });
        } catch (e) {
          // Non-critical — activity tracking requires Firestore rules update
        }
      } catch (e) {
        console.error(e);
        setStatus('notfound');
      }
    }
    load();
  }, [token]);

  // ── Portal write helper ───────────────────────────────────────────────────

  async function updatePortalProject(patch) {
    try {
      await setDoc(doc(db, 'users', uid, 'project', 'data'), patch, { merge: true });
      setProject((prev) => ({ ...prev, ...patch }));
    } catch (e) {
      console.error('Portal write failed (check Firestore rules):', e);
      alert('Could not save — please contact the project owner.');
    }
  }

  // ── Loading / error states ────────────────────────────────────────────────

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center text-sm text-mist">
        Loading…
      </div>
    );
  }
  if (status === 'revoked') {
    return (
      <StatusScreen
        title="Link Revoked"
        body="This sharing link has been revoked by the project owner. Contact them for a new link."
      />
    );
  }
  if (status === 'expired') {
    return (
      <StatusScreen
        title="Link Expired"
        body="This sharing link has expired. Contact the project owner to request a new one."
      />
    );
  }
  if (status === 'notfound') {
    return (
      <StatusScreen
        title="Link Not Found"
        body="This link is invalid or the project no longer exists."
        cta
      />
    );
  }

  const perms = member?.permissions ?? {};
  const visibleSections = PORTAL_SECTIONS.filter((s) => perms[s.id]?.view);
  const canEditAny = visibleSections.some((s) => perms[s.id]?.edit);

  // Project address from first property (or fallback)
  const projectAddress =
    (project?.properties ?? []).find((p) => p.address)?.address || 'Build Project';

  return (
    <div className="min-h-screen bg-cream">
      {/* Banner */}
      <div className="bg-forest text-white px-4 py-2.5 text-center text-xs">
        <strong>{canEditAny ? 'Shared project view' : 'Read-only view'}</strong> shared by the project owner ·{' '}
        <a href="/" className="underline hover:no-underline">
          Create your own planning account
        </a>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Project header */}
        <div className="bg-white rounded-2xl border border-linen p-5 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center shrink-0">
            <MapPin size={22} className="text-forest" />
          </div>
          <div className="flex-1 min-w-0">
            <h1
              className="text-lg font-bold text-ink truncate"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              {projectAddress}
            </h1>
            <p className="text-sm text-mist">
              {member.role} View
              {member.name ? ` · ${member.name}` : ''}
            </p>
          </div>
          <div
            className="text-xs font-semibold text-ink shrink-0 hidden sm:block"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            Waymark Build
          </div>
        </div>

        {/* No permissions */}
        {visibleSections.length === 0 && (
          <div className="text-center py-12 text-mist">
            <div className="text-4xl mb-3">🔒</div>
            <p className="font-medium text-ink">Nothing shared yet</p>
            <p className="text-sm mt-1">The project owner hasn't enabled any sections for your view.</p>
          </div>
        )}

        {visibleSections.length > 0 && (
          <>
            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-linen/50 p-1 rounded-xl overflow-x-auto">
              {visibleSections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setTab(s.id)}
                  className={`flex-1 text-xs font-medium px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                    tab === s.id ? 'bg-white text-ink shadow-sm' : 'text-mist hover:text-ink'
                  }`}
                >
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>

            {/* Section content */}
            <div>
              {tab === 'timeline'  && <TimelineSection project={project} canEdit={!!perms.timeline?.edit} member={member} onSave={updatePortalProject} />}
              {tab === 'budget'    && <BudgetSection project={project} />}
              {tab === 'documents' && <DocumentsSection project={project} canEdit={!!perms.documents?.edit} member={member} onSave={updatePortalProject} uid={uid} />}
              {tab === 'photos'    && <PhotosSection project={project} canEdit={!!perms.photos?.edit} member={member} onSave={updatePortalProject} uid={uid} />}
              {tab === 'messages'  && <MessagesSection project={project} canEdit={!!perms.messages?.edit} member={member} onSave={updatePortalProject} />}
              {tab === 'contacts'  && <ContactsSection project={project} />}
            </div>
          </>
        )}

        {/* Install banner */}
        <PortalInstallBanner />

        {/* Footer */}
        <div className="mt-10 text-center text-xs text-mist">
          <p>
            Powered by{' '}
            <a href="/" className="text-forest hover:underline">Waymark Build Planning App</a>
            {' '}· <a href="https://www.lifebuiltinkentucky.com" className="hover:underline">lifebuiltinkentucky.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
