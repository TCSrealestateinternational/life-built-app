export const ROLES = [
  'Builder / GC',
  'Architect / Designer',
  'Family Member',
  'Lender / Bank',
  'Interior Designer',
  'Inspector',
  'Custom',
];

// Sections available in the sharing system.
// canEdit: true means the "Can Edit" column is active for this section.
// (Edit access is reserved for future implementation; currently portal is view-only.)
export const PERMISSION_SECTIONS = [
  { id: 'timeline',  label: 'Timeline / Gantt',     canEdit: true  },
  { id: 'budget',    label: 'Budget & Costs',        canEdit: false },
  { id: 'documents', label: 'Documents & Permits',   canEdit: false },
  { id: 'photos',    label: 'Progress Photos',       canEdit: false },
  { id: 'messages',  label: 'Messages / Notes',      canEdit: true  },
  { id: 'contacts',  label: 'Team Contact Info',     canEdit: false },
];

const none = { view: false, edit: false };
const view = { view: true,  edit: false };
const edit = { view: true,  edit: true  };

export const ROLE_DEFAULTS = {
  'Builder / GC': {
    timeline:  edit,
    budget:    none,
    documents: view,
    photos:    view,
    messages:  edit,
    contacts:  none,
  },
  'Architect / Designer': {
    timeline:  view,
    budget:    none,
    documents: edit,
    photos:    view,
    messages:  none,
    contacts:  none,
  },
  'Family Member': {
    timeline:  view,
    budget:    none,
    documents: none,
    photos:    view,
    messages:  none,
    contacts:  none,
  },
  'Lender / Bank': {
    timeline:  none,
    budget:    view,
    documents: view,
    photos:    none,
    messages:  none,
    contacts:  none,
  },
  'Interior Designer': {
    timeline:  view,
    budget:    none,
    documents: view,
    photos:    view,
    messages:  none,
    contacts:  none,
  },
  'Inspector': {
    timeline:  view,
    budget:    none,
    documents: view,
    photos:    view,
    messages:  none,
    contacts:  none,
  },
  'Custom': {
    timeline:  none,
    budget:    none,
    documents: none,
    photos:    none,
    messages:  none,
    contacts:  none,
  },
};

export function getDefaultPermissions(role) {
  return ROLE_DEFAULTS[role] ?? ROLE_DEFAULTS['Custom'];
}
