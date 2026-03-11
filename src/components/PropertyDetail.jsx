import { useState, useRef, useEffect } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import {
  ArrowLeft, Star, Plus, Trash2, ExternalLink, Camera, Mic, MicOff,
  X, ChevronDown, ChevronUp, Globe, School, Car, Droplets,
} from 'lucide-react';
import { STATUS, geocodeAddress, osmEmbedUrl } from '../data/propertyData';

// ─── Shared helpers ────────────────────────────────────────────────────────────

async function uploadFile(uid, propertyId, folder, fileOrBlob, filename) {
  const name = filename || (fileOrBlob.name ? `${Date.now()}_${fileOrBlob.name}` : `${Date.now()}.webm`);
  const path = `users/${uid}/properties/${propertyId}/${folder}/${name}`;
  const storRef = ref(storage, path);
  await new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storRef, fileOrBlob);
    task.on('state_changed', null, reject, resolve);
  });
  return getDownloadURL(storRef);
}

function fmtDate(d) {
  if (!d) return '';
  const [y, mo, day] = d.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(mo, 10) - 1]} ${parseInt(day, 10)}, ${y}`;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StarRating({ value, onChange, size = 20, readonly = false }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => !readonly && onChange?.(n)}
          className={`transition-colors ${readonly ? 'cursor-default' : 'hover:text-amber-400'} ${
            n <= value ? 'text-amber-400' : 'text-linen'
          }`}
        >
          <Star size={size} fill={n <= value ? 'currentColor' : 'none'} strokeWidth={1.5} />
        </button>
      ))}
    </div>
  );
}

const ATTENDEES = ['Self', 'Partner / Spouse', 'Builder / GC', 'Real Estate Agent', 'Family Member'];

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'visits', label: 'Visit Log' },
  { id: 'decision', label: 'Decision' },
  { id: 'location', label: 'Location' },
];

const INPUT = 'w-full border border-linen rounded-lg px-3 py-2 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-forest/40';

// ─── Main component ─────────────────────────────────────────────────────────────

export default function PropertyDetail({ property: p, uid, onChange, onBack, onDelete }) {
  const [tab, setTab] = useState('overview');
  const [geocoding, setGeocoding] = useState(false);
  const [uploadingListing, setUploadingListing] = useState(false);

  // Visit form
  const [vDate, setVDate] = useState(new Date().toISOString().slice(0, 10));
  const [vAttendees, setVAttendees] = useState(['Self']);
  const [vRating, setVRating] = useState(3);
  const [vNotes, setVNotes] = useState('');
  const [vPhotos, setVPhotos] = useState([]);        // URLs already uploaded
  const [vMemo, setVMemo] = useState('');            // URL after upload
  const [uploadingVisit, setUploadingVisit] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordSec, setRecordSec] = useState(0);
  const mrRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  // Visit expand
  const [expandedVisit, setExpandedVisit] = useState(null);

  // Pro / Con inputs
  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // ── Overview handlers ────────────────────────────────────────────────────────

  async function handleGeocode() {
    if (!p.address) return;
    setGeocoding(true);
    const coords = await geocodeAddress(p.address);
    if (coords) {
      onChange({ lat: coords.lat, lon: coords.lon });
    } else {
      alert('Could not locate that address. Try a more specific address including city and state.');
    }
    setGeocoding(false);
  }

  async function handleListingPhotos(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingListing(true);
    try {
      const urls = await Promise.all(
        files.map((f) => uploadFile(uid, p.id, 'listing', f))
      );
      const newPhotos = [...(p.listingPhotos ?? []), ...urls];
      onChange({ listingPhotos: newPhotos, coverPhoto: p.coverPhoto || newPhotos[0] });
    } catch {
      alert('Upload failed. Make sure Firebase Storage is enabled and rules allow authenticated writes.\n\nRules needed:\nallow read, write: if request.auth != null;');
    }
    setUploadingListing(false);
    e.target.value = '';
  }

  function removeListingPhoto(url) {
    const updated = (p.listingPhotos ?? []).filter((u) => u !== url);
    onChange({ listingPhotos: updated, coverPhoto: updated[0] || '' });
  }

  // ── Visit handlers ───────────────────────────────────────────────────────────

  async function handleVisitPhotos(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingVisit(true);
    try {
      const urls = await Promise.all(
        files.map((f) => uploadFile(uid, p.id, 'visits', f))
      );
      setVPhotos((prev) => [...prev, ...urls]);
    } catch {
      alert('Photo upload failed. Check Firebase Storage rules.');
    }
    setUploadingVisit(false);
    e.target.value = '';
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        try {
          const url = await uploadFile(uid, p.id, 'memos', blob, `${Date.now()}.webm`);
          setVMemo(url);
        } catch {
          alert('Voice memo upload failed. Check Firebase Storage rules.');
        }
      };
      mr.start();
      mrRef.current = mr;
      setRecording(true);
      setRecordSec(0);
      timerRef.current = setInterval(() => setRecordSec((s) => s + 1), 1000);
    } catch {
      alert('Microphone access denied or unavailable.');
    }
  }

  function stopRecording() {
    mrRef.current?.stop();
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setRecording(false);
  }

  function saveVisit() {
    if (!vDate) { alert('Please enter a visit date.'); return; }
    const visit = {
      id: `v_${Date.now()}`,
      date: vDate,
      attendees: vAttendees,
      rating: vRating,
      notes: vNotes,
      photos: vPhotos,
      voiceMemo: vMemo,
    };
    onChange({ visits: [...(p.visits ?? []), visit] });
    // reset form
    setVDate(new Date().toISOString().slice(0, 10));
    setVAttendees(['Self']);
    setVRating(3);
    setVNotes('');
    setVPhotos([]);
    setVMemo('');
  }

  function removeVisit(id) {
    if (!confirm('Remove this visit log?')) return;
    onChange({ visits: (p.visits ?? []).filter((v) => v.id !== id) });
  }

  // ── Decision handlers ────────────────────────────────────────────────────────

  function addPro() {
    if (!newPro.trim()) return;
    onChange({ pros: [...(p.pros ?? []), { id: `pro_${Date.now()}`, text: newPro.trim() }] });
    setNewPro('');
  }

  function addCon() {
    if (!newCon.trim()) return;
    onChange({ cons: [...(p.cons ?? []), { id: `con_${Date.now()}`, text: newCon.trim() }] });
    setNewCon('');
  }

  // ── Derived values ───────────────────────────────────────────────────────────

  const mapUrl = p.lat && p.lon ? osmEmbedUrl(p.lat, p.lon) : null;
  const sortedVisits = [...(p.visits ?? [])].sort((a, b) => b.date.localeCompare(a.date));

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 pb-24">
      {/* Back nav */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-mist hover:text-ink text-sm mb-4 transition-colors"
      >
        <ArrowLeft size={16} /> All Properties
      </button>

      {/* Property header */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="text-xl font-bold text-ink leading-snug" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
          {p.address || 'Untitled Property'}
        </h1>
        <button onClick={onDelete} className="text-red-300 hover:text-red-500 shrink-0 mt-1 transition-colors">
          <Trash2 size={16} />
        </button>
      </div>

      {/* Status selector (always visible) */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {Object.entries(STATUS).map(([key, s]) => (
          <button
            key={key}
            onClick={() => onChange({ status: key })}
            className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
              p.status === key ? s.color : 'border-linen text-mist hover:text-ink bg-white'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-linen mb-5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id ? 'border-forest text-forest' : 'border-transparent text-mist hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview ─────────────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="space-y-5">
          {/* Basic info fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-ink mb-1">Address</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={p.address}
                  onChange={(e) => onChange({ address: e.target.value })}
                  placeholder="123 Meadow Ln, Lancaster, KY 40444"
                  className={INPUT + ' flex-1'}
                />
                <button
                  onClick={handleGeocode}
                  disabled={geocoding || !p.address}
                  className="text-xs px-3 py-2 border border-linen rounded-lg text-mist hover:text-forest hover:border-forest disabled:opacity-40 transition-colors whitespace-nowrap"
                >
                  {geocoding ? 'Finding…' : '📍 Map it'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Asking Price ($)</label>
              <input
                type="number"
                value={p.price}
                onChange={(e) => onChange({ price: e.target.value })}
                placeholder="150000"
                className={INPUT}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Acres</label>
              <input
                type="number"
                value={p.acres}
                onChange={(e) => onChange({ acres: e.target.value })}
                placeholder="5.2"
                step="0.1"
                className={INPUT}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-ink mb-1">Zillow / MLS Link</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={p.link}
                  onChange={(e) => onChange({ link: e.target.value })}
                  placeholder="https://zillow.com/…"
                  className={INPUT + ' flex-1'}
                />
                {p.link && (
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-sm text-forest px-3 py-2 border border-linen rounded-lg hover:bg-cream transition-colors"
                  >
                    <ExternalLink size={14} /> View
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Map */}
          {mapUrl ? (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-ink">Map View</label>
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(p.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-mist hover:text-forest flex items-center gap-1 transition-colors"
                >
                  <Globe size={11} /> Open in Google Maps
                </a>
              </div>
              <iframe
                title="property-map"
                src={mapUrl}
                className="w-full h-56 rounded-xl border border-linen"
                style={{ border: 0 }}
              />
              <button
                onClick={() => onChange({ lat: null, lon: null })}
                className="text-xs text-mist hover:text-ink mt-1 transition-colors"
              >
                Reset map
              </button>
            </div>
          ) : (
            p.address && (
              <div className="bg-linen/30 rounded-xl p-5 text-center">
                <p className="text-sm text-mist mb-3">No map loaded yet. Enter the address above first.</p>
                <button
                  onClick={handleGeocode}
                  disabled={geocoding}
                  className="text-sm px-4 py-2 bg-forest text-white rounded-lg hover:bg-deep disabled:opacity-40 transition-colors"
                >
                  {geocoding ? 'Locating…' : 'Load Map'}
                </button>
              </div>
            )
          )}

          {/* Listing photos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-ink">Listing Photos</label>
              <label className={`flex items-center gap-1.5 text-xs text-forest cursor-pointer hover:text-deep transition-colors ${uploadingListing ? 'opacity-50 pointer-events-none' : ''}`}>
                <Camera size={14} /> {uploadingListing ? 'Uploading…' : 'Add Photos'}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleListingPhotos}
                />
              </label>
            </div>
            {(p.listingPhotos ?? []).length > 0 ? (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {p.listingPhotos.map((url) => (
                  <div key={url} className="relative shrink-0 group">
                    <img
                      src={url}
                      alt=""
                      onClick={() => onChange({ coverPhoto: url })}
                      title="Click to set as cover"
                      className={`h-24 w-24 object-cover rounded-lg cursor-pointer border-2 transition-all ${
                        p.coverPhoto === url ? 'border-forest' : 'border-transparent hover:border-linen'
                      }`}
                    />
                    {p.coverPhoto === url && (
                      <div className="absolute bottom-1 left-0 right-0 text-center text-xs bg-forest/80 text-white rounded-b-lg px-1 py-0.5">
                        Cover
                      </div>
                    )}
                    <button
                      onClick={() => removeListingPhoto(url)}
                      className="absolute -top-1.5 -right-1.5 bg-white border border-linen rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 shadow-sm"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-linen rounded-xl p-6 text-center text-mist text-sm">
                No listing photos yet — click "Add Photos" to upload
              </div>
            )}
          </div>

          {/* General notes */}
          <div>
            <label className="block text-xs font-medium text-ink mb-1">General Notes</label>
            <textarea
              value={p.notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              rows={3}
              placeholder="Zoning, perc test result, initial impressions…"
              className="w-full border border-linen rounded-lg px-3 py-2 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-forest/40 resize-none"
            />
          </div>
        </div>
      )}

      {/* ── Visit Log ────────────────────────────────────────────────────────── */}
      {tab === 'visits' && (
        <div className="space-y-5">
          {/* Log new visit */}
          <div className="bg-white border border-linen rounded-xl p-4 space-y-4">
            <h3 className="font-semibold text-ink text-sm">Log a Visit</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-ink mb-1">Date</label>
                <input
                  type="date"
                  value={vDate}
                  onChange={(e) => setVDate(e.target.value)}
                  className={INPUT}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink mb-1.5">Rating</label>
                <StarRating value={vRating} onChange={setVRating} size={20} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink mb-1.5">Who Attended</label>
              <div className="flex flex-wrap gap-1.5">
                {ATTENDEES.map((a) => (
                  <button
                    key={a}
                    onClick={() =>
                      setVAttendees((prev) =>
                        prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
                      )
                    }
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      vAttendees.includes(a)
                        ? 'bg-forest text-white border-forest'
                        : 'border-linen text-mist hover:border-forest hover:text-forest'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink mb-1">Notes from Visit</label>
              <textarea
                value={vNotes}
                onChange={(e) => setVNotes(e.target.value)}
                rows={3}
                placeholder="Overall impression, what stood out, questions to follow up on…"
                className="w-full border border-linen rounded-lg px-3 py-2 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-forest/40 resize-none"
              />
            </div>

            {/* Visit photos */}
            <div>
              <label className="block text-xs font-medium text-ink mb-1.5">Visit Photos</label>
              <div className="flex items-center gap-3 flex-wrap">
                <label className={`flex items-center gap-1.5 text-xs text-forest cursor-pointer hover:text-deep transition-colors ${uploadingVisit ? 'opacity-50 pointer-events-none' : ''}`}>
                  <Camera size={14} /> {uploadingVisit ? 'Uploading…' : 'Add Photos'}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleVisitPhotos}
                  />
                </label>
                {vPhotos.length > 0 && (
                  <span className="text-xs text-mist">{vPhotos.length} photo{vPhotos.length > 1 ? 's' : ''} ready</span>
                )}
              </div>
              {vPhotos.length > 0 && (
                <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                  {vPhotos.map((url) => (
                    <div key={url} className="relative shrink-0">
                      <img src={url} alt="" className="h-16 w-16 object-cover rounded-lg" />
                      <button
                        onClick={() => setVPhotos((prev) => prev.filter((u) => u !== url))}
                        className="absolute -top-1 -right-1 bg-white border border-linen rounded-full w-4 h-4 flex items-center justify-center text-red-400 shadow-sm"
                      >
                        <X size={9} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Voice memo */}
            <div>
              <label className="block text-xs font-medium text-ink mb-1.5">Voice Memo</label>
              {!vMemo ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={recording ? stopRecording : startRecording}
                    className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border transition-colors ${
                      recording
                        ? 'bg-red-50 border-red-200 text-red-600'
                        : 'border-linen text-mist hover:text-forest hover:border-forest'
                    }`}
                  >
                    {recording ? (
                      <><MicOff size={14} /> Stop ({recordSec}s)</>
                    ) : (
                      <><Mic size={14} /> Record Memo</>
                    )}
                  </button>
                  {recording && (
                    <span className="flex items-center gap-1.5 text-xs text-red-500">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      Recording…
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <audio src={vMemo} controls className="h-8 flex-1" />
                  <button onClick={() => setVMemo('')} className="text-red-300 hover:text-red-500">
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={saveVisit}
              className="w-full bg-forest text-white text-sm py-2.5 rounded-lg hover:bg-deep transition-colors font-medium"
            >
              Save Visit Log
            </button>
          </div>

          {/* Past visits */}
          {sortedVisits.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-mist uppercase tracking-wide mb-3">
                {sortedVisits.length} Visit{sortedVisits.length > 1 ? 's' : ''} Logged
              </h3>
              <div className="space-y-3">
                {sortedVisits.map((v) => (
                  <div key={v.id} className="bg-white border border-linen rounded-xl overflow-hidden">
                    <div
                      className="flex items-center gap-3 p-3 cursor-pointer hover:bg-cream/50 transition-colors"
                      onClick={() => setExpandedVisit(expandedVisit === v.id ? null : v.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-ink">{fmtDate(v.date)}</div>
                        <div className="text-xs text-mist mt-0.5">
                          {(v.attendees ?? []).join(', ')}
                          {v.photos?.length > 0 && ` · ${v.photos.length} photo${v.photos.length > 1 ? 's' : ''}`}
                          {v.voiceMemo && ' · 🎙 memo'}
                        </div>
                      </div>
                      <StarRating value={v.rating || 0} size={14} readonly />
                      <button
                        onClick={(e) => { e.stopPropagation(); removeVisit(v.id); }}
                        className="text-red-300 hover:text-red-500 ml-1 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                      {expandedVisit === v.id
                        ? <ChevronUp size={14} className="text-mist shrink-0" />
                        : <ChevronDown size={14} className="text-mist shrink-0" />
                      }
                    </div>
                    {expandedVisit === v.id && (
                      <div className="border-t border-linen p-3 space-y-3">
                        {v.notes && <p className="text-sm text-ink">{v.notes}</p>}
                        {v.voiceMemo && (
                          <div>
                            <div className="text-xs text-mist mb-1">Voice Memo</div>
                            <audio src={v.voiceMemo} controls className="h-8 w-full" />
                          </div>
                        )}
                        {v.photos?.length > 0 && (
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {v.photos.map((url) => (
                              <img
                                key={url}
                                src={url}
                                alt=""
                                className="h-20 w-20 object-cover rounded-lg shrink-0"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Decision ─────────────────────────────────────────────────────────── */}
      {tab === 'decision' && (
        <div className="space-y-5">
          {/* Status */}
          <div className="bg-white border border-linen rounded-xl p-4">
            <h3 className="font-semibold text-ink text-sm mb-3">Status</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(STATUS).map(([key, s]) => (
                <button
                  key={key}
                  onClick={() => onChange({ status: key })}
                  className={`text-sm py-2.5 px-3 rounded-lg border font-medium transition-colors ${
                    p.status === key ? s.color : 'border-linen text-mist hover:text-ink bg-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pros & Cons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pros */}
            <div className="bg-white border border-linen rounded-xl p-4">
              <h3 className="font-semibold text-emerald-700 text-sm mb-3">
                Pros ({(p.pros ?? []).length})
              </h3>
              <div className="space-y-1.5 mb-3 min-h-[40px]">
                {(p.pros ?? []).length === 0 && (
                  <p className="text-xs text-mist italic">No pros added yet</p>
                )}
                {(p.pros ?? []).map((item) => (
                  <div key={item.id} className="flex items-start gap-2 group">
                    <span className="text-emerald-500 shrink-0 mt-0.5 text-sm">✓</span>
                    <span className="text-sm text-ink flex-1 leading-snug">{item.text}</span>
                    <button
                      onClick={() => onChange({ pros: (p.pros ?? []).filter((x) => x.id !== item.id) })}
                      className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  value={newPro}
                  onChange={(e) => setNewPro(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addPro()}
                  placeholder="Add a pro…"
                  className="flex-1 border border-linen rounded-lg px-2.5 py-1.5 text-xs bg-cream focus:outline-none focus:ring-2 focus:ring-forest/40"
                />
                <button onClick={addPro} className="text-emerald-600 hover:text-emerald-800 transition-colors">
                  <Plus size={17} />
                </button>
              </div>
            </div>

            {/* Cons */}
            <div className="bg-white border border-linen rounded-xl p-4">
              <h3 className="font-semibold text-red-500 text-sm mb-3">
                Cons ({(p.cons ?? []).length})
              </h3>
              <div className="space-y-1.5 mb-3 min-h-[40px]">
                {(p.cons ?? []).length === 0 && (
                  <p className="text-xs text-mist italic">No cons added yet</p>
                )}
                {(p.cons ?? []).map((item) => (
                  <div key={item.id} className="flex items-start gap-2 group">
                    <span className="text-red-400 shrink-0 mt-0.5 text-sm">✗</span>
                    <span className="text-sm text-ink flex-1 leading-snug">{item.text}</span>
                    <button
                      onClick={() => onChange({ cons: (p.cons ?? []).filter((x) => x.id !== item.id) })}
                      className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  value={newCon}
                  onChange={(e) => setNewCon(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCon()}
                  placeholder="Add a con…"
                  className="flex-1 border border-linen rounded-lg px-2.5 py-1.5 text-xs bg-cream focus:outline-none focus:ring-2 focus:ring-forest/40"
                />
                <button onClick={addCon} className="text-red-400 hover:text-red-600 transition-colors">
                  <Plus size={17} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Location ──────────────────────────────────────────────────────────── */}
      {tab === 'location' && (
        <div className="space-y-4">
          {/* School district */}
          <div className="bg-white border border-linen rounded-xl p-4">
            <h3 className="flex items-center gap-2 font-semibold text-ink text-sm mb-3">
              <School size={16} className="text-mist" /> School District
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-ink mb-1">District Name</label>
                <input
                  value={p.schoolDistrict}
                  onChange={(e) => onChange({ schoolDistrict: e.target.value })}
                  placeholder="e.g. Garrard County Schools"
                  className={INPUT}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink mb-1">Rating (1–10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={p.schoolRating}
                  onChange={(e) => onChange({ schoolRating: e.target.value })}
                  placeholder="8"
                  className={INPUT}
                />
              </div>
              <div className="flex items-end pb-0.5">
                {p.schoolDistrict && (
                  <a
                    href={`https://www.greatschools.org/search/search.page?q=${encodeURIComponent(p.schoolDistrict)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-forest hover:text-deep flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink size={11} /> GreatSchools
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Commute */}
          <div className="bg-white border border-linen rounded-xl p-4">
            <h3 className="flex items-center gap-2 font-semibold text-ink text-sm mb-3">
              <Car size={16} className="text-mist" /> Commute Time
            </h3>
            <label className="block text-xs font-medium text-ink mb-1">Work / Destination Address</label>
            <div className="flex gap-2">
              <input
                value={p.commuteDestination}
                onChange={(e) => onChange({ commuteDestination: e.target.value })}
                placeholder="123 Work Ave, Lexington, KY"
                className={INPUT + ' flex-1'}
              />
              {p.commuteDestination && p.address && (
                <a
                  href={`https://www.google.com/maps/dir/${encodeURIComponent(p.address)}/${encodeURIComponent(p.commuteDestination)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-forest px-3 py-2 border border-linen rounded-lg hover:bg-cream whitespace-nowrap transition-colors"
                >
                  <ExternalLink size={12} /> Directions
                </a>
              )}
            </div>
          </div>

          {/* Flood & Zoning */}
          <div className="bg-white border border-linen rounded-xl p-4">
            <h3 className="flex items-center gap-2 font-semibold text-ink text-sm mb-3">
              <Droplets size={16} className="text-mist" /> Flood Zone & Zoning
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-ink mb-1">Flood Zone</label>
                <input
                  value={p.floodZone}
                  onChange={(e) => onChange({ floodZone: e.target.value })}
                  placeholder="Zone X, Zone AE…"
                  className={INPUT}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink mb-1">Zoning</label>
                <input
                  value={p.zoning}
                  onChange={(e) => onChange({ zoning: e.target.value })}
                  placeholder="AG, R1, R2…"
                  className={INPUT}
                />
              </div>
            </div>
            <a
              href="https://msc.fema.gov/portal/home"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-mist hover:text-forest mt-2 inline-flex items-center gap-1 transition-colors"
            >
              <ExternalLink size={11} /> Check FEMA Flood Map Service Center
            </a>
          </div>

          {/* Neighborhood notes */}
          <div className="bg-white border border-linen rounded-xl p-4">
            <h3 className="font-semibold text-ink text-sm mb-1">Neighborhood Notes</h3>
            <p className="text-xs text-mist mb-2">
              Grocery, hospital, church, traffic, neighbors — anything relevant to daily life.
            </p>
            <textarea
              value={p.neighborhoodNotes}
              onChange={(e) => onChange({ neighborhoodNotes: e.target.value })}
              rows={4}
              placeholder="Walmart 8 min, hospital 20 min, quiet road, good cell signal…"
              className="w-full border border-linen rounded-lg px-3 py-2 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-forest/40 resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
