import { NextResponse } from "next/server";
import { getCurrentUser, clearAuthCookie } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({ user });
}

export async function DELETE() {
  return NextResponse.json(
    { success: true },
    { headers: clearAuthCookie() }
  );
}
