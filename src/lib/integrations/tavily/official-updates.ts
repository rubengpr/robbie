import "server-only";

import { createTavilyClient } from "@/lib/integrations/tavily/client";
import type { ExtractedOfficialUpdateSource } from "@/types/official-update";
import type { Parcel } from "@/types/parcel";

const OFFICIAL_DOMAINS = [
  "vigieau.gouv.fr",
  "data.gouv.fr",
  "service-public.fr",
  "ecologie.gouv.fr",
  "essonne.gouv.fr",
  "agriculture.gouv.fr",
];

const SEARCH_QUERIES = [
  "Essonne sécheresse irrigation arrêté préfectoral agriculture",
  "site:essonne.gouv.fr sécheresse irrigation Essonne",
  "site:vigieau.gouv.fr Essonne restriction eau irrigation",
];

const MIN_SOURCE_COUNT = 2;
const SOURCE_LIMIT = 5;

type FarmAreaContext = {
  areaName: string;
  center: Parcel["center"];
};

export async function fetchOfficialUpdateSources(
  area: FarmAreaContext,
): Promise<ExtractedOfficialUpdateSource[] | null> {
  const client = createTavilyClient();

  if (!client) {
    return null;
  }

  const searchResults = [];
  const seenUrls = new Set<string>();

  for (const query of buildOfficialUpdatesQueries(area)) {
    const searchResponse = await client.search(query, {
      searchDepth: "advanced",
      topic: "general",
      country: "france",
      maxResults: 8,
      includeAnswer: false,
      includeDomains: OFFICIAL_DOMAINS,
      includeFavicon: true,
      timeout: 15,
    });

    for (const result of searchResponse.results) {
      const normalizedUrl = normalizeUrl(result.url);

      if (
        searchResults.length >= SOURCE_LIMIT ||
        seenUrls.has(normalizedUrl) ||
        !isOfficialSource(result.url)
      ) {
        continue;
      }

      searchResults.push(result);
      seenUrls.add(normalizedUrl);
    }

    if (searchResults.length >= MIN_SOURCE_COUNT) {
      break;
    }
  }

  if (searchResults.length === 0) {
    return [];
  }

  const extractResponse = await client.extract(
    searchResults.map((result) => result.url),
    {
      extractDepth: "advanced",
      format: "markdown",
      query:
        "French farmer operational update irrigation restriction drought weather crop disease subsidy compliance deadline field work warning",
      chunksPerSource: 3,
      timeout: 20,
    },
  );

  const extractedByUrl = new Map(
    extractResponse.results.map((result) => [result.url, result.rawContent]),
  );

  return searchResults.map((result) => {
    const rawContent = compactText(
      extractedByUrl.get(result.url) ?? result.content,
      2400,
    );

    return {
      title: result.title,
      url: result.url,
      domain: getDomain(result.url),
      excerpt: compactText(rawContent || result.content, 260),
      rawContent,
    };
  });
}

function buildOfficialUpdatesQueries(area: FarmAreaContext) {
  const lat = area.center.lat.toFixed(5);
  const lng = area.center.lng.toFixed(5);
  const areaContext = `${area.areaName} lat ${lat} lon ${lng}`;

  return SEARCH_QUERIES.map((query) => `${query} ${areaContext}`);
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

function normalizeUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    parsedUrl.hash = "";
    parsedUrl.search = "";
    return parsedUrl.toString().replace(/\/$/, "");
  } catch {
    return url;
  }
}

function compactText(text: string, maxLength: number) {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trim()}…`;
}
