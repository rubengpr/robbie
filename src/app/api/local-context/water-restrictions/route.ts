import { NextResponse } from "next/server";
import { getWaterRestrictionBriefing } from "@/lib/services/water-restrictions";
import { internalServerError } from "@/lib/utils/handle-error";

export async function GET() {
  try {
    const briefing = await getWaterRestrictionBriefing();

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
  } catch {
    return internalServerError();
  }
}
