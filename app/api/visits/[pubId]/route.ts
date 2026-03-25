import { NextResponse } from "next/server";
import { getVisits, saveVisits } from "@/lib/data";

// DELETE /api/visits/[pubId] — remove a visit (undo a check-in)
export async function DELETE(
  _request: Request,
  { params }: { params: { pubId: string } }
) {
  const pubId = parseInt(params.pubId, 10);

  if (isNaN(pubId)) {
    return NextResponse.json({ error: "Invalid pubId" }, { status: 400 });
  }

  const data = await getVisits();

  const before = data.visits.length;
  data.visits = data.visits.filter((v) => v.pubId !== pubId);

  if (data.visits.length === before) {
    return NextResponse.json({ error: "Visit not found" }, { status: 404 });
  }

  await saveVisits(data);
  return NextResponse.json(data);
}
