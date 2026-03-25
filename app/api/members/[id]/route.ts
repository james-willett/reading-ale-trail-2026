import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { MemberData, VisitData } from "@/lib/types";

const MEMBERS_PATH = path.join(process.cwd(), "data", "members.json");
const VISITS_PATH = path.join(process.cwd(), "data", "visits.json");

// DELETE /api/members/[id] — remove a guest member (core members can't be removed)
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Read members
  const membersRaw = fs.readFileSync(MEMBERS_PATH, "utf-8");
  const membersData: MemberData = JSON.parse(membersRaw);

  const member = membersData.members.find((m) => m.id === id);

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  if (member.isCore) {
    return NextResponse.json(
      { error: "Core members cannot be removed" },
      { status: 403 }
    );
  }

  // Remove the member
  membersData.members = membersData.members.filter((m) => m.id !== id);
  fs.writeFileSync(MEMBERS_PATH, JSON.stringify(membersData, null, 2));

  // Also clean up their visits
  const visitsRaw = fs.readFileSync(VISITS_PATH, "utf-8");
  const visitsData: VisitData = JSON.parse(visitsRaw);
  visitsData.visits = visitsData.visits.filter((v) => v.personId !== id);
  fs.writeFileSync(VISITS_PATH, JSON.stringify(visitsData, null, 2));

  return NextResponse.json(membersData);
}
