import { NextResponse } from "next/server";
import { evaluateOutageCampaignById } from "@/lib/outage-engine";
import { OUTAGE_CAMPAIGN_PRESETS } from "@/lib/outage-campaign-presets";
import { getDemoOutageSnapshot } from "@/lib/outage-demo-data";
import type { OutageEvaluateRequest } from "@/lib/outage-types";

export async function GET() {
  return NextResponse.json({
    campaigns: OUTAGE_CAMPAIGN_PRESETS.map(
      ({ id, name, description, color, category, targetServiceSlug }) => ({
        id,
        name,
        description,
        color,
        category,
        targetServiceSlug,
      }),
    ),
    snapshot: {
      generatedAt: getDemoOutageSnapshot().generatedAt,
      serviceCount: getDemoOutageSnapshot().services.length,
      activeOutageCount: getDemoOutageSnapshot().outages.length,
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as OutageEvaluateRequest;

    if (!body.campaignId) {
      return NextResponse.json(
        { error: "campaignId is required" },
        { status: 400 },
      );
    }

    const result = evaluateOutageCampaignById(body.campaignId);
    if (!result) {
      return NextResponse.json(
        { error: `Unknown outage campaign: ${body.campaignId}` },
        { status: 404 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Outage evaluation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
