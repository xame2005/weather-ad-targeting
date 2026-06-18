import { getOutageCampaignById } from "./outage-campaign-presets";
import { SERVICE_BY_SLUG } from "./service-catalog";
import { generateDemoOutageData } from "./outage-demo-data";
import { US_STATES } from "./state-points";
import type {
  OutageCampaign,
  OutageEvaluationResult,
  OutageSeverity,
  OutageStateResult,
  OutageStateService,
  StateServiceOutage,
} from "./outage-types";
import { SEVERITY_RANK } from "./outage-types";
import { round } from "./units";

function meetsSeverity(
  severity: OutageSeverity,
  minimum: OutageSeverity,
): boolean {
  return SEVERITY_RANK[severity] >= SEVERITY_RANK[minimum];
}

function outageMatchesCampaign(
  outage: StateServiceOutage,
  campaign: OutageCampaign,
): boolean {
  const service = SERVICE_BY_SLUG[outage.serviceSlug];
  if (!service) return false;

  if (
    campaign.targetServiceSlug &&
    outage.serviceSlug !== campaign.targetServiceSlug
  ) {
    return false;
  }

  if (campaign.category && service.category !== campaign.category) {
    return false;
  }

  if (outage.reportCount < campaign.minReportCount) return false;
  if (outage.spikeRatio < campaign.minSpikeRatio) return false;
  if (!meetsSeverity(outage.severity, campaign.minSeverity)) return false;

  return true;
}

function toStateService(outage: StateServiceOutage): OutageStateService {
  const service = SERVICE_BY_SLUG[outage.serviceSlug];
  return {
    slug: outage.serviceSlug,
    name: service?.name ?? outage.serviceSlug,
    category: service?.category ?? "streaming",
    reportCount: outage.reportCount,
    baselineCount: outage.baselineCount,
    spikeRatio: outage.spikeRatio,
    severity: outage.severity,
    indicators: outage.indicators.map((indicator) => indicator.name),
    providers: outage.providers,
  };
}

function worstSeverity(services: OutageStateService[]): OutageSeverity {
  let worst: OutageSeverity = "normal";
  for (const service of services) {
    if (SEVERITY_RANK[service.severity] > SEVERITY_RANK[worst]) {
      worst = service.severity;
    }
  }
  return worst;
}

export function evaluateOutageCampaign(
  campaign: OutageCampaign,
  outages: StateServiceOutage[],
): OutageEvaluationResult {
  const byState = new Map<string, OutageStateService[]>();

  for (const outage of outages) {
    if (!outageMatchesCampaign(outage, campaign)) continue;

    const existing = byState.get(outage.stateAbbrev) ?? [];
    existing.push(toStateService(outage));
    byState.set(outage.stateAbbrev, existing);
  }

  const states: OutageStateResult[] = US_STATES.map((stateDef) => {
    const services = byState.get(stateDef.abbrev) ?? [];
    const matched = services.length > 0;
    const totalReports = services.reduce(
      (sum, service) => sum + service.reportCount,
      0,
    );
    const maxSpikeRatio =
      services.length > 0
        ? Math.max(...services.map((service) => service.spikeRatio))
        : 0;

    const matchIntensity = matched
      ? Math.min(1, maxSpikeRatio / 6)
      : 0;

    return {
      stateAbbrev: stateDef.abbrev,
      stateName: stateDef.name,
      fips: stateDef.fips,
      matched,
      matchIntensity,
      totalReports,
      maxSpikeRatio: round(maxSpikeRatio, 1),
      worstSeverity: worstSeverity(services),
      services: services.sort((a, b) => b.reportCount - a.reportCount),
    };
  }).sort((a, b) => b.totalReports - a.totalReports);

  return {
    campaign,
    evaluatedAt: new Date().toISOString(),
    dataSource: "demo",
    states,
    matchedCount: states.filter((state) => state.matched).length,
  };
}

export function evaluateOutageCampaignById(
  campaignId: string,
): OutageEvaluationResult | null {
  const campaign = getOutageCampaignById(campaignId);
  if (!campaign) return null;
  return evaluateOutageCampaign(campaign, generateDemoOutageData());
}

export function outageResultToCsv(result: OutageEvaluationResult): string {
  const header =
    "state_abbrev,state_name,fips,matched,total_reports,max_spike_ratio,worst_severity,services_down,competitor_opportunity";

  const rows = result.states.map((state) => {
    const competitors = state.services.flatMap((service) => {
      const catalog = SERVICE_BY_SLUG[service.slug];
      return catalog?.competitors ?? [];
    });
    const uniqueCompetitors = [...new Set(competitors)].join("|");

    return [
      state.stateAbbrev,
      `"${state.stateName}"`,
      state.fips,
      state.matched,
      state.totalReports,
      state.maxSpikeRatio,
      state.worstSeverity,
      `"${state.services.map((s) => s.name).join(", ")}"`,
      `"${uniqueCompetitors}"`,
    ].join(",");
  });

  return [header, ...rows].join("\n");
}

export function getCompetitorSuggestions(
  result: OutageEvaluationResult,
  stateAbbrev: string,
): string[] {
  const state = result.states.find((item) => item.stateAbbrev === stateAbbrev);
  if (!state) return [];

  const slugs = new Set<string>();
  for (const service of state.services) {
    const catalog = SERVICE_BY_SLUG[service.slug];
    catalog?.competitors.forEach((slug) => slugs.add(slug));
  }

  return [...slugs]
    .map((slug) => SERVICE_BY_SLUG[slug]?.name)
    .filter((name): name is string => name != null);
}
