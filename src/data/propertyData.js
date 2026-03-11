export const STATUS = {
  considering: {
    label: 'Considering',
    color: 'bg-sky-50 text-sky-600 border-sky-200',
  },
  favorite: {
    label: 'Favorite',
    color: 'bg-amber-50 text-amber-600 border-amber-200',
  },
  'ruled-out': {
    label: 'Ruled Out',
    color: 'bg-red-50 text-red-400 border-red-200',
  },
  'under-contract': {
    label: 'Under Contract',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};

export function normalizeProperty(p) {
  return {
    // legacy fields — preserved as-is
    id: p.id ?? `prop_${Date.now()}`,
    address: p.address ?? '',
    price: p.price ?? '',
    acres: p.acres ?? '',
    notes: p.notes ?? '',
    evaluated: p.evaluated ?? false,
    createdAt: p.createdAt ?? new Date().toISOString(),
    link: p.link ?? '',
    // new top-level fields
    status: p.status ?? 'considering',
    coverPhoto: p.coverPhoto ?? '',
    listingPhotos: p.listingPhotos ?? [],
    lat: p.lat ?? null,
    lon: p.lon ?? null,
    // visits
    visits: p.visits ?? [],
    // decision
    pros: p.pros ?? [],
    cons: p.cons ?? [],
    // location
    schoolDistrict: p.schoolDistrict ?? '',
    schoolRating: p.schoolRating ?? '',
    commuteDestination: p.commuteDestination ?? '',
    floodZone: p.floodZone ?? '',
    zoning: p.zoning ?? '',
    neighborhoodNotes: p.neighborhoodNotes ?? '',
  };
}

export function parseListingUrl(url) {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace('www.', '');

    // Zillow: /homedetails/123-Main-St-City-ST-Zip_zpid/
    if (host.includes('zillow')) {
      const m = u.pathname.match(/\/homedetails\/([^/]+)/);
      if (m) {
        return m[1]
          .replace(/_\d+$/, '')       // remove _zpid suffix
          .replace(/-/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
    }

    // Realtor.com: /realestateandhomes-detail/123-Main-St_City_ST_Zip_MxxxxxxM
    if (host.includes('realtor')) {
      const m = u.pathname.match(/\/realestateandhomes-detail\/([^/?]+)/);
      if (m) {
        return m[1]
          .split('_M')[0]             // strip MLS ID suffix
          .replace(/_/g, ', ')
          .replace(/-/g, ' ')
          .trim();
      }
    }
  } catch {
    // invalid URL — ignore
  }
  return '';
}

export async function geocodeAddress(address) {
  if (!address.trim()) return null;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`,
      { headers: { 'Accept': 'application/json' } }
    );
    const data = await res.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

export function osmEmbedUrl(lat, lon) {
  const d = 0.010;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lon - d},${lat - d},${lon + d},${lat + d}&layer=mapnik&marker=${lat},${lon}`;
}
