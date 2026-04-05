import { useState } from 'react';
import {
  updateProfile as fbUpdateProfile,
  updateEmail,
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signOut,
} from 'firebase/auth';
import { auth } from '../firebase';
import FAQ from './FAQ';
import {
  User, Mail, Phone, Lock, MapPin, FileText, Bell, Shield,
  CreditCard, LogOut, Trash2, ChevronRight,
  Check, X, Edit2, Building, DollarSign, CheckSquare, FolderOpen,
  Home,
} from 'lucide-react';

// ─── Layout helpers ──────────────────────────────────────────────────────────

function SectionCard({ title, children }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-semibold text-mist uppercase tracking-wider px-1 mb-2">{title}</p>
      <div className="bg-white rounded-xl border border-linen divide-y divide-linen overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function ActionRow({ icon: Icon, label, sublabel, onClick, danger, rightEl, href }) {
  const cls = `w-full flex items-center gap-3 px-4 py-3 text-left border-b border-linen last:border-0 transition-colors ${
    danger ? 'hover:bg-red-50' : 'hover:bg-cream/50'
  }`;
  const inner = (
    <>
      {Icon && <Icon size={16} className={`shrink-0 ${danger ? 'text-red-400' : 'text-mist'}`} />}
      <div className="flex-1 min-w-0">
        <div className={`text-sm ${danger ? 'text-red-500' : 'text-ink'}`}>{label}</div>
        {sublabel && <div className="text-xs text-mist">{sublabel}</div>}
      </div>
      {rightEl !== undefined ? rightEl : <ChevronRight size={14} className="text-linen shrink-0" />}
    </>
  );
  if (href) return <a href={href} target="_blank" rel="noreferrer" className={cls}>{inner}</a>;
  return <button onClick={onClick} className={cls}>{inner}</button>;
}

function ToggleRow({ icon: Icon, label, sublabel, checked, onChange }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-linen last:border-0">
      {Icon && <Icon size={16} className="text-mist shrink-0" />}
      <div className="flex-1 min-w-0">
        <div className="text-sm text-ink">{label}</div>
        {sublabel && <div className="text-xs text-mist">{sublabel}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative rounded-full transition-colors shrink-0 ${checked ? 'bg-forest' : 'bg-linen'}`}
        style={{ width: 40, height: 22 }}
        aria-checked={checked}
        role="switch"
      >
        <span
          className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
          style={{ transform: checked ? 'translateX(20px)' : 'translateX(2px)' }}
        />
      </button>
    </div>
  );
}

// ─── Editable field row ───────────────────────────────────────────────────────

function EditableRow({ icon: Icon, label, value, placeholder, type = 'text', multiline, onSave, hint }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function open() { setDraft(value || ''); setEditing(true); setError(''); }
  function close() { setEditing(false); setError(''); }

  async function save() {
    setSaving(true);
    try { await onSave(draft.trim()); setEditing(false); }
    catch (e) { setError(e.message || 'Failed to save.'); }
    setSaving(false);
  }

  return (
    <div>
      <div className="flex items-center gap-3 px-4 py-3">
        {Icon && <Icon size={16} className="text-mist shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="text-xs text-mist">{label}</div>
          <div className="text-sm text-ink truncate">
            {value || <span className="italic text-mist/70">{placeholder || 'Not set'}</span>}
          </div>
        </div>
        {!editing && (
          <button onClick={open} className="text-mist hover:text-forest transition-colors shrink-0 p-1">
            <Edit2 size={13} />
          </button>
        )}
      </div>
      {editing && (
        <div className="px-4 pb-3 border-t border-linen bg-cream/40 space-y-2">
          {hint && <p className="text-xs text-mist pt-2">{hint}</p>}
          {multiline ? (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              className="w-full text-sm border border-linen rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-forest/40 resize-none mt-2"
            />
          ) : (
            <input
              type={type}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && save()}
              className="w-full text-sm border border-linen rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-forest/40 mt-2"
            />
          )}
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-1 text-xs bg-forest text-white px-3 py-1.5 rounded-lg hover:bg-deep disabled:opacity-50"
            >
              <Check size={12} /> {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={close} className="text-xs text-mist hover:text-ink px-2 py-1.5">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Email change ─────────────────────────────────────────────────────────────

function EmailChangeRow({ user, hasPasswordProvider }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  async function save() {
    if (!email.includes('@')) { setMsg('Enter a valid email.'); return; }
    setSaving(true); setMsg('');
    try {
      if (hasPasswordProvider) {
        const cred = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(auth.currentUser, cred);
      }
      await updateEmail(auth.currentUser, email);
      setMsg('✓ Email updated.');
      setTimeout(() => { setOpen(false); setMsg(''); }, 1500);
    } catch (e) {
      const code = e.code || '';
      if (code.includes('wrong-password') || code.includes('invalid-credential')) setMsg('Password is incorrect.');
      else if (code.includes('email-already-in-use')) setMsg('That email is already in use.');
      else if (code.includes('requires-recent-login')) setMsg('Sign out and sign back in, then try again.');
      else setMsg(e.message || 'Failed to update email.');
    }
    setSaving(false);
  }

  return (
    <div>
      <div className="flex items-center gap-3 px-4 py-3">
        <Mail size={16} className="text-mist shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-xs text-mist">Email</div>
          <div className="text-sm text-ink truncate">{user.email}</div>
        </div>
        {!open && (
          <button onClick={() => { setEmail(user.email); setOpen(true); }} className="text-mist hover:text-forest transition-colors shrink-0 p-1">
            <Edit2 size={13} />
          </button>
        )}
      </div>
      {open && (
        <div className="px-4 pb-3 border-t border-linen bg-cream/40 space-y-2">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="New email address" className="mt-2 w-full text-sm border border-linen rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-forest/40" />
          {hasPasswordProvider && (
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Current password to confirm" className="w-full text-sm border border-linen rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-forest/40" />
          )}
          {msg && <p className={`text-xs ${msg.startsWith('✓') ? 'text-forest' : 'text-red-500'}`}>{msg}</p>}
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="flex items-center gap-1 text-xs bg-forest text-white px-3 py-1.5 rounded-lg hover:bg-deep disabled:opacity-50">
              <Check size={12} /> {saving ? 'Saving…' : 'Update Email'}
            </button>
            <button onClick={() => { setOpen(false); setMsg(''); }} className="text-xs text-mist hover:text-ink px-2 py-1.5">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Password change ──────────────────────────────────────────────────────────

function PasswordChangeRow({ hasPasswordProvider }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  if (!hasPasswordProvider) return null;

  async function save() {
    if (next.length < 6) { setMsg('New password must be at least 6 characters.'); return; }
    if (next !== confirm) { setMsg('Passwords do not match.'); return; }
    setSaving(true); setMsg('');
    try {
      const cred = EmailAuthProvider.credential(auth.currentUser.email, current);
      await reauthenticateWithCredential(auth.currentUser, cred);
      await updatePassword(auth.currentUser, next);
      setMsg('✓ Password updated.');
      setCurrent(''); setNext(''); setConfirm('');
      setTimeout(() => { setOpen(false); setMsg(''); }, 1500);
    } catch (e) {
      const code = e.code || '';
      if (code.includes('wrong-password') || code.includes('invalid-credential')) setMsg('Current password is incorrect.');
      else setMsg(e.message || 'Failed to update password.');
    }
    setSaving(false);
  }

  return (
    <div>
      <div className="flex items-center gap-3 px-4 py-3">
        <Lock size={16} className="text-mist shrink-0" />
        <div className="flex-1">
          <div className="text-xs text-mist">Password</div>
          <div className="text-sm text-ink">••••••••</div>
        </div>
        {!open && (
          <button onClick={() => setOpen(true)} className="text-mist hover:text-forest transition-colors shrink-0 p-1">
            <Edit2 size={13} />
          </button>
        )}
      </div>
      {open && (
        <div className="px-4 pb-3 border-t border-linen bg-cream/40 space-y-2">
          <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Current password" className="mt-2 w-full text-sm border border-linen rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-forest/40" />
          <input type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="New password (min. 6 characters)" className="w-full text-sm border border-linen rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-forest/40" />
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password" className="w-full text-sm border border-linen rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-forest/40" />
          {msg && <p className={`text-xs ${msg.startsWith('✓') ? 'text-forest' : 'text-red-500'}`}>{msg}</p>}
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="flex items-center gap-1 text-xs bg-forest text-white px-3 py-1.5 rounded-lg hover:bg-deep disabled:opacity-50">
              <Check size={12} /> {saving ? 'Saving…' : 'Update Password'}
            </button>
            <button onClick={() => { setOpen(false); setMsg(''); }} className="text-xs text-mist hover:text-ink px-2 py-1.5">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Delete account ───────────────────────────────────────────────────────────

function DeleteAccountRow() {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const hasPasswordProvider = auth.currentUser?.providerData?.some((p) => p.providerId === 'password');

  async function doDelete() {
    if (confirmText !== 'DELETE') { setError('Type DELETE in all caps to confirm.'); return; }
    setSaving(true); setError('');
    try {
      if (hasPasswordProvider && password) {
        const cred = EmailAuthProvider.credential(auth.currentUser.email, password);
        await reauthenticateWithCredential(auth.currentUser, cred);
      }
      await deleteUser(auth.currentUser);
    } catch (e) {
      const code = e.code || '';
      if (code.includes('requires-recent-login')) setError('Sign out and sign back in before deleting your account.');
      else if (code.includes('wrong-password') || code.includes('invalid-credential')) setError('Password is incorrect.');
      else setError(e.message || 'Failed to delete account.');
    }
    setSaving(false);
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 transition-colors border-b border-linen last:border-0"
      >
        <Trash2 size={16} className="text-red-400 shrink-0" />
        <div className="flex-1">
          <div className="text-sm text-red-500">Delete Account</div>
          <div className="text-xs text-mist">Permanently remove your account and all data</div>
        </div>
        <ChevronRight size={14} className={`text-red-300 transition-transform shrink-0 ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-3 bg-red-50/60 space-y-2">
          <p className="text-xs text-red-600 font-medium">This cannot be undone. All your project data will be permanently deleted.</p>
          {hasPasswordProvider && (
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password to confirm" className="w-full text-sm border border-red-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-red-300" />
          )}
          <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder='Type DELETE to confirm' className="w-full text-sm border border-red-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-red-300" />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={doDelete}
              disabled={saving || confirmText !== 'DELETE'}
              className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? 'Deleting…' : 'Delete My Account'}
            </button>
            <button onClick={() => { setOpen(false); setError(''); setConfirmText(''); setPassword(''); }} className="text-xs text-mist hover:text-ink px-2 py-1.5">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Profile component ───────────────────────────────────────────────────

export default function Profile({ project, updateProject, user }) {
  const profile = project?.profile ?? {};
  const providers = user.providerData?.map((p) => p.providerId) ?? [];
  const hasPasswordProvider = providers.includes('password');
  const hasGoogleProvider = providers.includes('google.com');

  const displayName = user.displayName || profile.displayName || '';
  const photoURL = user.photoURL || profile.photoURL || '';
  const notifs = profile.notifications ?? { email: true, push: false, sms: false };
  const privacy = profile.privacy ?? { builderCanView: true, publicProfile: false };

  function patchProfile(patch) {
    updateProject({ profile: { ...profile, ...patch } });
  }

  // Derived build stats
  const stats = [
    { icon: Building, label: 'Properties Saved', value: (project?.properties ?? []).length },
    { icon: DollarSign, label: 'Budget Items', value: (project?.budget?.items ?? []).length },
    {
      icon: DollarSign, label: 'Total Planned',
      value: (() => {
        const t = (project?.budget?.items ?? []).reduce((s, i) => s + (parseFloat(i.planned) || 0), 0);
        return t > 0 ? `$${t.toLocaleString()}` : '—';
      })(),
    },
    {
      icon: CheckSquare, label: 'Checklist Items Done',
      value: Object.entries(project?.checklists ?? {})
        .filter(([k]) => k !== 'punchList' && k !== 'punchListCustom')
        .reduce((s, [, list]) => s + (Array.isArray(list) ? list.filter((i) => i.done).length : 0), 0),
    },
    { icon: Home, label: 'Design Rooms', value: Object.keys(project?.homeDesign ?? {}).length },
    { icon: FolderOpen, label: 'Documents', value: (project?.documents ?? []).length },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
          Profile
        </h1>
        <p className="text-sage text-sm mt-0.5">Manage your account, preferences, and build details.</p>
      </div>

      {/* Avatar + name header card */}
      <div className="bg-white rounded-xl border border-linen p-5 mb-5 flex items-center gap-4">
        <div className="shrink-0">
          {photoURL ? (
            <img
              src={photoURL}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover border-2 border-linen"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center">
              <User size={28} className="text-forest" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-lg font-semibold text-ink truncate">
            {displayName || user.email}
          </div>
          <div className="text-sm text-mist truncate">
            {profile.bio || profile.location || user.email}
          </div>
        </div>
      </div>

      {/* Identity */}
      <SectionCard title="Identity">
        <EditableRow
          icon={User}
          label="Display Name"
          value={displayName}
          placeholder="Add your name"
          onSave={async (v) => {
            await fbUpdateProfile(auth.currentUser, { displayName: v });
            patchProfile({ displayName: v });
          }}
        />
        <EditableRow
          icon={User}
          label="Profile Photo URL"
          value={profile.photoURL || (user.photoURL && user.photoURL !== profile.photoURL ? user.photoURL : '')}
          placeholder="Paste a public image URL"
          hint="Paste any public image URL. Google sign-in users already have a photo auto-applied."
          onSave={async (v) => {
            await fbUpdateProfile(auth.currentUser, { photoURL: v });
            patchProfile({ photoURL: v });
          }}
        />
        <EditableRow
          icon={FileText}
          label="Bio / Tagline"
          value={profile.bio}
          placeholder="A short description about yourself"
          multiline
          onSave={(v) => patchProfile({ bio: v })}
        />
        <EditableRow
          icon={MapPin}
          label="Location"
          value={profile.location}
          placeholder="City, State"
          onSave={(v) => patchProfile({ location: v })}
        />
      </SectionCard>

      {/* Account & Security */}
      <SectionCard title="Account & Security">
        <EmailChangeRow user={user} hasPasswordProvider={hasPasswordProvider} />
        <EditableRow
          icon={Phone}
          label="Phone Number"
          value={profile.phone}
          placeholder="Add a phone number"
          type="tel"
          onSave={(v) => patchProfile({ phone: v })}
        />
        <PasswordChangeRow hasPasswordProvider={hasPasswordProvider} />
        <div className="px-4 py-3">
          <div className="text-xs text-mist mb-2">Linked Accounts</div>
          <div className="flex flex-wrap gap-2">
            {hasPasswordProvider && (
              <span className="text-xs bg-linen text-ink px-2.5 py-1 rounded-full">✉️ Email / Password</span>
            )}
            {hasGoogleProvider && (
              <span className="text-xs bg-linen text-ink px-2.5 py-1 rounded-full">🔵 Google</span>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Notifications */}
      <SectionCard title="Notification Preferences">
        <ToggleRow
          icon={Bell}
          label="Email Notifications"
          sublabel="Updates and reminders about your build"
          checked={notifs.email}
          onChange={(v) => patchProfile({ notifications: { ...notifs, email: v } })}
        />
        <ToggleRow
          icon={Bell}
          label="Push Notifications"
          sublabel="Browser alerts (coming soon)"
          checked={!!notifs.push}
          onChange={(v) => patchProfile({ notifications: { ...notifs, push: v } })}
        />
        <ToggleRow
          icon={Bell}
          label="SMS Notifications"
          sublabel="Text message updates (coming soon)"
          checked={!!notifs.sms}
          onChange={(v) => patchProfile({ notifications: { ...notifs, sms: v } })}
        />
      </SectionCard>

      {/* Privacy */}
      <SectionCard title="Privacy Settings">
        <ToggleRow
          icon={Shield}
          label="Allow Builder / Team Access"
          sublabel="Anyone with your share link can view your project"
          checked={privacy.builderCanView !== false}
          onChange={(v) => patchProfile({ privacy: { ...privacy, builderCanView: v } })}
        />
        <ToggleRow
          icon={Shield}
          label="Public Profile"
          sublabel="Allow your name and bio to appear publicly"
          checked={!!privacy.publicProfile}
          onChange={(v) => patchProfile({ privacy: { ...privacy, publicProfile: v } })}
        />
      </SectionCard>

      {/* Build Stats */}
      <SectionCard title="Your Build at a Glance">
        <div className="px-4 py-4 grid grid-cols-3 gap-4">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center">
              <div className="text-xl font-bold text-forest">{value}</div>
              <div className="text-xs text-mist mt-0.5 leading-tight">{label}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Subscription */}
      <SectionCard title="Subscription">
        <div className="px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center shrink-0">
            <CreditCard size={18} className="text-forest" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-ink">Beta Access</div>
            <div className="text-xs text-mist">Free during beta — all features unlocked</div>
          </div>
          <span className="text-xs bg-forest text-white px-2.5 py-1 rounded-full shrink-0">Active</span>
        </div>
        <ActionRow
          icon={CreditCard}
          label="Upgrade / Manage Billing"
          sublabel="Pro plans coming soon"
          onClick={() => alert('Billing management coming soon!')}
        />
      </SectionCard>

      {/* Support & Legal */}
      <SectionCard title="Support & Legal">
        <ActionRow
          icon={Mail}
          label="Contact Support"
          sublabel="home@lifebuiltinkentucky.com"
          href="mailto:home@lifebuiltinkentucky.com"
        />
        <ActionRow
          icon={FileText}
          label="Terms of Service"
          href="https://www.lifebuiltinkentucky.com/terms.html"
        />
        <ActionRow
          icon={Shield}
          label="Privacy Policy"
          href="https://www.lifebuiltinkentucky.com/privacy.html"
        />
      </SectionCard>

      {/* FAQ */}
      <FAQ />

      {/* Account actions */}
      <SectionCard title="Account Actions">
        <ActionRow
          icon={LogOut}
          label="Sign Out"
          onClick={() => signOut(auth)}
          rightEl={null}
        />
        <DeleteAccountRow />
      </SectionCard>
    </div>
  );
}
