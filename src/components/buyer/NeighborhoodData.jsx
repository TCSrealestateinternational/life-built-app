import { useState, useEffect, useCallback } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import {
  Footprints, Bus, Bike, Shield, Car, School, ExternalLink, RefreshCw,
  MapPin, Star, Loader2,
} from 'lucide-react';

// ─── Nearby Places categories ───────────────────────────────────────────────

const PLACE_CATEGORIES = [
  { label: 'Grocery', type: 'grocery_store' },
  { label: 'Hospital', type: 'hospital' },
  { label: 'Restaurant', type: 'restaurant' },
  { label: 'Gas Station', type: 'gas_station' },
  { label: 'Pharmacy', type: 'pharmacy' },
  { label: 'Gym', type: 'gym' },
  { label: 'Bank', type: 'bank' },
];

// ─── Score card ──────────────────────────────────────────────────────────────

function ScoreCard({ label, score, icon: Icon, color }) {
  if (score == null) return null;
  return (
    <div className="flex flex-col items-center p-3 bg-surface rounded-xl">
      <Icon size={18} className={`${color} mb-1`} />
      <span className="text-2xl font-bold text-on-surface">{score}</span>
      <span className="text-xs text-outline">{label}</span>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function NeighborhoodData({
  address,
  lat,
  lon,
  commuteDestination,
}) {
  const [walkData, setWalkData] = useState(null);
  const [crimeData, setCrimeData] = useState(null);
  const [commuteData, setCommuteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Nearby Places — keyed by category type
  const [nearbyResults, setNearbyResults] = useState({});   // { grocery_store: [...] }
  const [nearbyLoading, setNearbyLoading] = useState({});    // { grocery_store: true }
  const [nearbyErrors, setNearbyErrors] = useState({});      // { grocery_store: 'msg' }

  const fetchData = useCallback(async () => {
    if (!address || lat == null || lon == null) return;

    setLoading(true);
    setErrors({});
    setWalkData(null);
    setCrimeData(null);
    setCommuteData(null);

    let fns;
    try {
      fns = getFunctions();
    } catch {
      setErrors({ all: 'Firebase Functions not available' });
      setLoading(false);
      return;
    }

    const promises = [];

    // Walk Score
    promises.push(
      httpsCallable(fns, 'getWalkScore')({ address, lat, lon })
        .then((r) => setWalkData(r.data))
        .catch((err) => setErrors((prev) => ({ ...prev, walk: err.message })))
    );

    // Crime Data — extract 2-letter state abbreviation from address
    const stateMatch = address.match(/,\s*([A-Z]{2})\s/);
    if (stateMatch) {
      promises.push(
        httpsCallable(fns, 'getCrimeData')({ stateAbbr: stateMatch[1] })
          .then((r) => setCrimeData(r.data))
          .catch((err) =>
            setErrors((prev) => ({ ...prev, crime: err.message }))
          )
      );
    }

    // Commute — needs a destination address
    if (commuteDestination) {
      promises.push(
        httpsCallable(
          fns,
          'getCommuteTime'
        )({
          originLat: lat,
          originLon: lon,
          destAddress: commuteDestination,
        })
          .then((r) => setCommuteData(r.data))
          .catch((err) =>
            setErrors((prev) => ({ ...prev, commute: err.message }))
          )
      );
    }

    await Promise.allSettled(promises);
    setLoading(false);
  }, [address, lat, lon, commuteDestination]);

  // Toggle a nearby-places category chip
  const toggleCategory = useCallback(async (type) => {
    // If already loaded, remove it (toggle off)
    if (nearbyResults[type]) {
      setNearbyResults((prev) => { const next = { ...prev }; delete next[type]; return next; });
      setNearbyErrors((prev) => { const next = { ...prev }; delete next[type]; return next; });
      return;
    }

    if (lat == null || lon == null) return;

    setNearbyLoading((prev) => ({ ...prev, [type]: true }));
    setNearbyErrors((prev) => { const next = { ...prev }; delete next[type]; return next; });

    try {
      const fns = getFunctions();
      const result = await httpsCallable(fns, 'getNearbyPlaces')({ lat, lon, type });
      setNearbyResults((prev) => ({ ...prev, [type]: result.data.places }));
    } catch (err) {
      setNearbyErrors((prev) => ({ ...prev, [type]: err.message }));
    } finally {
      setNearbyLoading((prev) => { const next = { ...prev }; delete next[type]; return next; });
    }
  }, [lat, lon, nearbyResults]);

  // Auto-fetch when inputs change
  useEffect(() => {
    fetchData();
    // Clear nearby results when address changes
    setNearbyResults({});
    setNearbyLoading({});
    setNearbyErrors({});
  }, [fetchData]);

  // ── Nothing to show yet ────────────────────────────────────────────────────

  if (!address || lat == null || lon == null) {
    return (
      <div className="text-xs text-outline italic py-2">
        Enter an address and map it to see neighborhood data.
      </div>
    );
  }

  // ── All functions unavailable (not deployed yet) ───────────────────────────

  const allFailed = errors.all;

  if (allFailed && !loading) {
    return (
      <div className="text-xs text-outline py-2 space-y-2">
        <p>Neighborhood data functions are not deployed yet.</p>
        <a
          href={`https://www.greatschools.org/search/search.page?q=${encodeURIComponent(address)}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-primary hover:text-primary-dim transition-colors"
        >
          <School size={14} /> View schools on GreatSchools <ExternalLink size={11} />
        </a>
      </div>
    );
  }

  // ── Render data ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Refresh button */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-outline uppercase tracking-wide">
          Neighborhood Data
        </h4>
        <button
          onClick={fetchData}
          disabled={loading}
          className="text-xs text-outline hover:text-primary flex items-center gap-1 transition-colors disabled:opacity-40"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {/* Walk / Transit / Bike Scores */}
      <div>
        <h4 className="text-xs font-medium text-on-surface mb-2">Walkability</h4>
        {loading && !walkData ? (
          <p className="text-xs text-outline animate-pulse">Loading scores…</p>
        ) : walkData ? (
          <div className="grid grid-cols-3 gap-2">
            <ScoreCard label="Walk" score={walkData.walkScore} icon={Footprints} color="text-emerald-500" />
            <ScoreCard label="Transit" score={walkData.transitScore} icon={Bus} color="text-blue-500" />
            <ScoreCard label="Bike" score={walkData.bikeScore} icon={Bike} color="text-amber-500" />
          </div>
        ) : errors.walk ? (
          <p className="text-xs text-outline">Walk score data unavailable</p>
        ) : null}
      </div>

      {/* Safety / Crime */}
      <div>
        <h4 className="text-xs font-medium text-on-surface mb-2">Safety</h4>
        {loading && !crimeData ? (
          <p className="text-xs text-outline animate-pulse">Loading safety data…</p>
        ) : crimeData?.crimeIndex != null ? (
          <div className="flex items-center gap-3">
            <Shield size={18} className="text-outline shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-on-surface font-medium">Crime Index</span>
                <span className="text-outline">
                  {crimeData.crimeIndex}/100 (state level
                  {crimeData.year ? `, ${crimeData.year}` : ''})
                </span>
              </div>
              <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    crimeData.crimeIndex < 30
                      ? 'bg-emerald-500'
                      : crimeData.crimeIndex < 60
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${crimeData.crimeIndex}%` }}
                />
              </div>
              <p className="text-xs text-outline mt-1">
                {crimeData.crimeIndex < 30
                  ? 'Below average crime'
                  : crimeData.crimeIndex < 60
                    ? 'Average crime levels'
                    : 'Above average crime'}
              </p>
            </div>
          </div>
        ) : errors.crime ? (
          <p className="text-xs text-outline">Safety data unavailable</p>
        ) : null}
      </div>

      {/* Commute */}
      {(commuteData || errors.commute || (commuteDestination && loading)) && (
        <div>
          <h4 className="text-xs font-medium text-on-surface mb-2">
            Commute Estimate
          </h4>
          {loading && !commuteData ? (
            <p className="text-xs text-outline animate-pulse">
              Calculating commute…
            </p>
          ) : commuteData?.commuteMinutes != null ? (
            <div className="flex items-center gap-3">
              <Car size={18} className="text-outline shrink-0" />
              <div>
                <span className="text-lg font-bold text-on-surface">
                  {commuteData.commuteMinutes} min
                </span>
                {commuteData.distanceMiles != null && (
                  <span className="text-xs text-outline ml-2">
                    ({commuteData.distanceMiles} mi)
                  </span>
                )}
                <p className="text-xs text-outline">
                  Estimated drive with traffic
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-outline">Commute data unavailable</p>
          )}
        </div>
      )}

      {/* Schools — link out to GreatSchools */}
      <div>
        <h4 className="text-xs font-medium text-on-surface mb-2">Schools</h4>
        <a
          href={`https://www.greatschools.org/search/search.page?q=${encodeURIComponent(address)}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary-dim transition-colors"
        >
          <School size={14} />
          View schools on GreatSchools
          <ExternalLink size={11} />
        </a>
      </div>

      {/* Nearby Places */}
      <div>
        <h4 className="text-xs font-medium text-on-surface mb-2">Nearby Places</h4>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {PLACE_CATEGORIES.map(({ label, type }) => {
            const active = !!nearbyResults[type];
            const busy = !!nearbyLoading[type];
            return (
              <button
                key={type}
                onClick={() => toggleCategory(type)}
                disabled={busy}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  active
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface text-outline hover:text-on-surface'
                } disabled:opacity-50`}
              >
                {busy && <Loader2 size={11} className="animate-spin" />}
                {label}
              </button>
            );
          })}
        </div>

        {/* Results for each active category */}
        {PLACE_CATEGORIES.map(({ label, type }) => {
          const places = nearbyResults[type];
          const error = nearbyErrors[type];
          if (!places && !error) return null;
          return (
            <div key={type} className="mb-3">
              <p className="text-xs font-medium text-outline mb-1">{label}</p>
              {error ? (
                <p className="text-xs text-outline">Could not load {label.toLowerCase()} results</p>
              ) : places.length === 0 ? (
                <p className="text-xs text-outline italic">No {label.toLowerCase()} found nearby</p>
              ) : (
                <ul className="space-y-1.5">
                  {places.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <MapPin size={12} className="text-outline shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="font-medium text-on-surface">{p.name}</span>
                        {p.rating != null && (
                          <span className="inline-flex items-center gap-0.5 ml-1.5 text-amber-500">
                            <Star size={10} fill="currentColor" />
                            {p.rating}
                          </span>
                        )}
                        {p.address && (
                          <p className="text-outline truncate">{p.address}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* Attribution */}
      <p className="text-xs text-outline/60 leading-relaxed">
        Walk Score&reg; data from{' '}
        <a
          href="https://www.walkscore.com"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-outline"
        >
          walkscore.com
        </a>
        . Crime data from FBI UCR. Commute via Google Routes. Nearby places via
        Google.
      </p>
    </div>
  );
}
