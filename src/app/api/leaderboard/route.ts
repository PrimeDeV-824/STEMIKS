import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") ?? "xp";
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);

    const users = await prisma.user.findMany({
      take: limit,
      orderBy: type === "score" ? { totalScore: "desc" } : { xp: "desc" },
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        xp: true,
        level: true,
        totalScore: true,
        streak: true,
      },
    });

    const currentUserId = session.user.id;
    const leaderboard = users.map((u, i) => ({
      rank: i + 1,
      ...u,
      isCurrentUser: u.id === currentUserId,
    }));

    // Also return current user's rank if not in top list
    let currentUserRank = null;
    const inList = leaderboard.find((u) => u.isCurrentUser);
    if (!inList) {
      const allUsers = await prisma.user.findMany({
        orderBy: type === "score" ? { totalScore: "desc" } : { xp: "desc" },
        select: { id: true },
      });
      const idx = allUsers.findIndex((u) => u.id === currentUserId);
      if (idx !== -1) {
        const me = await prisma.user.findUnique({
          where: { id: currentUserId },
          select: { id: true, username: true, name: true, image: true, xp: true, level: true, totalScore: true, streak: true },
        });
        if (me) currentUserRank = { rank: idx + 1, ...me, isCurrentUser: true };
      }
    }

    return NextResponse.json({ leaderboard, currentUserRank });
  } catch (err) {
    console.error("[GET /api/leaderboard]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
