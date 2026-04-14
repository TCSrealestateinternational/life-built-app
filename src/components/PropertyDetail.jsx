import { useState } from 'react';
import {
  ArrowLeft, Star, Plus, Trash2, ExternalLink,
  X, ChevronDown, ChevronUp, Globe, School, Car, Droplets, ImagePlus,
} from 'lucide-react';
import { STATUS, geocodeAddress, osmEmbedUrl } from '../data/propertyData';
import NeighborhoodData from './buyer/NeighborhoodData';

// ─── Helpers ───────────────────────────────────────────────────────────────────

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
            n <= value ? 'text-amber-400' : 'text-outline-variant'
          }`}
        >
          <Star size={size} fill={n <= value ? 'currentColor' : 'none'} strokeWidth={1.5} />
        </button>
      ))}
    </div>
  );
}

// Small reusable URL-add row for photos
function PhotoUrlInput({ onAdd, placeholder = 'Paste image URL and press Enter…' }) {
  const [url, setUrl] = useState('');
  function submit() {
    const trimmed = url.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setUrl('');
  }
  return (
    <div className="flex gap-2 mt-2">
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder={placeholder}
        className="flex-1 border border-outline-variant rounded-xl px-3 py-1.5 text-xs bg-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
      <button
        onClick={submit}
        disabled={!url.trim()}
        className="text-xs px-3 py-1.5 bg-primary text-on-primary rounded-xl hover:bg-primary-dim disabled:opacity-40 transition-colors"
      >
        Add
      </button>
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

const INPUT = 'w-full border border-outline-variant rounded-xl px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/40';

// ─── Main component ─────────────────────────────────────────────────────────────

export default function PropertyDetail({ property: p, uid: _uid, onChange, onBack, onDelete }) {
  const [tab, setTab] = useState('overview');
  const [geocoding, setGeocoding] = useState(false);

  // Visit form
  const [vDate, setVDate] = useState(new Date().toISOString().slice(0, 10));
  const [vAttendees, setVAttendees] = useState(['Self']);
  const [vRating, setVRating] = useState(3);
  const [vNotes, setVNotes] = useState('');
  const [vPhotos, setVPhotos] = useState([]);   // array of URL strings
  const [vMemoNote, setVMemoNote] = useState(''); // voice replaced with a quick-note field

  // Visit expand
  const [expandedVisit, setExpandedVisit] = useState(null);

  // Pro / Con inputs
  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');

  // ── Overview handlers ────────────────────────────────────────────────────────

  async function handleGeocode() {
    if (!p.address) return;
    setGeocoding(true);
    const coords = await geocodeAddress(p.address);
    if (coords) {
      onChange({ lat: coords.lat, lon: coords.lon });
    } else {
      alert('Could not locate that address. Try including city and state.');
    }
    setGeocoding(false);
  }

  function addListingPhoto(url) {
    const newPhotos = [...(p.listingPhotos ?? []), url];
    onChange({ listingPhotos: newPhotos, coverPhoto: p.coverPhoto || newPhotos[0] });
  }

  function removeListingPhoto(url) {
    if (!confirm('Remove this photo?')) return;
    const updated = (p.listingPhotos ?? []).filter((u) => u !== url);
    onChange({ listingPhotos: updated, coverPhoto: updated[0] || '' });
  }

  // ── Visit handlers ───────────────────────────────────────────────────────────

  function saveVisit() {
    if (!vDate) { alert('Please enter a visit date.'); return; }
    const visit = {
      id: `v_${Date.now()}`,
      date: vDate,
      attendees: vAttendees,
      rating: vRating,
      notes: vNotes,
      photos: vPhotos,
      quickNote: vMemoNote,
    };
    onChange({ visits: [...(p.visits ?? []), visit] });
    setVDate(new Date().toISOString().slice(0, 10));
    setVAttendees(['Self']);
    setVRating(3);
    setVNotes('');
    setVPhotos([]);
    setVMemoNote('');
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
        className="flex items-center gap-1.5 text-outline hover:text-on-surface text-sm mb-4 transition-colors"
      >
        <ArrowLeft size={16} /> All Properties
      </button>

      {/* Property header */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="text-xl font-bold text-on-surface font-heading leading-snug">
          {p.address || 'Untitled Property'}
        </h1>
        <button onClick={onDelete} className="text-red-300 hover:text-red-500 shrink-0 mt-1 transition-colors">
          <Trash2 size={16} />
        </button>
      </div>

      {/* Status selector */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {Object.entries(STATUS).map(([key, s]) => (
          <button
            key={key}
            onClick={() => onChange({ status: key })}
            className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
              p.status === key ? s.color : 'border-outline-variant text-outline hover:text-on-surface bg-surface-container-lowest'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant mb-5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id ? 'border-primary text-primary' : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview ─────────────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="space-y-5">
          {/* Basic info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-on-surface mb-1">Address</label>
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
                  className="text-xs px-3 py-2 border border-outline-variant rounded-xl text-outline hover:text-primary hover:border-primary disabled:opacity-40 transition-colors whitespace-nowrap"
                >
                  {geocoding ? 'Finding…' : '📍 Map it'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface mb-1">Asking Price ($)</label>
              <input
                type="number"
                value={p.price}
                onChange={(e) => onChange({ price: e.target.value })}
                placeholder="150000"
                className={INPUT}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface mb-1">Acres</label>
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
              <label className="block text-xs font-medium text-on-surface mb-1">Zillow / MLS Link</label>
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
                    className="flex items-center gap-1 text-sm text-primary px-3 py-2 border border-outline-variant rounded-xl hover:bg-surface transition-colors"
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
                <label className="text-xs font-medium text-on-surface">Map View</label>
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(p.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-outline hover:text-primary flex items-center gap-1 transition-colors"
                >
                  <Globe size={11} /> Open in Google Maps
                </a>
              </div>
              <iframe
                title="property-map"
                src={mapUrl}
                className="w-full h-56 rounded-3xl border border-outline-variant"
                style={{ border: 0 }}
              />
              <button
                onClick={() => onChange({ lat: null, lon: null })}
                className="text-xs text-outline hover:text-on-surface mt-1 transition-colors"
              >
                Reset map
              </button>
            </div>
          ) : (
            p.address && (
              <div className="bg-outline-variant/30 rounded-3xl p-5 text-center">
                <p className="text-sm text-outline mb-3">No map loaded. Enter the address above, then click Map it.</p>
                <button
                  onClick={handleGeocode}
                  disabled={geocoding}
                  className="text-sm px-4 py-2 bg-primary text-on-primary rounded-xl hover:bg-primary-dim disabled:opacity-40 transition-colors"
                >
                  {geocoding ? 'Locating…' : 'Load Map'}
                </button>
              </div>
            )
          )}

          {/* Listing photos (URL-based) */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <label className="text-xs font-medium text-on-surface">Listing Photos</label>
              <span className="text-xs text-outline">— paste a URL from Zillow, Google Photos, Dropbox, etc.</span>
            </div>
            {(p.listingPhotos ?? []).length > 0 ? (
              <div className="flex gap-2 overflow-x-auto pb-1 mb-2">
                {p.listingPhotos.map((url) => (
                  <div key={url} className="relative shrink-0 group">
                    <img
                      src={url}
                      alt=""
                      onClick={() => onChange({ coverPhoto: url })}
                      title="Click to set as cover photo"
                      className={`h-24 w-24 object-cover rounded-xl cursor-pointer border-2 transition-all ${
                        p.coverPhoto === url ? 'border-primary' : 'border-transparent hover:border-outline-variant'
                      }`}
                    />
                    {p.coverPhoto === url && (
                      <div className="absolute bottom-0 left-0 right-0 text-center text-xs bg-primary/80 text-on-primary rounded-b-xl py-0.5">
                        Cover
                      </div>
                    )}
                    <button
                      onClick={() => removeListingPhoto(url)}
                      className="absolute -top-1.5 -right-1.5 bg-surface-container-lowest border border-outline-variant rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 shadow-sm"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-outline-variant rounded-3xl p-4 text-center text-outline text-xs mb-2">
                <ImagePlus size={20} className="mx-auto mb-1 opacity-40" />
                No photos yet — paste a URL below
              </div>
            )}
            <PhotoUrlInput onAdd={addListingPhoto} placeholder="https://photos.zillow.com/… or any public image URL" />
          </div>

          {/* General notes */}
          <div>
            <label className="block text-xs font-medium text-on-surface mb-1">General Notes</label>
            <textarea
              value={p.notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              rows={3}
              placeholder="Zoning, perc test result, initial impressions…"
              className="w-full border border-outline-variant rounded-xl px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>
        </div>
      )}

      {/* ── Visit Log ────────────────────────────────────────────────────────── */}
      {tab === 'visits' && (
        <div className="space-y-5">
          {/* Log new visit */}
          <div className="bg-surface-container-lowest shadow-md border border-outline-variant/10 rounded-3xl p-4 space-y-4">
            <h3 className="font-semibold text-on-surface text-sm">Log a Visit</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-on-surface mb-1">Date</label>
                <input
                  type="date"
                  value={vDate}
                  onChange={(e) => setVDate(e.target.value)}
                  className={INPUT}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface mb-1.5">Rating</label>
                <StarRating value={vRating} onChange={setVRating} size={20} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-on-surface mb-1.5">Who Attended</label>
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
                        ? 'bg-primary text-on-primary border-primary'
                        : 'border-outline-variant text-outline hover:border-primary hover:text-primary'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-on-surface mb-1">Notes from Visit</label>
              <textarea
                value={vNotes}
                onChange={(e) => setVNotes(e.target.value)}
                rows={3}
                placeholder="Overall impression, what stood out, questions to follow up on…"
                className="w-full border border-outline-variant rounded-xl px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-on-surface mb-1">Quick Note / Voice Memo Summary</label>
              <input
                value={vMemoNote}
                onChange={(e) => setVMemoNote(e.target.value)}
                placeholder="Short gut-reaction note…"
                className={INPUT}
              />
            </div>

            {/* Visit photos (URL-based) */}
            <div>
              <label className="block text-xs font-medium text-on-surface mb-1">Visit Photos</label>
              <p className="text-xs text-outline mb-1">
                Take photos on your phone, upload to Google Photos or Dropbox, then paste the share URL.
              </p>
              {vPhotos.length > 0 && (
                <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
                  {vPhotos.map((url) => (
                    <div key={url} className="relative shrink-0">
                      <img src={url} alt="" className="h-16 w-16 object-cover rounded-xl" />
                      <button
                        onClick={() => setVPhotos((prev) => prev.filter((u) => u !== url))}
                        className="absolute -top-1 -right-1 bg-surface-container-lowest border border-outline-variant rounded-full w-4 h-4 flex items-center justify-center text-red-400 shadow-sm"
                      >
                        <X size={9} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <PhotoUrlInput onAdd={(url) => setVPhotos((prev) => [...prev, url])} />
            </div>

            <button
              onClick={saveVisit}
              className="w-full bg-primary text-on-primary text-sm py-2.5 rounded-xl hover:bg-primary-dim transition-colors font-medium"
            >
              Save Visit Log
            </button>
          </div>

          {/* Past visits */}
          {sortedVisits.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-outline uppercase tracking-wide mb-3">
                {sortedVisits.length} Visit{sortedVisits.length > 1 ? 's' : ''} Logged
              </h3>
              <div className="space-y-3">
                {sortedVisits.map((v) => (
                  <div key={v.id} className="bg-surface-container-lowest shadow-md border border-outline-variant/10 rounded-3xl overflow-hidden">
                    <div
                      className="flex items-center gap-3 p-3 cursor-pointer hover:bg-surface/50 transition-colors"
                      onClick={() => setExpandedVisit(expandedVisit === v.id ? null : v.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-on-surface">{fmtDate(v.date)}</div>
                        <div className="text-xs text-outline mt-0.5">
                          {(v.attendees ?? []).join(', ')}
                          {v.photos?.length > 0 && ` · ${v.photos.length} photo${v.photos.length > 1 ? 's' : ''}`}
                          {v.quickNote && ' · 📝 note'}
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
                        ? <ChevronUp size={14} className="text-outline shrink-0" />
                        : <ChevronDown size={14} className="text-outline shrink-0" />
                      }
                    </div>
                    {expandedVisit === v.id && (
                      <div className="border-t border-outline-variant p-3 space-y-3">
                        {v.notes && <p className="text-sm text-on-surface">{v.notes}</p>}
                        {v.quickNote && (
                          <div className="bg-surface rounded-xl px-3 py-2 text-sm text-outline italic">
                            📝 {v.quickNote}
                          </div>
                        )}
                        {v.photos?.length > 0 && (
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {v.photos.map((url) => (
                              <img
                                key={url}
                                src={url}
                                alt=""
                                className="h-20 w-20 object-cover rounded-xl shrink-0"
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
          <div className="bg-surface-container-lowest shadow-md border border-outline-variant/10 rounded-3xl p-4">
            <h3 className="font-semibold text-on-surface text-sm mb-3">Status</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(STATUS).map(([key, s]) => (
                <button
                  key={key}
                  onClick={() => onChange({ status: key })}
                  className={`text-sm py-2.5 px-3 rounded-xl border font-medium transition-colors ${
                    p.status === key ? s.color : 'border-outline-variant text-outline hover:text-on-surface bg-surface-container-lowest'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pros & Cons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface-container-lowest shadow-md border border-outline-variant/10 rounded-3xl p-4">
              <h3 className="font-semibold text-emerald-700 text-sm mb-3">
                Pros ({(p.pros ?? []).length})
              </h3>
              <div className="space-y-1.5 mb-3 min-h-[40px]">
                {(p.pros ?? []).length === 0 && (
                  <p className="text-xs text-outline italic">No pros added yet</p>
                )}
                {(p.pros ?? []).map((item) => (
                  <div key={item.id} className="flex items-start gap-2 group">
                    <span className="text-emerald-500 shrink-0 mt-0.5 text-sm">✓</span>
                    <span className="text-sm text-on-surface flex-1 leading-snug">{item.text}</span>
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
                  className="flex-1 border border-outline-variant rounded-xl px-2.5 py-1.5 text-xs bg-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button onClick={addPro} className="text-emerald-600 hover:text-emerald-800 transition-colors">
                  <Plus size={17} />
                </button>
              </div>
            </div>

            <div className="bg-surface-container-lowest shadow-md border border-outline-variant/10 rounded-3xl p-4">
              <h3 className="font-semibold text-red-500 text-sm mb-3">
                Cons ({(p.cons ?? []).length})
              </h3>
              <div className="space-y-1.5 mb-3 min-h-[40px]">
                {(p.cons ?? []).length === 0 && (
                  <p className="text-xs text-outline italic">No cons added yet</p>
                )}
                {(p.cons ?? []).map((item) => (
                  <div key={item.id} className="flex items-start gap-2 group">
                    <span className="text-red-400 shrink-0 mt-0.5 text-sm">✗</span>
                    <span className="text-sm text-on-surface flex-1 leading-snug">{item.text}</span>
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
                  className="flex-1 border border-outline-variant rounded-xl px-2.5 py-1.5 text-xs bg-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
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
          <div className="bg-surface-container-lowest shadow-md border border-outline-variant/10 rounded-3xl p-4">
            <h3 className="flex items-center gap-2 font-semibold text-on-surface text-sm mb-3">
              <School size={16} className="text-outline" /> School District
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-on-surface mb-1">District Name</label>
                <input
                  value={p.schoolDistrict}
                  onChange={(e) => onChange({ schoolDistrict: e.target.value })}
                  placeholder="e.g. Garrard County Schools"
                  className={INPUT}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface mb-1">Rating (1–10)</label>
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
                    className="text-xs text-primary hover:text-primary-dim flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink size={11} /> GreatSchools
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Commute */}
          <div className="bg-surface-container-lowest shadow-md border border-outline-variant/10 rounded-3xl p-4">
            <h3 className="flex items-center gap-2 font-semibold text-on-surface text-sm mb-3">
              <Car size={16} className="text-outline" /> Commute Time
            </h3>
            <label className="block text-xs font-medium text-on-surface mb-1">Work / Destination Address</label>
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
                  className="flex items-center gap-1 text-xs text-primary px-3 py-2 border border-outline-variant rounded-xl hover:bg-surface whitespace-nowrap transition-colors"
                >
                  <ExternalLink size={12} /> Directions
                </a>
              )}
            </div>
          </div>

          {/* Flood & Zoning */}
          <div className="bg-surface-container-lowest shadow-md border border-outline-variant/10 rounded-3xl p-4">
            <h3 className="flex items-center gap-2 font-semibold text-on-surface text-sm mb-3">
              <Droplets size={16} className="text-outline" /> Flood Zone & Zoning
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-on-surface mb-1">Flood Zone</label>
                <input
                  value={p.floodZone}
                  onChange={(e) => onChange({ floodZone: e.target.value })}
                  placeholder="Zone X, Zone AE…"
                  className={INPUT}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface mb-1">Zoning</label>
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
              className="text-xs text-outline hover:text-primary mt-2 inline-flex items-center gap-1 transition-colors"
            >
              <ExternalLink size={11} /> FEMA Flood Map Service Center
            </a>
          </div>

          {/* Neighborhood notes */}
          <div className="bg-surface-container-lowest shadow-md border border-outline-variant/10 rounded-3xl p-4">
            <h3 className="font-semibold text-on-surface text-sm mb-1">Neighborhood Notes</h3>
            <p className="text-xs text-outline mb-2">
              Grocery, hospital, church, traffic, neighbors — anything relevant to daily life.
            </p>
            <textarea
              value={p.neighborhoodNotes}
              onChange={(e) => onChange({ neighborhoodNotes: e.target.value })}
              rows={4}
              placeholder="Walmart 8 min, hospital 20 min, quiet road, good cell signal…"
              className="w-full border border-outline-variant rounded-xl px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>

          {/* Neighborhood data from APIs */}
          <div className="bg-surface-container-lowest shadow-md border border-outline-variant/10 rounded-3xl p-4">
            <NeighborhoodData
              address={p.address}
              lat={p.lat}
              lon={p.lon}
              commuteDestination={p.commuteDestination}
            />
          </div>
        </div>
      )}
    </div>
  );
}
