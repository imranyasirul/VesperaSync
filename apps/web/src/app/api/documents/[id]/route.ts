import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@covalent/database";
import { getSession } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        workspace: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!document || document.isArchived) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: session.userId,
          workspaceId: document.workspaceId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const cookieStore = await cookies();
    const wsToken = cookieStore.get("vesperasync_token")?.value || "";

    return NextResponse.json({
      document,
      role: membership.role,
      user: session,
      wsToken,
    });
  } catch (error) {
    console.error("Fetch document error:", error);
    return NextResponse.json({ error: "Failed to load document" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { title } = await req.json();

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const existingDoc = await prisma.document.findUnique({
      where: { id },
      select: { workspaceId: true },
    });

    if (!existingDoc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: session.userId,
          workspaceId: existingDoc.workspaceId,
        },
      },
    });

    if (!membership || membership.role === "VIEWER") {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    const updated = await prisma.document.update({
      where: { id },
      data: { title: title.trim() },
    });

    return NextResponse.json({ document: updated });
  } catch (error) {
    console.error("Update document error:", error);
    return NextResponse.json({ error: "Failed to update title" }, { status: 500 });
  }
}