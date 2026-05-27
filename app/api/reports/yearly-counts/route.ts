import { NextResponse } from "next/server";
import { getYearlyCounts } from "@/lib/reports";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getYearlyCounts());
}
