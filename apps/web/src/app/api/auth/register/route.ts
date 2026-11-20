import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma, Prisma } from "@covalent/database";
import { signToken } from "@/lib/auth";

const CURSOR_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6", "#06B6D4"];

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password || password.length < 6) {
      return NextResponse.json(
        { error: "সঠিক নাম, ইমেইল এবং কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "এই ইমেইলটি ইতিমধ্যে নিবন্ধিত" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const cursorColor = CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];

    const user = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const createdUser = await tx.user.create({
        data: { name, email, passwordHash, cursorColor },
      });

      const slug = `${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now().toString().slice(-4)}`;
      const workspace = await tx.workspace.create({
        data: {
          name: `${name} — VesperaSync Space`,
          slug,
          members: {
            create: { userId: createdUser.id, role: "OWNER" },
          },
          documents: {
            create: {
              title: "VesperaSync System Architecture & CRDT Notes",
            },
          },
        },
      });

      await tx.auditLog.create({
        data: {
          action: "WORKSPACE_CREATED",
          workspaceId: workspace.id,
          actorId: createdUser.id,
          metadata: { source: "registration", brand: "VesperaSync" },
        },
      });

      return createdUser;
    });

    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      cursorColor: user.cursorColor,
    });

    const response = NextResponse.json({ success: true, token });
    response.cookies.set("vesperasync_token", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "সার্ভারে সমস্যা হয়েছে" }, { status: 500 });
  }
}