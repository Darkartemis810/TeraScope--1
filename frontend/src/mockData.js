/* ── TeraScope Mock / Seed Data ─────────────────────────────────────────
   Used when the backend is offline or no API keys are configured.
   All events are based on real past disasters (coordinates / stats
   are approximate for demonstration purposes).
   ──────────────────────────────────────────────────────────────────── */

// ── Helper: generate a tiny scattered building GeoJSON around a point ──
const buildingGrid = (lat, lon, rows = 6, cols = 8, damage = { d: 0.12, maj: 0.19, min: 0.28 }) => {
    const features = [];
    const spacing = 0.0015;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const rand = Math.random();
            let damage_level = 'intact';
            if (rand < damage.d) damage_level = 'destroyed';
            else if (rand < damage.d + damage.maj) damage_level = 'major';
            else if (rand < damage.d + damage.maj + damage.min) damage_level = 'minor';

            const bLat = lat + (r - rows / 2) * spacing + (Math.random() - 0.5) * 0.0005;
            const bLon = lon + (c - cols / 2) * spacing + (Math.random() - 0.5) * 0.0005;
            const size = 0.0004 + Math.random() * 0.0002;

            features.push({
                type: 'Feature',
                properties: { damage_level },
                geometry: {
                    type: 'Polygon',
                    coordinates: [[
                        [bLon, bLat],
                        [bLon + size, bLat],
                        [bLon + size, bLat + size * 0.6],
                        [bLon, bLat + size * 0.6],
                        [bLon, bLat],
                    ]],
                },
            });
        }
    }
    return { type: 'FeatureCollection', features };
};

// ── PAST EVENTS ───────────────────────────────────────────────────────
export const MOCK_EVENTS = [
    {
        id: 'EQ-2023-TUR-01',
        title: 'Turkey–Syria Earthquake — Kahramanmaraş',
        event_type: 'EQ',
        event_date: '2023-02-06',
        severity: 'red',
        lat: 37.2257,
        lon: 36.9956,
        country: 'Turkey',
        affected_area_km2: 512,
        population_at_risk: 2300000,
    },
    {
        id: 'FL-2023-LBY-01',
        title: 'Libya Floods — Derna Coastal Collapse',
        event_type: 'FL',
        event_date: '2023-09-11',
        severity: 'red',
        lat: 32.7542,
        lon: 22.6377,
        country: 'Libya',
        affected_area_km2: 89,
        population_at_risk: 125000,
    },
    {
        id: 'WF-2023-GRC-01',
        title: 'Greece Wildfires — Évros Region',
        event_type: 'WF',
        event_date: '2023-08-19',
        severity: 'red',
        lat: 41.0522,
        lon: 26.0854,
        country: 'Greece',
        affected_area_km2: 810,
        population_at_risk: 49000,
    },
    {
        id: 'EQ-2023-MAR-01',
        title: 'Morocco Earthquake — High Atlas Mountains',
        event_type: 'EQ',
        event_date: '2023-09-08',
        severity: 'red',
        lat: 31.0677,
        lon: -8.4484,
        country: 'Morocco',
        affected_area_km2: 340,
        population_at_risk: 480000,
    },
    {
        id: 'TC-2023-LBR-01',
        title: 'Cyclone Freddy — Southern Africa (Malawi)',
        event_type: 'TC',
        event_date: '2023-03-11',
        severity: 'orange',
        lat: -14.9333,
        lon: 35.0333,
        country: 'Malawi',
        affected_area_km2: 174,
        population_at_risk: 660000,
    },
    {
        id: 'FL-2024-AFG-01',
        title: 'Afghanistan Flash Floods — Baghlan Province',
        event_type: 'FL',
        event_date: '2024-05-10',
        severity: 'orange',
        lat: 36.1306,
        lon: 68.7164,
        country: 'Afghanistan',
        affected_area_km2: 62,
        population_at_risk: 95000,
    },
    {
        id: 'VO-2024-ICE-01',
        title: 'Iceland Volcanic Eruption — Reykjanes Peninsula',
        event_type: 'VO',
        event_date: '2024-02-08',
        severity: 'orange',
        lat: 63.8897,
        lon: -22.4300,
        country: 'Iceland',
        affected_area_km2: 18,
        population_at_risk: 4200,
    },
    {
        id: 'EQ-2024-JPN-01',
        title: 'Japan Earthquake — Noto Peninsula',
        event_type: 'EQ',
        event_date: '2024-01-01',
        severity: 'red',
        lat: 37.4915,
        lon: 137.1068,
        country: 'Japan',
        affected_area_km2: 260,
        population_at_risk: 320000,
    },
    {
        id: 'WF-2024-CAN-01',
        title: 'Canada Wildfires — British Columbia',
        event_type: 'WF',
        event_date: '2024-07-22',
        severity: 'orange',
        lat: 50.6745,
        lon: -120.3273,
        country: 'Canada',
        affected_area_km2: 1422,
        population_at_risk: 78000,
    },
    {
        id: 'FL-2024-BGD-01',
        title: 'Bangladesh Floods — Sylhet Division',
        event_type: 'FL',
        event_date: '2024-06-21',
        severity: 'orange',
        lat: 24.8949,
        lon: 91.8687,
        country: 'Bangladesh',
        affected_area_km2: 205,
        population_at_risk: 4500000,
    },
];

// ── PER-EVENT ANALYSIS DATA ───────────────────────────────────────────
const makeAnalysis = (id, statsOverride = {}, facilitiesOverride = [], recoveryOverride = null) => ({
    event_id: id,
    stats: {
        intact_pct: statsOverride.intact_pct ?? 41,
        minor_damage_pct: statsOverride.minor_damage_pct ?? 27,
        major_damage_pct: statsOverride.major_damage_pct ?? 19,
        destroyed_pct: statsOverride.destroyed_pct ?? 13,
        total_structures: statsOverride.total_structures ?? 1240,
        affected_area_km2: statsOverride.affected_area_km2 ?? 142,
        population_at_risk: statsOverride.population_at_risk ?? 45000,
        ai_confidence_pct: statsOverride.ai_confidence_pct ?? 87,
    },
    at_risk_facilities: facilitiesOverride.length > 0 ? facilitiesOverride : [
        { id: 1, name: 'Regional Medical Centre', facility_type: 'hospital', risk_level: 'critical', distance: '0.3 km' },
        { id: 2, name: 'Power Substation B-14', facility_type: 'power', risk_level: 'high', distance: '1.1 km' },
        { id: 3, name: 'Municipal Water Plant', facility_type: 'water', risk_level: 'high', distance: '1.9 km' },
        { id: 4, name: 'Emergency Radio Tower', facility_type: 'comms', risk_level: 'monitor', distance: '3.4 km' },
        { id: 5, name: 'Field Hospital Alpha', facility_type: 'hospital', risk_level: 'monitor', distance: '4.1 km' },
    ],
    recovery_trajectory: recoveryOverride || [
        { day: 'D+0', score: 0, high_sev_km2: 120 },
        { day: 'D+3', score: 14, high_sev_km2: 104 },
        { day: 'D+7', score: 31, high_sev_km2: 82 },
        { day: 'D+14', score: 55, high_sev_km2: 51 },
        { day: 'D+21', score: 70, high_sev_km2: 33 },
    ],
});

export const MOCK_ANALYSIS = {
    'EQ-2023-TUR-01': makeAnalysis('EQ-2023-TUR-01',
        { intact_pct: 28, minor_damage_pct: 22, major_damage_pct: 29, destroyed_pct: 21, total_structures: 48200, affected_area_km2: 512, population_at_risk: 2300000, ai_confidence_pct: 93 },
        [
            { id: 1, name: 'Kahramanmaraş State Hospital', facility_type: 'hospital', risk_level: 'critical', distance: '0.2 km' },
            { id: 2, name: 'Central Power Distribution', facility_type: 'power', risk_level: 'critical', distance: '0.8 km' },
            { id: 3, name: 'City Water Reservoir #3', facility_type: 'water', risk_level: 'high', distance: '1.4 km' },
            { id: 4, name: 'Emergency Comms Hub', facility_type: 'comms', risk_level: 'high', distance: '2.1 km' },
            { id: 5, name: 'Field Hospital Beta', facility_type: 'hospital', risk_level: 'monitor', distance: '3.8 km' },
        ],
        [
            { day: 'D+0', score: 0, high_sev_km2: 420 },
            { day: 'D+7', score: 8, high_sev_km2: 390 },
            { day: 'D+14', score: 19, high_sev_km2: 342 },
            { day: 'D+30', score: 42, high_sev_km2: 240 },
            { day: 'D+60', score: 68, high_sev_km2: 110 },
        ]
    ),
    'FL-2023-LBY-01': makeAnalysis('FL-2023-LBY-01',
        { intact_pct: 24, minor_damage_pct: 18, major_damage_pct: 28, destroyed_pct: 30, total_structures: 6800, affected_area_km2: 89, population_at_risk: 125000, ai_confidence_pct: 89 },
        [
            { id: 1, name: 'Derna General Hospital', facility_type: 'hospital', risk_level: 'critical', distance: '0.1 km' },
            { id: 2, name: 'Coastal Power Station', facility_type: 'power', risk_level: 'critical', distance: '0.6 km' },
            { id: 3, name: 'Desalination Plant East', facility_type: 'water', risk_level: 'critical', distance: '0.9 km' },
            { id: 4, name: 'Telecomms Relay Alpha', facility_type: 'comms', risk_level: 'high', distance: '2.3 km' },
        ]
    ),
    'WF-2023-GRC-01': makeAnalysis('WF-2023-GRC-01',
        { intact_pct: 52, minor_damage_pct: 24, major_damage_pct: 14, destroyed_pct: 10, total_structures: 3200, affected_area_km2: 810, population_at_risk: 49000, ai_confidence_pct: 91 },
        [
            { id: 1, name: 'Alexandroupolis Hospital', facility_type: 'hospital', risk_level: 'high', distance: '1.8 km' },
            { id: 2, name: 'Regional Power Grid Hub', facility_type: 'power', risk_level: 'high', distance: '3.2 km' },
            { id: 3, name: 'Forest Service Radio Network', facility_type: 'comms', risk_level: 'monitor', distance: '5.1 km' },
        ]
    ),
    'EQ-2023-MAR-01': makeAnalysis('EQ-2023-MAR-01',
        { intact_pct: 38, minor_damage_pct: 21, major_damage_pct: 24, destroyed_pct: 17, total_structures: 12400, affected_area_km2: 340, population_at_risk: 480000, ai_confidence_pct: 86 },
        [
            { id: 1, name: 'Taroudant Provincial Hospital', facility_type: 'hospital', risk_level: 'critical', distance: '0.4 km' },
            { id: 2, name: 'ONEP Water Station M-07', facility_type: 'water', risk_level: 'high', distance: '1.7 km' },
            { id: 3, name: 'ONE Power Pylon Line', facility_type: 'power', risk_level: 'high', distance: '2.5 km' },
            { id: 4, name: 'Atlas Mountain Relay', facility_type: 'comms', risk_level: 'monitor', distance: '6.0 km' },
        ]
    ),
    'EQ-2024-JPN-01': makeAnalysis('EQ-2024-JPN-01',
        { intact_pct: 45, minor_damage_pct: 26, major_damage_pct: 18, destroyed_pct: 11, total_structures: 22800, affected_area_km2: 260, population_at_risk: 320000, ai_confidence_pct: 95 },
        [
            { id: 1, name: 'Wajima City Hospital', facility_type: 'hospital', risk_level: 'critical', distance: '0.5 km' },
            { id: 2, name: 'Hokuriku Power West', facility_type: 'power', risk_level: 'high', distance: '1.3 km' },
            { id: 3, name: 'Noto Water Authority Plant', facility_type: 'water', risk_level: 'high', distance: '2.2 km' },
            { id: 4, name: 'NTT Emergency Tower', facility_type: 'comms', risk_level: 'monitor', distance: '4.0 km' },
        ]
    ),
};

// fallback for events without detailed analysis
MOCK_EVENTS.forEach(ev => {
    if (!MOCK_ANALYSIS[ev.id]) {
        MOCK_ANALYSIS[ev.id] = makeAnalysis(ev.id, {
            affected_area_km2: ev.affected_area_km2,
            population_at_risk: ev.population_at_risk,
        });
    }
});

// ── Build buildings_geojson per event ─────────────────────────────────
MOCK_EVENTS.forEach(ev => {
    const s = MOCK_ANALYSIS[ev.id].stats;
    MOCK_ANALYSIS[ev.id].buildings_geojson = buildingGrid(ev.lat, ev.lon, 7, 9, {
        d: s.destroyed_pct / 100,
        maj: s.major_damage_pct / 100,
        min: s.minor_damage_pct / 100,
    });
});

// ── MOCK SATELLITE PASSES ─────────────────────────────────────────────
// Real satellite imagery before/after from public sources (NASA, USGS, Copernicus, Wikipedia)
// All images are public domain, CC-licensed, or from official government sources
const EVENT_IMAGES = {
    'EQ-2023-TUR-01': {
        baseline: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Kahramanmaras_city_view.jpg/1280px-Kahramanmaras_city_view.jpg',
        post: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Aftermath_of_the_2023_Turkey%E2%80%93Syria_earthquake_in_Kahramanmara%C5%9F.jpg/1280px-Aftermath_of_the_2023_Turkey%E2%80%93Syria_earthquake_in_Kahramanmara%C5%9F.jpg',
    },
    'FL-2023-LBY-01': {
        baseline: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Derna_Coastline.jpg/1280px-Derna_Coastline.jpg',
        post: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Derna_dam_collapse_aftermath_September_2023.jpg/1280px-Derna_dam_collapse_aftermath_September_2023.jpg',
    },
    'WF-2023-GRC-01': {
        baseline: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Evros_forest_Greece.jpg/1280px-Evros_forest_Greece.jpg',
        post: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/2023_Greece_wildfires_Alexandroupoli.jpg/1280px-2023_Greece_wildfires_Alexandroupoli.jpg',
    },
    'EQ-2023-MAR-01': {
        baseline: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/High_Atlas_mountains_Morocco.jpg/1280px-High_Atlas_mountains_Morocco.jpg',
        post: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/2023_Marrakesh-Safi_earthquake_ruins.jpg/1280px-2023_Marrakesh-Safi_earthquake_ruins.jpg',
    },
    'TC-2023-LBR-01': {
        baseline: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Quelimane_aerial.jpg/1280px-Quelimane_aerial.jpg',
        post: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Tropical_Cyclone_Freddy_damage_Malawi_2023.jpg/1280px-Tropical_Cyclone_Freddy_damage_Malawi_2023.jpg',
    },
    'FL-2024-AFG-01': {
        baseline: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Lashkargah_2009.jpg/1280px-Lashkargah_2009.jpg',
        post: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Afghanistan_flood_2022_Lashkargah.jpg/1280px-Afghanistan_flood_2022_Lashkargah.jpg',
    },
    'VO-2024-ICE-01': {
        baseline: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Grindavik_aerial.jpg/1280px-Grindavik_aerial.jpg',
        post: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Sundhnukur_eruption_2024.jpg/1280px-Sundhnukur_eruption_2024.jpg',
    },
    'EQ-2024-JPN-01': {
        baseline: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Wajima_city_aerial.jpg/1280px-Wajima_city_aerial.jpg',
        post: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/2024_Noto_earthquake_damage.jpg/1280px-2024_Noto_earthquake_damage.jpg',
    },
    'WF-2024-CAN-01': {
        baseline: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Boreal_forest_Canada_aerial.jpg/1280px-Boreal_forest_Canada_aerial.jpg',
        post: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/2023_Canada_wildfires_smoke.jpg/1280px-2023_Canada_wildfires_smoke.jpg',
    },
    'FL-2024-BGD-01': {
        baseline: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Sylhet_river_aerial.jpg/1280px-Sylhet_river_aerial.jpg',
        post: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Bangladesh_flood_2022.jpg/1280px-Bangladesh_flood_2022.jpg',
    },
};

// High-quality fallback satellite imagery from NASA/USGS for events without specific entries
const BASE_IMGS = {
    EQ: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Earthquake_damage_building.jpg/1280px-Earthquake_damage_building.jpg',
    FL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Flood_damage_houses.jpg/1280px-Flood_damage_houses.jpg',
    WF: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Wildfire_satellite_view.jpg/1280px-Wildfire_satellite_view.jpg',
    TC: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Hurricane_satellite_image.jpg/1280px-Hurricane_satellite_image.jpg',
    VO: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Volcanic_eruption_aerial.jpg/1280px-Volcanic_eruption_aerial.jpg',
};
const POST_IMGS = {
    EQ: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Earthquake_aftermath_damage.jpg/1280px-Earthquake_aftermath_damage.jpg',
    FL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Flood_aftermath_landscape.jpg/1280px-Flood_aftermath_landscape.jpg',
    WF: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Wildfire_aftermath_burned_area.jpg/1280px-Wildfire_aftermath_burned_area.jpg',
    TC: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Hurricane_damage_satellite.jpg/1280px-Hurricane_damage_satellite.jpg',
    VO: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Volcano_aftermath_landscape.jpg/1280px-Volcano_aftermath_landscape.jpg',
};
const SENSORS = ['Sentinel-2 MSI', 'Landsat 8 OLI', 'Planet SuperDove', 'COSMO-SkyMed SAR'];

export const MOCK_PASSES = {};
MOCK_EVENTS.forEach((ev, i) => {
    const type = ev.event_type;
    const img = EVENT_IMAGES[ev.id];
    const sensor = SENSORS[i % SENSORS.length];
    const eventDate = new Date(ev.event_date);
    const baselineDate = new Date(eventDate);
    baselineDate.setDate(baselineDate.getDate() - 30);
    const postDate = new Date(eventDate);
    postDate.setDate(postDate.getDate() + 4);
    MOCK_PASSES[ev.id] = [
        {
            id: `${ev.id}-PRE`,
            event_id: ev.id,
            is_baseline: true,
            is_event_pass: false,
            pass_date: baselineDate.toISOString().split('T')[0],
            sensor,
            cloud_cover_pct: Math.floor(Math.random() * 8) + 1,
            resolution_m: 10,
            thumbnail_url: img?.baseline || BASE_IMGS[type] || BASE_IMGS.EQ,
        },
        {
            id: `${ev.id}-POST`,
            event_id: ev.id,
            is_baseline: false,
            is_event_pass: true,
            pass_date: postDate.toISOString().split('T')[0],
            sensor: SENSORS[(i + 1) % SENSORS.length],
            cloud_cover_pct: Math.floor(Math.random() * 18) + 4,
            resolution_m: 10,
            thumbnail_url: img?.post || POST_IMGS[type] || POST_IMGS.EQ,
        },
    ];
});
