import { useState, useEffect } from 'react';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { auth } from '../firebase';

export function useAuth() {
  const [user, setUser] = useState(undefined); // undefined = loading

  useEffect(() => {
    // Completes any pending Google redirect sign-in
    getRedirectResult(auth).catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ?? null);
    });
    return unsubscribe;
  }, []);

  return user;
}
