import { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithRedirect,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';

/**
 * Team-flavored authentication screen at /portal/auth.
 * Same Firebase Auth as AuthScreen but with team framing.
 * On auth complete: creates/updates teamProfiles/{uid} and merges local tokens.
 */
export default function TeamAuthScreen({ tokenStore, user }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // When user becomes authenticated, sync tokens and redirect
  useEffect(() => {
    if (!user?.uid || syncing) return;

    let cancelled = false;
    setSyncing(true);

    (async () => {
      try {
        const profileRef = doc(db, 'teamProfiles', user.uid);
        const existing = await getDoc(profileRef);

        // Merge local tokens into Firestore profile
        const localTokens = tokenStore?.tokens || [];
        const remoteTokens = existing.exists() ? (existing.data().tokens || []) : [];

        const mergedTokens = [...remoteTokens];
        for (const lt of localTokens) {
          if (!mergedTokens.some((rt) => rt.token === lt.token)) {
            mergedTokens.push({
              token: lt.token,
              ownerUid: lt.ownerUid,
              memberId: lt.memberId,
              projectLabel: lt.projectLabel,
              memberRole: lt.memberRole,
              linkedAt: new Date().toISOString(),
            });
          }
        }

        // Create or update team profile
        await setDoc(profileRef, {
          accountType: existing.exists() ? (existing.data().accountType || 'team') : 'team',
          displayName: user.displayName || email || '',
          email: user.email || email || '',
          tokens: mergedTokens,
          updatedAt: new Date().toISOString(),
          ...(!existing.exists() ? { createdAt: new Date().toISOString() } : {}),
        }, { merge: true });

        // Link each local token to this uid in shareTokens
        for (const lt of localTokens) {
          try {
            await setDoc(doc(db, 'shareTokens', lt.token), {
              linkedToUid: user.uid,
            }, { merge: true });
          } catch { /* non-critical */ }
        }

        if (!cancelled) {
          window.location.href = '/portal';
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to sync your account. Please try again.');
          setSyncing(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [user?.uid]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/\(.*\)\.?/, '').trim());
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setLoading(true);
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/\(.*\)\.?/, '').trim());
      setLoading(false);
    }
  }

  // Show syncing state while linking account
  if (syncing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-outline text-sm">
        Syncing your team access…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-on-primary mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-on-surface font-heading">
            Sync Your Team Access
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">Free — no subscription needed</p>
          <p className="text-outline text-xs mt-2 max-w-xs mx-auto">
            Sign in to keep your shared projects accessible on any device.
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-outline-variant p-8">
          <h2 className="text-xl font-semibold text-on-surface mb-6">
            {mode === 'login' ? 'Sign in' : 'Create free account'}
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-outline-variant rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-surface"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full border border-outline-variant rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-surface"
                placeholder="At least 6 characters"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary rounded-xl py-2.5 text-sm font-medium hover:bg-primary-dim transition-colors disabled:opacity-50"
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Free Account'}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-outline-variant" />
            <span className="text-xs text-outline">or</span>
            <div className="flex-1 h-px bg-outline-variant" />
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 border border-outline-variant rounded-xl py-2.5 text-sm font-medium text-on-surface hover:bg-surface transition-colors disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-outline">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
              className="text-primary font-medium hover:underline"
            >
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>

        <div className="text-center mt-4 space-y-2">
          <a href="/portal" className="text-xs text-primary hover:underline">
            ← Back to projects
          </a>
          <p className="text-xs text-outline">
            Want your own planning account?{' '}
            <a href="/" className="text-primary hover:underline">
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
