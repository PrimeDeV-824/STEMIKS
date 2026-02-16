# 🚀 STEMiks — Gamified STEM Learning Platform

> A Matiks-inspired competitive learning platform for **Science, Technology, Engineering & Mathematics**.
> Built for hackathons. Production-ready. Open source.

![STEMiks](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-PostgreSQL-2D3748?logo=prisma)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3-38B2AC?logo=tailwindcss)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT4o--mini-412991?logo=openai)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎮 **4 STEM Subjects** | Science, Technology, Engineering, Mathematics |
| ⚡ **Timed Quiz Game** | Countdown timer per question with instant feedback |
| 🏆 **Global Leaderboard** | Rank by XP or Total Score |
| 🔥 **Streak System** | Daily streaks with bonus XP |
| 🤖 **AI Hints** | OpenAI GPT-4o-mini powered hints (costs coins) |
| 💰 **Coins Economy** | Earn coins, spend on hints |
| 🎯 **XP & Leveling** | Level up with a progressive XP curve |
| 🏅 **Achievements** | 8 unlockable badges with rarity tiers |
| 📊 **Progress Tracking** | Per-subject accuracy, XP, level, and best scores |
| 🔐 **Auth** | Email/password + Google + GitHub OAuth |
| 🌐 **Responsive** | Mobile, tablet, desktop — all screen sizes |

---

## 🛠️ Tech Stack

```
Frontend:   Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion
Backend:    Next.js API Routes (serverless)
Database:   PostgreSQL + Prisma ORM
Auth:       NextAuth.js v5 (JWT sessions)
AI:         OpenAI GPT-4o-mini (adaptive hints)
State:      Zustand + TanStack Query
Web3:       Wagmi v2 + viem (optional wallet connect)
```

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/stemiks.git
cd stemiks
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
```bash
cp .env.example .env
```

Edit `.env` and fill in:

```env
# Required
DATABASE_URL="postgresql://..."   # Get from Supabase or Railway
NEXTAUTH_SECRET="..."              # Run: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# Optional (for OAuth login)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Optional (for AI hints)
OPENAI_API_KEY="sk-..."
```

### 4. Set Up the Database

**Option A: Supabase (recommended for hackathon — free tier)**
1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy the connection string from Settings → Database
3. Paste into `DATABASE_URL` in `.env`

**Option B: Railway**
1. Go to [railway.app](https://railway.app) → New Project → PostgreSQL
2. Copy the connection string

Then run:
```bash
npm run db:push    # Push schema to database
npm run db:seed    # Seed 24 questions + 8 achievements
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Project Structure

```
stemiks/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed questions & achievements
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── (auth)/
│   │   │   ├── login/         # Login page
│   │   │   └── register/      # Registration page
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   ├── quiz/          # Subject picker + quiz game
│   │   │   ├── leaderboard/   # Global rankings
│   │   │   ├── achievements/  # Achievement gallery
│   │   │   └── profile/       # User profile
│   │   └── api/
│   │       ├── auth/          # NextAuth handler
│   │       ├── register/      # User registration
│   │       ├── quiz/          # Get questions + submit answers
│   │       ├── leaderboard/   # Rankings API
│   │       ├── user/          # Profile API
│   │       └── ai/hint/       # OpenAI hint API
│   ├── components/
│   │   ├── layout/Sidebar.tsx # Navigation sidebar
│   │   └── Providers.tsx      # Context providers
│   ├── lib/
│   │   ├── auth.ts            # NextAuth config
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── openai.ts          # AI hint generation
│   │   └── utils.ts           # XP/level calculations
│   ├── store/
│   │   └── userStore.ts       # Zustand client state
│   └── types/
│       └── index.ts           # TypeScript types
```

---

## 🚢 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Project → Settings → Environment Variables
```

Use **Supabase** or **Neon** for the PostgreSQL database in production.

---

## ➕ Adding More Questions

Edit `prisma/seed.ts` and add to the `questions` array:

```typescript
{
  subject: "MATHEMATICS",      // SCIENCE | TECHNOLOGY | ENGINEERING | MATHEMATICS
  difficulty: "MEDIUM",        // EASY | MEDIUM | HARD | EXPERT
  question: "Your question?",
  options: JSON.stringify(["Option A", "Option B", "Option C", "Option D"]),
  answer: "Option A",          // Must match exactly one option
  explanation: "Why A is correct...",
  points: 20,
  timeLimit: 30,               // seconds
  tags: ["algebra", "equations"],
}
```

Then re-run: `npm run db:seed`

---

## 🎮 Scoring System

| Action | Reward |
|--------|--------|
| Correct answer | 15 XP base |
| 90%+ accuracy | +30 XP bonus |
| 70-89% accuracy | +15 XP bonus |
| Finish in < 2 min | +20 XP bonus |
| Each correct answer | coins × 0.3 |
| AI Hint | -5 coins |

---

## 📝 License

MIT License — free to use, modify, and deploy.

---

## 🙏 Credits

Built with ❤️ for hackathons. Inspired by Matiks.

**Stack:** Next.js · Prisma · PostgreSQL · NextAuth · OpenAI · Tailwind CSS · TypeScript
