import "server-only";

import OpenAI from "openai";

export const OFFICIAL_UPDATES_MODEL = "gpt-5.4-mini";

export function hasOpenAIConfig() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function createOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  return new OpenAI({ apiKey });
}
