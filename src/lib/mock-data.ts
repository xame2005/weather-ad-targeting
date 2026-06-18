import { addDays, eachDayOfInterval, format, parseISO } from "date-fns";
import { getAllDmaSamplePoints } from "./dma-markets";
import type { PointForecast, PointForecastDay, PrecipitationType } from "./types";
import { US_STATES } from "./state-points";

function seededRandom(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function climateBaseline(latitude: number, month: number) {
  const seasonal = Math.cos(((month - 1) / 12) * Math.PI * 2);
  const baseTemp = 72 - (Math.abs(latitude - 38) * 0.9) + seasonal * 18;
  return {
    maxTemp: baseTemp + 8,
    minTemp: baseTemp - 12,
    humidity: 45 + Math.abs(latitude - 35) * 0.4,
  };
}

function generateDay(
  seedKey: string,
  latitude: number,
  date: string,
): PointForecastDay {
  const month = parseISO(date).getMonth() + 1;
  const rand = seededRandom(hashString(`${seedKey}-${date}`));
  const climate = climateBaseline(latitude, month);
  const noise = (rand() - 0.5) * 16;

  const temperatureMaxF = Math.round(climate.maxTemp + noise);
  const temperatureMinF = Math.round(climate.minTemp + noise * 0.6);
  const precipRoll = rand();

  let precipitationType: PrecipitationType = "NONE";
  let precipitationProbability = Math.round(rand() * 30);

  if (temperatureMaxF < 35 && precipRoll > 0.55) {
    precipitationType = rand() > 0.7 ? "MIX" : "SNOW";
    precipitationProbability = Math.round(50 + rand() * 45);
  } else if (precipRoll > 0.72) {
    precipitationType = "RAIN";
    precipitationProbability = Math.round(55 + rand() * 40);
  }

  const heatIndexF = Math.max(
    temperatureMaxF,
    Math.round(temperatureMaxF + climate.humidity * 0.05),
  );

  const usAqi =
    rand() > 0.78
      ? Math.round(100 + rand() * 80)
      : Math.round(25 + rand() * 60);

  return {
    date,
    temperatureMaxF,
    temperatureMinF,
    feelsLikeMaxF: Math.round(temperatureMaxF - rand() * 4),
    heatIndexF,
    precipitationProbability,
    precipitationType,
    thunderstormProbability:
      precipitationType === "RAIN" ? Math.round(rand() * 40) : 0,
    relativeHumidity: Math.round(climate.humidity + rand() * 20),
    uvIndex: Math.round(Math.max(1, 8 - Math.abs(latitude - 35) * 0.05)),
    usAqi,
  };
}

export function generateDemoForecasts(
  startDate: string,
  endDate: string,
): PointForecast[] {
  const days = eachDayOfInterval({
    start: parseISO(startDate),
    end: parseISO(endDate),
  }).map((day) => format(day, "yyyy-MM-dd"));

  return US_STATES.flatMap((stateDef) =>
    stateDef.points.map((point) => ({
      stateAbbrev: stateDef.abbrev,
      pointName: point.name,
      latitude: point.latitude,
      longitude: point.longitude,
      days: days.map((date) =>
        generateDay(`${stateDef.abbrev}-${point.name}`, point.latitude, date),
      ),
    })),
  );
}

export function generateDemoDmaForecasts(
  startDate: string,
  endDate: string,
): PointForecast[] {
  const days = eachDayOfInterval({
    start: parseISO(startDate),
    end: parseISO(endDate),
  }).map((day) => format(day, "yyyy-MM-dd"));

  return getAllDmaSamplePoints().map((point) => ({
    dmaCode: point.dmaCode,
    dmaName: point.dmaName,
    pointName: point.name,
    latitude: point.latitude,
    longitude: point.longitude,
    days: days.map((date) =>
      generateDay(`dma-${point.dmaCode}`, point.latitude, date),
    ),
  }));
}

export function generateDemoForecastsForDays(daysAhead: number): PointForecast[] {
  const startDate = format(new Date(), "yyyy-MM-dd");
  const endDate = format(addDays(new Date(), daysAhead - 1), "yyyy-MM-dd");
  return generateDemoForecasts(startDate, endDate);
}
