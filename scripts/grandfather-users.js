/**
 * grandfather-users.js
 *
 * One-time script: stamps existing users with grandfathered access in Firestore.
 *
 * Usage:
 *   1. Download your Firebase service account JSON from:
 *      Firebase Console → Project Settings → Service Accounts → Generate new private key
 *   2. Save it as scripts/serviceAccount.json  (already in .gitignore)
 *   3. npm install firebase-admin  (or: node --input-type=module)
 *   4. node scripts/grandfather-users.js
 *
 * Special case:
 *   jackyloveskentucky@gmail.com → grandfathered_until: 2026-12-31
 *   All other users              → grandfathered: true  (forever)
 */

const admin = require('firebase-admin');
const path = require('path');

const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'serviceAccount.json');
const TEMP_ACCESS_EMAIL = 'jackyloveskentucky@gmail.com';
const TEMP_ACCESS_UNTIL = new Date('2026-12-31T23:59:59Z');

async function main() {
  // Initialize Admin SDK with service account
  const serviceAccount = require(SERVICE_ACCOUNT_PATH);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  const db = admin.firestore();
  const auth = admin.auth();

  console.log('Fetching all users from Firebase Auth…');

  let allUsers = [];
  let nextPageToken;

  do {
    const result = await auth.listUsers(1000, nextPageToken);
    allUsers = allUsers.concat(result.users);
    nextPageToken = result.pageToken;
  } while (nextPageToken);

  console.log(`Found ${allUsers.length} user(s). Writing subscription docs…\n`);

  for (const user of allUsers) {
    const ref = db.doc(`users/${user.uid}/subscription/data`);

    if (user.email === TEMP_ACCESS_EMAIL) {
      await ref.set({
        grandfathered_until: admin.firestore.Timestamp.fromDate(TEMP_ACCESS_UNTIL),
        grandfathered: false,
        note: 'Temporary grandfather access until end of 2026',
        stamped_at: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      console.log(`  [temp]    ${user.email} (${user.uid}) → grandfathered_until 2026-12-31`);
    } else {
      await ref.set({
        grandfathered: true,
        note: 'Early user — permanent free access',
        stamped_at: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      console.log(`  [forever] ${user.email ?? '(no email)'} (${user.uid}) → grandfathered: true`);
    }
  }

  console.log('\nDone. All users have been stamped.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
