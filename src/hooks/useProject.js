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
    contractor: [
      { id: 1, text: 'Verify license & insurance', done: false },
      { id: 2, text: 'Get 3+ bids', done: false },
      { id: 3, text: 'Sign detailed contract', done: false },
      { id: 4, text: 'Confirm draw schedule', done: false },
      { id: 5, text: 'Set weekly check-in cadence', done: false },
    ],
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
