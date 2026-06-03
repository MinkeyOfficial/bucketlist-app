import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const items = await prisma.bucketItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      targetDate: true,
      coverImage: false,
      coverMime: true,
      createdAt: true,
      _count: { select: { images: true, links: true } },
    },
  });

  const itemsWithCoverFlag = items.map((item) => ({
    ...item,
    hasCover: !!item.coverMime,
  }));

  return NextResponse.json({ items: itemsWithCoverFlag });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { title, description, status, priority, targetDate } = await req.json();

  if (!title) {
    return NextResponse.json(
      { error: "Title is required" },
      { status: 400 }
    );
  }

  const item = await prisma.bucketItem.create({
    data: {
      userId: user.id,
      title,
      description: description || null,
      status: status || "TODO",
      priority: priority || 0,
      targetDate: targetDate ? new Date(targetDate) : null,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}
