import type {
  CampaignCriteria,
  ConditionRule,
  PointForecastDay,
  WeatherMetric,
} from "./types";

function getMetricValue(
  day: PointForecastDay,
  metric: WeatherMetric,
): number | string | null {
  switch (metric) {
    case "temperature_max_f":
      return day.temperatureMaxF;
    case "temperature_min_f":
      return day.temperatureMinF;
    case "feels_like_max_f":
      return day.feelsLikeMaxF;
    case "heat_index_f":
      return day.heatIndexF;
    case "precipitation_probability":
      return day.precipitationProbability;
    case "precipitation_type":
      return day.precipitationType;
    case "thunderstorm_probability":
      return day.thunderstormProbability;
    case "relative_humidity":
      return day.relativeHumidity;
    case "uv_index":
      return day.uvIndex;
    case "us_aqi":
      return day.usAqi;
    default:
      return null;
  }
}

function evaluateCondition(
  day: PointForecastDay,
  rule: ConditionRule,
): boolean {
  const value = getMetricValue(day, rule.metric);

  if (value === null || value === undefined) {
    return false;
  }

  switch (rule.op) {
    case "lte":
      return typeof value === "number" && value <= (rule.value as number);
    case "gte":
      return typeof value === "number" && value >= (rule.value as number);
    case "eq":
      return value === rule.value;
    case "in":
      return (rule.value as string[]).includes(String(value));
    default:
      return false;
  }
}

export function evaluateDayAgainstCriteria(
  day: PointForecastDay,
  criteria: CampaignCriteria,
): boolean {
  const results = criteria.conditions.map((condition) =>
    evaluateCondition(day, condition),
  );

  return criteria.operator === "AND"
    ? results.every(Boolean)
    : results.some(Boolean);
}

export function evaluatePointAcrossTimeframe(
  days: PointForecastDay[],
  criteria: CampaignCriteria,
): boolean {
  if (days.length === 0) {
    return false;
  }

  return days.every((day) => evaluateDayAgainstCriteria(day, criteria));
}
