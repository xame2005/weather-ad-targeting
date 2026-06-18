import { getCampaignById } from "./campaign-presets";
import type { CampaignConfig, CustomThresholds } from "./types";

const THRESHOLD_METRICS = {
  cold: { metric: "temperature_max_f" as const, field: "temperatureMaxF" as const },
  hot: { metric: "temperature_max_f" as const, field: "temperatureMaxF" as const },
  rain: {
    metric: "precipitation_probability" as const,
    field: "precipitationProbability" as const,
  },
  "poor-aqi": { metric: "us_aqi" as const, field: "usAqi" as const },
  "heat-index": { metric: "heat_index_f" as const, field: "heatIndexF" as const },
};

export function getThresholdConfig(campaignId: string) {
  return THRESHOLD_METRICS[campaignId as keyof typeof THRESHOLD_METRICS];
}

export function getDefaultThreshold(campaign: CampaignConfig): number | null {
  const config = getThresholdConfig(campaign.id);
  if (!config) return null;

  const condition = campaign.criteria.conditions.find(
    (item) => item.metric === config.metric,
  );
  return typeof condition?.value === "number" ? condition.value : null;
}

export function resolveCampaign(
  campaignId: string,
  customThresholds?: CustomThresholds,
): CampaignConfig | undefined {
  const preset = getCampaignById(campaignId);
  if (!preset) return undefined;
  if (!customThresholds) return preset;

  const campaign: CampaignConfig = structuredClone(preset);

  for (const condition of campaign.criteria.conditions) {
    if (
      condition.metric === "temperature_max_f" &&
      customThresholds.temperatureMaxF != null
    ) {
      condition.value = customThresholds.temperatureMaxF;
    }
    if (
      condition.metric === "heat_index_f" &&
      customThresholds.heatIndexF != null
    ) {
      condition.value = customThresholds.heatIndexF;
    }
    if (condition.metric === "us_aqi" && customThresholds.usAqi != null) {
      condition.value = customThresholds.usAqi;
    }
    if (
      condition.metric === "precipitation_probability" &&
      customThresholds.precipitationProbability != null
    ) {
      condition.value = customThresholds.precipitationProbability;
    }
  }

  return campaign;
}

export function thresholdLabel(campaignId: string): string | null {
  switch (campaignId) {
    case "cold":
      return "Max temperature (°F)";
    case "hot":
      return "Min max temperature (°F)";
    case "heat-index":
      return "Heat index (°F)";
    case "poor-aqi":
      return "Minimum US AQI";
    case "rain":
      return "Rain probability (%)";
    default:
      return null;
  }
}

export function supportsCustomThreshold(campaignId: string): boolean {
  return thresholdLabel(campaignId) != null;
}
