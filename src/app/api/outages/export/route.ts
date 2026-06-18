import { NextResponse } from "next/server";
import {
  evaluateOutageCampaignById,
  outageResultToCsv,
} from "@/lib/outage-engine";
import type { OutageEvaluateRequest } from "@/lib/outage-types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as OutageEvaluateRequest;

    const result = evaluateOutageCampaignById(body.campaignId);
    if (!result) {
      return NextResponse.json(
        { error: `Unknown outage campaign: ${body.campaignId}` },
        { status: 404 },
      );
    }

    const csv = outageResultToCsv(result);
    const filename = `outage-targeting-${result.campaign.id}.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
