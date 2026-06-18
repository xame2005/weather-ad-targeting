import type { CampaignConfig } from "./types";

export const CAMPAIGN_PRESETS: CampaignConfig[] = [
  {
    id: "cold",
    name: "Cold Weather",
    description: "Target states with max temps at or below 45°F — ideal for coats and jackets.",
    color: "#2563eb",
    minMatchRatio: 0.5,
    criteria: {
      operator: "AND",
      conditions: [
        { metric: "temperature_max_f", op: "lte", value: 45 },
      ],
    },
  },
  {
    id: "hot",
    name: "Hot Weather",
    description: "Target states with max temps at or above 90°F — AC units, pools, summer apparel.",
    color: "#ea580c",
    minMatchRatio: 0.5,
    criteria: {
      operator: "AND",
      conditions: [
        { metric: "temperature_max_f", op: "gte", value: 90 },
      ],
    },
  },
  {
    id: "rain",
    name: "Rainy Conditions",
    description: "Target states with ≥50% rain probability — umbrellas, wipers, rain gear.",
    color: "#059669",
    minMatchRatio: 0.5,
    criteria: {
      operator: "AND",
      conditions: [
        { metric: "precipitation_probability", op: "gte", value: 50 },
        {
          metric: "precipitation_type",
          op: "in",
          value: ["RAIN", "RAIN_AND_SNOW", "MIX"],
        },
      ],
    },
  },
  {
    id: "snow",
    name: "Snow Conditions",
    description: "Target states with snow in the forecast — snow tires, shovels, winter gear.",
    color: "#94a3b8",
    minMatchRatio: 0.5,
    criteria: {
      operator: "AND",
      conditions: [
        {
          metric: "precipitation_type",
          op: "in",
          value: ["SNOW", "RAIN_AND_SNOW", "MIX", "ICE"],
        },
      ],
    },
  },
  {
    id: "poor-aqi",
    name: "Poor Air Quality",
    description: "Target states with US AQI ≥ 100 — air purifiers, masks, indoor activity ads.",
    color: "#9333ea",
    minMatchRatio: 0.5,
    criteria: {
      operator: "AND",
      conditions: [{ metric: "us_aqi", op: "gte", value: 100 }],
    },
  },
  {
    id: "heat-index",
    name: "Extreme Heat Index",
    description: "Target states with heat index ≥ 100°F — hydration, cooling products.",
    color: "#dc2626",
    minMatchRatio: 0.5,
    criteria: {
      operator: "AND",
      conditions: [{ metric: "heat_index_f", op: "gte", value: 100 }],
    },
  },
];

export function getCampaignById(id: string): CampaignConfig | undefined {
  return CAMPAIGN_PRESETS.find((c) => c.id === id);
}
