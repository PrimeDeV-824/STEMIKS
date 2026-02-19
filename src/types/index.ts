export type Subject = "SCIENCE" | "TECHNOLOGY" | "ENGINEERING" | "MATHEMATICS";
export type Difficulty = "EASY" | "MEDIUM" | "HARD" | "EXPERT";
export type QuizMode = "CLASSIC" | "TIME_ATTACK" | "SURVIVAL";
export type Rarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

export interface QuizQuestion {
  id: string;
  subject: Subject;
  difficulty: Difficulty;
  question: string;
  options: string[];
  points: number;
  timeLimit: number;
  tags: string[];
}

export interface QuizAnswer {
  questionId: string;
  answer: string;
  timeTaken: number;
}

export interface QuizResult {
  attemptId: string;
  score: number;
  total: number;
  accuracy: number;
  xpEarned: number;
  coinsEarned: number;
  timeTaken: number;
  levelUp: { from: number; to: number } | null;
  gradedAnswers: Array<{
    questionId: string;
    answer: string;
    isCorrect: boolean;
    timeTaken: number;
    explanation?: string;
    correctAnswer?: string;
  }>;
}

export interface LeaderboardUser {
  rank: number;
  id: string;
  username: string;
  name: string;
  image?: string;
  xp: number;
  level: number;
  totalScore: number;
  streak: number;
  isCurrentUser?: boolean;
}

export interface SubjectProgress {
  subject: Subject;
  xp: number;
  level: number;
  quizCount: number;
  avgScore: number;
  bestScore: number;
  accuracy: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: Rarity;
  xpReward: number;
  coinsReward: number;
  earnedAt?: Date | string;
}
