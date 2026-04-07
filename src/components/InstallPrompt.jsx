import { useState } from 'react';
import { X, Download, Share2 } from 'lucide-react';

const DISMISS_KEY = 'pwa_install_dismissed';

export default function InstallPrompt({ hideDuring = false, installPrompt }) {
  const [dismissed, setDismissed] = useState(() => !!localStorage.getItem(DISMISS_KEY));

  if (hideDuring) return null;
  if (!installPrompt) return null;
  if (installPrompt.isInstalled) return null;
  if (!installPrompt.isInstallable) return null;
  if (dismissed) return null;

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  }

  async function handleInstall() {
    const outcome = await installPrompt.triggerPrompt();
    if (outcome === 'accepted') setDismissed(true);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe">
      <div className="max-w-sm mx-auto bg-on-surface text-on-primary rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-start gap-3 p-4">
          <div className="shrink-0 w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
              <path d="M4 14l12-10 12 10v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"
                    stroke="white" strokeWidth="2" strokeLinejoin="round" fill="none"/>
              <path d="M12 30v-9h8v9" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Add Waymark Build to your home screen</p>
            {installPrompt.isIOS ? (
              <p className="text-xs text-outline mt-0.5 leading-snug">
                Tap <Share2 size={11} className="inline mb-0.5" /> <strong>Share</strong> then <strong>"Add to Home Screen"</strong>
              </p>
            ) : (
              <p className="text-xs text-outline mt-0.5">Install the app for quick access — works offline too.</p>
            )}
          </div>
          <button onClick={dismiss} className="text-outline hover:text-on-primary shrink-0 p-0.5 transition-colors">
            <X size={16} />
          </button>
        </div>

        {!installPrompt.isIOS && (
          <div className="px-4 pb-4 flex gap-2">
            <button
              onClick={handleInstall}
              className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-on-primary text-sm py-2 rounded-xl hover:bg-primary-dim transition-colors font-medium"
            >
              <Download size={15} /> Install App
            </button>
            <button
              onClick={dismiss}
              className="text-sm text-outline hover:text-on-primary px-4 transition-colors"
            >
              Not now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
