import Link from "next/link";
import { Zap, Clock, Target } from "lucide-react";

const SUBJECTS = [
  {
    id: "science",
    label: "Science",
    icon: "🔬",
    color: "from-cyan-500 to-blue-600",
    border: "border-cyan-500/30",
    topics: ["Physics", "Chemistry", "Biology", "Astronomy"],
    desc: "Explore the natural world through experiments and theory",
  },
  {
    id: "technology",
    label: "Technology",
    icon: "💻",
    color: "from-violet-500 to-purple-700",
    border: "border-violet-500/30",
    topics: ["Algorithms", "Networking", "AI/ML", "Blockchain"],
    desc: "Master computing, systems, and modern software concepts",
  },
  {
    id: "engineering",
    label: "Engineering",
    icon: "⚙️",
    color: "from-amber-500 to-orange-600",
    border: "border-amber-500/30",
    topics: ["Electrical", "Mechanical", "Signal Processing", "Materials"],
    desc: "Apply principles to design and build real-world systems",
  },
  {
    id: "mathematics",
    label: "Mathematics",
    icon: "📐",
    color: "from-emerald-500 to-green-700",
    border: "border-emerald-500/30",
    topics: ["Algebra", "Calculus", "Geometry", "Statistics"],
    desc: "The language of the universe — logic, proof, and computation",
  },
];

const MODES = [
  { id: "CLASSIC", label: "Classic", icon: <Target className="w-4 h-4" />, desc: "10 questions, no pressure" },
  { id: "TIME_ATTACK", label: "Time Attack", icon: <Clock className="w-4 h-4" />, desc: "Race against the clock" },
];

export default function QuizPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black flex items-center gap-2">
          <Zap className="w-7 h-7 text-violet-400" /> Choose Your Quiz
        </h1>
        <p className="text-slate-400 text-sm mt-1">Pick a STEM subject and start earning XP</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SUBJECTS.map((s) => (
          <Link
            key={s.id}
            href={`/quiz/${s.id}`}
            className={`glass rounded-2xl p-5 border ${s.border} hover:scale-[1.02] transition-all duration-200 group`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg`}>
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base">{s.label}</h3>
                <p className="text-xs text-slate-400 mt-0.5 mb-3 leading-relaxed">{s.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {s.topics.map((t) => (
                    <span key={t} className="px-2 py-0.5 bg-white/6 rounded-md text-xs text-slate-400">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Zap className="w-3 h-3" /> Earn XP · Unlock Achievements
              </div>
              <span className={`px-3 py-1 rounded-lg bg-gradient-to-r ${s.color} text-xs font-semibold`}>
                Play →
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="glass rounded-2xl p-5 border border-white/8">
        <h2 className="font-bold mb-3 text-sm text-slate-300">HOW SCORING WORKS</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-violet-400 text-lg">⚡</span>
            <div>
              <p className="font-semibold">XP per correct answer</p>
              <p className="text-slate-400 text-xs">15 XP base + bonuses</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-yellow-400 text-lg">🎯</span>
            <div>
              <p className="font-semibold">Accuracy bonus</p>
              <p className="text-slate-400 text-xs">+30 XP for 90%+ accuracy</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-cyan-400 text-lg">⏱️</span>
            <div>
              <p className="font-semibold">Speed bonus</p>
              <p className="text-slate-400 text-xs">+20 XP for finishing fast</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
