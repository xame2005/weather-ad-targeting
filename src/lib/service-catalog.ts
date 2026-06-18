import type { OutageIndicator, ServiceCategory, ServiceCompany } from "./outage-types";

export const OUTAGE_INDICATORS: OutageIndicator[] = [
  { id: 1, name: "Total blackout" },
  { id: 2, name: "Login / sign-in" },
  { id: 3, name: "Streaming / playback" },
  { id: 4, name: "Mobile data" },
  { id: 5, name: "Voice calls" },
  { id: 6, name: "SMS / messaging" },
  { id: 7, name: "Website access" },
  { id: 8, name: "App crashes" },
  { id: 9, name: "Slow speeds" },
  { id: 10, name: "Wi-Fi connectivity" },
  { id: 11, name: "Server connection" },
  { id: 12, name: "Payment / billing" },
];

export const SERVICE_CATALOG: ServiceCompany[] = [
  {
    slug: "netflix",
    name: "Netflix",
    category: "streaming",
    competitors: ["hulu", "disney-plus", "max", "amazon-prime-video"],
  },
  {
    slug: "hulu",
    name: "Hulu",
    category: "streaming",
    competitors: ["netflix", "disney-plus", "max"],
  },
  {
    slug: "disney-plus",
    name: "Disney+",
    category: "streaming",
    competitors: ["netflix", "hulu", "max"],
  },
  {
    slug: "max",
    name: "Max",
    category: "streaming",
    competitors: ["netflix", "hulu", "disney-plus"],
  },
  {
    slug: "amazon-prime-video",
    name: "Prime Video",
    category: "streaming",
    competitors: ["netflix", "disney-plus", "hulu"],
  },
  {
    slug: "youtube",
    name: "YouTube",
    category: "streaming",
    competitors: ["netflix", "hulu", "tiktok"],
  },
  {
    slug: "spotify",
    name: "Spotify",
    category: "streaming",
    competitors: ["apple-music", "youtube-music"],
  },
  {
    slug: "verizon",
    name: "Verizon",
    category: "cell_networking",
    competitors: ["att", "t-mobile", "visible"],
  },
  {
    slug: "att",
    name: "AT&T",
    category: "cell_networking",
    competitors: ["verizon", "t-mobile", "cricket"],
  },
  {
    slug: "t-mobile",
    name: "T-Mobile",
    category: "cell_networking",
    competitors: ["verizon", "att", "metro-pcs"],
  },
  {
    slug: "comcast-xfinity",
    name: "Xfinity (Comcast)",
    category: "internet_isp",
    competitors: ["spectrum", "att-fiber", "verizon-fios", "starlink"],
  },
  {
    slug: "spectrum",
    name: "Spectrum",
    category: "internet_isp",
    competitors: ["comcast-xfinity", "att-fiber", "verizon-fios"],
  },
  {
    slug: "att-fiber",
    name: "AT&T Fiber",
    category: "internet_isp",
    competitors: ["comcast-xfinity", "spectrum", "verizon-fios"],
  },
  {
    slug: "verizon-fios",
    name: "Verizon Fios",
    category: "internet_isp",
    competitors: ["comcast-xfinity", "spectrum", "att-fiber"],
  },
  {
    slug: "starlink",
    name: "Starlink",
    category: "internet_isp",
    competitors: ["comcast-xfinity", "spectrum", "att-fiber"],
  },
  {
    slug: "xbox-live",
    name: "Xbox Live",
    category: "gaming",
    competitors: ["playstation-network", "steam", "nintendo-online"],
  },
  {
    slug: "playstation-network",
    name: "PlayStation Network",
    category: "gaming",
    competitors: ["xbox-live", "steam", "nintendo-online"],
  },
  {
    slug: "steam",
    name: "Steam",
    category: "gaming",
    competitors: ["xbox-live", "playstation-network", "epic-games"],
  },
  {
    slug: "instagram",
    name: "Instagram",
    category: "social",
    competitors: ["tiktok", "snapchat", "facebook"],
  },
  {
    slug: "facebook",
    name: "Facebook",
    category: "social",
    competitors: ["instagram", "tiktok", "x-twitter"],
  },
  {
    slug: "tiktok",
    name: "TikTok",
    category: "social",
    competitors: ["instagram", "youtube", "snapchat"],
  },
  {
    slug: "x-twitter",
    name: "X (Twitter)",
    category: "social",
    competitors: ["instagram", "facebook", "threads"],
  },
];

export const SERVICE_BY_SLUG = Object.fromEntries(
  SERVICE_CATALOG.map((service) => [service.slug, service]),
);

export function getServicesByCategory(category: ServiceCategory): ServiceCompany[] {
  return SERVICE_CATALOG.filter((service) => service.category === category);
}

export function getIndicatorById(id: number): OutageIndicator | undefined {
  return OUTAGE_INDICATORS.find((indicator) => indicator.id === id);
}

export function getCompetitorsFor(slug: string): ServiceCompany[] {
  const service = SERVICE_BY_SLUG[slug];
  if (!service) return [];
  return service.competitors
    .map((competitorSlug) => SERVICE_BY_SLUG[competitorSlug])
    .filter((item): item is ServiceCompany => item != null);
}
