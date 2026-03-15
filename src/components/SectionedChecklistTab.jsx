import { useState } from 'react';
import { ChevronDown, ChevronUp, Lightbulb, Plus, Trash2 } from 'lucide-react';

export default function SectionedChecklistTab({
  sections,
  proTip,
  checkedIds,
  customItems,
  onToggle,
  onAddCustom,
  onUpdateCustom,
  onRemoveCustom,
}) {
  const [expandedSections, setExpandedSections] = useState({});
  const checkedSet = new Set(checkedIds);

  function toggleSection(id) {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="space-y-3">
      {/* Pro Tip */}
      {proTip && (
        <div className="border border-amber-200 rounded-xl bg-amber-50 px-4 py-3">
          <div className="flex items-start gap-2">
            <Lightbulb size={15} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 mb-0.5">{proTip.title}</p>
              <p className="text-sm text-amber-700 leading-snug">{proTip.text}</p>
            </div>
          </div>
        </div>
      )}

      {/* Section accordions */}
      {sections.map((section) => {
        const sectionCustom = (customItems ?? {})[section.id] ?? [];
        const allItems = [...section.items, ...sectionCustom];
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
                {/* Static items */}
                <div className="divide-y divide-linen/50">
                  {section.items.map((item) => {
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

                {/* Custom items + add button */}
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
                              className={`flex-1 text-sm bg-transparent border-b border-transparent hover:border-linen focus:border-forest focus:outline-none py-0.5 ${
                                checked ? 'line-through text-mist' : 'text-ink'
                              }`}
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
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
