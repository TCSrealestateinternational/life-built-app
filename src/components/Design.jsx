import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Image, Link2, FileText } from 'lucide-react';
import { ROOM_DEFAULTS, ORDERED_ROOMS, BASEMENT_DEFAULTS } from '../data/roomDefaults';

function newItem(text = '', options = []) {
  return {
    id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
    text,
    options,
    selected: '',
    custom: '',
    photo: '',
    link: '',
    notes: '',
    done: false,
  };
}

function DesignItem({ item, onUpdate, onRemove }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const safe = { options: [], selected: '', custom: '', photo: '', link: '', notes: '', ...item };
  const hasDetails = safe.photo || safe.link || safe.notes;
  const displayValue = safe.selected || safe.custom;

  return (
    <div className={`border rounded-lg overflow-hidden ${safe.done ? 'border-forest/20 bg-forest/5' : 'border-linen bg-white'}`}>
      <div className="flex items-start gap-2 p-3">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={safe.done}
          onChange={(e) => onUpdate({ done: e.target.checked })}
          className="accent-forest mt-1 shrink-0"
        />

        <div className="flex-1 min-w-0">
          {/* Item name */}
          <div className="flex items-start gap-2">
            <input
              type="text"
              value={safe.text}
              onChange={(e) => onUpdate({ text: e.target.value })}
              className={`flex-1 text-sm font-medium bg-transparent border-b border-transparent hover:border-linen focus:border-forest focus:outline-none py-0.5 ${safe.done ? 'line-through text-mist' : 'text-ink'}`}
            />
            {displayValue && (
              <span className="text-xs bg-forest/10 text-forest px-2 py-0.5 rounded-full shrink-0">
                {displayValue}
              </span>
            )}
          </div>

          {/* Option chips */}
          {safe.options.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {safe.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => onUpdate({ selected: safe.selected === opt ? '' : opt, custom: '' })}
                  className={`text-xs px-2.5 py-0.5 rounded-full border transition-colors ${
                    safe.selected === opt
                      ? 'bg-forest text-white border-forest'
                      : 'border-linen text-mist hover:border-sage hover:text-ink'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Custom value input */}
          <input
            type="text"
            value={safe.custom}
            onChange={(e) => onUpdate({ custom: e.target.value, selected: '' })}
            placeholder={safe.options.length > 0 ? 'Or type a custom value…' : 'Your selection…'}
            className="mt-1.5 w-full text-xs bg-cream border border-linen rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-forest/40 text-ink placeholder:text-mist"
          />

          {/* Details toggle */}
          <button
            onClick={() => setDetailsOpen(!detailsOpen)}
            className={`flex items-center gap-1 text-xs mt-2 transition-colors ${hasDetails ? 'text-forest' : 'text-mist hover:text-forest'}`}
          >
            <FileText size={11} />
            {detailsOpen ? 'Hide details' : hasDetails ? 'View details ●' : 'Add photo / link / notes'}
          </button>

          {/* Details panel */}
          {detailsOpen && (
            <div className="mt-2 pt-2 border-t border-linen space-y-3">
              {/* Photo URL */}
              <div>
                <label className="flex items-center gap-1 text-xs font-medium text-ink mb-1">
                  <Image size={11} /> Inspiration Photo URL
                </label>
                <input
                  type="url"
                  value={safe.photo}
                  onChange={(e) => onUpdate({ photo: e.target.value })}
                  placeholder="Paste image URL from Pinterest, Houzz, etc."
                  className="w-full text-xs border border-linen rounded px-2 py-1.5 bg-cream focus:outline-none focus:ring-1 focus:ring-forest/40"
                />
                {safe.photo && (
                  <img
                    src={safe.photo}
                    alt="inspiration"
                    className="mt-1.5 rounded-lg max-h-40 object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
              </div>

              {/* Link */}
              <div>
                <label className="flex items-center gap-1 text-xs font-medium text-ink mb-1">
                  <Link2 size={11} /> Product / Reference Link
                </label>
                <div className="flex gap-1">
                  <input
                    type="url"
                    value={safe.link}
                    onChange={(e) => onUpdate({ link: e.target.value })}
                    placeholder="Paste a product or inspiration link"
                    className="flex-1 text-xs border border-linen rounded px-2 py-1.5 bg-cream focus:outline-none focus:ring-1 focus:ring-forest/40"
                  />
                  {safe.link && (
                    <a
                      href={safe.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-forest border border-linen rounded px-2 py-1.5 hover:bg-cream shrink-0"
                    >
                      Open
                    </a>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="flex items-center gap-1 text-xs font-medium text-ink mb-1">
                  <FileText size={11} /> Notes
                </label>
                <textarea
                  value={safe.notes}
                  onChange={(e) => onUpdate({ notes: e.target.value })}
                  placeholder="Colors, dimensions, model numbers, preferences…"
                  rows={2}
                  className="w-full text-xs border border-linen rounded px-2 py-1.5 bg-cream focus:outline-none focus:ring-1 focus:ring-forest/40 resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Remove */}
        <button
          onClick={onRemove}
          className="text-red-300 hover:text-red-500 transition-colors shrink-0 mt-0.5"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

export default function Design({ project, updateProject }) {
  const [expandedRoom, setExpandedRoom] = useState(null);
  const [newRoom, setNewRoom] = useState('');
  const design = project?.homeDesign ?? {};

  const activeRooms = Object.keys(design);
  const suggestedRooms = ORDERED_ROOMS.filter((r) => !design[r]);

  function addRoom(roomName) {
    const r = roomName.trim();
    if (!r || design[r]) return;
    updateProject({ homeDesign: { ...design, [r]: { items: [] } } });
    setNewRoom('');
    setExpandedRoom(r);
  }

  function handleBasementMode(mode) {
    const room = 'Basement';
    const currentMode = design[room]?.mode;
    if (currentMode === mode) return;
    const hasItems = (design[room]?.items ?? []).length > 0;
    if (hasItems && !confirm(`Switch to ${mode === 'finished' ? 'Finished' : 'Unfinished'} basement? Your current items will be replaced.`)) return;
    const defaults = (BASEMENT_DEFAULTS[mode] ?? []).map((d) => newItem(d.text, d.options));
    updateProject({ homeDesign: { ...design, Basement: { mode, items: defaults } } });
  }

  function removeRoom(room) {
    if (!confirm(`Remove "${room}" and all its items?`)) return;
    const updated = { ...design };
    delete updated[room];
    updateProject({ homeDesign: updated });
    if (expandedRoom === room) setExpandedRoom(null);
  }

  function loadDefaults(room) {
    const defaults = (ROOM_DEFAULTS[room] ?? []).map((d) => newItem(d.text, d.options));
    const existing = design[room]?.items ?? [];
    updateProject({
      homeDesign: { ...design, [room]: { items: [...existing, ...defaults] } },
    });
  }

  function addItem(room) {
    const items = design[room]?.items ?? [];
    updateProject({ homeDesign: { ...design, [room]: { items: [...items, newItem()] } } });
  }

  function updateItem(room, id, patch) {
    const items = design[room]?.items ?? [];
    updateProject({
      homeDesign: { ...design, [room]: { items: items.map((it) => (it.id === id ? { ...it, ...patch } : it)) } },
    });
  }

  function removeItem(room, id) {
    const items = design[room]?.items ?? [];
    updateProject({
      homeDesign: { ...design, [room]: { items: items.filter((it) => it.id !== id) } },
    });
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
          Home Design
        </h1>
        <p className="text-sage text-sm mt-0.5">
          Room-by-room selections — pick options, add inspiration photos, links, and notes.
        </p>
      </div>

      {/* Active rooms */}
      <div data-tour="design-rooms" className="space-y-3 mb-6">
        {activeRooms.map((room) => {
          const items = design[room]?.items ?? [];
          const doneCount = items.filter((i) => i.done).length;
          const hasPresets = !!ROOM_DEFAULTS[room];

          return (
            <div key={room} className="bg-white rounded-xl border border-linen overflow-hidden">
              {/* Room header */}
              <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-cream/50 transition-colors"
                onClick={() => setExpandedRoom(expandedRoom === room ? null : room)}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-ink">{room}</div>
                  <div className="text-xs text-mist mt-0.5">
                    {items.length === 0 ? 'No items yet' : `${doneCount} of ${items.length} decided`}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); removeRoom(room); }}
                    className="text-red-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                  {expandedRoom === room
                    ? <ChevronUp size={16} className="text-mist" />
                    : <ChevronDown size={16} className="text-mist" />}
                </div>
              </div>

              {/* Room body */}
              {expandedRoom === room && (
                <div className="border-t border-linen p-4">
                  {/* Basement toggle */}
                  {room === 'Basement' && (
                    <div className="mb-4">
                      <p className="text-xs text-mist mb-2 font-medium">What type of basement are you planning?</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: 'unfinished', label: '🏗️ Unfinished', desc: 'Utilities, storage, rough-in' },
                          { key: 'finished', label: '🏠 Finished', desc: 'Living space, rooms, wet bar' },
                        ].map(({ key, label, desc }) => (
                          <button
                            key={key}
                            onClick={() => handleBasementMode(key)}
                            className={`p-3 rounded-lg border text-left transition-colors ${
                              design[room]?.mode === key
                                ? 'border-forest bg-forest/10'
                                : 'border-linen hover:border-sage'
                            }`}
                          >
                            <div className={`text-sm font-medium ${design[room]?.mode === key ? 'text-forest' : 'text-ink'}`}>{label}</div>
                            <div className="text-xs text-mist mt-0.5">{desc}</div>
                          </button>
                        ))}
                      </div>
                      {!design[room]?.mode && (
                        <p className="text-xs text-mist text-center mt-2">Select a type above to load items</p>
                      )}
                    </div>
                  )}

                  {/* Load defaults banner */}
                  {hasPresets && items.length === 0 && room !== 'Basement' && (
                    <div className="mb-4 flex items-center justify-between bg-forest/5 border border-forest/20 rounded-lg px-3 py-2.5">
                      <span className="text-xs text-forest">Standard items are available for this room</span>
                      <button
                        onClick={() => loadDefaults(room)}
                        className="text-xs bg-forest text-white px-3 py-1.5 rounded-lg hover:bg-deep transition-colors ml-3 shrink-0"
                      >
                        Load items
                      </button>
                    </div>
                  )}

                  {/* Items list */}
                  <div className="space-y-2">
                    {items.map((item) => (
                      <DesignItem
                        key={item.id}
                        item={item}
                        onUpdate={(patch) => updateItem(room, item.id, patch)}
                        onRemove={() => removeItem(room, item.id)}
                      />
                    ))}
                  </div>

                  {/* Footer actions */}
                  <div className="flex items-center gap-4 mt-3">
                    <button
                      onClick={() => addItem(room)}
                      className="flex items-center gap-1 text-xs text-forest hover:underline"
                    >
                      <Plus size={13} /> Add custom item
                    </button>
                    {hasPresets && items.length > 0 && room !== 'Basement' && (
                      <button
                        onClick={() => loadDefaults(room)}
                        className="text-xs text-mist hover:text-forest transition-colors"
                      >
                        + Reload standard items
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Customize section */}
      <div className="bg-white rounded-xl border border-linen p-4">
        <h2 className="text-sm font-semibold text-ink mb-3">Customize</h2>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newRoom}
            onChange={(e) => setNewRoom(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addRoom(newRoom)}
            placeholder="Add a custom room or space…"
            className="flex-1 border border-linen rounded-lg px-3 py-2 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-forest/40"
          />
          <button
            onClick={() => addRoom(newRoom)}
            className="bg-forest text-white text-sm px-4 py-2 rounded-lg hover:bg-deep transition-colors"
          >
            Add
          </button>
        </div>
        {suggestedRooms.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {suggestedRooms.map((r) => (
              <button
                key={r}
                onClick={() => addRoom(r)}
                className="text-xs text-forest border border-forest/30 px-2.5 py-1 rounded-full hover:bg-forest hover:text-white transition-colors"
              >
                + {r}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
