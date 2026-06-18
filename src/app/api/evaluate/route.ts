import { NextResponse } from "next/server";
import {
  campaignNeedsAirQuality,
  evaluateCampaign,
} from "@/lib/aggregator";
import { getCampaignById, CAMPAIGN_PRESETS } from "@/lib/campaign-presets";
import { fetchForecastsForAllPoints } from "@/lib/weather-client";
import type { EvaluateRequest } from "@/lib/types";

export const maxDuration = 60;

export async function GET() {
  return NextResponse.json({
    campaigns: CAMPAIGN_PRESETS.map(({ id, name, description, color }) => ({
      id,
      name,
      description,
      color,
    })),
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EvaluateRequest;

    if (!body.campaignId || !body.timeframe?.startDate || !body.timeframe?.endDate) {
      return NextResponse.json(
        { error: "campaignId and timeframe (startDate, endDate) are required" },
        { status: 400 },
      );
    }

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

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Evaluation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
