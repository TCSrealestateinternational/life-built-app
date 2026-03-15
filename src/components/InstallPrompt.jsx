import { useState, useEffect } from 'react';
import { X, Download, Share } from 'lucide-react';

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
}

function isInStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
}

export default function InstallPrompt({ hideDuring = false }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIOS, setShowIOS] = useState(false);

  useEffect(() => {
    // Don't show if already installed
    if (isInStandaloneMode()) return;

    // Don't show if dismissed this session
    if (sessionStorage.getItem('installDismissed')) return;

    // Android/Chrome: capture the beforeinstallprompt event
    function handleBeforeInstall(e) {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowAndroid(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // iOS: show manual instructions
    if (isIOS()) {
      setShowIOS(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  function dismiss() {
    sessionStorage.setItem('installDismissed', '1');
    setShowAndroid(false);
    setShowIOS(false);
    setDeferredPrompt(null);
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowAndroid(false);
      setDeferredPrompt(null);
    }
  }

  if (hideDuring) return null;
  if (!showAndroid && !showIOS) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe">
      <div className="max-w-sm mx-auto bg-ink text-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-start gap-3 p-4">
          <div className="shrink-0 w-10 h-10 bg-forest rounded-xl flex items-center justify-center">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
              <path d="M4 14l12-10 12 10v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"
                    stroke="white" strokeWidth="2" strokeLinejoin="round" fill="none"/>
              <path d="M12 30v-9h8v9" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Add Life Built to your home screen</p>
            {showAndroid && (
              <p className="text-xs text-mist mt-0.5">Install the app for quick access — works offline too.</p>
            )}
            {showIOS && (
              <p className="text-xs text-mist mt-0.5 leading-snug">
                Tap <Share size={11} className="inline mb-0.5" /> <strong>Share</strong> then <strong>"Add to Home Screen"</strong>
              </p>
            )}
          </div>
          <button onClick={dismiss} className="text-mist hover:text-white shrink-0 p-0.5 transition-colors">
            <X size={16} />
          </button>
        </div>

        {showAndroid && (
          <div className="px-4 pb-4 flex gap-2">
            <button
              onClick={handleInstall}
              className="flex-1 flex items-center justify-center gap-1.5 bg-forest text-white text-sm py-2 rounded-xl hover:bg-deep transition-colors font-medium"
            >
              <Download size={15} /> Install App
            </button>
            <button
              onClick={dismiss}
              className="text-sm text-mist hover:text-white px-4 transition-colors"
            >
              Not now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
