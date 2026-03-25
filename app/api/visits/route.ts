import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { VisitData } from "@/lib/types";

const VISITS_PATH = path.join(process.cwd(), "data", "visits.json");

function readVisits(): VisitData {
  const raw = fs.readFileSync(VISITS_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeVisits(data: VisitData): void {
  fs.writeFileSync(VISITS_PATH, JSON.stringify(data, null, 2));
}

// GET /api/visits — return all group visits
export async function GET() {
  const data = readVisits();
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

  const data = readVisits();

  // Replace any existing visit for this pub (re-visiting updates it)
  data.visits = data.visits.filter((v) => v.pubId !== pubId);
  data.visits.push({ pubId, date, attendees });

  writeVisits(data);
  return NextResponse.json(data);
}
