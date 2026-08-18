import { NextResponse } from "next/server";
import { getOnDutyInfo } from "@/lib/support-schedule";

export function GET() {
  return NextResponse.json(getOnDutyInfo(new Date()), {
    headers: { "Cache-Control": "no-store" },
  });
}
