"use client";
import { useEffect, useState } from "react";
import { Trophy, Zap, Flame } from "lucide-react";

interface Entry {
  rank: number;
  id: string;
  name: string;
  username?: string;
  image?: string;
  xp: number;
  level: number;
  totalScore: number;
  streak: number;
  isCurrentUser?: boolean;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const [data, setData] = useState<Entry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<"xp" | "score">("xp");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?type=${type}&limit=50`)
      .then((r) => r.json())
      .then((d) => {
        setData(d.leaderboard ?? []);
        setCurrentUserRank(d.currentUserRank ?? null);
      })
      .finally(() => setLoading(false));
  }, [type]);

  const displayValue = (entry: Entry) =>
    type === "xp" ? `${entry.xp.toLocaleString()} XP` : entry.totalScore.toLocaleString();

  return (
    <div className="max-w-2xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Trophy className="w-7 h-7 text-yellow-400" /> Leaderboard
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Global STEM champions</p>
        </div>
        <div className="flex gap-2">
          {(["xp", "score"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                type === t
                  ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white"
                  : "glass border border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              {t === "xp" ? "By XP" : "By Score"}
            </button>
          ))}
        </div>
      </div>

      {/* Podium for top 3 */}
      {!loading && data.length >= 3 && (
        <div className="glass rounded-2xl p-5 border border-white/8">
          <div className="flex items-end justify-center gap-3">
            {/* 2nd place */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="text-2xl">🥈</div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center font-bold text-sm border-2 border-slate-400/40">
                {(data[1].name ?? "?")[0].toUpperCase()}
              </div>
              <p className="text-xs font-semibold text-center truncate w-full text-center">{data[1].name}</p>
              <p className="text-xs text-slate-500">{displayValue(data[1])}</p>
              <div className="w-full h-16 bg-slate-600/30 rounded-t-lg flex items-center justify-center text-slate-400 font-bold">#2</div>
            </div>
            {/* 1st place */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="text-3xl animate-float">🥇</div>
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center font-bold border-2 border-yellow-400/60 shadow-lg">
                {(data[0].name ?? "?")[0].toUpperCase()}
              </div>
              <p className="text-xs font-semibold text-center truncate w-full text-center text-yellow-300">{data[0].name}</p>
              <p className="text-xs text-yellow-500">{displayValue(data[0])}</p>
              <div className="w-full h-24 bg-yellow-600/20 border border-yellow-500/20 rounded-t-lg flex items-center justify-center text-yellow-400 font-bold">#1</div>
            </div>
            {/* 3rd place */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="text-2xl">🥉</div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center font-bold text-sm border-2 border-amber-500/40">
                {(data[2].name ?? "?")[0].toUpperCase()}
              </div>
              <p className="text-xs font-semibold text-center truncate w-full text-center">{data[2].name}</p>
              <p className="text-xs text-slate-500">{displayValue(data[2])}</p>
              <div className="w-full h-12 bg-amber-900/20 rounded-t-lg flex items-center justify-center text-amber-600 font-bold">#3</div>
            </div>
          </div>
        </div>
      )}

      {/* Full list */}
      <div className="space-y-1.5">
        {loading ? (
          Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="glass rounded-xl p-4 border border-white/5 h-16 shimmer-loading" />
          ))
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No players yet. Be the first!</p>
          </div>
        ) : (
          data.map((entry) => (
            <div
              key={entry.id}
              className={`glass rounded-xl px-4 py-3 border transition-all ${
                entry.isCurrentUser
                  ? "border-violet-500/40 bg-violet-500/8"
                  : "border-white/5 hover:border-white/15"
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Rank */}
                <div className="w-7 text-center text-sm flex-shrink-0">
                  {entry.rank <= 3 ? (
                    MEDALS[entry.rank - 1]
                  ) : (
                    <span className="text-slate-500 font-medium">#{entry.rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {(entry.name ?? "?")[0].toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {entry.name}
                    {entry.isCurrentUser && (
                      <span className="ml-2 px-1.5 py-0.5 bg-violet-500/20 text-violet-400 text-xs rounded">you</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    Lv.{entry.level}
                    {entry.streak > 3 && ` · 🔥 ${entry.streak} streak`}
                  </p>
                </div>

                {/* Score */}
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-violet-400">{displayValue(entry)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Current user rank if not in list */}
      {!loading && currentUserRank && (
        <div className="glass rounded-xl px-4 py-3 border border-violet-500/40 bg-violet-500/8">
          <p className="text-xs text-slate-400 mb-2">Your position</p>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-medium text-sm">#{currentUserRank.rank}</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-sm font-bold">
              {(currentUserRank.name ?? "?")[0].toUpperCase()}
            </div>
            <div className="flex-1 text-sm font-semibold">{currentUserRank.name} <span className="text-violet-400 text-xs">(you)</span></div>
            <span className="text-violet-400 font-bold text-sm">{displayValue(currentUserRank)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
