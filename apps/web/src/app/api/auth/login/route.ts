import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@covalent/database";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "ভুল ইমেইল অথবা পাসওয়ার্ড" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "ভুল ইমেইল অথবা পাসওয়ার্ড" }, { status: 401 });
    }

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
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "লগইন ব্যর্থ হয়েছে" }, { status: 500 });
  }
}
