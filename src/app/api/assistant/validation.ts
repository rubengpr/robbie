import type { AssistantRequest } from "@/types/assistant";

export function parseAssistantRequest(body: unknown): AssistantRequest | null {
  if (
    !body ||
    typeof body !== "object" ||
    !("parcelId" in body) ||
    !("message" in body) ||
    typeof body.parcelId !== "string" ||
    typeof body.message !== "string"
  ) {
    return null;
  }

  const message = body.message.trim();

  if (message.length === 0) {
    return null;
  }

  return {
    parcelId: body.parcelId,
    message,
  };
}
