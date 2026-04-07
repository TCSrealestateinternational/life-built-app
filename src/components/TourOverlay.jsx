import { useState } from 'react';
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
  Smartphone,
  Download,
  Share2,
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

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
}

function isInStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
}

function InstallStep({ installPrompt, onEnd }) {
  const alreadyInstalled = installPrompt?.isInstalled;
  const ios = installPrompt?.isIOS ?? isIOS();

  async function handleInstall() {
    await installPrompt?.triggerPrompt();
  }

  if (alreadyInstalled) {
    return (
      <div className="text-center py-4 space-y-3">
        <div className="text-4xl">✅</div>
        <p className="text-sm font-semibold text-primary">App is installed!</p>
        <p className="text-sm text-on-surface/70">You're all set — open Waymark Build from your home screen anytime.</p>
        <button
          onClick={onEnd}
          className="mt-2 text-sm font-medium bg-primary text-on-primary px-6 py-2 rounded-xl hover:bg-primary-dim transition-colors"
        >
          Let's go →
        </button>
      </div>
    );
  }

  if (ios) {
    return (
      <div className="space-y-4">
        <div className="bg-primary/5 border border-primary/15 rounded-xl px-4 py-4 space-y-3">
          <p className="text-sm font-semibold text-on-surface">Install on iPhone / iPad</p>
          <ol className="space-y-2 text-sm text-on-surface/75">
            <li className="flex items-start gap-2">
              <span className="shrink-0 w-5 h-5 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center font-semibold mt-0.5">1</span>
              Tap <Share2 size={14} className="inline mx-1 text-blue-500" /> <strong>Share</strong> in the Safari toolbar
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 w-5 h-5 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center font-semibold mt-0.5">2</span>
              Scroll down and tap <strong>"Add to Home Screen"</strong>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 w-5 h-5 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center font-semibold mt-0.5">3</span>
              Tap <strong>Add</strong> — the app icon appears on your home screen
            </li>
          </ol>
        </div>
        <p className="text-xs text-outline text-center">Must be viewed in Safari to install on iOS</p>
      </div>
    );
  }

  if (installPrompt?.isInstallable && !ios) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 bg-primary/5 border border-primary/15 rounded-xl px-4 py-4">
          <div className="shrink-0 w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Smartphone size={22} className="text-on-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-on-surface">Waymark Build</p>
            <p className="text-xs text-outline">Install to your home screen — works like a native app</p>
          </div>
        </div>
        <button
          onClick={handleInstall}
          className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary text-sm font-medium py-3 rounded-xl hover:bg-primary-dim transition-colors"
        >
          <Download size={16} /> Install App
        </button>
      </div>
    );
  }

  // Desktop or browser that doesn't support install prompt
  return (
    <div className="space-y-3 text-sm text-on-surface/70">
      <p>To install on your device:</p>
      <ul className="space-y-2">
        <li className="flex items-start gap-2">
          <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5" />
          <span><strong>Chrome on Android:</strong> tap the menu (⋮) → "Add to Home Screen"</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5" />
          <span><strong>Safari on iPhone:</strong> tap Share (<Share2 size={12} className="inline" />) → "Add to Home Screen"</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5" />
          <span><strong>Chrome on desktop:</strong> click the install icon in the address bar</span>
        </li>
      </ul>
    </div>
  );
}

export default function TourOverlay({ tourActive, tourStep, onNext, onBack, onSkip, onEnd, installPrompt }) {
  if (!tourActive) return null;

  const step = TOUR_STEPS[tourStep];
  const isFirst = tourStep === 0;
  const isLast = tourStep === TOUR_STEPS.length - 1;
  const Icon = step.isInstallStep ? Smartphone : (ICON_MAP[step.sectionId] ?? LayoutDashboard);

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
          'fixed z-50 bg-surface-container-lowest shadow-2xl flex flex-col',
          'bottom-0 left-0 right-0 rounded-t-3xl',
          'md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-60 md:right-6 md:rounded-3xl md:max-w-md md:ml-4',
        ].join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-outline-variant">
          <div className="shrink-0 w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Icon size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-outline font-medium mb-0.5">
              Step {tourStep + 1} of {TOUR_STEPS.length}
            </p>
            <h2 className="text-base font-semibold text-on-surface leading-tight">{step.title}</h2>
          </div>
          <button
            onClick={onSkip}
            className="shrink-0 p-1 rounded-xl text-outline hover:text-on-surface hover:bg-outline-variant/60 transition-colors"
            aria-label="Close tour"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body — scrollable on mobile */}
        <div className="px-5 py-4 space-y-3 max-h-[55vh] overflow-y-auto md:max-h-none">
          <p className="text-sm text-on-surface/80 leading-relaxed">{step.description}</p>

          {step.isInstallStep ? (
            <InstallStep installPrompt={installPrompt} onEnd={onEnd} />
          ) : (
            <>
              <ul className="space-y-1.5">
                {step.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-on-surface/70">
                    <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-primary/50" />
                    {f}
                  </li>
                ))}
              </ul>

              {step.tip && (
                <div className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-3">
                  <p className="text-xs text-primary font-semibold uppercase tracking-wide mb-1">Pro tip</p>
                  <p className="text-sm text-on-surface/75 leading-relaxed">{step.tip}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-outline-variant flex items-center gap-3">
          {/* Progress dots */}
          <div className="flex items-center gap-1 flex-1">
            {TOUR_STEPS.map((_, i) => (
              <span
                key={i}
                className={[
                  'rounded-full transition-all duration-200',
                  i === tourStep
                    ? 'w-4 h-1.5 bg-primary'
                    : i < tourStep
                    ? 'w-1.5 h-1.5 bg-primary/40'
                    : 'w-1.5 h-1.5 bg-outline-variant',
                ].join(' ')}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {isFirst ? (
              <button
                onClick={onSkip}
                className="text-sm text-outline hover:text-on-surface transition-colors px-3 py-1.5"
              >
                Skip
              </button>
            ) : (
              <button
                onClick={onBack}
                className="text-sm text-outline hover:text-on-surface transition-colors px-3 py-1.5"
              >
                Back
              </button>
            )}

            {/* On install step, show "Maybe Later" instead of Done unless they've installed */}
            {isLast ? (
              <button
                onClick={onEnd}
                className="text-sm font-medium bg-primary text-on-primary px-4 py-1.5 rounded-xl hover:bg-primary-dim transition-colors"
              >
                {step.isInstallStep ? 'Maybe Later' : 'Done'}
              </button>
            ) : (
              <button
                onClick={onNext}
                className="text-sm font-medium bg-primary text-on-primary px-4 py-1.5 rounded-xl hover:bg-primary-dim transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
