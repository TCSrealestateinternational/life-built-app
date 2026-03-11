import { useState, useEffect, useRef } from 'react';
import { doc, setDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Plus, Trash2, Copy, Edit2, Link2, Check, X, RefreshCw,
  Eye, EyeOff, Shield, ChevronDown, ChevronUp, ExternalLink,
  Clock, AlertCircle,
} from 'lucide-react';
import { ROLES, PERMISSION_SECTIONS, getDefaultPermissions } from '../data/teamDefaults';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateToken() {
  return crypto.randomUUID().replace(/-/g, '');
}

function portalUrl(token) {
  return `${window.location.origin}/t/${token}`;
}

function fmtDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    pending: { label: 'Invite Pending', cls: 'bg-amber-50 text-amber-600 border-amber-200' },
    active:  { label: 'Active',         cls: 'bg-forest/10 text-forest border-forest/20' },
    revoked: { label: 'Revoked',        cls: 'bg-red-50 text-red-500 border-red-200' },
  };
  const c = map[status] ?? map.pending;
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${c.cls}`}>
      {c.label}
    </span>
  );
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative rounded-full transition-colors shrink-0 ${
        disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
      } ${checked && !disabled ? 'bg-forest' : 'bg-linen'}`}
      style={{ width: 36, height: 20 }}
    >
      <span
        className="absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow transition-transform"
        style={{ transform: checked && !disabled ? 'translateX(18px)' : 'translateX(2px)' }}
      />
    </button>
  );
}

// ─── Permissions Grid ────────────────────────────────────────────────────────

function PermissionsGrid({ permissions, onChange }) {
  return (
    <div className="rounded-xl border border-linen overflow-hidden text-sm">
      {/* Header */}
      <div className="grid grid-cols-[1fr_64px_64px] bg-cream border-b border-linen">
        <div className="px-4 py-2 text-xs font-semibold text-mist uppercase tracking-wider">Section</div>
        <div className="px-3 py-2 text-xs font-semibold text-mist uppercase tracking-wider text-center">View</div>
        <div className="px-3 py-2 text-xs font-semibold text-mist uppercase tracking-wider text-center">Edit</div>
      </div>
      {PERMISSION_SECTIONS.map((s, i) => {
        const p = permissions[s.id] ?? { view: false, edit: false };
        return (
          <div
            key={s.id}
            className={`grid grid-cols-[1fr_64px_64px] items-center ${
              i < PERMISSION_SECTIONS.length - 1 ? 'border-b border-linen' : ''
            }`}
          >
            <div className="px-4 py-3 text-ink">{s.label}</div>
            <div className="flex justify-center py-3">
              <Toggle
                checked={!!p.view}
                onChange={(v) => {
                  const updated = { ...p, view: v };
                  if (!v) updated.edit = false; // can't edit what you can't view
                  onChange(s.id, updated);
                }}
              />
            </div>
            <div className="flex justify-center py-3">
              {s.canEdit ? (
                <Toggle
                  checked={!!p.edit}
                  disabled={!p.view}
                  onChange={(v) => onChange(s.id, { ...p, edit: v })}
                />
              ) : (
                <span className="text-xs text-linen select-none">—</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Member Modal (Add / Edit) ────────────────────────────────────────────────

function MemberModal({ member, uid, onSave, onClose }) {
  const isEdit = !!member?.token;
  const [name, setName] = useState(member?.name || '');
  const [email, setEmail] = useState(member?.email || '');
  const [phone, setPhone] = useState(member?.phone || '');
  const [role, setRole] = useState(member?.role || ROLES[0]);
  const [customRole, setCustomRole] = useState(member?.customRole || '');
  const [expiresAt, setExpiresAt] = useState(member?.expiresAt || '');
  const [permissions, setPermissions] = useState(
    member?.permissions || getDefaultPermissions(member?.role || ROLES[0])
  );
  const [edited, setEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handleRoleChange(newRole) {
    setRole(newRole);
    if (!edited || window.confirm('Apply default permissions for this role? Your current settings will be reset.')) {
      setPermissions(getDefaultPermissions(newRole));
      setEdited(false);
    }
  }

  function handlePermChange(sectionId, sectionPerms) {
    setPermissions((prev) => ({ ...prev, [sectionId]: sectionPerms }));
    setEdited(true);
  }

  async function handleSave() {
    if (!name.trim()) { setError('Name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      // Reuse existing token when editing; generate new one for new members
      const token = member?.token || generateToken();
      const memberId = member?.id || `m_${Date.now()}`;
      const displayRole = role === 'Custom' ? (customRole.trim() || 'Custom') : role;

      const savedMember = {
        id: memberId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: displayRole,
        customRole: role === 'Custom' ? customRole.trim() : '',
        token,
        status: member?.status || 'pending',
        permissions,
        expiresAt: expiresAt || null,
        viewCount: member?.viewCount || 0,
        lastViewed: member?.lastViewed || null,
        createdAt: member?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Write or update the shareToken document
      if (!member?.token) {
        // Brand new member
        await setDoc(doc(db, 'shareTokens', token), {
          uid,
          memberId,
          active: true,
          expiresAt: expiresAt || null,
          lastViewed: null,
          viewCount: 0,
          createdAt: new Date().toISOString(),
        });
      } else {
        // Update existing token's expiry
        await updateDoc(doc(db, 'shareTokens', token), {
          expiresAt: expiresAt || null,
        });
      }

      // Auto-copy link for new members
      if (!isEdit) {
        navigator.clipboard.writeText(portalUrl(token)).catch(() => {});
      }

      onSave(savedMember);
    } catch (e) {
      console.error(e);
      setError('Failed to save. Check your connection and try again.');
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50">
      <div className="bg-white w-full sm:rounded-2xl sm:max-w-lg max-h-[95vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-linen shrink-0">
          <h2 className="font-semibold text-ink">
            {isEdit ? `Edit — ${member.name}` : 'Add Team Member'}
          </h2>
          <button onClick={onClose} className="text-mist hover:text-ink p-1">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-mist mb-1">Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full text-sm border border-linen rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-forest/40"
            />
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-mist mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full text-sm border border-linen rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-forest/40"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-mist mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(859) 000-0000"
                className="w-full text-sm border border-linen rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-forest/40"
              />
            </div>
          </div>
          <p className="text-xs text-mist -mt-2">
            ⓘ Email and phone are for your reference only — nothing is sent automatically.
          </p>

          {/* Role */}
          <div>
            <label className="block text-xs font-medium text-mist mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full text-sm border border-linen rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-forest/40"
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {role === 'Custom' && (
            <div>
              <label className="block text-xs font-medium text-mist mb-1">Custom Role Title</label>
              <input
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="e.g. Electrician, Plumber, Surveyor…"
                className="w-full text-sm border border-linen rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-forest/40"
              />
            </div>
          )}

          {/* Link expiration */}
          <div>
            <label className="block text-xs font-medium text-mist mb-1">
              Link Expires <span className="font-normal text-mist/70">(optional)</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={expiresAt || ''}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="text-sm border border-linen rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-forest/40"
              />
              {expiresAt && (
                <button onClick={() => setExpiresAt('')} className="text-xs text-mist hover:text-ink">
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Permissions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-mist">Access Permissions</label>
              <button
                onClick={() => { setPermissions(getDefaultPermissions(role)); setEdited(false); }}
                className="text-xs text-forest hover:underline flex items-center gap-1"
              >
                <RefreshCw size={10} /> Role defaults
              </button>
            </div>
            <PermissionsGrid permissions={permissions} onChange={handlePermChange} />
            <p className="text-xs text-mist mt-2">
              ⓘ Edit access is reserved for a future update — all shared views are currently read-only.
            </p>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 pb-5 pt-4 border-t border-linen space-y-3">
          {!isEdit && (
            <div className="bg-sky-50 border border-sky-200 rounded-lg px-3 py-2.5 text-xs text-sky-700 leading-snug">
              <strong>Next step:</strong> After saving, the portal link is copied to your clipboard.
              You'll need to send it to {name.trim() || 'this person'} yourself — by text, email, or however you prefer.
              No message is sent automatically.
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-forest text-white text-sm py-2.5 rounded-lg hover:bg-deep transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Save & Copy Link'}
            </button>
            <button onClick={onClose} className="text-sm text-mist hover:text-ink px-4">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Member Card ──────────────────────────────────────────────────────────────

function MemberCard({ member, uid, activity, onEdit, onDelete, onRevoke, onRestore }) {
  const [copied, setCopied] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);

  const link = member.token ? portalUrl(member.token) : null;
  const isRevoked = member.status === 'revoked';
  const act = activity || {};

  function copyLink() {
    if (!link) return;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const viewableSections = PERMISSION_SECTIONS.filter(
    (s) => member.permissions?.[s.id]?.view
  );

  return (
    <div className={`bg-white rounded-xl border p-4 transition-opacity ${isRevoked ? 'opacity-60' : 'border-linen'}`}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="font-semibold text-ink text-sm">{member.name || 'Unnamed'}</span>
            <StatusBadge status={member.status || 'pending'} />
          </div>
          <div className="text-xs text-mist">{member.role}</div>
          {member.email && <div className="text-xs text-sage mt-0.5">{member.email}</div>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="p-1.5 text-mist hover:text-ink rounded-lg hover:bg-cream transition-colors"
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-red-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Activity */}
      {member.token && (
        <div className="text-xs text-mist mb-3 flex items-center gap-1">
          <Clock size={11} />
          {act.lastViewed
            ? `Last viewed ${fmtDate(act.lastViewed)} · ${act.viewCount ?? 0} view${act.viewCount === 1 ? '' : 's'}`
            : 'Not yet viewed'}
          {member.expiresAt && (
            <span className="ml-2 text-amber-500 flex items-center gap-1">
              <AlertCircle size={11} /> Expires {fmtDate(member.expiresAt)}
            </span>
          )}
        </div>
      )}

      {/* Link copy area */}
      {link && !isRevoked && (
        <div className="flex items-center gap-2 bg-cream border border-linen rounded-lg px-3 py-2 mb-3">
          <Link2 size={12} className="text-mist shrink-0" />
          <span className="text-xs text-mist flex-1 truncate">{link}</span>
          <button
            onClick={copyLink}
            className="text-xs text-forest hover:underline shrink-0 flex items-center gap-1"
          >
            {copied ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy</>}
          </button>
          <a href={link} target="_blank" rel="noreferrer" className="text-mist hover:text-forest shrink-0">
            <ExternalLink size={12} />
          </a>
        </div>
      )}

      {/* Permissions chips */}
      <div className="mb-3">
        <button
          onClick={() => setShowPermissions(!showPermissions)}
          className="flex items-center gap-1 text-xs text-mist hover:text-ink transition-colors"
        >
          <Shield size={11} />
          {viewableSections.length > 0
            ? `Can see: ${viewableSections.map((s) => s.label).join(', ')}`
            : 'No sections enabled'}
          {showPermissions ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>
        {showPermissions && (
          <div className="mt-2 rounded-lg border border-linen overflow-hidden text-xs">
            {PERMISSION_SECTIONS.map((s, i) => {
              const p = member.permissions?.[s.id] ?? {};
              return (
                <div
                  key={s.id}
                  className={`flex items-center justify-between px-3 py-1.5 ${
                    i < PERMISSION_SECTIONS.length - 1 ? 'border-b border-linen' : ''
                  } ${p.view ? 'bg-white' : 'bg-cream/50'}`}
                >
                  <span className={p.view ? 'text-ink' : 'text-mist/60'}>{s.label}</span>
                  <span className={`font-medium ${p.view ? 'text-forest' : 'text-mist/40'}`}>
                    {p.view ? (s.canEdit && p.edit ? 'View + Edit' : 'View') : 'Hidden'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        {link && !isRevoked && (
          <button
            onClick={onRevoke}
            className="text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            Revoke Link
          </button>
        )}
        {isRevoked && (
          <button
            onClick={onRestore}
            className="text-xs text-forest hover:underline flex items-center gap-1"
          >
            <RefreshCw size={11} /> Generate New Link
          </button>
        )}
        {!member.token && (
          <button onClick={onEdit} className="text-xs text-forest hover:underline">
            Enable Sharing →
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Team Component ──────────────────────────────────────────────────────

export default function Team({ project, updateProject, uid }) {
  const team = project?.team ?? [];
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [activityData, setActivityData] = useState({});
  const [toast, setToast] = useState(null);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  // Load activity (lastViewed, viewCount) from shareTokens for each member
  useEffect(() => {
    const tokenMembers = team.filter((m) => m.token);
    if (!tokenMembers.length) return;

    Promise.all(
      tokenMembers.map((m) =>
        getDoc(doc(db, 'shareTokens', m.token)).then((snap) => ({
          memberId: m.id,
          data: snap.exists() ? snap.data() : null,
        }))
      )
    )
      .then((results) => {
        const act = {};
        results.forEach(({ memberId, data }) => {
          if (data) act[memberId] = { lastViewed: data.lastViewed, viewCount: data.viewCount ?? 0 };
        });
        setActivityData(act);
      })
      .catch(() => {});
    // Only re-run when the set of tokens changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team.map((m) => m.token).join(',')]);

  function openAdd() {
    setEditingMember(null);
    setShowModal(true);
  }

  function openEdit(member) {
    setEditingMember(member);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingMember(null);
  }

  function saveMember(savedMember) {
    const existing = team.find((m) => m.id === savedMember.id);
    const newTeam = existing
      ? team.map((m) => (m.id === savedMember.id ? savedMember : m))
      : [...team, savedMember];
    updateProject({ team: newTeam });
    if (!existing) showToast(`Link copied! Send it to ${savedMember.name}.`);
    closeModal();
  }

  async function revokeMember(member) {
    if (!member.token) return;
    try {
      await updateDoc(doc(db, 'shareTokens', member.token), { active: false });
    } catch (e) { console.warn('Could not update shareToken:', e); }
    updateProject({
      team: team.map((m) => (m.id === member.id ? { ...m, status: 'revoked' } : m)),
    });
  }

  async function restoreMember(member) {
    const newToken = generateToken();
    try {
      if (member.token) {
        await deleteDoc(doc(db, 'shareTokens', member.token));
      }
      await setDoc(doc(db, 'shareTokens', newToken), {
        uid,
        memberId: member.id,
        active: true,
        expiresAt: member.expiresAt || null,
        lastViewed: null,
        viewCount: 0,
        createdAt: new Date().toISOString(),
      });
    } catch (e) { console.warn('Could not restore shareToken:', e); }

    const updated = { ...member, token: newToken, status: 'active' };
    updateProject({ team: team.map((m) => (m.id === member.id ? updated : m)) });
    navigator.clipboard.writeText(portalUrl(newToken)).catch(() => {});
  }

  async function deleteMember(member) {
    if (!window.confirm(`Remove ${member.name || 'this member'} from your team? Their link will stop working immediately.`)) return;
    if (member.token) {
      try { await deleteDoc(doc(db, 'shareTokens', member.token)); } catch (e) {}
    }
    updateProject({ team: team.filter((m) => m.id !== member.id) });
  }

  // Split: full share members vs legacy contacts (no token yet)
  const shareMembers = team.filter((m) => m.token || m.permissions);
  const legacyContacts = team.filter((m) => !m.token && !m.permissions);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold text-ink"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            My Team
          </h1>
          <p className="text-sage text-sm mt-0.5">
            Add team members and control exactly what each person can see.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 bg-forest text-white text-sm px-4 py-2 rounded-lg hover:bg-deep transition-colors shrink-0"
        >
          <Plus size={15} /> Add Member
        </button>
      </div>


      {/* Team members (with share links) */}
      {shareMembers.length > 0 && (
        <div className="space-y-3 mb-6">
          {shareMembers.map((m) => (
            <MemberCard
              key={m.id}
              member={m}
              uid={uid}
              activity={activityData[m.id]}
              onEdit={() => openEdit(m)}
              onDelete={() => deleteMember(m)}
              onRevoke={() => revokeMember(m)}
              onRestore={() => restoreMember(m)}
            />
          ))}
        </div>
      )}

      {/* Legacy contacts (no token) */}
      {legacyContacts.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-mist uppercase tracking-wider mb-2">
            Contacts (no share link)
          </p>
          <div className="space-y-2">
            {legacyContacts.map((m) => (
              <div key={m.id} className="bg-white rounded-xl border border-linen p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-ink text-sm">{m.name || 'Unnamed'}</span>
                  <span className="text-xs text-mist ml-2">{m.role}</span>
                  {m.email && <div className="text-xs text-sage mt-0.5">{m.email}</div>}
                </div>
                <button
                  onClick={() => openEdit(m)}
                  className="text-xs text-forest hover:underline shrink-0"
                >
                  Enable Sharing →
                </button>
                <button
                  onClick={() => deleteMember(m)}
                  className="text-red-300 hover:text-red-500 shrink-0 p-1"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {team.length === 0 && (
        <div className="text-center py-16 text-mist bg-white rounded-xl border border-linen">
          <div className="text-4xl mb-3">👷</div>
          <p className="font-medium text-ink">No team members yet</p>
          <p className="text-sm mt-1 mb-4">
            Add your builder, architect, lender, or family — each gets their own link showing only what you choose.
          </p>
          <button
            onClick={openAdd}
            className="text-sm text-forest hover:underline"
          >
            Add your first team member →
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <MemberModal
          member={editingMember}
          uid={uid}
          onSave={saveMember}
          onClose={closeModal}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-forest text-white text-sm px-5 py-3 rounded-full shadow-lg flex items-center gap-2 pointer-events-none">
          <Check size={15} /> {toast}
        </div>
      )}
    </div>
  );
}
