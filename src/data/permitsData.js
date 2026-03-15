// Helper: item with no note
const s = (id, text, tags = []) => ({ id, text, tags });
// Helper: item with a note (displayed as info tooltip)
const sn = (id, text, tags, note) => ({ id, text, tags, why: note });

export const PERMITS_CHECKLISTS = {

  // ── Phase 1: Pre-Construction ───────────────────────────────────────────────
  permitsPreCon: {
    label: '1. Pre-Construction Permits',
    emoji: '📋',
    desc: 'Must be obtained before any ground is broken. The GC is responsible for pulling all of these — confirm this is in your contract.',
    proTip: {
      title: 'GC Responsibility',
      text: 'These must be obtained before any ground is broken. The GC is responsible for pulling all of these — confirm this is in your contract.',
    },
    sections: [
      {
        id: 'pre-s1',
        title: 'Site & Zoning Approvals',
        items: [
          sn('pre001', 'Zoning / land use approval', ['permit', 'critical'],
            'Confirms the lot is zoned for residential use and the proposed structure meets setbacks, height limits, and lot coverage rules.'),
          sn('pre002', 'Subdivision plat approval (if in a new development)', ['permit', 'conditional'],
            'Required before individual lots can be permitted in a new subdivision.'),
          sn('pre003', 'Variance or special use permit (if required)', ['permit', 'conditional'],
            'Needed if any aspect of the build does not conform to standard zoning — e.g. reduced setback, accessory structure, etc.'),
          sn('pre004', 'Floodplain determination / FEMA elevation certificate', ['permit', 'conditional'],
            'Required if any part of the lot is in or near a FEMA flood zone. May require elevated foundation.'),
          sn('pre005', 'HOA architectural approval (if applicable)', ['permit', 'conditional'],
            'Many subdivisions require HOA sign-off on plans, materials, and colors before permits are issued.'),
        ],
      },
      {
        id: 'pre-s2',
        title: 'Environmental & Site Permits',
        items: [
          sn('pre006', 'Land disturbance / grading permit', ['permit', 'critical'],
            'Required any time soil is disturbed. In Kentucky, sites over 1 acre also require a KPDES permit.'),
          sn('pre007', 'KPDES stormwater permit (sites over 1 acre)', ['permit', 'conditional'],
            'Requires a Stormwater Pollution Prevention Plan (SWPPP) to be on site at all times during construction.'),
          sn('pre008', 'Tree removal permit (if required by local ordinance)', ['permit', 'conditional'],
            'Some counties and municipalities require permits to remove trees above a certain diameter.'),
          sn('pre009', 'Septic system site evaluation / perc test', ['inspection', 'conditional'],
            'Required before septic permit is issued. The county health department evaluates soil absorption capacity.'),
          sn('pre010', 'Septic system permit', ['permit', 'conditional'],
            'Issued by the local health department (not the building department). Required before any excavation for septic begins.'),
          sn('pre011', 'Well permit', ['permit', 'conditional'],
            'Issued by Kentucky Division of Water. Required before drilling begins. Includes setback requirements from septic systems.'),
        ],
      },
      {
        id: 'pre-s3',
        title: 'Building Permits',
        items: [
          sn('pre012', 'Master building permit', ['permit', 'critical'],
            'The primary permit covering structural, architectural, and general construction. All other trade permits are typically sub-permits under this.'),
          sn('pre013', 'Electrical permit', ['permit', 'critical'],
            'Pulled separately by the electrical contractor in most Kentucky jurisdictions.'),
          sn('pre014', 'Plumbing permit', ['permit', 'critical'],
            'Pulled separately by the licensed plumbing contractor.'),
          sn('pre015', 'Mechanical / HVAC permit', ['permit', 'critical'],
            'Pulled separately by the HVAC contractor.'),
          sn('pre016', 'Gas piping permit (natural gas or propane)', ['permit', 'conditional'],
            'May be included under mechanical or issued separately depending on the jurisdiction.'),
          sn('pre017', 'Driveway / curb cut permit', ['permit', 'conditional'],
            'Required if the driveway connects to a county or state road. Issued by the road department, not the building department.'),
          sn('pre018', 'Solar / alternative energy permit', ['permit', 'conditional'],
            'Required for any grid-tied solar installation. May also require utility interconnection agreement.'),
        ],
      },
    ],
  },

  // ── Phase 2: Site Work & Foundation ────────────────────────────────────────
  permitsSiteFdn: {
    label: '2. Site Work & Foundation',
    emoji: '🏗️',
    desc: 'Failures here are the most expensive to fix — concrete cannot be poured until inspections pass.',
    proTip: {
      title: 'Before You Pour',
      text: 'These happen at the very start of construction. Failures here are the most expensive to fix — concrete cannot be poured until inspections pass.',
    },
    sections: [
      {
        id: 'sfi-s1',
        title: 'Site Work Inspections',
        items: [
          sn('sfi001', 'Erosion control / silt fence inspection', ['inspection'],
            'Inspector confirms silt fencing, check dams, and inlet protection are in place before any grading begins.'),
          sn('sfi002', 'Rough grading inspection', ['inspection'],
            'Confirms cut and fill slopes, drainage swales, and stormwater controls are properly established.'),
          sn('sfi003', 'Underground utility locates (811 call)', ['inspection', 'critical'],
            'Not technically an inspection, but legally required before any digging. Must be called 2 business days in advance.'),
          sn('sfi004', 'Septic system installation inspection', ['inspection', 'conditional'],
            'Health department inspector must observe and approve the septic field installation before it is covered.'),
          sn('sfi005', 'Well installation inspection & water test', ['inspection', 'conditional'],
            'Well must be drilled, cased, and water tested before the well can be put into service. Results required before CO.'),
        ],
      },
      {
        id: 'sfi-s2',
        title: 'Foundation Inspections',
        items: [
          sn('sfi006', 'Footing excavation inspection (pre-pour)', ['inspection', 'critical'],
            'Inspector verifies depth, width, soil conditions, and rebar placement before any concrete is poured.'),
          sn('sfi007', 'Foundation wall / stem wall inspection (pre-pour)', ['inspection', 'critical'],
            'Required before pouring foundation walls. Covers forms, rebar, and anchor bolt placement.'),
          sn('sfi008', 'Slab / flatwork inspection (pre-pour)', ['inspection', 'critical'],
            'For slab-on-grade homes — verifies vapor barrier, rebar, and under-slab plumbing before concrete is poured.'),
          sn('sfi009', 'Waterproofing / damp-proofing inspection', ['inspection'],
            'Foundation exterior must be inspected before backfill. Covers membrane, drainage board, and footing drain.'),
          sn('sfi010', 'Backfill inspection', ['inspection'],
            'Some jurisdictions require inspection before foundation walls are backfilled to confirm waterproofing is complete.'),
          sn('sfi011', 'Radon mitigation rough-in inspection', ['inspection', 'conditional'],
            'If radon mitigation is being installed under the slab, the sub-slab piping is inspected before the pour.'),
        ],
      },
    ],
  },

  // ── Phase 3: Framing & Rough-Ins ───────────────────────────────────────────
  permitsFraming: {
    label: '3. Framing & Rough-In Inspections',
    emoji: '🪵',
    desc: 'All rough-in inspections must pass before insulation or drywall can be installed. Nothing gets covered until it\'s inspected.',
    proTip: {
      title: 'The Most Complex Phase',
      text: 'All rough-in inspections must pass before insulation or drywall can be installed. Nothing gets covered until it\'s inspected.',
    },
    sections: [
      {
        id: 'fri-s1',
        title: 'Framing',
        items: [
          sn('fri001', 'Framing inspection', ['inspection', 'critical'],
            'Covers structural members, header sizes, joist sizing, shear walls, hurricane ties, fire blocking, and stair framing. Must pass before insulation.'),
          sn('fri002', 'Shear wall nailing inspection', ['inspection', 'conditional'],
            'In high-wind or seismic zones, the nailing pattern on shear walls may require a separate inspection.'),
          sn('fri003', 'Window & door rough opening inspection', ['inspection'],
            'Verifies openings are correctly sized, headers are adequate, and flashing is in place before exterior cladding.'),
          sn('fri004', 'Roof sheathing inspection', ['inspection'],
            'Nailing schedule on roof deck must be verified before roofing felt or shingles are installed.'),
        ],
      },
      {
        id: 'fri-s2',
        title: 'Plumbing Rough-In',
        items: [
          sn('fri005', 'Underground plumbing inspection', ['inspection', 'critical'],
            'All under-slab or underground drain and supply lines must be inspected and pressure tested before concrete is poured or trenches are filled.'),
          sn('fri006', 'Plumbing rough-in inspection', ['inspection', 'critical'],
            'All DWV and supply piping above grade inspected before walls are closed. Includes pressure/air test of all lines.'),
          sn('fri007', 'Gas piping pressure test & inspection', ['inspection', 'conditional'],
            'All gas piping must hold a documented pressure test (typically 10 PSI for 15 minutes) before being covered.'),
        ],
      },
      {
        id: 'fri-s3',
        title: 'Electrical Rough-In',
        items: [
          sn('fri008', 'Electrical service entrance / temporary power inspection', ['inspection'],
            'Temporary power pole and service entrance are inspected before utility company connects power to the site.'),
          sn('fri009', 'Electrical rough-in inspection', ['inspection', 'critical'],
            'All wiring, boxes, and panel rough-in inspected before walls are closed. Covers wire sizing, stapling, nail plates, and box fill.'),
          sn('fri010', 'Low-voltage rough-in inspection', ['inspection', 'conditional'],
            'Some jurisdictions inspect low-voltage wiring (data, audio, security) separately before walls close.'),
        ],
      },
      {
        id: 'fri-s4',
        title: 'Mechanical Rough-In',
        items: [
          sn('fri011', 'HVAC / mechanical rough-in inspection', ['inspection', 'critical'],
            'All ductwork, equipment placement, venting, and gas connections inspected before walls and ceilings are closed.'),
          sn('fri012', 'Fireplace / chimney rough-in inspection', ['inspection', 'conditional'],
            'Factory-built or masonry fireplaces must be inspected before surrounding framing is closed in.'),
          sn('fri013', 'Propane tank placement inspection', ['inspection', 'conditional'],
            'Tank location must meet setback requirements from the structure, property lines, and ignition sources.'),
        ],
      },
    ],
  },

  // ── Phase 4: Insulation & Drywall ──────────────────────────────────────────
  permitsInsDrw: {
    label: '4. Insulation & Drywall',
    emoji: '🧱',
    desc: 'Once drywall goes up, everything behind it is hidden permanently. These inspections happen after rough-ins are approved.',
    proTip: {
      title: 'Hidden Forever',
      text: 'These inspections happen after rough-ins are approved and before walls are finished. Once drywall goes up, everything behind it is hidden permanently.',
    },
    sections: [
      {
        id: 'idr-s1',
        title: 'Insulation',
        items: [
          sn('idr001', 'Insulation inspection', ['inspection', 'critical'],
            'Inspector verifies R-values, coverage, installation quality, and vapor retarder placement. Required by Kentucky Energy Code before drywall.'),
          sn('idr002', 'Air sealing inspection', ['inspection'],
            'Some jurisdictions require verification of air sealing at all penetrations, top plates, and rim joists before insulation is installed.'),
          sn('idr003', 'Blower door test (energy code compliance)', ['inspection', 'conditional'],
            'Kentucky Energy Code may require a blower door test to verify the home meets air leakage requirements. Results documented for CO.'),
        ],
      },
      {
        id: 'idr-s2',
        title: 'Drywall',
        items: [
          sn('idr004', 'Drywall nailing / fastener inspection', ['inspection', 'conditional'],
            'Some jurisdictions inspect fastener spacing and board placement before taping and finishing begins.'),
          sn('idr005', 'Fire-rated assembly inspection', ['inspection', 'conditional'],
            'Garage separations and any required fire-rated walls must be inspected to confirm correct board type, thickness, and layer count.'),
          sn('idr006', 'Moisture-resistant backing inspection', ['inspection', 'conditional'],
            'Cement board or approved backer in wet areas (showers, tub surrounds) may be inspected before tile installation.'),
        ],
      },
    ],
  },

  // ── Phase 5: Final Inspections ─────────────────────────────────────────────
  permitsFinals: {
    label: '5. Final Inspections (All Trades)',
    emoji: '✅',
    desc: 'Each trade gets its own final inspection. All must pass before the Certificate of Occupancy inspection is scheduled.',
    proTip: {
      title: 'All Trades Must Sign Off',
      text: 'Each trade gets its own final inspection once all finish work is complete. All must pass before the Certificate of Occupancy inspection is scheduled.',
    },
    sections: [
      {
        id: 'pfl-s1',
        title: 'Building / Structural Final',
        items: [
          sn('pfl001', 'Building final inspection', ['inspection', 'critical'],
            'Covers stairs, handrails, guards, egress windows, smoke & CO detectors, door & window operation, address numbers, and overall code compliance.'),
          sn('pfl002', 'Stair & guardrail inspection', ['inspection', 'critical'],
            'Rise/run dimensions, rail height, baluster spacing (4" sphere rule), and anchorage are all verified.'),
          sn('pfl003', 'Garage door safety inspection', ['inspection'],
            'Auto-reverse feature must be demonstrated to the inspector.'),
          sn('pfl004', 'Smoke & CO detector placement inspection', ['inspection', 'critical'],
            'All detectors must be installed, interconnected, and tested. Inspector verifies locations in every bedroom, outside each sleeping area, and on every level.'),
          sn('pfl005', 'Final grading & drainage inspection', ['inspection', 'critical'],
            'Finished grade must slope away from the foundation (6" drop in first 10 feet). Inspector may also check that site drainage doesn\'t impact adjacent properties.'),
        ],
      },
      {
        id: 'pfl-s2',
        title: 'Plumbing Final',
        items: [
          sn('pfl006', 'Plumbing final inspection', ['inspection', 'critical'],
            'All fixtures tested, water heater inspected (T&P valve piped to drain, proper venting), sewer cleanout accessible, hose bib vacuum breakers in place.'),
          sn('pfl007', 'Backflow preventer / vacuum breaker inspection', ['inspection'],
            'Required on all hose bibs and irrigation connections.'),
          sn('pfl008', 'Water heater inspection', ['inspection', 'critical'],
            'Temperature and pressure relief valve must be piped to within 6" of the floor. Proper venting and seismic strapping (if required) verified.'),
          sn('pfl009', 'Septic system final inspection', ['inspection', 'conditional'],
            'Health department signs off that the system was installed per approved plans and is functioning before CO is issued.'),
          sn('pfl010', 'Well final inspection & water quality test', ['inspection', 'conditional'],
            'Final water test results (bacteria, nitrates, and any locally required parameters) must be on file before CO.'),
        ],
      },
      {
        id: 'pfl-s3',
        title: 'Electrical Final',
        items: [
          sn('pfl011', 'Electrical final inspection', ['inspection', 'critical'],
            'All outlets, fixtures, switches tested. Panel labeled. GFCI and AFCI protection verified. All junction boxes covered.'),
          sn('pfl012', 'GFCI / AFCI verification', ['inspection', 'critical'],
            'Inspector tests representative GFCI and AFCI outlets and breakers. All must trip correctly.'),
          sn('pfl013', 'Electrical service / meter base inspection', ['inspection', 'critical'],
            'Utility company (LG&E/KU in Louisville area) conducts its own inspection before energizing the permanent meter.'),
          sn('pfl014', 'Solar / PV system interconnection inspection', ['inspection', 'conditional'],
            'Utility company and building department both inspect solar installations before the system is energized.'),
          sn('pfl015', 'Generator / transfer switch inspection', ['inspection', 'conditional'],
            'If a whole-home generator is installed, the transfer switch must be inspected before final approval.'),
        ],
      },
      {
        id: 'pfl-s4',
        title: 'Mechanical / HVAC Final',
        items: [
          sn('pfl016', 'Mechanical / HVAC final inspection', ['inspection', 'critical'],
            'System must be operational. Inspector verifies all supply and return grilles are open, exhaust fans vent to exterior, and dryer duct is properly terminated.'),
          sn('pfl017', 'Gas line final inspection', ['inspection', 'conditional'],
            'All gas appliances connected, shut-offs in place, no leaks. Inspector may require a final pressure test.'),
          sn('pfl018', 'Propane system final inspection', ['inspection', 'conditional'],
            'Tank, piping, regulators, and all appliance connections inspected. Gas company may also conduct their own inspection.'),
          sn('pfl019', 'Fireplace / chimney final inspection', ['inspection', 'conditional'],
            'Clearances, cap, spark arrestor, and damper operation verified.'),
          sn('pfl020', 'Exhaust fan termination inspection', ['inspection'],
            'All bathroom exhaust fans must terminate to the exterior — not into the attic. Inspector verifies each one.'),
        ],
      },
    ],
  },

  // ── Phase 6: Certificate of Occupancy & Closeout ───────────────────────────
  permitsCO: {
    label: '6. CO & Closeout',
    emoji: '🏠',
    desc: 'The CO cannot be issued until every trade final is signed off. Do not move in or release final payment before the CO is in hand.',
    proTip: {
      title: 'Do Not Move In Without This',
      text: 'The CO cannot be issued until every trade final is signed off and all documentation is submitted. Do not move in or make final payment before the CO is in hand.',
    },
    sections: [
      {
        id: 'coc-s1',
        title: 'Pre-CO Documentation',
        items: [
          sn('coc001', 'All trade final inspections signed off (building, plumbing, electrical, mechanical)', ['critical'],
            'The building department will not schedule the CO inspection until all trade finals are on record.'),
          sn('coc002', 'Energy code compliance documentation submitted', ['conditional'],
            'Blower door test results, insulation certificates, and window U-factor documentation filed with the building department.'),
          sn('coc003', 'Septic system as-built drawing submitted to health department', ['conditional'],
            'Required in most counties before health department releases their approval for CO.'),
          sn('coc004', 'Well water test results submitted and approved', ['conditional'],
            'Results must meet state drinking water standards. Some counties require submission to the health department.'),
          sn('coc005', 'Special inspection reports submitted (if required)', ['conditional'],
            'Any required third-party special inspections (soils, concrete, structural steel) must be submitted to the building department.'),
          sn('coc006', 'Approved permit card is complete with all inspection signatures', ['critical'],
            'The permit card posted on site must show every required inspection signed off before CO is issued.'),
        ],
      },
      {
        id: 'coc-s2',
        title: 'Certificate of Occupancy Inspection',
        items: [
          sn('coc007', 'CO inspection scheduled with building department', ['inspection', 'critical'],
            'This is the final official inspection. The inspector does a full walk-through of the completed home.'),
          sn('coc008', 'All utilities are connected and operational', ['critical'],
            'Electric, gas, water, and sewer (or septic/well) must all be live and functioning at the time of the CO inspection.'),
          sn('coc009', 'Permanent address numbers are visible from the street', ['critical'],
            'A common CO failure — numbers must be a minimum size and contrasting with the background.'),
          sn('coc010', 'Certificate of Occupancy issued and in hand', ['inspection', 'critical'],
            'This is the legal document that authorizes occupancy. Keep the original in your permanent records.'),
        ],
      },
      {
        id: 'coc-s3',
        title: 'Utility & Authority Closeouts',
        items: [
          sn('coc011', 'Permanent electric meter set and energized by utility', ['conditional'],
            'Utility company (LG&E / KU in Louisville area) sets the permanent meter only after their own service inspection passes.'),
          sn('coc012', 'Natural gas service turned on and pressure tested by utility', ['conditional'],
            'Gas company tests and activates service. Separate from the building department inspection.'),
          sn('coc013', 'Public water service tap and meter installed', ['conditional'],
            'Water district or municipality installs the tap and meter. Separate from building department permitting.'),
          sn('coc014', 'Sewer tap fee paid and connection approved', ['conditional'],
            'MSD (Louisville area) or local sewer authority must approve the connection and collect tap fees before service is active.'),
          sn('coc015', 'Final KPDES / stormwater permit closeout', ['conditional'],
            'Once the site is stabilized (vegetated or permanently paved), the stormwater permit must be formally closed out with the state.'),
        ],
      },
      {
        id: 'coc-s4',
        title: 'Owner Closeout Documents',
        items: [
          s('coc016', 'All permit cards and inspection records received and filed', ['critical']),
          s('coc017', 'Copies of all approved plans and as-builts received from GC', ['critical']),
          s('coc018', 'All trade warranties and equipment manuals received', ['critical']),
          sn('coc019', 'Lien waiver from GC and all subcontractors received before final payment', ['critical'],
            'Do not release final payment without this. A lien waiver from the GC alone is not sufficient — you need waivers from major subs and suppliers.'),
          s('coc020', 'Punch list completed and signed off in writing', ['critical']),
          sn('coc021', 'Homeowner\'s insurance binder in place before CO', ['critical'],
            'Most mortgage lenders require proof of insurance before final draw is released. Have this ready before CO inspection.'),
        ],
      },
    ],
  },
};

// Pre-computed total item counts per checklist key
export const PERMITS_TOTALS = Object.fromEntries(
  Object.entries(PERMITS_CHECKLISTS).map(([key, cl]) => [
    key,
    cl.sections.reduce((sum, sec) => sum + sec.items.length, 0),
  ])
);
