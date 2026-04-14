/**
 * grandfather-users.js
 *
 * One-time script: stamps existing users with grandfathered access in Firestore.
 * Uses Firebase CLI cached access token + Firestore REST API (no service account needed).
 *
 * Usage:  node scripts/grandfather-users.js
 *
 * Special case:
 *   jackyloveskentucky@gmail.com → grandfathered_until: 2026-12-31
 *   Crobinson20052002@gmail.com  → grandfathered: true  (forever, Chiffon Robinson)
 *   All other users              → grandfathered: true  (forever)
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'life-built-app';
const TEMP_ACCESS_EMAIL = 'jackyloveskentucky@gmail.com';
const TEMP_ACCESS_UNTIL = '2026-12-31T23:59:59Z';
const PERMANENT_EMAILS = ['crobinson20052002@gmail.com'];
const USERS_FILE = path.join(__dirname, 'users.json');

function getAccessToken() {
  const configPath = path.join(
    process.env.HOME || process.env.USERPROFILE,
    '.config', 'configstore', 'firebase-tools.json'
  );
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const token = config.tokens?.access_token;
  const expiresAt = config.tokens?.expires_at;

  if (!token) {
    console.error('No access token found. Run: firebase login --reauth');
    process.exit(1);
  }
  if (Date.now() > expiresAt) {
    console.error('Access token expired. Run: firebase login --reauth');
    process.exit(1);
  }
  return token;
}

async function patchFirestore(accessToken, uid, fields) {
  const docPath = `users/${uid}/subscription/data`;
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${docPath}`;

  // Build the Firestore document fields
  const firestoreFields = {};
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === 'boolean') {
      firestoreFields[key] = { booleanValue: value };
    } else if (typeof value === 'string') {
      if (key.includes('until') || key.includes('at')) {
        firestoreFields[key] = { timestampValue: value };
      } else {
        firestoreFields[key] = { stringValue: value };
      }
    }
  }

  const body = { fields: firestoreFields };

  const fieldPaths = Object.keys(fields).map(k => `updateMask.fieldPaths=${k}`).join('&');
  const res = await fetch(`${url}?${fieldPaths}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Firestore PATCH failed for ${uid}: ${res.status} ${err}`);
  }
}

async function main() {
  const accessToken = getAccessToken();

  // Read exported users
  const usersData = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  const users = usersData.users;

  console.log(`Found ${users.length} user(s). Stamping…\n`);

  for (const user of users) {
    const email = user.email || '(no email)';
    const uid = user.localId;

    if (PERMANENT_EMAILS.includes(email.toLowerCase())) {
      await patchFirestore(accessToken, uid, {
        grandfathered: true,
        note: 'Permanent free access — grandfathered by owner',
        stamped_at: new Date().toISOString(),
      });
      console.log(`  [forever] ${email} (${uid}) → grandfathered: true (explicit)`);
    } else if (email === TEMP_ACCESS_EMAIL) {
      await patchFirestore(accessToken, uid, {
        grandfathered_until: TEMP_ACCESS_UNTIL,
        grandfathered: false,
        note: 'Temporary grandfather access until end of 2026',
        stamped_at: new Date().toISOString(),
      });
      console.log(`  [temp]    ${email} (${uid}) → grandfathered_until 2026-12-31`);
    } else {
      await patchFirestore(accessToken, uid, {
        grandfathered: true,
        note: 'Early user — permanent free access',
        stamped_at: new Date().toISOString(),
      });
      console.log(`  [forever] ${email} (${uid}) → grandfathered: true`);
    }
  }

  console.log(`\nDone! Stamped ${users.length} user(s).`);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
