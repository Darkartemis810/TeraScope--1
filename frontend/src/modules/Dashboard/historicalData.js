/**
 * Historical Disaster Data for Demo/Showcase
 * Real disaster events with before/after satellite imagery URLs
 */

export const historicalDisasters = [
  {
    id: "tohoku-2011",
    title: "Tōhoku Earthquake & Tsunami",
    location: "Japan",
    date: "2011-03-11",
    type: "EQ",
    severity: "red",
    lat: 38.322,
    lon: 142.369,
    magnitude: "9.1",
    casualties: "19,759",
    affected_population: 470000,
    description: "The most powerful earthquake ever recorded in Japan, triggering a devastating tsunami.",
    before_image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Natori_before_tsunami.jpg/1280px-Natori_before_tsunami.jpg",
    after_image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Natori_after_tsunami.jpg/1280px-Natori_after_tsunami.jpg",
    stats: {
      area_affected_km2: 561,
      structures_destroyed: 121992,
      structures_damaged: 280958,
      infrastructure_at_risk: 47,
      intact_pct: 12,
      minor_damage_pct: 23,
      major_damage_pct: 35,
      destroyed_pct: 30
    }
  },
  {
    id: "camp-fire-2018",
    title: "Camp Fire - Paradise, CA",
    location: "California, USA",
    date: "2018-11-08",
    type: "WF",
    severity: "red",
    lat: 39.7596,
    lon: -121.6219,
    acres_burned: "153,336",
    casualties: "85",
    affected_population: 52000,
    description: "The deadliest and most destructive wildfire in California history, destroying the town of Paradise.",
    before_image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Paradise_California_before_Camp_Fire.jpg/1280px-Paradise_California_before_Camp_Fire.jpg",
    after_image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Paradise_California_after_Camp_Fire.jpg/1280px-Paradise_California_after_Camp_Fire.jpg",
    stats: {
      area_affected_km2: 620,
      structures_destroyed: 18804,
      structures_damaged: 4293,
      infrastructure_at_risk: 23,
      intact_pct: 8,
      minor_damage_pct: 15,
      major_damage_pct: 32,
      destroyed_pct: 45
    }
  },
  {
    id: "maui-2023",
    title: "Maui Wildfires - Lahaina",
    location: "Hawaii, USA",
    date: "2023-08-08",
    type: "WF",
    severity: "red",
    lat: 20.8683,
    lon: -156.6825,
    acres_burned: "2,170",
    casualties: "100+",
    affected_population: 12000,
    description: "Historic town of Lahaina devastated by windswept wildfires, the deadliest U.S. wildfire in over 100 years.",
    before_image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Aerial_view_of_Lahaina%2C_Hawaii.jpg/1280px-Aerial_view_of_Lahaina%2C_Hawaii.jpg",
    after_image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Lahaina_wildfire_destruction_aerial.jpg/1280px-Lahaina_wildfire_destruction_aerial.jpg",
    stats: {
      area_affected_km2: 8.8,
      structures_destroyed: 2207,
      structures_damaged: 548,
      infrastructure_at_risk: 12,
      intact_pct: 5,
      minor_damage_pct: 10,
      major_damage_pct: 25,
      destroyed_pct: 60
    }
  },
  {
    id: "katrina-2005",
    title: "Hurricane Katrina",
    location: "New Orleans, USA",
    date: "2005-08-29",
    type: "TC",
    severity: "red",
    lat: 29.9511,
    lon: -90.0715,
    category: "5",
    casualties: "1,836",
    affected_population: 1200000,
    description: "Category 5 hurricane causing catastrophic damage to the Gulf Coast, 80% of New Orleans flooded.",
    before_image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/New_Orleans_Satellite_Image_Before_Hurricane_Katrina.jpg/1280px-New_Orleans_Satellite_Image_Before_Hurricane_Katrina.jpg",
    after_image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/New_Orleans_Satellite_Image_After_Hurricane_Katrina.jpg/1280px-New_Orleans_Satellite_Image_After_Hurricane_Katrina.jpg",
    stats: {
      area_affected_km2: 233100,
      structures_destroyed: 300000,
      structures_damaged: 850000,
      infrastructure_at_risk: 156,
      intact_pct: 15,
      minor_damage_pct: 20,
      major_damage_pct: 30,
      destroyed_pct: 35
    }
  },
  {
    id: "turkey-syria-2023",
    title: "Turkey-Syria Earthquake",
    location: "Türkiye / Syria",
    date: "2023-02-06",
    type: "EQ",
    severity: "red",
    lat: 37.1742,
    lon: 37.0332,
    magnitude: "7.8",
    casualties: "59,259",
    affected_population: 23000000,
    description: "Devastating earthquake affecting southeastern Turkey and northern Syria, collapsing thousands of buildings.",
    before_image: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Kahramanmaras_city_view.jpg",
    after_image: "https://upload.wikimedia.org/wikipedia/commons/4/45/Aftermath_of_the_2023_Turkey%E2%80%93Syria_earthquake_in_Kahramanmara%C5%9F.jpg",
    stats: {
      area_affected_km2: 350000,
      structures_destroyed: 164000,
      structures_damaged: 520000,
      infrastructure_at_risk: 89,
      intact_pct: 10,
      minor_damage_pct: 18,
      major_damage_pct: 32,
      destroyed_pct: 40
    }
  }
];

export const getDisasterById = (id) => historicalDisasters.find(d => d.id === id);
export const getRandomDisaster = () => historicalDisasters[Math.floor(Math.random() * historicalDisasters.length)];
