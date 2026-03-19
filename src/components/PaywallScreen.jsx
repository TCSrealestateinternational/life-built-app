import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth } from '../firebase';

const FEATURES = [
  'Track every phase of your land-to-home build',
  'Budget manager with real-time totals',
  'Construction timeline & milestone tracker',
  'Change order log with approval workflow',
  'Payment schedule & draw tracking',
  'Document storage & organization',
  'Key contacts directory for your build team',
  'Communication log with your contractor',
  'Lien waiver tracker',
  'Shareable view for family or lenders',
];

export default function PaywallScreen({ user }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubscribe() {
    setError('');
    setLoading(true);
    try {
      const functions = getFunctions();
      const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
      const result = await createCheckoutSession({ uid: user.uid });
      window.location.href = result.data.url;
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await signOut(auth);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-forest text-white mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <h1
            className="text-3xl font-bold text-ink"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            Waymark Build Planning App
          </h1>
          <p className="text-sage text-sm mt-1">Your land-to-home journey, organized.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-linen p-8">
          <div className="text-center mb-6">
            <span className="inline-block bg-forest/10 text-forest text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
              Full Access
            </span>
            <h2
              className="text-2xl font-bold text-ink mb-1"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              $29<span className="text-base font-normal text-mist">/month</span>
            </h2>
            <p className="text-sm text-mist">Cancel anytime. No long-term commitment.</p>
          </div>

          <ul className="space-y-2 mb-8">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-ink">
                <svg
                  className="shrink-0 mt-0.5 text-forest"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-forest text-white rounded-lg py-3 text-sm font-semibold hover:bg-deep transition-colors disabled:opacity-50"
          >
            {loading ? 'Redirecting to checkout…' : 'Subscribe — $29/month'}
          </button>

          <p className="text-center text-xs text-mist mt-3">
            Secure checkout powered by Stripe
          </p>
        </div>

        <p className="text-center text-xs text-mist mt-4">
          Signed in as {user.email}.{' '}
          <button
            onClick={handleSignOut}
            className="text-forest hover:underline"
          >
            Sign out
          </button>
        </p>
      </div>
    </div>
  );
}
