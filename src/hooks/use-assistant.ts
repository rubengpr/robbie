"use client";

import { useState } from "react";
import { askAssistant } from "@/lib/api/assistant";
import type { AssistantMessage } from "@/types/assistant";

const initialMessages: AssistantMessage[] = [
  {
    id: "assistant-welcome",
    role: "assistant",
    content:
      "I can summarize parcel size and whether it needs attention.",
  },
];

export function useAssistant(initialParcelId: string) {
  const [selectedParcelId, setSelectedParcelId] = useState(initialParcelId);
  const [message, setMessage] = useState("Does this parcel need attention?");
  const [messages, setMessages] = useState(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function submitQuestion() {
    if (!selectedParcelId || message.trim().length === 0) {
      setError("Choose a parcel and enter a question.");
      return;
    }

    const userMessage: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message.trim(),
    };

    setError("");
    setIsLoading(true);
    setMessages((currentMessages) => [...currentMessages, userMessage]);

    try {
      const answer = await askAssistant({
        parcelId: selectedParcelId,
        message: message.trim(),
      });

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: answer.reply,
        },
      ]);
    } catch {
      setError("The assistant could not answer right now.");
    } finally {
      setIsLoading(false);
    }
  }

  return {
    error,
    isLoading,
    message,
    messages,
    selectedParcelId,
    setMessage,
    setSelectedParcelId,
    submitQuestion,
  };
}
