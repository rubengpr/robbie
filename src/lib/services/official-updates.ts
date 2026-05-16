import "server-only";

import { hasOpenAIConfig } from "@/lib/integrations/openai/client";
import { fetchOfficialUpdateSources } from "@/lib/integrations/tavily/official-updates";
import {
  OfficialUpdateClassifierInvalidOutputError,
  OfficialUpdateClassifierUnavailableError,
  classifyOfficialUpdates,
} from "@/lib/services/official-update-classifier";
import { listParcels } from "@/lib/services/parcels";
import type {
  ExtractedOfficialUpdateSource,
  OfficialUpdatesBriefing,
} from "@/types/official-update";
import type { Parcel } from "@/types/parcel";

const DEMO_AREA_NAME = "Essonne, France";

type FarmAreaContext = {
  areaName: string;
  parcelCount: number;
  center: Parcel["center"];
};

export class OfficialUpdatesProviderUnavailableError extends Error {
  constructor() {
    super("Official updates provider unavailable");
  }
}

export class OfficialUpdatesInvalidClassificationError extends Error {
  constructor() {
    super("Official updates classification failed");
  }
}

export async function getOfficialUpdatesBriefing(): Promise<OfficialUpdatesBriefing | null> {
  const parcels = await listParcels();

  if (parcels.length === 0) {
    return null;
  }

  const area = getFarmAreaContext(parcels);

  if (!hasOpenAIConfig()) {
    throw new OfficialUpdatesProviderUnavailableError();
  }

  const sources = await fetchOfficialUpdateSources(area);

  if (!sources) {
    throw new OfficialUpdatesProviderUnavailableError();
  }

  try {
    const findings = await classifyOfficialUpdates(sources);

    return buildBriefing(area, sources, findings);
  } catch (error) {
    if (error instanceof OfficialUpdateClassifierUnavailableError) {
      throw new OfficialUpdatesProviderUnavailableError();
    }

    if (error instanceof OfficialUpdateClassifierInvalidOutputError) {
      throw new OfficialUpdatesInvalidClassificationError();
    }

    throw error;
  }
}

function buildBriefing(
  area: FarmAreaContext,
  sources: ExtractedOfficialUpdateSource[],
  findings: OfficialUpdatesBriefing["findings"],
): OfficialUpdatesBriefing {
  return {
    areaName: area.areaName,
    parcelCount: area.parcelCount,
    updatedAt: new Date().toISOString(),
    retrievalStatus:
      sources.length > 0 ? "sources-found" : "no-sources-found",
    websitesCrawled: sources.length,
    alertsFound: findings.filter((finding) => finding.severity === "alert")
      .length,
    warningsFound: findings.filter((finding) => finding.severity === "warning")
      .length,
    sources: sources.map((source) => ({
      title: source.title,
      url: source.url,
      domain: source.domain,
      excerpt: source.excerpt,
    })),
    findings,
    isFallback: false,
  };
}

function getFarmAreaContext(parcels: Parcel[]): FarmAreaContext {
  const center = parcels.reduce(
    (acc, parcel) => ({
      lat: acc.lat + parcel.center.lat / parcels.length,
      lng: acc.lng + parcel.center.lng / parcels.length,
    }),
    { lat: 0, lng: 0 },
  );

  return {
    areaName: DEMO_AREA_NAME,
    parcelCount: parcels.length,
    center,
  };
}
