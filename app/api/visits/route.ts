import { NextResponse } from "next/server";
import { getVisits, saveVisits } from "@/lib/data";

// GET /api/visits — return all group visits
export async function GET() {
  const data = await getVisits();
  return NextResponse.json(data);
}

// POST /api/visits — record a group visit to a pub
// Body: { pubId: number, date: string, attendees: [{name: string, drink: string}] }
export async function POST(request: Request) {
  const body = await request.json();
  const { pubId, date, attendees } = body;

  if (!pubId || !date || !Array.isArray(attendees) || attendees.length === 0) {
    return NextResponse.json(
      { error: "pubId, date, and at least one attendee are required" },
      { status: 400 }
    );
  }

  const data = await getVisits();

  // Replace any existing visit for this pub (re-visiting updates it)
  data.visits = data.visits.filter((v) => v.pubId !== pubId);
  data.visits.push({ pubId, date, attendees });

  await saveVisits(data);
  return NextResponse.json(data);
}
