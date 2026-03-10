import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { MapPin, Calendar, DollarSign, FolderOpen, Image, Users } from 'lucide-react';

// ─── Section icons / labels used in tabs ─────────────────────────────────────

const PORTAL_SECTIONS = [
  { id: 'timeline',  label: 'Timeline',  icon: Calendar,    emoji: '📅' },
  { id: 'budget',    label: 'Budget',    icon: DollarSign,  emoji: '💰' },
  { id: 'documents', label: 'Documents', icon: FolderOpen,  emoji: '📁' },
  { id: 'photos',    label: 'Photos',    icon: Image,       emoji: '📷' },
  { id: 'contacts',  label: 'Team',      icon: Users,       emoji: '👥' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d) {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(day, 10)}, ${y}`;
}

function dollars(n) {
  const v = parseFloat(n) || 0;
  return v > 0 ? `$${v.toLocaleString()}` : '—';
}

// ─── Error / Loading screens ──────────────────────────────────────────────────

function StatusScreen({ title, body, cta }) {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">{cta ? '🔗' : '🔒'}</div>
        <h1 className="text-xl font-bold text-ink mb-2"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{title}</h1>
        <p className="text-sm text-mist mb-6">{body}</p>
        <a
          href="/"
          className="inline-block text-sm text-forest border border-forest/30 px-5 py-2.5 rounded-lg hover:bg-forest hover:text-white transition-colors"
        >
          Create Your Own Planning Account →
        </a>
      </div>
    </div>
  );
}

// ─── Section: Timeline ────────────────────────────────────────────────────────

function TimelineSection({ project }) {
  const milestones = project?.timeline?.milestones ?? [];
  const done = milestones.filter((m) => m.done).length;
  const total = milestones.length;

  if (total === 0) return <p className="text-sm text-mist">No milestones added yet.</p>;

  return (
    <div>
      {/* Progress */}
      <div className="bg-white rounded-xl border border-linen p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-ink">{done}/{total} milestones complete</span>
          <span className="text-xs text-mist">{Math.round((done / total) * 100)}%</span>
        </div>
        <div className="h-2 bg-linen rounded-full overflow-hidden">
          <div className="h-full bg-forest rounded-full" style={{ width: `${(done / total) * 100}%` }} />
        </div>
      </div>
      {/* Milestone list */}
      <div className="space-y-2">
        {milestones.map((m, i) => {
          const start = m.start || m.targetDate;
          const pct = typeof m.progress === 'number' ? m.progress : (m.done ? 100 : 0);
          return (
            <div
              key={m.id ?? i}
              className={`bg-white rounded-xl border p-4 ${m.done ? 'border-forest/20 bg-forest/5' : 'border-linen'}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xs text-mist w-5 text-right mt-0.5 shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm ${m.done ? 'line-through text-mist' : 'text-ink font-medium'}`}>
                      {m.title}
                    </span>
                    {m.done && <span className="text-xs text-forest font-medium">✓</span>}
                  </div>
                  {(start || m.end) && (
                    <p className="text-xs text-mist mt-0.5">
                      {fmtDate(start)}{m.end && m.end !== start ? ` → ${fmtDate(m.end)}` : ''}
                    </p>
                  )}
                  {m.notes && <p className="text-xs text-sage mt-1 italic">{m.notes}</p>}
                  {pct > 0 && !m.done && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1 bg-linen rounded-full overflow-hidden">
                        <div className="h-full bg-forest rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-mist">{pct}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Section: Budget ──────────────────────────────────────────────────────────

function BudgetSection({ project }) {
  const items = project?.budget?.items ?? [];
  if (items.length === 0) return <p className="text-sm text-mist">No budget items yet.</p>;

  const totalPlanned = items.reduce((s, i) => s + (parseFloat(i.planned) || 0), 0);
  const totalActual = items.reduce((s, i) => s + (parseFloat(i.actual) || 0), 0);

  // Group by category
  const byCategory = {};
  items.forEach((item) => {
    const cat = item.category || 'Uncategorized';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(item);
  });

  return (
    <div>
      {/* Totals */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-xl border border-linen p-4 text-center">
          <div className="text-lg font-bold text-ink">{dollars(totalPlanned)}</div>
          <div className="text-xs text-mist">Total Planned</div>
        </div>
        <div className="bg-white rounded-xl border border-linen p-4 text-center">
          <div className="text-lg font-bold text-forest">{dollars(totalActual)}</div>
          <div className="text-xs text-mist">Total Actual</div>
        </div>
      </div>
      {/* Table */}
      <div className="bg-white rounded-xl border border-linen overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream border-b border-linen">
            <tr>
              <th className="text-left px-4 py-2 text-xs font-semibold text-mist">Category</th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-mist hidden sm:table-cell">Description</th>
              <th className="text-right px-4 py-2 text-xs font-semibold text-mist">Planned</th>
              <th className="text-right px-4 py-2 text-xs font-semibold text-mist">Actual</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-linen last:border-0">
                <td className="px-4 py-2 text-xs text-mist">{item.category}</td>
                <td className="px-4 py-2 hidden sm:table-cell">{item.description}</td>
                <td className="px-4 py-2 text-right">{dollars(item.planned)}</td>
                <td className="px-4 py-2 text-right">{dollars(item.actual)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-cream border-t border-linen">
            <tr>
              <td colSpan={2} className="px-4 py-2 text-xs font-semibold text-mist hidden sm:table-cell">Total</td>
              <td className="px-4 py-2 text-xs font-semibold text-mist sm:hidden">Total</td>
              <td className="px-4 py-2 text-right font-semibold">{dollars(totalPlanned)}</td>
              <td className="px-4 py-2 text-right font-semibold">{dollars(totalActual)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ─── Section: Documents ───────────────────────────────────────────────────────

function DocumentsSection({ project }) {
  const docs = project?.documents ?? [];
  if (docs.length === 0) return <p className="text-sm text-mist">No documents shared yet.</p>;

  // Group by category
  const byCategory = {};
  docs.forEach((d) => {
    const cat = d.category || 'General';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(d);
  });

  return (
    <div className="space-y-4">
      {Object.entries(byCategory).map(([cat, items]) => (
        <div key={cat}>
          <p className="text-xs font-semibold text-mist uppercase tracking-wider mb-2">{cat}</p>
          <div className="space-y-2">
            {items.map((d) => (
              <div key={d.id} className="bg-white rounded-xl border border-linen p-4 flex items-center gap-3">
                <FolderOpen size={16} className="text-forest shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{d.name}</p>
                  {d.notes && <p className="text-xs text-mist truncate">{d.notes}</p>}
                </div>
                {d.url && (
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-forest hover:underline shrink-0 border border-forest/30 px-2.5 py-1 rounded-lg hover:bg-forest/5 transition-colors"
                  >
                    Open
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Section: Progress Photos ─────────────────────────────────────────────────

function PhotosSection({ project }) {
  // Aggregate photos from all milestones
  const allPhotos = [];
  (project?.timeline?.milestones ?? []).forEach((m) => {
    (m.photos ?? []).forEach((p) => {
      if (p.url) allPhotos.push({ ...p, milestoneName: m.title });
    });
  });

  if (allPhotos.length === 0) {
    return <p className="text-sm text-mist">No progress photos shared yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {allPhotos.map((p, i) => (
        <a
          key={p.id ?? i}
          href={p.url}
          target="_blank"
          rel="noreferrer"
          className="bg-white rounded-xl border border-linen p-4 flex items-start gap-3 hover:shadow-md transition-shadow group"
        >
          <Image size={20} className="text-forest shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink group-hover:text-forest transition-colors truncate">
              {p.caption || `Photo ${i + 1}`}
            </p>
            <p className="text-xs text-mist truncate">{p.milestoneName}</p>
          </div>
        </a>
      ))}
    </div>
  );
}

// ─── Section: Team Contacts ───────────────────────────────────────────────────

function ContactsSection({ project }) {
  const team = (project?.team ?? []).filter((m) => m.name);
  if (team.length === 0) return <p className="text-sm text-mist">No team contacts listed.</p>;

  return (
    <div className="space-y-2">
      {team.map((m) => (
        <div key={m.id} className="bg-white rounded-xl border border-linen p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-forest/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-forest">
                {(m.name || '?')[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-ink">{m.name}</p>
              <p className="text-xs text-mist">{m.role}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main SharedPortal ────────────────────────────────────────────────────────

export default function SharedPortal({ token }) {
  const [status, setStatus] = useState('loading');
  const [project, setProject] = useState(null);
  const [member, setMember] = useState(null);
  const [tab, setTab] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        // 1. Load and validate token
        const tokenRef = doc(db, 'shareTokens', token);
        const tokenSnap = await getDoc(tokenRef);

        if (!tokenSnap.exists()) { setStatus('notfound'); return; }

        const tokenData = tokenSnap.data();

        if (!tokenData.active) { setStatus('revoked'); return; }
        if (tokenData.expiresAt && tokenData.expiresAt < new Date().toISOString().slice(0, 10)) {
          setStatus('expired');
          return;
        }

        const { uid, memberId } = tokenData;

        // 2. Load project
        const projectRef = doc(db, 'users', uid, 'project', 'data');
        const projectSnap = await getDoc(projectRef);
        if (!projectSnap.exists()) { setStatus('notfound'); return; }
        const projectData = projectSnap.data();

        // 3. Find member + permissions
        const teamMember = (projectData.team ?? []).find((m) => m.id === memberId);
        if (!teamMember) { setStatus('notfound'); return; }

        setProject(projectData);
        setMember(teamMember);

        // Set first visible tab
        const firstVisible = PORTAL_SECTIONS.find(
          (s) => teamMember.permissions?.[s.id]?.view
        );
        setTab(firstVisible?.id ?? null);

        setStatus('active');

        // 4. Record view activity
        try {
          await updateDoc(tokenRef, {
            lastViewed: new Date().toISOString(),
            viewCount: increment(1),
          });
        } catch (e) {
          // Non-critical — activity tracking requires Firestore rules update
        }
      } catch (e) {
        console.error(e);
        setStatus('notfound');
      }
    }
    load();
  }, [token]);

  // ── Loading / error states ────────────────────────────────────────────────

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center text-sm text-mist">
        Loading…
      </div>
    );
  }
  if (status === 'revoked') {
    return (
      <StatusScreen
        title="Link Revoked"
        body="This sharing link has been revoked by the project owner. Contact them for a new link."
      />
    );
  }
  if (status === 'expired') {
    return (
      <StatusScreen
        title="Link Expired"
        body="This sharing link has expired. Contact the project owner to request a new one."
      />
    );
  }
  if (status === 'notfound') {
    return (
      <StatusScreen
        title="Link Not Found"
        body="This link is invalid or the project no longer exists."
        cta
      />
    );
  }

  const perms = member?.permissions ?? {};
  const visibleSections = PORTAL_SECTIONS.filter((s) => perms[s.id]?.view);

  // Project address from first property (or fallback)
  const projectAddress =
    (project?.properties ?? []).find((p) => p.address)?.address || 'Build Project';

  return (
    <div className="min-h-screen bg-cream">
      {/* Banner */}
      <div className="bg-forest text-white px-4 py-2.5 text-center text-xs">
        <strong>Read-only view</strong> shared by the project owner ·{' '}
        <a href="/" className="underline hover:no-underline">
          Create your own planning account
        </a>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Project header */}
        <div className="bg-white rounded-2xl border border-linen p-5 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center shrink-0">
            <MapPin size={22} className="text-forest" />
          </div>
          <div className="flex-1 min-w-0">
            <h1
              className="text-lg font-bold text-ink truncate"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              {projectAddress}
            </h1>
            <p className="text-sm text-mist">
              {member.role} View
              {member.name ? ` · ${member.name}` : ''}
            </p>
          </div>
          <div
            className="text-xs font-semibold text-ink shrink-0 hidden sm:block"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            Life Built
          </div>
        </div>

        {/* No permissions */}
        {visibleSections.length === 0 && (
          <div className="text-center py-12 text-mist">
            <div className="text-4xl mb-3">🔒</div>
            <p className="font-medium text-ink">Nothing shared yet</p>
            <p className="text-sm mt-1">The project owner hasn't enabled any sections for your view.</p>
          </div>
        )}

        {visibleSections.length > 0 && (
          <>
            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-linen/50 p-1 rounded-xl overflow-x-auto">
              {visibleSections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setTab(s.id)}
                  className={`flex-1 text-xs font-medium px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                    tab === s.id ? 'bg-white text-ink shadow-sm' : 'text-mist hover:text-ink'
                  }`}
                >
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>

            {/* Section content */}
            <div>
              {tab === 'timeline'  && <TimelineSection project={project} />}
              {tab === 'budget'    && <BudgetSection project={project} />}
              {tab === 'documents' && <DocumentsSection project={project} />}
              {tab === 'photos'    && <PhotosSection project={project} />}
              {tab === 'contacts'  && <ContactsSection project={project} />}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-10 text-center text-xs text-mist">
          <p>
            Powered by{' '}
            <a href="/" className="text-forest hover:underline">Life Built Planning App</a>
            {' '}· <a href="https://www.lifebuiltinkentucky.com" className="hover:underline">lifebuiltinkentucky.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
