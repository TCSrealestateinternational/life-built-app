import { useState } from 'react';
import { ChevronDown, ChevronUp, Info, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { PUNCH_LIST_INTRO, PUNCH_LIST_SECTIONS, PUNCH_LIST_NOTES } from '../data/punchListData';

export default function PunchListTab({ checkedIds, customItems, onToggle, onAddCustom, onUpdateCustom, onRemoveCustom }) {
  const [expandedSections, setExpandedSections] = useState({});
  const [showIntro, setShowIntro] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const checkedSet = new Set(checkedIds);

  function toggleSection(id) {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="space-y-3">
      {/* Intro card */}
      <div className="border border-forest/20 rounded-xl bg-forest/5 overflow-hidden">
        <button
          onClick={() => setShowIntro(!showIntro)}
          className="w-full flex items-center justify-between px-4 py-3 text-left"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-forest">
            <Info size={15} /> How to Use This Checklist
          </span>
          {showIntro ? <ChevronUp size={15} className="text-forest" /> : <ChevronDown size={15} className="text-forest" />}
        </button>
        {showIntro && (
          <div className="px-4 pb-4 text-sm text-ink space-y-3 border-t border-forest/20">
            <p className="mt-3 text-mist leading-relaxed">{PUNCH_LIST_INTRO.description}</p>
            <div>
              <p className="font-medium text-ink mb-1">What This Covers</p>
              <p className="text-mist">{PUNCH_LIST_INTRO.whatCovers}</p>
            </div>
            <div>
              <p className="font-medium text-ink mb-1">What This Doesn't Cover</p>
              <p className="text-mist">{PUNCH_LIST_INTRO.whatNotCovers}</p>
            </div>
            <div>
              <p className="font-medium text-ink mb-1">Time Required</p>
              <p className="text-mist">{PUNCH_LIST_INTRO.timeRequired}</p>
            </div>
            <div>
              <p className="font-medium text-ink mb-1">What to Bring</p>
              <ul className="list-disc pl-4 space-y-1 text-mist">
                {PUNCH_LIST_INTRO.whatToBring.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
            <div>
              <p className="font-medium text-ink mb-1">How to Mark Issues</p>
              <ul className="list-disc pl-4 space-y-1 text-mist">
                {PUNCH_LIST_INTRO.howToMark.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
            <div>
              <p className="font-medium text-ink mb-1">After the Walkthrough</p>
              <ul className="list-disc pl-4 space-y-1 text-mist">
                {PUNCH_LIST_INTRO.afterWalkthrough.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Section accordions */}
      {PUNCH_LIST_SECTIONS.map((section) => {
        const staticItems = section.subsections.flatMap((sub) => sub.items);
        const sectionCustom = (customItems ?? {})[section.id] ?? [];
        const allItems = [...staticItems, ...sectionCustom];
        const doneCount = allItems.filter((item) => checkedSet.has(item.id)).length;
        const isExpanded = !!expandedSections[section.id];

        return (
          <div key={section.id} className="bg-white rounded-xl border border-linen overflow-hidden">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-cream/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-ink text-sm">{section.title}</div>
                <div className="text-xs text-mist mt-0.5">{doneCount} of {allItems.length} checked</div>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <div className="w-16 h-1.5 bg-linen rounded-full overflow-hidden">
                  <div
                    className="h-full bg-forest rounded-full transition-all"
                    style={{ width: allItems.length > 0 ? `${(doneCount / allItems.length) * 100}%` : '0%' }}
                  />
                </div>
                {isExpanded
                  ? <ChevronUp size={15} className="text-mist" />
                  : <ChevronDown size={15} className="text-mist" />}
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-linen">
                {/* Static subsections */}
                {section.subsections.map((sub) => (
                  <div key={sub.id}>
                    <div className="px-4 py-2 bg-cream/70 border-b border-linen">
                      <span className="text-xs font-semibold text-mist uppercase tracking-wide">{sub.title}</span>
                    </div>
                    <div className="divide-y divide-linen/50">
                      {sub.items.map((item) => {
                        const checked = checkedSet.has(item.id);
                        return (
                          <label
                            key={item.id}
                            className="flex items-start gap-3 px-4 py-2.5 hover:bg-cream/30 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => onToggle(item.id)}
                              className="accent-forest mt-0.5 shrink-0"
                            />
                            <span className={`text-sm leading-snug ${checked ? 'line-through text-mist' : 'text-ink'}`}>
                              {item.text}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Custom items */}
                {(sectionCustom.length > 0 || true) && (
                  <div className="border-t border-linen">
                    {sectionCustom.length > 0 && (
                      <div className="divide-y divide-linen/50">
                        {sectionCustom.map((item) => {
                          const checked = checkedSet.has(item.id);
                          return (
                            <div key={item.id} className="flex items-center gap-3 px-4 py-2.5 group hover:bg-cream/30">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => onToggle(item.id)}
                                className="accent-forest shrink-0"
                              />
                              <input
                                type="text"
                                value={item.text}
                                onChange={(e) => onUpdateCustom(section.id, item.id, e.target.value)}
                                placeholder="Custom item…"
                                className={`flex-1 text-sm bg-transparent border-b border-transparent hover:border-linen focus:border-forest focus:outline-none py-0.5 ${checked ? 'line-through text-mist' : 'text-ink'}`}
                              />
                              <button
                                onClick={() => onRemoveCustom(section.id, item.id)}
                                className="text-red-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div className="px-4 py-2.5">
                      <button
                        onClick={() => onAddCustom(section.id)}
                        className="flex items-center gap-1 text-xs text-forest hover:underline"
                      >
                        <Plus size={12} /> Add item to this section
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Notes & Red Flags */}
      <div className="border border-amber-200 rounded-xl bg-amber-50 overflow-hidden">
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="w-full flex items-center justify-between px-4 py-3 text-left"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-amber-800">
            <AlertTriangle size={15} /> Notes & Red Flags
          </span>
          {showNotes
            ? <ChevronUp size={15} className="text-amber-600" />
            : <ChevronDown size={15} className="text-amber-600" />}
        </button>
        {showNotes && (
          <div className="px-4 pb-4 text-sm space-y-3 border-t border-amber-200">
            <div className="mt-3">
              <p className="font-medium text-amber-900 mb-1">Important Reminders</p>
              <ul className="list-disc pl-4 space-y-1 text-amber-800">
                {PUNCH_LIST_NOTES.reminders.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
            <div>
              <p className="font-medium text-red-700 mb-1">Red Flags That Need Immediate Attention</p>
              <ul className="list-disc pl-4 space-y-1 text-red-700">
                {PUNCH_LIST_NOTES.redFlags.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
