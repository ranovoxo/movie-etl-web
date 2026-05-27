import { NextResponse } from "next/server";
import { getTopMovies } from "@/lib/reports";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getTopMovies());
}
