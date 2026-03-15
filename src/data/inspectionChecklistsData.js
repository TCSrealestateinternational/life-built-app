const s = (id, text) => ({ id, text });

// Shared pro tip shown on Electrical Rough-In (mentions all 3 most-failed inspections)
const PRO_TIP_COMMONLY_FAILED = {
  title: 'Pro Tip: Most Commonly Failed Inspections',
  text: 'The most commonly failed inspections in a new build are framing (improper headers over openings), electrical rough-in (overfilled boxes, missing nail plates), and the CO inspection (grading and drainage). Worth paying extra attention to those.',
};

export const INSPECTION_CHECKLISTS = {

  // ── Plumbing Rough-In ──────────────────────────────────────────────────────
  plumbingRoughIn: {
    label: 'Plumbing Rough-In Inspection',
    emoji: '🔧',
    desc: 'After pipes are run but before walls are closed. Focus is on drainage, venting, and supply lines.',
    proTip: null,
    sections: [
      {
        id: 'plr-s1',
        title: 'Drain, Waste & Vent (DWV)',
        items: [
          s('plr001', 'All drain pipes are correct size and material per code'),
          s('plr002', 'Minimum slope of ¼" per foot maintained on horizontal drain lines'),
          s('plr003', 'All fixtures are properly vented (no trap siphoning risk)'),
          s('plr004', 'Vent pipes extend to correct height above roofline'),
          s('plr005', 'Clean-outs are installed at required locations (base of stacks, direction changes)'),
          s('plr006', 'No double-trapped fixtures or trap-to-trap configurations'),
        ],
      },
      {
        id: 'plr-s2',
        title: 'Supply Lines',
        items: [
          s('plr007', 'Hot and cold supply pipes are correct size and material'),
          s('plr008', 'Pipes are properly secured with hangers at required intervals'),
          s('plr009', 'Water hammer arrestors installed where required (washing machine, dishwasher)'),
          s('plr010', 'Shut-off valves accessible for each fixture group'),
          s('plr011', 'Pipes protected with sleeve where passing through framing to prevent abrasion'),
        ],
      },
      {
        id: 'plr-s3',
        title: 'Pressure & Leak Test',
        items: [
          s('plr012', 'DWV system pressure tested (air or water) and holds without leaks'),
          s('plr013', 'Supply lines pressure tested at 1.5x working pressure minimum'),
          s('plr014', 'All penetrations through fire-rated assemblies are properly fire-stopped'),
          s('plr015', 'No pipes run through structural members without approved notching or boring specs'),
          s('plr016', 'Frost protection measures in place for pipes in exterior walls'),
        ],
      },
    ],
  },

  // ── Electrical Rough-In ───────────────────────────────────────────────────
  electricalRoughIn: {
    label: 'Electrical Rough-In Inspection',
    emoji: '⚡',
    desc: 'After wiring is run but before walls are closed. Covers panel, circuits, and wire routing.',
    proTip: PRO_TIP_COMMONLY_FAILED,
    sections: [
      {
        id: 'elr-s1',
        title: 'Service & Panel',
        items: [
          s('elr001', 'Panel size and amperage matches approved plans'),
          s('elr002', 'Main disconnect accessible and properly labeled'),
          s('elr003', 'Grounding electrode system is complete (ground rod, water pipe bond)'),
          s('elr004', 'Panel is mounted plumb and at correct height for clearance'),
          s('elr005', 'All breakers match wire gauge (no oversized breakers)'),
        ],
      },
      {
        id: 'elr-s2',
        title: 'Branch Circuits',
        items: [
          s('elr006', 'All required dedicated circuits are in place (refrigerator, dishwasher, disposal, HVAC, etc.)'),
          s('elr007', 'Kitchen and bath circuits meet required amperage (20A for countertop circuits)'),
          s('elr008', 'GFCI protection required in all wet areas (kitchens, baths, garage, outdoors, crawlspaces)'),
          s('elr009', 'AFCI protection installed on all required circuits per current code'),
          s('elr010', 'Smoke detector and CO detector circuits are in place per plan'),
        ],
      },
      {
        id: 'elr-s3',
        title: 'Wire Routing & Boxes',
        items: [
          s('elr011', 'Wire gauge matches circuit breaker size throughout'),
          s('elr012', 'Cables properly stapled within 12" of boxes and every 4.5 feet along run'),
          s('elr013', 'All boxes installed at correct height with proper depth for finish wall thickness'),
          s('elr014', 'Cables protected by nail plates where within 1.25" of face of stud'),
          s('elr015', 'Correct number of conductors for each box size (no overfilling)'),
          s('elr016', 'Drilled holes maintain minimum 1.25" edge distance from face of stud'),
        ],
      },
    ],
  },

  // ── HVAC Rough-In ─────────────────────────────────────────────────────────
  hvacRoughIn: {
    label: 'HVAC Rough-In Inspection',
    emoji: '🌡️',
    desc: 'After ductwork and mechanical equipment is set but before walls and ceilings are closed.',
    proTip: null,
    sections: [
      {
        id: 'hvr-s1',
        title: 'Ductwork',
        items: [
          s('hvr001', 'Duct sizes match HVAC load calculation for each room'),
          s('hvr002', 'Supply and return ducts are properly sealed with mastic or UL-listed tape (not standard duct tape)'),
          s('hvr003', 'All flex duct runs are as straight and short as possible — no sharp kinks'),
          s('hvr004', 'Ducts in unconditioned spaces are properly insulated'),
          s('hvr005', 'Return air path is adequate — no closed-off rooms without undercut or transfer grilles'),
        ],
      },
      {
        id: 'hvr-s2',
        title: 'Equipment & Venting',
        items: [
          s('hvr006', 'Furnace and air handler are correctly sized per Manual J load calculation'),
          s('hvr007', 'All combustion appliances have proper flue/venting to exterior'),
          s('hvr008', 'Venting materials and clearances match equipment manufacturer specs'),
          s('hvr009', 'Combustion air supply is adequate for fuel-burning equipment'),
          s('hvr010', 'Condensate drain is properly routed and not blocked'),
        ],
      },
      {
        id: 'hvr-s3',
        title: 'Gas Lines',
        items: [
          s('hvr011', 'Gas pipe sizing meets demand load for all appliances'),
          s('hvr012', 'Gas piping is properly supported and protected'),
          s('hvr013', 'Gas pressure test performed and documented (typically 10 PSI for 15 minutes)'),
          s('hvr014', 'Shutoff valves present at each appliance'),
          s('hvr015', 'CSST bonding requirements met where applicable'),
        ],
      },
    ],
  },

  // ── Insulation ────────────────────────────────────────────────────────────
  insulationInspection: {
    label: 'Insulation Inspection',
    emoji: '🧱',
    desc: 'Before drywall is installed. Verifies thermal and vapor control performance.',
    proTip: null,
    sections: [
      {
        id: 'ins-s1',
        title: 'R-Value & Coverage',
        items: [
          s('ins001', 'Insulation type and R-value meets or exceeds local energy code requirements'),
          s('ins002', 'Exterior walls fully covered with no voids, gaps, or compression'),
          s('ins003', 'Attic insulation depth meets required R-value (often R-49 to R-60 in Kentucky)'),
          s('ins004', 'Insulation installed in all floor cavities over unconditioned spaces'),
          s('ins005', 'Bonus rooms and knee walls properly insulated on all conditioned surfaces'),
        ],
      },
      {
        id: 'ins-s2',
        title: 'Installation Quality',
        items: [
          s('ins006', 'Batts are cut to fit around wiring and pipes — not compressed over them'),
          s('ins007', 'No gaps around window and door framing'),
          s('ins008', 'Recessed lights in conditioned ceilings are IC-rated and air-sealed'),
          s('ins009', 'Blocking and baffles installed at eaves to maintain ventilation channel above insulation'),
          s('ins010', 'All penetrations (pipes, wires, ducts) through top plates are caulked or foamed before insulation'),
        ],
      },
      {
        id: 'ins-s3',
        title: 'Vapor & Air Control',
        items: [
          s('ins011', 'Vapor retarder is on the correct side of the assembly per climate zone'),
          s('ins012', 'House wrap or weather-resistive barrier is intact and properly lapped'),
          s('ins013', 'Band joists and rim boards are insulated and air-sealed'),
          s('ins014', 'All attic bypasses are sealed (interior wall tops, plumbing chases, etc.)'),
          s('ins015', 'Spray foam properly applied in all rim joist areas if used'),
        ],
      },
    ],
  },

  // ── Drywall / Wallboard ───────────────────────────────────────────────────
  drywallInspection: {
    label: 'Drywall / Wallboard Inspection',
    emoji: '🔲',
    desc: 'Not required in all jurisdictions. Focuses on fire-rated assemblies and structural backing.',
    proTip: null,
    sections: [
      {
        id: 'drw-s1',
        title: 'Fire-Rated Assemblies',
        items: [
          s('drw001', 'Correct drywall type installed in fire-rated assemblies (5/8" Type X where required)'),
          s('drw002', 'Garage-to-living-space walls and ceilings are fully covered with fire-rated board'),
          s('drw003', 'Furnace room walls meet fire separation requirements'),
          s('drw004', 'No penetrations left unprotected in fire-rated walls'),
          s('drw005', 'Layer count and fastener pattern matches approved fire assembly'),
        ],
      },
      {
        id: 'drw-s2',
        title: 'Moisture-Resistant Areas',
        items: [
          s('drw006', 'Cement board or moisture-resistant backing used in shower and tub surrounds'),
          s('drw007', 'Moisture-resistant drywall in all bathrooms, laundry, and kitchens'),
          s('drw008', 'Backing boards installed behind tile at required height'),
          s('drw009', 'No standard drywall installed on shower or tub walls'),
        ],
      },
      {
        id: 'drw-s3',
        title: 'General Installation',
        items: [
          s('drw010', 'Drywall properly fastened (screw spacing meets code — typically 12" on ceiling, 16" on walls)'),
          s('drw011', 'Blocking in place at all required backing locations (grab bars, cabinets, heavy fixtures)'),
          s('drw012', 'Attic and crawlspace access openings are fire-rated where required'),
          s('drw013', 'All ceiling drywall rated for ceiling application where code requires'),
        ],
      },
    ],
  },

  // ── Final Inspections (All Trades) ────────────────────────────────────────
  finalInspections: {
    label: 'Final Inspections (All Trades)',
    emoji: '✅',
    desc: 'Conducted once construction is substantially complete. Each trade gets its own final sign-off.',
    proTip: null,
    sections: [
      {
        id: 'fin-s1',
        title: 'Plumbing Final',
        items: [
          s('fin001', 'All fixtures installed, properly sealed, and functioning'),
          s('fin002', 'Water heater is correct capacity, properly vented, and has pressure relief valve piped to drain'),
          s('fin003', 'All supply lines are on and system is tested for leaks under normal pressure'),
          s('fin004', 'Sewer cleanout accessible and capped'),
          s('fin005', 'All hose bibs have vacuum breakers'),
          s('fin006', 'Dishwasher drain has high loop or air gap'),
        ],
      },
      {
        id: 'fin-s2',
        title: 'Electrical Final',
        items: [
          s('fin007', 'All outlets, switches, and fixtures installed and working'),
          s('fin008', 'Panel labeled completely and accurately'),
          s('fin009', 'All GFCI and AFCI outlets/breakers tested and verified'),
          s('fin010', 'Smoke detectors in every bedroom, outside each sleeping area, and on every floor'),
          s('fin011', 'CO detectors installed within 15 feet of each sleeping area'),
          s('fin012', 'Exterior outlets are weatherproof and GFCI protected'),
          s('fin013', 'All junction boxes covered — none left open in attic, basement, or walls'),
        ],
      },
      {
        id: 'fin-s3',
        title: 'HVAC Final',
        items: [
          s('fin014', 'System is operational and achieves design temperature in all rooms'),
          s('fin015', 'All supply and return grilles installed and open'),
          s('fin016', 'Filters installed and accessible'),
          s('fin017', 'Exhaust fans in all baths vented to exterior (not into attic)'),
          s('fin018', 'Range hood vented to exterior or recirculating filter installed'),
          s('fin019', 'Dryer duct is rigid metal (or approved flex), properly terminated at exterior'),
        ],
      },
      {
        id: 'fin-s4',
        title: 'Building / Structural Final',
        items: [
          s('fin020', 'Stairs meet all rise/run requirements (max 7-3/4" rise, min 10" run)'),
          s('fin021', 'All guardrails and handrails are at correct height and properly secured'),
          s('fin022', 'Balusters are spaced so a 4" sphere cannot pass through'),
          s('fin023', 'All exterior doors and windows operate properly and are weather-sealed'),
          s('fin024', 'Garage door auto-reverse safety feature is operational'),
          s('fin025', 'Attic access is insulated and includes a proper hatch'),
          s('fin026', 'Address numbers are visible from the street'),
        ],
      },
    ],
  },

  // ── Certificate of Occupancy ──────────────────────────────────────────────
  coInspection: {
    label: 'Certificate of Occupancy (CO) Inspection',
    emoji: '🏠',
    desc: 'The final official milestone. Building department confirms the home is safe and legal to occupy.',
    proTip: {
      title: 'Pro Tip: Commonly Failed CO Items',
      text: "Grading and drainage is one of the most commonly failed CO items — verify the final grade slopes away from the foundation (minimum 6\" drop over 10 feet) before this inspection. Also confirm all required documentation is in order so paperwork doesn't hold up your CO.",
    },
    sections: [
      {
        id: 'coi-s1',
        title: 'Life Safety',
        items: [
          s('coi001', 'All smoke and CO detectors are installed, interconnected, and tested'),
          s('coi002', 'Emergency egress windows meet size requirements in all sleeping rooms'),
          s('coi003', 'All stair railings, guards, and balusters are secure and code-compliant'),
          s('coi004', 'Fire separation between garage and living space is intact'),
          s('coi005', 'No open electrical boxes, exposed wiring, or energized unprotected conductors'),
        ],
      },
      {
        id: 'coi-s2',
        title: 'Systems & Utilities',
        items: [
          s('coi006', 'All utilities (electric, gas, water, sewer) are connected and operational'),
          s('coi007', 'Heating system is operational and can maintain minimum temperature'),
          s('coi008', 'Hot water is available at all fixtures'),
          s('coi009', 'All plumbing drains and fixtures are fully functional'),
          s('coi010', 'Meter and service connections have been inspected by utility company'),
        ],
      },
      {
        id: 'coi-s3',
        title: 'Site & Exterior',
        items: [
          s('coi011', 'Final grading slopes away from foundation at minimum 6" drop in 10 feet'),
          s('coi012', 'All site disturbed areas are stabilized (seeded, mulched, or paved)'),
          s('coi013', 'Driveway and walkways complete to a safe and usable standard'),
          s('coi014', 'All required erosion control measures are removed or properly terminated'),
          s('coi015', 'Site drainage does not create issues for adjacent properties'),
        ],
      },
      {
        id: 'coi-s4',
        title: 'Documentation',
        items: [
          s('coi016', 'All required trade final inspections have been signed off'),
          s('coi017', 'Approved permit set (stamped plans) is on site or submitted'),
          s('coi018', 'Energy code compliance documentation is complete (blower door test if required)'),
          s('coi019', 'Any required special inspections or engineering reports are submitted'),
          s('coi020', 'All required certifications (spray foam, radon, etc.) are provided to inspector'),
        ],
      },
    ],
  },
};

// Pre-computed total item counts per checklist key
export const INSPECTION_TOTALS = Object.fromEntries(
  Object.entries(INSPECTION_CHECKLISTS).map(([key, cl]) => [
    key,
    cl.sections.reduce((sum, sec) => sum + sec.items.length, 0),
  ])
);
