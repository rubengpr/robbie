import { NextResponse } from "next/server";
import {
  OfficialUpdatesInvalidClassificationError,
  OfficialUpdatesProviderUnavailableError,
  getOfficialUpdatesBriefing,
} from "@/lib/services/official-updates";
import { internalServerError } from "@/lib/utils/handle-error";

export async function GET() {
  try {
    const briefing = await getOfficialUpdatesBriefing();

    if (!briefing) {
      return NextResponse.json(
        { error: "No parcels available" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, data: briefing },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof OfficialUpdatesProviderUnavailableError) {
      return NextResponse.json(
        { error: "Official updates provider unavailable" },
        { status: 503 },
      );
    }

    if (error instanceof OfficialUpdatesInvalidClassificationError) {
      return NextResponse.json(
        { error: "Official updates classification failed" },
        { status: 502 },
      );
    }

    return internalServerError();
  }
}
