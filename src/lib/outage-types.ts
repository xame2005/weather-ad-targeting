export type ServiceCategory =
  | "streaming"
  | "cell_networking"
  | "internet_isp"
  | "gaming"
  | "social";

export type OutageSeverity = "normal" | "elevated" | "major" | "critical";

export interface ServiceCompany {
  slug: string;
  name: string;
  category: ServiceCategory;
  competitors: string[];
}

export interface OutageIndicator {
  id: number;
  name: string;
}

export interface StateServiceOutage {
  stateAbbrev: string;
  serviceSlug: string;
  reportCount: number;
  baselineCount: number;
  spikeRatio: number;
  severity: OutageSeverity;
  indicators: OutageIndicator[];
  providers: string[];
}

export interface OutageCampaign {
  id: string;
  name: string;
  description: string;
  color: string;
  category?: ServiceCategory;
  targetServiceSlug?: string;
  minReportCount: number;
  minSpikeRatio: number;
  minSeverity: OutageSeverity;
}

export interface OutageStateService {
  slug: string;
  name: string;
  category: ServiceCategory;
  reportCount: number;
  baselineCount: number;
  spikeRatio: number;
  severity: OutageSeverity;
  indicators: string[];
  providers: string[];
}

export interface OutageStateResult {
  stateAbbrev: string;
  stateName: string;
  fips: string;
  matched: boolean;
  matchIntensity: number;
  totalReports: number;
  maxSpikeRatio: number;
  worstSeverity: OutageSeverity;
  services: OutageStateService[];
}

export interface OutageEvaluationResult {
  campaign: OutageCampaign;
  evaluatedAt: string;
  dataSource: "demo";
  states: OutageStateResult[];
  matchedCount: number;
}

export interface OutageEvaluateRequest {
  campaignId: string;
}

export interface MapViewState {
  stateAbbrev: string;
  stateName: string;
  matched: boolean;
  matchIntensity: number;
}

export const SEVERITY_RANK: Record<OutageSeverity, number> = {
  normal: 0,
  elevated: 1,
  major: 2,
  critical: 3,
};

export const SEVERITY_LABELS: Record<OutageSeverity, string> = {
  normal: "Normal",
  elevated: "Elevated",
  major: "Major outage",
  critical: "Critical outage",
};

export const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  streaming: "Streaming",
  cell_networking: "Cell / Mobile",
  internet_isp: "Internet / ISP",
  gaming: "Gaming",
  social: "Social Media",
};
