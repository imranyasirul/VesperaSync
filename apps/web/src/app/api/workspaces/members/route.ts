import { NextResponse } from "next/server";
import { prisma, Prisma } from "@covalent/database";
import { getSession } from "@/lib/auth";

const CURSOR_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6", "#06B6D4"];
type WorkspaceRole = "OWNER" | "EDITOR" | "VIEWER";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "অনুমতি নেই (Unauthorized)" }, { status: 401 });
    }

    const { workspaceId, email, role } = await req.json();
    const cleanEmail = email?.trim().toLowerCase();
    const assignedRole: WorkspaceRole = role === "VIEWER" ? "VIEWER" : "EDITOR";

    if (!workspaceId || !cleanEmail || !cleanEmail.includes("@")) {
      return NextResponse.json({ error: "সঠিক ইমেইল ঠিকানা প্রদান করুন" }, { status: 400 });
    }

    const callerMembership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: session.userId,
          workspaceId,
        },
      },
    });

    if (!callerMembership || callerMembership.role === "VIEWER") {
      return NextResponse.json(
        { error: "নতুন সদস্য আমন্ত্রণ জানানোর অনুমতি আপনার নেই" },
        { status: 403 }
      );
    }

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let targetUser = await tx.user.findUnique({
        where: { email: cleanEmail },
      });

      if (!targetUser) {
        const derivedName = cleanEmail.split("@")[0].replace(/[._-]/g, " ");
        const formattedName =
          derivedName.charAt(0).toUpperCase() + derivedName.slice(1);
        const randomColor =
          CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];

        targetUser = await tx.user.create({
          data: {
            email: cleanEmail,
            name: formattedName,
            cursorColor: randomColor,
          },
        });
      }

      const existingMember = await tx.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: targetUser.id,
            workspaceId,
          },
        },
      });

      if (existingMember) {
        throw new Error("ALREADY_MEMBER");
      }

      const newMember = await tx.workspaceMember.create({
        data: {
          userId: targetUser.id,
          workspaceId,
          role: assignedRole,
        },
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
      });

      await tx.auditLog.create({
        data: {
          action: "MEMBER_INVITED",
          workspaceId,
          actorId: session.userId,
          metadata: {
            event: "MEMBER_INVITED",
            invitedEmail: cleanEmail,
            assignedRole,
          },
        },
      });

      return newMember;
    });

    return NextResponse.json({ member: result }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "ALREADY_MEMBER") {
      return NextResponse.json(
        { error: "এই ব্যবহারকারী ইতিমধ্যে ওয়ার্কস্পেসে যুক্ত আছেন" },
        { status: 409 }
      );
    }
    console.error("Invite member error:", error);
    return NextResponse.json({ error: "সদস্য যুক্ত করা সম্ভব হয়নি" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "অনুমতি নেই (Unauthorized)" }, { status: 401 });
    }

    const { workspaceId, memberId, role } = await req.json();
    const nextRole: WorkspaceRole = role === "VIEWER" ? "VIEWER" : "EDITOR";

    if (!workspaceId || !memberId) {
      return NextResponse.json({ error: "অসম্পূর্ণ তথ্য" }, { status: 400 });
    }

    const callerMembership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: session.userId,
          workspaceId,
        },
      },
    });

    if (!callerMembership || callerMembership.role !== "OWNER") {
      return NextResponse.json(
        { error: "শুধুমাত্র ওয়ার্কস্পেস মালিক (OWNER) রোল পরিবর্তন করতে পারবেন" },
        { status: 403 }
      );
    }

    const updatedMember = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updated = await tx.workspaceMember.update({
        where: { id: memberId },
        data: { role: nextRole },
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
      });

      await tx.auditLog.create({
        data: {
          action: "MEMBER_INVITED",
          workspaceId,
          actorId: session.userId,
          metadata: {
            event: "MEMBER_ROLE_UPDATED",
            targetUser: updated.user.email,
            newRole: nextRole,
          },
        },
      });

      return updated;
    });

    return NextResponse.json({ member: updatedMember });
  } catch (error) {
    console.error("Update role error:", error);
    return NextResponse.json({ error: "রোল পরিবর্তন ব্যর্থ হয়েছে" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "অনুমতি নেই (Unauthorized)" }, { status: 401 });
    }

    const { workspaceId, memberId } = await req.json();
    if (!workspaceId || !memberId) {
      return NextResponse.json({ error: "অসম্পূর্ণ তথ্য" }, { status: 400 });
    }

    const callerMembership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: session.userId,
          workspaceId,
        },
      },
    });

    if (!callerMembership || callerMembership.role !== "OWNER") {
      return NextResponse.json(
        { error: "শুধুমাত্র ওয়ার্কস্পেস মালিক সদস্য সরাতে পারবেন" },
        { status: 403 }
      );
    }

    const targetMember = await prisma.workspaceMember.findUnique({
      where: { id: memberId },
      include: { user: { select: { email: true } } },
    });

    if (!targetMember || targetMember.role === "OWNER") {
      return NextResponse.json(
        { error: "ওয়ার্কস্পেস মালিককে সরানো সম্ভব নয়" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.workspaceMember.delete({ where: { id: memberId } });

      await tx.auditLog.create({
        data: {
          action: "MEMBER_INVITED",
          workspaceId,
          actorId: session.userId,
          metadata: {
            event: "MEMBER_REMOVED",
            removedEmail: targetMember.user.email,
          },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove member error:", error);
    return NextResponse.json({ error: "সদস্য সরানো ব্যর্থ হয়েছে" }, { status: 500 });
  }
}