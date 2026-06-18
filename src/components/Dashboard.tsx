"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import {
  CampaignPanel,
  type CampaignFormValues,
} from "@/components/CampaignPanel";
import {
  OutageCampaignPanel,
  type OutageFormValues,
} from "@/components/OutageCampaignPanel";
import { DMAMap } from "@/components/DMAMap";
import { USMap } from "@/components/USMap";
import { CAMPAIGN_PRESETS } from "@/lib/campaign-presets";
import { getCompetitorSuggestions } from "@/lib/outage-engine";
import type { MapViewState } from "@/lib/outage-types";
import type { OutageEvaluationResult } from "@/lib/outage-types";
import { CATEGORY_LABELS, SEVERITY_LABELS } from "@/lib/outage-types";
import type {
  DmaMatchResult,
  EvaluationResult,
  StateMatchResult,
} from "@/lib/types";

type TargetingMode = "weather" | "outages";

function defaultWeatherForm(): CampaignFormValues {
  const start = new Date();
  const end = addDays(start, 2);
  return {
    campaignId: CAMPAIGN_PRESETS[0].id,
    geoLevel: "state",
    startDate: format(start, "yyyy-MM-dd"),
    endDate: format(end, "yyyy-MM-dd"),
    minMatchRatio: 0.5,
  };
}

function defaultOutageForm(): OutageFormValues {
  return { campaignId: "competitor-netflix" };
}

function weatherToMapStates(result: EvaluationResult | null): MapViewState[] {
  return (
    result?.states.map((state) => ({
      stateAbbrev: state.stateAbbrev,
      stateName: state.stateName,
      matched: state.matched,
      matchIntensity: state.matchRatio,
    })) ?? []
  );
}

function outageToMapStates(result: OutageEvaluationResult | null): MapViewState[] {
  return (
    result?.states.map((state) => ({
      stateAbbrev: state.stateAbbrev,
      stateName: state.stateName,
      matched: state.matched,
      matchIntensity: state.matchIntensity,
    })) ?? []
  );
}

export function Dashboard() {
  const [mode, setMode] = useState<TargetingMode>("outages");
  const [weatherForm, setWeatherForm] = useState(defaultWeatherForm);
  const [outageForm, setOutageForm] = useState(defaultOutageForm);
  const [weatherResult, setWeatherResult] = useState<EvaluationResult | null>(
    null,
  );
  const [outageResult, setOutageResult] =
    useState<OutageEvaluationResult | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedDmaCode, setSelectedDmaCode] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedWeatherState: StateMatchResult | null =
    weatherResult?.states.find((s) => s.stateAbbrev === selectedState) ?? null;

  const selectedWeatherDma: DmaMatchResult | null =
    weatherResult?.dmas.find((dma) => dma.dmaCode === selectedDmaCode) ?? null;

  const selectedOutageState =
    outageResult?.states.find((s) => s.stateAbbrev === selectedState) ?? null;

  const competitorSuggestions = useMemo(() => {
    if (!outageResult || !selectedState) return [];
    return getCompetitorSuggestions(outageResult, selectedState);
  }, [outageResult, selectedState]);

  const runWeatherEvaluation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: weatherForm.campaignId,
          geoLevel: weatherForm.geoLevel,
          timeframe: {
            startDate: weatherForm.startDate,
            endDate: weatherForm.endDate,
          },
          minMatchRatio: weatherForm.minMatchRatio,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Evaluation failed");
      }

      setWeatherResult((await response.json()) as EvaluationResult);
      setSelectedState(null);
      setSelectedDmaCode(null);
    } catch (evalError) {
      setError(
        evalError instanceof Error ? evalError.message : "Evaluation failed",
      );
    } finally {
      setLoading(false);
    }
  }, [weatherForm]);

  const runOutageEvaluation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/outages/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId: outageForm.campaignId }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Outage scan failed");
      }

      setOutageResult((await response.json()) as OutageEvaluationResult);
      setSelectedState(null);
    } catch (evalError) {
      setError(
        evalError instanceof Error ? evalError.message : "Outage scan failed",
      );
    } finally {
      setLoading(false);
    }
  }, [outageForm]);

  useEffect(() => {
    if (mode === "weather") {
      void runWeatherEvaluation();
    } else {
      void runOutageEvaluation();
    }
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const exportCsv = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const isWeather = mode === "weather";
      const response = await fetch(
        isWeather ? "/api/export" : "/api/outages/export",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isWeather
              ? {
                  campaignId: weatherForm.campaignId,
                  geoLevel: weatherForm.geoLevel,
                  timeframe: {
                    startDate: weatherForm.startDate,
                    endDate: weatherForm.endDate,
                  },
                  minMatchRatio: weatherForm.minMatchRatio,
                }
              : { campaignId: outageForm.campaignId },
          ),
        },
      );

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Export failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = isWeather
        ? `weather-targeting-${weatherForm.campaignId}.csv`
        : `outage-targeting-${outageForm.campaignId}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (exportError) {
      setError(
        exportError instanceof Error ? exportError.message : "Export failed",
      );
    } finally {
      setLoading(false);
    }
  }, [mode, weatherForm, outageForm]);

  const mapStates =
    mode === "weather"
      ? weatherToMapStates(weatherResult)
      : outageToMapStates(outageResult);

  const campaignColor =
    mode === "weather"
      ? (weatherResult?.campaign.color ?? "#2563eb")
      : (outageResult?.campaign.color ?? "#dc2626");

  const matchedWeatherStates =
    weatherResult?.states.filter((state) => state.matched) ?? [];
  const matchedWeatherDmas =
    weatherResult?.dmas.filter((dma) => dma.matched) ?? [];
  const matchedOutageStates =
    outageResult?.states.filter((state) => state.matched) ?? [];

  return (
    <div className="flex min-h-screen bg-slate-100">
      <div className="w-full max-w-sm shrink-0">
        <div className="border-b border-slate-200 bg-white p-4">
          <div className="flex rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMode("outages")}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                mode === "outages"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Outages
            </button>
            <button
              type="button"
              onClick={() => setMode("weather")}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                mode === "weather"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Weather
            </button>
          </div>
        </div>

        {mode === "weather" ? (
          <CampaignPanel
            values={weatherForm}
            loading={loading}
            onChange={setWeatherForm}
            onEvaluate={runWeatherEvaluation}
            onExport={exportCsv}
          />
        ) : (
          <OutageCampaignPanel
            values={outageForm}
            loading={loading}
            onChange={setOutageForm}
            onEvaluate={runOutageEvaluation}
            onExport={exportCsv}
          />
        )}
      </div>

      <main className="flex flex-1 flex-col">
        <header className="border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {mode === "weather" && weatherForm.geoLevel === "dma"
                  ? "US DMA Targeting Map"
                  : "US State Targeting Map"}
              </h2>
              <p className="text-sm text-slate-600">
                {mode === "weather" && weatherResult
                  ? weatherResult.geoLevel === "dma"
                    ? `${weatherResult.matchedCount} DMAs match "${weatherResult.campaign.name}" (${weatherResult.timeframe.startDate} → ${weatherResult.timeframe.endDate})`
                    : `${weatherResult.matchedCount} states match "${weatherResult.campaign.name}" (${weatherResult.timeframe.startDate} → ${weatherResult.timeframe.endDate})`
                  : mode === "outages" && outageResult
                    ? `${outageResult.matchedCount} states with "${outageResult.campaign.name}"`
                    : "Run a scan to highlight matching markets"}
              </p>
            </div>
            {(weatherResult || outageResult) && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  mode === "weather" && weatherResult?.dataSource === "live"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {mode === "weather" && weatherResult?.dataSource === "live"
                  ? "Live weather data"
                  : "Demo data"}
              </span>
            )}
          </div>
          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
        </header>

        <div className="grid flex-1 grid-cols-1 gap-0 lg:grid-cols-[1fr_340px]">
          <section className="relative min-h-[420px] bg-white p-4">
            {mode === "weather" && weatherResult?.geoLevel === "dma" ? (
              <DMAMap
                dmas={weatherResult.dmas}
                campaignColor={campaignColor}
                selectedDmaCode={selectedDmaCode}
                onSelectDma={setSelectedDmaCode}
              />
            ) : (
              <USMap
                states={mapStates}
                campaignColor={campaignColor}
                selectedState={selectedState}
                onSelectState={setSelectedState}
                intensityLabel={mode === "outages" ? "spike" : "match"}
              />
            )}
            {(weatherResult || outageResult) && (
              <div className="absolute bottom-6 left-6 rounded-lg border border-slate-200 bg-white/95 px-4 py-3 text-xs text-slate-600 shadow-sm">
                <p className="font-medium text-slate-800">Legend</p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-sm"
                    style={{ backgroundColor: campaignColor }}
                  />
                  <span>
                    {mode === "outages"
                      ? "Competitor outage detected"
                      : weatherResult?.geoLevel === "dma"
                        ? "Matching DMA"
                        : "Matches criteria"}
                  </span>
                </div>
                {weatherResult?.geoLevel !== "dma" && (
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 rounded-sm opacity-40"
                      style={{ backgroundColor: campaignColor }}
                    />
                    <span>
                      {mode === "outages" ? "Elevated activity" : "Partial match"}
                    </span>
                  </div>
                )}
              </div>
            )}
          </section>

          <aside className="border-l border-slate-200 bg-white p-6">
            {mode === "weather" ? (
              <WeatherSidebar
                geoLevel={weatherResult?.geoLevel ?? weatherForm.geoLevel}
                selectedState={selectedWeatherState}
                selectedDma={selectedWeatherDma}
                matchedStates={matchedWeatherStates}
                matchedDmas={matchedWeatherDmas}
                onSelectState={setSelectedState}
                onSelectDma={setSelectedDmaCode}
                hasResult={weatherResult != null}
              />
            ) : (
              <OutageSidebar
                selectedState={selectedOutageState}
                matchedStates={matchedOutageStates}
                competitorSuggestions={competitorSuggestions}
                onSelectState={setSelectedState}
                hasResult={outageResult != null}
              />
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

function WeatherSidebar({
  geoLevel,
  selectedState,
  selectedDma,
  matchedStates,
  matchedDmas,
  onSelectState,
  onSelectDma,
  hasResult,
}: {
  geoLevel: "state" | "dma";
  selectedState: StateMatchResult | null;
  selectedDma: DmaMatchResult | null;
  matchedStates: StateMatchResult[];
  matchedDmas: DmaMatchResult[];
  onSelectState: (abbrev: string) => void;
  onSelectDma: (code: number) => void;
  hasResult: boolean;
}) {
  if (geoLevel === "dma" && selectedDma) {
    return (
      <>
        <h3 className="text-sm font-semibold text-slate-900">
          {selectedDma.dmaName}
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          DMA {selectedDma.dmaCode} · Rank #{selectedDma.dmaRank}
        </p>
        <dl className="mt-4 space-y-3 text-sm">
          <SidebarItem
            label="Avg max temp"
            value={`${selectedDma.summary.avgMaxTempF}°F`}
          />
          <SidebarItem
            label="Avg min temp"
            value={`${selectedDma.summary.avgMinTempF}°F`}
          />
          <SidebarItem
            label="Precipitation"
            value={`${selectedDma.summary.avgPrecipProbability}% (${selectedDma.summary.dominantPrecipType})`}
          />
          {selectedDma.summary.avgUsAqi != null && (
            <SidebarItem
              label="Avg US AQI"
              value={String(selectedDma.summary.avgUsAqi)}
            />
          )}
          <SidebarItem
            label="Target status"
            value={
              selectedDma.matched
                ? "Include in ad segment"
                : "Does not meet threshold"
            }
            highlight={selectedDma.matched}
          />
        </dl>
      </>
    );
  }

  if (selectedState) {
    return (
      <>
        <h3 className="text-sm font-semibold text-slate-900">
          {selectedState.stateName}
        </h3>
        <dl className="mt-4 space-y-3 text-sm">
          <SidebarItem
            label="Match ratio"
            value={`${Math.round(selectedState.matchRatio * 100)}% (${selectedState.matchingPoints}/${selectedState.totalPoints} points)`}
          />
          <SidebarItem
            label="Avg max temp"
            value={`${selectedState.summary.avgMaxTempF}°F`}
          />
          <SidebarItem
            label="Avg min temp"
            value={`${selectedState.summary.avgMinTempF}°F`}
          />
          <SidebarItem
            label="Precipitation"
            value={`${selectedState.summary.avgPrecipProbability}% (${selectedState.summary.dominantPrecipType})`}
          />
          {selectedState.summary.avgUsAqi != null && (
            <SidebarItem
              label="Avg US AQI"
              value={String(selectedState.summary.avgUsAqi)}
            />
          )}
          <SidebarItem
            label="Target status"
            value={
              selectedState.matched
                ? "Include in ad segment"
                : "Does not meet threshold"
            }
            highlight={selectedState.matched}
          />
        </dl>
      </>
    );
  }

  if (geoLevel === "dma") {
    return (
      <>
        <h3 className="text-sm font-semibold text-slate-900">Matched DMAs</h3>
        <ul className="mt-4 max-h-[520px] space-y-2 overflow-y-auto text-sm">
          {matchedDmas.length === 0 && (
            <li className="text-slate-500">
              {hasResult
                ? "No DMAs matched the selected criteria."
                : "Results will appear here after evaluation."}
            </li>
          )}
          {matchedDmas.map((dma) => (
            <li key={dma.dmaCode}>
              <button
                type="button"
                onClick={() => onSelectDma(dma.dmaCode)}
                className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-left hover:bg-slate-50"
              >
                <span>
                  <span className="font-medium text-slate-900">{dma.dmaName}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    DMA {dma.dmaCode}
                  </span>
                </span>
                <span className="text-xs text-slate-500">
                  {dma.summary.avgMaxTempF}°F
                </span>
              </button>
            </li>
          ))}
        </ul>
      </>
    );
  }

  return (
    <StateList
      title="Matched states"
      emptyMessage={
        hasResult
          ? "No states matched the selected criteria."
          : "Results will appear here after evaluation."
      }
      items={matchedStates.map((state) => ({
        abbrev: state.stateAbbrev,
        name: state.stateName,
        detail: `${Math.round(state.matchRatio * 100)}%`,
      }))}
      onSelect={onSelectState}
    />
  );
}

function OutageSidebar({
  selectedState,
  matchedStates,
  competitorSuggestions,
  onSelectState,
  hasResult,
}: {
  selectedState: OutageEvaluationResult["states"][number] | null;
  matchedStates: OutageEvaluationResult["states"];
  competitorSuggestions: string[];
  onSelectState: (abbrev: string) => void;
  hasResult: boolean;
}) {
  if (selectedState) {
    return (
      <>
        <h3 className="text-sm font-semibold text-slate-900">
          {selectedState.stateName}
        </h3>
        <dl className="mt-4 space-y-3 text-sm">
          <SidebarItem
            label="Total reports"
            value={selectedState.totalReports.toLocaleString()}
          />
          <SidebarItem
            label="Max spike ratio"
            value={`${selectedState.maxSpikeRatio}x baseline`}
          />
          <SidebarItem
            label="Worst severity"
            value={SEVERITY_LABELS[selectedState.worstSeverity]}
          />
          <SidebarItem
            label="Target status"
            value={
              selectedState.matched
                ? "Run conquest ads here"
                : "No qualifying outage"
            }
            highlight={selectedState.matched}
          />
        </dl>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Services down
          </p>
          <ul className="mt-2 space-y-2">
            {selectedState.services.map((service) => (
              <li
                key={service.slug}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
              >
                <p className="font-medium text-slate-900">{service.name}</p>
                <p className="mt-0.5 text-slate-500">
                  {CATEGORY_LABELS[service.category]} ·{" "}
                  {service.reportCount.toLocaleString()} reports ·{" "}
                  {service.spikeRatio}x · {SEVERITY_LABELS[service.severity]}
                </p>
                <p className="mt-1 text-slate-500">
                  Issues: {service.indicators.join(", ")}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {competitorSuggestions.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Advertise instead
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {competitorSuggestions.map((name) => (
                <span
                  key={name}
                  className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <StateList
      title="States with outages"
      emptyMessage={
        hasResult
          ? "No states matched the outage criteria."
          : "Results will appear here after scanning."
      }
      items={matchedStates.map((state) => ({
        abbrev: state.stateAbbrev,
        name: state.stateName,
        detail: `${state.totalReports.toLocaleString()} reports`,
      }))}
      onSelect={onSelectState}
    />
  );
}

function SidebarItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd
        className={`font-medium ${
          highlight ? "text-emerald-700" : "text-slate-900"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function StateList({
  title,
  emptyMessage,
  items,
  onSelect,
}: {
  title: string;
  emptyMessage: string;
  items: Array<{ abbrev: string; name: string; detail: string }>;
  onSelect: (abbrev: string) => void;
}) {
  return (
    <>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <ul className="mt-4 max-h-[520px] space-y-2 overflow-y-auto text-sm">
        {items.length === 0 && (
          <li className="text-slate-500">{emptyMessage}</li>
        )}
        {items.map((item) => (
          <li key={item.abbrev}>
            <button
              type="button"
              onClick={() => onSelect(item.abbrev)}
              className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-left hover:bg-slate-50"
            >
              <span className="font-medium text-slate-900">{item.name}</span>
              <span className="text-xs text-slate-500">{item.detail}</span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
