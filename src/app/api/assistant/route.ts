import { NextResponse } from "next/server";
import { answerParcelQuestion } from "@/lib/services/assistant";
import { internalServerError } from "@/lib/utils/handle-error";
import { parseAssistantRequest } from "./validation";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const parsedRequest = parseAssistantRequest(body);

    if (!parsedRequest) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const answer = await answerParcelQuestion(parsedRequest);

    if (!answer) {
      return NextResponse.json({ error: "Parcel not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: answer }, { status: 200 });
  } catch {
    return internalServerError();
  }
}
