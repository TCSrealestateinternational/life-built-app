function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export const TEMPLATES = [
  {
    id: 'land-custom',
    name: 'Land + Custom Build',
    icon: '🏗️',
    months: '18–22 months',
    description: 'Full journey from land search through move-in day.',
    phases: [
      { key: 'land-search',        title: 'Begin Land Search',          duration: 30  },
      { key: 'make-offer',         title: 'Make an Offer',              duration: 14  },
      { key: 'land-contract',      title: 'Land Under Contract',        duration: 30  },
      { key: 'financing',          title: 'Secure Financing',           duration: 45  },
      { key: 'close-land',         title: 'Close on Land',              duration: 7   },
      { key: 'hire-architect',     title: 'Hire Architect / Designer',  duration: 30  },
      { key: 'finalize-plans',     title: 'Finalize Plans & Specs',     duration: 60  },
      { key: 'permits',            title: 'Pull Permits',               duration: 45  },
      { key: 'site-prep',          title: 'Site Prep & Utilities',      duration: 21  },
      { key: 'foundation',         title: 'Foundation',                 duration: 21  },
      { key: 'framing',            title: 'Framing',                    duration: 45  },
      { key: 'rough-ins',          title: 'Rough-ins (MEP)',            duration: 45  },
      { key: 'insulation-drywall', title: 'Insulation & Drywall',       duration: 30  },
      { key: 'finishes',           title: 'Finishes & Interior',        duration: 60  },
      { key: 'final-inspections',  title: 'Final Inspections',          duration: 14  },
      { key: 'punch-list',         title: 'Punch List Walkthrough',     duration: 14  },
      { key: 'move-in',            title: 'Move-In Day',                duration: 1   },
    ],
  },
  {
    id: 'own-land',
    name: 'Already Own Land',
    icon: '🏠',
    months: '14–18 months',
    description: 'Skip land acquisition — start with design and permits.',
    phases: [
      { key: 'hire-architect',     title: 'Hire Architect / Designer',  duration: 30  },
      { key: 'finalize-plans',     title: 'Finalize Plans & Specs',     duration: 60  },
      { key: 'permits',            title: 'Pull Permits',               duration: 45  },
      { key: 'site-prep',          title: 'Site Prep & Utilities',      duration: 21  },
      { key: 'foundation',         title: 'Foundation',                 duration: 21  },
      { key: 'framing',            title: 'Framing',                    duration: 45  },
      { key: 'rough-ins',          title: 'Rough-ins (MEP)',            duration: 45  },
      { key: 'insulation-drywall', title: 'Insulation & Drywall',       duration: 30  },
      { key: 'finishes',           title: 'Finishes & Interior',        duration: 60  },
      { key: 'final-inspections',  title: 'Final Inspections',          duration: 14  },
      { key: 'punch-list',         title: 'Punch List Walkthrough',     duration: 14  },
      { key: 'move-in',            title: 'Move-In Day',                duration: 1   },
    ],
  },
  {
    id: 'modular',
    name: 'Modular / Prefab',
    icon: '🚚',
    months: '8–12 months',
    description: 'Factory-built home delivered to your prepared site.',
    phases: [
      { key: 'select-plan',   title: 'Select Modular Plan',         duration: 30 },
      { key: 'financing',     title: 'Secure Financing',            duration: 45 },
      { key: 'site-prep',     title: 'Site Prep & Foundation',      duration: 30 },
      { key: 'permits',       title: 'Pull Permits',                duration: 30 },
      { key: 'factory-build', title: 'Factory Build & Delivery',    duration: 60 },
      { key: 'assembly',      title: 'Set & Assembly',              duration: 14 },
      { key: 'utilities',     title: 'Utilities & Rough-ins',       duration: 30 },
      { key: 'finishes',      title: 'Finishes',                    duration: 45 },
      { key: 'inspections',   title: 'Final Inspections',           duration: 14 },
      { key: 'punch-list',    title: 'Punch List',                  duration: 7  },
      { key: 'move-in',       title: 'Move-In Day',                 duration: 1  },
    ],
  },
  {
    id: 'renovation',
    name: 'Renovation / Addition',
    icon: '🔨',
    months: '6–10 months',
    description: 'Major remodel or addition to an existing home.',
    phases: [
      { key: 'scope-budget',       title: 'Define Scope & Budget',   duration: 21 },
      { key: 'hire-contractor',    title: 'Hire Contractor',         duration: 30 },
      { key: 'permits',            title: 'Pull Permits',            duration: 30 },
      { key: 'demo',               title: 'Demo & Structural',       duration: 21 },
      { key: 'rough-ins',          title: 'Rough-ins (MEP)',         duration: 30 },
      { key: 'insulation-drywall', title: 'Insulation & Drywall',    duration: 21 },
      { key: 'finishes',           title: 'Finishes',                duration: 45 },
      { key: 'final-inspections',  title: 'Final Inspections',       duration: 14 },
      { key: 'punch-list',         title: 'Punch List',              duration: 7  },
      { key: 'project-complete',   title: 'Project Complete',        duration: 1  },
    ],
  },
  {
    id: 'luxury',
    name: 'Custom Luxury Build',
    icon: '✨',
    months: '24–30 months',
    description: 'High-end custom build with extended design and finish phases.',
    phases: [
      { key: 'land-search',       title: 'Begin Land Search',          duration: 60 },
      { key: 'make-offer',        title: 'Make an Offer',              duration: 21 },
      { key: 'land-contract',     title: 'Land Under Contract',        duration: 45 },
      { key: 'financing',         title: 'Secure Financing',           duration: 60 },
      { key: 'close-land',        title: 'Close on Land',              duration: 14 },
      { key: 'hire-architect',    title: 'Hire Architect / Designer',  duration: 45 },
      { key: 'schematic',         title: 'Schematic Design',           duration: 60 },
      { key: 'design-dev',        title: 'Design Development',         duration: 60 },
      { key: 'construction-docs', title: 'Construction Documents',     duration: 60 },
      { key: 'permits',           title: 'Pull Permits',               duration: 60 },
      { key: 'site-prep',         title: 'Site Prep & Utilities',      duration: 30 },
      { key: 'foundation',        title: 'Foundation',                 duration: 30 },
      { key: 'framing',           title: 'Framing',                    duration: 60 },
      { key: 'rough-ins',         title: 'Rough-ins (MEP)',            duration: 60 },
      { key: 'insulation-drywall',title: 'Insulation & Drywall',       duration: 30 },
      { key: 'custom-finishes',   title: 'Custom Finishes & Millwork', duration: 90 },
      { key: 'final-inspections', title: 'Final Inspections',          duration: 21 },
      { key: 'punch-list',        title: 'Punch List Walkthrough',     duration: 21 },
      { key: 'move-in',           title: 'Move-In Day',                duration: 1  },
    ],
  },
];

/**
 * Generate milestone objects from a template, starting at startDateStr ('YYYY-MM-DD').
 * Phases are sequential: each phase starts the day after the previous one ends.
 */
export function buildMilestonesFromTemplate(template, startDateStr) {
  let current = startDateStr;
  return template.phases.map((phase, i) => {
    const start = current;
    const end = addDays(start, phase.duration - 1);
    current = addDays(end, 1);
    return {
      id: `${phase.key}_${Date.now()}_${i}`,
      title: phase.title,
      start,
      end,
      progress: 0,
      done: false,
      notes: '',
      dependencies: '',
    };
  });
}
