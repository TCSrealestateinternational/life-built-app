import { useState } from 'react';
import { ChevronDown, MapPin, LayoutGrid } from 'lucide-react';

/**
 * Inline project switcher shown at the top of SharedPortal
 * when the user has 2+ tokens stored.
 */
export default function PortalProjectSwitcher({ tokens, currentToken }) {
  const [open, setOpen] = useState(false);

  if (!tokens || tokens.length < 2) return null;

  const current = tokens.find((t) => t.token === currentToken);
  const others = tokens.filter((t) => t.token !== currentToken);

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 shadow-md border border-outline-variant/10 rounded-3xl px-3 py-2 text-left hover:bg-surface/50 transition-colors"
      >
        <MapPin size={14} className="text-primary shrink-0" />
        <span className="flex-1 text-xs font-medium text-on-surface truncate">
          {current?.projectLabel || 'This project'}
        </span>
        <span className="text-[11px] text-outline font-medium bg-outline-variant/70 px-2 py-0.5 rounded-full shrink-0">
          {tokens.length} projects
        </span>
        <ChevronDown
          size={14}
          className={`text-outline transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="mt-1 bg-surface-container-lowest border border-outline-variant rounded-3xl shadow-md overflow-hidden">
          {others.map((t) => (
            <a
              key={t.token}
              href={`/t/${t.token}`}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-surface/50 transition-colors border-b border-outline-variant/50 last:border-b-0"
            >
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin size={14} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-on-surface truncate">
                  {t.projectLabel || 'Build Project'}
                </p>
                <p className="text-[11px] text-outline">
                  {t.memberRole || 'Team'}
                </p>
              </div>
            </a>
          ))}
          <a
            href="/portal"
            className="flex items-center gap-3 px-3 py-2.5 hover:bg-surface/50 transition-colors text-primary"
          >
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <LayoutGrid size={14} className="text-primary" />
            </div>
            <span className="text-xs font-medium">View all projects</span>
          </a>
        </div>
      )}
    </div>
  );
}
