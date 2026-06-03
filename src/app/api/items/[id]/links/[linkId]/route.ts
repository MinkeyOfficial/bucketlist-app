import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; linkId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id, linkId } = await params;

  const item = await prisma.bucketItem.findFirst({
    where: { id, userId: user.id },
  });
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.itemLink.delete({ where: { id: linkId } });
  return NextResponse.json({ success: true });
}
