const functions = require('firebase-functions');

exports.getCommuteTime = functions.https.onCall(async (data) => {
  const { originLat, originLon, destAddress, destLat, destLon } = data;

  if (originLat == null || originLon == null) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Origin coordinates are required'
    );
  }
  if (!destAddress && (destLat == null || destLon == null)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Destination address or coordinates are required'
    );
  }

  const apiKey = process.env.GOOGLE_ROUTES_API_KEY;
  if (!apiKey) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Google Routes API key not configured'
    );
  }

  // Build destination waypoint — prefer coords, fall back to address string
  const destination =
    destLat != null && destLon != null
      ? { waypoint: { location: { latLng: { latitude: destLat, longitude: destLon } } } }
      : { waypoint: { address: destAddress } };

  const url =
    'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix';

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask':
        'originIndex,destinationIndex,duration,distanceMeters,condition',
    },
    body: JSON.stringify({
      origins: [
        {
          waypoint: {
            location: {
              latLng: { latitude: originLat, longitude: originLon },
            },
          },
          routeModifiers: {
            avoidFerries: false,
            avoidHighways: false,
            avoidTolls: false,
          },
        },
      ],
      destinations: [destination],
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_AWARE',
    }),
  });

  if (!res.ok) {
    throw new functions.https.HttpsError('unavailable', 'Google Routes API error');
  }

  const json = await res.json();
  const route = Array.isArray(json) ? json[0] : json;

  if (!route || route.condition === 'ROUTE_NOT_FOUND') {
    return { commuteMinutes: null, distanceMiles: null };
  }

  // Duration comes as "1234s"
  const durationStr = route.duration || '0s';
  const durationSeconds = parseInt(durationStr.replace('s', ''), 10) || 0;
  const commuteMinutes = Math.round(durationSeconds / 60);

  // Distance in meters → miles
  const distanceMeters = route.distanceMeters || 0;
  const distanceMiles =
    Math.round((distanceMeters / 1609.344) * 10) / 10;

  return { commuteMinutes, distanceMiles };
});
