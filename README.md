# TeraScope — Satellite-Powered Disaster Intelligence Platform

> Real-time disaster damage assessment using orbital imagery, AI-driven analysis, live public APIs, and crowdsourced ground truth — built for emergency responders **and** civilians.

---

## Overview

TeraScope is a full-stack disaster management platform that combines **Sentinel-2 satellite imagery**, **AI damage classification**, **live USGS/EONET/NWS feeds**, and **Gemini AI** to deliver actionable intelligence during natural disasters. The system serves two audiences:

- **Responders** — real-time satellite damage analysis, AI situation reports, ground truth validation, and infrastructure risk assessment surfaced through a WebSocket-powered dashboard.
- **Civilians** — a dedicated public dashboard with live disaster maps, escape route planning, real shelter locations, weather forecasts, NWS severity alerts, SOS tools, and a Gemini-powered emergency chatbot.

### Screenshots

<img width="940" height="498" alt="image" src="https://github.com/user-attachments/assets/44e75207-d4ea-4f10-ac78-ab1da70c6793" />
<img width="940" height="502" alt="image" src="https://github.com/user-attachments/assets/70fa036b-6cfc-4cdd-8091-a2bc3b0d5e76" />
<img width="940" height="506" alt="image" src="https://github.com/user-attachments/assets/b200e133-77a3-453a-94e2-abeee0ffd412" />
<img width="940" height="548" alt="image" src="https://github.com/user-attachments/assets/f06462bb-e5ac-4dc6-a9d9-75759d3bdfe8" />
<img width="2213" height="1237" alt="image" src="https://github.com/user-attachments/assets/de842dac-d9cc-4c01-abaa-fd18662fdda8" />
<img width="1631" height="868" alt="image" src="https://github.com/user-attachments/assets/a80545a0-00e9-444f-898b-bc139739e0ba" />
<img width="1674" height="887" alt="image" src="https://github.com/user-attachments/assets/371325cb-c327-4afe-bc7c-ae52f67a229e" />

### Key Capabilities

| Capability | Description |
|---|---|
| **Live Event Monitoring** | Polls GDACS, USGS Earthquakes, and NASA EONET every 5–10 minutes for active disasters worldwide |
| **Satellite Damage Analysis** | Fetches Sentinel-2/SAR imagery, computes NDVI/damage indices, and classifies building-level destruction (Class 0–3) |
| **AI Situation Reports** | Generates narrative reports using Groq LLM + Gemini Vision from satellite before/after imagery |
| **Ground Truth Validation** | Crowdsourced field photo submissions classified by HuggingFace AI and cross-validated against satellite data |
| **Infrastructure Risk Assessment** | OSM-based analysis of hospitals, bridges, power stations, schools within affected zones |
| **Recovery Tracking** | Monitors post-disaster recovery progression through successive satellite passes |
| **Real-Time Alerts** | Threshold-based alert engine for critical events, infrastructure risk, and data disputes |
| **Civilian Disaster Map** | Live danger/caution/safe zone polygons computed from real USGS magnitudes + OSRM escape routes |
| **Real Shelter Finder** | OpenStreetMap Overpass API — nearest hospitals, emergency shelters, fire stations within 15 km |
| **Weather Intelligence** | WeatherAPI.com 24 h forecast + severe alert extraction for user's GPS location |
| **Gemini Chatbot** | On-device Gemini AI emergency assistant with disaster-context system prompt |
| **SOS System** | One-tap emergency call + geolocation coordinates that works fully offline |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React 19)                      │
│  Landing Page  │  Civilian Dashboard  │  Responder Dashboard    │
│  (Vapor Clinic)│  (Public Access)     │  (Monitor/Intel/Sat)    │
└───────────────────────────┬─────────────────────────────────────┘
                            │ REST + WebSocket
┌───────────────────────────┴─────────────────────────────────────┐
│                      BACKEND (FastAPI)                           │
│  Event Monitor │ Satellite Pipeline │ Damage Intelligence       │
│  AI Reporting  │ Ground Truth       │ Recovery Tracker          │
│  Alerts Engine │ WebSocket Manager  │ Quota Guards              │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────────┐
│                     EXTERNAL SERVICES                            │
│  Neon PostgreSQL (PostGIS) │ Supabase Storage │ Sentinel Hub    │
│  GDACS/USGS/EONET Feeds   │ Groq LLM         │ Gemini Vision   │
│  HuggingFace (Damage AI)  │ OpenStreetMap     │                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 7.3 | Build tool & dev server |
| Tailwind CSS 3.4 | Styling (void/plasma/graphite design tokens) |
| GSAP 3 + ScrollTrigger | Cinematic animations (landing page & dashboard transitions) |
| Zustand | Global state management + WebSocket client |
| Leaflet + React-Leaflet | Interactive damage maps + live disaster zone polygons |
| Recharts | Severity charts, recovery graphs |
| Lucide React | Icon system |
| WeatherAPI.com | 24 h weather forecast + severe alert extraction |
| Google Gemini API | On-device AI emergency chatbot |
| USGS Earthquake Feed | Real-time M2.5+ earthquake data (free, no key) |
| NASA EONET | Wildfire, storm, volcano events (free, no key) |
| NWS Alerts API | US National Weather Service alert polygons (free) |
| OpenStreetMap Overpass | Real shelter/hospital/fire station locations (free) |
| OSRM Routing | Open-source road routing for escape routes (free) |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI | Async Python API framework |
| asyncpg | PostgreSQL async driver (Neon) |
| APScheduler | Scheduled polling jobs (GDACS, USGS, recovery passes) |
| httpx | Async HTTP client for external APIs |
| NumPy | Satellite imagery damage index computation |
| ReportLab + Pillow | PDF report generation |
| Groq SDK | LLM-powered situation report narratives |
| Google Generative AI | Gemini Vision for satellite image analysis |
| HuggingFace Hub | Ground truth photo damage classification |

### Infrastructure
| Service | Purpose |
|---|---|
| Neon PostgreSQL | Database with PostGIS spatial extensions |
| Supabase Storage | File storage for satellite thumbnails & ground truth photos |
| Sentinel Hub | Sentinel-2/SAR satellite imagery API |

---

## Project Structure

```
TeraScope/
├── backend/
│   ├── main.py                          # FastAPI app, router mounts, scheduler
│   ├── server_simple.py                 # Lightweight mock server (no DB/ML)
│   ├── requirements.txt                 # Python dependencies
│   ├── migrations/
│   │   └── 001_schema.sql               # PostgreSQL schema (10 tables + PostGIS)
│   ├── modules/
│   │   ├── event_monitor/               # GDACS, USGS, EONET polling
│   │   ├── satellite_pipeline/          # Sentinel-2 imagery + damage indices
│   │   ├── damage_intelligence/         # Building-level damage classification
│   │   ├── ai_reporting/                # Groq LLM + Gemini Vision reports
│   │   ├── ground_truth/                # Crowdsourced photo submissions
│   │   ├── recovery_tracker/            # Post-disaster recovery monitoring
│   │   └── alerts_engine/               # Threshold-based real-time alerts
│   └── shared/
│       ├── db.py                        # asyncpg connection pool
│       ├── ws.py                        # WebSocket connection manager
│       ├── r2.py                        # Supabase Storage client
│       └── quota.py                     # API quota guards (Sentinel/Gemini)
│
├── frontend/
│   ├── src/
│   │   ├── landing/                     # Landing page (Vapor Clinic theme)
│   │   │   ├── LandingPage.jsx
│   │   │   └── components/
│   │   │       ├── Navbar.jsx           # Floating Island morphing navbar
│   │   │       ├── HeroSection.jsx      # Full-viewport hero with GSAP stagger
│   │   │       ├── FeaturesSection.jsx  # Interactive micro-UI demo cards
│   │   │       ├── PhilosophySection.jsx # Parallax manifesto + word reveal
│   │   │       ├── ProtocolSection.jsx  # Sticky stacking SVG animations
│   │   │       └── FooterSection.jsx    # CTA band + system status footer
│   │   ├── login/
│   │   │   ├── LoginOrganization.jsx    # Responder login (Vapor Clinic themed)
│   │   │   └── LoginCivilian.jsx        # Civilian login
│   │   ├── dashboards/
│   │   │   ├── civilian/
│   │   │   │   ├── CivilianDashboard.jsx        # Geolocation entry point
│   │   │   │   ├── components/
│   │   │   │   │   ├── SeverityBanner.jsx        # NWS severity level 1–5 banner
│   │   │   │   │   ├── LiveAlerts.jsx            # NWS alert ticker
│   │   │   │   │   ├── EscapeRoutesMap.jsx       # Real disaster map (USGS+EONET+NWS+OSRM)
│   │   │   │   │   ├── ShelterInfo.jsx           # OSM real shelters via Overpass API
│   │   │   │   │   ├── WeatherWidget.jsx         # WeatherAPI.com 24h forecast
│   │   │   │   │   ├── DisasterInfoCards.jsx     # Flood/EQ/fire/hurricane DO's & DON'Ts
│   │   │   │   │   ├── SOSButton.jsx             # One-tap SOS + geolocation
│   │   │   │   │   ├── BeforeAfterSliderCivilian.jsx  # Satellite image comparison
│   │   │   │   │   ├── OSINTPanel.jsx            # Community reports
│   │   │   │   │   └── CivilianChatbot.jsx       # Gemini AI emergency chatbot
│   │   │   │   └── services/
│   │   │   │       └── disasterDataService.js    # All real-data fetchers (USGS/EONET/NWS/OSRM/Overpass)
│   │   │   └── responder/
│   │   │       ├── DashboardNavbar.jsx  # GSAP scroll-morphing nav
│   │   │       └── layouts.jsx          # Monitor, Intelligence, Satellite, Assess
│   │   ├── modules/                     # Dashboard feature modules
│   │   │   ├── Hub/                     # Navigation hub (entry point)
│   │   │   ├── DamageMap/               # Leaflet damage heatmap
│   │   │   ├── EventSidebar/            # Live event feed sidebar
│   │   │   ├── AIChat/                  # Emergency AI assistant
│   │   │   ├── AIReportPanel/           # AI-generated situation reports
│   │   │   ├── AlertPanel/              # Real-time alert notifications
│   │   │   ├── AssessMyArea/            # Civilian area assessment tool
│   │   │   ├── BeforeAfterSlider/       # Satellite before/after comparison
│   │   │   ├── GroundTruthLayer/        # Field report map overlay
│   │   │   ├── InfraRiskPanel/          # Infrastructure risk breakdown
│   │   │   ├── PublicReport/            # Public shareable report page
│   │   │   ├── RecoveryChart/           # Recovery progression graphs
│   │   │   ├── SeverityChart/           # Damage severity distribution
│   │   │   ├── StatCards/               # Key metric stat cards
│   │   │   └── Timeline/               # Satellite pass timeline
│   │   ├── App.jsx                      # Router (landing, login, dashboard)
│   │   ├── store.js                     # Zustand store + WebSocket client
│   │   └── index.css                    # Global styles
│   ├── tailwind.config.js
│   └── package.json
│
├── vercel.json                          # Vercel SPA rewrites + build config
├── GEMINI.md                            # Landing page builder specification
├── SENTINEL_API_KEYS.env                # API keys (Sentinel Hub, Groq, etc.)
└── README.md
```

---

## ML / AI Models

TeraScope uses three AI/ML systems, none of which require local GPU — all run via cloud APIs:

### 1. Satellite Damage Index (NumPy)
- **What:** Computes NDVI difference and custom damage indices from Sentinel-2 multispectral bands
- **How:** Downloads pre/post-disaster imagery → calculates per-pixel vegetation/structural change → generates damage GeoJSON with classified zones
- **Output:** Building-level damage classes (0 = None, 1 = Minor, 2 = Major, 3 = Destroyed)

### 2. Groq LLM (Situation Reports)
- **Model:** LLaMA-based via Groq API
- **What:** Generates natural-language situation reports from structured damage data
- **Input:** Event metadata + damage statistics + infrastructure risk data
- **Output:** Narrative situation report with executive summary, sector-by-sector breakdown, and recommendations

### 3. Gemini Vision (Satellite Image Analysis)
- **Model:** Google Gemini Pro Vision
- **What:** Analyzes before/after satellite imagery to describe visible structural damage
- **Input:** Satellite thumbnail pairs (pre/post disaster)
- **Output:** Visual damage description integrated into AI situation reports
- **Quota:** 1,500 calls/day (free tier tracked in DB)

### 4. HuggingFace Damage Classifier (Ground Truth)
- **Model:** Image classification model via HuggingFace Inference API
- **What:** Classifies crowdsourced field photos into damage severity classes
- **Input:** Uploaded ground truth photo
- **Output:** Damage class (0–3) + confidence score, cross-validated against satellite assessment

---

## Database Schema

PostgreSQL with PostGIS extension. 10 tables:

| Table | Records |
|---|---|
| `events` | Active disasters with point geometry, severity, type (EQ/FL/TC/WF/VO/LS) |
| `satellite_passes` | Sentinel-2/SAR pass records per event (baseline + event imagery) |
| `analyses` | Full analysis output: damage GeoJSON, stats, infra risk, recovery history |
| `building_damage` | Per-building damage classification with PostGIS coordinates |
| `ground_reports` | Crowdsourced field submissions with AI classification + satellite cross-validation |
| `infrastructure_risk` | Facility-level risk assessment (hospitals, bridges, power) |
| `alert_log` | Typed alerts with acknowledgment workflow |
| `osm_cache` | Cached OpenStreetMap queries (30-day TTL) |
| `sentinel_quota_log` | Monthly Sentinel Hub API usage |
| `gemini_quota_log` | Daily Gemini Vision API calls |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL with PostGIS (or Neon account)

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Backend (Simple / Mock Mode)

Run without database or ML model connections:

```bash
cd backend
pip install fastapi uvicorn python-dotenv
python server_simple.py
# → http://localhost:8000
```

### Backend (Full Mode)

Requires all API keys configured in `SENTINEL_API_KEYS.env`:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Environment Variables

**Frontend** — create `frontend/.env`:

```env
VITE_WEATHERAPI_KEY=your-weatherapi-key        # https://www.weatherapi.com
VITE_GEMINI_API_KEY=your-gemini-api-key        # https://aistudio.google.com
VITE_API_URL=http://localhost:8000/api
```

**Backend** — create `backend/.env` or configure `SENTINEL_API_KEYS.env` in root:

```env
DATABASE_URL=postgresql://user:pass@host/db
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-key
SENTINEL_CLIENT_ID=your-sentinel-hub-id
SENTINEL_CLIENT_SECRET=your-sentinel-hub-secret
GROQ_API_KEY=your-groq-key
GEMINI_API_KEY=your-gemini-key
HF_TOKEN=your-huggingface-token
FRONTEND_URL=http://localhost:5173
```

> **Note:** USGS, NASA EONET, NWS, OSRM, and Overpass APIs are all **free with no API key required**.

---

## Routes

| Path | Description |
|---|---|
| `/` | Landing page (Vapor Clinic theme) |
| `/responder-login` | Responder authentication |
| `/login/civilian` | Civilian portal login |
| `/dashboard/organization` | Responder dashboard (Hub + Alerts) |
| `/dashboard/civilian` | Civilian dashboard — live disaster map, shelter finder, weather, SOS, chatbot |
| `/dashboard/monitor` | Live event monitor with damage map |
| `/dashboard/intelligence` | AI reports + severity + infrastructure risk |
| `/dashboard/satellite` | Before/after satellite comparison + timeline |
| `/report/:slug` | Public shareable disaster report |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health check |
| `GET` | `/api/events` | List active disaster events |
| `GET` | `/api/events/:id` | Event details with analysis |
| `POST` | `/api/satellite/analyze` | Trigger satellite analysis for event |
| `GET` | `/api/intelligence/:event_id` | Damage intelligence report |
| `POST` | `/api/reports/generate` | Generate AI situation report |
| `GET` | `/api/reports/:slug` | Public report by slug |
| `POST` | `/api/ground-truth` | Submit field photo report |
| `GET` | `/api/ground-truth/:event_id` | Get ground truth submissions |
| `GET` | `/api/recovery/:event_id` | Recovery tracking data |
| `GET` | `/api/alerts` | Active alerts |
| `PUT` | `/api/alerts/:id/ack` | Acknowledge alert |
| `WS` | `/api/ws` | Real-time WebSocket (events + alerts) |

---

## Design System

### Landing Page — "Vapor Clinic" (Preset D)
| Token | Value |
|---|---|
| Void | `#0A0A14` |
| Plasma | `#7B61FF` |
| Ghost | `#F0EFF4` |
| Graphite | `#18181B` |
| Fonts | Sora (headings), Instrument Serif (drama), Fira Code (mono) |

### Dashboard
| Token | Value |
|---|---|
| Void | `#05050A` |
| Plasma | `#00E5FF` |
| Ghost | `#FFFFFF` |
| Graphite | `#12121A` |

---

## License

MIT

---

## Civilian Dashboard — Real Data Sources

The civilian dashboard (`/dashboard/civilian`) uses **zero mock data** — every data point is fetched live:

| Feature | Data Source | Key Required |
|---|---|---|
| Severity Banner | NWS Alerts API | No |
| Live Alert Ticker | NWS Alerts API | No |
| Disaster Map Zones | USGS + NASA EONET + magnitude-based radius algorithm | No |
| NWS Alert Polygons | NWS Alerts API (geometry field) | No |
| Escape Routes | OSRM (OpenStreetMap routing) | No |
| Shelter Finder | Overpass API (OSM hospitals, shelters, fire stations) | No |
| Weather Widget | WeatherAPI.com 24 h forecast | Yes (`VITE_WEATHERAPI_KEY`) |
| Emergency Chatbot | Google Gemini API | Yes (`VITE_GEMINI_API_KEY`) |
| SOS Button | Browser Geolocation API | No |

### Zone Classification Algorithm

Danger/caution/safe zones are computed from real disaster data using magnitude-based radii:

| Disaster Type | Danger Radius | Caution Radius |
|---|---|---|
| Earthquake M7+ | 30 km | 80 km |
| Earthquake M6+ | 15 km | 40 km |
| Earthquake M5+ | 8 km | 20 km |
| Earthquake M4+ | 3 km | 10 km |
| Tropical Cyclone | 50 km | 150 km |
| Wildfire | 5 km | 20 km |
| Volcano | 10 km | 30 km |

---

## Deployment

The repo includes a `vercel.json` at the root for one-click Vercel deployment:

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

If your Vercel project has **Root Directory** set to `frontend/`, a `frontend/vercel.json` with just the SPA rewrites is also included.

---

Built with orbital intelligence for disaster response.
