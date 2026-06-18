"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { geoAlbersUsa, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import { FIPS_TO_ABBREV, US_ATLAS_URL } from "@/lib/constants";
import type { MapViewState } from "@/lib/outage-types";

interface USMapProps {
  states: MapViewState[];
  campaignColor: string;
  selectedState: string | null;
  onSelectState: (abbrev: string | null) => void;
  intensityLabel?: string;
}

interface StateFeature {
  id: string;
  abbrev: string;
  path: string;
}

export function USMap({
  states,
  campaignColor,
  selectedState,
  onSelectState,
  intensityLabel = "match",
}: USMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [features, setFeatures] = useState<StateFeature[]>([]);
  const [error, setError] = useState<string | null>(null);

  const stateByAbbrev = useMemo(() => {
    const map = new Map<string, MapViewState>();
    states.forEach((state) => map.set(state.stateAbbrev, state));
    return map;
  }, [states]);

  useEffect(() => {
    let cancelled = false;

    async function loadMap() {
      try {
        const response = await fetch(US_ATLAS_URL);
        if (!response.ok) {
          throw new Error("Failed to load US map data");
        }

        const topology = (await response.json()) as Topology<{
          states: GeometryCollection;
        }>;
        const geoStates = feature(topology, topology.objects.states);
        const projection = geoAlbersUsa().scale(1100).translate([480, 290]);
        const pathGenerator = geoPath(projection);

        const parsed = geoStates.features
          .map((stateFeature) => {
            const fips = String(stateFeature.id).padStart(2, "0");
            const abbrev = FIPS_TO_ABBREV[fips];
            if (!abbrev) return null;

            const path = pathGenerator(stateFeature);
            if (!path) return null;

            return { id: fips, abbrev, path };
          })
          .filter((item): item is StateFeature => item != null);

        if (!cancelled) {
          setFeatures(parsed);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error ? loadError.message : "Map load failed",
          );
        }
      }
    }

    loadMap();
    return () => {
      cancelled = true;
    };
  }, []);

  function fillForState(abbrev: string): string {
    const state = stateByAbbrev.get(abbrev);
    if (!state || states.length === 0) return "#e2e8f0";

    if (state.matched) {
      return campaignColor;
    }

    if (state.matchIntensity > 0) {
      const alpha = Math.round(state.matchIntensity * 85)
        .toString(16)
        .padStart(2, "0");
      return `${campaignColor}${alpha}`;
    }

    return "#e2e8f0";
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <svg
        ref={svgRef}
        viewBox="0 0 960 520"
        className="h-full w-full"
        role="img"
        aria-label="United States targeting map"
      >
        {features.map((stateFeature) => {
          const state = stateByAbbrev.get(stateFeature.abbrev);
          const isSelected = selectedState === stateFeature.abbrev;

          return (
            <path
              key={stateFeature.id}
              d={stateFeature.path}
              fill={fillForState(stateFeature.abbrev)}
              stroke={isSelected ? "#0f172a" : "#ffffff"}
              strokeWidth={isSelected ? 2.5 : 1}
              className="cursor-pointer transition-opacity hover:opacity-90"
              onClick={() =>
                onSelectState(
                  selectedState === stateFeature.abbrev
                    ? null
                    : stateFeature.abbrev,
                )
              }
            >
              <title>
                {state?.stateName ?? stateFeature.abbrev}
                {state
                  ? ` — ${Math.round(state.matchIntensity * 100)}% ${intensityLabel}`
                  : ""}
              </title>
            </path>
          );
        })}
      </svg>
    </div>
  );
}
