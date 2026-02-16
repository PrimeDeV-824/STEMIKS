import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        image: true,
        xp: true,
        level: true,
        coins: true,
        streak: true,
        longestStreak: true,
        totalScore: true,
        walletAddress: true,
        createdAt: true,
        subjectProgress: true,
        achievements: {
          include: { achievement: true },
          orderBy: { earnedAt: "desc" },
        },
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ user });
  } catch (err) {
    console.error("[GET /api/user]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
