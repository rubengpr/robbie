export type AssistantMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

export type AssistantRequest = {
  parcelId: string;
  message: string;
};

export type AssistantResponse = {
  reply: string;
  suggestedActions: string[];
};
