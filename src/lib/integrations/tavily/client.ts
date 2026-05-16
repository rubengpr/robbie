import "server-only";

import { tavily } from "@tavily/core";
import type { TavilyClient } from "@tavily/core";

const CLIENT_NAME = "parcelops-water-restriction-monitor";

export function createTavilyClient(): TavilyClient | null {
  const apiKey = process.env.TAVILY_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  return tavily({
    apiKey,
    clientName: CLIENT_NAME,
  });
}
