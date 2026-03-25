import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { MemberData } from "@/lib/types";

const MEMBERS_PATH = path.join(process.cwd(), "data", "members.json");

function readMembers(): MemberData {
  const raw = fs.readFileSync(MEMBERS_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeMembers(data: MemberData): void {
  fs.writeFileSync(MEMBERS_PATH, JSON.stringify(data, null, 2));
}

// Random fun emoji for new guests
const GUEST_EMOJIS = ["🎲", "🎯", "🚀", "🦊", "🍕", "🎵", "🌈", "🔥", "💎", "🎪", "🦁", "🐉"];

// GET /api/members — return all members
export async function GET() {
  const data = readMembers();
  return NextResponse.json(data);
}

// POST /api/members — add a guest member
// Body: { name: string }
export async function POST(request: Request) {
  const body = await request.json();
  const { name } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json(
      { error: "Name is required" },
      { status: 400 }
    );
  }

  const data = readMembers();

  // Generate a URL-safe ID from the name
  const id = name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  // Check for duplicate IDs
  if (data.members.some((m) => m.id === id)) {
    return NextResponse.json(
      { error: "A member with that name already exists" },
      { status: 409 }
    );
  }

  const emoji = GUEST_EMOJIS[Math.floor(Math.random() * GUEST_EMOJIS.length)];

  data.members.push({
    id,
    name: name.trim(),
    emoji,
    isCore: false,
  });

  writeMembers(data);
  return NextResponse.json(data);
}
