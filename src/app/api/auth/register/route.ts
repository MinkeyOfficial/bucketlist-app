import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, name, password } = await req.json();

  if (!email || !name || !password) {
    return NextResponse.json(
      { error: "Email, name and password are required" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "User with this email already exists" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, name, passwordHash },
  });

  const token = signToken(user.id);
  return NextResponse.json(
    { user: { id: user.id, email: user.email, name: user.name } },
    { status: 201, headers: setAuthCookie(token) }
  );
}
