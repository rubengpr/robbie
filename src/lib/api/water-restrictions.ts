import type { WaterRestrictionBriefing } from "@/types/water-restriction";

type WaterRestrictionApiResponse =
  | {
      success: true;
      data: WaterRestrictionBriefing;
    }
  | {
      error: string;
    };

export async function fetchWaterRestrictionBriefing() {
  const response = await fetch("/api/local-context/water-restrictions");
  const body = (await response.json()) as WaterRestrictionApiResponse;

  if (!response.ok || !("success" in body)) {
    throw new Error("error" in body ? body.error : "Unable to load briefing");
  }

  return body.data;
}
