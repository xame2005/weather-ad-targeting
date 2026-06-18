import { DMA_BY_CODE, US_DMA_MARKETS } from "./dma-markets";
import { evaluatePointAcrossTimeframe } from "./rules-engine";
import { STATE_BY_ABBREV, US_STATES } from "./state-points";
import type {
  CampaignConfig,
  DmaMatchResult,
  EvaluationResult,
  GeoLevel,
  PointForecast,
  PrecipitationType,
  StateMatchResult,
  Timeframe,
} from "./types";
import { round } from "./units";

function dominantPrecipType(types: PrecipitationType[]): PrecipitationType {
  const counts = new Map<PrecipitationType, number>();
  for (const type of types) {
    counts.set(type, (counts.get(type) ?? 0) + 1);
  }

  let best: PrecipitationType = "NONE";
  let bestCount = -1;

  for (const [type, count] of counts) {
    if (count > bestCount) {
      best = type;
      bestCount = count;
    }
  }

  return best;
}

function summarizeDays(days: PointForecast["days"]) {
  const avgMaxTempF =
    days.length > 0
      ? round(
          days.reduce((sum, day) => sum + day.temperatureMaxF, 0) / days.length,
        )
      : 0;

  const avgMinTempF =
    days.length > 0
      ? round(
          days.reduce((sum, day) => sum + day.temperatureMinF, 0) / days.length,
        )
      : 0;

  const avgPrecipProbability =
    days.length > 0
      ? round(
          days.reduce((sum, day) => sum + day.precipitationProbability, 0) /
            days.length,
        )
      : 0;

  const aqiValues = days
    .map((day) => day.usAqi)
    .filter((value): value is number => value != null);

  const avgUsAqi =
    aqiValues.length > 0
      ? round(aqiValues.reduce((sum, value) => sum + value, 0) / aqiValues.length)
      : null;

  return {
    avgMaxTempF,
    avgMinTempF,
    avgPrecipProbability,
    dominantPrecipType: dominantPrecipType(days.map((day) => day.precipitationType)),
    avgUsAqi,
  };
}

function aggregateStateResult(
  stateAbbrev: string,
  pointResults: Array<{
    matched: boolean;
    days: PointForecast["days"];
  }>,
): StateMatchResult {
  const stateDef = STATE_BY_ABBREV[stateAbbrev];
  const matchingPoints = pointResults.filter((result) => result.matched).length;
  const totalPoints = pointResults.length;
  const matchRatio = totalPoints > 0 ? matchingPoints / totalPoints : 0;
  const allDays = pointResults.flatMap((result) => result.days);

  return {
    stateAbbrev,
    stateName: stateDef.name,
    fips: stateDef.fips,
    matchRatio,
    matched: false,
    matchingPoints,
    totalPoints,
    summary: summarizeDays(allDays),
  };
}

function evaluateStateLevel(
  campaign: CampaignConfig,
  forecasts: PointForecast[],
  threshold: number,
): StateMatchResult[] {
  const byState = new Map<
    string,
    Array<{ matched: boolean; days: PointForecast["days"] }>
  >();

  for (const forecast of forecasts) {
    if (!forecast.stateAbbrev) continue;

    const matched = evaluatePointAcrossTimeframe(
      forecast.days,
      campaign.criteria,
    );

    const existing = byState.get(forecast.stateAbbrev) ?? [];
    existing.push({ matched, days: forecast.days });
    byState.set(forecast.stateAbbrev, existing);
  }

  return US_STATES.map((stateDef) => {
    const pointResults = byState.get(stateDef.abbrev) ?? [];
    const result = aggregateStateResult(stateDef.abbrev, pointResults);
    result.matched = result.matchRatio >= threshold;
    return result;
  }).sort((a, b) => b.matchRatio - a.matchRatio);
}

function evaluateDmaLevel(
  campaign: CampaignConfig,
  forecasts: PointForecast[],
): DmaMatchResult[] {
  return US_DMA_MARKETS.map((dma) => {
    const forecast = forecasts.find((item) => item.dmaCode === dma.code);
    const matched = forecast
      ? evaluatePointAcrossTimeframe(forecast.days, campaign.criteria)
      : false;

    return {
      dmaCode: dma.code,
      dmaName: dma.name,
      dmaRank: dma.rank,
      matched,
      matchRatio: matched ? 1 : 0,
      summary: summarizeDays(forecast?.days ?? []),
    };
  }).sort((a, b) => {
    if (a.matched !== b.matched) return a.matched ? -1 : 1;
    return a.dmaRank - b.dmaRank;
  });
}

export function evaluateCampaign(
  campaign: CampaignConfig,
  timeframe: Timeframe,
  forecasts: PointForecast[],
  minMatchRatio?: number,
  dataSource: "live" | "demo" = "demo",
  geoLevel: GeoLevel = "state",
): EvaluationResult {
  const threshold = minMatchRatio ?? campaign.minMatchRatio;
  const states =
    geoLevel === "state" ? evaluateStateLevel(campaign, forecasts, threshold) : [];
  const dmas = geoLevel === "dma" ? evaluateDmaLevel(campaign, forecasts) : [];
  const matchedCount =
    geoLevel === "dma"
      ? dmas.filter((dma) => dma.matched).length
      : states.filter((state) => state.matched).length;

  return {
    campaign,
    timeframe,
    evaluatedAt: new Date().toISOString(),
    dataSource,
    geoLevel,
    states,
    dmas,
    matchedCount,
  };
}

export function toCsv(result: EvaluationResult): string {
  if (result.geoLevel === "dma") {
    const header =
      "dma_code,dma_name,dma_rank,matched,avg_max_temp_f,avg_min_temp_f,avg_precip_probability,dominant_precip_type,avg_us_aqi";

    const rows = result.dmas.map((dma) =>
      [
        dma.dmaCode,
        `"${dma.dmaName}"`,
        dma.dmaRank,
        dma.matched,
        dma.summary.avgMaxTempF,
        dma.summary.avgMinTempF,
        dma.summary.avgPrecipProbability,
        dma.summary.dominantPrecipType,
        dma.summary.avgUsAqi ?? "",
      ].join(","),
    );

    return [header, ...rows].join("\n");
  }

  const header =
    "state_abbrev,state_name,fips,matched,match_ratio,matching_points,total_points,avg_max_temp_f,avg_min_temp_f,avg_precip_probability,dominant_precip_type,avg_us_aqi";

  const rows = result.states.map((state) =>
    [
      state.stateAbbrev,
      `"${state.stateName}"`,
      state.fips,
      state.matched,
      round(state.matchRatio, 2),
      state.matchingPoints,
      state.totalPoints,
      state.summary.avgMaxTempF,
      state.summary.avgMinTempF,
      state.summary.avgPrecipProbability,
      state.summary.dominantPrecipType,
      state.summary.avgUsAqi ?? "",
    ].join(","),
  );

  return [header, ...rows].join("\n");
}

export function matchedStatesOnly(result: EvaluationResult): StateMatchResult[] {
  return result.states.filter((state) => state.matched);
}

export function matchedDmasOnly(result: EvaluationResult): DmaMatchResult[] {
  return result.dmas.filter((dma) => dma.matched);
}

export function campaignNeedsAirQuality(campaign: CampaignConfig): boolean {
  return campaign.criteria.conditions.some(
    (condition) => condition.metric === "us_aqi",
  );
}

export function getDmaByCode(code: number) {
  return DMA_BY_CODE[code];
}
