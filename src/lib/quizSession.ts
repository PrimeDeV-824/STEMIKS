/**
 * Quiz Session Manager
 *
 * Handles in-memory quiz session state with guaranteed unique question selection.
 * Uses Fisher-Yates shuffle algorithm for random, uniform sampling without replacement.
 *
 * The session is purely in-memory and isolated per game:
 * - Each call to start() begins a fresh session
 * - Questions are never repeated within the same session
 * - Restartable via reset() or by calling start() again
 * - No mutations to the original question array
 */

import type { QuizQuestion } from "@/types";

/**
 * Random number generator type for testability
 * Returns a value in [0, 1) like Math.random()
 */
export type RNG = () => number;

/**
 * QuizSession class manages an in-memory quiz session with guaranteed unique questions.
 *
 * @example
 * const session = new QuizSession(QUESTIONS, 10);
 * session.start();
 * const q = session.getNext(); // First unique question
 * while (session.hasNext()) {
 *   setCurrent(session.getNext());
 * }
 */
export class QuizSession {
  private readonly questions: readonly QuizQuestion[];
  private readonly numQuestions: number;
  private readonly rng: RNG;
  private shuffledIndices: number[] = [];
  private cursor: number = 0;

  /**
   * Create a new QuizSession
   *
   * @param questions - The pool of questions to select from (not mutated)
   * @param numQuestions - How many unique questions to select (default: 10, capped at pool size)
   * @param rng - Optional RNG function for deterministic testing (defaults to Math.random)
   */
  constructor(
    questions: readonly QuizQuestion[],
    numQuestions: number = 10,
    rng: RNG = () => Math.random()
  ) {
    this.questions = questions;
    this.numQuestions = Math.max(0, numQuestions);
    this.rng = rng;
  }

  /**
   * Fisher-Yates Shuffle Algorithm
   * Randomly permutes an array of indices using uniform distribution.
   * Time: O(n), Space: O(n)
   *
   * @param indices - Array of indices to shuffle
   * @returns A new shuffled array of indices
   */
  private shuffleIndices(indices: number[]): number[] {
    const arr = indices.slice(); // Create shallow copy
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Initialize a new game session with shuffled questions
   * Prepares a shuffled queue of unique question indices and resets cursor.
   *
   * Handles edge cases:
   * - Empty questions array → shuffledIndices will be empty
   * - numQuestions <= 0 → shuffledIndices will be empty
   * - numQuestions > questions.length → uses all available questions
   */
  start(): void {
    const numToUse = Math.min(
      this.numQuestions,
      this.questions.length
    );

    // Create array of indices to shuffle
    const allIndices = Array.from({ length: this.questions.length }, (_, i) => i);

    // Shuffle and take first numToUse indices
    this.shuffledIndices = this.shuffleIndices(allIndices).slice(0, numToUse);
    this.cursor = 0;
  }

  /**
   * Get the next question in the session and advance cursor
   *
   * @returns The next unique Question or null if session is finished
   */
  getNext(): QuizQuestion | null {
    if (this.cursor >= this.shuffledIndices.length) {
      return null;
    }
    const idx = this.shuffledIndices[this.cursor];
    this.cursor++;
    return this.questions[idx];
  }

  /**
   * Peek at the next question without advancing the cursor
   *
   * @returns The next Question or null if session is finished
   */
  peek(): QuizQuestion | null {
    if (this.cursor >= this.shuffledIndices.length) {
      return null;
    }
    const idx = this.shuffledIndices[this.cursor];
    return this.questions[idx];
  }

  /**
   * Check if more questions remain in this session
   */
  hasNext(): boolean {
    return this.cursor < this.shuffledIndices.length;
  }

  /**
   * Get count of remaining questions in this session
   */
  remaining(): number {
    return Math.max(0, this.shuffledIndices.length - this.cursor);
  }

  /**
   * Reset the session
   * Clears the shuffled queue and cursor. Call start() to begin a fresh session.
   */
  reset(): void {
    this.shuffledIndices = [];
    this.cursor = 0;
  }
}

/**
 * React Hook Example
 *
 * @example
 * ```tsx
 * import { useState, useEffect } from 'react';
 * import { QuizSession } from '@/lib/quizSession';
 * import { QUESTIONS } from '@/data/seed';
 *
 * export function useQuizSession(numQuestions = 10) {
 *   const [session] = useState(() => new QuizSession(QUESTIONS, numQuestions));
 *   const [current, setCurrent] = useState<QuizQuestion | null>(null);
 *   const [remaining, setRemaining] = useState(0);
 *
 *   useEffect(() => {
 *     session.start();
 *     setCurrent(session.getNext());
 *     setRemaining(session.remaining());
 *   }, [session]);
 *
 *   const handleNext = () => {
 *     const next = session.getNext();
 *     setCurrent(next);
 *     setRemaining(session.remaining());
 *   };
 *
 *   const handleReset = () => {
 *     session.reset();
 *     session.start();
 *     setCurrent(session.getNext());
 *     setRemaining(session.remaining());
 *   };
 *
 *   return { current, remaining, handleNext, handleReset, hasNext: session.hasNext() };
 * }
 *
 * // Usage in component:
 * export default function QuizGame() {
 *   const { current, remaining, handleNext, hasNext } = useQuizSession(10);
 *
 *   if (!current) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       <div>Question {10 - remaining} / 10</div>
 *       <div>{current.question}</div>
 *       <button onClick={handleNext} disabled={!hasNext}>Next</button>
 *     </div>
 *   );
 * }
 * ```
 */
