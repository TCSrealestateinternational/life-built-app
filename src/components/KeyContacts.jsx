import { Download } from 'lucide-react';

const FIELDS = [
  { key: 'company', label: 'Company Name', placeholder: 'Company…',   width: 'w-36' },
  { key: 'name',    label: 'Name',         placeholder: 'Contact…',   width: 'w-28' },
  { key: 'phone',   label: 'Phone',        placeholder: 'Phone…',     width: 'w-28', type: 'tel'   },
  { key: 'email',   label: 'Email',        placeholder: 'Email…',     width: 'w-36', type: 'email' },
  { key: 'web',     label: 'Website',      placeholder: 'Website…',   width: 'w-36', type: 'url'   },
];

function exportCSV(contractors, distributors) {
  const header = ['Trade', 'Company Name', 'Name', 'Phone', 'Email', 'Website'];
  const rows = [
    ['CONTRACTORS'],
    header,
    ...contractors.map((c) => [c.trade, c.company, c.name, c.phone, c.email, c.web].map((v) => `"${(v ?? '').replace(/"/g, '""')}"`)),
    [],
    ['DISTRIBUTORS'],
    header,
    ...distributors.map((c) => [c.trade, c.company, c.name, c.phone, c.email, c.web].map((v) => `"${(v ?? '').replace(/"/g, '""')}"`)),
  ];
  const csv = rows.map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `key-contacts-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function ContactRow({ contact, onUpdate }) {
  return (
    <div className="flex items-center gap-0 border-b border-outline-variant last:border-0 hover:bg-surface/40 group">
      {/* Trade label — fixed, read-only */}
      <div className="w-44 shrink-0 px-3 py-2 text-xs font-medium text-on-surface border-r border-outline-variant">
        {contact.trade}
      </div>
      {/* Editable fields */}
      {FIELDS.map(({ key, placeholder, type }) => (
        <div key={key} className="flex-1 border-r border-outline-variant last:border-r-0">
          <input
            type={type ?? 'text'}
            value={contact[key] ?? ''}
            onChange={(e) => onUpdate({ [key]: e.target.value })}
            placeholder={placeholder}
            className="w-full text-xs bg-transparent px-3 py-2 focus:outline-none focus:bg-primary/5 placeholder:text-outline/50 text-on-surface"
          />
        </div>
      ))}
    </div>
  );
}

function Section({ title, contacts, onUpdate }) {
  return (
    <div className="mb-8">
      <h2 className="text-base font-semibold text-on-surface mb-3 font-heading">
        {title}
      </h2>
      <div className="shadow-md border border-outline-variant/10 bg-surface-container-lowest rounded-3xl overflow-hidden">
        {/* Column headers */}
        <div className="flex items-center gap-0 bg-surface border-b border-outline-variant text-xs font-semibold text-outline uppercase tracking-wide">
          <div className="w-44 shrink-0 px-3 py-2 border-r border-outline-variant">Trade</div>
          {FIELDS.map(({ key, label }) => (
            <div key={key} className="flex-1 px-3 py-2 border-r border-outline-variant last:border-r-0">{label}</div>
          ))}
        </div>
        {contacts.map((contact, i) => (
          <ContactRow
            key={contact.id ?? i}
            contact={contact}
            onUpdate={(patch) => onUpdate(contact.id, patch)}
          />
        ))}
      </div>
    </div>
  );
}

export default function KeyContacts({ project, updateProject }) {
  const contractors  = project?.keyContacts?.contractors  ?? [];
  const distributors = project?.keyContacts?.distributors ?? [];

  function updateContact(section, id, patch) {
    const list = section === 'contractors' ? contractors : distributors;
    const updated = list.map((c) => (c.id === id ? { ...c, ...patch } : c));
    updateProject({
      keyContacts: {
        ...project.keyContacts,
        [section]: updated,
      },
    });
  }

  const hasAnyData = [...contractors, ...distributors].some(
    (c) => c.company || c.name || c.phone || c.email || c.web
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface font-heading">
            Key Contacts
          </h1>
          <p className="text-on-surface-variant text-sm mt-0.5">
            Important contacts for warranties, service, and your build team — all in one place.
          </p>
        </div>
        {hasAnyData && (
          <button
            onClick={() => exportCSV(contractors, distributors)}
            className="flex items-center gap-1.5 border border-outline-variant text-on-surface-variant text-sm px-3 py-2 rounded-xl hover:border-primary hover:text-primary transition-colors shrink-0"
          >
            <Download size={15} /> Export CSV
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: '700px' }}>
          <Section
            title="Contractors"
            contacts={contractors}
            onUpdate={(id, patch) => updateContact('contractors', id, patch)}
          />
          <Section
            title="Distributors"
            contacts={distributors}
            onUpdate={(id, patch) => updateContact('distributors', id, patch)}
          />
        </div>
      </div>
    </div>
  );
}
