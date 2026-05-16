"use client";

import { useAssistant } from "@/hooks/use-assistant";
import type { Parcel } from "@/types/parcel";

type AssistantPanelProps = {
  parcels: Parcel[];
};

export function AssistantPanel({ parcels }: AssistantPanelProps) {
  const {
    error,
    isLoading,
    message,
    messages,
    selectedParcelId,
    setMessage,
    setSelectedParcelId,
    submitQuestion,
  } = useAssistant(parcels[0]?.id ?? "");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitQuestion();
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
          AI Assistant
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">
          Ask about a parcel
        </h2>
      </div>

      <div className="max-h-[420px] space-y-3 overflow-y-auto p-5">
        {messages.map((chatMessage) => (
          <div
            key={chatMessage.id}
            className={`rounded-lg px-4 py-3 text-sm leading-6 ${
              chatMessage.role === "assistant"
                ? "bg-slate-100 text-slate-800"
                : "ml-8 bg-teal-700 text-white"
            }`}
          >
            {chatMessage.content}
          </div>
        ))}
      </div>

      <form
        className="space-y-3 border-t border-slate-200 p-5"
        onSubmit={handleSubmit}
      >
        <label className="block text-sm font-medium text-slate-700">
          Parcel
          <select
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-600"
            value={selectedParcelId}
            onChange={(event) => setSelectedParcelId(event.target.value)}
          >
            {parcels.map((parcel) => (
              <option key={parcel.id} value={parcel.id}>
                {parcel.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Question
          <textarea
            className="mt-2 min-h-24 w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-600"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </label>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        <button
          className="w-full rounded-md bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? "Analyzing parcel..." : "Ask assistant"}
        </button>
      </form>
    </section>
  );
}
