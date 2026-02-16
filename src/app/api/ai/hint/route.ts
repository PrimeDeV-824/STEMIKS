export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateHint } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const HINT_COST = 5;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (user.coins < HINT_COST) {
      return NextResponse.json(
        { error: `Not enough coins! You need ${HINT_COST} coins for a hint.` },
        { status: 402 }
      );
    }

    const { question, subject, difficulty } = await req.json();

    if (!question || !subject || !difficulty) {
      return NextResponse.json({ error: "Missing question, subject, or difficulty" }, { status: 400 });
    }

    const hint = await generateHint(question, subject, difficulty);

    await prisma.user.update({
      where: { id: userId },
      data: { coins: { decrement: HINT_COST } },
    });

    return NextResponse.json({
      hint,
      coinsSpent: HINT_COST,
      coinsRemaining: user.coins - HINT_COST,
    });
  } catch (err) {
    console.error("[POST /api/ai/hint]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
