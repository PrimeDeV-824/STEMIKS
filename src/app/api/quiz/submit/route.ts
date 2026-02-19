import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getLevelFromXP } from "@/lib/utils";

const submitSchema = z.object({
  subject: z.enum(["SCIENCE", "TECHNOLOGY", "ENGINEERING", "MATHEMATICS"]),
  mode: z.enum(["CLASSIC", "TIME_ATTACK", "SURVIVAL"]).default("CLASSIC"),
  answers: z.array(
    z.object({
      questionId: z.string(),
      answer: z.string(),
      timeTaken: z.number().min(0),
    })
  ).min(1),
  totalTime: z.number().min(0),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = submitSchema.parse(await req.json());
    const userId = session.user.id;

    const questionIds = body.answers.map((a) => a.questionId);
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
    });

    const questionMap = new Map(questions.map((q) => [q.id, q]));

    // Grade answers
    let earnedPoints = 0;
    let totalPoints = 0;
    const gradedAnswers = body.answers.map((a) => {
      const q = questionMap.get(a.questionId);
      if (!q) return { ...a, isCorrect: false };
      const isCorrect = q.answer === a.answer;
      if (isCorrect) earnedPoints += q.points;
      totalPoints += q.points;
      return { ...a, isCorrect, explanation: q.explanation, correctAnswer: q.answer };
    });

    const accuracy = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

    // XP formula: base from correct answers + accuracy bonus + speed bonus
    const correctCount = gradedAnswers.filter((a) => a.isCorrect).length;
    const baseXP = correctCount * 15;
    const accuracyBonus = accuracy >= 90 ? 30 : accuracy >= 70 ? 15 : 0;
    const speedBonus = body.totalTime < 120 ? 20 : body.totalTime < 180 ? 10 : 0;
    const xpEarned = baseXP + accuracyBonus + speedBonus;
    const coinsEarned = Math.round(xpEarned * 0.3);

    // Create attempt record
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        subject: body.subject,
        mode: body.mode,
        score: earnedPoints,
        xpEarned,
        coinsEarned,
        timeTaken: body.totalTime,
        accuracy,
        completed: true,
        items: {
          create: gradedAnswers.map((a) => ({
            questionId: a.questionId,
            userAnswer: a.answer,
            isCorrect: a.isCorrect,
            timeTaken: a.timeTaken,
          })),
        },
      },
    });

    // Update user
    const prevUser = await prisma.user.findUnique({ where: { id: userId }, select: { xp: true } });
    const prevXP = prevUser?.xp ?? 0;
    const prevLevel = getLevelFromXP(prevXP);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: xpEarned },
        coins: { increment: coinsEarned },
        totalScore: { increment: earnedPoints },
        lastActiveAt: new Date(),
      },
    });

    const newLevel = getLevelFromXP(updatedUser.xp);

    if (newLevel > prevLevel) {
      await prisma.user.update({ where: { id: userId }, data: { level: newLevel } });
    }

    // Upsert subject progress
    const existing = await prisma.subjectProgress.findUnique({
      where: { userId_subject: { userId, subject: body.subject } },
    });

    await prisma.subjectProgress.upsert({
      where: { userId_subject: { userId, subject: body.subject } },
      create: {
        userId,
        subject: body.subject,
        xp: xpEarned,
        level: 1,
        quizCount: 1,
        avgScore: accuracy,
        bestScore: earnedPoints,
        accuracy,
      },
      update: {
        xp: { increment: xpEarned },
        quizCount: { increment: 1 },
        bestScore: earnedPoints > (existing?.bestScore ?? 0) ? earnedPoints : undefined,
        avgScore: existing
          ? (existing.avgScore * existing.quizCount + accuracy) / (existing.quizCount + 1)
          : accuracy,
        accuracy:
          existing
            ? (existing.accuracy * existing.quizCount + accuracy) / (existing.quizCount + 1)
            : accuracy,
      },
    });

    return NextResponse.json({
      attemptId: attempt.id,
      score: earnedPoints,
      total: totalPoints,
      accuracy,
      xpEarned,
      coinsEarned,
      timeTaken: body.totalTime,
      levelUp: newLevel > prevLevel ? { from: prevLevel, to: newLevel } : null,
      gradedAnswers,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message }, { status: 400 });
    }
    console.error("[POST /api/quiz/submit]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
