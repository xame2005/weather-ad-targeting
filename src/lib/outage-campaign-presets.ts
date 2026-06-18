import type { OutageCampaign } from "./outage-types";

export const OUTAGE_CAMPAIGN_PRESETS: OutageCampaign[] = [
  {
    id: "competitor-netflix",
    name: "Competitor: Netflix Down",
    description:
      "Target states reporting Netflix outages — ideal for Hulu, Disney+, or Max conquest ads.",
    color: "#dc2626",
    targetServiceSlug: "netflix",
    minReportCount: 80,
    minSpikeRatio: 2.5,
    minSeverity: "elevated",
  },
  {
    id: "competitor-verizon",
    name: "Competitor: Verizon Down",
    description:
      "Target states with Verizon cell/network issues — switch campaigns for AT&T or T-Mobile.",
    color: "#7c3aed",
    targetServiceSlug: "verizon",
    minReportCount: 60,
    minSpikeRatio: 2,
    minSeverity: "elevated",
  },
  {
    id: "competitor-comcast",
    name: "Competitor: Xfinity Down",
    description:
      "Target states with Comcast/Xfinity ISP outages — pitch Spectrum, fiber, or Starlink.",
    color: "#0891b2",
    targetServiceSlug: "comcast-xfinity",
    minReportCount: 70,
    minSpikeRatio: 2.5,
    minSeverity: "elevated",
  },
  {
    id: "streaming-outages",
    name: "Any Streaming Outage",
    description:
      "Any state with elevated streaming service reports — broad conquest opportunity.",
    color: "#e11d48",
    category: "streaming",
    minReportCount: 100,
    minSpikeRatio: 2,
    minSeverity: "major",
  },
  {
    id: "cell-outages",
    name: "Any Cell Network Outage",
    description:
      "States with mobile carrier disruptions — target switchers with competitor offers.",
    color: "#9333ea",
    category: "cell_networking",
    minReportCount: 90,
    minSpikeRatio: 2,
    minSeverity: "major",
  },
  {
    id: "internet-outages",
    name: "Any Internet / ISP Outage",
    description:
      "States with ISP or broadband outages — promote alternative providers.",
    color: "#2563eb",
    category: "internet_isp",
    minReportCount: 80,
    minSpikeRatio: 2.5,
    minSeverity: "major",
  },
  {
    id: "gaming-outages",
    name: "Any Gaming Outage",
    description:
      "Xbox, PlayStation, or Steam disruption zones — cross-platform gaming ads.",
    color: "#16a34a",
    category: "gaming",
    minReportCount: 50,
    minSpikeRatio: 2,
    minSeverity: "elevated",
  },
  {
    id: "critical-any",
    name: "Critical Outages (Any Service)",
    description:
      "States with critical-level reports on any tracked service — high-intent switcher audience.",
    color: "#b45309",
    minReportCount: 150,
    minSpikeRatio: 4,
    minSeverity: "critical",
  },
];

export function getOutageCampaignById(id: string): OutageCampaign | undefined {
  return OUTAGE_CAMPAIGN_PRESETS.find((campaign) => campaign.id === id);
}
