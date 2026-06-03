import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (id.startsWith("cover-")) {
    const itemId = id.replace("cover-", "");
    const item = await prisma.bucketItem.findUnique({
      where: { id: itemId },
      select: { coverImage: true, coverMime: true },
    });
    if (!item?.coverImage) {
      return new NextResponse("Not found", { status: 404 });
    }
    return new NextResponse(item.coverImage, {
      headers: {
        "Content-Type": item.coverMime || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  const image = await prisma.itemImage.findUnique({
    where: { id },
    select: { data: true, mimeType: true },
  });

  if (!image) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(image.data, {
    headers: {
      "Content-Type": image.mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const image = await prisma.itemImage.findUnique({ where: { id } });
  if (!image) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.itemImage.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
