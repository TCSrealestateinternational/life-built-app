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

export default function Shell({ user, section, onSection, children, saving }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-cream">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex flex-col w-56 bg-ink text-white shrink-0">
        <div className="px-5 py-6 border-b border-white/10">
          <div className="text-lg font-bold" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Life Built
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
                  ? 'bg-forest text-white'
                  : 'text-mist hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        <div className="px-2 pb-4 space-y-0.5">
          <button
            onClick={() => signOut(auth)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-mist hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-ink text-white px-4 py-3 shadow-md">
        <span className="text-base font-bold" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
          Life Built
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
              <button
                onClick={() => signOut(auth)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-mist hover:bg-white/5 hover:text-white transition-colors"
              >
                <LogOut size={16} />
                Sign Out
              </button>
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
    </div>
  );
}
