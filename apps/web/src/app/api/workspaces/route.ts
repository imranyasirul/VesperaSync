import { NextResponse } from "next/server";
import { prisma } from "@covalent/database";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: session.userId },
      include: {
        workspace: {
          include: {
            documents: {
              where: { isArchived: false },
              orderBy: { updatedAt: "desc" },
            },
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    cursorColor: true,
                  },
                },
              },
            },
            auditLogs: {
              take: 15,
              orderBy: { createdAt: "desc" },
              include: {
                actor: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      user: session,
      workspaces: memberships.map((m) => ({
        ...m.workspace,
        myRole: m.role,
      })),
    });
  } catch (error) {
    console.error("Workspaces fetch error:", error);
    return NextResponse.json({ error: "Failed to load workspaces" }, { status: 500 });
  }
}