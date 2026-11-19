import { NextResponse } from "next/server";
import { prisma } from "@covalent/database";
import { signToken } from "@/lib/auth";

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EC4899", "#8B5CF6"];

export async function POST() {
  try {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const demoEmail = `recruiter_${randomId}@covalent.dev`;
    const demoName = `টেক লিড #${randomId}`;
    const cursorColor = COLORS[randomId % COLORS.length];

    let sharedWorkspace = await prisma.workspace.findUnique({
      where: { slug: "covalent-engineering-hq" },
    });

    if (!sharedWorkspace) {
      sharedWorkspace = await prisma.workspace.create({
        data: {
          name: "কভ্যালেন্ট ইঞ্জিনিয়ারিং হেডকোয়ার্টার",
          slug: "covalent-engineering-hq",
          documents: {
            create: [
              { title: "সিস্টেম ডিজাইন ও সিআরডিটি স্পেসিফিকেশন" },
              { title: "প্রোডাকশন ডিপ্লয়মেন্ট চেকলিস্ট" },
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

    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      cursorColor: user.cursorColor,
    });

    const response = NextResponse.json({ success: true, token });
    response.cookies.set("covalent_token", token, {
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
