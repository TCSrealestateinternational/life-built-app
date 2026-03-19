const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Stripe = require('stripe');

admin.initializeApp();
const db = admin.firestore();

// ---------------------------------------------------------------------------
// grandfatherAllUsers  ← TEMPORARY — delete after running once
// GET https://<region>-<project>.cloudfunctions.net/grandfatherAllUsers?secret=waymark2024
// ---------------------------------------------------------------------------
exports.grandfatherAllUsers = functions.https.onRequest(async (req, res) => {
  if (req.query.secret !== 'waymark2024') {
    return res.status(403).send('Forbidden');
  }

  const TEMP_EMAIL = 'jackyloveskentucky@gmail.com';
  const TEMP_UNTIL = new Date('2026-12-31T23:59:59Z');

  let allUsers = [];
  let nextPageToken;
  do {
    const result = await admin.auth().listUsers(1000, nextPageToken);
    allUsers = allUsers.concat(result.users);
    nextPageToken = result.pageToken;
  } while (nextPageToken);

  const results = [];
  for (const user of allUsers) {
    const ref = db.doc(`users/${user.uid}/subscription/data`);
    if (user.email === TEMP_EMAIL) {
      await ref.set({
        grandfathered_until: admin.firestore.Timestamp.fromDate(TEMP_UNTIL),
        grandfathered: false,
        note: 'Temporary grandfather access until end of 2026',
        stamped_at: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      results.push(`[temp] ${user.email}`);
    } else {
      await ref.set({
        grandfathered: true,
        note: 'Early user — permanent free access',
        stamped_at: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      results.push(`[forever] ${user.email ?? user.uid}`);
    }
  }

  res.json({ stamped: results.length, users: results });
});

// ---------------------------------------------------------------------------
// createCheckoutSession
// Called from the frontend via httpsCallable({ uid })
// Returns { url } — frontend redirects to this Stripe Checkout URL
// ---------------------------------------------------------------------------
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  // Require authenticated caller
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be signed in.');
  }

  const uid = context.auth.uid;
  const stripe = new Stripe(functions.config().stripe.secret_key);
  const priceId = functions.config().stripe.price_id;

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: 'https://waymarkbuild.app/?subscribed=true',
    cancel_url: 'https://waymarkbuild.app/',
    metadata: { firebaseUID: uid },
    subscription_data: {
      metadata: { firebaseUID: uid },
    },
  });

  return { url: session.url };
});

// ---------------------------------------------------------------------------
// stripeWebhook
// Raw HTTPS endpoint — Stripe posts signed events here
// ---------------------------------------------------------------------------
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const stripe = new Stripe(functions.config().stripe.secret_key);
  const webhookSecret = functions.config().stripe.webhook_secret;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      req.headers['stripe-signature'],
      webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  async function updateSubscription(firebaseUID, fields) {
    if (!firebaseUID) {
      console.warn('No firebaseUID in metadata — cannot update Firestore.');
      return;
    }
    const ref = db.doc(`users/${firebaseUID}/subscription/data`);
    await ref.set(fields, { merge: true });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const uid = session.metadata?.firebaseUID;
      await updateSubscription(uid, {
        subscription_status: 'active',
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object;
      const uid = sub.metadata?.firebaseUID;
      await updateSubscription(uid, {
        subscription_status: sub.status, // 'active', 'past_due', 'canceled', etc.
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      const uid = sub.metadata?.firebaseUID;
      await updateSubscription(uid, {
        subscription_status: 'canceled',
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });
      break;
    }

    default:
      // Ignore unhandled event types
      break;
  }

  res.json({ received: true });
});
