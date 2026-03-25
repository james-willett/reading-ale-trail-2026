import { NextResponse } from "next/server";
import { getTripStore, saveTripStore } from "@/lib/tripData";
import { CustomTrip } from "@/lib/types";

// GET /api/trips — return all trip data (custom trips + overrides)
export async function GET() {
  const data = await getTripStore();
  return NextResponse.json(data);
}

// POST /api/trips — create a new custom trip
// Body: { name: string, description?: string, pubIds: number[], plannedDate?: string }
export async function POST(request: Request) {
  const body = await request.json();
  const { name, description, pubIds, plannedDate } = body;

  if (!name || !Array.isArray(pubIds) || pubIds.length === 0) {
    return NextResponse.json(
      { error: "name and at least one pub are required" },
      { status: 400 }
    );
  }

  const data = await getTripStore();

  // Generate a unique ID for the custom trip
  const newTrip: CustomTrip = {
    id: `custom-${Date.now()}`,
    name,
    description: description || "",
    pubIds,
    plannedDate: plannedDate || undefined,
    isCustom: true,
  };

  data.customTrips.push(newTrip);
  await saveTripStore(data);

  return NextResponse.json(data);
}
