import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Star } from "lucide-react";

const RARITY_STYLES: Record<string, { border: string; bg: string; badge: string; label: string }> = {
  COMMON:    { border: "border-slate-600/40",  bg: "bg-slate-800/30",   badge: "bg-slate-600/40 text-slate-300",    label: "Common" },
  RARE:      { border: "border-blue-500/40",   bg: "bg-blue-900/20",    badge: "bg-blue-500/30 text-blue-300",      label: "Rare" },
  EPIC:      { border: "border-violet-500/50", bg: "bg-violet-900/20",  badge: "bg-violet-500/30 text-violet-300",  label: "Epic" },
  LEGENDARY: { border: "border-yellow-500/60", bg: "bg-yellow-900/15",  badge: "bg-yellow-500/30 text-yellow-300",  label: "Legendary" },
};

export default async function AchievementsPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [allAchievements, userAchievements] = await Promise.all([
    prisma.achievement.findMany({ orderBy: [{ rarity: "asc" }, { name: "asc" }] }),
    prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
    }),
  ]);

  const earnedIds = new Set(userAchievements.map((ua) => ua.achievementId));
  const earnedMap = new Map(userAchievements.map((ua) => [ua.achievementId, ua.earnedAt]));
  const earnedCount = earnedIds.size;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Star className="w-7 h-7 text-yellow-400" /> Achievements
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {earnedCount} / {allAchievements.length} unlocked
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black gradient-text">{Math.round((earnedCount / allAchievements.length) * 100)}%</p>
          <p className="text-xs text-slate-500">completion</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="glass rounded-xl p-4 border border-white/8">
        <div className="flex justify-between text-xs text-slate-400 mb-2">
          <span>Progress</span>
          <span>{earnedCount} / {allAchievements.length}</span>
        </div>
        <div className="h-2 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full transition-all"
            style={{ width: `${(earnedCount / allAchievements.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Earned */}
      {earnedCount > 0 && (
        <div>
          <h2 className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">Earned ({earnedCount})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {allAchievements
              .filter((a) => earnedIds.has(a.id))
              .map((a) => {
                const style = RARITY_STYLES[a.rarity] ?? RARITY_STYLES.COMMON;
                const earnedAt = earnedMap.get(a.id);
                return (
                  <div key={a.id} className={`rounded-2xl p-4 border ${style.border} ${style.bg}`}>
                    <div className="flex items-start gap-3">
                      <div className="text-3xl flex-shrink-0">{a.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-semibold text-sm">{a.name}</p>
                          <span className={`px-1.5 py-0.5 rounded-md text-xs ${style.badge}`}>{style.label}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{a.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-violet-400">+{a.xpReward} XP</span>
                          <span className="text-xs text-yellow-400">+{a.coinsReward} 🪙</span>
                        </div>
                        {earnedAt && (
                          <p className="text-xs text-slate-600 mt-1">
                            Earned {new Date(earnedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Locked */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">
          Locked ({allAchievements.length - earnedCount})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {allAchievements
            .filter((a) => !earnedIds.has(a.id))
            .map((a) => {
              const style = RARITY_STYLES[a.rarity] ?? RARITY_STYLES.COMMON;
              return (
                <div key={a.id} className="rounded-2xl p-4 border border-white/5 bg-white/2 opacity-60">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl flex-shrink-0 grayscale opacity-40">{a.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-sm text-slate-400">{a.name}</p>
                        <span className={`px-1.5 py-0.5 rounded-md text-xs ${style.badge} opacity-60`}>{style.label}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{a.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-slate-600">+{a.xpReward} XP</span>
                        <span className="text-xs text-slate-600">+{a.coinsReward} 🪙</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
