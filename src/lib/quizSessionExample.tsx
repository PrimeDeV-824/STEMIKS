/**
 * React Hook and Component Example for QuizSession
 *
 * This file demonstrates how to integrate QuizSession into your React components.
 * Copy and adapt these patterns for your actual quiz UI.
 */

import { useState, useEffect } from "react";
import { QuizSession } from "@/lib/quizSession";
import type { QuizQuestion } from "@/types";

/**
 * Custom React Hook for managing quiz sessions
 *
 * @example
 * const { current, remaining, totalQuestions, handleNext, handleReset, hasNext } = useQuizSession(QUESTIONS, 10);
 */
export function useQuizSession(
  questions: readonly QuizQuestion[],
  numQuestions: number = 10
) {
  const [session] = useState(
    () => new QuizSession(questions, numQuestions)
  );
  const [current, setCurrent] = useState<QuizQuestion | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    session.start();
    setTotalQuestions(session.remaining());
    setCurrent(session.getNext());
    setRemaining(session.remaining());
  }, [session]);

  const handleNext = () => {
    const next = session.getNext();
    setCurrent(next);
    setRemaining(session.remaining());
  };

  const handleReset = () => {
    session.reset();
    session.start();
    setTotalQuestions(session.remaining());
    setCurrent(session.getNext());
    setRemaining(session.remaining());
  };

  return {
    current,
    remaining,
    totalQuestions,
    handleNext,
    handleReset,
    hasNext: session.hasNext(),
  };
}

/**
 * Example Quiz Component using QuizSession
 *
 * @example
 * import { QUESTIONS } from "@/data/seed";
 * export default function QuizGame() {
 *   return <QuizGameComponent questions={QUESTIONS} quizSize={10} />;
 * }
 */
export function QuizGameComponent({
  questions,
  quizSize = 10,
}: {
  questions: readonly QuizQuestion[];
  quizSize?: number;
}) {
  const { current, remaining, totalQuestions, handleNext, handleReset, hasNext } =
    useQuizSession(questions, quizSize);

  if (!current) {
    return <div className="p-4">Loading question...</div>;
  }

  const questionNumber = totalQuestions - remaining;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-4 text-sm text-gray-600">
        Question {questionNumber} of {totalQuestions}
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">{current.question}</h2>

        <div className="space-y-2">
          {current.options.map((option, idx) => (
            <button
              key={idx}
              className="w-full p-3 text-left border rounded-lg hover:bg-blue-50 transition"
            >
              {String.fromCharCode(65 + idx)}: {option}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleNext}
          disabled={!hasNext}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {hasNext ? "Next Question" : "Quiz Complete"}
        </button>

        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-600 text-white rounded"
        >
          Restart Quiz
        </button>
      </div>
    </div>
  );
}

/**
 * Minimal imperative usage example
 *
 * If you prefer direct control without a hook:
 *
 * @example
 * import { QuizSession } from "@/lib/quizSession";
 * import { QUESTIONS } from "@/data/seed";
 *
 * const session = new QuizSession(QUESTIONS, 10);
 * session.start();
 *
 * // Get first question
 * let current = session.getNext();
 *
 * // Check state
 * console.log(session.remaining()); // 9
 * console.log(session.hasNext()); // true
 *
 * // Peek without consuming
 * const upcoming = session.peek();
 *
 * // Get next
 * current = session.getNext();
 *
 * // Reset for new session
 * session.reset();
 * session.start();
 */
