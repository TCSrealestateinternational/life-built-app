import { TOUR_STEPS } from '../data/tourSteps';
import {
  LayoutDashboard,
  UserCircle,
  MapPin,
  Palette,
  DollarSign,
  Calendar,
  ClipboardList,
  CreditCard,
  MessageSquare,
  Shield,
  CheckSquare,
  FolderOpen,
  BookUser,
  Users,
  X,
} from 'lucide-react';

const ICON_MAP = {
  dashboard: LayoutDashboard,
  profile: UserCircle,
  properties: MapPin,
  design: Palette,
  budget: DollarSign,
  timeline: Calendar,
  changeorders: ClipboardList,
  payments: CreditCard,
  commslog: MessageSquare,
  lienwaiver: Shield,
  checklists: CheckSquare,
  documents: FolderOpen,
  keycontacts: BookUser,
  team: Users,
};

export default function TourOverlay({ tourActive, tourStep, onNext, onBack, onSkip, onEnd }) {
  if (!tourActive) return null;

  const step = TOUR_STEPS[tourStep];
  const isFirst = tourStep === 0;
  const isLast = tourStep === TOUR_STEPS.length - 1;
  const Icon = ICON_MAP[step.sectionId] ?? LayoutDashboard;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60"
        onClick={onSkip}
        aria-hidden="true"
      />

      {/* Tour card */}
      <div
        className={[
          'fixed z-50 bg-white shadow-2xl flex flex-col',
          // Mobile: bottom sheet
          'bottom-0 left-0 right-0 rounded-t-2xl',
          // Desktop: positioned in main content area beside the sidebar
          'md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-60 md:right-6 md:rounded-2xl md:max-w-md md:ml-4',
        ].join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-linen">
          <div className="shrink-0 w-9 h-9 rounded-lg bg-forest/10 flex items-center justify-center text-forest">
            <Icon size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-mist font-medium mb-0.5">
              Step {tourStep + 1} of {TOUR_STEPS.length}
            </p>
            <h2 className="text-base font-semibold text-ink leading-tight">{step.title}</h2>
          </div>
          <button
            onClick={onSkip}
            className="shrink-0 p-1 rounded-lg text-mist hover:text-ink hover:bg-linen/60 transition-colors"
            aria-label="Close tour"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body — scrollable on mobile */}
        <div className="px-5 py-4 space-y-3 max-h-[55vh] overflow-y-auto md:max-h-none">
          <p className="text-sm text-ink/80 leading-relaxed">{step.description}</p>

          <ul className="space-y-1.5">
            {step.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink/70">
                <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-forest/50" />
                {f}
              </li>
            ))}
          </ul>

          {step.tip && (
            <div className="rounded-xl border border-forest/15 bg-forest/5 px-4 py-3">
              <p className="text-xs text-forest font-semibold uppercase tracking-wide mb-1">Pro tip</p>
              <p className="text-sm text-ink/75 leading-relaxed">{step.tip}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-linen flex items-center gap-3">
          {/* Progress dots */}
          <div className="flex items-center gap-1 flex-1">
            {TOUR_STEPS.map((_, i) => (
              <span
                key={i}
                className={[
                  'rounded-full transition-all duration-200',
                  i === tourStep
                    ? 'w-4 h-1.5 bg-forest'
                    : i < tourStep
                    ? 'w-1.5 h-1.5 bg-forest/40'
                    : 'w-1.5 h-1.5 bg-linen',
                ].join(' ')}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {isFirst ? (
              <button
                onClick={onSkip}
                className="text-sm text-mist hover:text-ink transition-colors px-3 py-1.5"
              >
                Skip
              </button>
            ) : (
              <button
                onClick={onBack}
                className="text-sm text-mist hover:text-ink transition-colors px-3 py-1.5"
              >
                Back
              </button>
            )}

            <button
              onClick={isLast ? onEnd : onNext}
              className="text-sm font-medium bg-forest text-white px-4 py-1.5 rounded-lg hover:bg-deep transition-colors"
            >
              {isLast ? 'Done' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
