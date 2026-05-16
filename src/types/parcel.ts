export type ParcelRiskLevel = "low" | "medium" | "high";

export type ParcelStatus = "all-good" | "needs-attention";

export type DataSourceStatus = "fresh" | "stale" | "missing";

export type ParcelDataSource = {
  id: string;
  label: string;
  status: DataSourceStatus;
  updatedAt: string;
  summary: string;
};

export type ParcelAction = {
  id: string;
  label: string;
  description: string;
  completed: boolean;
};

export type ParcelCoordinate = {
  lat: number;
  lng: number;
};

export type Parcel = {
  id: string;
  name: string;
  crop: string;
  areaHa: number;
  status: ParcelStatus;
  harvestDays: number;
  location: string;
  riskLevel: ParcelRiskLevel;
  soilMoisturePct: number;
  vegetationIndex: number;
  temperatureC: number;
  rainfallMmNext48h: number;
  center: ParcelCoordinate;
  boundary: ParcelCoordinate[];
  summary: string;
  sources: ParcelDataSource[];
  actions: ParcelAction[];
};
