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
  LayoutGrid,
  MoreHorizontal,
} from 'lucide-react';

const ALL_NAV_ITEMS = [
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

const PRIMARY_IDS = ['dashboard', 'budget', 'timeline', 'documents', 'design'];
const PRIMARY_NAV = ALL_NAV_ITEMS.filter(i => PRIMARY_IDS.includes(i.id));

export default function Shell({ user, section, onSection, children, saving, tourActive = false, onStartTour, installPrompt, hasTeamTokens }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);

  const showInstallBtn = installPrompt && !installPrompt.isInstalled && installPrompt.isInstallable;

  async function handleInstallClick() {
    if (installPrompt.isIOS) {
      setShowIOSHint(true);
    } else {
      await installPrompt.triggerPrompt();
    }
  }

  function navigate(id) {
    onSection(id);
    setMoreOpen(false);
  }

  const isPrimaryActive = PRIMARY_IDS.includes(section);
  const userInitial = user.email ? user.email[0].toUpperCase() : '?';

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* ── Desktop top bar ── */}
      <header className="hidden md:flex items-center justify-between sticky top-0 z-50 glass border-b border-outline-variant/20 px-6 h-16">
        <div className="flex items-center gap-8">
          <span className="text-lg font-bold font-heading text-on-surface tracking-tight">
            Waymark Build©
          </span>
          <nav className="flex items-center gap-1">
            {PRIMARY_NAV.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => navigate(id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                  section === id
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
            <button
              onClick={() => setMoreOpen(true)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                !isPrimaryActive && section !== 'dashboard'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <MoreHorizontal size={16} />
              More
            </button>
          </nav>
        </div>
        <button
          onClick={() => setMoreOpen(true)}
          className="w-9 h-9 rounded-full bg-primary text-on-primary text-sm font-bold flex items-center justify-center hover:bg-primary-dim transition-colors"
        >
          {userInitial}
        </button>
      </header>

      {/* ── Mobile top bar ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between glass border-b border-outline-variant/20 px-4 h-14">
        <span className="text-base font-bold font-heading text-on-surface tracking-tight">
          Waymark Build©
        </span>
        <button onClick={() => setMoreOpen(!moreOpen)} className="text-on-surface p-1">
          {moreOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* ── "More" drawer (shared desktop + mobile) ── */}
      {moreOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end" onClick={() => setMoreOpen(false)}>
          <div
            className="w-72 max-w-[85vw] bg-surface-container-lowest shadow-2xl flex flex-col h-full animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-outline-variant/20">
              <div>
                <div className="text-sm font-semibold font-heading text-on-surface">Menu</div>
                <div className="text-xs text-outline mt-0.5 truncate max-w-[180px]">{user.email}</div>
              </div>
              <button onClick={() => setMoreOpen(false)} className="text-outline hover:text-on-surface p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            {/* All nav items */}
            <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
              {ALL_NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => navigate(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    section === id
                      ? 'bg-primary-container text-on-primary-container font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </nav>

            {/* Drawer footer actions */}
            <div className="px-3 pb-5 pt-2 space-y-0.5 border-t border-outline-variant/20">
              {hasTeamTokens && (
                <a
                  href="/portal"
                  onClick={() => setMoreOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-primary bg-primary-container/50 hover:bg-primary-container transition-colors font-medium"
                >
                  <LayoutGrid size={18} /> Team Projects
                </a>
              )}
              {showInstallBtn && (
                <button
                  onClick={() => { handleInstallClick(); setMoreOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-primary bg-primary-container/50 hover:bg-primary-container transition-colors font-medium"
                >
                  <Smartphone size={18} /> Install App
                </button>
              )}
              {onStartTour && (
                <button
                  onClick={() => { onStartTour(); setMoreOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
                >
                  <Compass size={18} /> Take the Tour
                </button>
              )}
              <button
                onClick={() => signOut(auth)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                <LogOut size={18} />
                Sign Out
              </button>
              <p className="text-[10px] text-outline/40 px-3 pt-2 leading-snug">
                © {new Date().getFullYear()} Waymark Build App.<br />All rights reserved.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 md:pt-0 pt-14 pb-20 md:pb-0 overflow-auto">
        {children}
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-outline-variant/20 safe-area-pb">
        <div className="flex items-center justify-around h-16 px-1">
          {PRIMARY_NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => navigate(id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl min-w-[56px] transition-colors ${
                section === id
                  ? 'text-primary'
                  : 'text-outline'
              }`}
            >
              <Icon size={20} strokeWidth={section === id ? 2.5 : 1.75} />
              <span className="text-[10px] font-medium leading-none">{label === 'Documents' ? 'Docs' : label}</span>
            </button>
          ))}
          <button
            onClick={() => setMoreOpen(true)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl min-w-[56px] transition-colors ${
              !isPrimaryActive && section !== 'dashboard' ? 'text-primary' : 'text-outline'
            }`}
          >
            <MoreHorizontal size={20} strokeWidth={!isPrimaryActive && section !== 'dashboard' ? 2.5 : 1.75} />
            <span className="text-[10px] font-medium leading-none">More</span>
          </button>
        </div>
      </nav>

      {/* ── Saving indicator ── */}
      {saving && (
        <div className="fixed bottom-22 md:bottom-4 right-4 z-50 bg-on-surface text-surface text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 pointer-events-none">
          <span className="w-1.5 h-1.5 bg-outline rounded-full animate-pulse" />
          Saving…
        </div>
      )}

      {/* ── iOS install instructions modal ── */}
      {showIOSHint && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 bg-black/50" onClick={() => setShowIOSHint(false)}>
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-sm p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold font-heading text-on-surface">
                Install on iPhone / iPad
              </h3>
              <button onClick={() => setShowIOSHint(false)} className="text-outline hover:text-on-surface p-1">
                <X size={16} />
              </button>
            </div>
            <ol className="space-y-3 text-sm text-on-surface/75">
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center font-semibold mt-0.5">1</span>
                <span>Tap the <strong>Share</strong> button <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-500 rounded text-white text-xs">⬆</span> in the Safari toolbar at the bottom of your screen</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center font-semibold mt-0.5">2</span>
                <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center font-semibold mt-0.5">3</span>
                <span>Tap <strong>Add</strong> — the Waymark Build icon will appear on your home screen</span>
              </li>
            </ol>
            <p className="text-xs text-outline">Must be using Safari on iOS to install.</p>
          </div>
        </div>
      )}
    </div>
  );
}
