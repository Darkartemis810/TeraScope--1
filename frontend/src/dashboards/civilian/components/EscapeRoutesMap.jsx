import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import { Layers, Navigation, Route, AlertTriangle, RefreshCcw, Loader, Activity } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchAllDisasterData } from '../services/disasterDataService';

/* ── Zone colours ── */
const ZONE_COLORS = {
  safe:    { fill: '#34C759', stroke: '#22A849', label: 'Safe Zone' },
  caution: { fill: '#FFCC00', stroke: '#E0B400', label: 'Caution Zone' },
  danger:  { fill: '#FF3B30', stroke: '#CC2F26', label: 'Danger Zone' },
};

/* ── Map recenter ── */
const RecenterMap = ({ lat, lon }) => {
  const map = useMap();
  useEffect(() => { map.setView([lat, lon], 11); }, [lat, lon, map]);
  return null;
};

/* ── Route polylines ── */
const RouteLayers = ({ routes }) => {
  const map = useMap();
  useEffect(() => {
    const layers = routes.map(r => {
      const color = r.status === 'clear' ? '#34C759' : '#FF3B30';
      const line = L.polyline(r.path, {
        color, weight: 5, opacity: 0.85,
        dashArray: r.status === 'blocked' ? '10 8' : undefined,
      });
      line.bindPopup(
        `<div style="font-family:monospace;font-size:12px;color:#fff;background:#12121A;padding:8px;border-radius:8px">
           <b>${r.label}</b><br/>
           ${r.status === 'clear' ? '✅ Clear path' : '🚫 Passes through danger zone'}
           ${r.distance ? `<br/>📍 ${r.distance} km` : ''}
         </div>`
      );
      line.addTo(map);
      return line;
    });
    return () => layers.forEach(l => map.removeLayer(l));
  }, [routes, map]);
  return null;
};

/* ── Disaster markers ── */
const DisasterMarker = ({ d }) => {
  const emoji = d.type === 'EQ' ? '⚡' : d.type === 'WF' ? '🔥' : d.type === 'FL' ? '💧' : d.type === 'TC' ? '🌀' : d.type === 'VO' ? '🌋' : '⚠️';
  const clr = d.severity === 'extreme' ? '#FF3B30' : d.severity === 'severe' ? '#FF9500' : '#FFCC00';

  const icon = L.divIcon({
    className: '',
    html: `<div style="width:24px;height:24px;border-radius:50%;background:${clr}22;border:2px solid ${clr};display:flex;align-items:center;justify-content:center;font-size:11px;box-shadow:0 0 10px ${clr}55">${emoji}</div>`,
    iconSize: [24, 24], iconAnchor: [12, 12],
  });

  return (
    <Marker position={[d.lat, d.lon]} icon={icon}>
      <Popup>
        <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#fff', background: '#12121A', padding: '10px', borderRadius: '10px', minWidth: '190px' }}>
          <b style={{ color: clr }}>{d.title}</b><br />
          {d.magnitude != null && <span>Magnitude: M{d.magnitude.toFixed(1)}<br /></span>}
          {d.place && <span style={{ color: '#999' }}>{d.place}<br /></span>}
          <span>📍 {d.distance.toFixed(1)} km from you</span><br />
          {d.time && <span style={{ color: '#666', fontSize: '10px' }}>{new Date(d.time).toLocaleString()}</span>}
        </div>
      </Popup>
    </Marker>
  );
};

/* ── Main component ── */
const EscapeRoutesMap = ({ userLocation }) => {
  const lat = userLocation?.lat || 28.6139;
  const lon = userLocation?.lon || 77.2090;

  const [mapData, setMapData] = useState({ disasters: [], zones: [], routes: [], affectedAreas: [] });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [showRoutes, setShowRoutes]     = useState(true);
  const [showZones, setShowZones]       = useState(true);
  const [showAffected, setShowAffected] = useState(true);
  const [showMarkers, setShowMarkers]   = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchAllDisasterData(lat, lon);
      setMapData(result);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Map data load failed:', err);
    } finally {
      setLoading(false);
    }
  }, [lat, lon]);

  useEffect(() => { loadData(); }, [loadData]);

  const userIcon = L.divIcon({
    className: '',
    html: `<div style="width:18px;height:18px;border-radius:50%;background:#00E5FF;border:3px solid #fff;box-shadow:0 0 14px rgba(0,229,255,.9)"></div>`,
    iconSize: [18, 18], iconAnchor: [9, 9],
  });

  const { disasters, zones, routes, affectedAreas } = mapData;
  const nearbyDisasters = disasters.filter(d => d.distance < 400);

  return (
    <div className="bg-graphite rounded-2xl border border-ghost/10 overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-ghost/5">
        <h2 className="text-sm font-sora font-semibold text-ghost flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-plasma" />
          Live Disaster Map
          {loading && <Loader className="w-3.5 h-3.5 text-plasma animate-spin ml-1" />}
        </h2>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-[10px] font-mono text-ghost/25">
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button onClick={loadData} disabled={loading}
            className="p-1.5 hover:bg-ghost/10 rounded-lg transition-colors disabled:opacity-40"
            aria-label="Refresh">
            <RefreshCcw className={`w-3.5 h-3.5 text-ghost/40 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Nearby disaster chips ── */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto border-b border-ghost/5 min-h-[38px] items-center" style={{ scrollbarWidth: 'none' }}>
        {nearbyDisasters.length === 0 && !loading && (
          <span className="text-[10px] font-mono text-alert-green flex items-center gap-1">
            ✅ No disaster threats detected within 400 km of your location
          </span>
        )}
        {nearbyDisasters.slice(0, 6).map(d => {
          const clr = d.severity === 'extreme' ? '#FF3B30' : d.severity === 'severe' ? '#FF9500' : '#FFCC00';
          return (
            <span key={d.id}
              className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold"
              style={{ background: `${clr}18`, color: clr, border: `1px solid ${clr}33` }}>
              {d.type === 'EQ' ? '⚡' : d.type === 'WF' ? '🔥' : d.type === 'FL' ? '💧' : d.type === 'TC' ? '🌀' : '⚠️'}
              {d.type === 'EQ' ? ` M${d.magnitude?.toFixed(1)}` : ` ${d.type}`} • {d.distance.toFixed(0)}km
            </span>
          );
        })}
        {loading && <Loader className="w-3.5 h-3.5 text-ghost/30 animate-spin" />}
      </div>

      {/* ── Layer toggles ── */}
      <div className="flex items-center gap-2 p-3 border-b border-ghost/5 flex-wrap">
        <span className="text-xs font-mono text-ghost/40 flex items-center gap-1 mr-1"><Layers className="w-3.5 h-3.5" /> Layers:</span>
        {[
          { key: 'routes',   label: 'Escape Routes', icon: Route,         active: showRoutes,   toggle: () => setShowRoutes(p => !p) },
          { key: 'zones',    label: 'Damage Zones',  icon: AlertTriangle, active: showZones,    toggle: () => setShowZones(p => !p) },
          { key: 'affected', label: 'Alert Areas',   icon: Navigation,    active: showAffected, toggle: () => setShowAffected(p => !p) },
          { key: 'markers',  label: 'Events',        icon: Activity,      active: showMarkers,  toggle: () => setShowMarkers(p => !p) },
        ].map(l => (
          <button key={l.key} onClick={l.toggle}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all ${l.active ? 'bg-plasma/20 text-plasma border border-plasma/30' : 'bg-void text-ghost/30 border border-ghost/10 hover:border-ghost/20'}`}
            aria-pressed={l.active}>
            <l.icon className="w-3 h-3" /> {l.label}
          </button>
        ))}
      </div>

      {/* ── Legend ── */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-ghost/5 flex-wrap">
        {showZones && Object.entries(ZONE_COLORS).map(([k, v]) => (
          <span key={k} className="flex items-center gap-1.5 text-[10px] font-mono text-ghost/40">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: v.fill, opacity: 0.6 }} /> {v.label}
          </span>
        ))}
        {showRoutes && (
          <>
            <span className="flex items-center gap-1.5 text-[10px] font-mono text-ghost/40">
              <span className="inline-block w-5 h-0.5 bg-alert-green" /> Clear
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-mono text-ghost/40">
              <span className="inline-block w-5 h-0.5 bg-alert-red" /> Blocked
            </span>
          </>
        )}
        <span className="ml-auto text-[9px] font-mono text-ghost/20">USGS · EONET · NWS · OSRM</span>
      </div>

      {/* ── Map ── */}
      <div className="h-[450px] md:h-[520px]">
        {loading && !lastUpdated ? (
          <div className="h-full flex flex-col items-center justify-center bg-void/60 gap-3">
            <Loader className="w-8 h-8 text-plasma animate-spin" />
            <p className="text-xs font-mono text-ghost/40">Fetching real-time data…</p>
            <p className="text-[10px] font-mono text-ghost/20">USGS Earthquakes · NASA EONET · NWS Alerts · OpenStreetMap</p>
          </div>
        ) : (
          <MapContainer center={[lat, lon]} zoom={11} className="h-full w-full">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a> | USGS, NASA EONET, NWS'
            />
            <RecenterMap lat={lat} lon={lon} />

            {/* You are here */}
            <Marker position={[lat, lon]} icon={userIcon}>
              <Popup>
                <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#00E5FF', background: '#12121A', padding: '8px', borderRadius: '8px' }}>
                  <b>📍 You are here</b><br />
                  <span style={{ color: '#666', fontSize: '10px' }}>{lat.toFixed(5)}, {lon.toFixed(5)}</span>
                </div>
              </Popup>
            </Marker>

            {/* Zones computed from real disaster positions + magnitudes */}
            {showZones && zones.map(z => (
              <Polygon key={z.id} positions={z.coords}
                pathOptions={{
                  color: ZONE_COLORS[z.type]?.stroke || '#999',
                  fillColor: ZONE_COLORS[z.type]?.fill || '#999',
                  fillOpacity: 0.2, weight: 1.5,
                }}>
                <Popup>
                  <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#fff', background: '#12121A', padding: '8px', borderRadius: '8px', maxWidth: '200px' }}>
                    <b style={{ color: ZONE_COLORS[z.type]?.fill }}>{ZONE_COLORS[z.type]?.label}</b><br />
                    <span style={{ color: '#999' }}>{z.label}</span>
                  </div>
                </Popup>
              </Polygon>
            ))}

            {/* NWS alert polygons */}
            {showAffected && affectedAreas.map(a => (
              <Polygon key={a.id} positions={a.coords}
                pathOptions={{ color: '#FF9500', fillColor: '#FF9500', fillOpacity: 0.15, weight: 2, dashArray: '7 5' }}>
                <Popup>
                  <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#fff', background: '#12121A', padding: '8px', borderRadius: '8px', maxWidth: '220px' }}>
                    <b style={{ color: '#FF9500' }}>⚠️ {a.name}</b><br />
                    {a.headline && <span style={{ color: '#ccc' }}>{a.headline.substring(0, 100)}{a.headline.length > 100 ? '…' : ''}<br /></span>}
                    <span style={{ color: '#666', fontSize: '10px' }}>{a.time}</span>
                  </div>
                </Popup>
              </Polygon>
            ))}

            {/* OSRM real escape routes */}
            {showRoutes && routes.length > 0 && <RouteLayers routes={routes} />}

            {/* USGS + EONET disaster event markers */}
            {showMarkers && nearbyDisasters.map(d => <DisasterMarker key={d.id} d={d} />)}
          </MapContainer>
        )}
      </div>

      {/* ── Routes list ── */}
      {routes.length > 0 && (
        <div className="border-t border-ghost/5 px-4 py-3">
          <h3 className="text-[10px] font-mono text-ghost/30 uppercase mb-2">Real-Time Escape Routes (via OpenStreetMap)</h3>
          <div className="flex flex-col gap-1.5">
            {routes.map(r => (
              <div key={r.id} className="flex items-center gap-2 text-xs font-mono">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${r.status === 'clear' ? 'bg-alert-green' : 'bg-alert-red'}`} />
                <span className="text-ghost/60 flex-1 truncate">{r.label}</span>
                <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full ${r.status === 'clear' ? 'bg-alert-green/15 text-alert-green' : 'bg-alert-red/15 text-alert-red'}`}>
                  {r.status === 'clear' ? 'CLEAR' : 'BLOCKED'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EscapeRoutesMap;
