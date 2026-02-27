import React, { useState, useEffect } from 'react';
import { Cloud, Droplets, Wind, Thermometer, Sun, CloudRain, CloudSnow, CloudLightning, Eye } from 'lucide-react';

/* Map WeatherAPI.com condition text → icon */
const conditionToIcon = (text = '') => {
  const t = text.toLowerCase();
  if (t.includes('thunder') || t.includes('lightning')) return 'Thunderstorm';
  if (t.includes('snow') || t.includes('sleet') || t.includes('blizzard') || t.includes('ice')) return 'Snow';
  if (t.includes('rain') || t.includes('drizzle') || t.includes('shower')) return 'Rain';
  if (t.includes('cloud') || t.includes('overcast') || t.includes('mist') || t.includes('fog')) return 'Clouds';
  if (t.includes('clear') || t.includes('sunny')) return 'Clear';
  return 'Clouds';
};

const WEATHER_ICONS = {
  Clear: Sun,
  Clouds: Cloud,
  Rain: CloudRain,
  Snow: CloudSnow,
  Thunderstorm: CloudLightning,
  Drizzle: CloudRain,
  default: Cloud,
};

const WeatherWidget = ({ userLocation }) => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      const apiKey = import.meta.env.VITE_WEATHERAPI_KEY;
      const lat = userLocation?.lat || 28.6139;
      const lon = userLocation?.lon || 77.2090;

      if (!apiKey) {
        // Fallback mock data when no key
        setWeather({
          temp: 28, feels_like: 31, humidity: 72, wind_speed: 14, visibility: 8,
          condition: 'Clouds', description: 'Partly cloudy', city: 'Your Area'
        });
        setForecast([
          { time: '3 PM', temp: 30, condition: 'Clouds' },
          { time: '6 PM', temp: 27, condition: 'Rain' },
          { time: '9 PM', temp: 24, condition: 'Rain' },
          { time: '12 AM', temp: 22, condition: 'Clouds' },
          { time: '3 AM', temp: 20, condition: 'Clear' },
          { time: '6 AM', temp: 19, condition: 'Clear' },
          { time: '9 AM', temp: 23, condition: 'Clouds' },
          { time: '12 PM', temp: 29, condition: 'Clouds' },
        ]);
        setLoading(false);
        return;
      }

      try {
        // WeatherAPI.com — forecast endpoint returns current + hourly
        const res = await fetch(
          `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&hours=24&aqi=no`
        );
        const data = await res.json();

        if (data.error) throw new Error(data.error.message);

        const cur = data.current;
        setWeather({
          temp: Math.round(cur.temp_c),
          feels_like: Math.round(cur.feelslike_c),
          humidity: cur.humidity,
          wind_speed: Math.round(cur.wind_kph),
          visibility: Math.round(cur.vis_km),
          condition: conditionToIcon(cur.condition?.text),
          description: cur.condition?.text || 'N/A',
          city: data.location?.name || 'Your Area',
        });

        // Hourly forecast from the first forecast day
        const hours = data.forecast?.forecastday?.[0]?.hour || [];
        const nowHour = new Date().getHours();
        // Get next 8 hours starting from current hour
        const upcoming = hours
          .filter(h => new Date(h.time).getHours() >= nowHour)
          .slice(0, 8);

        setForecast(upcoming.map(h => ({
          time: new Date(h.time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
          temp: Math.round(h.temp_c),
          condition: conditionToIcon(h.condition?.text),
        })));
      } catch (err) {
        console.error('WeatherAPI error:', err);
        setError('Weather data unavailable');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 600000); // Refresh every 10 min
    return () => clearInterval(interval);
  }, [userLocation]);

  if (loading) {
    return (
      <div className="bg-graphite rounded-2xl p-5 border border-ghost/10 animate-pulse">
        <div className="h-4 bg-ghost/10 rounded w-32 mb-4"></div>
        <div className="h-12 bg-ghost/5 rounded w-24 mb-4"></div>
        <div className="h-3 bg-ghost/5 rounded w-48"></div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-graphite rounded-2xl p-5 border border-ghost/10">
        <h2 className="text-base font-sora font-semibold text-ghost flex items-center gap-2 mb-2">
          <Cloud className="w-5 h-5 text-plasma" /> Weather
        </h2>
        <p className="text-ghost/40 font-mono text-sm">{error || 'No data'}</p>
      </div>
    );
  }

  const WeatherIcon = WEATHER_ICONS[weather.condition] || WEATHER_ICONS.default;

  return (
    <div className="bg-graphite rounded-2xl p-5 border border-ghost/10" aria-label="Current weather conditions">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-sora font-semibold text-ghost flex items-center gap-2">
          <Cloud className="w-5 h-5 text-plasma" /> Weather
        </h2>
        <span className="text-[10px] font-mono text-ghost/30">{weather.city}</span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <WeatherIcon className="w-12 h-12 text-plasma" />
        <div>
          <div className="text-4xl font-sora font-bold text-ghost">{weather.temp}°C</div>
          <p className="text-xs font-mono text-ghost/50 capitalize">{weather.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-void rounded-xl p-3 text-center">
          <Thermometer className="w-4 h-4 text-alert-orange mx-auto mb-1" />
          <div className="text-xs font-mono text-ghost/40">Feels like</div>
          <div className="text-sm font-sora font-semibold text-ghost">{weather.feels_like}°C</div>
        </div>
        <div className="bg-void rounded-xl p-3 text-center">
          <Wind className="w-4 h-4 text-plasma mx-auto mb-1" />
          <div className="text-xs font-mono text-ghost/40">Wind</div>
          <div className="text-sm font-sora font-semibold text-ghost">{weather.wind_speed} km/h</div>
        </div>
        <div className="bg-void rounded-xl p-3 text-center">
          <Droplets className="w-4 h-4 text-blue-400 mx-auto mb-1" />
          <div className="text-xs font-mono text-ghost/40">Humidity</div>
          <div className="text-sm font-sora font-semibold text-ghost">{weather.humidity}%</div>
        </div>
        <div className="bg-void rounded-xl p-3 text-center">
          <Eye className="w-4 h-4 text-ghost/50 mx-auto mb-1" />
          <div className="text-xs font-mono text-ghost/40">Visibility</div>
          <div className="text-sm font-sora font-semibold text-ghost">{weather.visibility} km</div>
        </div>
      </div>

      {/* 24hr Forecast */}
      <div>
        <h3 className="text-[11px] font-mono text-ghost/30 uppercase mb-2">24-Hour Forecast</h3>
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {forecast.map((f, i) => {
            const FIcon = WEATHER_ICONS[f.condition] || WEATHER_ICONS.default;
            return (
              <div key={i} className="shrink-0 bg-void rounded-xl px-3 py-2 text-center min-w-[60px] border border-ghost/5">
                <div className="text-[10px] font-mono text-ghost/30 mb-1">{f.time}</div>
                <FIcon className="w-4 h-4 text-ghost/50 mx-auto mb-1" />
                <div className="text-xs font-sora font-semibold text-ghost">{f.temp}°</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
