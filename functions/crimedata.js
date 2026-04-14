const functions = require('firebase-functions');

exports.getCrimeData = functions.https.onCall(async (data) => {
  const { stateAbbr } = data;
  if (!stateAbbr) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'stateAbbr is required'
    );
  }

  const apiKey = process.env.FBI_CRIME_API_KEY;
  if (!apiKey) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'FBI Crime API key not configured'
    );
  }

  const url =
    `https://api.usa.gov/crime/fbi/sapi/api/estimates/states/` +
    `${stateAbbr.toLowerCase()}?api_key=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new functions.https.HttpsError('unavailable', 'FBI Crime API error');
  }

  const json = await res.json();
  const results = json.results ?? [];

  if (results.length === 0) {
    return { crimeIndex: null };
  }

  // Use the most recent year
  const latest = results[results.length - 1];
  const population = latest.population || 1;
  const violentCrime = latest.violent_crime || 0;
  const propertyCrime = latest.property_crime || 0;
  const totalCrime = violentCrime + propertyCrime;
  const perCapita = totalCrime / population;

  // Normalize to 0–100. US average ≈ 0.03 per capita.
  // 0 = no crime, ~50 = average, 100 = very high
  const crimeIndex = Math.min(100, Math.round((perCapita / 0.06) * 100));

  return {
    crimeIndex,
    year: latest.year,
    violentCrime,
    propertyCrime,
    population,
  };
});
