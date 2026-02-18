import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Helper function to shuffle an array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

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

    // Shuffle questions and limit to requested count
    const shuffledQuestions = questions.sort(() => Math.random() - 0.5).slice(0, count);

    // Shuffle options for each question to randomize answer positions
    const questionsWithShuffledOptions = shuffledQuestions.map((q) => {
      const optionsArray = Array.isArray(q.options)
        ? q.options
        : typeof q.options === "string"
          ? JSON.parse(q.options as string)
          : Array.isArray(Object.values(q.options))
            ? Object.values(q.options)
            : [];

      return {
        ...q,
        options: shuffleArray(optionsArray as string[]),
      };
    });

    return NextResponse.json({ questions: questionsWithShuffledOptions });
  } catch (err) {
    console.error("[GET /api/quiz]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
