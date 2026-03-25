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

// GET /api/visits — return all visit data
export async function GET() {
  const data = readVisits();
  return NextResponse.json(data);
}

// POST /api/visits — toggle a pub visit for a person
// Body: { personId: string, pubId: number, visited: boolean }
export async function POST(request: Request) {
  const body = await request.json();
  const { personId, pubId, visited } = body;

  if (!personId || !pubId) {
    return NextResponse.json(
      { error: "personId and pubId are required" },
      { status: 400 }
    );
  }

  const data = readVisits();

  if (visited) {
    // Add visit if not already present
    const exists = data.visits.some(
      (v) => v.personId === personId && v.pubId === pubId
    );
    if (!exists) {
      data.visits.push({
        personId,
        pubId,
        date: new Date().toISOString(),
      });
    }
  } else {
    // Remove visit
    data.visits = data.visits.filter(
      (v) => !(v.personId === personId && v.pubId === pubId)
    );
  }

  writeVisits(data);
  return NextResponse.json(data);
}
