import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { VisitData } from "@/lib/types";

const VISITS_PATH = path.join(process.cwd(), "data", "visits.json");

// DELETE /api/visits/[pubId] — remove a visit (undo a check-in)
export async function DELETE(
  _request: Request,
  { params }: { params: { pubId: string } }
) {
  const pubId = parseInt(params.pubId, 10);

  if (isNaN(pubId)) {
    return NextResponse.json({ error: "Invalid pubId" }, { status: 400 });
  }

  const raw = fs.readFileSync(VISITS_PATH, "utf-8");
  const data: VisitData = JSON.parse(raw);

  const before = data.visits.length;
  data.visits = data.visits.filter((v) => v.pubId !== pubId);

  if (data.visits.length === before) {
    return NextResponse.json({ error: "Visit not found" }, { status: 404 });
  }

  fs.writeFileSync(VISITS_PATH, JSON.stringify(data, null, 2));
  return NextResponse.json(data);
}
