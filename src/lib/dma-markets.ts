import dmaMarkets from "@/data/dma-markets.json";

export interface DmaMarket {
  code: number;
  rank: number;
  name: string;
  latitude: number;
  longitude: number;
  tvHomes: number;
}

export const US_DMA_MARKETS = dmaMarkets as DmaMarket[];

export const DMA_BY_CODE = Object.fromEntries(
  US_DMA_MARKETS.map((dma) => [dma.code, dma]),
);

export function getAllDmaSamplePoints() {
  return US_DMA_MARKETS.map((dma) => ({
    dmaCode: dma.code,
    dmaName: dma.name,
    dmaRank: dma.rank,
    name: dma.name,
    latitude: dma.latitude,
    longitude: dma.longitude,
  }));
}
