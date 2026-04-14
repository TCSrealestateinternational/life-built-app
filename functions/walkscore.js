const functions = require('firebase-functions');

exports.getWalkScore = functions.https.onCall(async (data) => {
  const { address, lat, lon } = data;
  if (!address || lat == null || lon == null) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'address, lat, and lon are required'
    );
  }

  const apiKey = process.env.WALKSCORE_API_KEY;
  if (!apiKey) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Walk Score API key not configured'
    );
  }

  const url =
    `https://api.walkscore.com/score?format=json` +
    `&address=${encodeURIComponent(address)}` +
    `&lat=${lat}&lon=${lon}` +
    `&transit=1&bike=1` +
    `&wsapikey=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new functions.https.HttpsError('unavailable', 'Walk Score API error');
  }

  const json = await res.json();

  return {
    walkScore: json.walkscore ?? null,
    transitScore: json.transit?.score ?? null,
    bikeScore: json.bike?.score ?? null,
    description: json.description ?? '',
  };
});
