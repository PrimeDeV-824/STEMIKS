"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Lightbulb, X, Zap, Clock, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

interface Question {
  id: string;
  question: string;
  options: string[];
  subject: string;
  difficulty: string;
  points: number;
  timeLimit: number;
}

const SUBJECT_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  science:     { label: "Science",     icon: "🔬", color: "from-cyan-500 to-blue-600" },
  technology:  { label: "Technology",  icon: "💻", color: "from-violet-500 to-purple-700" },
  engineering: { label: "Engineering", icon: "⚙️", color: "from-amber-500 to-orange-600" },
  mathematics: { label: "Mathematics", icon: "📐", color: "from-emerald-500 to-green-700" },
};

type Phase = "loading" | "quiz" | "review" | "result";

export default function QuizGamePage() {
  const { subject } = useParams<{ subject: string }>();
  const router = useRouter();
  const cfg = SUBJECT_CONFIG[subject];

  const [questions, setQuestions] = useState<Question[]>([]);
  const [phase, setPhase] = useState<Phase>("loading");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Array<{ questionId: string; answer: string; timeTaken: number }>>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [hint, setHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const questionStartRef = useRef(Date.now());
  const totalStartRef = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load questions
  useEffect(() => {
    if (!cfg) { router.replace("/quiz"); return; }
    fetch(`/api/quiz?subject=${subject.toUpperCase()}&count=10`)
      .then((r) => r.json())
      .then((d) => {
        if (d.questions?.length) {
          setQuestions(d.questions);
          setPhase("quiz");
          totalStartRef.current = Date.now();
        } else {
          toast.error("No questions found for this subject");
          router.push("/quiz");
        }
      })
      .catch(() => { toast.error("Failed to load quiz"); router.push("/quiz"); });
  }, [subject]);

  const current = questions[currentIdx];

  // Timer logic
  useEffect(() => {
    if (phase !== "quiz" || !current || locked) return;

    setTimeLeft(current.timeLimit ?? 30);
    questionStartRef.current = Date.now();
    setHint(null);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentIdx, phase]);

  const handleTimeout = useCallback(() => {
    if (locked) return;
    setLocked(true);
    toast("⏱️ Time's up!", { icon: "⏰" });
    const timeTaken = Math.round((Date.now() - questionStartRef.current) / 1000);
    recordAnswer("", timeTaken);
  }, [locked, currentIdx]);

  const recordAnswer = useCallback((answer: string, timeTaken: number) => {
    const newAnswers = [
      ...answers,
      { questionId: questions[currentIdx].id, answer, timeTaken },
    ];
    setAnswers(newAnswers);

    setTimeout(async () => {
      if (currentIdx + 1 >= questions.length) {
        await submitQuiz(newAnswers);
      } else {
        setCurrentIdx((i) => i + 1);
        setLocked(false);
        setSelected(null);
      }
    }, 1200);
  }, [answers, currentIdx, questions]);

  const handleAnswer = useCallback((answer: string) => {
    if (locked || phase !== "quiz") return;
    if (timerRef.current) clearInterval(timerRef.current);
    setLocked(true);
    setSelected(answer);
    const timeTaken = Math.round((Date.now() - questionStartRef.current) / 1000);
    recordAnswer(answer, timeTaken);
  }, [locked, phase, recordAnswer]);

  const submitQuiz = async (finalAnswers: typeof answers) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.toUpperCase(),
          mode: "CLASSIC",
          answers: finalAnswers,
          totalTime: Math.round((Date.now() - totalStartRef.current) / 1000),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      setPhase("result");
      if (data.levelUp) {
        toast.success(`🎉 Level Up! You're now Level ${data.levelUp.to}!`, { duration: 4000 });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Failed to submit quiz");
      router.push("/quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const getHint = async () => {
    if (!current || hintLoading || hint) return;
    setHintLoading(true);
    try {
      const res = await fetch("/api/ai/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: current.question, subject: current.subject, difficulty: current.difficulty }),
      });
      const data = await res.json();
      if (data.error) toast.error(data.error);
      else { setHint(data.hint); toast.success(`Hint unlocked! (-5 coins)`); }
    } finally {
      setHintLoading(false);
    }
  };

  // ── Loading ──
  if (phase === "loading" || !cfg) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-float">{cfg?.icon ?? "🧠"}</div>
          <p className="text-slate-400">Loading quiz...</p>
        </div>
      </div>
    );
  }

  // ── Result ──
  if (phase === "result" && result) {
    const accuracy = Math.round(result.accuracy);
    const perfect = result.score === result.total && result.total > 0;
    const great = accuracy >= 70;

    return (
      <div className="max-w-lg mx-auto animate-slide-up">
        <div className="text-center mb-6">
          <div className="text-7xl mb-3 animate-bounce-in">{perfect ? "🏆" : great ? "🎯" : "📚"}</div>
          <h1 className="text-3xl font-black">
            {perfect ? "Perfect!" : great ? "Well Done!" : "Keep Going!"}
          </h1>
          <p className="text-slate-400 mt-1">{cfg.label} Quiz Complete</p>
        </div>

        <div className="glass rounded-2xl p-6 border border-white/8 space-y-4 mb-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 text-center">
              <p className="text-3xl font-black text-violet-400">+{result.xpEarned}</p>
              <p className="text-xs text-slate-400 mt-1">XP Earned</p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
              <p className="text-3xl font-black text-yellow-400">+{result.coinsEarned}</p>
              <p className="text-xs text-slate-400 mt-1">Coins Earned</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold">{accuracy}%</p>
              <p className="text-xs text-slate-400">Accuracy</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">
                {result.gradedAnswers?.filter((a: any) => a.isCorrect).length ?? 0}
              </p>
              <p className="text-xs text-slate-400">Correct</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{result.timeTaken}s</p>
              <p className="text-xs text-slate-400">Time</p>
            </div>
          </div>
        </div>

        {result.levelUp && (
          <div className="glass rounded-xl p-4 border border-yellow-500/30 bg-yellow-500/8 text-center mb-4">
            <p className="font-bold text-yellow-400">🎊 Level Up! {result.levelUp.from} → {result.levelUp.to}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => { setPhase("quiz"); setCurrentIdx(0); setAnswers([]); setLocked(false); setSelected(null); setResult(null); }}
            className="flex-1 py-3 glass border border-white/10 rounded-xl font-semibold hover:bg-white/6 transition-all"
          >
            Play Again
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className={`flex-1 py-3 bg-gradient-to-r ${cfg.color} rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2`}
          >
            Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── Quiz ──
  if (!current) return null;

  const timeLimit = current.timeLimit ?? 30;
  const timerPct = (timeLeft / timeLimit) * 100;
  const timerColor = timerPct > 60 ? "bg-emerald-500" : timerPct > 30 ? "bg-yellow-500" : "bg-red-500";
  const progressPct = (currentIdx / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cfg.color} flex items-center justify-center text-lg`}>
            {cfg.icon}
          </div>
          <div>
            <p className="font-semibold text-sm">{cfg.label}</p>
            <p className="text-xs text-slate-500">{currentIdx + 1} / {questions.length}</p>
          </div>
        </div>
        <button onClick={() => router.push("/quiz")} className="p-2 rounded-lg hover:bg-white/6 transition-colors text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quiz progress */}
      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${cfg.color} rounded-full transition-all duration-500`} style={{ width: `${progressPct}%` }} />
      </div>

      {/* Timer */}
      <div className="flex items-center gap-3">
        <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" />
        <div className="flex-1 h-2 bg-white/8 rounded-full overflow-hidden">
          <div className={`h-full ${timerColor} rounded-full transition-all`} style={{ width: `${timerPct}%` }} />
        </div>
        <span className={`text-sm font-bold w-7 text-right ${timeLeft <= 8 ? "text-red-400" : "text-slate-300"}`}>
          {timeLeft}
        </span>
      </div>

      {/* Question card */}
      <div className="glass rounded-2xl p-6 border border-white/8">
        <div className="flex items-start justify-between gap-3 mb-5">
          <h2 className="text-base md:text-lg font-semibold leading-relaxed">{current.question}</h2>
          <div className="flex items-center gap-1 px-2 py-1 bg-violet-500/15 rounded-lg text-xs text-violet-400 font-medium flex-shrink-0">
            <Zap className="w-3 h-3" /> {current.points}
          </div>
        </div>

        <div className="space-y-2.5">
          {(() => {
            const raw = current?.options as unknown;
            if (!raw) return [] as string[];
            if (Array.isArray(raw)) return raw as string[];
            if (typeof raw === "string") {
              try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed.map(String);
              } catch (e) {
                // fallthrough to treat as single string
              }
              return [raw];
            }
            if (typeof raw === "object") return Object.values(raw as Record<string, unknown>).map(String);
            return [String(raw)];
          })().map((opt, idx) => {
            
            const isSelected = selected === opt;
            const letters = ["A", "B", "C", "D"];
            return (
              <button
                key={`${String(opt)}-${idx}`}
                onClick={() => handleAnswer(String(opt))}
                disabled={locked}
                className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all flex items-center gap-3 ${
                  locked ? "cursor-default" : "hover:border-violet-500/50 hover:bg-violet-500/5 active:scale-[0.99]"
                } ${
                  isSelected
                    ? "border-violet-500 bg-violet-500/15 text-white"
                    : "border-white/8 text-slate-300"
                }`}
              >
                <span className={`w-6 h-6 rounded-md text-xs font-bold flex-shrink-0 flex items-center justify-center ${
                  isSelected ? "bg-violet-500 text-white" : "bg-white/8 text-slate-400"
                }`}>
                  {letters[idx]}
                </span>
                <span className="text-sm">{String(opt)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Hint */}
      <div className="flex items-center gap-3">
        <button
          onClick={getHint}
          disabled={hintLoading || !!hint || locked}
          className="flex items-center gap-2 px-3.5 py-2 glass border border-yellow-500/25 rounded-xl text-xs text-yellow-400 hover:bg-yellow-500/8 transition-all disabled:opacity-40"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          {hintLoading ? "Loading..." : hint ? "Hint used" : "AI Hint (-5 🪙)"}
        </button>

        {hint && (
          <div className="flex-1 px-3.5 py-2 bg-yellow-500/8 border border-yellow-500/20 rounded-xl text-xs text-yellow-200 leading-relaxed">
            💡 {hint}
          </div>
        )}
      </div>

      {submitting && (
        <div className="text-center text-slate-400 text-sm flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-violet-500/40 border-t-violet-500 rounded-full animate-spin" />
          Calculating results...
        </div>
      )}
    </div>
  );
}
