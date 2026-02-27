import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Activity, LogOut, MapPin, Loader, RefreshCcw } from 'lucide-react';

// Sub-components
import SeverityBanner from './components/SeverityBanner';
import LiveAlerts from './components/LiveAlerts';
import ShelterInfo from './components/ShelterInfo';
import OSINTPanel from './components/OSINTPanel';
import WeatherWidget from './components/WeatherWidget';
import EscapeRoutesMap from './components/EscapeRoutesMap';
import DisasterInfoCards from './components/DisasterInfoCards';
import SOSButton from './components/SOSButton';
import BeforeAfterSliderCivilian from './components/BeforeAfterSliderCivilian';
import CivilianChatbot from './components/CivilianChatbot';

/* ─────────────────────────────────────────────────
   Civilian Dashboard — location-based, mobile-first
   ───────────────────────────────────────────────── */

const CivilianDashboard = () => {
  /* ── User location ── */
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);

  /* ── NWS Alerts (location-scoped) ── */
  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(false);

  /* ── Get user's geolocation ── */
  const requestLocation = useCallback(() => {
    setLocationLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocationLoading(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        // Fallback to a default location (New Delhi)
        setUserLocation({ lat: 28.6139, lon: 77.2090 });
        setLocationError('Could not get your location. Showing default area.');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => { requestLocation(); }, [requestLocation]);

  /* ── Fetch NWS alerts for user's area ── */
  const fetchAlerts = useCallback(async (loc) => {
    if (!loc) return;
    setAlertsLoading(true);
    try {
      // NWS API: get alerts near user location (uses point-based query)
      const res = await fetch(
        `https://api.weather.gov/alerts/active?point=${loc.lat.toFixed(4)},${loc.lon.toFixed(4)}`,
        { headers: { 'User-Agent': 'TeraScope Civilian Dashboard (contact@terascope.app)' } }
      );
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.features || []);
      } else {
        // Fallback: get all active alerts (limited)
        const fallbackRes = await fetch('https://api.weather.gov/alerts/active?limit=10', {
          headers: { 'User-Agent': 'TeraScope Civilian Dashboard' },
        });
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          setAlerts(fallbackData.features?.slice(0, 5) || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
      setAlerts([]);
    } finally {
      setAlertsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchAlerts(userLocation);
      // Refresh alerts every 2 minutes
      const interval = setInterval(() => fetchAlerts(userLocation), 120000);
      return () => clearInterval(interval);
    }
  }, [userLocation, fetchAlerts]);

  /* ── Loading screen ── */
  if (locationLoading) {
    return (
      <div className="min-h-screen bg-void text-ghost flex flex-col items-center justify-center gap-4">
        <Loader className="w-10 h-10 text-plasma animate-spin" />
        <p className="font-mono text-sm text-ghost/50">Detecting your location...</p>
        <p className="font-mono text-xs text-ghost/30">This helps us show alerts and resources near you.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void text-ghost">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 w-full h-14 border-b border-plasma/10 bg-void/90 backdrop-blur-xl z-50 flex items-center px-4 md:px-6"
           role="navigation" aria-label="Civilian dashboard navigation">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-plasma" />
          <span className="font-sora font-bold text-lg tracking-tight text-ghost">TeraScope</span>
          <span className="hidden sm:inline text-[10px] font-mono text-ghost/30 px-2 py-0.5 rounded-full border border-ghost/10 ml-2">CIVILIAN</span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {/* Location indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-ghost/40">
            <MapPin className="w-3 h-3 text-plasma" />
            {userLocation ? `${userLocation.lat.toFixed(2)}°, ${userLocation.lon.toFixed(2)}°` : 'Unknown'}
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-alert-green">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-alert-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-alert-green"></span>
            </span>
            <span className="hidden sm:inline">LIVE</span>
          </div>

          {/* Refresh location */}
          <button onClick={requestLocation} className="p-1.5 hover:bg-ghost/10 rounded-lg transition-colors" aria-label="Refresh location" title="Refresh location">
            <RefreshCcw className="w-4 h-4 text-ghost/30 hover:text-plasma transition-colors" />
          </button>

          <Link to="/" className="text-xs font-mono text-ghost/40 hover:text-ghost transition-colors flex items-center gap-1" aria-label="Exit to landing page">
            <LogOut className="w-3.5 h-3.5" /> EXIT
          </Link>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="pt-16 pb-24 px-3 md:px-6 max-w-[1600px] mx-auto">

        {/* Location error notice */}
        {locationError && (
          <div className="mb-4 px-4 py-2 rounded-xl bg-alert-yellow/10 border border-alert-yellow/20 text-alert-yellow text-xs font-mono flex items-center gap-2">
            <MapPin className="w-4 h-4 shrink-0" /> {locationError}
            <button onClick={requestLocation} className="ml-auto underline hover:no-underline">Retry</button>
          </div>
        )}

        {/* 1. Severity Banner (top) */}
        <section className="mb-5" aria-label="Disaster severity level">
          <SeverityBanner alerts={alerts} />
        </section>

        {/* 2. SOS Button */}
        <section className="mb-5" aria-label="Emergency SOS">
          <SOSButton userLocation={userLocation} />
        </section>

        {/* 3. Live Alerts + Weather (side by side on desktop) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div aria-label="Live alerts feed">
            <LiveAlerts alerts={alerts} />
          </div>
          <div aria-label="Weather conditions">
            <WeatherWidget userLocation={userLocation} />
          </div>
        </section>

        {/* 4. Escape Routes / Damage Map / Affected Areas (combined map) */}
        <section className="mb-5" aria-label="Interactive map with escape routes and damage zones">
          <EscapeRoutesMap userLocation={userLocation} />
        </section>

        {/* 5. Shelters + OSINT (side by side) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div aria-label="Nearby shelter information">
            <ShelterInfo userLocation={userLocation} />
          </div>
          <div aria-label="Community intelligence reports">
            <OSINTPanel />
          </div>
        </section>

        {/* 6. Before/After + Disaster Info */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div aria-label="Before and after imagery comparison">
            <BeforeAfterSliderCivilian />
          </div>
          <div aria-label="Disaster-specific safety guide">
            <DisasterInfoCards />
          </div>
        </section>

      </main>

      {/* 7. AI Chatbot (floating) */}
      <CivilianChatbot userLocation={userLocation} />

      {/* Footer */}
      <footer className="border-t border-ghost/5 py-4 px-6 text-center">
        <p className="text-[10px] font-mono text-ghost/20">
          TeraScope Civilian Safety Dashboard • For emergencies call 911 • Data may be delayed
        </p>
      </footer>
    </div>
  );
};

export default CivilianDashboard;
