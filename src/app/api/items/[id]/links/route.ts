import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function detectLinkType(url: string): "YOUTUBE" | "WEBSITE" | "OTHER" {
  if (/youtube\.com|youtu\.be/i.test(url)) return "YOUTUBE";
  if (/^https?:\/\//i.test(url)) return "WEBSITE";
  return "OTHER";
}

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

  const { url, title } = await req.json();
  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  const link = await prisma.itemLink.create({
    data: {
      itemId: id,
      url,
      title: title || null,
      linkType: detectLinkType(url),
    },
  });

  return NextResponse.json({ link }, { status: 201 });
}
