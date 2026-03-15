import { LAND_EVAL_CHECKLISTS, LAND_TYPE_OPTIONS } from '../data/landEvalData';
import SectionedChecklistTab from './SectionedChecklistTab';

export default function LandEvaluationTab({
  activeType,
  onSetType,
  checkedIds,
  customItems,
  onToggle,
  onAddCustom,
  onUpdateCustom,
  onRemoveCustom,
}) {
  const typeData = LAND_EVAL_CHECKLISTS[activeType];

  return (
    <div className="space-y-4">
      {/* Land type selector */}
      <div className="grid grid-cols-2 gap-2">
        {LAND_TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSetType(opt.id)}
            className={`text-sm font-medium px-3 py-2.5 rounded-lg border transition-all text-left leading-snug ${
              activeType === opt.id
                ? 'bg-forest text-white border-forest'
                : 'bg-white text-ink border-linen hover:border-forest/40 hover:bg-cream/50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Land type description */}
      <p className="text-xs text-mist leading-snug">{typeData.desc}</p>

      {/* Sections — key on activeType forces remount when type changes */}
      <SectionedChecklistTab
        key={activeType}
        sections={typeData.sections}
        proTip={null}
        checkedIds={checkedIds}
        customItems={customItems}
        onToggle={onToggle}
        onAddCustom={onAddCustom}
        onUpdateCustom={onUpdateCustom}
        onRemoveCustom={onRemoveCustom}
      />
    </div>
  );
}
