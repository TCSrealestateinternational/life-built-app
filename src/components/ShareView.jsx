import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { MapPin, DollarSign, Calendar, CheckSquare, Palette, Users } from 'lucide-react';

export default function ShareView({ uid }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('dashboard');

  useEffect(() => {
    const ref = doc(db, 'users', uid, 'project', 'data');
    getDoc(ref)
      .then((snap) => {
        if (snap.exists()) {
          setProject(snap.data());
        } else {
          setError('Project not found.');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Unable to load project.');
        setLoading(false);
      });
  }, [uid]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-cream text-mist text-sm">Loading project…</div>
  );
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-cream text-red-500 text-sm">{error}</div>
  );
  if (!project) return null;

  const tabs = [
    { id: 'dashboard', label: 'Overview', icon: MapPin },
    { id: 'properties', label: 'Properties', icon: MapPin },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'checklists', label: 'Checklists', icon: CheckSquare },
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'team', label: 'Team', icon: Users },
  ];

  const totalPlanned = (project.budget?.items ?? []).reduce((s, i) => s + (parseFloat(i.planned) || 0), 0);

  return (
    <div className="min-h-screen bg-cream">
      {/* Banner */}
      <div className="bg-forest text-white px-4 py-3 text-center text-sm">
        <strong>Read-only view</strong> — shared by the project owner ·{' '}
        <a href="/" className="underline hover:no-underline">Create your own planning account</a>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-ink mb-1" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
          Land + Build Project
        </h1>
        <p className="text-mist text-sm mb-6">Powered by Life Built Planning App</p>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 mb-6 bg-linen/50 p-1 rounded-xl">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`text-xs font-medium px-3 py-2 rounded-lg transition-colors ${
                tab === id ? 'bg-white text-ink shadow-sm' : 'text-mist hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'dashboard' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Properties', value: (project.properties ?? []).length },
              { label: 'Budget', value: totalPlanned > 0 ? `$${totalPlanned.toLocaleString()}` : '—' },
              { label: 'Milestones', value: (project.timeline?.milestones ?? []).length },
              {
                label: 'Checklists',
                value: `${Object.values(project.checklists ?? {}).flat().filter((c) => c.done).length}/${Object.values(project.checklists ?? {}).flat().length}`,
              },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-xl border border-linen p-4 text-center">
                <div className="text-xl font-bold text-ink">{value}</div>
                <div className="text-xs text-mist mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'properties' && (
          <div className="space-y-3">
            {(project.properties ?? []).length === 0 ? (
              <p className="text-mist text-sm">No properties added.</p>
            ) : (project.properties ?? []).map((p) => (
              <div key={p.id} className="bg-white rounded-xl border border-linen p-4">
                <div className="font-medium text-ink">{p.address || 'Untitled'}</div>
                <div className="text-xs text-mist mt-0.5">
                  {p.price ? `$${Number(p.price).toLocaleString()}` : 'Price TBD'}
                  {p.acres ? ` · ${p.acres} acres` : ''}
                  {p.evaluated ? ' · ✓ Evaluated' : ''}
                </div>
                {p.notes && <p className="text-sm text-sage mt-2">{p.notes}</p>}
              </div>
            ))}
          </div>
        )}

        {tab === 'budget' && (
          <div className="bg-white rounded-xl border border-linen overflow-hidden">
            {(project.budget?.items ?? []).length === 0 ? (
              <p className="text-mist text-sm p-4">No budget items.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-cream border-b border-linen">
                  <tr>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-mist">Category</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-mist">Description</th>
                    <th className="text-right px-4 py-2 text-xs font-semibold text-mist">Planned</th>
                    <th className="text-right px-4 py-2 text-xs font-semibold text-mist">Actual</th>
                  </tr>
                </thead>
                <tbody>
                  {(project.budget.items).map((item) => (
                    <tr key={item.id} className="border-b border-linen last:border-0">
                      <td className="px-4 py-2 text-mist text-xs">{item.category}</td>
                      <td className="px-4 py-2">{item.description}</td>
                      <td className="px-4 py-2 text-right">{item.planned ? `$${Number(item.planned).toLocaleString()}` : '—'}</td>
                      <td className="px-4 py-2 text-right">{item.actual ? `$${Number(item.actual).toLocaleString()}` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-cream border-t border-linen">
                  <tr>
                    <td colSpan={2} className="px-4 py-2 text-xs font-semibold text-mist">Total</td>
                    <td className="px-4 py-2 text-right font-semibold">${totalPlanned.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right font-semibold">
                      ${(project.budget.items.reduce((s, i) => s + (parseFloat(i.actual) || 0), 0)).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        )}

        {tab === 'timeline' && (() => {
          const milestones = project.timeline?.milestones ?? [];
          const done = milestones.filter((m) => m.done).length;
          const total = milestones.length;
          const fmtD = (d) => {
            if (!d) return '';
            const [y, mo, day] = d.split('-');
            const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            return `${months[parseInt(mo,10)-1]} ${parseInt(day,10)}, ${y}`;
          };
          return (
            <div>
              {total > 0 && (
                <div className="bg-white rounded-xl border border-linen p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-ink">{done}/{total} milestones complete</span>
                    <span className="text-xs text-mist">{Math.round((done/total)*100)}%</span>
                  </div>
                  <div className="h-2 bg-linen rounded-full overflow-hidden">
                    <div className="h-full bg-forest rounded-full" style={{ width: `${(done/total)*100}%` }} />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {milestones.length === 0 ? (
                  <p className="text-mist text-sm">No milestones yet.</p>
                ) : milestones.map((m, i) => {
                  const start = m.start || m.targetDate;
                  const end = m.end;
                  const pct = typeof m.progress === 'number' ? m.progress : (m.done ? 100 : 0);
                  return (
                    <div key={m.id ?? i} className={`bg-white rounded-xl border p-4 ${m.done ? 'border-forest/30 bg-forest/5' : 'border-linen'}`}>
                      <div className="flex items-start gap-3">
                        <span className="text-xs text-mist w-5 text-right mt-0.5">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-sm ${m.done ? 'line-through text-mist' : 'text-ink font-medium'}`}>{m.title}</span>
                            {m.done && <span className="text-xs text-forest font-medium">✓</span>}
                          </div>
                          {(start || end) && (
                            <p className="text-xs text-mist mt-0.5">
                              {fmtD(start)}{end && end !== start ? ` → ${fmtD(end)}` : ''}
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
        })()}

        {tab === 'checklists' && (
          <div className="space-y-4">
            {Object.entries(project.checklists ?? {})
              .filter(([k]) => k !== 'punchList' && k !== 'punchListCustom')
              .map(([key, items]) => {
                if (!Array.isArray(items)) return null;
                const label = { landEvaluation: 'Land Evaluation', permits: 'Permits & Inspections', contractor: 'Hiring a Contractor' }[key] || key.replace(/([A-Z])/g, ' $1').trim();
                const done = items.filter((i) => i.done).length;
                return (
                  <div key={key} className="bg-white rounded-xl border border-linen p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-ink">{label}</h3>
                      <span className="text-xs text-mist">{done}/{items.length}</span>
                    </div>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 text-sm">
                          <span className={item.done ? 'text-forest' : 'text-linen'}>{item.done ? '✓' : '○'}</span>
                          <span className={item.done ? 'line-through text-mist' : 'text-ink'}>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {tab === 'design' && (
          <div className="space-y-3">
            {Object.keys(project.homeDesign ?? {}).length === 0 ? (
              <p className="text-mist text-sm">No design notes yet.</p>
            ) : Object.entries(project.homeDesign).map(([room, data]) => (
              <div key={room} className="bg-white rounded-xl border border-linen p-4">
                <h3 className="font-semibold text-ink mb-2">{room}</h3>
                <div className="space-y-1">
                  {(data.items ?? []).map((item) => (
                    <div key={item.id} className={`text-sm ${item.done ? 'line-through text-mist' : 'text-ink'}`}>
                      {item.done ? '✓ ' : '• '}{item.text}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'team' && (
          <div className="space-y-3">
            {(project.team ?? []).length === 0 ? (
              <p className="text-mist text-sm">No team members listed.</p>
            ) : (project.team).map((m) => (
              <div key={m.id} className="bg-white rounded-xl border border-linen p-4">
                <div className="font-medium text-ink">{m.name || 'Unnamed'} <span className="text-mist text-sm">· {m.role}</span></div>
                {m.email && <div className="text-xs text-sage mt-0.5">{m.email}</div>}
                {m.phone && <div className="text-xs text-mist">{m.phone}</div>}
                {m.notes && <div className="text-xs text-mist mt-1 italic">{m.notes}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
