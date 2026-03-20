import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
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
  Users,
  FolderOpen,
  BookUser,
  LogOut,
  Menu,
  X,
  Compass,
  Smartphone,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'profile', label: 'Profile', icon: UserCircle },
  { id: 'properties', label: 'Properties', icon: MapPin },
  { id: 'design', label: 'Home Design', icon: Palette },
  { id: 'budget', label: 'Budget', icon: DollarSign },
  { id: 'timeline', label: 'Timeline', icon: Calendar },
  { id: 'changeorders', label: 'Change Orders', icon: ClipboardList },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'commslog', label: 'Comm. Log', icon: MessageSquare },
  { id: 'lienwaiver', label: 'Lien Waivers', icon: Shield },
  { id: 'checklists', label: 'Checklists', icon: CheckSquare },
  { id: 'documents', label: 'Documents', icon: FolderOpen },
  { id: 'keycontacts', label: 'Key Contacts', icon: BookUser },
  { id: 'team', label: 'Team', icon: Users },
];

export default function Shell({ user, section, onSection, children, saving, tourActive = false, onStartTour, installPrompt }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);

  const showInstallBtn = installPrompt && !installPrompt.isInstalled && installPrompt.isInstallable;

  async function handleInstallClick() {
    if (installPrompt.isIOS) {
      setShowIOSHint(true);
    } else {
      await installPrompt.triggerPrompt();
    }
  }

  return (
    <div className="min-h-screen flex bg-cream">
      {/* Sidebar (desktop) */}
      <aside className={`hidden md:flex flex-col w-56 bg-ink text-white shrink-0${tourActive ? ' relative z-50' : ''}`}>
        <div className="px-5 py-6 border-b border-white/10">
          <div className="text-lg font-bold" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Waymark Build©
          </div>
          <div className="text-xs text-mist mt-0.5 truncate">{user.email}</div>
        </div>

        <nav className="flex-1 py-4 space-y-0.5 px-2">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onSection(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                section === id
                  ? `bg-forest text-white${tourActive ? ' ring-2 ring-white/40 ring-offset-1 ring-offset-[#1e2e22]' : ''}`
                  : 'text-mist hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        <div className="px-2 pb-4 space-y-0.5">
          {showInstallBtn && (
            <button
              onClick={handleInstallClick}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-forest bg-forest/10 hover:bg-forest/20 transition-colors font-medium"
            >
              <Smartphone size={16} /> Install App
            </button>
          )}
          {onStartTour && (
            <button
              onClick={onStartTour}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-mist hover:bg-white/5 hover:text-white transition-colors"
            >
              <Compass size={16} /> Take the Tour
            </button>
          )}
          <button
            onClick={() => signOut(auth)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-mist hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
          <p className="text-[10px] text-white/20 px-3 pt-2 leading-snug">
            © {new Date().getFullYear()} Waymark Build App.<br />All rights reserved.
          </p>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-ink text-white px-4 py-3 shadow-md">
        <span className="text-base font-bold" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
          Waymark Build©
        </span>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="w-64 bg-ink text-white flex flex-col pt-16">
            <nav className="flex-1 py-4 space-y-0.5 px-2">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => { onSection(id); setMobileOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    section === id
                      ? 'bg-forest text-white'
                      : 'text-mist hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </nav>
            <div className="px-2 pb-6 space-y-0.5">
              {showInstallBtn && (
                <button
                  onClick={() => { handleInstallClick(); setMobileOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-forest bg-forest/10 hover:bg-forest/20 transition-colors font-medium"
                >
                  <Smartphone size={16} /> Install App
                </button>
              )}
              {onStartTour && (
                <button
                  onClick={() => { onStartTour(); setMobileOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-mist hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Compass size={16} /> Take the Tour
                </button>
              )}
              <button
                onClick={() => signOut(auth)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-mist hover:bg-white/5 hover:text-white transition-colors"
              >
                <LogOut size={16} />
                Sign Out
              </button>
              <p className="text-[10px] text-white/20 px-3 pt-2 leading-snug">
                © {new Date().getFullYear()} Waymark Build App.<br />All rights reserved.
              </p>
            </div>
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 md:pt-0 pt-14 overflow-auto">
        {children}
      </main>

      {/* Saving indicator */}
      {saving && (
        <div className="fixed bottom-4 right-4 z-50 bg-ink text-white text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 pointer-events-none">
          <span className="w-1.5 h-1.5 bg-mist rounded-full animate-pulse" />
          Saving…
        </div>
      )}

      {/* iOS install instructions modal */}
      {showIOSHint && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/50" onClick={() => setShowIOSHint(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-ink" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                Install on iPhone / iPad
              </h3>
              <button onClick={() => setShowIOSHint(false)} className="text-mist hover:text-ink p-1">
                <X size={16} />
              </button>
            </div>
            <ol className="space-y-3 text-sm text-ink/75">
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-forest/15 text-forest text-xs flex items-center justify-center font-semibold mt-0.5">1</span>
                <span>Tap the <strong>Share</strong> button <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-500 rounded text-white text-xs">⬆</span> in the Safari toolbar at the bottom of your screen</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-forest/15 text-forest text-xs flex items-center justify-center font-semibold mt-0.5">2</span>
                <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-forest/15 text-forest text-xs flex items-center justify-center font-semibold mt-0.5">3</span>
                <span>Tap <strong>Add</strong> — the Waymark Build icon will appear on your home screen</span>
              </li>
            </ol>
            <p className="text-xs text-mist">Must be using Safari on iOS to install.</p>
          </div>
        </div>
      )}
    </div>
  );
}
