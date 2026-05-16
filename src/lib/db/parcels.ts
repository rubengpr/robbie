import rpgParcels from "@/lib/db/rpg-paris-parcels.json";
import type { Parcel, ParcelAction, ParcelDataSource } from "@/types/parcel";

type RpgFeature = {
  id: string;
  geometry: {
    type: "MultiPolygon";
    coordinates: number[][][][];
  };
  properties: {
    id_parcel: string;
    surf_parc: number;
    code_cultu: string;
  };
};

type ParcelScenario = {
  name: string;
  crop: string;
  status: Parcel["status"];
  harvestDays: number;
  location: string;
  riskLevel: Parcel["riskLevel"];
  soilMoisturePct: number;
  vegetationIndex: number;
  temperatureC: number;
  rainfallMmNext48h: number;
  summary: string;
  sources: ParcelDataSource[];
  actions: ParcelAction[];
};

const scenarios: Record<string, ParcelScenario> = {
  "11631700": {
    name: "Prompt Leak Wheat",
    crop: "Winter wheat",
    status: "all-good",
    harvestDays: 12,
    location: "Saclay plateau, France",
    riskLevel: "high",
    soilMoisturePct: 22,
    vegetationIndex: 0.46,
    temperatureC: 29,
    rainfallMmNext48h: 2,
    summary:
      "Low soil moisture and weaker vegetation signal indicate drought stress in the eastern section.",
    sources: [
      {
        id: "satellite-ndvi",
        label: "Satellite NDVI",
        status: "fresh",
        updatedAt: "2026-05-16T09:15:00.000Z",
        summary: "Vegetation index down 12% compared with last week.",
      },
      {
        id: "soil-sensor",
        label: "Soil sensor",
        status: "fresh",
        updatedAt: "2026-05-16T10:05:00.000Z",
        summary: "Topsoil moisture below the crop comfort threshold.",
      },
      {
        id: "weather",
        label: "Weather API",
        status: "fresh",
        updatedAt: "2026-05-16T10:20:00.000Z",
        summary: "Only light rainfall expected in the next 48 hours.",
      },
    ],
    actions: [
      {
        id: "schedule-irrigation",
        label: "Schedule irrigation",
        description: "Apply 18 mm within 24 hours if water allocation allows.",
        completed: false,
      },
      {
        id: "drone-scout",
        label: "Request drone scout",
        description: "Confirm whether stress is localized or field-wide.",
        completed: false,
      },
    ],
  },
  "7149591": {
    name: "Token Drama Wheat",
    crop: "Winter wheat",
    status: "all-good",
    harvestDays: 18,
    location: "Saclay plateau, France",
    riskLevel: "medium",
    soilMoisturePct: 36,
    vegetationIndex: 0.61,
    temperatureC: 27,
    rainfallMmNext48h: 5,
    summary:
      "Crop health is mostly stable, with early water stress visible on the southern edge.",
    sources: [
      {
        id: "satellite-ndvi",
        label: "Satellite NDVI",
        status: "fresh",
        updatedAt: "2026-05-16T09:20:00.000Z",
        summary: "Canopy signal is slightly below the farm baseline.",
      },
      {
        id: "weather",
        label: "Weather API",
        status: "fresh",
        updatedAt: "2026-05-16T10:20:00.000Z",
        summary: "Light rain likely, but not enough to replenish topsoil.",
      },
    ],
    actions: [
      {
        id: "inspect-south-edge",
        label: "Inspect south edge",
        description: "Check whether the dry signal follows soil variation or equipment coverage.",
        completed: false,
      },
    ],
  },
  "8996882": {
    name: "Benchmark Beef Grapes",
    crop: "Wine grapes",
    status: "all-good",
    harvestDays: 26,
    location: "Saclay plateau, France",
    riskLevel: "low",
    soilMoisturePct: 48,
    vegetationIndex: 0.72,
    temperatureC: 25,
    rainfallMmNext48h: 8,
    summary: "Healthy canopy and adequate moisture. No immediate action required.",
    sources: [
      {
        id: "satellite-ndvi",
        label: "Satellite NDVI",
        status: "fresh",
        updatedAt: "2026-05-16T09:20:00.000Z",
        summary: "Vegetation signal is above the parcel baseline.",
      },
      {
        id: "public-documents",
        label: "Public documents",
        status: "stale",
        updatedAt: "2026-04-22T08:00:00.000Z",
        summary: "No new restriction documents found this month.",
      },
    ],
    actions: [],
  },
  "11632447": {
    name: "Hallucination Oats",
    crop: "Spring oats",
    status: "needs-attention",
    harvestDays: 9,
    location: "South Paris agricultural edge, France",
    riskLevel: "medium",
    soilMoisturePct: 33,
    vegetationIndex: 0.58,
    temperatureC: 28,
    rainfallMmNext48h: 3,
    summary:
      "Drone observations suggest patchy emergence and possible compaction near the access track.",
    sources: [
      {
        id: "drone-imagery",
        label: "Drone imagery",
        status: "fresh",
        updatedAt: "2026-05-15T15:40:00.000Z",
        summary: "Patchy emergence detected on 7% of the parcel.",
      },
      {
        id: "soil-sensor",
        label: "Soil sensor",
        status: "fresh",
        updatedAt: "2026-05-16T10:05:00.000Z",
        summary: "Soil moisture is acceptable but uneven.",
      },
    ],
    actions: [
      {
        id: "drone-follow-up",
        label: "Request drone scout",
        description: "Capture a low-altitude pass over the access track and compacted area.",
        completed: false,
      },
    ],
  },
};

const features = rpgParcels.features as RpgFeature[];

function getOuterRing(feature: RpgFeature) {
  return feature.geometry.coordinates[0]?.[0] ?? [];
}

function getCenter(ring: number[][]) {
  const total = ring.reduce(
    (acc, coordinate) => ({
      lat: acc.lat + coordinate[1],
      lng: acc.lng + coordinate[0],
    }),
    { lat: 0, lng: 0 },
  );

  return {
    lat: total.lat / ring.length,
    lng: total.lng / ring.length,
  };
}

const parcels: Parcel[] = features.map((feature) => {
  const scenario = scenarios[feature.properties.id_parcel];
  const ring = getOuterRing(feature);

  return {
    id: `rpg-${feature.properties.id_parcel}`,
    name: scenario.name,
    crop: scenario.crop,
    areaHa: feature.properties.surf_parc,
    status: scenario.status,
    harvestDays: scenario.harvestDays,
    location: scenario.location,
    riskLevel: scenario.riskLevel,
    soilMoisturePct: scenario.soilMoisturePct,
    vegetationIndex: scenario.vegetationIndex,
    temperatureC: scenario.temperatureC,
    rainfallMmNext48h: scenario.rainfallMmNext48h,
    center: getCenter(ring),
    boundary: ring.map((coordinate) => ({
      lat: coordinate[1],
      lng: coordinate[0],
    })),
    summary: scenario.summary,
    sources: scenario.sources,
    actions: scenario.actions,
  };
}).sort((first, second) => {
  if (first.status === second.status) {
    return first.name.localeCompare(second.name);
  }

  return first.status === "needs-attention" ? -1 : 1;
});

export async function listParcelRecords() {
  return parcels;
}

export async function getParcelRecord(id: string) {
  return parcels.find((parcel) => parcel.id === id) ?? null;
}
