# Weather Ad Targeting Platform

Forecast-driven US **state-level** ad targeting using Google Maps Platform Weather API and Air Quality API.

## What it does

1. Fetches weather (and optionally air quality) forecasts for sample points across all US states
2. Evaluates campaign rules (cold, hot, rain, snow, poor AQI, extreme heat index)
3. Highlights matching states on an interactive US map
4. Exports targetable state segments as CSV for ad ops

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

By default the app runs in **demo mode** with synthetic forecast data so you can explore the UI without API keys.

## Live API setup

1. Create a [Google Cloud project](https://console.cloud.google.com/)
2. Enable these APIs:
   - [Weather API](https://console.cloud.google.com/marketplace/product/google/weather.googleapis.com)
   - [Air Quality API](https://console.cloud.google.com/marketplace/product/google/airquality.googleapis.com) (for AQI campaigns)
3. Create an API key and restrict it to the enabled APIs
4. Add to `.env.local`:

```env
GOOGLE_MAPS_API_KEY=your_key_here
USE_DEMO_DATA=false
```

## Campaign presets

| Preset | Criteria |
|--------|----------|
| Cold Weather | Max temp ≤ 45°F |
| Hot Weather | Max temp ≥ 90°F |
| Rainy Conditions | ≥50% rain probability |
| Snow Conditions | Snow/ice/mix in forecast |
| Poor Air Quality | US AQI ≥ 100 |
| Extreme Heat Index | Heat index ≥ 100°F |

## Architecture

```
src/
├── app/api/evaluate/   POST — run campaign evaluation
├── app/api/export/     POST — download CSV segment
├── components/         Dashboard, US map, campaign panel
└── lib/
    ├── state-points.ts     3–4 sample lat/lng points per state
    ├── weather-client.ts   GCP Weather + Air Quality API client
    ├── rules-engine.ts     Condition evaluation
    ├── campaign-presets.ts Built-in campaign definitions
    └── aggregator.ts       Point → state aggregation
```

### State targeting model

Weather APIs are point-based. This platform samples 3–4 locations per state (capital + major metros), evaluates each point against campaign rules across the selected date range, then marks a state as matched when ≥50% of its sample points qualify (configurable).

## API usage

### Evaluate

```bash
curl -X POST http://localhost:3000/api/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "cold",
    "timeframe": { "startDate": "2026-06-18", "endDate": "2026-06-20" },
    "minMatchRatio": 0.5
  }'
```

### Export CSV

```bash
curl -X POST http://localhost:3000/api/export \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "cold",
    "timeframe": { "startDate": "2026-06-18", "endDate": "2026-06-20" }
  }' \
  -o states.csv
```

## Cost estimate

~150 sample points × 1 daily forecast call per evaluation ≈ 150 Weather API calls per run. At ~$0.15 CPM, each full US evaluation costs roughly **$0.02**.

## Outage / competitor targeting (demo)

Modeled on the [DownDetector API](https://downdetectorapi.com/v2/docs/) structure — companies (slugs), user reports, problem indicators, and providers — using **sample data** for demo.

### Outage campaign presets

| Preset | Use case |
|--------|----------|
| Competitor: Netflix Down | Conquest ads for Hulu, Disney+, Max |
| Competitor: Verizon Down | Switch campaigns for AT&T, T-Mobile |
| Competitor: Xfinity Down | Pitch Spectrum, fiber, Starlink |
| Any Streaming Outage | Broad streaming conquest |
| Any Cell Network Outage | Carrier switch campaigns |
| Any Internet / ISP Outage | ISP alternative offers |
| Any Gaming Outage | Cross-platform gaming ads |
| Critical Outages (Any) | High-intent switcher audience |

### Outage API

```bash
curl -X POST http://localhost:3000/api/outages/evaluate \
  -H "Content-Type: application/json" \
  -d '{"campaignId": "competitor-netflix"}'
```

## Next phases

- Cloud Scheduler for automated refresh
- DMA / ZIP-level granularity
- Webhook export to DV360 / Google Ads
- Campaign history and audit log
