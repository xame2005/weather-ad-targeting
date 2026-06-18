import { US_STATES } from "./state-points";
import {
  OUTAGE_INDICATORS,
  SERVICE_BY_SLUG,
  SERVICE_CATALOG,
} from "./service-catalog";
import type {
  OutageSeverity,
  StateServiceOutage,
} from "./outage-types";

interface Scenario {
  stateAbbrev: string;
  serviceSlug: string;
  reportCount: number;
  baselineCount: number;
  severity: OutageSeverity;
  indicatorIds: number[];
  providers: string[];
}

const DEMO_SCENARIOS: Scenario[] = [
  {
    stateAbbrev: "TX",
    serviceSlug: "netflix",
    reportCount: 2840,
    baselineCount: 420,
    severity: "critical",
    indicatorIds: [3, 7, 8],
    providers: ["AT&T", "Spectrum", "Xfinity"],
  },
  {
    stateAbbrev: "CA",
    serviceSlug: "netflix",
    reportCount: 3120,
    baselineCount: 580,
    severity: "critical",
    indicatorIds: [3, 2],
    providers: ["Comcast", "AT&T Fiber", "T-Mobile"],
  },
  {
    stateAbbrev: "FL",
    serviceSlug: "netflix",
    reportCount: 890,
    baselineCount: 310,
    severity: "major",
    indicatorIds: [3, 9],
    providers: ["Xfinity", "Spectrum", "Verizon"],
  },
  {
    stateAbbrev: "NY",
    serviceSlug: "hulu",
    reportCount: 720,
    baselineCount: 180,
    severity: "major",
    indicatorIds: [3, 2],
    providers: ["Verizon Fios", "Spectrum", "Optimum"],
  },
  {
    stateAbbrev: "GA",
    serviceSlug: "disney-plus",
    reportCount: 540,
    baselineCount: 120,
    severity: "elevated",
    indicatorIds: [3, 8],
    providers: ["Xfinity", "AT&T"],
  },
  {
    stateAbbrev: "OH",
    serviceSlug: "verizon",
    reportCount: 1650,
    baselineCount: 280,
    severity: "critical",
    indicatorIds: [4, 5, 6],
    providers: ["Verizon Wireless"],
  },
  {
    stateAbbrev: "PA",
    serviceSlug: "verizon",
    reportCount: 980,
    baselineCount: 220,
    severity: "major",
    indicatorIds: [4, 9],
    providers: ["Verizon Wireless", "Verizon Fios"],
  },
  {
    stateAbbrev: "NJ",
    serviceSlug: "att",
    reportCount: 1120,
    baselineCount: 260,
    severity: "major",
    indicatorIds: [4, 5, 6],
    providers: ["AT&T Mobility"],
  },
  {
    stateAbbrev: "IL",
    serviceSlug: "t-mobile",
    reportCount: 780,
    baselineCount: 190,
    severity: "elevated",
    indicatorIds: [4, 6],
    providers: ["T-Mobile"],
  },
  {
    stateAbbrev: "MI",
    serviceSlug: "comcast-xfinity",
    reportCount: 1340,
    baselineCount: 240,
    severity: "critical",
    indicatorIds: [1, 7, 9, 10],
    providers: ["Comcast Xfinity"],
  },
  {
    stateAbbrev: "WA",
    serviceSlug: "comcast-xfinity",
    reportCount: 620,
    baselineCount: 150,
    severity: "major",
    indicatorIds: [7, 9],
    providers: ["Comcast Xfinity", "CenturyLink"],
  },
  {
    stateAbbrev: "AZ",
    serviceSlug: "spectrum",
    reportCount: 890,
    baselineCount: 170,
    severity: "major",
    indicatorIds: [1, 7, 9],
    providers: ["Spectrum"],
  },
  {
    stateAbbrev: "NC",
    serviceSlug: "spectrum",
    reportCount: 510,
    baselineCount: 130,
    severity: "elevated",
    indicatorIds: [9, 10],
    providers: ["Spectrum", "AT&T"],
  },
  {
    stateAbbrev: "CO",
    serviceSlug: "xbox-live",
    reportCount: 430,
    baselineCount: 85,
    severity: "elevated",
    indicatorIds: [11, 8],
    providers: ["Xfinity", "CenturyLink"],
  },
  {
    stateAbbrev: "VA",
    serviceSlug: "playstation-network",
    reportCount: 380,
    baselineCount: 70,
    severity: "elevated",
    indicatorIds: [11, 2],
    providers: ["Verizon Fios", "Xfinity"],
  },
  {
    stateAbbrev: "MA",
    serviceSlug: "instagram",
    reportCount: 920,
    baselineCount: 200,
    severity: "major",
    indicatorIds: [2, 7, 8],
    providers: ["Verizon", "Comcast", "T-Mobile"],
  },
  {
    stateAbbrev: "TN",
    serviceSlug: "att-fiber",
    reportCount: 440,
    baselineCount: 90,
    severity: "elevated",
    indicatorIds: [9, 10],
    providers: ["AT&T Fiber"],
  },
  {
    stateAbbrev: "MO",
    serviceSlug: "steam",
    reportCount: 290,
    baselineCount: 55,
    severity: "elevated",
    indicatorIds: [11, 7],
    providers: ["Spectrum", "AT&T"],
  },
  {
    stateAbbrev: "MN",
    serviceSlug: "youtube",
    reportCount: 680,
    baselineCount: 160,
    severity: "major",
    indicatorIds: [3, 7],
    providers: ["CenturyLink", "Xfinity"],
  },
  {
    stateAbbrev: "OR",
    serviceSlug: "starlink",
    reportCount: 210,
    baselineCount: 45,
    severity: "elevated",
    indicatorIds: [9, 10],
    providers: ["Starlink"],
  },
  {
    stateAbbrev: "LA",
    serviceSlug: "tiktok",
    reportCount: 560,
    baselineCount: 140,
    severity: "elevated",
    indicatorIds: [7, 8],
    providers: ["AT&T", "T-Mobile", "Xfinity"],
  },
  {
    stateAbbrev: "SC",
    serviceSlug: "max",
    reportCount: 320,
    baselineCount: 75,
    severity: "elevated",
    indicatorIds: [3, 2],
    providers: ["Spectrum", "AT&T"],
  },
  {
    stateAbbrev: "IN",
    serviceSlug: "facebook",
    reportCount: 410,
    baselineCount: 95,
    severity: "elevated",
    indicatorIds: [2, 7],
    providers: ["Xfinity", "Verizon"],
  },
  {
    stateAbbrev: "NV",
    serviceSlug: "spotify",
    reportCount: 180,
    baselineCount: 40,
    severity: "normal",
    indicatorIds: [3],
    providers: ["Cox", "AT&T"],
  },
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

function severityFromSpike(spikeRatio: number, reportCount: number): OutageSeverity {
  if (spikeRatio >= 4 && reportCount >= 150) return "critical";
  if (spikeRatio >= 2.5 && reportCount >= 80) return "major";
  if (spikeRatio >= 1.8 && reportCount >= 40) return "elevated";
  return "normal";
}

function pickIndicators(category: string, rand: () => number): number[] {
  const byCategory: Record<string, number[]> = {
    streaming: [2, 3, 7, 8, 9],
    cell_networking: [4, 5, 6, 9],
    internet_isp: [1, 7, 9, 10],
    gaming: [2, 8, 11],
    social: [2, 7, 8],
  };
  const pool = byCategory[category] ?? [7, 9];
  const count = 1 + Math.floor(rand() * 2);
  const shuffled = [...pool].sort(() => rand() - 0.5);
  return shuffled.slice(0, count);
}

const PROVIDERS_BY_CATEGORY: Record<string, string[]> = {
  streaming: ["Comcast", "Spectrum", "AT&T", "Verizon", "T-Mobile"],
  cell_networking: ["Verizon Wireless", "AT&T Mobility", "T-Mobile"],
  internet_isp: ["Comcast Xfinity", "Spectrum", "AT&T Fiber", "CenturyLink"],
  gaming: ["Xfinity", "Spectrum", "AT&T"],
  social: ["Verizon", "AT&T", "T-Mobile", "Comcast"],
};

function buildOutage(
  stateAbbrev: string,
  serviceSlug: string,
  reportCount: number,
  baselineCount: number,
  severity: OutageSeverity,
  indicatorIds: number[],
  providers: string[],
): StateServiceOutage {
  return {
    stateAbbrev,
    serviceSlug,
    reportCount,
    baselineCount,
    spikeRatio: Math.round((reportCount / baselineCount) * 10) / 10,
    severity,
    indicators: indicatorIds
      .map((id) => OUTAGE_INDICATORS.find((item) => item.id === id))
      .filter((item): item is (typeof OUTAGE_INDICATORS)[number] => item != null),
    providers,
  };
}

export function generateDemoOutageData(): StateServiceOutage[] {
  const outages: StateServiceOutage[] = [];

  for (const scenario of DEMO_SCENARIOS) {
    outages.push(
      buildOutage(
        scenario.stateAbbrev,
        scenario.serviceSlug,
        scenario.reportCount,
        scenario.baselineCount,
        scenario.severity,
        scenario.indicatorIds,
        scenario.providers,
      ),
    );
  }

  for (const state of US_STATES) {
    for (const service of SERVICE_CATALOG) {
      const alreadyExists = outages.some(
        (outage) =>
          outage.stateAbbrev === state.abbrev &&
          outage.serviceSlug === service.slug,
      );
      if (alreadyExists) continue;

      const rand = seededRandom(
        hashString(`${state.abbrev}-${service.slug}-outage`),
      );
      const baselineCount = Math.round(30 + rand() * 120);
      const spikeRoll = rand();

      if (spikeRoll < 0.82) continue;

      const spikeMultiplier = 1.5 + rand() * 2.5;
      const reportCount = Math.round(baselineCount * spikeMultiplier);
      const severity = severityFromSpike(spikeMultiplier, reportCount);

      if (severity === "normal") continue;

      outages.push(
        buildOutage(
          state.abbrev,
          service.slug,
          reportCount,
          baselineCount,
          severity,
          pickIndicators(service.category, rand),
          PROVIDERS_BY_CATEGORY[service.category] ?? ["Unknown ISP"],
        ),
      );
    }
  }

  return outages;
}

export function getDemoOutageSnapshot() {
  return {
    generatedAt: new Date().toISOString(),
    dataSource: "demo" as const,
    site: { id: 3, country_iso: "US", name: "United States" },
    outages: generateDemoOutageData(),
    services: SERVICE_CATALOG.map(({ slug, name, category, competitors }) => ({
      slug,
      name,
      category,
      competitors,
    })),
  };
}
