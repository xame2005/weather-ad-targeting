import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import { getAllDmaSamplePoints } from "./dma-markets";
import { getAllSamplePoints } from "./state-points";
import type { GeoLevel, PointForecast, PointForecastDay, PrecipitationType } from "./types";
import { celsiusToFahrenheit, round } from "./units";

interface WeatherDayResponse {
  displayDate?: { year: number; month: number; day: number };
  maxTemperature?: { degrees: number; unit: string };
  minTemperature?: { degrees: number; unit: string };
  feelsLikeMaxTemperature?: { degrees: number; unit: string };
  maxHeatIndex?: { degrees: number; unit: string };
  daytimeForecast?: {
    relativeHumidity?: number;
    uvIndex?: number;
    precipitation?: {
      probability?: { percent: number; type: string };
    };
    thunderstormProbability?: number;
  };
  nighttimeForecast?: {
    precipitation?: {
      probability?: { percent: number; type: string };
    };
  };
}

interface AirQualityForecastResponse {
  hourlyForecasts?: Array<{
    dateTime: string;
    indexes?: Array<{ code: string; aqi?: number }>;
  }>;
}

interface SamplePointInput {
  stateAbbrev?: string;
  dmaCode?: number;
  dmaName?: string;
  name: string;
  latitude: number;
  longitude: number;
}

function toFahrenheit(temp?: { degrees: number; unit: string }): number {
  if (!temp) return 0;
  if (temp.unit === "FAHRENHEIT") return round(temp.degrees);
  return round(celsiusToFahrenheit(temp.degrees));
}

function normalizePrecipType(type?: string): PrecipitationType {
  const normalized = (type ?? "NONE").toUpperCase();
  const allowed: PrecipitationType[] = [
    "RAIN",
    "SNOW",
    "ICE",
    "MIX",
    "RAIN_AND_SNOW",
    "NONE",
  ];
  return allowed.includes(normalized as PrecipitationType)
    ? (normalized as PrecipitationType)
    : "NONE";
}

function maxPrecip(
  day: WeatherDayResponse,
): { percent: number; type: PrecipitationType } {
  const daytime = day.daytimeForecast?.precipitation?.probability;
  const nighttime = day.nighttimeForecast?.precipitation?.probability;

  const candidates = [daytime, nighttime].filter(Boolean) as Array<{
    percent: number;
    type: string;
  }>;

  if (candidates.length === 0) {
    return { percent: 0, type: "NONE" };
  }

  const best = candidates.reduce((max, current) =>
    current.percent > max.percent ? current : max,
  );

  return {
    percent: best.percent,
    type: normalizePrecipType(best.type),
  };
}

function parseWeatherDay(day: WeatherDayResponse): PointForecastDay {
  const precip = maxPrecip(day);
  const date =
    day.displayDate != null
      ? format(
          new Date(
            day.displayDate.year,
            day.displayDate.month - 1,
            day.displayDate.day,
          ),
          "yyyy-MM-dd",
        )
      : format(new Date(), "yyyy-MM-dd");

  return {
    date,
    temperatureMaxF: toFahrenheit(day.maxTemperature),
    temperatureMinF: toFahrenheit(day.minTemperature),
    feelsLikeMaxF: toFahrenheit(day.feelsLikeMaxTemperature),
    heatIndexF: toFahrenheit(day.maxHeatIndex ?? day.maxTemperature),
    precipitationProbability: precip.percent,
    precipitationType: precip.type,
    thunderstormProbability: day.daytimeForecast?.thunderstormProbability ?? 0,
    relativeHumidity: day.daytimeForecast?.relativeHumidity ?? 0,
    uvIndex: day.daytimeForecast?.uvIndex ?? 0,
    usAqi: null,
  };
}

async function fetchDailyForecast(
  apiKey: string,
  latitude: number,
  longitude: number,
  days: number,
): Promise<WeatherDayResponse[]> {
  const url = new URL("https://weather.googleapis.com/v1/forecast/days:lookup");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("location.latitude", String(latitude));
  url.searchParams.set("location.longitude", String(longitude));
  url.searchParams.set("days", String(days));

  const response = await fetch(url.toString(), { next: { revalidate: 3600 } });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Weather API error (${response.status}): ${body}`);
  }

  const data = (await response.json()) as { forecastDays?: WeatherDayResponse[] };
  return data.forecastDays ?? [];
}

async function fetchAirQualityForecast(
  apiKey: string,
  latitude: number,
  longitude: number,
): Promise<number | null> {
  const url = new URL(
    "https://airquality.googleapis.com/v1/forecast:lookup",
  );
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: { latitude, longitude },
      extraComputations: ["POLLUTANT_CONCENTRATION"],
      languageCode: "en",
    }),
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as AirQualityForecastResponse;
  const aqiValues =
    data.hourlyForecasts?.flatMap(
      (hour) =>
        hour.indexes
          ?.filter((index) => index.code === "usa_epa" || index.code === "us_aqi")
          .map((index) => index.aqi)
          .filter((aqi): aqi is number => typeof aqi === "number") ?? [],
    ) ?? [];

  if (aqiValues.length === 0) {
    return null;
  }

  return Math.round(
    aqiValues.reduce((sum, value) => sum + value, 0) / aqiValues.length,
  );
}

function filterDaysByTimeframe(
  days: PointForecastDay[],
  startDate: string,
  endDate: string,
): PointForecastDay[] {
  return days.filter((day) => day.date >= startDate && day.date <= endDate);
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await fn(items[current]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker()),
  );

  return results;
}

function getPointsForGeoLevel(geoLevel: GeoLevel): SamplePointInput[] {
  if (geoLevel === "dma") {
    return getAllDmaSamplePoints();
  }
  return getAllSamplePoints();
}

export async function fetchForecastsForAllPoints(
  startDate: string,
  endDate: string,
  includeAirQuality: boolean,
  geoLevel: GeoLevel = "state",
): Promise<{ forecasts: PointForecast[]; dataSource: "live" | "demo" }> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const useDemo = !apiKey || process.env.USE_DEMO_DATA === "true";

  if (useDemo) {
    const { generateDemoDmaForecasts, generateDemoForecasts } = await import(
      "./mock-data"
    );
    return {
      forecasts:
        geoLevel === "dma"
          ? generateDemoDmaForecasts(startDate, endDate)
          : generateDemoForecasts(startDate, endDate),
      dataSource: "demo",
    };
  }

  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const dayCount = Math.min(
    10,
    Math.max(1, differenceInCalendarDays(end, start) + 1),
  );

  const points = getPointsForGeoLevel(geoLevel);
  const concurrency = geoLevel === "dma" ? 15 : 8;

  const forecasts = await mapWithConcurrency(points, concurrency, async (point) => {
    const rawDays = await fetchDailyForecast(
      apiKey,
      point.latitude,
      point.longitude,
      dayCount,
    );

    let days = rawDays.map(parseWeatherDay);

    if (includeAirQuality) {
      const avgAqi = await fetchAirQualityForecast(
        apiKey,
        point.latitude,
        point.longitude,
      );
      days = days.map((day) => ({ ...day, usAqi: avgAqi }));
    }

    return {
      stateAbbrev: point.stateAbbrev,
      dmaCode: point.dmaCode,
      dmaName: point.dmaName,
      pointName: point.name,
      latitude: point.latitude,
      longitude: point.longitude,
      days: filterDaysByTimeframe(days, startDate, endDate),
    };
  });

  return { forecasts, dataSource: "live" };
}

export function defaultTimeframe(daysAhead = 3): {
  startDate: string;
  endDate: string;
} {
  const start = new Date();
  const end = addDays(start, daysAhead - 1);
  return {
    startDate: format(start, "yyyy-MM-dd"),
    endDate: format(end, "yyyy-MM-dd"),
  };
}
