const functions = require('firebase-functions');

exports.getNearbyPlaces = functions.https.onCall(async (data) => {
  const { lat, lon, type } = data;

  if (lat == null || lon == null) {
    throw new functions.https.HttpsError('invalid-argument', 'lat and lon are required');
  }
  if (!type) {
    throw new functions.https.HttpsError('invalid-argument', 'type is required');
  }

  const apiKey = process.env.GOOGLE_ROUTES_API_KEY;
  if (!apiKey) {
    throw new functions.https.HttpsError('failed-precondition', 'Google API key not configured');
  }

  const url = 'https://places.googleapis.com/v1/places:searchNearby';

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.displayName,places.rating,places.formattedAddress,places.location,places.types',
    },
    body: JSON.stringify({
      includedTypes: [type],
      locationRestriction: {
        circle: {
          center: { latitude: lat, longitude: lon },
          radiusMeters: 8000,
        },
      },
      maxResultCount: 5,
    }),
  });

  if (!res.ok) {
    throw new functions.https.HttpsError('unavailable', 'Google Places API error');
  }

  const json = await res.json();
  const places = (json.places || []).map((p) => ({
    name: p.displayName?.text || 'Unknown',
    address: p.formattedAddress || '',
    rating: p.rating ?? null,
    types: p.types || [],
  }));

  return { places };
});
