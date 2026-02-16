import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getXPProgress } from "@/lib/utils";
import { Zap, Trophy, Flame, Coins, ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";

const SUBJECT_CONFIG = {
  SCIENCE:     { icon: "🔬", color: "from-cyan-500 to-blue-600", border: "border-cyan-500/20", bg: "bg-cyan-500/8" },
  TECHNOLOGY:  { icon: "💻", color: "from-violet-500 to-purple-700", border: "border-violet-500/20", bg: "bg-violet-500/8" },
  ENGINEERING: { icon: "⚙️", color: "from-amber-500 to-orange-600", border: "border-amber-500/20", bg: "bg-amber-500/8" },
  MATHEMATICS: { icon: "📐", color: "from-emerald-500 to-green-700", border: "border-emerald-500/20", bg: "bg-emerald-500/8" },
} as const;

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [user, subjectProgress, recentAttempts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, xp: true, level: true, coins: true, streak: true, totalScore: true },
    }),
    prisma.subjectProgress.findMany({ where: { userId } }),
    prisma.quizAttempt.findMany({
      where: { userId, completed: true },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { subject: true, score: true, accuracy: true, xpEarned: true, createdAt: true },
    }),
  ]);

  if (!user) return null;

  const { level, current, needed, percentage } = getXPProgress(user.xp);

  const stats = [
    { label: "Total XP", value: user.xp.toLocaleString(), icon: <Zap className="w-5 h-5 text-violet-400" />, color: "text-violet-400" },
    { label: "Total Score", value: user.totalScore.toLocaleString(), icon: <Trophy className="w-5 h-5 text-yellow-400" />, color: "text-yellow-400" },
    { label: "Day Streak", value: `${user.streak}🔥`, icon: <Flame className="w-5 h-5 text-orange-400" />, color: "text-orange-400" },
    { label: "Coins", value: user.coins.toLocaleString(), icon: <Coins className="w-5 h-5 text-cyan-400" />, color: "text-cyan-400" },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">
            Hey, <span className="gradient-text">{user.name?.split(" ")[0] ?? "Student"}</span>! 👋
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Ready to level up your STEM skills today?</p>
        </div>
        <Link
          href="/quiz"
          className="self-start sm:self-center flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 rounded-xl font-semibold text-sm hover:opacity-90 transition-all hover:scale-[1.02]"
        >
          <Zap className="w-4 h-4" /> Play Now
        </Link>
      </div>

      {/* Level Card */}
      <div className="glass rounded-2xl p-5 border border-white/8 bg-gradient-to-r from-violet-900/20 to-cyan-900/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-2xl font-black shadow-lg">
              {level}
            </div>
            <div>
              <p className="font-bold text-lg">Level {level}</p>
              <p className="text-sm text-slate-400">{current.toLocaleString()} / {needed.toLocaleString()} XP</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-500 mb-0.5">Next level in</p>
            <p className="font-bold text-violet-400">{(needed - current).toLocaleString()} XP</p>
          </div>
        </div>
        <div className="h-2.5 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full transition-all duration-700"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-1.5">{Math.round(percentage)}% to level {level + 1}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-1.5">{s.icon}<span className="text-xs text-slate-400">{s.label}</span></div>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Subjects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-violet-400" /> STEM Subjects
          </h2>
          <Link href="/quiz" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
            Play all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(Object.keys(SUBJECT_CONFIG) as Array<keyof typeof SUBJECT_CONFIG>).map((subject) => {
            const cfg = SUBJECT_CONFIG[subject];
            const progress = subjectProgress.find((p) => p.subject === subject);
            const accuracy = Math.round(progress?.accuracy ?? 0);
            const quizCount = progress?.quizCount ?? 0;

            return (
              <Link
                key={subject}
                href={`/quiz/${subject.toLowerCase()}`}
                className={`rounded-2xl p-4 border ${cfg.border} ${cfg.bg} hover:scale-[1.03] transition-all duration-200 group`}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.color} flex items-center justify-center text-lg mb-3 group-hover:scale-110 transition-transform`}>
                  {cfg.icon}
                </div>
                <p className="font-semibold text-sm capitalize">{subject.toLowerCase()}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {quizCount} {quizCount === 1 ? "quiz" : "quizzes"}
                </p>
                <div className="mt-2.5 h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${cfg.color} rounded-full`} style={{ width: `${accuracy}%` }} />
                </div>
                <p className="text-xs text-slate-500 mt-1">{accuracy}% accuracy</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      {recentAttempts.length > 0 && (
        <div>
          <h2 className="text-base font-bold mb-3">Recent Activity</h2>
          <div className="space-y-2">
            {recentAttempts.map((a, i) => {
              const cfg = SUBJECT_CONFIG[a.subject as keyof typeof SUBJECT_CONFIG];
              return (
                <div key={i} className="glass rounded-xl p-3.5 border border-white/5 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cfg.color} flex items-center justify-center text-base flex-shrink-0`}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm capitalize">{a.subject.toLowerCase()} Quiz</p>
                    <p className="text-xs text-slate-500">{new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">+{a.xpEarned} XP</p>
                    <p className="text-xs text-slate-500">{Math.round(a.accuracy)}% accurate</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {recentAttempts.length === 0 && (
        <div className="glass rounded-2xl p-8 border border-white/5 text-center">
          <div className="text-5xl mb-3 animate-float">🎯</div>
          <h3 className="font-bold text-lg mb-2">No quizzes yet!</h3>
          <p className="text-slate-400 text-sm mb-4">Play your first quiz to start earning XP and climbing the leaderboard.</p>
          <Link href="/quiz" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 rounded-xl font-semibold text-sm">
            <Zap className="w-4 h-4" /> Start Playing
          </Link>
        </div>
      )}
    </div>
  );
}
