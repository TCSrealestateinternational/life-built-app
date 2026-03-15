import { useState } from 'react';
import { Plus, Trash2, Printer, ArrowLeft } from 'lucide-react';
import PunchListTab from './PunchListTab';
import SectionedChecklistTab from './SectionedChecklistTab';
import { PUNCH_LIST_TOTAL } from '../data/punchListData';
import { INSPECTION_CHECKLISTS, INSPECTION_TOTALS } from '../data/inspectionChecklistsData';
import { printGenericChecklist, printPunchList } from '../utils/printChecklist';

const CHECKLIST_META = {
  landEvaluation:       { label: 'Land Evaluation',                        emoji: '🌿', desc: 'Before you buy — due diligence essentials.',                                       type: 'generic'   },
  permits:              { label: 'Permits & Inspections',                   emoji: '📋', desc: 'Keep your build legal and on track.',                                              type: 'generic'   },
  contractor:           { ...INSPECTION_CHECKLISTS.contractor,               type: 'sectioned' },
  foundationPrePour:    { ...INSPECTION_CHECKLISTS.foundationPrePour,       type: 'sectioned' },
  framingRoughIn:       { ...INSPECTION_CHECKLISTS.framingRoughIn,          type: 'sectioned' },
  plumbingRoughIn:      { ...INSPECTION_CHECKLISTS.plumbingRoughIn,         type: 'sectioned' },
  electricalRoughIn:    { ...INSPECTION_CHECKLISTS.electricalRoughIn,       type: 'sectioned' },
  hvacRoughIn:          { ...INSPECTION_CHECKLISTS.hvacRoughIn,             type: 'sectioned' },
  insulationInspection: { ...INSPECTION_CHECKLISTS.insulationInspection,    type: 'sectioned' },
  drywallInspection:    { ...INSPECTION_CHECKLISTS.drywallInspection,       type: 'sectioned' },
  finalInspections:     { ...INSPECTION_CHECKLISTS.finalInspections,        type: 'sectioned' },
  punchList:            { label: 'Punch List Inspection',                   emoji: '🏷️', desc: 'Final walkthrough before closing — blue tape inspection.',                       type: 'punchList' },
  coInspection:         { ...INSPECTION_CHECKLISTS.coInspection,            type: 'sectioned' },
};

export default function Checklists({ project, updateProject }) {
  const [activeTab, setActiveTab] = useState(null);
  const checklists = project?.checklists ?? {};

  // ── Generic flat-list handlers (landEvaluation, permits, contractor) ───────

  function toggle(listKey, id) {
    const list = checklists[listKey] ?? [];
    updateProject({
      checklists: {
        ...checklists,
        [listKey]: list.map((item) => (item.id === id ? { ...item, done: !item.done } : item)),
      },
    });
  }

  function addItem(listKey) {
    const list = checklists[listKey] ?? [];
    if (list.length > 0 && !list[list.length - 1].text.trim()) return;
    updateProject({
      checklists: {
        ...checklists,
        [listKey]: [...list, { id: `${Date.now()}_${Math.random().toString(36).slice(2)}`, text: '', done: false }],
      },
    });
  }

  function updateText(listKey, id, text) {
    const list = checklists[listKey] ?? [];
    updateProject({
      checklists: {
        ...checklists,
        [listKey]: list.map((item) => (item.id === id ? { ...item, text } : item)),
      },
    });
  }

  function removeItem(listKey, id) {
    const list = checklists[listKey] ?? [];
    updateProject({
      checklists: { ...checklists, [listKey]: list.filter((i) => i.id !== id) },
    });
  }

  // ── Punch list handlers ────────────────────────────────────────────────────

  function togglePunchList(itemId) {
    const current = checklists.punchList ?? [];
    const updated = current.includes(itemId)
      ? current.filter((id) => id !== itemId)
      : [...current, itemId];
    updateProject({ checklists: { ...checklists, punchList: updated } });
  }

  function addPunchListCustomItem(sectionId) {
    const custom = checklists.punchListCustom ?? {};
    const sectionItems = custom[sectionId] ?? [];
    const newItem = { id: `cust_${sectionId}_${Date.now()}_${Math.random().toString(36).slice(2)}`, text: '' };
    updateProject({
      checklists: {
        ...checklists,
        punchListCustom: { ...custom, [sectionId]: [...sectionItems, newItem] },
      },
    });
  }

  function updatePunchListCustomItem(sectionId, itemId, text) {
    const custom = checklists.punchListCustom ?? {};
    const sectionItems = custom[sectionId] ?? [];
    updateProject({
      checklists: {
        ...checklists,
        punchListCustom: {
          ...custom,
          [sectionId]: sectionItems.map((i) => (i.id === itemId ? { ...i, text } : i)),
        },
      },
    });
  }

  function removePunchListCustomItem(sectionId, itemId) {
    const custom = checklists.punchListCustom ?? {};
    const sectionItems = custom[sectionId] ?? [];
    const punchChecked = checklists.punchList ?? [];
    updateProject({
      checklists: {
        ...checklists,
        punchList: punchChecked.filter((id) => id !== itemId),
        punchListCustom: {
          ...custom,
          [sectionId]: sectionItems.filter((i) => i.id !== itemId),
        },
      },
    });
  }

  // ── Sectioned inspection checklist handlers ───────────────────────────────

  function toggleSectioned(key, itemId) {
    const current = checklists[key] ?? [];
    const updated = current.includes(itemId)
      ? current.filter((id) => id !== itemId)
      : [...current, itemId];
    updateProject({ checklists: { ...checklists, [key]: updated } });
  }

  function addSectionedCustom(key, sectionId) {
    const customKey = key + 'Custom';
    const custom = checklists[customKey] ?? {};
    const sectionItems = custom[sectionId] ?? [];
    const newItem = { id: `cust_${sectionId}_${Date.now()}_${Math.random().toString(36).slice(2)}`, text: '' };
    updateProject({
      checklists: {
        ...checklists,
        [customKey]: { ...custom, [sectionId]: [...sectionItems, newItem] },
      },
    });
  }

  function updateSectionedCustom(key, sectionId, itemId, text) {
    const customKey = key + 'Custom';
    const custom = checklists[customKey] ?? {};
    const sectionItems = custom[sectionId] ?? [];
    updateProject({
      checklists: {
        ...checklists,
        [customKey]: {
          ...custom,
          [sectionId]: sectionItems.map((i) => (i.id === itemId ? { ...i, text } : i)),
        },
      },
    });
  }

  function removeSectionedCustom(key, sectionId, itemId) {
    const customKey = key + 'Custom';
    const custom = checklists[customKey] ?? {};
    const sectionItems = custom[sectionId] ?? [];
    const checked = checklists[key] ?? [];
    updateProject({
      checklists: {
        ...checklists,
        [key]: checked.filter((id) => id !== itemId),
        [customKey]: {
          ...custom,
          [sectionId]: sectionItems.filter((i) => i.id !== itemId),
        },
      },
    });
  }

  // ── Progress helpers ───────────────────────────────────────────────────────

  const punchListChecked = checklists.punchList ?? [];
  const punchListCustom = checklists.punchListCustom ?? {};
  const punchCustomTotal = Object.values(punchListCustom).reduce((s, items) => s + items.length, 0);

  function getProgress(key) {
    if (key === 'punchList') {
      const t = PUNCH_LIST_TOTAL + punchCustomTotal;
      return { done: punchListChecked.length, total: t };
    }
    if (INSPECTION_TOTALS[key] !== undefined) {
      const customKey = key + 'Custom';
      const custom = checklists[customKey] ?? {};
      const customCount = Object.values(custom).reduce((s, items) => s + items.length, 0);
      const checked = checklists[key] ?? [];
      return { done: checked.length, total: INSPECTION_TOTALS[key] + customCount };
    }
    const list = checklists[key] ?? [];
    return { done: list.filter((i) => i.done).length, total: list.length };
  }

  // ── Hub view ───────────────────────────────────────────────────────────────

  if (!activeTab) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Checklists
          </h1>
          <p className="text-sage text-sm mt-0.5">Step-by-step guides for your land-to-build journey.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.keys(CHECKLIST_META).map((key) => {
            const m = CHECKLIST_META[key];
            const { done, total } = getProgress(key);
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const complete = total > 0 && done === total;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="text-left bg-white border border-linen rounded-xl p-5 hover:border-forest/40 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-2xl mb-1">{m.emoji}</div>
                    <div className="font-semibold text-ink text-sm group-hover:text-forest transition-colors">{m.label}</div>
                    <div className="text-xs text-mist mt-0.5 leading-snug">{m.desc}</div>
                  </div>
                  {complete && (
                    <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full shrink-0 ml-2">Done</span>
                  )}
                </div>
                <div className="h-1.5 bg-linen rounded-full overflow-hidden mb-1.5">
                  <div
                    className={`h-full rounded-full transition-all ${complete ? 'bg-green-500' : 'bg-forest'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="text-xs text-mist">
                  {total > 0 ? `${done} / ${total} done` : 'Not started'}
                  {total > 0 && !complete && <span className="ml-1 text-forest font-medium">({pct}%)</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Detail view ────────────────────────────────────────────────────────────

  const meta = CHECKLIST_META[activeTab];
  const isPunchList = activeTab === 'punchList';
  const isSectioned = meta.type === 'sectioned';
  const currentList = (!isPunchList && !isSectioned) ? (checklists[activeTab] ?? []) : [];
  const { done, total } = getProgress(activeTab);

  function handlePrint() {
    if (isPunchList) {
      printPunchList({ checkedIds: punchListChecked, customItems: punchListCustom });
    } else if (isSectioned) {
      const checkedSet = new Set(checklists[activeTab] ?? []);
      const allItems = INSPECTION_CHECKLISTS[activeTab].sections.flatMap((sec) =>
        sec.items.map((item) => ({ ...item, done: checkedSet.has(item.id) }))
      );
      printGenericChecklist({ label: meta.label, emoji: meta.emoji, desc: meta.desc, items: allItems });
    } else {
      printGenericChecklist({ label: meta.label, emoji: meta.emoji, desc: meta.desc, items: currentList });
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Back button + header */}
      <div className="mb-6">
        <button
          onClick={() => setActiveTab(null)}
          className="flex items-center gap-1.5 text-xs text-mist hover:text-forest transition-colors mb-4"
        >
          <ArrowLeft size={13} /> All Checklists
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
              {meta.emoji} {meta.label}
            </h1>
            <p className="text-sage text-sm mt-0.5">{meta.desc}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-mist">{done}/{total} done</span>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs text-mist hover:text-forest transition-colors"
              title="Print / Save as PDF"
            >
              <Printer size={13} /> Print
            </button>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="h-1.5 bg-linen rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-forest rounded-full transition-all"
            style={{ width: `${(done / total) * 100}%` }}
          />
        </div>
      )}

      {/* List content */}
      <div className="bg-white rounded-xl border border-linen p-5">
        {isPunchList ? (
          <PunchListTab
            checkedIds={punchListChecked}
            customItems={punchListCustom}
            onToggle={togglePunchList}
            onAddCustom={addPunchListCustomItem}
            onUpdateCustom={updatePunchListCustomItem}
            onRemoveCustom={removePunchListCustomItem}
          />
        ) : isSectioned ? (
          <SectionedChecklistTab
            sections={INSPECTION_CHECKLISTS[activeTab].sections}
            proTip={INSPECTION_CHECKLISTS[activeTab].proTip}
            checkedIds={checklists[activeTab] ?? []}
            customItems={checklists[activeTab + 'Custom'] ?? {}}
            onToggle={(itemId) => toggleSectioned(activeTab, itemId)}
            onAddCustom={(sectionId) => addSectionedCustom(activeTab, sectionId)}
            onUpdateCustom={(sectionId, itemId, text) => updateSectionedCustom(activeTab, sectionId, itemId, text)}
            onRemoveCustom={(sectionId, itemId) => removeSectionedCustom(activeTab, sectionId, itemId)}
          />
        ) : (
          <>
            <div className="space-y-2">
              {currentList.map((item) => (
                <div key={item.id} className="flex items-center gap-3 group">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => toggle(activeTab, item.id)}
                    className="accent-forest shrink-0"
                  />
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => updateText(activeTab, item.id, e.target.value)}
                    placeholder="Checklist item…"
                    className={`flex-1 text-sm bg-transparent border-b border-transparent hover:border-linen focus:border-forest focus:outline-none py-0.5 ${
                      item.done ? 'line-through text-mist' : 'text-ink'
                    }`}
                  />
                  <button
                    onClick={() => removeItem(activeTab, item.id)}
                    className="text-red-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => addItem(activeTab)}
              className="flex items-center gap-1.5 text-xs text-forest mt-4 hover:underline"
            >
              <Plus size={13} /> Add item
            </button>
          </>
        )}
      </div>
    </div>
  );
}
