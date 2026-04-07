import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ_DATA = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'Who is this app for?',
        a: 'This app is for anyone working through the land-to-build process. It helps you organize your entire journey in one place — from evaluating land and tracking your budget to planning your home design and preparing for your final walkthrough.',
      },
      {
        q: 'Is this app free?',
        a: 'Yes — the app is completely free during beta. All features are fully unlocked for every user. If paid plans are introduced in the future, current beta users will be notified well in advance.',
      },
      {
        q: 'Do I need an account to use the app?',
        a: 'Yes, a free account is required so your data can be saved and accessed from any device. You can sign up with an email and password or sign in with your existing Google account.',
      },
      {
        q: 'Does my data save automatically?',
        a: "Yes. Every change you make is saved to the cloud automatically — no save button needed. Your data is there the next time you open the app on any device. Note: if you close the app within a second of making a change, that specific edit may not have saved yet, so give it a moment after entering information.",
      },
    ],
  },
  {
    category: 'Account & Data',
    questions: [
      {
        q: 'Is my data private?',
        a: "Yes. Your project data is private and only accessible to you when you're signed in. The only way anyone else can see your project is if you deliberately share your share link with them (like your builder). Share links are read-only — no one can edit your data except you.",
      },
      {
        q: 'How do I change my password or email?',
        a: "Go to Profile → Account & Security. Click the edit icon next to Email or Password. For email/password accounts, you'll confirm your current password before changes take effect. Google sign-in users manage their Google account credentials through Google directly.",
      },
      {
        q: 'Can I use the app on my phone?',
        a: "Yes. The app is designed to work on any device — phone, tablet, or desktop — through your web browser. No app download is needed.",
      },
      {
        q: "What happens if I delete my account?",
        a: "Deleting your account permanently removes your login and all project data. This cannot be undone. You'll be asked to type DELETE to confirm before anything is removed. Make sure to export your budget or print any checklists you want to keep before deleting.",
      },
    ],
  },
  {
    category: 'Properties',
    questions: [
      {
        q: 'How do I track land I\'m looking at?',
        a: "Go to the Properties section and click \"+ Add Property.\" Each property has fields for address, asking price, acreage, a Zillow/MLS link, and notes. Use the notes field for things like zoning observations, perc test results, pros and cons, or anything else worth remembering.",
      },
      {
        q: 'Can I save multiple properties at once?',
        a: "Yes — add as many properties as you'd like. Comparing several parcels side by side before committing is one of the most useful ways to use this section.",
      },
      {
        q: 'What does "Evaluated" mean on a property?',
        a: "Evaluated is a simple status marker you control. It's meant to indicate that you've done your due diligence on that property — walked it, checked zoning, reviewed the perc test, etc. It doesn't trigger anything else in the app; it's just a way to track where you are in your review process.",
      },
    ],
  },
  {
    category: 'Home Design',
    questions: [
      {
        q: 'How do I use the Home Design section?',
        a: 'Click any room chip in the Customize section to add a room. Once added, click the room to expand it. Each room comes with pre-loaded standard items — like flooring type, cabinet color, and countertop material — with quick-select option chips. You can also attach inspiration photo URLs, paste product links, and add notes to any item.',
      },
      {
        q: 'What are the option chips on each item?',
        a: "Option chips are quick-select choices for common decisions — for example: Hardwood, LVP, Tile, Carpet for flooring. Tapping a chip selects it and records your choice. If none of the options match what you want, type your own value in the text box below the chips.",
      },
      {
        q: 'Can I add rooms that aren\'t on the list?',
        a: 'Yes. In the Customize section at the bottom of the Home Design page, type any room name into the input and click Add. You can add as many custom spaces as you need — mudroom, she-shed, workshop, whatever fits your build.',
      },
      {
        q: 'What is the Basement toggle?',
        a: 'When you add a Basement room, you\'ll see two options: Unfinished (utilities, storage, rough-in work) and Finished (living space, bedroom, wet bar, etc.). Selecting a type loads a set of items tailored to that basement style. You can switch types later, but you\'ll be asked to confirm since switching replaces the current items.',
      },
    ],
  },
  {
    category: 'Budget',
    questions: [
      {
        q: 'What is "Load Standard Budget"?',
        a: "It pre-fills your budget with 460+ line items organized across 37 categories — based on a real land-to-build budget from a complete new construction project. Every major cost is included, from land acquisition and permits through kitchen finishes, mechanical systems, and landscaping. You fill in your planned and actual costs as you go. It's a starting point, not a locked template — delete what doesn't apply and add anything that's missing.",
      },
      {
        q: "What's the difference between Planned and Actual?",
        a: "Planned is what you expect to spend before the work is done — your estimate or contractor quote. Actual is what you ended up paying once invoiced or completed. The app automatically shows you whether you're over or under budget based on the difference between the two.",
      },
      {
        q: 'How do I export my budget?',
        a: 'Click the "Export CSV" button at the top of the Budget section. This downloads a file called waymark-build-budget.csv that opens in Excel or Google Sheets, with columns for Category, Description, Planned, Actual, and Variance plus a totals row.',
      },
      {
        q: 'Can I add items that aren\'t in the standard budget?',
        a: 'Yes. Click "Add Line" at any time to add a blank budget item. Assign it any category from the dropdown and fill in your own description. You can also edit or delete any of the pre-loaded standard items.',
      },
    ],
  },
  {
    category: 'Timeline',
    questions: [
      {
        q: 'How do I use the Timeline?',
        a: 'Click "Load default milestones" to start with 15 standard steps — from beginning your land search all the way to move-in day. You can edit any milestone title, set a target date, add notes, and check it off when complete. Add your own custom milestones with the "+ Add" button.',
      },
      {
        q: 'Do milestones sort automatically by date?',
        a: "No — milestones stay in the order they were added. To keep them in chronological order, add them in the sequence you expect them to happen, or re-add them in the right order. Date-based auto-sorting may be added in a future update.",
      },
      {
        q: 'What are the default milestones?',
        a: 'The 15 default milestones cover: land search, make an offer, land under contract, secure financing, close on land, hire architect/designer, finalize plans, pull permits, break ground, framing complete, rough-ins complete, drywall & finishes, final inspections, punch list walkthrough, and move-in day.',
      },
    ],
  },
  {
    category: 'Checklists',
    questions: [
      {
        q: 'What checklists are included?',
        a: 'There are four: Land Evaluation (due diligence before buying), Permits & Inspections (keeping your build legal and on track), Hiring a Contractor (protecting yourself before signing), and Punch List Inspection (your final walkthrough before closing). The first three come pre-loaded with standard items you can edit.',
      },
      {
        q: 'What is the Punch List Inspection?',
        a: "The Punch List Inspection — also called the blue tape walkthrough — is a 359-item checklist you complete 1-2 weeks before closing. It covers every room and system in your new home: entry, living areas, kitchen, bedrooms, bathrooms, mechanical systems, exterior, and final documentation. Anything that needs repair or touch-up gets marked with blue painter's tape so the builder can fix it before you take ownership.",
      },
      {
        q: 'Can I add my own items to a checklist?',
        a: 'Yes. On the Land Evaluation, Permits, and Contractor checklists, click "+ Add item" at the bottom of the list. On the Punch List Inspection, expand any section and click "+ Add item to this section" to add a custom item specific to that area of the home.',
      },
      {
        q: 'How do I print a checklist?',
        a: 'Each checklist tab has a Print button in the top-right corner. Clicking it opens a clean, formatted version in a new browser window. From there, use your browser\'s print dialog to print on paper or choose "Save as PDF" to save a digital copy. The Punch List prints as a full multi-page document including all sections, your checked items, and the Notes & Red Flags reference.',
      },
    ],
  },
  {
    category: 'Documents',
    questions: [
      {
        q: 'How do I add documents?',
        a: 'Go to Documents → click "Add Document." Give it a name and category, then expand the row and paste a share link. To get a share link from Google Drive: upload your file, right-click it → Share → set to "Anyone with link can view" → copy the link and paste it here.',
      },
      {
        q: 'What types of documents should I store here?',
        a: 'Anything related to your build — blueprints and floor plans, your purchase contract, survey, permits, inspection reports, HOA documents, insurance paperwork, contractor bids, and photos. Organizing them here means you and your builder can find anything quickly from one place.',
      },
      {
        q: 'Can I upload files directly to the app?',
        a: "Not currently. Documents are stored as links to files you've uploaded to Google Drive, Dropbox, or another service you already use. This keeps the app free with no storage limits. Direct file upload may be added in a future version.",
      },
    ],
  },
  {
    category: 'Team & Sharing',
    questions: [
      {
        q: 'How do I share my project with my builder?',
        a: 'In the sidebar, click "Share with Builder." This copies a unique read-only link to your clipboard. Send it to your builder, contractor, or agent via text or email. They can open it in any browser — no account or login required.',
      },
      {
        q: 'Can my builder edit my project?',
        a: "No. Share links are permanently read-only. Anyone you send the link to can view your full project but cannot make any changes. Only you can edit your data when signed in to your account.",
      },
      {
        q: 'Can I control what my builder sees?',
        a: "Currently, the share link shows your full project. You can't hide individual sections (like budget) from specific people yet. Granular permissions are planned for a future update. For now, only share the link with people you're comfortable seeing your full project.",
      },
      {
        q: 'What is the Team section for?',
        a: "The Team section is a contact list for everyone involved in your build — builder, realtor, lender, architect, inspector, attorney, etc. Add their name, role, phone, email, and any notes (like license numbers or company names). It's a quick-reference directory, not a collaboration tool. Use the share link to give someone view access to your project.",
      },
    ],
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-outline-variant last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-3 px-4 py-3 text-left hover:bg-surface/50 transition-colors"
      >
        <span className={`text-sm leading-snug ${open ? 'text-primary font-medium' : 'text-on-surface'}`}>{q}</span>
        {open
          ? <ChevronUp size={15} className="text-outline shrink-0 mt-0.5" />
          : <ChevronDown size={15} className="text-outline shrink-0 mt-0.5" />}
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-outline leading-relaxed border-t border-outline-variant bg-surface/30">
          <p className="pt-3">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const [openCategory, setOpenCategory] = useState(null);

  return (
    <div className="mb-5">
      <p className="text-xs font-semibold text-outline uppercase tracking-wider px-1 mb-2">Help & FAQ</p>
      <div className="space-y-2">
        {FAQ_DATA.map((section) => {
          const isOpen = openCategory === section.category;
          return (
            <div key={section.category} className="shadow-md border border-outline-variant/10 rounded-3xl overflow-hidden">
              <button
                onClick={() => setOpenCategory(isOpen ? null : section.category)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-surface/50 transition-colors"
              >
                <span className="text-sm font-medium text-on-surface">{section.category}</span>
                <span className="flex items-center gap-2">
                  <span className="text-xs text-outline">{section.questions.length} questions</span>
                  {isOpen
                    ? <ChevronUp size={15} className="text-outline" />
                    : <ChevronDown size={15} className="text-outline" />}
                </span>
              </button>
              {isOpen && (
                <div className="border-t border-outline-variant">
                  {section.questions.map((item) => (
                    <FAQItem key={item.q} q={item.q} a={item.a} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
