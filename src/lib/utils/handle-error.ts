import { NextResponse } from "next/server";

export function internalServerError() {
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
