import type { OfficialUpdatesBriefing } from "@/types/official-update";

type OfficialUpdatesApiResponse =
  | {
      success: true;
      data: OfficialUpdatesBriefing;
    }
  | {
      error: string;
    };

export async function fetchOfficialUpdatesBriefing() {
  const response = await fetch("/api/official-updates");
  const body = (await response.json()) as OfficialUpdatesApiResponse;

  if (!response.ok || "error" in body) {
    throw new Error("Unable to load official updates");
  }

  return body.data;
}
