import { NextResponse } from "next/server";
import { getTripStore, saveTripStore } from "@/lib/tripData";

// PUT /api/trips/[tripId] — update a trip (reorder pubs, set date, etc.)
// For custom trips: updates name, description, pubIds, plannedDate
// For pre-defined trips: updates overrides (pubOrder, plannedDate)
export async function PUT(
  request: Request,
  { params }: { params: { tripId: string } }
) {
  const { tripId } = params;
  const body = await request.json();
  const data = await getTripStore();

  // Check if it's a custom trip
  const customIdx = data.customTrips.findIndex((t) => t.id === tripId);

  if (customIdx !== -1) {
    // Update custom trip fields
    const trip = data.customTrips[customIdx];
    if (body.name !== undefined) trip.name = body.name;
    if (body.description !== undefined) trip.description = body.description;
    if (body.pubIds !== undefined) trip.pubIds = body.pubIds;
    if (body.plannedDate !== undefined) trip.plannedDate = body.plannedDate || undefined;
    data.customTrips[customIdx] = trip;
  } else {
    // Pre-defined trip — store/update overrides
    const existing = data.overrides[tripId] ?? {};
    if (body.pubOrder !== undefined) existing.pubOrder = body.pubOrder;
    if (body.plannedDate !== undefined) existing.plannedDate = body.plannedDate || undefined;
    data.overrides[tripId] = existing;
  }

  await saveTripStore(data);
  return NextResponse.json(data);
}

// DELETE /api/trips/[tripId] — delete a custom trip (pre-defined trips cannot be deleted)
export async function DELETE(
  _request: Request,
  { params }: { params: { tripId: string } }
) {
  const { tripId } = params;
  const data = await getTripStore();

  const before = data.customTrips.length;
  data.customTrips = data.customTrips.filter((t) => t.id !== tripId);

  if (data.customTrips.length === before) {
    return NextResponse.json(
      { error: "Custom trip not found (pre-defined trips cannot be deleted)" },
      { status: 404 }
    );
  }

  // Also remove any overrides if they existed
  delete data.overrides[tripId];

  await saveTripStore(data);
  return NextResponse.json(data);
}
