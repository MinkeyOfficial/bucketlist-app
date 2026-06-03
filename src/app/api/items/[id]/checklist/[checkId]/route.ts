import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; checkId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id, checkId } = await params;

  const item = await prisma.bucketItem.findFirst({
    where: { id, userId: user.id },
  });
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.done !== undefined) data.done = body.done;
  if (body.title !== undefined) data.title = body.title;

  const checklistItem = await prisma.checklistItem.update({
    where: { id: checkId },
    data,
  });

  return NextResponse.json({ checklistItem });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; checkId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id, checkId } = await params;

  const item = await prisma.bucketItem.findFirst({
    where: { id, userId: user.id },
  });
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.checklistItem.delete({ where: { id: checkId } });
  return NextResponse.json({ success: true });
}
