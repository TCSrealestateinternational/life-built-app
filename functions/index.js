const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

// ---------------------------------------------------------------------------
// grandfatherAllUsers  ← TEMPORARY — delete after running once
// GET https://us-central1-life-built-app.cloudfunctions.net/grandfatherAllUsers?secret=waymark2024
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
