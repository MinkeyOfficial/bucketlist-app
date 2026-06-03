import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  const item = await prisma.bucketItem.findFirst({
    where: { id, userId: user.id },
    include: {
      images: {
        select: { id: true, caption: true, mimeType: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
      links: { orderBy: { createdAt: "desc" } },
      checklist: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { coverImage, ...rest } = item;
  return NextResponse.json({
    item: { ...rest, hasCover: !!coverImage },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.bucketItem.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};

  if (body.title !== undefined) data.title = body.title;
  if (body.description !== undefined) data.description = body.description;
  if (body.status !== undefined) {
    data.status = body.status;
    if (body.status === "DONE") {
      data.completedAt = new Date();
    } else {
      data.completedAt = null;
    }
  }
  if (body.priority !== undefined) data.priority = body.priority;
  if (body.targetDate !== undefined)
    data.targetDate = body.targetDate ? new Date(body.targetDate) : null;

  if (body.coverImage !== undefined) {
    if (body.coverImage === null) {
      data.coverImage = null;
      data.coverMime = null;
    } else {
      const buffer = Buffer.from(body.coverImage, "base64");
      data.coverImage = buffer;
      data.coverMime = body.coverMime || "image/jpeg";
    }
  }

  const item = await prisma.bucketItem.update({ where: { id }, data });
  const { coverImage: _ci, ...rest } = item;

  return NextResponse.json({ item: { ...rest, hasCover: !!item.coverImage } });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.bucketItem.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.bucketItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
