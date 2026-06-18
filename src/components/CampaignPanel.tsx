"use client";

import { addDays, format } from "date-fns";
import {
  getDefaultThreshold,
  supportsCustomThreshold,
  thresholdLabel,
} from "@/lib/campaign-builder";
import { CAMPAIGN_PRESETS } from "@/lib/campaign-presets";
import type { GeoLevel } from "@/lib/types";

export interface CampaignFormValues {
  campaignId: string;
  geoLevel: GeoLevel;
  startDate: string;
  endDate: string;
  minMatchRatio: number;
  customThreshold: number | null;
}

interface CampaignPanelProps {
  values: CampaignFormValues;
  loading: boolean;
  onChange: (values: CampaignFormValues) => void;
  onEvaluate: () => void;
  onExport: () => void;
}

export function CampaignPanel({
  values,
  loading,
  onChange,
  onEvaluate,
  onExport,
}: CampaignPanelProps) {
  const selected = CAMPAIGN_PRESETS.find((c) => c.id === values.campaignId);
  const thresholdFieldLabel = thresholdLabel(values.campaignId);
  const showThreshold = supportsCustomThreshold(values.campaignId);

  function setQuickRange(days: number) {
    const start = new Date();
    const end = addDays(start, days - 1);
    onChange({
      ...values,
      startDate: format(start, "yyyy-MM-dd"),
      endDate: format(end, "yyyy-MM-dd"),
    });
  }

  function handleCampaignChange(campaignId: string) {
    const campaign = CAMPAIGN_PRESETS.find((item) => item.id === campaignId);
    onChange({
      ...values,
      campaignId,
      customThreshold: campaign ? getDefaultThreshold(campaign) : null,
    });
  }

  return (
    <aside className="flex h-full flex-col gap-5 border-r border-slate-200 bg-white p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Weather Ad Targeting
        </p>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">
          Campaign Builder
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Target US states or Nielsen DMA markets using weather forecast rules.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">Geo targeting</p>
        <div className="flex rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => onChange({ ...values, geoLevel: "state" })}
            className={`flex-1 rounded-md px-3 py-2 text-xs font-medium ${
              values.geoLevel === "state"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600"
            }`}
          >
            State
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...values, geoLevel: "dma" })}
            className={`flex-1 rounded-md px-3 py-2 text-xs font-medium ${
              values.geoLevel === "dma"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600"
            }`}
          >
            DMA (210 markets)
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="campaign">
          Campaign preset
        </label>
        <select
          id="campaign"
          value={values.campaignId}
          onChange={(event) => handleCampaignChange(event.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        >
          {CAMPAIGN_PRESETS.map((campaign) => (
            <option key={campaign.id} value={campaign.id}>
              {campaign.name}
            </option>
          ))}
        </select>
        {selected && (
          <p className="text-xs leading-relaxed text-slate-500">
            {selected.description}
          </p>
        )}
      </div>

      {showThreshold && values.customThreshold != null && thresholdFieldLabel && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="threshold">
            {thresholdFieldLabel}
          </label>
          <input
            id="threshold"
            type="number"
            value={values.customThreshold}
            onChange={(event) =>
              onChange({
                ...values,
                customThreshold: Number(event.target.value),
              })
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      )}

      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-700">Forecast window</p>
        <div className="flex gap-2">
          {[1, 3, 7].map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setQuickRange(days)}
              className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              {days}d
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500" htmlFor="startDate">
              Start
            </label>
            <input
              id="startDate"
              type="date"
              value={values.startDate}
              onChange={(event) =>
                onChange({ ...values, startDate: event.target.value })
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500" htmlFor="endDate">
              End
            </label>
            <input
              id="endDate"
              type="date"
              value={values.endDate}
              onChange={(event) =>
                onChange({ ...values, endDate: event.target.value })
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {values.geoLevel === "state" && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="matchRatio">
            Min. match ratio ({Math.round(values.minMatchRatio * 100)}% of sample
            points)
          </label>
          <input
            id="matchRatio"
            type="range"
            min={0.3}
            max={1}
            step={0.1}
            value={values.minMatchRatio}
            onChange={(event) =>
              onChange({
                ...values,
                minMatchRatio: Number(event.target.value),
              })
            }
            className="w-full"
          />
        </div>
      )}

      <div className="mt-auto flex flex-col gap-2">
        <button
          type="button"
          onClick={onEvaluate}
          disabled={loading}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? "Evaluating…" : "Run evaluation"}
        </button>
        <button
          type="button"
          onClick={onExport}
          disabled={loading}
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          Export CSV
        </button>
      </div>
    </aside>
  );
}
