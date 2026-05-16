import type { AssistantRequest, AssistantResponse } from "@/types/assistant";
import { getParcel } from "@/lib/services/parcels";
import { formatHectares } from "@/lib/utils/format";

export async function answerParcelQuestion({
  parcelId,
  message,
}: AssistantRequest): Promise<AssistantResponse | null> {
  const parcel = await getParcel(parcelId);

  if (!parcel) {
    return null;
  }

  const normalizedMessage = message.toLowerCase();
  const asksForStatus =
    normalizedMessage.includes("status") ||
    normalizedMessage.includes("attention") ||
    normalizedMessage.includes("good");
  const statusLabel =
    parcel.status === "needs-attention" ? "needs attention" : "is all good";

  if (asksForStatus) {
    return {
      reply: `${parcel.name} is ${formatHectares(parcel.areaHa)} and ${statusLabel}.`,
      suggestedActions: ["Review parcel on map"],
    };
  }

  return {
    reply: `${parcel.name}: ${formatHectares(parcel.areaHa)}. Status: ${statusLabel}.`,
    suggestedActions: ["Review parcel on map"],
  };
}
