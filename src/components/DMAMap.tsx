"use client";

import { useEffect, useMemo, useState } from "react";
import { geoAlbersUsa, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import { FIPS_TO_ABBREV, US_ATLAS_URL } from "@/lib/constants";
import { DMA_BY_CODE } from "@/lib/dma-markets";
import type { DmaMatchResult } from "@/lib/types";

interface DMAMapProps {
  dmas: DmaMatchResult[];
  campaignColor: string;
  selectedDmaCode: number | null;
  onSelectDma: (code: number | null) => void;
}

interface StateFeature {
  id: string;
  path: string;
}

export function DMAMap({
  dmas,
  campaignColor,
  selectedDmaCode,
  onSelectDma,
}: DMAMapProps) {
  const [features, setFeatures] = useState<StateFeature[]>([]);
  const [error, setError] = useState<string | null>(null);

  const projection = useMemo(
    () => geoAlbersUsa().scale(1100).translate([480, 290]),
    [],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadMap() {
      try {
        const response = await fetch(US_ATLAS_URL);
        if (!response.ok) throw new Error("Failed to load US map data");

        const topology = (await response.json()) as Topology<{
          states: GeometryCollection;
        }>;
        const geoStates = feature(topology, topology.objects.states);
        const pathGenerator = geoPath(projection);

        const parsed = geoStates.features
          .map((stateFeature) => {
            const fips = String(stateFeature.id).padStart(2, "0");
            if (!FIPS_TO_ABBREV[fips]) return null;
            const path = pathGenerator(stateFeature);
            if (!path) return null;
            return { id: fips, path };
          })
          .filter((item): item is StateFeature => item != null);

        if (!cancelled) setFeatures(parsed);
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
  }, [projection]);

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
        viewBox="0 0 960 520"
        className="h-full w-full"
        role="img"
        aria-label="United States DMA targeting map"
      >
        {features.map((stateFeature) => (
          <path
            key={stateFeature.id}
            d={stateFeature.path}
            fill="#f1f5f9"
            stroke="#ffffff"
            strokeWidth={1}
          />
        ))}

        {dmas.map((dma) => {
          const market = DMA_BY_CODE[dma.dmaCode];
          if (!market) return null;

          const coords = projection([market.longitude, market.latitude]);
          if (!coords) return null;

          const [x, y] = coords;
          const isSelected = selectedDmaCode === dma.dmaCode;
          const radius = dma.matched ? 5 : 3;
          const fill = dma.matched ? campaignColor : "#cbd5e1";

          return (
            <circle
              key={dma.dmaCode}
              cx={x}
              cy={y}
              r={isSelected ? radius + 2 : radius}
              fill={fill}
              stroke={isSelected ? "#0f172a" : "#ffffff"}
              strokeWidth={isSelected ? 2 : 1}
              className="cursor-pointer"
              onClick={() =>
                onSelectDma(selectedDmaCode === dma.dmaCode ? null : dma.dmaCode)
              }
            >
              <title>
                {dma.dmaName} (DMA {dma.dmaCode})
                {dma.matched ? " — matches criteria" : ""}
              </title>
            </circle>
          );
        })}
      </svg>
    </div>
  );
}
