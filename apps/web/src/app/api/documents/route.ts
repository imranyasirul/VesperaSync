import { NextResponse } from "next/server";
import { prisma, Prisma } from "@covalent/database";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workspaceId, title } = await req.json();
    if (!workspaceId || !title?.trim()) {
      return NextResponse.json({ error: "Workspace ID and title are required" }, { status: 400 });
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: session.userId,
          workspaceId,
        },
      },
    });

    if (!membership || membership.role === "VIEWER") {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    const doc = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const createdDoc = await tx.document.create({
        data: {
          title: title.trim(),
          workspaceId,
        },
      });

      await tx.auditLog.create({
        data: {
          action: "DOCUMENT_CREATED",
          workspaceId,
          actorId: session.userId,
          metadata: { documentId: createdDoc.id, title: createdDoc.title },
        },
      });

      return createdDoc;
    });

    return NextResponse.json({ document: doc }, { status: 201 });
  } catch (error) {
    console.error("Create document error:", error);
    return NextResponse.json({ error: "Could not create document" }, { status: 500 });
  }
}