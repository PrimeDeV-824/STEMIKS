import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Fisher-Yates Shuffle Algorithm
 *
 * Produces a random permutation of the input array with uniform distribution.
 * Time: O(n), Space: O(n)
 * Does not mutate the original array.
 */
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

    // **Deduplication Strategy:**
    // This endpoint guarantees NO REPEATED questions within a single game session.
    // - Fetch ALL matching questions from the database
    // - Track recently asked questions (across last 5 attempts) to avoid repetition
    // - Use Fisher-Yates shuffle for uniform random selection
    // - Use a Set to track used IDs within THIS request's selection
    // - Two-pass selection: prefer non-recent questions, then fill gaps

    // Get recently asked question IDs to minimize repetition across games
    const recentAttempts = await prisma.quizAttempt.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: { select: { questionId: true } } },
    });

    const recentQuestionIds = new Set<string>();
    for (const a of recentAttempts) {
      for (const it of a.items) recentQuestionIds.add(it.questionId);
    }

    // Fetch ALL questions for this subject/difficulty to ensure uniqueness
    const allQuestions = await prisma.question.findMany({
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
        // answer is intentionally excluded from response (security)
      },
      orderBy: { createdAt: "asc" },
    });

    if (allQuestions.length === 0) {
      return NextResponse.json(
        { error: "No questions available for this subject" },
        { status: 400 }
      );
    }

    // **Guarantee uniqueness within this game session using a Set and Fisher-Yates:**
    const usedQuestionIds = new Set<string>();
    const selectedQuestions: typeof allQuestions = [];
    const shuffledPool = shuffleArray(allQuestions);

    // **First pass:** Prefer questions that weren't asked recently
    for (const q of shuffledPool) {
      if (selectedQuestions.length >= count) break;
      if (!usedQuestionIds.has(q.id) && !recentQuestionIds.has(q.id)) {
        selectedQuestions.push(q);
        usedQuestionIds.add(q.id);
      }
    }

    // **Second pass:** If we still need questions, accept recent ones (but NEVER duplicates)
    if (selectedQuestions.length < count) {
      for (const q of shuffledPool) {
        if (selectedQuestions.length >= count) break;
        if (!usedQuestionIds.has(q.id)) {
          selectedQuestions.push(q);
          usedQuestionIds.add(q.id);
        }
      }
    }

    // Validate we have enough unique questions
    if (selectedQuestions.length < count) {
      return NextResponse.json(
        { error: `Not enough unique questions. Available: ${allQuestions.length}, Requested: ${count}` },
        { status: 400 }
      );
    }

    // Shuffle options for each question to randomize answer positions
    const questionsWithShuffledOptions = selectedQuestions.map((q) => {
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
