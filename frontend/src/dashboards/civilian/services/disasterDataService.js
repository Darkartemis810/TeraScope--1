/**
 * disasterDataService.js
 * ──────────────────────
 * Fetches REAL disaster data from public APIs (no backend required).
 *
 * Sources:
 *  • USGS Earthquake Feed   — earthquakes M2.5+ in the last 7 days
 *  • NASA EONET             — wildfires, storms, volcanoes, floods
 *  • NWS Alerts             — NOAA weather alerts with polygon geometry
 *  • WeatherAPI.com         — severe weather alerts for user location
 *  • Overpass (OSM)         — real shelters, hospitals, fire stations
 *  • OSRM                   — real driving routes to safety
 */

// ────────────────── distance helpers ──────────────────
const DEG_TO_KM = 111.32;

/** Haversine distance in km */
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Generate a polygon (circle approximation) around a point */
function circlePolygon(lat, lon, radiusKm, points = 32) {
  const coords = [];
  for (let i = 0; i < points; i++) {
    const angle = (2 * Math.PI * i) / points;
    const dLat = (radiusKm / DEG_TO_KM) * Math.cos(angle);
    const dLon =
      (radiusKm / (DEG_TO_KM * Math.cos((lat * Math.PI) / 180))) *
      Math.sin(angle);
    coords.push([lat + dLat, lon + dLon]);
  }
  coords.push(coords[0]); // close the ring
  return coords;
}

// ────────────────── 1. USGS Earthquakes ──────────────────
const USGS_URL =
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson';

export async function fetchUSGSEarthquakes(userLat, userLon, radiusKm = 500) {
  try {
    const res = await fetch(USGS_URL);
    if (!res.ok) throw new Error(`USGS ${res.status}`);
    const data = await res.json();

    return (data.features || [])
      .map((f) => {
        const [lon, lat] = f.geometry.coordinates;
        const p = f.properties;
        return {
          id: f.id,
          lat,
          lon,
          magnitude: p.mag,
          title: p.title || `M${p.mag} Earthquake`,
          place: p.place || '',
          time: p.time ? new Date(p.time).toISOString() : null,
          type: 'EQ',
          severity:
            p.mag >= 7 ? 'extreme' : p.mag >= 5.5 ? 'severe' : 'moderate',
          distance: haversine(userLat, userLon, lat, lon),
        };
      })
      .filter((e) => e.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
  } catch (err) {
    console.error('USGS fetch failed:', err);
    return [];
  }
}

// ────────────────── 2. NASA EONET ──────────────────
const EONET_URL =
  'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=50';

const EONET_TYPE_MAP = {
  Wildfires: 'WF',
  'Severe Storms': 'TC',
  Volcanoes: 'VO',
  Floods: 'FL',
  Landslides: 'LS',
  'Sea and Lake Ice': 'OTHER',
  Earthquakes: 'EQ',
};

export async function fetchEONETEvents(userLat, userLon, radiusKm = 500) {
  try {
    const res = await fetch(EONET_URL);
    if (!res.ok) throw new Error(`EONET ${res.status}`);
    const data = await res.json();

    return (data.events || [])
      .map((ev) => {
        const cat = ev.categories?.[0]?.title || 'Other';
        const geom = ev.geometry?.[ev.geometry.length - 1]; // latest geometry
        if (!geom?.coordinates) return null;
        const [lon, lat] = geom.coordinates;
        return {
          id: ev.id,
          lat,
          lon,
          title: ev.title,
          type: EONET_TYPE_MAP[cat] || 'OTHER',
          category: cat,
          time: geom.date || null,
          severity: 'moderate',
          distance: haversine(userLat, userLon, lat, lon),
        };
      })
      .filter((e) => e && e.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
  } catch (err) {
    console.error('EONET fetch failed:', err);
    return [];
  }
}

// ────────────────── 3. NWS Alert Polygons ──────────────────
export async function fetchNWSAlertPolygons(userLat, userLon) {
  try {
    const res = await fetch(
      `https://api.weather.gov/alerts/active?point=${userLat.toFixed(4)},${userLon.toFixed(4)}`,
      {
        headers: {
          'User-Agent': 'TeraScope Civilian Dashboard (contact@terascope.app)',
        },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();

    return (data.features || [])
      .filter((f) => f.geometry?.type === 'Polygon' && f.geometry?.coordinates)
      .map((f) => ({
        id: f.properties.id || f.id,
        name: f.properties.event || 'Alert Zone',
        headline: f.properties.headline,
        severity: f.properties.severity,
        time: f.properties.effective
          ? timeAgo(new Date(f.properties.effective))
          : 'Unknown',
        // GeoJSON coords are [lon,lat], Leaflet needs [lat,lon]
        coords: f.geometry.coordinates[0].map(([lon, lat]) => [lat, lon]),
      }));
  } catch (err) {
    console.error('NWS polygon fetch failed:', err);
    return [];
  }
}

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)} day(s) ago`;
}

// ────────────────── 4. WeatherAPI Alerts ──────────────────
export async function fetchWeatherAlerts(userLat, userLon) {
  const key = import.meta.env.VITE_WEATHERAPI_KEY;
  if (!key) return [];
  try {
    const res = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${userLat},${userLon}&alerts=yes&aqi=no&days=1`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.alerts?.alert || []).map((a, i) => ({
      id: `wa-${i}`,
      headline: a.headline,
      event: a.event,
      severity: a.severity || 'Moderate',
      desc: a.desc,
      effective: a.effective,
      expires: a.expires,
    }));
  } catch {
    return [];
  }
}

// ────────────────── 5. Generate zones from real disasters ──────────────────

/**
 * Takes a list of nearby disasters and generates Safe / Caution / Danger
 * zone polygons around them. Zone radii are based on disaster type & magnitude.
 */
export function generateRealZones(disasters, userLat, userLon) {
  if (!disasters.length) {
    // No disasters nearby → everything is a safe zone
    return [
      {
        id: 'safe-area',
        type: 'safe',
        label: 'Your area — No active threats',
        coords: circlePolygon(userLat, userLon, 5),
      },
    ];
  }

  const zones = [];
  disasters.forEach((d) => {
    let dangerR, cautionR; // radii in km

    if (d.type === 'EQ') {
      const mag = d.magnitude || 5;
      dangerR = mag >= 7 ? 30 : mag >= 6 ? 15 : mag >= 5 ? 8 : 4;
      cautionR = dangerR * 2;
    } else if (d.type === 'WF') {
      dangerR = 10;
      cautionR = 25;
    } else if (d.type === 'FL') {
      dangerR = 8;
      cautionR = 20;
    } else if (d.type === 'TC') {
      dangerR = 50;
      cautionR = 100;
    } else if (d.type === 'VO') {
      dangerR = 20;
      cautionR = 40;
    } else {
      dangerR = 5;
      cautionR = 12;
    }

    zones.push({
      id: `danger-${d.id}`,
      type: 'danger',
      label: `DANGER — ${d.title}`,
      disasterType: d.type,
      coords: circlePolygon(d.lat, d.lon, dangerR),
    });
    zones.push({
      id: `caution-${d.id}`,
      type: 'caution',
      label: `CAUTION — ${d.title}`,
      disasterType: d.type,
      coords: circlePolygon(d.lat, d.lon, cautionR),
    });
  });

  // If user is outside all caution zones, add a safe zone around them
  const inCautionZone = disasters.some((d) => {
    const mag = d.magnitude || 5;
    const cautionR =
      d.type === 'EQ'
        ? (mag >= 7 ? 60 : mag >= 6 ? 30 : mag >= 5 ? 16 : 8)
        : d.type === 'TC'
        ? 100
        : 25;
    return d.distance <= cautionR;
  });

  if (!inCautionZone) {
    zones.push({
      id: 'safe-user',
      type: 'safe',
      label: 'Your area — Currently safe',
      coords: circlePolygon(userLat, userLon, 3),
    });
  }

  return zones;
}

// ────────────────── 6. Real escape routes via OSRM ──────────────────

/**
 * Generate 3 real driving routes from user's location toward safe directions
 * (away from nearest disaster). Uses the free OSRM demo API.
 */
export async function fetchEscapeRoutes(userLat, userLon, disasters = []) {
  // Determine which direction is danger, and plan routes in other directions
  let dangerBearing = null;
  if (disasters.length > 0) {
    const nearest = disasters[0]; // already sorted by distance
    dangerBearing = bearing(userLat, userLon, nearest.lat, nearest.lon);
  }

  // Generate 3 destination points ~15km away in safe directions
  const safeAngles = dangerBearing != null
    ? [dangerBearing + 150, dangerBearing + 180, dangerBearing + 210] // opposite + flanks
    : [0, 120, 240]; // no danger → 3 evenly spaced directions

  const destinations = safeAngles.map((angle, i) => {
    const rads = (angle * Math.PI) / 180;
    const dist = 15; // km
    return {
      id: `route-${i + 1}`,
      lat: userLat + (dist / DEG_TO_KM) * Math.cos(rads),
      lon:
        userLon +
        (dist / (DEG_TO_KM * Math.cos((userLat * Math.PI) / 180))) *
          Math.sin(rads),
    };
  });

  const routes = [];

  for (const dest of destinations) {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${userLon},${userLat};${dest.lon},${dest.lat}?overview=full&geometries=geojson&alternatives=false`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      const route = data.routes?.[0];
      if (!route) continue;

      // Check if route passes through a danger zone
      const coords = route.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
      const passesThrough = disasters.some((d) => {
        const dangerR =
          d.type === 'EQ'
            ? (d.magnitude >= 7 ? 30 : d.magnitude >= 6 ? 15 : 8)
            : d.type === 'TC'
            ? 50
            : 10;
        return coords.some(
          ([lt, ln]) => haversine(lt, ln, d.lat, d.lon) < dangerR
        );
      });

      const dirLabel = compassDirection(
        bearing(userLat, userLon, dest.lat, dest.lon)
      );
      const distKm = (route.distance / 1000).toFixed(1);
      const durMin = Math.round(route.duration / 60);

      routes.push({
        id: dest.id,
        label: `Route ${routes.length + 1} — ${dirLabel} (${distKm}km, ~${durMin}min)`,
        status: passesThrough ? 'blocked' : 'clear',
        path: coords,
        distance: distKm,
        duration: durMin,
      });
    } catch (err) {
      console.warn('OSRM route failed:', err);
    }
  }

  return routes;
}

function bearing(lat1, lon1, lat2, lon2) {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(dLon);
  return (((Math.atan2(y, x) * 180) / Math.PI) + 360) % 360;
}

function compassDirection(deg) {
  const dirs = ['North', 'NE', 'East', 'SE', 'South', 'SW', 'West', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

// ────────────────── 7. Real shelters via Overpass (OSM) ──────────────────

/**
 * Fetches real shelters, hospitals, fire stations, schools (common emergency
 * shelters) from OpenStreetMap via Overpass API within a radius of the user.
 */
export async function fetchRealShelters(userLat, userLon, radiusMeters = 10000) {
  const query = `
    [out:json][timeout:15];
    (
      node["amenity"="shelter"](around:${radiusMeters},${userLat},${userLon});
      node["emergency"="assembly_point"](around:${radiusMeters},${userLat},${userLon});
      node["amenity"="hospital"](around:${radiusMeters},${userLat},${userLon});
      node["amenity"="fire_station"](around:${radiusMeters},${userLat},${userLon});
      node["amenity"="community_centre"](around:${radiusMeters},${userLat},${userLon});
      node["amenity"="place_of_worship"](around:${radiusMeters},${userLat},${userLon});
      node["amenity"="school"](around:${radiusMeters},${userLat},${userLon});
      way["amenity"="hospital"](around:${radiusMeters},${userLat},${userLon});
      way["amenity"="school"](around:${radiusMeters},${userLat},${userLon});
    );
    out center 50;
  `;

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    if (!res.ok) throw new Error(`Overpass ${res.status}`);
    const data = await res.json();

    return (data.elements || [])
      .map((el, idx) => {
        const lat = el.lat || el.center?.lat;
        const lon = el.lon || el.center?.lon;
        if (!lat || !lon) return null;

        const tags = el.tags || {};
        const amenity = tags.amenity || tags.emergency || '';
        const name = tags.name || tags['name:en'] || amenityLabel(amenity);
        const address =
          [tags['addr:street'], tags['addr:housenumber'], tags['addr:city']]
            .filter(Boolean)
            .join(', ') || `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`;

        let type = 'general';
        if (amenity === 'hospital' || amenity === 'clinic') type = 'medical';
        else if (tags.pets === 'yes' || tags.dog === 'yes') type = 'pet-friendly';

        return {
          id: el.id || idx,
          name,
          address,
          lat,
          lon,
          type,
          amenity,
          distance: haversine(userLat, userLon, lat, lon),
          phone: tags.phone || tags['contact:phone'] || null,
          capacity: tags.capacity ? parseInt(tags.capacity) : null,
          open: true,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 25); // limit to nearest 25
  } catch (err) {
    console.error('Overpass fetch failed:', err);
    return [];
  }
}

function amenityLabel(amenity) {
  const labels = {
    shelter: 'Emergency Shelter',
    assembly_point: 'Assembly Point',
    hospital: 'Hospital',
    fire_station: 'Fire Station',
    community_centre: 'Community Center',
    place_of_worship: 'Place of Worship',
    school: 'School (Public Shelter)',
  };
  return labels[amenity] || 'Shelter';
}

// ────────────────── Master fetch: all data at once ──────────────────

/**
 * Fetch all real disaster data for a user location.
 * Returns { disasters, zones, routes, affectedAreas, shelters }.
 */
export async function fetchAllDisasterData(userLat, userLon) {
  // Fetch disasters and shelters in parallel
  const [earthquakes, eonetEvents, alertPolygons, shelters] = await Promise.all(
    [
      fetchUSGSEarthquakes(userLat, userLon, 500),
      fetchEONETEvents(userLat, userLon, 500),
      fetchNWSAlertPolygons(userLat, userLon),
      fetchRealShelters(userLat, userLon, 15000),
    ]
  );

  // Merge all disasters
  const disasters = [...earthquakes, ...eonetEvents].sort(
    (a, b) => a.distance - b.distance
  );

  // Generate zones from real data
  const zones = generateRealZones(disasters, userLat, userLon);

  // Fetch real routes (depends on disasters result)
  const routes = await fetchEscapeRoutes(userLat, userLon, disasters);

  // Use NWS polygon data as affected areas
  const affectedAreas = alertPolygons;

  return { disasters, zones, routes, affectedAreas, shelters };
}
