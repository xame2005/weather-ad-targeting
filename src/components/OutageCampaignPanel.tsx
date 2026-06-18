"use client";

import { OUTAGE_CAMPAIGN_PRESETS } from "@/lib/outage-campaign-presets";

export interface OutageFormValues {
  campaignId: string;
}

interface OutageCampaignPanelProps {
  values: OutageFormValues;
  loading: boolean;
  onChange: (values: OutageFormValues) => void;
  onEvaluate: () => void;
  onExport: () => void;
}

export function OutageCampaignPanel({
  values,
  loading,
  onChange,
  onEvaluate,
  onExport,
}: OutageCampaignPanelProps) {
  const selected = OUTAGE_CAMPAIGN_PRESETS.find(
    (campaign) => campaign.id === values.campaignId,
  );

  return (
    <aside className="flex h-full flex-col gap-6 border-r border-slate-200 bg-white p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Outage Ad Targeting
        </p>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">
          Competitor Outages
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Find states where competitor services are down — streaming, cell,
          internet, gaming, and social — to run conquest campaigns.
        </p>
        <p className="mt-2 rounded-md bg-amber-50 px-2 py-1.5 text-xs text-amber-800">
          Demo data modeled on DownDetector API structure (reports, slugs,
          indicators, providers by state).
        </p>
      </div>

      <div className="space-y-2">
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor="outageCampaign"
        >
          Outage campaign
        </label>
        <select
          id="outageCampaign"
          value={values.campaignId}
          onChange={(event) =>
            onChange({ ...values, campaignId: event.target.value })
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        >
          {OUTAGE_CAMPAIGN_PRESETS.map((campaign) => (
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

      {selected && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          <p className="font-medium text-slate-800">Thresholds</p>
          <ul className="mt-2 space-y-1">
            <li>Min reports: {selected.minReportCount}</li>
            <li>Min spike ratio: {selected.minSpikeRatio}x baseline</li>
            <li>Min severity: {selected.minSeverity}</li>
          </ul>
        </div>
      )}

      <div className="mt-auto flex flex-col gap-2">
        <button
          type="button"
          onClick={onEvaluate}
          disabled={loading}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? "Scanning…" : "Scan outages"}
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
