import { evaluatePointAcrossTimeframe } from "./rules-engine";
import { STATE_BY_ABBREV, US_STATES } from "./state-points";
import type {
  CampaignConfig,
  EvaluationResult,
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

  const avgMaxTempF =
    allDays.length > 0
      ? round(
          allDays.reduce((sum, day) => sum + day.temperatureMaxF, 0) /
            allDays.length,
        )
      : 0;

  const avgMinTempF =
    allDays.length > 0
      ? round(
          allDays.reduce((sum, day) => sum + day.temperatureMinF, 0) /
            allDays.length,
        )
      : 0;

  const avgPrecipProbability =
    allDays.length > 0
      ? round(
          allDays.reduce((sum, day) => sum + day.precipitationProbability, 0) /
            allDays.length,
        )
      : 0;

  const aqiValues = allDays
    .map((day) => day.usAqi)
    .filter((value): value is number => value != null);

  const avgUsAqi =
    aqiValues.length > 0
      ? round(aqiValues.reduce((sum, value) => sum + value, 0) / aqiValues.length)
      : null;

  return {
    stateAbbrev,
    stateName: stateDef.name,
    fips: stateDef.fips,
    matchRatio,
    matched: false,
    matchingPoints,
    totalPoints,
    summary: {
      avgMaxTempF,
      avgMinTempF,
      avgPrecipProbability,
      dominantPrecipType: dominantPrecipType(
        allDays.map((day) => day.precipitationType),
      ),
      avgUsAqi,
    },
  };
}

export function evaluateCampaign(
  campaign: CampaignConfig,
  timeframe: Timeframe,
  forecasts: PointForecast[],
  minMatchRatio?: number,
  dataSource: "live" | "demo" = "demo",
): EvaluationResult {
  const threshold = minMatchRatio ?? campaign.minMatchRatio;

  const byState = new Map<
    string,
    Array<{ matched: boolean; days: PointForecast["days"] }>
  >();

  for (const forecast of forecasts) {
    const matched = evaluatePointAcrossTimeframe(
      forecast.days,
      campaign.criteria,
    );

    const existing = byState.get(forecast.stateAbbrev) ?? [];
    existing.push({ matched, days: forecast.days });
    byState.set(forecast.stateAbbrev, existing);
  }

  const states: StateMatchResult[] = US_STATES.map((stateDef) => {
    const pointResults = byState.get(stateDef.abbrev) ?? [];
    const result = aggregateStateResult(stateDef.abbrev, pointResults);
    result.matched = result.matchRatio >= threshold;
    return result;
  }).sort((a, b) => b.matchRatio - a.matchRatio);

  return {
    campaign,
    timeframe,
    evaluatedAt: new Date().toISOString(),
    dataSource,
    states,
    matchedCount: states.filter((state) => state.matched).length,
  };
}

export function toCsv(result: EvaluationResult): string {
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

export function campaignNeedsAirQuality(campaign: CampaignConfig): boolean {
  return campaign.criteria.conditions.some(
    (condition) => condition.metric === "us_aqi",
  );
}
