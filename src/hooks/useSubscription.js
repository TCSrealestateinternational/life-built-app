import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export function useSubscription(uid) {
  const [state, setState] = useState({ canAccess: false, loading: true });

  useEffect(() => {
    if (!uid) {
      setState({ canAccess: false, loading: false });
      return;
    }

    const ref = doc(db, 'users', uid, 'subscription', 'data');
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        setState({ canAccess: false, loading: false });
        return;
      }

      const data = snap.data();
      const now = new Date();

      const canAccess =
        data.grandfathered === true ||
        (data.grandfathered_until?.toDate?.() > now) ||
        data.subscription_status === 'active';

      setState({ canAccess, loading: false });
    }, () => {
      // On error, deny access (fail closed)
      setState({ canAccess: false, loading: false });
    });

    return unsubscribe;
  }, [uid]);

  return state;
}
