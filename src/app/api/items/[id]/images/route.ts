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

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const caption = formData.get("caption") as string | null;

  if (!file) {
    return NextResponse.json(
      { error: "File is required" },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const image = await prisma.itemImage.create({
    data: {
      itemId: id,
      data: buffer,
      mimeType: file.type,
      caption: caption || null,
    },
    select: { id: true, caption: true, mimeType: true, createdAt: true },
  });

  return NextResponse.json({ image }, { status: 201 });
}
