import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Users, Heart, Dog, Search, Navigation, Loader, RefreshCcw, Building2 } from 'lucide-react';
import { fetchRealShelters } from '../services/disasterDataService';

/* ── amenity → type mapping ── */
const amenityToType = (amenity, tags = {}) => {
  if (amenity === 'hospital' || amenity === 'clinic' || amenity === 'doctors') return 'medical';
  if (tags.emergency === 'shelter' || tags.amenity === 'social_facility' || amenity === 'shelter') return 'pet-friendly';
  return 'general';
};

const TYPE_CONFIG = {
  general: { label: 'General', icon: Users, color: 'text-plasma' },
  medical: { label: 'Medical', icon: Heart, color: 'text-alert-red' },
  'pet-friendly': { label: 'Pet-Friendly', icon: Dog, color: 'text-alert-orange' },
};

const ShelterInfo = ({ userLocation }) => {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const lat = userLocation?.lat;
  const lon = userLocation?.lon;

  const loadShelters = useCallback(async () => {
    if (!lat || !lon) return;
    setLoading(true);
    setError(null);
    try {
      const raw = await fetchRealShelters(lat, lon, 15000); // 15 km radius
      const mapped = raw.map((s, i) => ({
        id: s.id ?? i,
        name: s.name || s.tags?.name || 'Emergency Shelter',
        address: s.address || [s.tags?.['addr:street'], s.tags?.['addr:city']].filter(Boolean).join(', ') || 'Address via OpenStreetMap',
        capacity: s.capacity || null,
        distance: s.distance ?? null,
        type: amenityToType(s.amenity, s.tags),
        phone: s.phone || s.tags?.phone || s.tags?.['contact:phone'] || null,
        lat: s.lat,
        lon: s.lon,
        open: true,
      }));
      setShelters(mapped);
    } catch (err) {
      console.error('Shelter fetch failed:', err);
      setError('Could not load shelter data. Overpass API may be temporarily busy.');
    } finally {
      setLoading(false);
    }
  }, [lat, lon]);

  useEffect(() => { loadShelters(); }, [loadShelters]);

  const filtered = shelters
    .filter(s => filter === 'all' || s.type === filter)
    .filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.address.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));

  return (
    <div className="bg-graphite rounded-2xl p-5 border border-ghost/10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-sora font-semibold text-ghost flex items-center gap-2">
          <MapPin className="w-5 h-5 text-plasma" /> Nearby Shelters
          {loading && <Loader className="w-3.5 h-3.5 text-plasma animate-spin ml-1" />}
        </h2>
        <div className="flex items-center gap-2">
          {!loading && <span className="text-xs font-mono text-ghost/40">{filtered.length} found</span>}
          <button onClick={loadShelters} disabled={loading}
            className="p-1 hover:bg-ghost/10 rounded-lg transition-colors disabled:opacity-40"
            aria-label="Refresh shelters">
            <RefreshCcw className={`w-3.5 h-3.5 text-ghost/30 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ghost/30" />
          <input
            type="text" placeholder="Search shelters..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-void border border-ghost/10 text-sm font-mono text-ghost focus:border-plasma/50 focus:outline-none transition-colors"
            aria-label="Search shelters"
          />
        </div>
        <div className="flex gap-1">
          {['all', 'general', 'medical', 'pet-friendly'].map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-semibold uppercase transition-all ${filter === t ? 'bg-plasma/20 text-plasma border border-plasma/30' : 'bg-void text-ghost/40 border border-ghost/10 hover:border-ghost/20'}`}
              aria-pressed={filter === t}>
              {t === 'all' ? 'All' : TYPE_CONFIG[t]?.label || t}
            </button>
          ))}
        </div>
      </div>

      {/* Shelter Cards */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
        {loading && shelters.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-ghost/30">
            <Loader className="w-6 h-6 animate-spin text-plasma" />
            <span className="text-sm font-mono">Fetching nearby shelters via OpenStreetMap…</span>
          </div>
        )}
        {error && (
          <p className="text-center text-alert-red font-mono text-xs py-8 px-4">{error}</p>
        )}
        {!loading && !error && filtered.length === 0 && (
          <p className="text-center text-ghost/30 font-mono text-sm py-8">No shelters found within 15 km.</p>
        )}
        {filtered.map(shelter => {
          const tc = TYPE_CONFIG[shelter.type];
          const TypeIcon = tc?.icon || Building2;

          return (
            <div key={shelter.id} className="bg-void rounded-xl p-4 border border-ghost/5 hover:border-plasma/20 transition-all group">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TypeIcon className={`w-4 h-4 ${tc?.color || 'text-ghost/50'}`} />
                  <h3 className="text-sm font-sora font-semibold text-ghost group-hover:text-plasma transition-colors leading-snug">{shelter.name}</h3>
                </div>
                <span className="shrink-0 text-[10px] font-mono px-2 py-0.5 rounded-full bg-alert-green/20 text-alert-green">OPEN</span>
              </div>
              <p className="text-xs font-mono text-ghost/40 mb-2">{shelter.address}</p>
              <div className="flex items-center gap-4 text-[11px] font-mono text-ghost/50">
                {shelter.distance != null && (
                  <span className="flex items-center gap-1">
                    <Navigation className="w-3 h-3" /> {(shelter.distance / 1000).toFixed(1)} km
                  </span>
                )}
                {shelter.capacity && (
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Cap: {shelter.capacity}</span>
                )}
                <span className="text-ghost/25">{tc?.label || 'Shelter'}</span>
              </div>
              <div className="mt-3 flex gap-2">
                {shelter.phone ? (
                  <a href={`tel:${shelter.phone}`}
                    className="flex-1 text-center py-1.5 rounded-lg text-[11px] font-mono font-semibold bg-plasma/10 text-plasma border border-plasma/20 hover:bg-plasma/20 transition-colors"
                    aria-label={`Call ${shelter.name}`}>
                    CALL
                  </a>
                ) : (
                  <span className="flex-1 text-center py-1.5 rounded-lg text-[11px] font-mono text-ghost/20 border border-ghost/5 cursor-not-allowed">NO PHONE</span>
                )}
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${shelter.lat},${shelter.lon}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex-1 text-center py-1.5 rounded-lg text-[11px] font-mono font-semibold bg-ghost/5 text-ghost/60 border border-ghost/10 hover:border-ghost/20 transition-colors"
                  aria-label={`Get directions to ${shelter.name}`}>
                  DIRECTIONS
                </a>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[9px] font-mono text-ghost/15 mt-3 text-right">Source: OpenStreetMap via Overpass API</p>
    </div>
  );
};

export default ShelterInfo;
