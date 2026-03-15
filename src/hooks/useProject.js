import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const DEFAULT_PROJECT = {
  properties: [],
  homeDesign: {},
  budget: { items: [], total: 0 },
  timeline: { milestones: [] },
  changeOrders: [],
  paymentSchedule: [],
  dashboardPrefs: {
    statCards: ['properties', 'budget', 'timeline', 'checklists'],
    widgets: { timelineWidget: true, quickNav: true, checklistProgress: true },
  },
  keyContacts: {
    contractors: [
      'Architect','Structural Engineer','Geotechnical Engineer','Surveyor','Title 24',
      'Planning Department','Building Department','PGE','Arborist','Contractor',
      'Project Manager','Foundation','Plumbing','Electrical','Low Voltage','HVAC',
      'Insulation','Waterproofing','Roofing','Stucco','Fire Protection','Fireplace',
      'Drywall','Cabinets','Counter Top Installation','Tile Installation',
      'Stair / Railings','Hardwood Floor Installation','Carpet Installation',
      'Garage Door','Glass','Paint','Appliance Installation','Landscaping',
    ].map((trade) => ({ id: trade.toLowerCase().replace(/[^a-z0-9]/g, '_'), trade, company: '', name: '', phone: '', email: '', web: '' })),
    distributors: [
      'Appliances','Windows','Exterior Doors','Interior Doors','Plumbing Products',
      'Electrical Products','Millwork','Fireplace','Home Automation','Tile','Stone',
      'Carpet','Hardwood','Garage Door','Finish Hardware','Hardscape','Landscape','Paint',
    ].map((trade) => ({ id: trade.toLowerCase().replace(/[^a-z0-9]/g, '_'), trade, company: '', name: '', phone: '', email: '', web: '' })),
  },
  punchList: [],
  communicationLog: [],
  todos: [],
  lienWaivers: [],
  team: [],
  checklists: {
    landEvaluation: [
      { id: 1, text: 'Check zoning / AG exemptions', done: false },
      { id: 2, text: 'Verify road frontage / easements', done: false },
      { id: 3, text: 'Get perc test done', done: false },
      { id: 4, text: 'Check flood zone / FEMA maps', done: false },
      { id: 5, text: 'Confirm utilities availability', done: false },
      { id: 6, text: 'Order survey', done: false },
      { id: 7, text: 'Check deed restrictions / covenants', done: false },
      { id: 8, text: 'Confirm mineral rights included', done: false },
    ],
    permits: [
      { id: 1, text: 'Apply for building permit', done: false },
      { id: 2, text: 'Get septic/perc permit', done: false },
      { id: 3, text: 'Apply for driveway permit', done: false },
      { id: 4, text: 'Schedule rough-in inspections', done: false },
      { id: 5, text: 'Schedule final inspection', done: false },
    ],
    contractor: [],
  },
};

export function useProject(uid) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveTimerRef = useRef(null);

  // Load project on mount
  useEffect(() => {
    if (!uid) return;
    const ref = doc(db, 'users', uid, 'project', 'data');
    getDoc(ref).then((snap) => {
      if (snap.exists()) {
        setProject({ ...DEFAULT_PROJECT, ...snap.data() });
      } else {
        setProject(DEFAULT_PROJECT);
      }
      setLoading(false);
    });
  }, [uid]);

  const saveProject = useCallback(
    (updated) => {
      if (!uid) return;
      setSaving(true);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        const ref = doc(db, 'users', uid, 'project', 'data');
        setDoc(ref, updated, { merge: true })
          .catch(console.error)
          .finally(() => setSaving(false));
      }, 800);
    },
    [uid]
  );

  const updateProject = useCallback(
    (patch) => {
      setProject((prev) => {
        const updated = { ...prev, ...patch };
        saveProject(updated);
        return updated;
      });
    },
    [saveProject]
  );

  return { project, loading, updateProject, saving };
}
