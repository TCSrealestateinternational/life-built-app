import { useState } from 'react';
import { Plus, Trash2, Share2, Copy } from 'lucide-react';

const ROLES = ['Builder/GC', 'Realtor', 'Lender', 'Architect', 'Interior Designer', 'Inspector', 'Attorney', 'Other'];

function newMember() {
  return { id: Date.now(), name: '', role: 'Builder/GC', email: '', phone: '', notes: '' };
}

export default function Team({ project, updateProject, uid }) {
  const team = project?.team ?? [];
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/share/${uid}`;

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function addMember() {
    updateProject({ team: [...team, newMember()] });
  }

  function updateMember(id, patch) {
    updateProject({ team: team.map((m) => (m.id === id ? { ...m, ...patch } : m)) });
  }

  function removeMember(id) {
    if (!confirm('Remove this team member?')) return;
    updateProject({ team: team.filter((m) => m.id !== id) });
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
          Your Team
        </h1>
        <p className="text-sage text-sm mt-0.5">Track your builder, realtor, lender, and other pros.</p>
      </div>

      {/* Share card */}
      <div className="bg-forest/10 border border-forest/20 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <Share2 size={18} className="text-forest mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-ink text-sm mb-1">Share with your builder</div>
            <p className="text-xs text-mist mb-3">
              Anyone with this link can view your full project in read-only mode — properties, budget, timeline, design, and checklists.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-white border border-linen rounded-lg px-3 py-2 text-ink truncate">
                {shareUrl}
              </code>
              <button
                onClick={copyLink}
                className={`flex items-center gap-1 text-sm px-3 py-2 rounded-lg border transition-colors shrink-0 ${
                  copied ? 'bg-forest text-white border-forest' : 'border-linen text-ink hover:bg-white'
                }`}
              >
                <Copy size={14} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Team members */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-ink">Team Members</h2>
        <button
          onClick={addMember}
          className="flex items-center gap-1.5 bg-forest text-white text-sm px-3 py-1.5 rounded-lg hover:bg-deep transition-colors"
        >
          <Plus size={14} /> Add Member
        </button>
      </div>

      {team.length === 0 ? (
        <div className="text-center py-12 text-mist bg-white rounded-xl border border-linen">
          <div className="text-3xl mb-2">👷</div>
          <p className="font-medium">No team members yet</p>
          <p className="text-sm mt-1">Add your builder, realtor, and other contacts.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {team.map((m) => (
            <div key={m.id} className="bg-white rounded-xl border border-linen p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Name</label>
                  <input
                    type="text"
                    value={m.name}
                    onChange={(e) => updateMember(m.id, { name: e.target.value })}
                    placeholder="Full name"
                    className="w-full border border-linen rounded-lg px-3 py-2 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-forest/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Role</label>
                  <select
                    value={m.role}
                    onChange={(e) => updateMember(m.id, { role: e.target.value })}
                    className="w-full border border-linen rounded-lg px-3 py-2 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-forest/40"
                  >
                    {ROLES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Email</label>
                  <input
                    type="email"
                    value={m.email}
                    onChange={(e) => updateMember(m.id, { email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full border border-linen rounded-lg px-3 py-2 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-forest/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Phone</label>
                  <input
                    type="tel"
                    value={m.phone}
                    onChange={(e) => updateMember(m.id, { phone: e.target.value })}
                    placeholder="(859) 000-0000"
                    className="w-full border border-linen rounded-lg px-3 py-2 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-forest/40"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-ink mb-1">Notes</label>
                  <input
                    type="text"
                    value={m.notes}
                    onChange={(e) => updateMember(m.id, { notes: e.target.value })}
                    placeholder="License #, company, referral note…"
                    className="w-full border border-linen rounded-lg px-3 py-2 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-forest/40"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-3">
                <button
                  onClick={() => removeMember(m.id)}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={13} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
