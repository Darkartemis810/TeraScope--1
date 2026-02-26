import React, { useEffect, useRef } from 'react';
import { useStore } from '../../store';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leafet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const DamageMap = () => {
    const mapRef = useRef(null);
    const containerRef = useRef(null);
    const { activeEventId, events } = useStore();

    useEffect(() => {
        if (!containerRef.current) return;

        // Initialize map
        mapRef.current = L.map(containerRef.current, {
            center: [20, 0],
            zoom: 3,
            zoomControl: false,
            attributionControl: false
        });

        // Dark Vapor theme tiles (CartoDB Dark Matter)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
        }).addTo(mapRef.current);

        // Add zoom control top right
        L.control.zoom({ position: 'topright' }).addTo(mapRef.current);

        return () => {
            if (mapRef.current) mapRef.current.remove();
        };
    }, []);

    // Fly to active event
    useEffect(() => {
        if (!activeEventId || !mapRef.current || !events.length) return;

        const event = events.find(e => e.id === activeEventId);
        if (event && event.lat && event.lon) {
            mapRef.current.flyTo([event.lat, event.lon], 12, {
                duration: 2,
                easeLinearity: 0.25
            });

            // Mock damage polygon overlay
            const bounds = [[event.lat - 0.05, event.lon - 0.05], [event.lat + 0.05, event.lon + 0.05]];
            L.rectangle(bounds, { color: "#FF3B30", weight: 1, fillOpacity: 0.2 }).addTo(mapRef.current)
                .bindPopup(`<div class="font-sora"><b class="text-plasma">Priority Zone</b><br/>High structural damage detected.</div>`);
        }

    }, [activeEventId, events]);

    return (
        <div ref={containerRef} className="absolute inset-0 bg-void z-0" />
    );
};

export default DamageMap;
