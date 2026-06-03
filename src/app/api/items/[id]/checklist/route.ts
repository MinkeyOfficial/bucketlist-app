import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  const item = await prisma.bucketItem.findFirst({
    where: { id, userId: user.id },
  });
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { title } = await req.json();
  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const maxOrder = await prisma.checklistItem.aggregate({
    where: { itemId: id },
    _max: { sortOrder: true },
  });

  const checklistItem = await prisma.checklistItem.create({
    data: {
      itemId: id,
      title: title.trim(),
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  return NextResponse.json({ checklistItem }, { status: 201 });
}
