import type { AssistantRequest, AssistantResponse } from "@/types/assistant";

type AssistantApiResponse =
  | {
      success: true;
      data: AssistantResponse;
    }
  | {
      error: string;
    };

export async function askAssistant(request: AssistantRequest) {
  const response = await fetch("/api/assistant", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  const body = (await response.json()) as AssistantApiResponse;

  if (!response.ok || "error" in body) {
    throw new Error("Assistant request failed");
  }

  return body.data;
}
