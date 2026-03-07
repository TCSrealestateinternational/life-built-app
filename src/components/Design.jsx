import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const DEFAULT_ROOMS = [
  'Kitchen', 'Primary Bedroom', 'Primary Bath', 'Living Room',
  'Dining Room', 'Guest Bedroom', 'Guest Bath', 'Laundry',
  'Garage', 'Outdoor / Porch',
];

function newItem(text = '') {
  return { id: Date.now() + Math.random(), text, done: false };
}

export default function Design({ project, updateProject }) {
  const [expanded, setExpanded] = useState(null);
  const [newRoom, setNewRoom] = useState('');
  const design = project?.homeDesign ?? {};

  function ensureRoom(room) {
    if (!design[room]) {
      updateProject({ homeDesign: { ...design, [room]: { items: [] } } });
    }
  }

  function addRoom() {
    const r = newRoom.trim();
    if (!r || design[r]) return;
    updateProject({ homeDesign: { ...design, [r]: { items: [] } } });
    setNewRoom('');
    setExpanded(r);
  }

  function addItem(room) {
    const updated = {
      ...design,
      [room]: { items: [...(design[room]?.items ?? []), newItem()] },
    };
    updateProject({ homeDesign: updated });
  }

  function updateItem(room, id, patch) {
    const updated = {
      ...design,
      [room]: {
        items: design[room].items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      },
    };
    updateProject({ homeDesign: updated });
  }

  function removeItem(room, id) {
    const updated = {
      ...design,
      [room]: { items: design[room].items.filter((item) => item.id !== id) },
    };
    updateProject({ homeDesign: updated });
  }

  function removeRoom(room) {
    if (!confirm(`Remove room "${room}"?`)) return;
    const updated = { ...design };
    delete updated[room];
    updateProject({ homeDesign: updated });
    if (expanded === room) setExpanded(null);
  }

  const allRooms = [...new Set([...DEFAULT_ROOMS, ...Object.keys(design)])];
  const activeRooms = allRooms.filter((r) => design[r]);
  const suggestedRooms = DEFAULT_ROOMS.filter((r) => !design[r]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
          Home Design
        </h1>
        <p className="text-sage text-sm mt-0.5">Build a room-by-room wish list for your build.</p>
      </div>

      {/* Room cards */}
      <div className="space-y-3 mb-6">
        {activeRooms.map((room) => {
          const items = design[room]?.items ?? [];
          const doneCount = items.filter((i) => i.done).length;
          return (
            <div key={room} className="bg-white rounded-xl border border-linen overflow-hidden">
              <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-cream/50 transition-colors"
                onClick={() => setExpanded(expanded === room ? null : room)}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-ink">{room}</div>
                  <div className="text-xs text-mist mt-0.5">
                    {items.length === 0 ? 'No items yet' : `${doneCount}/${items.length} done`}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); removeRoom(room); }}
                    className="text-red-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                  {expanded === room ? <ChevronUp size={16} className="text-mist" /> : <ChevronDown size={16} className="text-mist" />}
                </div>
              </div>

              {expanded === room && (
                <div className="border-t border-linen p-4 space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={(e) => updateItem(room, item.id, { done: e.target.checked })}
                        className="accent-forest shrink-0"
                      />
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => updateItem(room, item.id, { text: e.target.value })}
                        placeholder="e.g. Quartz countertops, island seating"
                        className={`flex-1 text-sm bg-transparent border-b border-linen focus:outline-none focus:border-forest py-0.5 ${item.done ? 'line-through text-mist' : 'text-ink'}`}
                      />
                      <button
                        onClick={() => removeItem(room, item.id)}
                        className="text-red-300 hover:text-red-500 transition-colors shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addItem(room)}
                    className="flex items-center gap-1 text-xs text-forest mt-2 hover:underline"
                  >
                    <Plus size={13} /> Add item
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add rooms */}
      <div className="bg-white rounded-xl border border-linen p-4">
        <h2 className="text-sm font-semibold text-ink mb-3">Add a Room</h2>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newRoom}
            onChange={(e) => setNewRoom(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addRoom()}
            placeholder="Custom room name…"
            className="flex-1 border border-linen rounded-lg px-3 py-2 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-forest/40"
          />
          <button
            onClick={addRoom}
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
                onClick={() => { ensureRoom(r); setExpanded(r); }}
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
