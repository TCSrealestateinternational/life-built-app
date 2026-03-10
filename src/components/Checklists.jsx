import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import PunchListTab from './PunchListTab';
import { PUNCH_LIST_TOTAL } from '../data/punchListData';

const CHECKLIST_META = {
  landEvaluation: { label: 'Land Evaluation', tab: 'Land Eval', emoji: '🌿', desc: 'Before you buy — due diligence essentials.' },
  permits: { label: 'Permits & Inspections', tab: 'Permits', emoji: '📋', desc: 'Keep your build legal and on track.' },
  contractor: { label: 'Hiring a Contractor', tab: 'Contractor', emoji: '🔨', desc: 'Protect yourself with these steps before signing.' },
  punchList: { label: 'Punch List Inspection', tab: 'Punch List', emoji: '🏷️', desc: 'Final walkthrough before closing — blue tape inspection.' },
};

export default function Checklists({ project, updateProject }) {
  const [activeTab, setActiveTab] = useState('landEvaluation');
  const checklists = project?.checklists ?? {};

  // Generic checklist toggle (for landEvaluation, permits, contractor)
  function toggle(listKey, id) {
    const list = checklists[listKey] ?? [];
    updateProject({
      checklists: {
        ...checklists,
        [listKey]: list.map((item) => (item.id === id ? { ...item, done: !item.done } : item)),
      },
    });
  }

  // Punch list toggle — stores array of checked IDs
  function togglePunchList(itemId) {
    const current = checklists.punchList ?? [];
    const updated = current.includes(itemId)
      ? current.filter((id) => id !== itemId)
      : [...current, itemId];
    updateProject({ checklists: { ...checklists, punchList: updated } });
  }

  // Punch list custom items — stored per section in punchListCustom
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

  function addItem(listKey) {
    const list = checklists[listKey] ?? [];
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

  const tabs = Object.keys(CHECKLIST_META);
  const isPunchList = activeTab === 'punchList';
  const currentList = isPunchList ? [] : (checklists[activeTab] ?? []);
  const punchListChecked = checklists.punchList ?? [];
  const punchListCustom = checklists.punchListCustom ?? {};
  const customTotal = Object.values(punchListCustom).reduce((s, items) => s + items.length, 0);
  const done = isPunchList ? punchListChecked.length : currentList.filter((i) => i.done).length;
  const total = isPunchList ? PUNCH_LIST_TOTAL + customTotal : currentList.length;
  const meta = CHECKLIST_META[activeTab];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
          Checklists
        </h1>
        <p className="text-sage text-sm mt-0.5">Step-by-step guides for your land-to-build journey.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-linen/50 p-1 rounded-xl overflow-x-auto">
        {tabs.map((key) => {
          const m = CHECKLIST_META[key];
          const list = checklists[key] ?? [];
          const d = key === 'punchList' ? (checklists.punchList ?? []).length : list.filter((i) => i.done).length;
          const t = key === 'punchList' ? PUNCH_LIST_TOTAL + customTotal : list.length;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 text-xs font-medium px-2 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === key ? 'bg-white text-ink shadow-sm' : 'text-mist hover:text-ink'
              }`}
            >
              {m.emoji} {m.tab}
              <span className="ml-1 text-mist">({d}/{t})</span>
            </button>
          );
        })}
      </div>

      {/* Active list */}
      <div className="bg-white rounded-xl border border-linen p-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-ink">{meta.emoji} {meta.label}</h2>
          <span className="text-xs text-mist">{done}/{total} done</span>
        </div>
        <p className="text-xs text-mist mb-4">{meta.desc}</p>

        {/* Progress bar */}
        {total > 0 && (
          <div className="h-1.5 bg-linen rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-forest rounded-full transition-all"
              style={{ width: `${(done / total) * 100}%` }}
            />
          </div>
        )}

        {/* Punch list renders its own layout */}
        {isPunchList ? (
          <PunchListTab
            checkedIds={punchListChecked}
            customItems={punchListCustom}
            onToggle={togglePunchList}
            onAddCustom={addPunchListCustomItem}
            onUpdateCustom={updatePunchListCustomItem}
            onRemoveCustom={removePunchListCustomItem}
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
                    className={`flex-1 text-sm bg-transparent border-b border-transparent hover:border-linen focus:border-forest focus:outline-none py-0.5 ${item.done ? 'line-through text-mist' : 'text-ink'}`}
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
