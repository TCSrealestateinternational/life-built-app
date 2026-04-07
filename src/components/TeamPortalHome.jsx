import { MapPin, Clock, ChevronRight, Smartphone, Download, Share2, X, LogOut, ArrowUpRight } from 'lucide-react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const PORTAL_HOME_DISMISS_KEY = 'pwa_portal_home_dismiss';

function fmtRelative(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function ProjectCard({ entry, onRemove }) {
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="bg-surface-container-lowest rounded-3xl shadow-md border border-outline-variant/10 overflow-hidden">
      <a
        href={`/t/${entry.token}`}
        className="flex items-center gap-4 p-4 hover:bg-surface/50 transition-colors"
      >
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <MapPin size={20} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-on-surface truncate">
            {entry.projectLabel || 'Build Project'}
          </p>
          <p className="text-xs text-outline mt-0.5">
            {entry.memberRole || 'Team'}{entry.memberName ? ` · ${entry.memberName}` : ''}
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          {entry.lastVisited && (
            <span className="text-[11px] text-outline hidden sm:block">
              <Clock size={11} className="inline mr-0.5 -mt-px" />
              {fmtRelative(entry.lastVisited)}
            </span>
          )}
          <ChevronRight size={16} className="text-outline" />
        </div>
      </a>
      {/* Remove row */}
      <div className="border-t border-outline-variant/60 px-4 py-1.5 flex justify-end">
        {confirm ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-outline">Remove from list?</span>
            <button
              onClick={() => { onRemove(entry.token); setConfirm(false); }}
              className="text-xs text-red-600 font-medium hover:underline"
            >
              Yes
            </button>
            <button
              onClick={() => setConfirm(false)}
              className="text-xs text-outline hover:underline"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirm(true)}
            className="text-[11px] text-outline hover:text-red-500 transition-colors"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

export default function TeamPortalHome({ tokenStore, user, teamProfile }) {
  const installPrompt = useInstallPrompt();
  const [installDismissed, setInstallDismissed] = useState(
    () => !!localStorage.getItem(PORTAL_HOME_DISMISS_KEY)
  );

  const { tokens, removeToken } = tokenStore;

  const sorted = [...tokens].sort(
    (a, b) => new Date(b.lastVisited || 0) - new Date(a.lastVisited || 0)
  );

  const showInstallBanner =
    !installPrompt.isInstalled && installPrompt.isInstallable && !installDismissed;

  function dismissInstall() {
    localStorage.setItem(PORTAL_HOME_DISMISS_KEY, '1');
    setInstallDismissed(true);
  }

  async function handleInstall() {
    const outcome = await installPrompt.triggerPrompt();
    if (outcome === 'accepted') setInstallDismissed(true);
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header bar */}
      <div className="bg-on-surface text-on-primary">
        <div className="max-w-2xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold font-heading">
              Waymark Build
            </h1>
            <p className="text-xs text-outline mt-0.5">Your team projects</p>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-outline hidden sm:block">{user.email}</span>
              <button
                onClick={() => signOut(auth)}
                className="text-outline hover:text-on-primary transition-colors"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Install banner */}
        {showInstallBanner && (
          <div className="mb-6 bg-surface-container-lowest shadow-md border border-outline-variant/10 rounded-3xl overflow-hidden">
            <div className="flex items-start gap-3 p-4">
              <div className="shrink-0 w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Smartphone size={18} className="text-on-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-on-surface">
                  Install Waymark Build
                </p>
                <p className="text-xs text-outline mt-0.5">
                  {installPrompt.isIOS
                    ? <>Tap <Share2 size={11} className="inline mx-0.5 text-blue-500" /> Share → "Add to Home Screen" for one-tap access</>
                    : 'Your team projects, one tap away'}
                </p>
              </div>
              <button onClick={dismissInstall} className="shrink-0 p-1 text-outline hover:text-on-surface transition-colors">
                <X size={15} />
              </button>
            </div>
            {!installPrompt.isIOS && (
              <div className="px-4 pb-4 flex gap-2">
                <button
                  onClick={handleInstall}
                  className="flex items-center gap-1.5 bg-primary text-on-primary text-sm px-4 py-2 rounded-xl hover:bg-primary-dim transition-colors font-medium"
                >
                  <Download size={14} /> Install App
                </button>
                <button onClick={dismissInstall} className="text-sm text-outline hover:text-on-surface px-3 transition-colors">
                  Not now
                </button>
              </div>
            )}
          </div>
        )}

        {/* Project list */}
        {sorted.length > 0 ? (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-outline uppercase tracking-wider px-1">
              {sorted.length} project{sorted.length !== 1 ? 's' : ''}
            </h2>
            {sorted.map((entry) => (
              <ProjectCard key={entry.token} entry={entry} onRemove={removeToken} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-lg font-bold text-on-surface mb-2 font-heading">
              No projects yet
            </h2>
            <p className="text-sm text-outline max-w-xs mx-auto">
              You'll see your projects here after someone shares a link with you.
            </p>
          </div>
        )}

        {/* Account section */}
        <div className="mt-10 space-y-3">
          {!user && (
            <a
              href="/portal/auth"
              className="block text-center text-sm text-primary font-medium hover:underline"
            >
              Sign in to sync across devices →
            </a>
          )}

          {user && teamProfile?.accountType === 'team' && (
            <div className="bg-surface-container-lowest rounded-3xl shadow-md border border-outline-variant/10 p-4 text-center">
              <p className="text-xs text-outline mb-2">
                Want to manage your own build?
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline"
              >
                Start your planning account — $30/month <ArrowUpRight size={13} />
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-10 text-center text-xs text-outline pb-6">
          <p>
            Powered by{' '}
            <a href="/" className="text-primary hover:underline">Waymark Build Planning App</a>
            {' '}·{' '}
            <a href="https://www.lifebuiltinkentucky.com" className="hover:underline">
              lifebuiltinkentucky.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
