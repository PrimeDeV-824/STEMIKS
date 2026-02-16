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
    const subject = searchParams.get("subject");
    const difficulty = searchParams.get("difficulty");
    const count = Math.min(parseInt(searchParams.get("count") ?? "10"), 20);

    const validSubjects = ["SCIENCE", "TECHNOLOGY", "ENGINEERING", "MATHEMATICS"];
    const validDifficulties = ["EASY", "MEDIUM", "HARD", "EXPERT"];

    if (!subject || !validSubjects.includes(subject)) {
      return NextResponse.json({ error: "Invalid subject" }, { status: 400 });
    }

    const questions = await prisma.question.findMany({
      where: {
        subject: subject as any,
        ...(difficulty && validDifficulties.includes(difficulty)
          ? { difficulty: difficulty as any }
          : {}),
      },
      select: {
        id: true,
        question: true,
        options: true,
        subject: true,
        difficulty: true,
        points: true,
        timeLimit: true,
        tags: true,
        // answer is intentionally excluded from response
      },
      take: count * 2, // get more then shuffle
    });

    // Shuffle and limit
    const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, count);

    return NextResponse.json({ questions: shuffled });
  } catch (err) {
    console.error("[GET /api/quiz]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
