import { NextResponse } from "next/server";
import { prisma } from "@covalent/database";
import { signToken } from "@/lib/auth";

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EC4899", "#8B5CF6"];

export async function POST() {
  try {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const demoEmail = `recruiter_${randomId}@vesperasync.dev`;
    const demoName = `Reviewer #${randomId}`;
    const cursorColor = COLORS[randomId % COLORS.length];

    let sharedWorkspace = await prisma.workspace.findUnique({
      where: { slug: "vesperasync-core-hq" },
    });

    if (!sharedWorkspace) {
      sharedWorkspace = await prisma.workspace.create({
        data: {
          name: "VesperaSync Core Engineering HQ",
          slug: "vesperasync-core-hq",
          documents: {
            create: [
              { title: "CRDT State Vector & Binary Sync Spec" },
              { title: "Production Readiness & Redis Pub/Sub Runbook" },
            ],
          },
        },
      });
    }

    const user = await prisma.user.create({
      data: {
        name: demoName,
        email: demoEmail,
        cursorColor,
        memberships: {
          create: {
            workspaceId: sharedWorkspace.id,
            role: "EDITOR",
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "MEMBER_INVITED",
        workspaceId: sharedWorkspace.id,
        actorId: user.id,
        metadata: { mode: "instant_demo_session" },
      },
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
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("Demo login error:", error);
    return NextResponse.json({ error: "ডেমো সেশন তৈরি করা যায়নি" }, { status: 500 });
  }
}