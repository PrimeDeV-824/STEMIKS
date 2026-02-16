import Link from "next/link";
import { ArrowRight, Zap, Trophy, Brain, Shield, BarChart3, Target } from "lucide-react";

const SUBJECTS = [
  { name: "Science", icon: "🔬", color: "from-cyan-500 to-blue-600", topics: "Physics · Chemistry · Biology" },
  { name: "Technology", icon: "💻", color: "from-violet-500 to-purple-700", topics: "CS · AI · Blockchain" },
  { name: "Engineering", icon: "⚙️", color: "from-amber-500 to-orange-600", topics: "Mechanical · Electrical · Civil" },
  { name: "Mathematics", icon: "📐", color: "from-emerald-500 to-green-700", topics: "Algebra · Calculus · Stats" },
];

const FEATURES = [
  { icon: <Zap className="w-6 h-6" />, title: "Live Quiz Games", desc: "Timed challenges with real-time scoring and instant feedback" },
  { icon: <Trophy className="w-6 h-6" />, title: "Global Rankings", desc: "Compete worldwide — weekly, monthly, and all-time leaderboards" },
  { icon: <Brain className="w-6 h-6" />, title: "AI Tutor Hints", desc: "OpenAI-powered hints that guide you without giving answers away" },
  { icon: <Shield className="w-6 h-6" />, title: "Web3 Achievements", desc: "Earn blockchain-verified NFT badges for your accomplishments" },
  { icon: <BarChart3 className="w-6 h-6" />, title: "Progress Tracking", desc: "Detailed analytics per subject — accuracy, XP, and level growth" },
  { icon: <Target className="w-6 h-6" />, title: "Adaptive Difficulty", desc: "Challenges that scale with your skill from Beginner to Expert" },
];

const STATS = [
  { value: "24", label: "Questions in Seed DB" },
  { value: "4", label: "STEM Subjects" },
  { value: "∞", label: "Growth Potential" },
  { value: "100%", label: "Open Source" },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#070d1a] text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center font-black text-sm">
              S
            </div>
            <span className="font-black text-xl gradient-text">STEMiks</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#subjects" className="hover:text-white transition-colors">Subjects</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#stats" className="hover:text-white transition-colors">Stats</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-cyan-500 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-24 px-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-60 -right-60 w-[600px] h-[600px] bg-violet-600/15 rounded-full blur-3xl" />
          <div className="absolute top-40 -left-40 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-emerald-500/8 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-violet-500/30 text-sm text-violet-300 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Now with AI-powered adaptive hints
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
            Level Up Your
            <span className="gradient-text block mt-1">STEM Skills</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            The gamified platform for Science, Technology, Engineering & Math.
            Quiz, compete, earn XP, and climb global leaderboards.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-gradient-to-r from-violet-600 to-cyan-500 rounded-2xl font-bold text-lg hover:opacity-90 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 animate-glow-pulse"
            >
              Start for Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 glass border border-white/15 rounded-2xl font-bold text-lg hover:bg-white/8 transition-all flex items-center justify-center"
            >
              Sign In
            </Link>
          </div>

          {/* Stats bar */}
          <div id="stats" className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="glass rounded-2xl p-4 border border-white/5">
                <p className="text-3xl font-black gradient-text">{s.value}</p>
                <p className="text-sm text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section id="subjects" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-3">Choose Your Domain</h2>
            <p className="text-slate-400">Master all four pillars of STEM with structured quizzes</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SUBJECTS.map((s) => (
              <Link
                key={s.name}
                href="/register"
                className="group glass rounded-2xl p-6 border border-white/5 hover:border-white/15 hover:scale-[1.03] transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  {s.icon}
                </div>
                <h3 className="font-bold text-lg mb-1">{s.name}</h3>
                <p className="text-sm text-slate-400">{s.topics}</p>
                <div className="mt-4 flex items-center gap-1 text-xs text-slate-500 group-hover:text-violet-400 transition-colors">
                  Start quizzing <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-white/[0.015]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-3">Built to Make You Better</h2>
            <p className="text-slate-400">Every feature designed for serious STEM learners</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="glass rounded-2xl p-6 border border-white/5 hover:border-violet-500/25 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600/25 to-cyan-500/25 flex items-center justify-center text-violet-400 mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-12">How STEMiks Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Pick a Subject", desc: "Choose from Science, Technology, Engineering, or Math" },
              { step: "02", title: "Answer Questions", desc: "Race against the timer — use AI hints if you're stuck" },
              { step: "03", title: "Earn & Compete", desc: "Collect XP, coins, and climb the global leaderboard" },
            ].map((step) => (
              <div key={step.step} className="relative">
                <div className="text-6xl font-black text-white/5 mb-2">{step.step}</div>
                <h3 className="font-bold text-lg mb-2 -mt-8">{step.title}</h3>
                <p className="text-sm text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-6 animate-float">🚀</div>
          <h2 className="text-4xl md:text-5xl font-black mb-4">Ready to Prove Your STEM IQ?</h2>
          <p className="text-slate-400 mb-10">Join for free. No credit card required.</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-violet-600 to-cyan-500 rounded-2xl font-black text-xl hover:opacity-90 transition-all hover:scale-[1.02]"
          >
            Start Playing Free <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-black gradient-text text-base">STEMiks</span>
            <span>© {new Date().getFullYear()} — Open Source Hackathon Project</span>
          </div>
          <div className="flex gap-6">
            <span>Next.js 14</span>
            <span>Prisma + PostgreSQL</span>
            <span>OpenAI</span>
            <span>Web3</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
