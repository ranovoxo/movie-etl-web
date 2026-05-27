import { NextResponse } from "next/server";
import { getRatingsByLanguage } from "@/lib/reports";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getRatingsByLanguage());
}
