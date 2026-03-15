export const TOUR_STEPS = [
  {
    sectionId: 'dashboard',
    title: 'Dashboard',
    description:
      'Your command center for the entire project. At a glance you can see budget health, timeline progress, open action items, and recent activity — all in one place.',
    features: [
      'Live budget vs. actual spending summary',
      'Timeline progress bar with next milestone',
      'Quick links to recent documents and messages',
      'Project health score across all sections',
    ],
    tip: 'Bookmark this page. It surfaces the most important changes so you never have to dig.',
  },
  {
    sectionId: 'profile',
    title: 'Profile',
    description:
      'Set up your account details and project preferences. Your profile information is used to personalize reports, shared views, and notifications.',
    features: [
      'Update your name, email, and contact info',
      'Set your primary project address',
      'Notification preferences (coming soon)',
      'Account security settings',
    ],
    tip: null,
  },
  {
    sectionId: 'properties',
    title: 'Properties',
    description:
      'Track every property tied to your project — land, a new build address, or an existing home being renovated. Quickly look up listings and save notes.',
    features: [
      'Add multiple properties with status tracking',
      'Paste a Zillow or Realtor.com link to auto-fill details',
      'View property on a map with one click',
      'Tag each property (Owned, Under Contract, Watching)',
    ],
    tip: 'Even if you already own the land, add it here so the rest of the app can reference the address.',
  },
  {
    sectionId: 'design',
    title: 'Home Design',
    description:
      'Plan every room of your home before a single nail is driven. Capture finishes, fixtures, appliances, and inspiration photos room by room.',
    features: [
      '17 room types pre-loaded with common selection categories',
      'Track finish selections (flooring, countertops, paint colors, etc.)',
      'Link selections to your budget line items',
      'Export a design summary for your builder or designer',
    ],
    tip: 'Lock selections early. Change orders are far more expensive than decisions made before construction.',
  },
  {
    sectionId: 'budget',
    title: 'Budget',
    description:
      'The most detailed construction budget tool you\'ll find outside of a contractor\'s software. Track every dollar from land purchase to punch list completion.',
    features: [
      '600+ pre-loaded line items across 41 categories',
      'Enter your contract price, then track actual invoices against it',
      'Color-coded over/under indicators on every line',
      'Running totals and contingency reserve tracker',
    ],
    tip: 'Start with your builder\'s allowance numbers as the baseline, then update actuals as invoices come in.',
  },
  {
    sectionId: 'timeline',
    title: 'Timeline',
    description:
      'Visualize your construction schedule with a Gantt chart. Choose from five project templates or build a custom schedule from scratch.',
    features: [
      'Five schedule templates: custom build, modular, renovation, luxury, and land-first',
      'Drag-and-drop phase blocks to adjust dates',
      'Milestone markers for inspections, draw requests, and closing',
      'Print or export the timeline for lender or builder meetings',
    ],
    tip: 'Share the timeline with your lender. Draw schedules aligned to construction phases get approved faster.',
  },
  {
    sectionId: 'changeorders',
    title: 'Change Orders',
    description:
      'Document every scope change in writing, the moment it happens. Change orders are where budget overruns begin — staying on top of them protects you.',
    features: [
      'Log each change with description, cost impact, and approval status',
      'Running total of approved change order costs',
      'Flag items as Pending, Approved, or Rejected',
      'Change order costs roll up automatically into the Budget section',
    ],
    tip: 'Never agree to a change verbally. Log it here first, then sign the paperwork.',
  },
  {
    sectionId: 'payments',
    title: 'Payment Schedule',
    description:
      'Track draw requests, progress payments, and lender disbursements. Know exactly what has been paid, what is due, and what is coming next.',
    features: [
      'Schedule expected draw requests by phase or milestone',
      'Record actual payment dates and amounts',
      'Flag overdue payments for follow-up',
      'Match draws to timeline milestones for lender compliance',
    ],
    tip: 'Construction loans release funds in draws tied to inspections. Log each milestone inspection here so payments are never delayed.',
  },
  {
    sectionId: 'commslog',
    title: 'Communication Log',
    description:
      'A searchable record of every important conversation with your builder, subcontractors, lender, and design team. Protect yourself with a paper trail.',
    features: [
      'Log calls, emails, site visits, and meetings',
      'Tag entries by contact, category, and urgency',
      'Attach photos or files to any entry',
      'Export the full log as a PDF for dispute resolution',
    ],
    tip: 'After every site visit, log what you observed and what was discussed. Three sentences is enough — consistency matters more than detail.',
  },
  {
    sectionId: 'lienwaiver',
    title: 'Lien Waivers',
    description:
      'Track lien waiver collection for every subcontractor and supplier. Missing waivers can cloud your title and block final closing.',
    features: [
      'List all subs and suppliers who need to provide waivers',
      'Track conditional and unconditional waiver status separately',
      'Set reminders for waivers due at each draw',
      'Log waiver receipt dates and document storage location',
    ],
    tip: 'Never release a draw payment without collecting the lien waiver for the previous draw. Your title company will thank you.',
  },
  {
    sectionId: 'checklists',
    title: 'Checklists',
    description:
      'Pre-built inspection checklists walk you through the final walkthrough room by room. Catch issues before your builder closes out the job.',
    features: [
      '319 inspection items across 11 home areas',
      'Check items off during your walk with a phone or tablet',
      'Add notes or photos to flagged items',
      'Generate a punch list PDF to hand to your builder',
    ],
    tip: 'Do your final walkthrough before closing, not on closing day. You need time to negotiate repairs.',
  },
  {
    sectionId: 'documents',
    title: 'Documents',
    description:
      'A secure home for every contract, permit, warranty, invoice, and photo tied to your project. Organized by category so you can find anything fast.',
    features: [
      'Upload PDFs, photos, and other files directly from your device',
      'Folder structure mirrors your project phases',
      'Share specific documents with your team without exposing everything',
      'Warranty documents stay accessible long after the project closes',
    ],
    tip: 'Scan and upload your building contract and draw schedule on day one. These are your two most important documents.',
  },
  {
    sectionId: 'keycontacts',
    title: 'Key Contacts',
    description:
      'A centralized directory for everyone involved in your project — with license numbers, insurance info, and notes all in one place.',
    features: [
      'Store builder, architect, lender, inspector, and sub contact info',
      'Record license numbers, insurance policy numbers, and expiration dates',
      'One-tap to call or email any contact',
      'Flag contacts as primary, secondary, or emergency',
    ],
    tip: 'Add your building inspector\'s direct line early. Quick communication with inspectors prevents costly scheduling delays.',
  },
  {
    sectionId: 'team',
    title: 'Team Access',
    description:
      'Invite your builder, spouse, lender, or anyone else to view parts of the project in real time. Granular permissions let you control exactly what each person sees.',
    features: [
      'Invite team members by email with a unique access link',
      'Seven role types with a pre-configured permission matrix',
      'Grant or revoke access to individual sections at any time',
      'Team members see a read-only portal — they cannot edit your data',
    ],
    tip: 'Add your builder to the Team section early. Giving them visibility into your budget and timeline cuts down on status-update calls.',
  },
];
