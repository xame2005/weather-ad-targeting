export type ComparisonOp = "lte" | "gte" | "eq" | "in";

export type WeatherMetric =
  | "temperature_max_f"
  | "temperature_min_f"
  | "feels_like_max_f"
  | "heat_index_f"
  | "precipitation_probability"
  | "precipitation_type"
  | "thunderstorm_probability"
  | "relative_humidity"
  | "uv_index"
  | "us_aqi";

export type PrecipitationType =
  | "RAIN"
  | "SNOW"
  | "ICE"
  | "MIX"
  | "RAIN_AND_SNOW"
  | "NONE";

export interface ConditionRule {
  metric: WeatherMetric;
  op: ComparisonOp;
  value: number | string | string[];
}

export interface CampaignCriteria {
  operator: "AND" | "OR";
  conditions: ConditionRule[];
}

export interface CampaignConfig {
  id: string;
  name: string;
  description: string;
  color: string;
  criteria: CampaignCriteria;
  minMatchRatio: number;
}

export interface Timeframe {
  startDate: string;
  endDate: string;
}

export interface SamplePoint {
  name: string;
  latitude: number;
  longitude: number;
}

export interface StateDefinition {
  abbrev: string;
  name: string;
  fips: string;
  points: SamplePoint[];
}

export interface PointForecastDay {
  date: string;
  temperatureMaxF: number;
  temperatureMinF: number;
  feelsLikeMaxF: number;
  heatIndexF: number;
  precipitationProbability: number;
  precipitationType: PrecipitationType;
  thunderstormProbability: number;
  relativeHumidity: number;
  uvIndex: number;
  usAqi: number | null;
}

export interface PointForecast {
  stateAbbrev?: string;
  dmaCode?: number;
  dmaName?: string;
  pointName: string;
  latitude: number;
  longitude: number;
  days: PointForecastDay[];
}

export interface StateMatchResult {
  stateAbbrev: string;
  stateName: string;
  fips: string;
  matchRatio: number;
  matched: boolean;
  matchingPoints: number;
  totalPoints: number;
  summary: {
    avgMaxTempF: number;
    avgMinTempF: number;
    avgPrecipProbability: number;
    dominantPrecipType: PrecipitationType;
    avgUsAqi: number | null;
  };
}

export type GeoLevel = "state" | "dma";

export interface EvaluateRequest {
  campaignId: string;
  timeframe: Timeframe;
  minMatchRatio?: number;
  geoLevel?: GeoLevel;
}

export interface DmaMatchResult {
  dmaCode: number;
  dmaName: string;
  dmaRank: number;
  matched: boolean;
  matchRatio: number;
  summary: StateMatchResult["summary"];
}

export interface EvaluationResult {
  campaign: CampaignConfig;
  timeframe: Timeframe;
  evaluatedAt: string;
  dataSource: "live" | "demo";
  geoLevel: GeoLevel;
  states: StateMatchResult[];
  dmas: DmaMatchResult[];
  matchedCount: number;
}
