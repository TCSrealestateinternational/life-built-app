import { useState, useCallback, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const STORAGE_KEY = 'waymark_team_tokens';

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { return []; }
}

function writeLocal(tokens) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

/**
 * localStorage token manager with optional Firestore sync.
 * Each entry: { token, ownerUid, memberId, projectLabel, memberRole, memberName, lastVisited, storedAt }
 *
 * When `user` is provided and a teamProfile exists, tokens are merged with Firestore.
 */
export function useTokenStore(user) {
  const [tokens, setTokens] = useState(readLocal);
  const [synced, setSynced] = useState(false);

  // Merge Firestore tokens on login
  useEffect(() => {
    if (!user?.uid) { setSynced(false); return; }
    let cancelled = false;

    (async () => {
      try {
        const snap = await getDoc(doc(db, 'teamProfiles', user.uid));
        if (cancelled) return;
        if (snap.exists()) {
          const remote = snap.data().tokens || [];
          setTokens((local) => {
            const merged = [...local];
            for (const rt of remote) {
              if (!merged.some((l) => l.token === rt.token)) {
                merged.push({ ...rt, storedAt: rt.linkedAt || rt.storedAt || new Date().toISOString() });
              }
            }
            writeLocal(merged);
            return merged;
          });
        }
        setSynced(true);
      } catch {
        setSynced(true); // proceed even if sync fails
      }
    })();

    return () => { cancelled = true; };
  }, [user?.uid]);

  const addToken = useCallback((data) => {
    setTokens((prev) => {
      // Deduplicate by token string
      const existing = prev.find((t) => t.token === data.token);
      let next;
      if (existing) {
        next = prev.map((t) =>
          t.token === data.token
            ? { ...t, ...data, lastVisited: new Date().toISOString() }
            : t
        );
      } else {
        next = [...prev, { ...data, storedAt: new Date().toISOString(), lastVisited: new Date().toISOString() }];
      }
      writeLocal(next);
      return next;
    });
  }, []);

  const removeToken = useCallback((tokenStr) => {
    setTokens((prev) => {
      const next = prev.filter((t) => t.token !== tokenStr);
      writeLocal(next);
      return next;
    });
  }, []);

  const refreshToken = useCallback((tokenStr, updates) => {
    setTokens((prev) => {
      const next = prev.map((t) =>
        t.token === tokenStr ? { ...t, ...updates } : t
      );
      writeLocal(next);
      return next;
    });
  }, []);

  // Write to Firestore when tokens change (if user is authed)
  const syncToFirestore = useCallback(async (uid, currentTokens) => {
    if (!uid) return;
    try {
      const firestoreTokens = currentTokens.map((t) => ({
        token: t.token,
        ownerUid: t.ownerUid,
        memberId: t.memberId,
        projectLabel: t.projectLabel,
        memberRole: t.memberRole,
        linkedAt: t.storedAt,
      }));
      await setDoc(doc(db, 'teamProfiles', uid), {
        tokens: firestoreTokens,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch { /* non-critical */ }
  }, []);

  return { tokens, addToken, removeToken, refreshToken, synced, syncToFirestore };
}
