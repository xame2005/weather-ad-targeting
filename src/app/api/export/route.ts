import { NextResponse } from "next/server";
import {
  campaignNeedsAirQuality,
  evaluateCampaign,
  toCsv,
} from "@/lib/aggregator";
import { getCampaignById } from "@/lib/campaign-presets";
import { fetchForecastsForAllPoints } from "@/lib/weather-client";
import type { EvaluateRequest } from "@/lib/types";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EvaluateRequest;

    const campaign = getCampaignById(body.campaignId);
    if (!campaign) {
      return NextResponse.json(
        { error: `Unknown campaign: ${body.campaignId}` },
        { status: 404 },
      );
    }

    const geoLevel = body.geoLevel ?? "state";

    const { forecasts, dataSource } = await fetchForecastsForAllPoints(
      body.timeframe.startDate,
      body.timeframe.endDate,
      campaignNeedsAirQuality(campaign),
      geoLevel,
    );

    const result = evaluateCampaign(
      campaign,
      body.timeframe,
      forecasts,
      body.minMatchRatio,
      dataSource,
      geoLevel,
    );

    const csv = toCsv(result);
    const suffix = geoLevel === "dma" ? "dma" : "states";
    const filename = `weather-targeting-${campaign.id}-${suffix}-${body.timeframe.startDate}-to-${body.timeframe.endDate}.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
