import { useState, useEffect } from 'react';

const INSTALLED_KEY = 'pwa_installed';

function isStandaloneMode() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    !!window.navigator.standalone
  );
}

function isIOSBrowser() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
}

/**
 * Shared hook for PWA install detection and prompting.
 *
 * Returns:
 *   isInstalled  – true if running as installed PWA OR localStorage flag set
 *   isInstallable – true if browser supports install (Android/Chrome) OR iOS (show instructions)
 *   isIOS        – true on iPhone/iPad/iPod
 *   triggerPrompt – async fn; calls native prompt on Android, returns 'accepted'|'dismissed'|'ios'
 */
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(() => {
    return isStandaloneMode() || !!localStorage.getItem(INSTALLED_KEY);
  });

  useEffect(() => {
    // Already running as installed app — mark and bail
    if (isStandaloneMode()) {
      localStorage.setItem(INSTALLED_KEY, '1');
      setIsInstalled(true);
      return;
    }

    function handleBeforeInstall(e) {
      e.preventDefault();
      setDeferredPrompt(e);
    }

    function handleInstalled() {
      localStorage.setItem(INSTALLED_KEY, '1');
      setIsInstalled(true);
      setDeferredPrompt(null);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const ios = isIOSBrowser();

  async function triggerPrompt() {
    if (ios) return 'ios'; // caller shows instructions
    if (!deferredPrompt) return null;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      localStorage.setItem(INSTALLED_KEY, '1');
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
    return outcome; // 'accepted' | 'dismissed'
  }

  return {
    isInstalled,
    isInstallable: !!deferredPrompt || (ios && !isInstalled),
    isIOS: ios,
    triggerPrompt,
  };
}
