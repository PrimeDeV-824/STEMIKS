import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getXPProgress } from "@/lib/utils";
import { User, Coins, Zap, Trophy, Calendar, Flame } from "lucide-react";

const SUBJECT_CONFIG = {
  SCIENCE:     { icon: "🔬", color: "from-cyan-500 to-blue-600" },
  TECHNOLOGY:  { icon: "💻", color: "from-violet-500 to-purple-700" },
  ENGINEERING: { icon: "⚙️", color: "from-amber-500 to-orange-600" },
  MATHEMATICS: { icon: "📐", color: "from-emerald-500 to-green-700" },
} as const;

export default async function ProfilePage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      username: true,
      image: true,
      xp: true,
      level: true,
      coins: true,
      streak: true,
      longestStreak: true,
      totalScore: true,
      createdAt: true,
      subjectProgress: true,
      achievements: {
        include: { achievement: true },
        orderBy: { earnedAt: "desc" },
        take: 6,
      },
    },
  });

  if (!user) return null;

  const { level, current, needed, percentage } = getXPProgress(user.xp);
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="space-y-5 max-w-3xl">
      <h1 className="text-2xl font-black flex items-center gap-2">
        <User className="w-7 h-7 text-violet-400" /> Profile
      </h1>

      {/* Profile Card */}
      <div className="glass rounded-2xl p-6 border border-white/8 bg-gradient-to-r from-violet-900/15 to-cyan-900/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-3xl font-black flex-shrink-0 shadow-lg">
            {(user.name ?? user.email ?? "U")[0].toUpperCase()}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-xl font-black">{user.name}</h2>
            {user.username && <p className="text-slate-400 text-sm">@{user.username}</p>}
            <p className="text-slate-500 text-xs mt-0.5">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-1 bg-violet-500/20 border border-violet-500/30 rounded-lg text-xs text-violet-300 font-semibold">
                Level {level}
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 bg-yellow-500/15 border border-yellow-500/20 rounded-lg text-xs text-yellow-300">
                <Coins className="w-3 h-3" /> {user.coins.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {memberSince}
              </span>
            </div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mt-5">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>Level {level} Progress</span>
            <span>{current.toLocaleString()} / {needed.toLocaleString()} XP</span>
          </div>
          <div className="h-2.5 bg-white/8 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: <Zap className="w-4 h-4 text-violet-400" />, label: "Total XP", value: user.xp.toLocaleString(), color: "text-violet-400" },
          { icon: <Trophy className="w-4 h-4 text-yellow-400" />, label: "Total Score", value: user.totalScore.toLocaleString(), color: "text-yellow-400" },
          { icon: <Flame className="w-4 h-4 text-orange-400" />, label: "Current Streak", value: `${user.streak} days`, color: "text-orange-400" },
          { icon: <Flame className="w-4 h-4 text-red-400" />, label: "Best Streak", value: `${user.longestStreak} days`, color: "text-red-400" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl p-4 border border-white/5 text-center">
            <div className="flex justify-center mb-1">{s.icon}</div>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Subject Progress */}
      {user.subjectProgress.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Subject Progress</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {user.subjectProgress.map((sp) => {
              const cfg = SUBJECT_CONFIG[sp.subject as keyof typeof SUBJECT_CONFIG];
              if (!cfg) return null;
              return (
                <div key={sp.subject} className="glass rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cfg.color} flex items-center justify-center text-base`}>
                      {cfg.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-sm capitalize">{sp.subject.toLowerCase()}</p>
                      <p className="text-xs text-slate-500">Level {sp.level} · {sp.quizCount} quizzes</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <p className="font-bold text-emerald-400">{Math.round(sp.accuracy)}%</p>
                      <p className="text-slate-500">Accuracy</p>
                    </div>
                    <div>
                      <p className="font-bold text-violet-400">{sp.xp.toLocaleString()}</p>
                      <p className="text-slate-500">XP</p>
                    </div>
                    <div>
                      <p className="font-bold text-yellow-400">{sp.bestScore}</p>
                      <p className="text-slate-500">Best Score</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Achievements */}
      {user.achievements.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Recent Achievements</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {user.achievements.map(({ achievement, earnedAt }) => (
              <div key={achievement.id} className="glass rounded-xl p-3.5 border border-violet-500/20 bg-violet-500/5">
                <div className="text-2xl mb-1.5">{achievement.icon}</div>
                <p className="font-semibold text-xs">{achievement.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{new Date(earnedAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
