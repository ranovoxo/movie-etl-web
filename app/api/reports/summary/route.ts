import { NextResponse } from "next/server";
import { getSummary } from "@/lib/reports";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getSummary());
}
