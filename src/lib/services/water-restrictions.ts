import "server-only";

import { createTavilyClient } from "@/lib/integrations/tavily/client";
import { listParcels } from "@/lib/services/parcels";
import type { Parcel } from "@/types/parcel";
import type {
  AgricultureNewsItem,
  WaterRestrictionBriefing,
  WaterRestrictionRule,
  WaterRestrictionSeverity,
  WaterRestrictionSource,
  WaterRestrictionSourceKind,
  WaterRestrictionStatus,
} from "@/types/water-restriction";

const OFFICIAL_DOMAINS = [
  "vigieau.gouv.fr",
  "data.gouv.fr",
  "service-public.fr",
  "entreprendre.service-public.gouv.fr",
  "ecologie.gouv.fr",
  "info.gouv.fr",
  "essonne.gouv.fr",
  "prefectures-regions.gouv.fr",
];

const SOURCE_LIMIT = 4;
const DEMO_AREA_NAME = "Essonne, France";
const WEEKLY_SCAN_COPY = "Weekly scan of whitelisted official sources";

type FarmAreaContext = {
  areaName: string;
  parcelCount: number;
  center: Parcel["center"];
};

export async function getWaterRestrictionBriefing(): Promise<WaterRestrictionBriefing | null> {
  const parcels = await listParcels();

  if (parcels.length === 0) {
    return null;
  }

  const area = getFarmAreaContext(parcels);
  const client = createTavilyClient();

  if (!client) {
    return getFallbackBriefing(area);
  }

  try {
    const query = buildWaterRestrictionQuery(area);
    const searchResponse = await client.search(query, {
      searchDepth: "advanced",
      topic: "general",
      country: "france",
      maxResults: 6,
      includeAnswer: "advanced",
      includeDomains: OFFICIAL_DOMAINS,
      includeFavicon: true,
      timeout: 15,
    });

    const officialResults = searchResponse.results
      .filter((result) => isOfficialSource(result.url))
      .slice(0, SOURCE_LIMIT);

    if (officialResults.length === 0) {
      return getFallbackBriefing(area);
    }

    const extractUrls = officialResults.map((result) => result.url);
    const extractResponse = await client.extract(extractUrls, {
      extractDepth: "advanced",
      format: "markdown",
      query:
        "agriculture Essonne drought water restrictions irrigation crop health subsidies official update",
      chunksPerSource: 3,
      timeout: 20,
    });

    const extractedByUrl = new Map(
      extractResponse.results.map((result) => [result.url, result.rawContent]),
    );
    const combinedText = [
      searchResponse.answer ?? "",
      ...officialResults.map((result) => result.content),
      ...Array.from(extractedByUrl.values()),
    ].join("\n");

    return buildLiveBriefing({
      area,
      answer: searchResponse.answer,
      combinedText,
      sources: officialResults.map((result) => ({
        title: result.title,
        url: result.url,
        domain: getDomain(result.url),
        kind: classifySource(result.url, result.title),
        excerpt: compactText(extractedByUrl.get(result.url) ?? result.content, 220),
      })),
    });
  } catch {
    return getFallbackBriefing(area);
  }
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

function buildWaterRestrictionQuery(area: FarmAreaContext) {
  const lat = area.center.lat.toFixed(5);
  const lng = area.center.lng.toFixed(5);

  return [
    "latest official agriculture updates Essonne",
    "drought water restrictions irrigation crop health subsidies",
    "VigiEau préfecture Essonne chambre agriculture arrêté sécheresse",
    area.areaName,
    `lat ${lat} lon ${lng}`,
  ].join(" ");
}

function buildLiveBriefing({
  answer,
  area,
  combinedText,
  sources,
}: {
  answer?: string;
  area: FarmAreaContext;
  combinedText: string;
  sources: WaterRestrictionSource[];
}): WaterRestrictionBriefing {
  const alertLevel = detectSeverity(combinedText);
  const status = getStatus(alertLevel);
  const headline = getHeadline(alertLevel, false);
  const summary =
    compactText(answer ?? "", 360) ||
    "Tavily found official water-restriction sources for this parcel area. Review the linked official documents before irrigation.";

  return {
    areaName: area.areaName,
    parcelCount: area.parcelCount,
    scanCadence: WEEKLY_SCAN_COPY,
    status,
    alertLevel,
    headline,
    summary,
    recommendedAction: getRecommendedAction(alertLevel, false),
    newsItems: buildLiveNewsItems(sources),
    restrictions: buildRules(alertLevel, combinedText),
    sources,
    updatedAt: new Date().toISOString(),
    isFallback: false,
  };
}

function getFallbackBriefing(area: FarmAreaContext): WaterRestrictionBriefing {
  const alertLevel: WaterRestrictionSeverity = "unknown";

  return {
    areaName: area.areaName,
    parcelCount: area.parcelCount,
    scanCadence: WEEKLY_SCAN_COPY,
    status: "unknown",
    alertLevel,
    headline: "Live official reading unavailable",
    summary:
      "Live source reading is unavailable. Configure Tavily to fetch and summarize official agriculture updates for this area.",
    recommendedAction:
      "Check VigiEau and the Essonne prefecture website directly before making irrigation decisions.",
    newsItems: [],
    restrictions: [
      {
        id: "irrigation-check",
        label: "Irrigation guidance",
        status: "check-order",
        detail:
          "Confirm the current prefectural order before watering; agricultural irrigation limits can vary by alert zone and water source.",
      },
    ],
    sources: [
      {
        title: "VigiEau",
        url: "https://vigieau.gouv.fr",
        domain: "vigieau.gouv.fr",
        kind: "official-page",
        excerpt:
          "Official platform for local drought water restrictions by address or map location.",
      },
      {
        title: "Essonne prefecture",
        url: "https://www.essonne.gouv.fr",
        domain: "essonne.gouv.fr",
        kind: "prefectural-order",
        excerpt:
          "Department prefecture pages publish local orders and administrative updates.",
      },
    ],
    updatedAt: new Date().toISOString(),
    isFallback: true,
  };
}

function buildLiveNewsItems(
  sources: WaterRestrictionSource[],
): AgricultureNewsItem[] {
  return sources.slice(0, 3).map((source, index) => ({
    id: `live-${index + 1}`,
    title: source.title,
    date: new Date().toISOString(),
    priority: index === 0 ? "high" : "medium",
    summary: source.excerpt,
    action: "Open the official source and confirm whether it changes this week's field work.",
    sourceDomain: source.domain,
  }));
}

function detectSeverity(text: string): WaterRestrictionSeverity {
  const normalized = text.toLowerCase();

  if (normalized.includes("crise")) {
    return "crisis";
  }

  if (
    normalized.includes("alerte renforcée") ||
    normalized.includes("alerte renforcee") ||
    normalized.includes("reinforced alert")
  ) {
    return "reinforced-alert";
  }

  if (normalized.includes("alerte") || normalized.includes("alert")) {
    return "alert";
  }

  if (normalized.includes("vigilance")) {
    return "vigilance";
  }

  if (
    normalized.includes("pas de restriction") ||
    normalized.includes("aucune restriction") ||
    normalized.includes("no restriction")
  ) {
    return "none";
  }

  return "unknown";
}

function getStatus(alertLevel: WaterRestrictionSeverity): WaterRestrictionStatus {
  if (alertLevel === "none") {
    return "clear";
  }

  if (alertLevel === "unknown") {
    return "unknown";
  }

  if (alertLevel === "vigilance") {
    return "monitor";
  }

  return "restricted";
}

function getHeadline(alertLevel: WaterRestrictionSeverity, isFallback: boolean) {
  if (isFallback) {
    return "Live official reading unavailable";
  }

  const copy: Record<WaterRestrictionSeverity, string> = {
    none: "No restriction signal found",
    vigilance: "Drought vigilance detected",
    alert: "Water-use alert detected",
    "reinforced-alert": "Reinforced water-use alert detected",
    crisis: "Crisis-level restriction detected",
    unknown: "Official sources need review",
  };

  return copy[alertLevel];
}

function getRecommendedAction(
  alertLevel: WaterRestrictionSeverity,
  isFallback: boolean,
) {
  if (isFallback) {
    return "Treat this as a demo briefing only. Before irrigating, confirm the current VigiEau result or prefectural order for this farm area.";
  }

  if (alertLevel === "none") {
    return "No restriction signal was detected, but keep the source links available before major irrigation decisions.";
  }

  if (alertLevel === "vigilance") {
    return "Monitor the parcel and avoid non-essential watering; restrictions may change quickly during dry periods.";
  }

  if (alertLevel === "unknown") {
    return "Review the linked official sources before irrigating; Tavily found relevant documents but the restriction level was not explicit.";
  }

  return "Do not irrigate until the current prefectural order confirms the allowed time window, water source, and irrigation method for this parcel.";
}

function buildRules(
  alertLevel: WaterRestrictionSeverity,
  text: string,
): WaterRestrictionRule[] {
  const normalized = text.toLowerCase();
  const hasIrrigation = normalized.includes("irrigation");
  const hasSprinkler =
    normalized.includes("aspersion") || normalized.includes("sprinkler");
  const hasLocalized =
    normalized.includes("localisée") ||
    normalized.includes("localisee") ||
    normalized.includes("localized");
  const hasProhibition =
    normalized.includes("interdit") ||
    normalized.includes("interdiction") ||
    normalized.includes("prohibited");

  return [
    {
      id: "irrigation",
      label: "Agricultural irrigation",
      status:
        alertLevel === "none"
          ? "allowed"
          : hasProhibition
            ? "prohibited"
            : alertLevel === "unknown"
              ? "check-order"
              : "restricted",
      detail: hasIrrigation
        ? "Official sources mention irrigation rules for agricultural users. Check the order for exact hours and water-source conditions."
        : "No specific irrigation rule was extracted; use the official links before watering.",
    },
    {
      id: "sprinkler-irrigation",
      label: "Sprinkler irrigation",
      status:
        alertLevel === "none"
          ? "allowed"
          : hasSprinkler
            ? "restricted"
            : "check-order",
      detail: hasSprinkler
        ? "Sprinkler irrigation appears in the extracted official text; verify the allowed time window before use."
        : "Not clearly identified in the extracted text; review the prefectural order.",
    },
    {
      id: "localized-irrigation",
      label: "Localized irrigation",
      status:
        alertLevel === "none"
          ? "allowed"
          : hasLocalized
            ? "restricted"
            : "check-order",
      detail: hasLocalized
        ? "Localized irrigation appears in the extracted official text and may have specific exceptions or limits."
        : "Not clearly identified in the extracted text; confirm whether drip/localized systems are treated separately.",
    },
  ];
}

function classifySource(url: string, title: string): WaterRestrictionSourceKind {
  const normalizedUrl = url.toLowerCase();
  const normalizedTitle = title.toLowerCase();

  if (normalizedUrl.endsWith(".pdf") || normalizedTitle.includes("arrêté")) {
    return "prefectural-order";
  }

  if (normalizedUrl.includes("data.gouv.fr")) {
    return "dataset";
  }

  if (
    normalizedTitle.includes("guide") ||
    normalizedUrl.includes("service-public") ||
    normalizedUrl.includes("ecologie.gouv.fr")
  ) {
    return "guidance";
  }

  return "official-page";
}

function isOfficialSource(url: string) {
  const domain = getDomain(url);

  return OFFICIAL_DOMAINS.some(
    (officialDomain) =>
      domain === officialDomain || domain.endsWith(`.${officialDomain}`),
  );
}

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}

function compactText(text: string, maxLength: number) {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trim()}…`;
}
